import React, { useEffect, useRef } from 'react';
import { Bold, Italic, Underline, Link, Unlink, List, ListOrdered, Quote, RemoveFormatting } from 'lucide-react';
import { normalizeRichTextLink, sanitizeRichText } from '../../lib/richText';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFocus?: () => void;
}

const tools = [
  { command: 'bold', label: 'Bold', Icon: Bold },
  { command: 'italic', label: 'Italic', Icon: Italic },
  { command: 'underline', label: 'Underline', Icon: Underline },
  { command: 'insertUnorderedList', label: 'Bulleted list', Icon: List },
  { command: 'insertOrderedList', label: 'Numbered list', Icon: ListOrdered },
  { command: 'formatBlock', value: 'blockquote', label: 'Quote', Icon: Quote },
  { command: 'unlink', label: 'Remove link', Icon: Unlink },
  { command: 'removeFormat', label: 'Clear formatting', Icon: RemoveFormatting },
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, onFocus }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || document.activeElement === editor) return;
    const next = sanitizeRichText(value || '');
    if (editor.innerHTML !== next) editor.innerHTML = next;
  }, [value]);

  const emitChange = () => {
    if (editorRef.current) onChange(sanitizeRichText(editorRef.current.innerHTML));
  };

  const applyCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emitChange();
  };

  const addLink = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      window.alert('Highlight the text you want to link first.');
      return;
    }
    const rawUrl = window.prompt('Enter a page, email, phone, or website address:');
    if (rawUrl === null) return;
    const href = normalizeRichTextLink(rawUrl);
    if (!href) {
      window.alert('Enter a valid web address, /page path, #section, mailto:, or tel: link.');
      return;
    }
    applyCommand('createLink', href);
  };

  const toolButton = 'p-1.5 border border-[#2d2d38] text-[#c9c1b5] hover:border-[#c59b63] hover:text-[#f4e6d0] disabled:opacity-40';

  return (
    <div className="border border-[#242430] bg-[#09090d] focus-within:border-[#c59b63]">
      <div className="flex flex-wrap items-center gap-1 border-b border-[#242430] p-1.5" role="toolbar" aria-label="Text formatting">
        {tools.slice(0, 3).map(({ command, label, Icon }) => (
          <button key={command} type="button" title={label} aria-label={label} className={toolButton}
            onMouseDown={(event) => event.preventDefault()} onClick={() => applyCommand(command)}>
            <Icon className="h-3.5 w-3.5" />
          </button>
        ))}
        <button type="button" title="Add link" aria-label="Add link" className={toolButton}
          onMouseDown={(event) => event.preventDefault()} onClick={addLink}>
          <Link className="h-3.5 w-3.5" />
        </button>
        {tools.slice(3).map(({ command, value: commandValue, label, Icon }) => (
          <button key={`${command}-${label}`} type="button" title={label} aria-label={label} className={toolButton}
            onMouseDown={(event) => event.preventDefault()} onClick={() => applyCommand(command, commandValue)}>
            <Icon className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onFocus={onFocus}
        onInput={emitChange}
        onBlur={emitChange}
        className="min-h-[130px] p-2.5 text-xs text-[#f7f4ee] outline-none leading-relaxed font-sans [&:empty:before]:content-[attr(data-placeholder)] [&:empty:before]:text-[#6f6a64] [&_a]:text-[#d4af7a] [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-[#c59b63] [&_blockquote]:pl-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5"
      />
      <p className="border-t border-[#242430] px-2.5 py-1.5 text-[9px] text-[#8e877e]">
        Highlight text, then choose a format. Use the chain icon to add a link.
      </p>
    </div>
  );
};
