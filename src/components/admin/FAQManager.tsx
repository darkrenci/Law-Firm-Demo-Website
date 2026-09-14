import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { FAQItem, FAQCategory } from '../../types';
import { Button } from '../ui/Buttons';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';
import { HelpCircle, Plus, Edit3, Trash2, Search, Sparkles } from 'lucide-react';
import { ItemTypographyControls, resolveItemTypography } from './ItemTypographyControls';

interface FAQManagerProps {
  onOpenLiveBuilder?: (pageSlug: string) => void;
}

export const FAQManager: React.FC<FAQManagerProps> = ({ onOpenLiveBuilder }) => {
  const toast = useToast();
  const [faqs, setFaqs] = useState<FAQItem[]>(db.getFAQs(true));
  const [categories, setCategories] = useState<FAQCategory[]>(db.getFAQCategories());
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setFaqs(db.getFAQs(true));
      setCategories(db.getFAQCategories());
    });
    return unsub;
  }, []);

  const handleOpenNew = () => {
    const fresh: FAQItem = {
      id: `faq-${Date.now()}`,
      categoryId: categories[0]?.id || 'cat-general',
      question: '',
      answer: '',
      order: faqs.length + 1,
      isPublished: true,
    };
    setEditingFaq(fresh);
    setIsNew(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this FAQ entry?')) {
      db.deleteFAQ(id);
      toast.success('FAQ Deleted');
    }
  };

  const filtered = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f1f28]">
        <div>
          <span className="font-cinzel text-[11px] font-semibold tracking-[0.2em] text-[#c59b63] uppercase block">
            Retainer Protocols &amp; Guidance
          </span>
          <h1 className="font-cormorant text-3xl sm:text-4xl font-light text-[#f7f4ee] mt-1">
            FAQ &amp; Client Knowledge Base
          </h1>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenLiveBuilder && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onOpenLiveBuilder('faqs')}
              className="border-[#c59b63]/40 text-[#f4e6d0] hover:border-[#c59b63]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c59b63]" />
              <span>Live View Edit Page</span>
            </Button>
          )}

          <Button variant="primary" size="sm" onClick={handleOpenNew}>
            <Plus className="w-3.5 h-3.5" />
            <span>Add FAQ Entry</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a837a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs..."
            className="w-full bg-[#14141a] border border-[#262633] focus:border-[#c59b63] pl-9 pr-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
          />
        </div>
        <span className="text-xs text-[#8e877e]">{filtered.length} FAQs</span>
      </div>

      <div className="divide-y divide-[#1c1c24] border border-[#22222d] bg-[#121217]">
        {filtered.map((item) => {
          const categoryName =
            categories.find((c) => c.id === item.categoryId)?.name || 'General';

          const questionTypo = resolveItemTypography(item.typography, 'title', {
            fontFamily: 'font-cinzel',
            fontSize: 'text-sm',
            color: 'text-[#f7f4ee]',
          });
          const answerTypo = resolveItemTypography(item.typography, 'desc', {
            fontFamily: 'font-sans',
            fontSize: 'text-xs',
            color: 'text-[#a8a199]',
          });

          return (
            <div
              key={item.id}
              className="p-5 hover:bg-[#16161f] transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            >
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="gold" size="sm">
                    {categoryName}
                  </Badge>
                  {item.typography && Object.keys(item.typography).length > 0 && (
                    <span className="text-[9px] font-cinzel text-[#c59b63] bg-[#c59b63]/10 px-1.5 py-0.5 border border-[#c59b63]/30 uppercase tracking-wider">
                      Custom Typo
                    </span>
                  )}
                  <Badge variant={item.isPublished ? 'green' : 'amber'} size="sm">
                    {item.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </div>

                <h3
                  style={questionTypo.customStyle}
                  className={`${questionTypo.fontClass} ${questionTypo.sizeClass} ${questionTypo.colorClass} font-semibold`}
                >
                  {item.question}
                </h3>
                <p
                  style={answerTypo.customStyle}
                  className={`${answerTypo.fontClass} ${answerTypo.sizeClass} ${answerTypo.colorClass} leading-relaxed line-clamp-2`}
                >
                  {item.answer}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="gold-outline"
                  size="sm"
                  onClick={() => {
                    setEditingFaq(item);
                    setIsNew(false);
                  }}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </Button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-rose-500/70 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Delete FAQ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editingFaq && (
        <FAQEditModal
          faq={editingFaq}
          categories={categories}
          isNew={isNew}
          onClose={() => setEditingFaq(null)}
          onSave={(saved) => {
            db.saveFAQ(saved);
            toast.success('FAQ Saved');
            setEditingFaq(null);
          }}
        />
      )}
    </div>
  );
};

const FAQEditModal: React.FC<{
  faq: FAQItem;
  categories: FAQCategory[];
  isNew: boolean;
  onClose: () => void;
  onSave: (f: FAQItem) => void;
}> = ({ faq, categories, isNew, onClose, onSave }) => {
  const [form, setForm] = useState<FAQItem>({ ...faq });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isNew ? 'Create FAQ Entry' : 'Edit FAQ'}
      subtitle="Define client-facing questions, authoritative explanations, and typography styling."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-left">
        <div>
          <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
            Category
          </label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
            Question *
          </label>
          <input
            type="text"
            required
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
            Authoritative Answer *
          </label>
          <textarea
            rows={4}
            required
            value={form.answer}
            onChange={(e) => setForm({ ...form, answer: e.target.value })}
            className="w-full bg-[#0d0d11] border border-[#2a2a35] p-2.5 text-xs text-[#f7f4ee] focus:outline-none leading-relaxed"
          />
        </div>

        {/* Custom Typography Controls */}
        <ItemTypographyControls
          typography={form.typography}
          onChange={(newTypo) => setForm({ ...form, typography: newTypo })}
          fields={[
            { key: 'title', label: 'Inquiry / Question Text', defaultFamily: 'cinzel', defaultSize: 'sm', defaultColor: 'ivory' },
            { key: 'desc', label: 'Authoritative Answer Text', defaultFamily: 'sans', defaultSize: 'xs', defaultColor: 'muted' },
          ]}
          previewTitle={form.question || 'How are retainer rates established?'}
          previewDesc={form.answer || 'Authoritative explanation preview showing live font size, family, and color styling...'}
        />

        <div className="pt-2 flex items-center justify-between border-t border-[#22222d]">
          <label className="flex items-center gap-2 text-xs text-[#f7f4ee] cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              className="accent-[#c59b63]"
            />
            <span>Published on website</span>
          </label>

          <div className="flex gap-3">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save FAQ
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
