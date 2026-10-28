"use client";

import { useState } from "react";
import { Table, Form, Input, Select, InputNumber, Switch, App as AntApp } from "antd";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { SnippetDTO, SnippetConditionDTO, SnippetLocation, CodeType, ConditionField, ConditionOperator, PageDTO } from "@/lib/types";
import IconButton from "@/components/IconButton";
import { IconEdit, IconTrash, IconPlus, IconClose } from "@/components/Icons";
import { LOCATION_LABELS } from "./HeaderFooterPanel";

const { TextArea } = Input;

const CODE_TYPE_LABELS: Record<CodeType, string> = {
  html: "HTML",
  css: "CSS",
  js: "JavaScript",
  universal: "Universal (mixed HTML/CSS/JS)",
};

const PAGE_OPERATOR_OPTIONS: { value: ConditionOperator; label: string }[] = [
  { value: "is", label: "is" },
  { value: "is_not", label: "is not" },
];

const URL_OPERATOR_OPTIONS: { value: ConditionOperator; label: string }[] = [
  { value: "is", label: "is" },
  { value: "is_not", label: "is not" },
  { value: "contains", label: "contains" },
  { value: "not_contains", label: "does not contain" },
];

type ConditionRow = Omit<SnippetConditionDTO, "id" | "sortOrder" | "groupIndex">;

function blankCondition(): ConditionRow {
  return { field: "url", operator: "contains", pageId: null, value: "" };
}

// Conditions as AND groups, from the API's flat list (groupIndex). Groups
// are renumbered 0.. in order, so gaps from removed groups don't matter.
function toGroups(conditions: SnippetConditionDTO[]): ConditionRow[][] {
  const byGroup = new Map<number, ConditionRow[]>();
  const sorted = [...conditions].sort((a, b) => a.groupIndex - b.groupIndex || a.sortOrder - b.sortOrder);
  for (const { groupIndex, field, operator, pageId, value } of sorted) {
    byGroup.set(groupIndex, [...(byGroup.get(groupIndex) ?? []), { field, operator, pageId, value }]);
  }
  return [...byGroup.values()];
}

// One-line summary for the table, e.g. "URL contains /sg AND URL does not
// contain /review OR Page is Homepage".
function describeConditions(conditions: SnippetConditionDTO[], pages: PageDTO[]): string {
  return toGroups(conditions)
    .map((group) =>
      group
        .map((c) => {
          const op = (c.field === "page" ? PAGE_OPERATOR_OPTIONS : URL_OPERATOR_OPTIONS).find((o) => o.value === c.operator)?.label ?? c.operator;
          const target = c.field === "page" ? (pages.find((p) => p.id === c.pageId)?.title ?? "(deleted page)") : c.value;
          return `${c.field === "page" ? "Page" : "URL"} ${op} ${target}`;
        })
        .join(" AND "),
    )
    .join(" OR ");
}

