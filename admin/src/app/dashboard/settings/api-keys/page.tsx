"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Checkbox, Input, Modal, Radio, App as AntApp } from "antd";
import { api, ApiError } from "@/lib/api";
import { useConfirm } from "@/components/ConfirmDialog";
import { useAuth } from "@/lib/auth-context";
import type { APIKeyDTO, APIKeyMode, APIScope } from "@/lib/types";

dayjs.extend(relativeTime);

const MUTED_CLASS = "text-sm text-text-muted dark:text-text-muted-dark";
const PRIMARY_BUTTON_CLASS =
  "btn cursor-pointer rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60";
const SECONDARY_BUTTON_CLASS =
  "btn cursor-pointer rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-text dark:border-border-dark dark:text-text-dark disabled:cursor-not-allowed disabled:opacity-60";

// directOnly: only a Direct key can have it (see domain.ReviewAPIScopes).
const SCOPES: { value: APIScope; label: string; help: string; directOnly?: boolean }[] = [
  { value: "pages", label: "Pages", help: "Pages, their sections, SEO and global sections." },
  { value: "news", label: "News", help: "News articles." },
  { value: "media", label: "Media", help: "The Media Library: read and upload images." },
  { value: "casinos", label: "Casinos", help: "Casinos, game providers and licenses.", directOnly: true },
  { value: "bonuses", label: "Bonuses", help: "Casino bonuses.", directOnly: true },
  { value: "payment_methods", label: "Payment Methods", help: "Payment methods per country.", directOnly: true },
  { value: "rtp", label: "RTP Entries", help: "Game RTP entries.", directOnly: true },
  { value: "guides", label: "Guides", help: "Guides.", directOnly: true },
  { value: "blacklist", label: "Blacklist", help: "Blacklisted casinos.", directOnly: true },
  { value: "regions", label: "Regions", help: "Countries: edit and switch on or off.", directOnly: true },
  { value: "navigation", label: "Navigation", help: "Header and footer menus, the sidebar, and Redirects.", directOnly: true },
  { value: "snippets", label: "Snippets", help: "Code added to the site's head, body or footer.", directOnly: true },
  { value: "settings", label: "Site Settings", help: "Site title, logo, footer text and contact details.", directOnly: true },
];

const MODES: { value: APIKeyMode; label: string; help: string }[] = [
  {
    value: "review",
    label: "Needs approval",
    help: "Page and news changes wait in AI Changes until someone approves them. Can't publish, unpublish or delete.",
  },
  {
    value: "direct",
    label: "Direct",
    help: "Changes go live straight away, including publishing, unpublishing and deleting. Deleted items go to the Recycle Bin for 30 days.",
  },
];

