import {
  useEditor,
  EditorContent,
  JSONContent,
  Content,
  generateText,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { createPageMentionPlugin } from "./PageList";
import React from "react";
import { twMerge } from "tailwind-merge";

export const EditorExtension = [
  StarterKit,
  Placeholder.configure({
    placeholder: "Type your message... (Use [[ to mention pages)",
  }),
  createPageMentionPlugin(),
];

export const generateTextFromContent = (content: Content): string => {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content.map(generateTextFromContent).join("");
  }
  if (!content) {
    return "";
  }

  return generateText(content, EditorExtension);
};

interface EditorProps {
  content: Content;
  onChange?: (content: JSONContent) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  className?: string;
}

export function BaseEditor({
  content,
  disabled,
  className,
  onSubmit,
  onChange,
}: EditorProps) {
  const editor = useEditor({
    extensions: EditorExtension,
    content,
    editorProps: {
      attributes: {
        class: twMerge(
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[60px] max-h-[200px] overflow-y-auto",
          className
        ),
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getJSON());
      }
    },
  });
  React.useEffect(() => {
    if (editor) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);
  React.useEffect(() => {
    if (editor) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          if (onSubmit) {
            onSubmit();
          }
        }
      };

      editor.view.dom.addEventListener("keydown", handleKeyDown);

      return () => {
        editor.view.dom.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [editor, onSubmit]);

  return <EditorContent editor={editor} disabled={disabled} />;
}

export function EditorInput({
  content,
  onChange,
  onSubmit,
  disabled,
  className,
}: EditorProps) {
  return (
    <div className="relative min-h-[60px] max-h-[200px] w-full rounded-xl border bg-background px-3 py-2 text-sm ring-offset-background">
      <BaseEditor
        content={content}
        disabled={disabled}
        className={className}
        onSubmit={onSubmit}
        onChange={onChange}
      />
      <style>{`
        .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          height: 0;
          opacity: 0.5;
        }
      `}</style>
      <div
        className="absolute bottom-1 right-1 text-xs text-muted-foreground"
      >
        Press <kbd className="px-1 py-0.5 rounded bg-muted">⌘</kbd>+
        <kbd className="px-1 py-0.5 rounded bg-muted">Enter</kbd> to send
      </div>
    </div>
  );
}
