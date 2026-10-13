'use client';

import { useEffect, useRef } from 'react';
import { toEditorHtml } from '@/domains/media/richText';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const ACTIONS = [
  { command: 'bold', label: 'Negrito', icon: 'format_bold' },
  { command: 'italic', label: 'Itálico', icon: 'format_italic' },
  { command: 'underline', label: 'Sublinhado', icon: 'format_underlined' },
  { command: 'insertUnorderedList', label: 'Lista', icon: 'format_list_bulleted' },
  { command: 'insertOrderedList', label: 'Lista numerada', icon: 'format_list_numbered' },
] as const;

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const html = toEditorHtml(value);
  const editorRef = useRef<HTMLDivElement>(null);
  const lastHtml = useRef(html);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (editor.innerHTML !== html) {
      editor.innerHTML = html;
      lastHtml.current = html;
    }
  }, [html]);

  const apply = (command: string, argument?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, argument);
    const html = editorRef.current?.innerHTML ?? '';
    lastHtml.current = html;
    onChange(html);
  };

  const addLink = () => {
    const href = window.prompt('Endereço do link (https://…)');
    if (!href?.trim()) return;
    apply('createLink', href.trim());
  };

  return (
    <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--input)]">
      <div className="flex flex-wrap gap-1 border-b border-[var(--border)] p-1" role="toolbar" aria-label="Formatação do texto">
        {ACTIONS.map((action) => (
          <button
            key={action.command}
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-[var(--card-secondary)]"
            aria-label={action.label}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => apply(action.command)}
          >
            <span className="material-icons text-xl" aria-hidden>
              {action.icon}
            </span>
          </button>
        ))}
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-[var(--card-secondary)]"
          aria-label="Link"
          onMouseDown={(event) => event.preventDefault()}
          onClick={addLink}
        >
          <span className="material-icons text-xl" aria-hidden>
            link
          </span>
        </button>
      </div>
      <div
        ref={editorRef}
        className="post-rich-text min-h-36 px-3 py-2 text-base leading-relaxed outline-none"
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-label="Texto do post"
        suppressContentEditableWarning
        onInput={() => {
          const html = editorRef.current?.innerHTML ?? '';
          lastHtml.current = html;
          onChange(html);
        }}
      />
    </div>
  );
}
