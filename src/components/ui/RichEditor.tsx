import React, { useState } from 'react';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  List,
  Link,
  Code,
  Eye,
  Edit3,
} from 'lucide-react';

interface RichEditorProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
  minHeight?: string;
}

export const RichEditor: React.FC<RichEditorProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Write content here (Markdown supported)...',
  minHeight = 'min-h-[220px]',
}) => {
  const [isPreview, setIsPreview] = useState(false);

  const insertSnippet = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('rich-editor-ta') as HTMLTextAreaElement | null;
    if (!textarea) {
      onChange(value + prefix + suffix);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end) || 'text';
    const updated = value.substring(0, start) + prefix + selected + suffix + value.substring(end);
    onChange(updated);
  };

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block font-cinzel text-[11px] font-semibold tracking-[0.15em] text-[#d4af7a] uppercase">
            {label}
          </label>
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-1 text-[11px] text-[#c59b63] hover:text-[#f7f4ee] transition-colors cursor-pointer"
          >
            {isPreview ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isPreview ? 'Switch to Editor' : 'Preview Format'}</span>
          </button>
        </div>
      )}

      {/* Editor Toolbar */}
      {!isPreview && (
        <div className="flex items-center gap-1 p-1.5 bg-[#17171e] border border-[#2a2a35] border-b-0 text-[#a8a199]">
          <button
            type="button"
            onClick={() => insertSnippet('**', '**')}
            title="Bold"
            className="p-1 hover:bg-[#252530] hover:text-[#f7f4ee] rounded transition-colors cursor-pointer"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('*', '*')}
            title="Italic"
            className="p-1 hover:bg-[#252530] hover:text-[#f7f4ee] rounded transition-colors cursor-pointer"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <div className="h-4 w-[1px] bg-[#2a2a35] mx-1" />
          <button
            type="button"
            onClick={() => insertSnippet('## ')}
            title="Heading 2"
            className="p-1 hover:bg-[#252530] hover:text-[#f7f4ee] rounded transition-colors cursor-pointer text-xs font-serif"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('### ')}
            title="Heading 3"
            className="p-1 hover:bg-[#252530] hover:text-[#f7f4ee] rounded transition-colors cursor-pointer text-xs font-serif"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>
          <div className="h-4 w-[1px] bg-[#2a2a35] mx-1" />
          <button
            type="button"
            onClick={() => insertSnippet('> ')}
            title="Blockquote"
            className="p-1 hover:bg-[#252530] hover:text-[#f7f4ee] rounded transition-colors cursor-pointer"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('- ')}
            title="Bullet List"
            className="p-1 hover:bg-[#252530] hover:text-[#f7f4ee] rounded transition-colors cursor-pointer"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('[', '](https://example.com)')}
            title="Link"
            className="p-1 hover:bg-[#252530] hover:text-[#f7f4ee] rounded transition-colors cursor-pointer"
          >
            <Link className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('`', '`')}
            title="Code"
            className="p-1 hover:bg-[#252530] hover:text-[#f7f4ee] rounded transition-colors cursor-pointer"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Editor Content Area */}
      {isPreview ? (
        <div
          className={`w-full bg-[#0e0e12] border border-[#2a2a35] p-4 text-sm text-[#e6dfd5] ${minHeight} overflow-y-auto leading-relaxed space-y-3`}
        >
          {value ? (
            value.split('\n\n').map((paragraph, idx) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={idx} className="font-cinzel text-lg font-medium text-[#f4e6d0] pt-2">
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={idx} className="font-cinzel text-base font-medium text-[#c59b63] pt-1">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('> ')) {
                return (
                  <blockquote
                    key={idx}
                    className="border-l-2 border-[#c59b63] pl-4 italic text-[#c5beaf] bg-[#17171d]/60 py-2"
                  >
                    {paragraph.replace('> ', '')}
                  </blockquote>
                );
              }
              if (paragraph.startsWith('- ')) {
                return (
                  <ul key={idx} className="list-disc list-inside space-y-1 pl-2 text-[#d4cebe]">
                    {paragraph.split('\n').map((line, liIdx) => (
                      <li key={liIdx}>{line.replace(/^- /, '')}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={idx} className="text-[#d8cebe] leading-relaxed">
                  {paragraph}
                </p>
              );
            })
          ) : (
            <p className="text-[#605a52] italic">No content to preview.</p>
          )}
        </div>
      ) : (
        <textarea
          id="rich-editor-ta"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-[#121216] border border-[#2a2a35] focus:border-[#c59b63] p-4 text-sm text-[#f7f4ee] placeholder:text-[#6e6860] focus:outline-none focus:ring-1 focus:ring-[#c59b63]/50 transition-colors font-mono text-[13px] ${minHeight}`}
        />
      )}
    </div>
  );
};
