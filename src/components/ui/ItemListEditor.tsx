import React, { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, ListPlus } from 'lucide-react';

interface ItemListEditorProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  helperText?: string;
}

export const ItemListEditor: React.FC<ItemListEditorProps> = ({
  label,
  items = [],
  onChange,
  placeholder = 'Add new entry...',
  helperText,
}) => {
  const [newInput, setNewInput] = useState('');

  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newInput.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setNewInput('');
  };

  const handleUpdateItem = (index: number, value: string) => {
    const updated = [...items];
    updated[index] = value;
    onChange(updated);
  };

  const handleDeleteItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...items];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const updated = [...items];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  return (
    <div className="bg-[#101016] border border-[#232332] p-3 sm:p-3.5 space-y-3">
      {/* Header with Title and Item Count Badge */}
      <div className="flex items-center justify-between border-b border-[#1f1f2c] pb-2">
        <div>
          <label className="font-cinzel text-xs font-semibold tracking-wider text-[#d4af7a] uppercase block">
            {label}
          </label>
          {helperText && (
            <p className="text-[10px] text-[#8e877e] mt-0.5">{helperText}</p>
          )}
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 bg-[#181822] text-[#c59b63] border border-[#2d2d3d] uppercase">
          {items.length} {items.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {/* List of Current Items */}
      {items.length === 0 ? (
        <div className="py-3 px-2 border border-dashed border-[#232332] text-center bg-[#0a0a0e]/40">
          <p className="text-[11px] text-[#7a746d] italic">No entries yet. Use the field below to add.</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {items.map((item, index) => (
            <div
              key={index}
              className="group flex items-start gap-1.5 p-1.5 bg-[#0a0a0f] border border-[#1e1e2a] hover:border-[#38384a] transition-colors"
            >
              {/* Order index */}
              <span className="text-[10px] font-mono text-[#6e6860] pt-1.5 w-5 text-center shrink-0">
                {index + 1}.
              </span>

              {/* Editable Input for Update */}
              <textarea
                rows={1}
                value={item}
                onChange={(e) => handleUpdateItem(index, e.target.value)}
                placeholder="Entry detail..."
                className="flex-1 bg-transparent border-none text-xs text-[#f7f4ee] focus:outline-none focus:bg-[#13131c] px-1.5 py-1 resize-y min-h-[28px] leading-relaxed"
              />

              {/* Actions: Reorder & Delete */}
              <div className="flex items-center gap-0.5 shrink-0 pt-0.5">
                <button
                  type="button"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  title="Move up"
                  className="p-1 text-[#6e6860] hover:text-[#d4af7a] disabled:opacity-20 disabled:hover:text-[#6e6860] cursor-pointer"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === items.length - 1}
                  title="Move down"
                  className="p-1 text-[#6e6860] hover:text-[#d4af7a] disabled:opacity-20 disabled:hover:text-[#6e6860] cursor-pointer"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(index)}
                  title="Delete entry"
                  className="p-1 text-[#6e6860] hover:text-rose-400 cursor-pointer ml-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Item Form */}
      <form onSubmit={handleAddItem} className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={newInput}
          onChange={(e) => setNewInput(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-[#09090d] border border-[#282838] focus:border-[#c59b63] px-2.5 py-1.5 text-xs text-[#f7f4ee] focus:outline-none placeholder-[#5a544c]"
        />
        <button
          type="submit"
          disabled={!newInput.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171722] hover:bg-[#20202e] border border-[#c59b63]/50 hover:border-[#c59b63] text-[#c59b63] hover:text-[#f7f4ee] text-xs font-cinzel font-semibold uppercase tracking-wider disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </form>
    </div>
  );
};
