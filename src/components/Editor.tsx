import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import React from 'react'

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  onSubmit: () => void;
}

export function Editor({ content, onChange, onSubmit }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Type your message...',
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[60px] max-h-[200px] overflow-y-auto',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
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
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          onSubmit();
        }
      };

      editor.view.dom.addEventListener('keydown', handleKeyDown);

      return () => {
        editor.view.dom.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [editor, onSubmit]);

  return (
    <div className="relative min-h-[60px] max-h-[200px] w-full rounded-xl border bg-background px-3 py-2 text-sm ring-offset-background">
      <EditorContent editor={editor} />
    </div>
  );
} 