import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { NewsItem } from '../../types';
import { Button } from '../ui/Buttons';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';
import { Bell, Plus, Edit3, Trash2, Search, Calendar, Sparkles } from 'lucide-react';
import { ItemTypographyControls, resolveItemTypography } from './ItemTypographyControls';

interface NewsManagerProps {
  onOpenLiveBuilder?: (pageSlug: string) => void;
}

export const NewsManager: React.FC<NewsManagerProps> = ({ onOpenLiveBuilder }) => {
  const toast = useToast();
  const [news, setNews] = useState<NewsItem[]>(db.getNews(true));
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setNews(db.getNews(true));
    });
    return unsub;
  }, []);

  const handleOpenNew = () => {
    const fresh: NewsItem = {
      id: `news-${Date.now()}`,
      title: '',
      slug: '',
      category: 'Chamber Announcement',
      publishedDate: new Date().toISOString().split('T')[0],
      excerpt: '',
      content: '',
      status: 'published',
    };
    setEditingItem(fresh);
    setIsNew(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete news item "${title}"?`)) {
      db.deleteNews(id);
      toast.success('News Item Deleted');
    }
  };

  const filtered = news.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f1f28]">
        <div>
          <span className="font-cinzel text-[11px] font-semibold tracking-[0.2em] text-[#c59b63] uppercase block">
            Chamber Announcements
          </span>
          <h1 className="font-cormorant text-3xl sm:text-4xl font-light text-[#f7f4ee] mt-1">
            News &amp; Press Dispatches
          </h1>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenLiveBuilder && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onOpenLiveBuilder('news')}
              className="border-[#c59b63]/40 text-[#f4e6d0] hover:border-[#c59b63]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c59b63]" />
              <span>Live View Edit Page</span>
            </Button>
          )}

          <Button variant="primary" size="sm" onClick={handleOpenNew}>
            <Plus className="w-3.5 h-3.5" />
            <span>Publish Announcement</span>
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
            placeholder="Search dispatches..."
            className="w-full bg-[#14141a] border border-[#262633] focus:border-[#c59b63] pl-9 pr-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
          />
        </div>
        <span className="text-xs text-[#8e877e]">{filtered.length} Dispatches</span>
      </div>

      <div className="divide-y divide-[#1c1c24] border border-[#22222d] bg-[#121217]">
        {filtered.map((item) => {
          const titleTypo = resolveItemTypography(item.typography, 'title', {
            fontFamily: 'font-cinzel',
            fontSize: 'text-base',
            color: 'text-[#f7f4ee]',
          });
          const excerptTypo = resolveItemTypography(item.typography, 'desc', {
            fontFamily: 'font-sans',
            fontSize: 'text-xs',
            color: 'text-[#a8a199]',
          });

          return (
            <div
              key={item.id}
              className="p-5 hover:bg-[#16161f] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-cinzel text-[10px] text-[#c59b63] uppercase tracking-wider">
                    {item.category}
                  </span>
                  <span className="text-[#3a3a46]">·</span>
                  <span className="text-xs text-[#8e877e]">{item.publishedDate}</span>
                  {item.typography && Object.keys(item.typography).length > 0 && (
                    <span className="text-[9px] font-cinzel text-[#c59b63] bg-[#c59b63]/10 px-1.5 py-0.5 border border-[#c59b63]/30 uppercase tracking-wider">
                      Custom Typo
                    </span>
                  )}
                  <Badge variant={item.status === 'published' ? 'green' : 'charcoal'} size="sm">
                    {item.status}
                  </Badge>
                </div>

                <h3
                  style={titleTypo.customStyle}
                  className={`${titleTypo.fontClass} ${titleTypo.sizeClass} ${titleTypo.colorClass} font-semibold`}
                >
                  {item.title}
                </h3>
                <p
                  style={excerptTypo.customStyle}
                  className={`${excerptTypo.fontClass} ${excerptTypo.sizeClass} ${excerptTypo.colorClass} line-clamp-1`}
                >
                  {item.excerpt}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="gold-outline"
                  size="sm"
                  onClick={() => {
                    setEditingItem(item);
                    setIsNew(false);
                  }}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </Button>
                <button
                  onClick={() => handleDelete(item.id, item.title)}
                  className="p-2 text-rose-500/70 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Delete Announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editingItem && (
        <NewsEditModal
          item={editingItem}
          isNew={isNew}
          onClose={() => setEditingItem(null)}
          onSave={(saved) => {
            db.saveNews(saved);
            toast.success('News Dispatched', saved.title);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
};

const NewsEditModal: React.FC<{
  item: NewsItem;
  isNew: boolean;
  onClose: () => void;
  onSave: (news: NewsItem) => void;
}> = ({ item, isNew, onClose, onSave }) => {
  const [form, setForm] = useState<NewsItem>({ ...item });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const autoSlug =
      form.slug ||
      form.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    onSave({
      ...form,
      slug: autoSlug,
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isNew ? 'Create News Dispatch' : `Edit: ${item.title}`}
      subtitle="Publish official firm news, partner appointments, and press releases."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-left">
        <div>
          <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
            Dispatch Title *
          </label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
              Category
            </label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
              Date
            </label>
            <input
              type="date"
              value={form.publishedDate}
              onChange={(e) => setForm({ ...form, publishedDate: e.target.value })}
              className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
            Excerpt / Teaser
          </label>
          <textarea
            rows={2}
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            className="w-full bg-[#0d0d11] border border-[#2a2a35] p-2.5 text-xs text-[#f7f4ee] focus:outline-none"
          />
        </div>

        {/* Custom Typography Controls */}
        <ItemTypographyControls
          typography={form.typography}
          onChange={(newTypo) => setForm({ ...form, typography: newTypo })}
          fields={[
            { key: 'title', label: 'Dispatch Title', defaultFamily: 'cinzel', defaultSize: 'base', defaultColor: 'ivory' },
            { key: 'desc', label: 'Teaser / Card Text', defaultFamily: 'sans', defaultSize: 'xs', defaultColor: 'muted' },
            { key: 'body', label: 'Full Dispatch Text', defaultFamily: 'sans', defaultSize: 'xs', defaultColor: 'ivory' },
          ]}
          previewTitle={form.title || 'Press Dispatch Title Preview'}
          previewDesc={form.excerpt || 'Teaser text preview showing live typography styling...'}
        />

        <div>
          <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
            Full Press Dispatch Content
          </label>
          <textarea
            rows={6}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full bg-[#0d0d11] border border-[#2a2a35] p-2.5 text-xs text-[#f7f4ee] focus:outline-none leading-relaxed"
          />
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-[#22222d]">
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as any })}
            className="bg-[#0d0d11] border border-[#2a2a35] px-3 py-1.5 text-xs text-[#d4af7a]"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <div className="flex gap-3">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Dispatch
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
