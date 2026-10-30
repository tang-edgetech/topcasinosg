"use client";

import { useMemo, useState } from "react";
import CodeMirror, { EditorState, type Extension } from "@uiw/react-codemirror";
import { indentUnit } from "@codemirror/language";
import { css } from "@codemirror/lang-css";
import { javascript, javascriptLanguage } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { App as AntApp } from "antd";
import { useThemeContext } from "@/lib/theme-context";
import { jqueryCompletions } from "@/lib/jqueryCompletions";

// What the editor highlights and formats as. Universal snippets are HTML
// mode, which also understands embedded <style> and <script> blocks.
export type CodeLanguage = "html" | "css" | "js" | "jquery" | "universal";

const INDENT = "  ";

// Tab and Shift+Tab indent with spaces (never a tab character), and pasted
// tabs show at the same width.
const SPACE_INDENT: Extension[] = [indentUnit.of(INDENT), EditorState.tabSize.of(INDENT.length)];

// Prettier is only loaded when someone clicks Format.
async function formatCode(code: string, language: CodeLanguage): Promise<string> {
  const prettier = await import("prettier/standalone");
  const options = { tabWidth: INDENT.length, useTabs: false, printWidth: 120 };
  if (language === "css") {
    const postcss = await import("prettier/plugins/postcss");
    return prettier.format(code, { ...options, parser: "css", plugins: [postcss] });
  }
  const [babel, estree] = await Promise.all([import("prettier/plugins/babel"), import("prettier/plugins/estree")]);
  if (language === "js" || language === "jquery") {
    return prettier.format(code, { ...options, parser: "babel", plugins: [babel, estree] });
  }
  const [htmlPlugin, postcss] = await Promise.all([import("prettier/plugins/html"), import("prettier/plugins/postcss")]);
  return prettier.format(code, { ...options, parser: "html", plugins: [htmlPlugin, postcss, babel, estree] });
}

// Code field whose highlighting, autocomplete, bracket matching and Format
// button follow the snippet's Code Type. jQuery is JavaScript mode plus
// completions for $ / jQuery methods. Fits antd Form.Item via value/onChange.
export default function CodeEditor({
  id,
  language,
  value,
  onChange,
  minHeight = "200px",
}: {
  id?: string;
  language: CodeLanguage;
  value?: string;
  onChange?: (value: string) => void;
  minHeight?: string;
}) {
  const { message } = AntApp.useApp();
  const { theme } = useThemeContext();
  const [formatting, setFormatting] = useState(false);
  const extensions = useMemo(() => {
    if (language === "css") return [...SPACE_INDENT, css()];
    if (language === "js") return [...SPACE_INDENT, javascript()];
    if (language === "jquery") return [...SPACE_INDENT, javascript(), javascriptLanguage.data.of({ autocomplete: jqueryCompletions })];
    return [...SPACE_INDENT, html()];
  }, [language]);

  async function handleFormat() {
    if (!value?.trim()) return;
    setFormatting(true);
    try {
      onChange?.((await formatCode(value, language)).trimEnd());
    } catch (err) {
      // Prettier's message starts with the line/column it stopped at.
      const detail = err instanceof Error ? err.message.split("\n")[0] : "";
      message.error(`Couldn't format — check the code for a syntax error. ${detail}`.trim());
    } finally {
      setFormatting(false);
    }
  }

  return (
    <div id={id} className="code-editor overflow-hidden rounded-md border border-border dark:border-border-dark">
      <div className="code-editor__toolbar flex items-center justify-between gap-2 border-b border-border bg-surface-muted px-3 py-1.5 text-xs text-text-muted dark:border-border-dark dark:bg-surface-muted-dark dark:text-text-muted-dark">
        <span>Tab indents with {INDENT.length} spaces</span>
        <button
          type="button"
          id={id ? `${id}-format` : undefined}
          onClick={handleFormat}
          disabled={formatting || !value?.trim()}
          className="code-editor__format cursor-pointer rounded border border-border bg-surface px-2 py-0.5 font-semibold text-text disabled:cursor-not-allowed disabled:opacity-50 dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
        >
          {formatting ? "Formatting…" : "Format"}
        </button>
      </div>
      <CodeMirror
        value={value ?? ""}
        onChange={(v) => onChange?.(v)}
        extensions={extensions}
        theme={theme === "dark" ? "dark" : "light"}
        minHeight={minHeight}
        maxHeight="600px"
        indentWithTab
        basicSetup={{ foldGutter: true, highlightActiveLine: true, autocompletion: true, tabSize: INDENT.length }}
        className="text-sm"
      />
    </div>
  );
}
