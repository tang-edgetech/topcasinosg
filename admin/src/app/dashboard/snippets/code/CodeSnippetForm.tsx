"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Select, InputNumber, App as AntApp } from "antd";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { SnippetDTO, SnippetLocation, CodeType, ConditionField, PageDTO } from "@/lib/types";
import IconButton from "@/components/IconButton";
import CodeEditor from "@/components/CodeEditor";
import { IconTrash } from "@/components/Icons";
import { LOCATION_LABELS } from "../HeaderFooterPanel";
import { CODE_TYPE_LABELS, PAGE_OPERATOR_OPTIONS, URL_OPERATOR_OPTIONS, blankCondition, toGroups, type ConditionRow } from "../codeSnippets";

// Add/edit form for one code snippet, on its own route
// (/dashboard/snippets/code/new and /dashboard/snippets/code/{id}). Saving
// goes back to the list.
export default function CodeSnippetForm({ target, pages }: { target: SnippetDTO | null; pages: PageDTO[] }) {
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const router = useRouter();
  const [form] = Form.useForm();
  // Targeting: OR groups of AND conditions. Empty = everywhere.
  const [groups, setGroups] = useState<ConditionRow[][]>(() => (target ? toGroups(target.conditions) : []));
  const [submitting, setSubmitting] = useState(false);

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
      title: target ? "Save Changes" : "Add Code Snippet",
      message: target ? `Update "${values.name}"?` : `Create code snippet "${values.name}"?`,
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
      if (!target) {
        await api.post("/api/admin/snippets", body);
        message.success("Code snippet created.");
      } else {
        await api.put(`/api/admin/snippets/${target.id}`, body);
        message.success("Saved.");
      }
      router.push("/dashboard/snippets/code");
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not save code snippet.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="code-snippet-form" className="code-snippet-form rounded-lg border border-border p-5 dark:border-border-dark">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={
          target
            ? { name: target.name, codeType: target.codeType ?? "html", location: target.location, priority: target.priority, content: target.content }
            : { codeType: "html", location: "head", priority: 10 }
        }
      >
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
        <Form.Item noStyle dependencies={["codeType"]}>
          {({ getFieldValue }) => {
            const codeType: CodeType = getFieldValue("codeType") ?? "html";
            return (
              <Form.Item name="content" label={`Content (${CODE_TYPE_LABELS[codeType]})`} rules={[{ required: true }]}>
                <CodeEditor id="code-content" language={codeType} />
              </Form.Item>
            );
          }}
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
  );
}