// Typed, prioritized, conditionally-targeted the second half of Snippets
// (see HeaderFooterPanel for the simple/unconditional half). Add/edit is
// inline on this same page — no Modal, no separate route.
export default function CodePanel({ snippets, pages, onReload }: { snippets: SnippetDTO[]; pages: PageDTO[]; onReload: () => void }) {
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  // Targeting: OR groups of AND conditions. Empty = everywhere.
  const [groups, setGroups] = useState<ConditionRow[][]>([]);
  const [submitting, setSubmitting] = useState(false);

  function startAdd() {
    form.resetFields();
    setGroups([]);
    setEditingId("new");
  }

  function startEdit(s: SnippetDTO) {
    form.setFieldsValue({
      name: s.name,
      codeType: s.codeType ?? "html",
      location: s.location,
      priority: s.priority,
      content: s.content,
    });
    setGroups(toGroups(s.conditions));
    setEditingId(s.id);
  }

  // A new OR group starts with one condition.
  function addGroup() {
    setGroups((prev) => [...prev, [blankCondition()]]);
  }

  function addCondition(group: number) {
    setGroups((prev) => prev.map((g, gi) => (gi === group ? [...g, blankCondition()] : g)));
  }

  function updateCondition(group: number, index: number, patch: Partial<ConditionRow>) {
    setGroups((prev) => prev.map((g, gi) => (gi === group ? g.map((c, i) => (i === index ? { ...c, ...patch } : c)) : g)));
  }

  // Removing a group's last condition removes the group.
  function removeCondition(group: number, index: number) {
    setGroups((prev) => prev.map((g, gi) => (gi === group ? g.filter((_, i) => i !== index) : g)).filter((g) => g.length > 0));
  }

  async function handleToggleActive(s: SnippetDTO, active: boolean) {
    try {
      await api.put(`/api/admin/snippets/${s.id}/active`, { active });
      message.success(active ? "Snippet activated." : "Snippet deactivated.");
      onReload();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not update snippet.");
    }
  }

  async function handleDelete(s: SnippetDTO) {
    const ok = await confirm({ title: "Delete Snippet", message: `Delete "${s.name}"? This cannot be undone.`, confirmLabel: "Delete", danger: true });
    if (!ok) return;
    try {
      await api.del(`/api/admin/snippets/${s.id}`);
      message.success("Deleted.");
      onReload();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not delete snippet.");
    }
  }

  async function handleFinish(values: { name: string; codeType: CodeType; location: SnippetLocation; priority: number; content: string }) {
    for (const c of groups.flat()) {
      if (c.field === "page" && !c.pageId) {
        message.error("Every 'Page' condition needs a page selected.");
        return;
      }
      if (c.field === "url" && !c.value.trim()) {
        message.error("Every 'URL' condition needs a value.");
        return;
      }
    }

    const ok = await confirm({
      title: editingId === "new" ? "Add Code Snippet" : "Save Changes",
      message: editingId === "new" ? `Create code snippet "${values.name}"?` : `Update "${values.name}"?`,
      danger: true,
    });
    if (!ok) return;

    setSubmitting(true);
    const body = {
      ...values,
      kind: "code",
      conditions: groups.flatMap((group, groupIndex) => group.map((c, i) => ({ ...c, groupIndex, sortOrder: i + 1 }))),
    };
    try {
      if (editingId === "new") {
        await api.post("/api/admin/snippets", body);
        message.success("Code snippet created.");
      } else {
        await api.put(`/api/admin/snippets/${editingId}`, body);
        message.success("Saved.");
      }
      setEditingId(null);
      onReload();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not save code snippet.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="snippets-code-panel" className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted dark:text-text-muted-dark">
          Typed, prioritized, and optionally targeted to pages/URLs with AND/OR conditions. No conditions = applies everywhere.
        </p>
        {editingId === null && <IconButton id="code-add" title="Add Code Snippet" onClick={startAdd} icon={<IconPlus />} />}
      </div>

      {editingId !== null && (
        <div className="flex flex-col gap-4 rounded-lg border border-border p-5 dark:border-border-dark">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-text dark:text-text-dark">{editingId === "new" ? "Add Code Snippet" : "Edit Code Snippet"}</h3>
            <IconButton id="code-cancel" title="Cancel" onClick={() => setEditingId(null)} icon={<IconClose width={14} height={14} />} variant="muted" />
          </div>
          <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ codeType: "html", location: "head", priority: 10 }}>
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input placeholder="Casino Pages Tracking Pixel" />
            </Form.Item>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Form.Item
                name="codeType"
                label="Code Type"
                extra="CSS auto-wraps in <style>, JS auto-wraps in <script>. HTML/Universal render exactly as pasted."
              >
                <Select options={Object.entries(CODE_TYPE_LABELS).map(([value, label]) => ({ value, label }))} />
              </Form.Item>
              <Form.Item name="location" label="Location">
                <Select options={Object.entries(LOCATION_LABELS).map(([value, label]) => ({ value, label }))} />
              </Form.Item>
              <Form.Item name="priority" label="Priority" extra="0-100, default 10. Lower runs first.">
                <InputNumber className="w-full" min={0} max={100} />
              </Form.Item>
            </div>
            <Form.Item name="content" label="Content" rules={[{ required: true }]}>
              <TextArea rows={8} className="font-mono" />
            </Form.Item>

            <div id="code-conditions" className="mb-4 flex flex-col gap-3 rounded-md bg-surface-muted p-4 dark:bg-surface-muted-dark">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-text dark:text-text-dark">Targeting Conditions</span>
                <span className="text-xs text-text-muted dark:text-text-muted-dark">
                  Conditions in a group must all match (AND). The snippet applies when any group matches (OR).
                </span>
              </div>
              {groups.length === 0 && (
                <p className="text-xs text-text-muted dark:text-text-muted-dark">No conditions — this snippet applies to every page.</p>
              )}
              {groups.map((group, groupIndex) => (
                <div key={groupIndex} className="flex flex-col gap-3">
                  {groupIndex > 0 && (
                    <div className="flex items-center gap-3" aria-hidden="true">
                      <span className="h-px flex-1 bg-border dark:bg-border-dark" />
                      <span className="rounded-full bg-secondary-100 px-3 py-0.5 text-xs font-bold text-secondary-900">OR</span>
                      <span className="h-px flex-1 bg-border dark:bg-border-dark" />
                    </div>
                  )}
                  <div
                    id={`code-condition-group-${groupIndex}`}
                    className="flex flex-col gap-2 rounded-md border border-border bg-surface p-3 dark:border-border-dark dark:bg-surface-dark"
                  >
                    <span className="text-xs font-semibold tracking-wide text-text-muted uppercase dark:text-text-muted-dark">
                      Group {groupIndex + 1}
                    </span>
                    {group.map((c, index) => (
                      <div key={index} className="flex flex-col gap-2">
                        {index > 0 && (
                          <span className="w-fit rounded bg-primary-50 px-2 py-0.5 text-xs font-bold text-primary-700 dark:bg-surface-muted-dark dark:text-text-dark">
                            AND
                          </span>
                        )}
                        <div className="flex items-center gap-2">
                          <Select
                            className="w-28"
                            value={c.field}
                            onChange={(field: ConditionField) =>
                              updateCondition(groupIndex, index, { field, operator: field === "page" ? "is" : "contains", pageId: null, value: "" })
                            }
                            options={[
                              { value: "page", label: "Page" },
                              { value: "url", label: "URL" },
                            ]}
                          />
                          <Select
                            className="w-40"
                            value={c.operator}
                            onChange={(operator) => updateCondition(groupIndex, index, { operator })}
                            options={c.field === "page" ? PAGE_OPERATOR_OPTIONS : URL_OPERATOR_OPTIONS}
                          />
                          {c.field === "page" ? (
                            <Select
                              className="flex-1"
                              placeholder="Select a page"
                              value={c.pageId ?? undefined}
                              onChange={(pageId) => updateCondition(groupIndex, index, { pageId })}
                              options={pages.map((p) => ({ value: p.id, label: p.title }))}
                            />
                          ) : (
                            <Input
                              className="flex-1"
                              placeholder="/casinos"
                              value={c.value}
                              onChange={(e) => updateCondition(groupIndex, index, { value: e.target.value })}
                            />
                          )}
                          <IconButton
                            id={`code-condition-${groupIndex}-${index}-remove`}
                            title="Remove Condition"
                            onClick={() => removeCondition(groupIndex, index)}
                            icon={<IconTrash width={14} height={14} />}
                            variant="danger"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      id={`code-condition-${groupIndex}-add`}
                      onClick={() => addCondition(groupIndex)}
                      className="w-fit cursor-pointer text-xs font-semibold text-primary-700 hover:underline dark:text-text-dark"
                    >
                      + AND condition
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                id="code-condition-group-add"
                onClick={addGroup}
                className="btn w-fit cursor-pointer rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
              >
                {groups.length === 0 ? "+ Add condition" : "+ OR group"}
              </button>
            </div>

            <button
              type="submit"
              id="code-submit"
              disabled={submitting}
              className="btn btn--primary w-fit cursor-pointer rounded-md bg-primary-900 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Save"}
            </button>
          </Form>
        </div>
      )}

      <Table
        id="code-table"
        rowKey="id"
        dataSource={snippets}
        pagination={false}
        columns={[
          { title: "Name", dataIndex: "name", key: "name" },
          { title: "Type", key: "type", render: (_, s) => (s.codeType ? CODE_TYPE_LABELS[s.codeType] : "—") },
          { title: "Priority", dataIndex: "priority", key: "priority" },
          {
            title: "Targeting",
            key: "targeting",
            render: (_, s) => (s.conditions.length === 0 ? "Everywhere" : describeConditions(s.conditions, pages)),
          },
          { title: "Active", key: "active", render: (_, s) => <Switch checked={s.isActive} onChange={(checked) => handleToggleActive(s, checked)} /> },
          {
            title: "Actions",
            key: "actions",
            render: (_, s) => (
              <div className="flex gap-2">
                <IconButton id={`code-${s.id}-edit`} title="Edit Snippet" onClick={() => startEdit(s)} icon={<IconEdit />} variant="muted" />
                <IconButton id={`code-${s.id}-delete`} title="Delete Snippet" onClick={() => handleDelete(s)} icon={<IconTrash />} variant="danger" />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
