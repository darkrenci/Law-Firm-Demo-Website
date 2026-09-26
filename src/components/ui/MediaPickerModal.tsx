import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../services/db';
import { MediaAsset } from '../../types';
import {
  FolderOpen,
  Search,
  Upload,
  Check,
  X,
  Image as ImageIcon,
  Sparkles,
  Filter,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { Button } from './Buttons';
import { processImageFile } from './ImageUploadField';
import { isSupabaseConfigured } from '../../lib/supabase';
import { supabaseService } from '../../services/supabaseService';

export interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, name?: string, id?: string) => void;
  currentValue?: string;
  title?: string;
  subtitle?: string;
  placementLabel?: string;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentValue = '',
  title = 'Select from Chambers Media Library',
  subtitle = 'Choose a high-resolution portrait or firm visual asset from the library, or upload a new file.',
  placementLabel,
}) => {
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Load media assets
    const list = db.getMedia();
    setMediaList(list);

    // If current value matches an existing asset, highlight it
    if (currentValue) {
      const match = list.find((m) => m.url === currentValue || (m.dataUrl && m.dataUrl === currentValue));
      if (match) {
        setSelectedAsset(match);
      } else {
        setSelectedAsset(null);
      }
    } else {
      setSelectedAsset(null);
    }

    setUploadError(null);
    setSearchQuery('');
  }, [isOpen, currentValue]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter media items
  const filtered = mediaList.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.altText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat =
      categoryFilter === 'all' ||
      (categoryFilter === 'portrait' && (item.category === 'portrait' || item.category === 'portraits' || item.category === 'attorneys')) ||
      (categoryFilter === 'branding' && item.category === 'branding') ||
      (categoryFilter === 'offices' && (item.category === 'offices' || item.category === 'architectural')) ||
      (categoryFilter === 'insights' && (item.category === 'insights' || item.category === 'general'));

    return matchesSearch && matchesCat;
  });

  const handleConfirmSelect = () => {
    if (selectedAsset) {
      onSelect(selectedAsset.url, selectedAsset.name, selectedAsset.id);
      onClose();
    }
  };

  const handleCardDoubleClick = (asset: MediaAsset) => {
    onSelect(asset.url, asset.name, asset.id);
    onClose();
  };

  const handleUploadNewFile = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsUploading(true);
    setUploadError(null);

    try {
      const cleaned = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .trim()
        .replace(/\b\w/g, (c) => c.toUpperCase());

      // 1. Process to safe base64 Data URL first
      const processed = await processImageFile(file);

      let finalUrl = processed.dataUrl;
      let finalMediaId = `med-${Date.now()}`;

      // 2. If Supabase is configured, attempt upload
      if (isSupabaseConfigured) {
        try {
          const result = await supabaseService.uploadMediaFile(file, {
            customName: cleaned,
          });

          // Test if public URL loads
          await new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              finalUrl = result.url;
              finalMediaId = result.mediaItem.id;
              resolve();
            };
            img.onerror = () => {
              console.warn('Supabase public URL failed to load in browser, utilizing Data URL fallback');
              resolve(); // fallback remains processed.dataUrl
            };
            img.src = result.url;
          });
        } catch (supErr: any) {
          console.warn('Supabase upload warning:', supErr);
          // Keep processed.dataUrl as seamless fallback
        }
      }

      // Add to local database
      const newMedia = db.addMedia({
        id: finalMediaId,
        name: cleaned,
        url: finalUrl,
        dataUrl: processed.dataUrl,
        fileType: 'image',
        format: file.name.split('.').pop()?.toUpperCase() || 'JPG',
        sizeBytes: file.size,
        size: `${(file.size / 1024).toFixed(0)} KB`,
        category: placementLabel?.includes('Partner') || placementLabel?.includes('Card') ? 'portrait' : 'branding',
        altText: cleaned,
      });

      // Update local list
      const updatedList = db.getMedia();
      setMediaList(updatedList);
      setSelectedAsset(newMedia);

      // Auto-select and close or leave selected
      onSelect(finalUrl, cleaned, finalMediaId);
      onClose();
    } catch (err: any) {
      console.error('Upload error in MediaPickerModal:', err);
      setUploadError(err?.message || 'Failed to upload photo file. Please try another file format.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      {/* Click backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#0c0c10] border border-[#c59b63]/60 shadow-[0_0_60px_rgba(0,0,0,0.9)] z-10 flex flex-col text-left overflow-hidden">
        {/* Hidden Native File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          onChange={(e) => handleUploadNewFile(e.target.files)}
          className="hidden"
        />

        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#121218] border-b border-[#242432] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-none bg-[#c59b63]/15 border border-[#c59b63]/40 flex items-center justify-center text-[#c59b63]">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-cormorant text-2xl text-[#f7f4ee] font-medium leading-none">
                  {title}
                </h3>
                {placementLabel && (
                  <span className="px-2 py-0.5 text-[9px] font-cinzel font-semibold tracking-wider uppercase bg-[#c59b63]/20 text-[#c59b63] border border-[#c59b63]/40">
                    For: {placementLabel}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#8e877e] mt-1 line-clamp-1">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3.5 py-1.5 bg-[#c59b63] text-[#0a0a0d] hover:bg-[#d4af7a] font-cinzel text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Uploading...' : 'Upload New File'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#8e877e] hover:text-[#f7f4ee] hover:bg-[#1a1a24] transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5 text-[#c59b63]" />
            </button>
          </div>
        </div>

        {/* Upload Error Banner */}
        {uploadError && (
          <div className="mx-6 mt-4 p-3 bg-red-950/60 border border-red-700/60 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Search & Category Filter Toolbar */}
        <div className="px-6 py-3 bg-[#0f0f15] border-b border-[#1f1f2a] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Photos' },
              { id: 'portrait', label: 'Portraits & Partners' },
              { id: 'branding', label: 'Branding & Seals' },
              { id: 'offices', label: 'Chambers & Facilities' },
              { id: 'insights', label: 'Legal & Court' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1 text-[11px] font-cinzel uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                  categoryFilter === cat.id
                    ? 'bg-[#c59b63] text-[#09090c] font-bold shadow'
                    : 'text-[#8e877e] hover:text-[#f7f4ee] bg-[#14141c] hover:bg-[#1c1c28]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8e877e]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by photo name..."
              className="w-full bg-[#14141a] border border-[#2a2a38] focus:border-[#c59b63] pl-8 pr-7 py-1.5 text-xs text-[#f7f4ee] focus:outline-none placeholder:text-[#666]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8e877e] hover:text-[#f7f4ee]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Spacious Media Grid */}
        <div className="p-6 overflow-y-auto flex-1 min-h-[360px] max-h-[58vh]">
          {filtered.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#181824] border border-[#2e2e3e] flex items-center justify-center text-[#8e877e]">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h4 className="font-cormorant text-xl text-[#f7f4ee]">No Images Found</h4>
              <p className="text-xs text-[#8e877e] max-w-sm mx-auto">
                No visual assets matched your search. Upload a new picture directly using the button above.
              </p>
              <Button
                variant="gold-outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Picture from Computer</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filtered.map((asset) => {
                const isSelected = selectedAsset?.id === asset.id || currentValue === asset.url;
                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    onDoubleClick={() => handleCardDoubleClick(asset)}
                    className={`group relative bg-[#111117] border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col text-left ${
                      isSelected
                        ? 'border-[#c59b63] ring-2 ring-[#c59b63]/60 shadow-[0_0_20px_rgba(197,155,99,0.25)]'
                        : 'border-[#22222f] hover:border-[#c59b63]/60 hover:bg-[#14141e]'
                    }`}
                  >
                    {/* Generous High-Res Image Container */}
                    <div className="aspect-[4/5] bg-[#08080c] overflow-hidden relative flex items-center justify-center">
                      <img
                        src={asset.url}
                        alt={asset.name}
                        onError={(e) => {
                          // Try local dataUrl fallback if remote CDN failed
                          if (asset.dataUrl && e.currentTarget.src !== asset.dataUrl) {
                            e.currentTarget.src = asset.dataUrl;
                          } else if (!e.currentTarget.src.includes('attorney-placeholder.svg')) {
                            e.currentTarget.src = '/assets/attorney-placeholder.svg';
                          }
                        }}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 filter brightness-95 group-hover:brightness-100"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />

                      {/* Top Checkmark when Selected */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#c59b63] text-[#09090c] flex items-center justify-center shadow-lg animate-fadeIn">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}

                      {/* Format Badge */}
                      <div className="absolute bottom-2 left-2">
                        <span className="px-1.5 py-0.5 text-[8px] font-mono uppercase bg-black/80 text-[#ded6c9] border border-white/10 backdrop-blur-sm">
                          {asset.format || 'IMG'}
                        </span>
                      </div>

                      {/* Double-click hint overlay on hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="px-2.5 py-1 text-[9px] font-cinzel uppercase bg-[#c59b63] text-[#09090c] font-bold shadow-md">
                          Click to Select
                        </span>
                      </div>
                    </div>

                    {/* Card Meta & Title */}
                    <div className="p-3 bg-[#111117] border-t border-[#1d1d28] flex-1 flex flex-col justify-between space-y-1">
                      <p
                        className={`text-xs font-medium line-clamp-2 leading-snug transition-colors ${
                          isSelected ? 'text-[#e4c18f]' : 'text-[#f7f4ee] group-hover:text-[#e4c18f]'
                        }`}
                        title={asset.name}
                      >
                        {asset.name}
                      </p>
                      <div className="pt-1 flex items-center justify-between text-[10px] text-[#8e877e]">
                        <span className="capitalize font-mono text-[9px] text-[#c59b63]">
                          {asset.category || 'Visual Asset'}
                        </span>
                        {asset.size && (
                          <span className="font-mono text-[9px] text-[#777]">{asset.size}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer / Confirmation Bar */}
        <div className="px-6 py-4 bg-[#121218] border-t border-[#242432] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          {/* Selected Item Indicator */}
          <div className="flex items-center gap-3 min-w-0">
            {selectedAsset ? (
              <>
                <div className="w-10 h-12 bg-[#09090c] border border-[#c59b63] shrink-0 overflow-hidden">
                  <img
                    src={selectedAsset.url}
                    alt={selectedAsset.name}
                    className="w-full h-full object-cover object-top"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-cinzel text-[#c59b63] uppercase tracking-wider block font-semibold">
                    Selected Image:
                  </span>
                  <p className="text-xs text-[#f7f4ee] truncate font-medium max-w-md">
                    {selectedAsset.name}
                  </p>
                </div>
              </>
            ) : (
              <span className="text-xs text-[#8e877e] italic">
                Click on any photo above to select it (or double-click to confirm immediately).
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!selectedAsset}
              onClick={handleConfirmSelect}
              className="gap-2"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Use This Picture</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
