import React, { useState, useEffect, useRef } from 'react';
import { Upload, Image as ImageIcon, X, RefreshCw, Check, Link as LinkIcon, FolderOpen, AlertCircle, AlertTriangle } from 'lucide-react';
import { db } from '../../services/db';
import { MediaAsset } from '../../types';
import { supabaseService } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { MediaPickerModal } from './MediaPickerModal';

export interface ImageUploadFieldProps {
  label?: string;
  value?: string;
  onChange: (value: string, fileName?: string, mediaId?: string) => void;
  helperText?: string;
  required?: boolean;
  className?: string;
  aspectRatio?: 'portrait' | 'landscape' | 'square' | 'auto';
  compact?: boolean;
  allowUrlFallback?: boolean;
  allowMediaLibrary?: boolean;
  autoSaveToMediaLibrary?: boolean;
}

/**
 * Compresses and converts an image file to a base64 Data URL safely
 * keeping localStorage usage lightweight while preserving high visual quality.
 */
export const processImageFile = (
  file: File,
  maxDimension = 1600,
  quality = 0.86
): Promise<{ dataUrl: string; name: string; size: number; dimensions?: { width: number; height: number } }> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please choose a valid image file (JPG, PNG, WEBP, GIF, SVG).'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        reject(new Error('Failed to parse image data.'));
        return;
      }

      // If SVG or very small, keep original
      if (file.type === 'image/svg+xml' || file.size < 200 * 1024) {
        resolve({ dataUrl: result, name: file.name, size: file.size });
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({ dataUrl: result, name: file.name, size: file.size, dimensions: { width, height } });
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const mimeType = file.type === 'image/png' && file.size < 500 * 1024 ? 'image/png' : 'image/jpeg';
          const compressed = canvas.toDataURL(mimeType, quality);
          resolve({
            dataUrl: compressed,
            name: file.name,
            size: Math.round(compressed.length * 0.75),
            dimensions: { width, height },
          });
        } catch {
          resolve({ dataUrl: result, name: file.name, size: file.size });
        }
      };
      img.onerror = () => resolve({ dataUrl: result, name: file.name, size: file.size });
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
};

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value = '',
  onChange,
  helperText,
  required = false,
  className = '',
  aspectRatio = 'auto',
  compact = false,
  allowUrlFallback = false,
  allowMediaLibrary = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [imgSrc, setImgSrc] = useState(value);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(value && !value.startsWith('data:') ? value : '');
  const [showLibraryPicker, setShowLibraryPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal image src and reset errors whenever value prop changes
  useEffect(() => {
    setImgSrc(value);
    setLoadFailed(false);
    setError(null);
  }, [value]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsLoading(true);
    setError(null);
    setLoadFailed(false);

    try {
      const cleaned = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .trim()
        .replace(/\b\w/g, (c) => c.toUpperCase());

      // 1. Process to high-quality base64 Data URL so local preview ALWAYS succeeds
      const processed = await processImageFile(file);
      let targetUrl = processed.dataUrl;
      let mediaId = `med-${Date.now()}`;

      // 2. If Supabase is configured, upload to cloud storage
      if (isSupabaseConfigured) {
        try {
          const result = await supabaseService.uploadMediaFile(file, {
            customName: cleaned,
          });

          // Test if public URL loads cleanly in browser
          await new Promise<void>((resolve) => {
            const testImg = new Image();
            testImg.onload = () => {
              targetUrl = result.url;
              mediaId = result.mediaItem.id;
              resolve();
            };
            testImg.onerror = () => {
              console.warn('Supabase public URL failed browser check, using safe local Data URL');
              resolve(); // fallback remains processed.dataUrl
            };
            testImg.src = result.url;
          });
        } catch (supErr: any) {
          console.warn('Supabase upload warning, using local file:', supErr);
        }
      }

      // 3. Register in Media Library
      db.addMedia({
        id: mediaId,
        name: cleaned,
        url: targetUrl,
        dataUrl: processed.dataUrl,
        fileType: 'image',
        format: file.name.split('.').pop()?.toUpperCase() || 'JPG',
        sizeBytes: file.size,
        size: `${(file.size / 1024).toFixed(0)} KB`,
        category: label?.toLowerCase().includes('partner') || label?.toLowerCase().includes('card') ? 'portrait' : 'branding',
        altText: cleaned,
      });

      setImgSrc(targetUrl);
      setLoadFailed(false);
      onChange(targetUrl, cleaned, mediaId);
    } catch (err: any) {
      console.error('File upload error:', err);
      setError(err?.message || 'Error processing image file.');
      setLoadFailed(true);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleClear = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setImgSrc('');
    setLoadFailed(false);
    setError(null);
    onChange('');
    setUrlInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setImgSrc(urlInput.trim());
      setLoadFailed(false);
      setError(null);
      onChange(urlInput.trim());
    }
  };

  // Safe error recovery when an image URL fails to render
  const handleImageError = () => {
    if (value) {
      // Check if this image has a fallback in the media library
      const mediaList = db.getMedia();
      const matched = mediaList.find(
        (m) =>
          m.url === value ||
          (m.dataUrl && m.dataUrl === value) ||
          (m.id && value.includes(m.id))
      );

      if (matched?.dataUrl && imgSrc !== matched.dataUrl) {
        setImgSrc(matched.dataUrl);
        setLoadFailed(false);
        setError(null);
        return;
      }

      // Fix missing leading slash
      if (!value.startsWith('/') && !value.startsWith('http') && !value.startsWith('data:')) {
        const fixed = `/${value}`;
        if (imgSrc !== fixed) {
          setImgSrc(fixed);
          return;
        }
      }
    }

    setLoadFailed(true);
    setError('Image file could not be loaded from URL.');
  };

  const aspectClass =
    aspectRatio === 'portrait'
      ? 'aspect-[3/4]'
      : aspectRatio === 'landscape'
      ? 'aspect-[16/9]'
      : aspectRatio === 'square'
      ? 'aspect-square'
      : 'min-h-[140px]';

  return (
    <div className={`space-y-2 text-left ${className}`}>
      {/* Label and mode controls */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {label && (
          <label className="block font-cinzel text-[11px] font-semibold tracking-[0.15em] text-[#d4af7a] uppercase">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        {(allowUrlFallback || allowMediaLibrary) && (
          <div className="flex items-center gap-1.5 text-[10px] font-cinzel uppercase ml-auto">
            <button
              type="button"
              onClick={() => {
                setMode('upload');
                fileInputRef.current?.click();
              }}
              className="px-2 py-0.5 bg-[#14141c] hover:bg-[#20202e] text-[#c59b63] border border-[#2b2b3d] hover:border-[#c59b63] transition-colors cursor-pointer flex items-center gap-1 font-bold"
            >
              <Upload className="w-3 h-3" />
              <span>Upload File</span>
            </button>

            {allowMediaLibrary && (
              <button
                type="button"
                onClick={() => setShowLibraryPicker(true)}
                className="px-2.5 py-0.5 bg-[#c59b63] hover:bg-[#d4af7a] text-[#09090c] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <FolderOpen className="w-3 h-3" />
                <span>Choose from Library</span>
              </button>
            )}

            {allowUrlFallback && (
              <button
                type="button"
                onClick={() => setMode('url')}
                className={`px-2 py-0.5 transition-colors cursor-pointer flex items-center gap-1 border ${
                  mode === 'url' ? 'bg-[#1e1e2d] text-[#f7f4ee] border-[#c59b63]' : 'text-[#8e877e] hover:text-[#f7f4ee] border-[#2b2b3d]'
                }`}
              >
                <LinkIcon className="w-3 h-3" />
                <span>URL</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Error notification banner */}
      {error && !loadFailed && (
        <div className="flex items-center gap-2 p-2 bg-red-950/40 border border-red-800/60 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Mode: URL input */}
      {mode === 'url' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/... or /assets/..."
              className="flex-1 bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:border-[#c59b63] focus:outline-none font-mono"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-3 py-2 bg-[#c59b63] text-[#0d0d11] text-[11px] font-cinzel font-bold uppercase tracking-wider hover:bg-[#d4af7a] cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Dedicated Spacious Media Library Modal Popup */}
      <MediaPickerModal
        isOpen={showLibraryPicker}
        onClose={() => setShowLibraryPicker(false)}
        onSelect={(selectedUrl, selectedName, selectedId) => {
          setImgSrc(selectedUrl);
          setLoadFailed(false);
          setError(null);
          onChange(selectedUrl, selectedName, selectedId);
          setShowLibraryPicker(false);
        }}
        currentValue={value}
        placementLabel={label}
      />

      {/* Mode: Upload or active preview */}
      {value ? (
        /* Image Preview card */
        <div className="relative group bg-[#0a0a0e] border border-[#2a2a38] hover:border-[#c59b63]/60 transition-colors overflow-hidden">
          <div className={`w-full ${compact ? 'h-36' : aspectClass} flex items-center justify-center bg-black/50 overflow-hidden relative`}>
            {loadFailed ? (
              /* Graceful interactive fallback card */
              <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#141116] border border-amber-800/50 space-y-2">
                <div className="w-8 h-8 rounded-full bg-amber-950/70 border border-amber-500/50 flex items-center justify-center text-[#c59b63]">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="font-cinzel text-[10px] text-[#e4c18f] uppercase font-bold block">
                    Photo File Unreachable
                  </span>
                  <p className="text-[10px] text-[#8e877e] line-clamp-1 max-w-[220px]">
                    The image at this URL could not be displayed.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 pt-1 flex-wrap justify-center">
                  <button
                    type="button"
                    onClick={() => setShowLibraryPicker(true)}
                    className="px-2.5 py-1 bg-[#c59b63] text-[#09090c] font-cinzel text-[9px] font-bold uppercase tracking-wider hover:bg-[#d4af7a] cursor-pointer shadow"
                  >
                    Select from Library
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2 py-1 bg-[#1a1a24] text-[#ded6c9] hover:text-white border border-[#333348] font-cinzel text-[9px] uppercase tracking-wider cursor-pointer"
                  >
                    Upload New
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                    title="Remove Photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <img
                src={imgSrc || value}
                alt="Uploaded Preview"
                className="max-h-full max-w-full object-contain"
                referrerPolicy="no-referrer"
                onError={handleImageError}
              />
            )}

            {/* Hover overlay with action buttons (when loaded normally) */}
            {!loadFailed && (
              <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                <button
                  type="button"
                  onClick={() => setShowLibraryPicker(true)}
                  className="px-2.5 py-1.5 bg-[#c59b63] text-[#0d0d11] font-cinzel text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 hover:bg-[#d4af7a] cursor-pointer shadow-md"
                >
                  <FolderOpen className="w-3 h-3" />
                  <span>Library</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 bg-[#181822] text-[#f7f4ee] border border-[#333344] font-cinzel text-[9px] uppercase tracking-wider flex items-center gap-1 hover:bg-[#222230] cursor-pointer shadow-md"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Replace</span>
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  className="px-2 py-1.5 bg-rose-950/80 border border-rose-800 text-rose-200 font-cinzel text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 hover:bg-rose-900 cursor-pointer shadow-md"
                  title="Remove Image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="p-2.5 bg-[#121217] border-t border-[#1e1e28] flex items-center justify-between text-[10px] font-mono text-[#8a837a]">
            <span className="truncate max-w-[190px] flex items-center gap-1.5 text-[#d4af7a]">
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
              {value.startsWith('data:') ? 'Local High-Res File' : 'Linked Image'}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowLibraryPicker(true)}
                className="text-[#c59b63] hover:text-[#f7f4ee] font-cinzel uppercase text-[10px] tracking-wider cursor-pointer"
              >
                Choose Photo
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Dropzone / Upload area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed transition-all cursor-pointer p-5 flex flex-col items-center justify-center gap-2 bg-[#0e0e13]/60 hover:bg-[#13131a] ${
            isDragging
              ? 'border-[#c59b63] bg-[#c59b63]/10'
              : 'border-[#262635] hover:border-[#c59b63]/60'
          } ${compact ? 'py-4' : 'py-7'}`}
        >
          <div className="w-8 h-8 rounded-full bg-[#161620] border border-[#2b2b3d] flex items-center justify-center text-[#c59b63]">
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[#c59b63]" />
            ) : (
              <Upload className="w-4 h-4 text-[#c59b63]" />
            )}
          </div>

          <div className="text-center space-y-0.5">
            <span className="text-xs text-[#f7f4ee] font-medium block">
              {isLoading ? 'Processing Image...' : 'Click to Upload or Drag File'}
            </span>
            <span className="text-[10px] text-[#8e877e] block">
              PNG, JPG, SVG, WEBP up to 25MB
            </span>
          </div>

          {allowMediaLibrary && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowLibraryPicker(true);
              }}
              className="mt-1 px-3 py-1 bg-[#181824] hover:bg-[#252538] text-[#c59b63] border border-[#2e2e42] hover:border-[#c59b63] font-cinzel text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FolderOpen className="w-3 h-3" />
              <span>Or Choose from Library</span>
            </button>
          )}
        </div>
      )}

      {helperText && <p className="text-[10px] text-[#8e877e]">{helperText}</p>}
    </div>
  );
};
