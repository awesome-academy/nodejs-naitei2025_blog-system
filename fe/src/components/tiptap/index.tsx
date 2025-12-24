"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image"; // 1. Import Image extension
import Toolbar from "./Toolbar";
import { on } from "events";

const Editor = ({ onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc ml-6",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal ml-6",
          },
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      // 2. Cấu hình Image extension
      Image.configure({
        inline: true,
        allowBase64: true, // Cho phép hiển thị ảnh base64 (tùy chọn)
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto my-4 mx-auto", // Style mặc định cho ảnh
        },
      }),
    ],
    content: "<p>Hello World!</p>",
    editorProps: {
      attributes: {
        class:
          "rounded-md border p-4 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    // Don't render immediately on the server to avoid SSR issues
    immediatelyRender: false,
  });

  return (
    <>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </>
  );
};

export default Editor;
