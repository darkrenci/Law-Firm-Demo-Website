import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Article } from '../../types';
import { Button } from '../ui/Buttons';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { RichEditor } from '../ui/RichEditor';
import { useToast } from '../ui/Toast';
import { BookOpen, Plus, Edit3, Trash2, RotateCcw, Search, History, Sparkles } from 'lucide-react';
import { ItemTypographyControls, resolveItemTypography } from './ItemTypographyControls';
import { ImageUploadField } from '../ui/ImageUploadField';

interface ArticleManagerProps {
  onOpenLiveBuilder?: (pageSlug: string) => void;
}

export const ArticleManager: React.FC<ArticleManagerProps> = ({ onOpenLiveBuilder }) => {
  const toast = useToast();
  const [articles, setArticles] = useState<Article[]>(db.getArticles(true));
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [versionModalArticle, setVersionModalArticle] = useState<Article | null>(null);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setArticles(db.getArticles(true));
    });
    return unsub;
  }, []);

  const handleOpenNew = () => {
    const fresh: Article = {
      id: `art-${Date.now()}`,
      title: '',
      slug: '',
      category: 'Corporate Jurisprudence',
      excerpt: '',
      content: '## Executive Summary\n\nProvide legal context and analytical briefing.\n\n### Statutory Framework\n\nOutline relevant statutes, circulars, or judicial rulings.',
      authorName: db.getCurrentUser().name,
      readTime: '6 min read',
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'published',
      tags: ['Corporate Law', 'Philippine Bar'],
    };
    setEditingArticle(fresh);
    setIsNew(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete article "${title}"?`)) {
      db.deleteArticle(id);
      toast.success('Article Deleted');
    }
  };

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.authorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f1f28]">
        <div>
          <span className="font-cinzel text-[11px] font-semibold tracking-[0.2em] text-[#c59b63] uppercase block">
            Scholarly Commentary
          </span>
          <h1 className="font-cormorant text-3xl sm:text-4xl font-light text-[#f7f4ee] mt-1">
            Legal Insights &amp; Articles
          </h1>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenLiveBuilder && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onOpenLiveBuilder('insights')}
              className="border-[#c59b63]/40 text-[#f4e6d0] hover:border-[#c59b63]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c59b63]" />
              <span>Live View Edit Page</span>
            </Button>
          )}

          <Button variant="primary" size="sm" onClick={handleOpenNew}>
            <Plus className="w-3.5 h-3.5" />
            <span>Write Legal Insight</span>
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
            placeholder="Search articles by title, author, category..."
            className="w-full bg-[#14141a] border border-[#262633] focus:border-[#c59b63] pl-9 pr-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
          />
        </div>
        <span className="text-xs text-[#8e877e]">{filtered.length} Briefings</span>
      </div>

      <div className="divide-y divide-[#1c1c24] border border-[#22222d] bg-[#121217]">
        {filtered.map((art) => {
          const titleTypo = resolveItemTypography(art.typography, 'title', {
            fontFamily: 'font-cormorant',
            fontSize: 'text-2xl',
            color: 'text-[#f7f4ee]',
          });
          const excerptTypo = resolveItemTypography(art.typography, 'desc', {
            fontFamily: 'font-sans',
            fontSize: 'text-xs',
            color: 'text-[#a8a199]',
          });

          return (
            <div
              key={art.id}
              className="p-5 hover:bg-[#16161f] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-cinzel text-[10px] text-[#c59b63] uppercase tracking-wider">
                    {art.category}
                  </span>
                  <span className="text-[#3a3a46]">·</span>
                  <span className="text-xs text-[#8e877e]">{art.readTime}</span>
                  {art.typography && Object.keys(art.typography).length > 0 && (
                    <span className="text-[9px] font-cinzel text-[#c59b63] bg-[#c59b63]/10 px-1.5 py-0.5 border border-[#c59b63]/30 uppercase tracking-wider">
                      Custom Typo
                    </span>
                  )}
                  <Badge
                    variant={
                      art.status === 'published'
                        ? 'green'
                        : art.status === 'review'
                        ? 'amber'
                        : 'charcoal'
                    }
                    size="sm"
                  >
                    {art.status}
                  </Badge>
                </div>

                <h3
                  style={titleTypo.customStyle}
                  className={`${titleTypo.fontClass} ${titleTypo.sizeClass} ${titleTypo.colorClass} leading-snug`}
                >
                  {art.title}
                </h3>

                <p
                  style={excerptTypo.customStyle}
                  className={`${excerptTypo.fontClass} ${excerptTypo.sizeClass} ${excerptTypo.colorClass} line-clamp-1 max-w-2xl`}
                >
                  {art.excerpt}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-[#6e6860] pt-1">
                  <span>By {art.authorName}</span>
                  <span>·</span>
                  <span>Published {new Date(art.publishedAt).toLocaleDateString()}</span>
                  {art.versions && art.versions.length > 0 && (
                    <>
                      <span>·</span>
                      <button
                        onClick={() => setVersionModalArticle(art)}
                        className="text-[#c59b63] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <History className="w-3 h-3" />
                        <span>{art.versions.length} versions</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="gold-outline"
                  size="sm"
                  onClick={() => {
                    setEditingArticle(art);
                    setIsNew(false);
                  }}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Briefing</span>
                </Button>
                <button
                  onClick={() => handleDelete(art.id, art.title)}
                  className="p-2 text-rose-500/70 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Delete Article"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editingArticle && (
        <ArticleEditModal
          article={editingArticle}
          isNew={isNew}
          onClose={() => setEditingArticle(null)}
          onSave={(saved) => {
            db.saveArticle(saved);
            toast.success('Article Saved', saved.title);
            setEditingArticle(null);
          }}
        />
      )}

      {versionModalArticle && (
        <ArticleVersionModal
          article={versionModalArticle}
          onClose={() => setVersionModalArticle(null)}
          onRestore={(versionNum) => {
            db.restoreArticleVersion(versionModalArticle.id, versionNum);
            toast.success('Version Restored', `Rolled back to revision #${versionNum}`);
            setVersionModalArticle(null);
          }}
        />
      )}
    </div>
  );
};

