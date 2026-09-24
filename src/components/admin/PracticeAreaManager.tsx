import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { PracticeArea } from '../../types';
import { Button } from '../ui/Buttons';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';
import { Scale, Plus, Edit3, Trash2, Search, Sparkles, Layout } from 'lucide-react';
import { ItemTypographyControls, resolveItemTypography } from './ItemTypographyControls';
import { ImageUploadField } from '../ui/ImageUploadField';

interface PracticeAreaManagerProps {
  onOpenLiveBuilder?: (pageSlug: string) => void;
}

export const PracticeAreaManager: React.FC<PracticeAreaManagerProps> = ({ onOpenLiveBuilder }) => {
  const toast = useToast();
  const [practices, setPractices] = useState<PracticeArea[]>(db.getPracticeAreas(true));
  const [editingArea, setEditingArea] = useState<PracticeArea | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setPractices(db.getPracticeAreas(true));
    });
    return unsub;
  }, []);

  const handleOpenNew = () => {
    const fresh: PracticeArea = {
      id: `pa-${Date.now()}`,
      title: '',
      slug: '',
      shortDescription: '',
      detailedDescription: '',
      icon: 'Scale',
      keyServices: [],
      order: practices.length + 1,
      status: 'published',
    };
    setEditingArea(fresh);
    setIsNew(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete practice area "${title}"?`)) {
      db.deletePracticeArea(id);
      toast.success('Practice Area Deleted');
    }
  };

  const handleToggleStatus = (pa: PracticeArea) => {
    const nextStatus = pa.status === 'published' ? 'draft' : 'published';
    db.savePracticeArea({ ...pa, status: nextStatus });
    toast.info('Status Changed', `${pa.title} marked as ${nextStatus}`);
  };

  const filtered = practices.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f1f28]">
        <div>
          <span className="font-cinzel text-[11px] font-semibold tracking-[0.2em] text-[#c59b63] uppercase block">
            Core Disciplines
          </span>
          <h1 className="font-cormorant text-3xl sm:text-4xl font-light text-[#f7f4ee] mt-1">
            Practice Areas Management
          </h1>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenLiveBuilder && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onOpenLiveBuilder('practice-areas')}
              className="border-[#c59b63]/40 text-[#f4e6d0] hover:border-[#c59b63]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c59b63]" />
              <span>Live View Edit Page</span>
            </Button>
          )}

          <Button variant="primary" size="sm" onClick={handleOpenNew}>
            <Plus className="w-3.5 h-3.5" />
            <span>Add Practice Area</span>
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
            placeholder="Search disciplines..."
            className="w-full bg-[#14141a] border border-[#262633] focus:border-[#c59b63] pl-9 pr-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
          />
        </div>
        <span className="text-xs text-[#8e877e]">{filtered.length} Disciplines</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((area) => {
          const titleTypo = resolveItemTypography(area.typography, 'title', {
            fontFamily: 'font-cinzel',
            fontSize: 'text-base',
            color: 'text-[#f7f4ee]',
          });
          const descTypo = resolveItemTypography(area.typography, 'desc', {
            fontFamily: 'font-sans',
            fontSize: 'text-xs',
            color: 'text-[#a8a199]',
          });

          return (
            <div
              key={area.id}
              className="bg-[#121217] border border-[#22222d] hover:border-[#c59b63]/60 p-6 flex flex-col justify-between space-y-4 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 bg-[#181822] border border-[#2c2c3b] flex items-center justify-center text-[#c59b63]">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {area.typography && Object.keys(area.typography).length > 0 && (
                      <span className="text-[9px] font-cinzel text-[#c59b63] bg-[#c59b63]/10 px-1.5 py-0.5 border border-[#c59b63]/30 uppercase tracking-wider">
                        Custom Typo
                      </span>
                    )}
                    <Badge variant={area.status === 'published' ? 'green' : 'amber'} size="sm">
                      {area.status}
                    </Badge>
                  </div>
                </div>

                <h3
                  style={titleTypo.customStyle}
                  className={`${titleTypo.fontClass} ${titleTypo.sizeClass} ${titleTypo.colorClass} font-semibold`}
                >
                  {area.title}
                </h3>
                <p
                  style={descTypo.customStyle}
                  className={`${descTypo.fontClass} ${descTypo.sizeClass} ${descTypo.colorClass} leading-relaxed line-clamp-3`}
                >
                  {area.shortDescription}
                </p>

                {area.keyServices && area.keyServices.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] font-cinzel text-[#c59b63] uppercase tracking-wider block mb-1">
                      {area.keyServices.length} Key Services Defined
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#1c1c24] flex items-center justify-between">
                <button
                  onClick={() => handleToggleStatus(area)}
                  className="text-[11px] font-cinzel uppercase text-[#8e877e] hover:text-[#f7f4ee] cursor-pointer"
                >
                  {area.status === 'published' ? 'Deactivate' : 'Publish'}
                </button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="gold-outline"
                    size="sm"
                    onClick={() => {
                      setEditingArea(area);
                      setIsNew(false);
                    }}
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </Button>
                  <button
                    onClick={() => handleDelete(area.id, area.title)}
                    className="p-1.5 text-rose-500/70 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete Area"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editingArea && (
        <PracticeEditModal
          area={editingArea}
          isNew={isNew}
          onClose={() => setEditingArea(null)}
          onSave={(saved) => {
            db.savePracticeArea(saved);
            toast.success('Practice Area Saved', saved.title);
            setEditingArea(null);
          }}
        />
      )}
    </div>
  );
};

const PracticeEditModal: React.FC<{
  area: PracticeArea;
  isNew: boolean;
  onClose: () => void;
  onSave: (pa: PracticeArea) => void;
}> = ({ area, isNew, onClose, onSave }) => {
  const [form, setForm] = useState<PracticeArea>({ ...area });
  const [servicesStr, setServicesStr] = useState((area.keyServices || []).join('\n'));

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
      keyServices: servicesStr.split('\n').filter((s) => s.trim()),
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isNew ? 'Create Practice Area' : `Edit: ${area.title}`}
      subtitle="Define practice area overview, typography & styling, detailed scope, and services breakdown."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-2 text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
              Discipline Title *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
              URL Slug
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="e.g. corporate-mergers-acquisitions"
              className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
            Short Summary (Cards &amp; Previews) *
          </label>
          <textarea
            rows={2}
            required
            value={form.shortDescription}
            onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
            className="w-full bg-[#0d0d11] border border-[#2a2a35] p-2.5 text-xs text-[#f7f4ee] focus:outline-none"
          />
        </div>

        <ImageUploadField
          label="Practice Group Hero / Cover Image"
          value={form.featuredImage || ''}
          onChange={(img) => setForm({ ...form, featuredImage: img })}
          aspectRatio="landscape"
          helperText="Upload an architectural or practice area cover image from your device."
        />

        {/* Custom Typography & Colors Customization */}
        <ItemTypographyControls
          typography={form.typography}
          onChange={(newTypo) => setForm({ ...form, typography: newTypo })}
          fields={[
            { key: 'title', label: 'Discipline Title', defaultFamily: 'cinzel', defaultSize: 'base', defaultColor: 'ivory' },
            { key: 'desc', label: 'Summary / Card Text', defaultFamily: 'sans', defaultSize: 'xs', defaultColor: 'muted' },
            { key: 'body', label: 'Scope / Body Text', defaultFamily: 'sans', defaultSize: 'xs', defaultColor: 'muted' },
          ]}
          previewTitle={form.title || 'Discipline Title Preview'}
          previewDesc={form.shortDescription || 'Short summary preview showing live font size, family, and color styling...'}
        />

        <div>
          <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
            Detailed Practice Scope &amp; Legal Framework
          </label>
          <textarea
            rows={5}
            value={form.detailedDescription}
            onChange={(e) => setForm({ ...form, detailedDescription: e.target.value })}
            className="w-full bg-[#0d0d11] border border-[#2a2a35] p-2.5 text-xs text-[#f7f4ee] focus:outline-none leading-relaxed"
          />
        </div>

        <div>
          <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
            Specific Key Services (1 per line)
          </label>
          <textarea
            rows={4}
            value={servicesStr}
            onChange={(e) => setServicesStr(e.target.value)}
            placeholder="e.g. Cross-Border Due Diligence&#10;SEC Compliance Filings&#10;Joint Venture Structuring"
            className="w-full bg-[#0d0d11] border border-[#2a2a35] p-2.5 text-xs text-[#f7f4ee] focus:outline-none"
          />
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-[#22222d]">
          <div className="flex items-center gap-4">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as any })}
              className="bg-[#0d0d11] border border-[#2a2a35] px-3 py-1.5 text-xs text-[#d4af7a]"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Practice Area
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