// Settings > API Keys: keys that let an outside tool (e.g. an AI assistant)
// use the Content API (/api/v1). A "Needs approval" key's page and news
// changes wait in AI Changes; a Direct key's go live at once. Data:
// /api/admin/api-keys.
export default function APIKeysSettingsPage() {
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const [keys, setKeys] = useState<APIKeyDTO[] | null>(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  // The key the form is changing; null while creating a new one.
  const [editing, setEditing] = useState<APIKeyDTO | null>(null);
  const [name, setName] = useState("");
  const [mode, setMode] = useState<APIKeyMode>("review");
  const [scopes, setScopes] = useState<APIScope[]>(["pages", "news", "media"]);
  const availableScopes = SCOPES.filter((scope) => mode === "direct" || !scope.directOnly);
  const [saving, setSaving] = useState(false);
  const [newKey, setNewKey] = useState<{ name: string; secretKey: string } | null>(null);
  const { user } = useAuth();
  // The key being deleted, waiting for the admin's 2FA code.
  const [deleting, setDeleting] = useState<APIKeyDTO | null>(null);
  const [otp, setOtp] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  function load() {
    return api.get<{ apiKeys: APIKeyDTO[] }>("/api/admin/api-keys").then(
      (data) => setKeys(data.apiKeys ?? []),
      (err) => setError(err instanceof ApiError ? err.message : "Could not load API keys."),
    );
  }

  useEffect(() => {
    load();
  }, []);

  // Opens the form: blank for a new key, filled in from `from` to change
  // that key (edit) or to make a new key with the same settings (a
  // replacement for a revoked or lost one).
  function openForm(from: APIKeyDTO | null, edit: boolean) {
    setEditing(edit ? from : null);
    setName(from ? from.name : "");
    setMode(from ? from.mode : "review");
    setScopes(from ? from.scopes : ["pages", "news", "media"]);
    setCreating(true);
  }

  async function handleSave() {
    setSaving(true);
    const body = { name, mode, scopes: scopes.filter((s) => availableScopes.some((a) => a.value === s)) };
    try {
      if (editing) {
        await api.put(`/api/admin/api-keys/${editing.id}`, body);
        message.success("Key updated. The tool using it keeps the same key; the new permissions apply from its next request.");
      } else {
        setNewKey(await api.post<{ name: string; secretKey: string }>("/api/admin/api-keys", body));
      }
      setCreating(false);
      setEditing(null);
      setName("");
      await load();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not save the key.");
    } finally {
      setSaving(false);
    }
  }

  // Deleting needs a code from the admin's authenticator app; the API checks
  // who may delete (CanDeleteAPIKey) and the code.
  function canDelete(key: APIKeyDTO) {
    return !!user && (user.role === "super_admin" || key.createdById === user.id);
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    setDeleteError("");
    try {
      await api.post(`/api/admin/api-keys/${deleting.id}/delete`, { otp: otp.trim() });
      message.success("Key deleted.");
      setDeleting(null);
      setOtp("");
      await load();
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Could not delete the key.");
    } finally {
      setDeleteBusy(false);
    }
  }

  function deleteButton(key: APIKeyDTO) {
    if (!canDelete(key)) return null;
    return (
      <button
        type="button"
        id={`api-key-${key.id}-delete`}
        onClick={() => {
          setOtp("");
          setDeleteError("");
          setDeleting(key);
        }}
        className={`${SECONDARY_BUTTON_CLASS} text-danger!`}
      >
        Delete
      </button>
    );
  }

  async function handleRevoke(key: APIKeyDTO) {
    const ok = await confirm({
      title: "Revoke API Key",
      message: `Revoke "${key.name}"? Any tool using it stops working at once. Changes it already proposed stay in AI Changes. This can't be undone.`,
      confirmLabel: "Revoke",
      danger: true,
    });
    if (!ok) return;
    try {
      await api.post(`/api/admin/api-keys/${key.id}/revoke`, {});
      message.success("Key revoked.");
      await load();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not revoke the key.");
    }
  }

  async function copyKey() {
    if (!newKey) return;
    try {
      await navigator.clipboard.writeText(newKey.secretKey);
      message.success("Key copied.");
    } catch {
      message.error("Could not copy — select the key and copy it by hand.");
    }
  }

  return (
    <section id="settings-api-keys" className="settings-page flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex max-w-2xl flex-col gap-1">
          <h2 className="text-lg font-bold text-text dark:text-text-dark">API Keys</h2>
          <p className={MUTED_CLASS}>
            A key lets a tool such as an AI assistant manage the site&apos;s content through the Content API. A{" "}
            <strong>Needs approval</strong> key&apos;s page and article changes wait in <strong>AI Changes</strong> until someone approves
            them. A <strong>Direct</strong> key&apos;s changes go live straight away, and what it deletes goes to the{" "}
            <strong>Recycle Bin</strong>. A key stops working if it is revoked or deleted, or if the admin who created it is disabled. Only a Super
            Admin or the admin who created a key can delete it, with a code from their authenticator app.
          </p>
        </div>
        <button type="button" id="api-keys-create" onClick={() => openForm(null, false)} className={PRIMARY_BUTTON_CLASS}>
          + Create Key
        </button>
      </div>

      {error && <p className="form-error text-sm text-danger">{error}</p>}

      {!keys ? (
        <p className={MUTED_CLASS}>Loading…</p>
      ) : keys.length === 0 ? (
        <p className={MUTED_CLASS}>No API keys yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border dark:border-border-dark">
          <table id="api-keys-table" className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-xs text-text-muted uppercase dark:bg-surface-muted-dark dark:text-text-muted-dark">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Name</th>
                <th className="px-4 py-2.5 font-semibold">Key</th>
                <th className="px-4 py-2.5 font-semibold">Mode</th>
                <th className="px-4 py-2.5 font-semibold">Can use</th>
                <th className="px-4 py-2.5 font-semibold">Created</th>
                <th className="px-4 py-2.5 font-semibold">Last used</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-border-dark">
              {keys.map((key) => (
                <tr key={key.id} id={`api-key-${key.id}`} className={key.revokedAt ? "api-key--revoked" : ""}>
                  <td className={`px-4 py-3 font-medium text-text dark:text-text-dark ${key.revokedAt ? "opacity-60" : ""}`}>{key.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted dark:text-text-muted-dark">{key.prefix}…</td>
                  <td className="px-4 py-3">
                    {key.mode === "direct" ? (
                      <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs font-semibold text-danger">Direct</span>
                    ) : (
                      <span className="text-xs font-semibold text-text-muted dark:text-text-muted-dark">Needs approval</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text dark:text-text-dark">
                    {key.scopes.map((s) => SCOPES.find((x) => x.value === s)?.label ?? s).join(", ")}
                  </td>
                  <td className="px-4 py-3 text-text-muted dark:text-text-muted-dark">
                    {dayjs(key.createdAt).format("D MMM YYYY")}
                    {key.createdByName && ` by ${key.createdByName}`}
                  </td>
                  <td className="px-4 py-3 text-text-muted dark:text-text-muted-dark">
                    {key.lastUsedAt ? dayjs(key.lastUsedAt).fromNow() : "Never"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {key.revokedAt ? (
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs font-semibold text-text-muted dark:text-text-muted-dark">
                          Revoked {dayjs(key.revokedAt).format("D MMM YYYY")}
                        </span>
                        <div className="flex justify-end gap-2 whitespace-nowrap">
                          <button
                            type="button"
                            id={`api-key-${key.id}-replace`}
                            onClick={() => openForm(key, false)}
                            title="Create a new key with the same name, mode and permissions"
                            className={SECONDARY_BUTTON_CLASS}
                          >
                            Create Replacement
                          </button>
                          {deleteButton(key)}
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2 whitespace-nowrap">
                        <button type="button" id={`api-key-${key.id}-edit`} onClick={() => openForm(key, true)} className={SECONDARY_BUTTON_CLASS}>
                          Edit
                        </button>
                        <button type="button" id={`api-key-${key.id}-revoke`} onClick={() => handleRevoke(key)} className={SECONDARY_BUTTON_CLASS}>
                          Revoke
                        </button>
                        {deleteButton(key)}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={creating}
        title={editing ? "Edit API Key" : "Create API Key"}
        onCancel={() => {
          setCreating(false);
          setEditing(null);
        }}
        onOk={handleSave}
        okText={editing ? "Save Changes" : "Create Key"}
        okButtonProps={{
          disabled: !name.trim() || !scopes.some((s) => availableScopes.some((a) => a.value === s)),
          loading: saving,
        }}
        destroyOnHidden
      >
        <div className="flex flex-col gap-4 py-2">
          {editing && (
            <p className="rounded-md bg-surface-muted px-3 py-2 text-xs text-text dark:bg-surface-muted-dark dark:text-text-dark">
              The key itself stays the same, so the tool using it doesn&apos;t need anything new. The changes apply from its next request.
            </p>
          )}
          <label className="flex flex-col gap-1.5 text-sm font-medium text-text dark:text-text-dark">
            Name
            <Input
              id="api-key-name"
              value={name}
              maxLength={100}
              placeholder="e.g. Content team AI assistant"
              onChange={(e) => setName(e.target.value)}
            />
            <span className={`${MUTED_CLASS} font-normal`}>Shown in AI Changes and the Activity Log next to everything this key does.</span>
          </label>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-text dark:text-text-dark">Mode</span>
            <Radio.Group id="api-key-mode" value={mode} onChange={(e) => setMode(e.target.value)} className="flex flex-col gap-2">
              {MODES.map((m) => (
                <Radio key={m.value} value={m.value} className="items-start! rounded-md border border-border p-3 dark:border-border-dark">
                  <span className="block font-medium">{m.label}</span>
                  <span className={`block ${MUTED_CLASS}`}>{m.help}</span>
                </Radio>
              ))}
            </Radio.Group>
            {mode === "direct" && (
              <p className="rounded-md bg-danger/10 px-3 py-2 text-xs text-text dark:text-text-dark">
                Whoever holds this key can change and unpublish content on the live site. Users, API keys, security settings and
                deployments stay off limits.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-text dark:text-text-dark">What it can use</span>
            {availableScopes.map((scope) => (
              <Checkbox
                key={scope.value}
                checked={scopes.includes(scope.value)}
                onChange={(e) =>
                  setScopes((prev) => (e.target.checked ? [...prev, scope.value] : prev.filter((s) => s !== scope.value)))
                }
              >
                <span className="font-medium">{scope.label}</span> <span className={MUTED_CLASS}>— {scope.help}</span>
              </Checkbox>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        open={deleting !== null}
        title="Delete API Key"
        onCancel={() => setDeleting(null)}
        onOk={handleDelete}
        okText="Delete"
        okButtonProps={{ danger: true, disabled: !/^\d{6}$/.test(otp.trim()), loading: deleteBusy }}
        destroyOnHidden
      >
        {deleting && (
          <form
            id="api-key-delete-form"
            className="flex flex-col gap-3 py-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (/^\d{6}$/.test(otp.trim())) handleDelete();
            }}
          >
            <p className="text-sm text-text dark:text-text-dark">
              Delete <strong>{deleting.name}</strong> for good?{" "}
              {deleting.revokedAt ? "" : "Any tool still using it stops working at once. "}
              Its changes in AI Changes and its Activity Log entries stay. This can&apos;t be undone.
            </p>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-text dark:text-text-dark" htmlFor="api-key-delete-otp">
              Code from your authenticator app
              <Input
                id="api-key-delete-otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                autoFocus
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="tracking-widest"
              />
            </label>
            {deleteError && <p className="form-error text-sm text-danger">{deleteError}</p>}
          </form>
        )}
      </Modal>

      <Modal
        open={newKey !== null}
        title="Copy Your New Key"
        onCancel={() => setNewKey(null)}
        footer={
          <button type="button" onClick={() => setNewKey(null)} className={PRIMARY_BUTTON_CLASS}>
            I&apos;ve copied it
          </button>
        }
        mask={{ closable: false }}
      >
        {newKey && (
          <div className="flex flex-col gap-3 py-2">
            <p className="text-sm text-text dark:text-text-dark">
              This is the only time the key for <strong>{newKey.name}</strong> is shown. Copy it now and keep it somewhere safe, like a
              password manager. If it&apos;s lost, revoke it and create a new one.
            </p>
            <div className="flex items-center gap-2">
              <code id="api-key-secret" className="flex-1 rounded-md bg-surface-muted px-3 py-2 font-mono text-xs break-all text-text dark:bg-surface-muted-dark dark:text-text-dark">
                {newKey.secretKey}
              </code>
              <button type="button" onClick={copyKey} className={SECONDARY_BUTTON_CLASS}>
                Copy
              </button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
