"use client";

import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { useThemeContext } from "@/lib/theme-context";
import type { CodeType } from "@/lib/types";

// Code field whose highlighting, autocomplete and bracket matching follow the
// snippet's Code Type. Universal is HTML mode, which also understands embedded
// <style> and <script> blocks. Fits antd Form.Item via value/onChange.
export default function CodeEditor({
  id,
  language,
  value,
  onChange,
  minHeight = "200px",
}: {
  id?: string;
  language: CodeType;
  value?: string;
  onChange?: (value: string) => void;
  minHeight?: string;
}) {
  const { theme } = useThemeContext();
  const extensions = useMemo(() => {
    if (language === "css") return [css()];
    if (language === "js") return [javascript()];
    return [html()];
  }, [language]);

  return (
    <div id={id} className="overflow-hidden rounded-md border border-border dark:border-border-dark">
      <CodeMirror
        value={value ?? ""}
        onChange={(v) => onChange?.(v)}
        extensions={extensions}
        theme={theme === "dark" ? "dark" : "light"}
        minHeight={minHeight}
        maxHeight="600px"
        basicSetup={{ foldGutter: true, highlightActiveLine: true, autocompletion: true }}
        className="text-sm"
      />
    </div>
  );
}
