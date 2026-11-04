"use client";

import { useEffect, useMemo, useState } from "react";
import { App as AntApp, Button, Input, Tag } from "antd";
import { api, ApiError } from "@/lib/api";
import { useConfirm } from "@/components/ConfirmDialog";
import type { ThemeColorDTO } from "@/lib/types";

const CARD_CLASS = "rounded-lg border border-border p-4 dark:border-border-dark";
const HEADING_CLASS = "mb-1 text-lg font-bold text-text dark:text-text-dark";
const MUTED_CLASS = "text-sm text-text-muted dark:text-text-muted-dark";
const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

// <input type="color"> only takes #rrggbb.
function pickerValue(value: string): string {
  if (/^#[0-9a-f]{3}$/i.test(value)) return "#" + [...value.slice(1)].map((c) => c + c).join("");
  return value.slice(0, 7);
}

// Settings > Theme (Admin and Super Admin): the public site's colours, in
// place of shared/theme/tokens.css's defaults (domain.ThemeColors in
// api/internal/domain/site_theme.go). Saving replaces the whole theme; the
// site picks it up within a minute (web/src/lib/themeCss.ts).
export default function ThemeSettingsPage() {
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const [colors, setColors] = useState<ThemeColorDTO[] | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<{ colors: ThemeColorDTO[] }>("/api/admin/settings/theme").then(
      (data) => {
        const current = Object.fromEntries(data.colors.map((c) => [c.token, c.value]));
        setColors(data.colors);
        setValues(current);
        setSaved(current);
      },
      (err) => setError(err instanceof ApiError ? err.message : "Could not load the theme."),
    );
  }, []);

  const groups = useMemo(() => {
    const byGroup = new Map<string, ThemeColorDTO[]>();
    for (const c of colors ?? []) byGroup.set(c.group, [...(byGroup.get(c.group) ?? []), c]);
    return [...byGroup.entries()];
  }, [colors]);

  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (!colors) return null;

  const invalid = colors.filter((c) => !HEX.test(values[c.token] ?? ""));
  const dirty = colors.some((c) => (values[c.token] ?? "").toLowerCase() !== (saved[c.token] ?? "").toLowerCase());
  const changedCount = colors.filter((c) => (values[c.token] ?? "").toLowerCase() !== c.default).length;

  async function save(next: Record<string, string>) {
    setSaving(true);
    try {
      // Only colours that differ from their default are stored.
      const changed = Object.fromEntries(colors!.filter((c) => next[c.token].toLowerCase() !== c.default).map((c) => [c.token, next[c.token]]));
      await api.put("/api/admin/settings/theme", { colors: changed });
      setValues(next);
      setSaved(next);
      message.success("Theme saved. The website shows it within a minute.");
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not save the theme.");
    } finally {
      setSaving(false);
    }
  }

  async function resetAll() {
    const ok = await confirm({
      title: "Reset every colour?",
      message: "All colours go back to the site's original theme. The website shows it within a minute.",
      confirmLabel: "Reset and save",
    });
    if (ok) await save(Object.fromEntries(colors!.map((c) => [c.token, c.default])));
  }

  return (
    <section id="theme-settings-page" className="theme-settings-page flex max-w-3xl flex-col gap-4">
      <div className={CARD_CLASS}>
        <h2 className={HEADING_CLASS}>Website colours</h2>
        <p className={MUTED_CLASS}>
          The colours the public website is built from. Changing one changes it everywhere it&apos;s used: buttons, headings, the header,
          section backgrounds and the colours picked in the page builder. The admin dashboard keeps its own colours.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button id="theme-save" type="primary" loading={saving} disabled={!dirty || invalid.length > 0} onClick={() => save(values)}>
            Save theme
          </Button>
          <Button id="theme-undo" disabled={!dirty || saving} onClick={() => setValues(saved)}>
            Undo changes
          </Button>
          <Button id="theme-reset" danger disabled={saving || (changedCount === 0 && !dirty)} onClick={resetAll}>
            Reset all to original
          </Button>
          {invalid.length > 0 && <span className="text-sm text-danger">Use #rgb, #rrggbb or #rrggbbaa for: {invalid.map((c) => c.token).join(", ")}</span>}
        </div>
      </div>

      {groups.map(([group, items]) => (
        <div key={group} className={CARD_CLASS}>
          <h2 className={HEADING_CLASS}>{group}</h2>
          <div className="mb-3 flex h-6 overflow-hidden rounded-md border border-border dark:border-border-dark" aria-hidden="true">
            {items.map((c) => (
              <span key={c.token} className="flex-1" style={{ background: HEX.test(values[c.token] ?? "") ? values[c.token] : c.default }} />
            ))}
          </div>
          <ul className="flex flex-col divide-y divide-border dark:divide-border-dark">
            {items.map((c) => {
              const value = values[c.token] ?? c.default;
              const changed = value.toLowerCase() !== c.default;
              return (
                <li key={c.token} className="theme-color-row flex flex-wrap items-center gap-3 py-2">
                  <input
                    type="color"
                    aria-label={`${group} ${c.label}`}
                    value={pickerValue(HEX.test(value) ? value : c.default)}
                    onChange={(e) => setValues((v) => ({ ...v, [c.token]: e.target.value }))}
                    className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent dark:border-border-dark"
                  />
                  <div className="min-w-40 flex-1">
                    <div className="text-sm font-medium text-text dark:text-text-dark">{c.label}</div>
                    <div className="font-mono text-xs text-text-muted dark:text-text-muted-dark">{c.token}</div>
                  </div>
                  <Input
                    value={value}
                    onChange={(e) => setValues((v) => ({ ...v, [c.token]: e.target.value.trim() }))}
                    status={HEX.test(value) ? undefined : "error"}
                    className="!w-32 font-mono"
                    aria-label={`${c.token} hex value`}
                  />
                  {changed ? (
                    <Button size="small" onClick={() => setValues((v) => ({ ...v, [c.token]: c.default }))} title={`Original: ${c.default}`}>
                      Reset
                    </Button>
                  ) : (
                    <Tag className="!m-0">Original</Tag>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
