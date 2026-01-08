"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

interface EditorProps {
  content: string;
  onChange?: (content: string) => void;
  onSave?: (content: string) => void;
}

export function Editor({ content, onChange, onSave }: EditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base focus:outline-none max-w-none min-h-[400px] px-4 py-2 border rounded-md border-fg/10 bg-bg",
      },
    },
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (editor) {
          onSave?.(editor.getHTML());
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editor, onSave]);

  if (!editor) return null;

  return (
    <div className="space-y-4">
      <div className="border-fg/10 bg-bg/80 sticky top-0 z-10 mb-2 flex gap-2 border-b pb-2 backdrop-blur-sm">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded p-1 ${editor.isActive("bold") ? "bg-brand text-white" : "hover:bg-fg/5"}`}
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded p-1 ${editor.isActive("italic") ? "bg-brand text-white" : "hover:bg-fg/5"}`}
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`rounded p-1 ${editor.isActive("heading", { level: 1 }) ? "bg-brand text-white" : "hover:bg-fg/5"}`}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`rounded p-1 ${editor.isActive("heading", { level: 2 }) ? "bg-brand text-white" : "hover:bg-fg/5"}`}
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded p-1 ${editor.isActive("bulletList") ? "bg-brand text-white" : "hover:bg-fg/5"}`}
        >
          List
        </button>
      </div>
      <EditorContent editor={editor} />
      <div className="flex justify-end">
        <button
          onClick={() => onSave?.(editor.getHTML())}
          className="bg-brand hover:bg-brand/90 rounded-md px-4 py-2 text-white transition-colors"
        >
          Save Changes (Ctrl+S)
        </button>
      </div>
    </div>
  );
}
