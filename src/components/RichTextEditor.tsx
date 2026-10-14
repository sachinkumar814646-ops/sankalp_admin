
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function RichTextEditor() {
    const editor = useEditor({
        extensions: [StarterKit],
        immediatelyRender: false,
        content: "<p>Start writing...</p>",
        editorProps: {
            attributes: {
                class:
                    "min-h-[200px] p-4 outline-none prose max-w-none",
            },
        },
    });

    if (!editor) return null;

    return (
        <div className="overflow-hidden rounded-lg border border-gray-300">
            <div className="flex flex-wrap gap-2 border-b p-2">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className="rounded px-3 py-1 hover:bg-gray-100"
                >
                    <b>B</b>
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className="rounded px-3 py-1 hover:bg-gray-100"
                >
                    <i>I</i>
                </button>

                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                    className="rounded px-3 py-1 hover:bg-gray-100"
                >
                    • List
                </button>

                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().toggleHeading({
                            level: 2,
                        }).run()
                    }
                    className="rounded px-3 py-1 hover:bg-gray-100"
                >
                    H2
                </button>
            </div>

            <EditorContent editor={editor} />
        </div>
    );
}
