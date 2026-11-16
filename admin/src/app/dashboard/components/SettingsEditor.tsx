"use client";

import { Input, Select } from "antd";
import IconButton from "@/components/IconButton";
import { IconTrash } from "@/components/Icons";
import type { ComponentSetting, ComponentSettingType } from "@/lib/types";

// The options each page placing the component can fill in. Each one is
// {{key}} in the component's HTML and window.settings.key in its
// JavaScript; an empty value on a page uses the default.

export const SETTING_TYPE_LABELS: Record<ComponentSettingType, string> = {
  text: "Text (one line)",
  textarea: "Text (several lines)",
  richtext: "Formatted text",
  number: "Number",
  select: "Choice from a list",
  toggle: "Yes / No",
};

// The API's rule (domain.ComponentSettingKeyPattern / ReservedComponentSettingKey).
export function settingKeyProblem(key: string): string | null {
  if (!/^[a-z][a-zA-Z0-9]{0,39}$/.test(key)) return "Start with a small letter; letters and numbers only (e.g. heading, defaultTab).";
  if (key === "componentId" || key === "panelTitle" || key === "settings" || /^st[A-Z]/.test(key)) return "This name is taken by every page block.";
  return null;
}

const blankSetting = (): ComponentSetting => ({ key: "", label: "", type: "text", default: "" });

export default function SettingsEditor({ value, onChange }: { value: ComponentSetting[]; onChange: (v: ComponentSetting[]) => void }) {
  const update = (i: number, patch: Partial<ComponentSetting>) => onChange(value.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const move = (i: number, by: number) => {
    const next = [...value];
    const [item] = next.splice(i, 1);
    next.splice(i + by, 0, item);
    onChange(next);
  };

  return (
    <div id="component-settings" className="flex flex-col gap-3">
      {value.length === 0 && (
        <p className="text-xs text-text-muted dark:text-text-muted-dark">No settings: the component looks the same on every page.</p>
      )}
      {value.map((s, i) => {
        const keyProblem = s.key ? settingKeyProblem(s.key) : null;
        const duplicate = s.key !== "" && value.findIndex((o) => o.key === s.key) !== i;
        return (
          <div
            key={i}
            id={`component-setting-${i}`}
            className="flex flex-col gap-2 rounded-md border border-border bg-surface p-3 dark:border-border-dark dark:bg-surface-dark"
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-text-muted dark:text-text-muted-dark">Key (in the code)</span>
                <Input
                  value={s.key}
                  placeholder="heading"
                  status={keyProblem || duplicate ? "error" : undefined}
                  onChange={(e) => update(i, { key: e.target.value.trim() })}
                  className="font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-text-muted dark:text-text-muted-dark">Label (for editors)</span>
                <Input value={s.label} placeholder="Heading" onChange={(e) => update(i, { label: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-text-muted dark:text-text-muted-dark">Type</span>
                <Select
                  value={s.type}
                  onChange={(type: ComponentSettingType) =>
                    update(i, {
                      type,
                      default: type === "toggle" ? "no" : "",
                      options: type === "select" ? (s.options?.length ? s.options : [{ value: "", label: "" }]) : undefined,
                    })
                  }
                  options={Object.entries(SETTING_TYPE_LABELS).map(([v, label]) => ({ value: v, label }))}
                />
              </div>
              <div className="flex items-end gap-1">
                <IconButton id={`component-setting-${i}-up`} title="Move up" onClick={() => i > 0 && move(i, -1)} icon={<span aria-hidden>↑</span>} variant="muted" />
                <IconButton
                  id={`component-setting-${i}-down`}
                  title="Move down"
                  onClick={() => i < value.length - 1 && move(i, 1)}
                  icon={<span aria-hidden>↓</span>}
                  variant="muted"
                />
                <IconButton
                  id={`component-setting-${i}-remove`}
                  title="Remove setting"
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
                  icon={<IconTrash width={14} height={14} />}
                  variant="danger"
                />
              </div>
            </div>
            {(keyProblem || duplicate) && <span className="text-xs text-danger">{duplicate ? "Two settings have this key." : keyProblem}</span>}

            {s.type === "select" && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-text-muted dark:text-text-muted-dark">Choices (value used by the code, and its label)</span>
                {(s.options ?? []).map((o, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <Input
                      className="font-mono"
                      placeholder="toto"
                      value={o.value}
                      onChange={(e) => update(i, { options: (s.options ?? []).map((x, xi) => (xi === oi ? { ...x, value: e.target.value } : x)) })}
                    />
                    <Input
                      placeholder="Toto"
                      value={o.label}
                      onChange={(e) => update(i, { options: (s.options ?? []).map((x, xi) => (xi === oi ? { ...x, label: e.target.value } : x)) })}
                    />
                    <IconButton
                      id={`component-setting-${i}-option-${oi}-remove`}
                      title="Remove choice"
                      onClick={() => update(i, { options: (s.options ?? []).filter((_, xi) => xi !== oi) })}
                      icon={<IconTrash width={14} height={14} />}
                      variant="danger"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => update(i, { options: [...(s.options ?? []), { value: "", label: "" }] })}
                  className="w-fit cursor-pointer text-xs font-semibold text-primary-700 hover:underline dark:text-text-dark"
                >
                  + Choice
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-text-muted dark:text-text-muted-dark">Default</span>
                {s.type === "select" ? (
                  <Select
                    allowClear
                    value={s.default || undefined}
                    placeholder="No default"
                    onChange={(v?: string) => update(i, { default: v ?? "" })}
                    options={(s.options ?? []).filter((o) => o.value).map((o) => ({ value: o.value, label: o.label || o.value }))}
                  />
                ) : s.type === "toggle" ? (
                  <Select
                    value={s.default || "no"}
                    onChange={(v: string) => update(i, { default: v })}
                    options={[
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "No" },
                    ]}
                  />
                ) : s.type === "textarea" || s.type === "richtext" ? (
                  <Input.TextArea autoSize={{ minRows: 2, maxRows: 8 }} value={s.default} onChange={(e) => update(i, { default: e.target.value })} />
                ) : (
                  <Input value={s.default} onChange={(e) => update(i, { default: e.target.value })} />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-text-muted dark:text-text-muted-dark">Hint for editors (optional)</span>
                <Input value={s.help ?? ""} onChange={(e) => update(i, { help: e.target.value })} />
              </div>
            </div>
          </div>
        );
      })}
      <button
        type="button"
        id="component-setting-add"
        onClick={() => onChange([...value, blankSetting()])}
        className="btn w-fit cursor-pointer rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
      >
        + Add setting
      </button>
    </div>
  );
}
