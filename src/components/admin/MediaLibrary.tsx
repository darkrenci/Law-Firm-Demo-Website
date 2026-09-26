import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { MediaAsset } from '../../types';
import { Button } from '../ui/Buttons';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';
import { Image as ImageIcon, Plus, Trash2, Copy, Check, Search, ExternalLink, Upload, RefreshCw } from 'lucide-react';
import { ImageUploadField } from '../ui/ImageUploadField';
import { isSupabaseConfigured } from '../../lib/supabase';

export const MediaLibrary: React.FC = () => {
  const toast = useToast();
  const [media, setMedia] = useState<MediaAsset[]>(db.getMedia());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setMedia(db.getMedia());
    });
    return unsub;
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await db.refreshFromSupabase();
      setMedia(db.getMedia());
      toast.success('Media Library Synced', 'Updated with latest Supabase records.');
    } catch (e: any) {
      toast.error('Sync Error', e?.message || 'Failed to sync with Supabase');
    } finally {
      setIsSyncing(false);
    }
  };

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

  const filtered = media.filter((item) => {
    const matchesCat = filterCategory === 'all' || item.category === filterCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.altText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 text-left">
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

        <div className="flex items-center gap-2">
          {isSupabaseConfigured && (
            <Button variant="ghost" size="sm" onClick={handleManualSync} isLoading={isSyncing}>
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync Cloud</span>
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            <span>Add Media Asset</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a837a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search media assets..."
            className="w-full bg-[#14141a] border border-[#262633] focus:border-[#c59b63] pl-9 pr-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'portrait', 'architectural', 'branding'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 text-[11px] font-cinzel uppercase tracking-wider transition-colors cursor-pointer ${
                filterCategory === cat
                  ? 'bg-[#c59b63] text-[#0d0d11] font-bold'
                  : 'bg-[#15151c] text-[#a8a199] hover:text-[#f7f4ee]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Media Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-[#121217] border border-[#22222d] hover:border-[#c59b63]/60 overflow-hidden flex flex-col justify-between group"
          >
            <div className="aspect-video sm:aspect-square bg-[#0a0a0d] relative overflow-hidden flex items-center justify-center">
              <img
                src={item.url}
                alt={item.altText}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (item.url.includes('group')) {
                    target.src = '/assets/group-picture.svg';
                  } else if (item.url.includes('levy')) {
                    target.src = '/assets/atty-levy-lalusis.svg';
                  } else if (item.url.includes('diosdado')) {
                    target.src = '/assets/atty-diosdado-lalusis.svg';
                  } else if (item.url.includes('leo')) {
                    target.src = '/assets/atty-leo-lalusis.svg';
                  } else {
                    target.src = '/assets/attorney-placeholder.svg';
                  }
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-2 right-2">
                <Badge variant="charcoal" size="sm">
                  {item.category}
                </Badge>
              </span>
            </div>

            <div className="p-3.5 space-y-2">
              <p className="font-cinzel text-xs font-semibold text-[#f7f4ee] truncate">
                {item.name}
              </p>
              <p className="text-[10px] text-[#7e776e] truncate font-mono">{item.altText}</p>

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
    </div>
  );
};

const AddMediaModal: React.FC<{
  onClose: () => void;
  onAdd: (asset: Omit<MediaAsset, 'id' | 'uploadedAt'>) => void;
}> = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<'portrait' | 'architectural' | 'branding' | 'general'>(
    'architectural'
  );
  const [altText, setAltText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      return;
    }
    onAdd({
      name: name.trim() || 'Visual Asset',
      url,
      category,
      altText: altText || name || 'Chamber media asset',
      size: url.startsWith('data:') ? 'uploaded-file' : 'web-optimized',
    });
  };

  const handleImageUploaded = (imageUrl: string, fileName?: string) => {
    setUrl(imageUrl);
    if (fileName && !name) {
      // Clean fileName: replace dashes/underscores with spaces and remove extension
      const cleaned = fileName
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]+/g, ' ')
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
        {/* Direct Picture File Upload */}
        <ImageUploadField
          label="Picture File *"
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
            placeholder="e.g. Future Point Plaza Chambers Suite"
            className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
          >
            <option value="architectural">Architectural &amp; Office</option>
            <option value="portrait">Attorney Portraits</option>
            <option value="branding">Branding &amp; Insignia</option>
            <option value="general">General Media</option>
          </select>
        </div>

        <div>
          <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
            Accessibility Alt Text
          </label>
          <input
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Description of visual asset..."
            className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-[#22222d]">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={!url}>
            Save Asset
          </Button>
        </div>
      </form>
    </Modal>
  );
};
