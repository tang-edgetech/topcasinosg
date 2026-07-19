"use client";

import { useEffect } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface RichTextEditorProps {
  id?: string;
  value: string;
  onChange: (html: string) => void;
}

// Shared WYSIWYG editor for every content type's long-form "Content"/"Full
// write-up" field (Casinos, Guides, News, Blacklist). Stores/emits HTML —
// the public site renders it with dangerouslySetInnerHTML after a
// sanitize-html pass (see web/'s render spots), same as any CMS body field.
export default function RichTextEditor({ id, value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    // Next.js renders on the server first; TipTap's DOM-dependent editor
    // must only mount client-side or hydration mismatches occur.
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "rich-text-editor__body rich-text-content min-h-[220px] px-3 py-2 text-text focus:outline-none dark:text-text-dark",
      },
    },
  });

  // The form loading this editor often fetches `value` asynchronously after
  // first mount (edit pages) — push that in once it arrives, without
  // re-emitting onChange (would look like the user just typed it).
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) {
    return (
      <div
        id={id}
        className="rich-text-editor flex min-h-[260px] items-center justify-center rounded-md border border-border bg-surface text-sm text-text-muted dark:border-border-dark dark:bg-surface-dark dark:text-text-muted-dark"
      >
        Loading editor…
      </div>
    );
  }

  return (
    <div id={id} className="rich-text-editor rounded-md border border-border bg-surface dark:border-border-dark dark:bg-surface-dark">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({
  title,
  active,
  disabled,
  onClick,
  children,
}: {
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-7 min-w-7 cursor-pointer items-center justify-center rounded px-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "bg-primary-900 text-white"
          : "text-text hover:bg-surface-muted dark:text-text-dark dark:hover:bg-surface-muted-dark"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  function setLink() {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="rich-text-editor__toolbar flex flex-wrap items-center gap-1 border-b border-border px-2 py-1.5 dark:border-border-dark">
      <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <span className="font-bold">B</span>
      </ToolbarButton>
      <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <span className="italic">I</span>
      </ToolbarButton>
      <ToolbarButton title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <span className="underline">U</span>
      </ToolbarButton>
      <ToolbarButton title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <span className="line-through">S</span>
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-border dark:bg-border-dark" />

      <ToolbarButton
        title="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        title="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-border dark:bg-border-dark" />

      <ToolbarButton
        title="Bullet List"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        •—
      </ToolbarButton>
      <ToolbarButton
        title="Numbered List"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1.
      </ToolbarButton>
      <ToolbarButton
        title="Quote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        &ldquo;
      </ToolbarButton>
      <ToolbarButton title="Link" active={editor.isActive("link")} onClick={setLink}>
        🔗
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-border dark:bg-border-dark" />

      <ToolbarButton title="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
        ↺
      </ToolbarButton>
      <ToolbarButton title="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
        ↻
      </ToolbarButton>
    </div>
  );
}