const ArticleEditModal: React.FC<{
  article: Article;
  isNew: boolean;
  onClose: () => void;
  onSave: (art: Article) => void;
}> = ({ article, isNew, onClose, onSave }) => {
  const [form, setForm] = useState<Article>({ ...article });
  const [tagsStr, setTagsStr] = useState((article.tags || []).join(', '));

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
      tags: tagsStr
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isNew ? 'Author Legal Insight' : `Edit: ${article.title}`}
      subtitle="Scholarly publication editor with formatting tools and live preview."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-left">
        <div>
          <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
            Article Title *
          </label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
            >
              <option value="Corporate Jurisprudence">Corporate Jurisprudence</option>
              <option value="Constitutional Law">Constitutional Law</option>
              <option value="Arbitration & Dispute Resolution">Arbitration &amp; Dispute Resolution</option>
              <option value="Regulatory Circulars">Regulatory Circulars</option>
              <option value="Banking & Finance">Banking &amp; Finance</option>
            </select>
          </div>

          <div>
            <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
              Author
            </label>
            <input
              type="text"
              value={form.authorName}
              onChange={(e) => setForm({ ...form, authorName: e.target.value })}
              className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
              Estimated Read Time
            </label>
            <input
              type="text"
              value={form.readTime}
              onChange={(e) => setForm({ ...form, readTime: e.target.value })}
              placeholder="e.g. 7 min read"
              className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
            Executive Summary / Excerpt *
          </label>
          <textarea
            rows={2}
            required
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            className="w-full bg-[#0d0d11] border border-[#2a2a35] p-2.5 text-xs text-[#f7f4ee] focus:outline-none"
          />
        </div>

        <ImageUploadField
          label="Featured Article Header Image"
          value={form.featuredImage || ''}
          onChange={(img) => setForm({ ...form, featuredImage: img })}
          aspectRatio="landscape"
          helperText="Upload a picture file from your device to feature as the header banner."
        />

        {/* Custom Typography Controls */}
        <ItemTypographyControls
          typography={form.typography}
          onChange={(newTypo) => setForm({ ...form, typography: newTypo })}
          fields={[
            { key: 'title', label: 'Article Headline', defaultFamily: 'cormorant', defaultSize: '2xl', defaultColor: 'ivory' },
            { key: 'desc', label: 'Executive Excerpt', defaultFamily: 'sans', defaultSize: 'xs', defaultColor: 'muted' },
            { key: 'body', label: 'Briefing Body Typography', defaultFamily: 'sans', defaultSize: 'sm', defaultColor: 'ivory' },
          ]}
          previewTitle={form.title || 'Legal Briefing Headline Preview'}
          previewDesc={form.excerpt || 'Executive summary preview showing customized font size, family, and color styling...'}
        />

        {/* Rich Markdown Editor */}
        <RichEditor
          label="Full Legal Briefing Content (Markdown & Preview)"
          value={form.content}
          onChange={(val) => setForm({ ...form, content: val })}
          minHeight="min-h-[260px]"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="Corporate Law, Securities, Supreme Court"
              className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
              Publication Status
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as any })}
              className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
            >
              <option value="published">Published</option>
              <option value="review">Under Peer Review</option>
              <option value="draft">Internal Draft</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-[#22222d]">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Save Article
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const ArticleVersionModal: React.FC<{
  article: Article;
  onClose: () => void;
  onRestore: (verNum: number) => void;
}> = ({ article, onClose, onRestore }) => {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Revision History: ${article.title}`}
      subtitle="Review previous drafts and restore prior revisions."
      maxWidth="md"
    >
      <div className="space-y-3 pt-2 text-left">
        {!article.versions || article.versions.length === 0 ? (
          <p className="py-6 text-center text-xs text-[#8e877e]">No revision history recorded.</p>
        ) : (
          article.versions.map((ver) => (
            <div
              key={ver.versionNumber}
              className="bg-[#171720] border border-[#262633] p-3.5 flex items-center justify-between gap-4"
            >
              <div>
                <span className="font-cinzel text-xs font-semibold text-[#f4e6d0]">
                  Revision #{ver.versionNumber}
                </span>
                <p className="text-[11px] text-[#8e877e] mt-0.5">
                  Edited by {ver.editedBy} · {new Date(ver.editedAt).toLocaleString()}
                </p>
              </div>
              <Button
                variant="gold-outline"
                size="sm"
                onClick={() => onRestore(ver.versionNumber)}
              >
                <RotateCcw className="w-3 h-3" />
                <span>Rollback</span>
              </Button>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};
