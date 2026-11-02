"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Checkbox, Input, Modal, App as AntApp } from "antd";
import { api, ApiError } from "@/lib/api";
import { useConfirm } from "@/components/ConfirmDialog";
import type { APIKeyDTO, APIScope } from "@/lib/types";

dayjs.extend(relativeTime);

const MUTED_CLASS = "text-sm text-text-muted dark:text-text-muted-dark";
const PRIMARY_BUTTON_CLASS =
  "btn cursor-pointer rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60";
const SECONDARY_BUTTON_CLASS =
  "btn cursor-pointer rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-text dark:border-border-dark dark:text-text-dark disabled:cursor-not-allowed disabled:opacity-60";

const SCOPES: { value: APIScope; label: string; help: string }[] = [
  { value: "pages", label: "Pages", help: "Read pages and propose changes or new pages." },
  { value: "news", label: "News", help: "Read articles and propose changes or new articles." },
  { value: "media", label: "Media", help: "Read the Media Library and upload images to it." },
];

// Settings > API Keys: keys that let an outside tool (e.g. an AI assistant)
// use the Content API (/api/v1). Pages and news it sends wait in AI Changes
// for approval. Data: /api/admin/api-keys.
export default function APIKeysSettingsPage() {
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const [keys, setKeys] = useState<APIKeyDTO[] | null>(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<APIScope[]>(["pages", "news", "media"]);
  const [saving, setSaving] = useState(false);
  const [newKey, setNewKey] = useState<{ name: string; secretKey: string } | null>(null);

  function load() {
    return api.get<{ apiKeys: APIKeyDTO[] }>("/api/admin/api-keys").then(
      (data) => setKeys(data.apiKeys ?? []),
      (err) => setError(err instanceof ApiError ? err.message : "Could not load API keys."),
    );
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate() {
    setSaving(true);
    try {
      const created = await api.post<{ name: string; secretKey: string }>("/api/admin/api-keys", { name, scopes });
      setCreating(false);
      setName("");
      setNewKey(created);
      await load();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not create the key.");
    } finally {
      setSaving(false);
    }
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
            A key lets a tool such as an AI assistant read the site&apos;s content and propose changes through the Content API. Nothing it
            sends goes live by itself: every page or article change waits in <strong>AI Changes</strong> until someone approves it. A key
            stops working if it is revoked, or if the admin who created it is disabled.
          </p>
        </div>
        <button type="button" id="api-keys-create" onClick={() => setCreating(true)} className={PRIMARY_BUTTON_CLASS}>
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
                <th className="px-4 py-2.5 font-semibold">Can use</th>
                <th className="px-4 py-2.5 font-semibold">Created</th>
                <th className="px-4 py-2.5 font-semibold">Last used</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-border-dark">
              {keys.map((key) => (
                <tr key={key.id} id={`api-key-${key.id}`} className={key.revokedAt ? "opacity-60" : ""}>
                  <td className="px-4 py-3 font-medium text-text dark:text-text-dark">{key.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted dark:text-text-muted-dark">{key.prefix}…</td>
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
                      <span className="text-xs font-semibold text-text-muted dark:text-text-muted-dark">
                        Revoked {dayjs(key.revokedAt).format("D MMM YYYY")}
                      </span>
                    ) : (
                      <button type="button" id={`api-key-${key.id}-revoke`} onClick={() => handleRevoke(key)} className={SECONDARY_BUTTON_CLASS}>
                        Revoke
                      </button>
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
        title="Create API Key"
        onCancel={() => setCreating(false)}
        onOk={handleCreate}
        okText="Create Key"
        okButtonProps={{ disabled: !name.trim() || scopes.length === 0, loading: saving }}
        destroyOnHidden
      >
        <div className="flex flex-col gap-4 py-2">
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
            <span className="text-sm font-medium text-text dark:text-text-dark">What it can use</span>
            {SCOPES.map((scope) => (
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
