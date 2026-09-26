import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { MediaAsset } from '../../types';
import { Button } from '../ui/Buttons';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Copy,
  Check,
  Search,
  ExternalLink,
  Upload,
  Pencil,
} from 'lucide-react';
import { ImageUploadField } from '../ui/ImageUploadField';
import { isSupabaseConfigured } from '../../lib/supabase';

export const MediaLibrary: React.FC = () => {
  const toast = useToast();
  const [media, setMedia] = useState<MediaAsset[]>(db.getMedia());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaAsset | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    // Automatically fetch latest cloud records and adapt names without manual clicks
    db.refreshFromSupabase();
    setMedia(db.getMedia());

    const unsub = db.subscribe(() => {
      setMedia(db.getMedia());
    });
    return unsub;
  }, []);

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Asset URL Copied to Clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Remove media asset "${name}"?`)) {
      db.deleteMedia(id);
      toast.success('Media Asset Removed');
    }
  };

  const handleSaveEdit = (updatedItem: MediaAsset) => {
    db.saveMedia(updatedItem);
    toast.success('Media Asset Updated', updatedItem.name);
    setEditingItem(null);
  };

  const filtered = media.filter((item) => {
    const matchesCat = filterCategory === 'all' || item.category === filterCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.altText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f1f28]">
        <div>
          <span className="font-cinzel text-[11px] font-semibold tracking-[0.2em] text-[#c59b63] uppercase block">
            Visual Assets &amp; Media Repository
          </span>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <h1 className="font-cormorant text-3xl sm:text-4xl font-light text-[#f7f4ee]">
              Media Library
            </h1>
            {isSupabaseConfigured ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Supabase Storage Synced
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono bg-amber-950/60 border border-amber-500/40 text-[#c59b63]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Local Fallback Mode
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            <span>Add Media Asset</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e6860]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search media assets..."
            className="w-full bg-[#121217] border border-[#262633] pl-10 pr-4 py-2 text-xs text-[#f7f4ee] focus:outline-none focus:border-[#c59b63]"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'portrait', 'architectural', 'branding'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 text-xs font-cinzel uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                filterCategory === cat
                  ? 'bg-[#c59b63] text-[#0d0d11] font-semibold'
                  : 'bg-[#14141c] text-[#a8a199] hover:bg-[#1b1b26]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-[#121217] border border-[#20202b] hover:border-[#c59b63]/50 transition-all flex flex-col group overflow-hidden"
          >
            <div className="aspect-[4/3] bg-[#0a0a0d] relative overflow-hidden flex items-center justify-center">
              <img
                src={item.url}
                alt={item.altText || item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="absolute top-2 right-2">
                <Badge variant="charcoal" size="sm">
                  {item.category}
                </Badge>
              </span>
            </div>

            <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <p className="font-cinzel text-xs font-semibold text-[#f7f4ee] truncate" title={item.name}>
                  {item.name}
                </p>
                <p className="text-[10px] text-[#7e776e] truncate font-mono">{item.altText || item.name}</p>
              </div>

              <div className="pt-2 border-t border-[#1c1c24] flex items-center justify-between">
                <button
                  onClick={() => handleCopy(item.url, item.id)}
                  className="flex items-center gap-1 text-[10px] font-cinzel uppercase text-[#c59b63] hover:text-[#f7f4ee] cursor-pointer"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="text-[#a8a199] hover:text-[#c59b63] p-1 cursor-pointer"
                    title="Edit Name & Category"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="text-rose-500/70 hover:text-rose-400 p-1 cursor-pointer"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isAddOpen && (
        <AddMediaModal
          onClose={() => setIsAddOpen(false)}
          onAdd={(asset) => {
            db.addMedia(asset);
            toast.success('Media Asset Added', asset.name);
            setIsAddOpen(false);
          }}
        />
      )}

      {editingItem && (
        <EditMediaModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

const AddMediaModal: React.FC<{
  onClose: () => void;
  onAdd: (asset: Omit<MediaAsset, 'id' | 'uploadedAt'> & { id?: string }) => void;
}> = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [uploadedMediaId, setUploadedMediaId] = useState<string | null>(null);
  const [category, setCategory] = useState<'portrait' | 'architectural' | 'branding' | 'general'>(
    'branding'
  );
  const [altText, setAltText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      return;
    }
    onAdd({
      id: uploadedMediaId || undefined,
      name: name.trim() || 'Visual Asset',
      url,
      category,
      altText: altText || name || 'Chamber media asset',
      size: url.startsWith('data:') ? 'uploaded-file' : 'web-optimized',
    });
  };

  const handleImageUploaded = (imageUrl: string, fileName?: string, mediaId?: string) => {
    setUrl(imageUrl);
    if (mediaId) {
      setUploadedMediaId(mediaId);
    }
    if (fileName && (!name || name === 'Picture File *' || name === 'Visual Asset')) {
      const cleaned = fileName
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .trim()
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setName(cleaned);
      if (!altText) {
        setAltText(cleaned);
      }
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Add Media Asset"
      subtitle="Upload a picture file from your device (PNG, JPG, WEBP, SVG) or link an external visual asset."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-left">
        <ImageUploadField
          label="Upload Picture File"
          value={url}
          onChange={handleImageUploaded}
          required={true}
          allowMediaLibrary={false}
          aspectRatio="landscape"
          helperText="Upload any picture file directly from your computer or drag & drop here."
        />

        <div>
          <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
            Asset Title *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Atty. Levy John L.V. Lalusis – Founding Partner"
            className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none focus:border-[#c59b63]"
          />
        </div>

        <div>
          <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none focus:border-[#c59b63]"
          >
            <option value="branding">Branding &amp; Institutional</option>
            <option value="portrait">Partner Portrait</option>
            <option value="architectural">Offices &amp; Architectural</option>
            <option value="general">General Media</option>
          </select>
        </div>

        <div>
          <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
            Alt Text Description
          </label>
          <input
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Descriptive text for accessibility & SEO..."
            className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none focus:border-[#c59b63]"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1c1c24]">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={!url || !name}>
            Save to Media Library
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const EditMediaModal: React.FC<{
  item: MediaAsset;
  onClose: () => void;
  onSave: (updated: MediaAsset) => void;
}> = ({ item, onClose, onSave }) => {
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState<'portrait' | 'architectural' | 'branding' | 'general'>(
    (item.category as any) || 'branding'
  );
  const [altText, setAltText] = useState(item.altText || item.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...item,
      name: name.trim() || 'Visual Asset',
      category,
      altText: altText.trim() || name.trim(),
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Edit Media Asset Details"
      subtitle="Update the title, category, and SEO alt text for this asset across all devices."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-left">
        {/* Preview */}
        <div className="aspect-[16/9] max-h-48 bg-[#0a0a0d] border border-[#242433] overflow-hidden flex items-center justify-center">
          <img src={item.url} alt={name} className="w-full h-full object-contain" />
        </div>

        <div>
          <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
            Asset Title *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Atty. Levy John L.V. Lalusis – Founding Partner"
            className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none focus:border-[#c59b63]"
          />
        </div>

        <div>
          <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none focus:border-[#c59b63]"
          >
            <option value="branding">Branding &amp; Institutional</option>
            <option value="portrait">Partner Portrait</option>
            <option value="architectural">Offices &amp; Architectural</option>
            <option value="general">General Media</option>
          </select>
        </div>

        <div>
          <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
            Alt Text Description
          </label>
          <input
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Descriptive alt text for accessibility..."
            className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none focus:border-[#c59b63]"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1c1c24]">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={!name.trim()}>
            Save Changes to Cloud
          </Button>
        </div>
      </form>
    </Modal>
  );
};
