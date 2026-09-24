import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, RefreshCw, Check, Link as LinkIcon, FolderOpen, AlertCircle } from 'lucide-react';
import { db } from '../../services/db';
import { MediaAsset } from '../../types';

export interface ImageUploadFieldProps {
  label?: string;
  value?: string;
  onChange: (value: string, fileName?: string) => void;
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
  const [mode, setMode] = useState<'upload' | 'url' | 'library'>('upload');
  const [urlInput, setUrlInput] = useState(value && !value.startsWith('data:') ? value : '');
  const [showLibraryPicker, setShowLibraryPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsLoading(true);
    setError(null);

    try {
      const processed = await processImageFile(file);
      onChange(processed.dataUrl, processed.name);
    } catch (err: any) {
      setError(err?.message || 'Error uploading file.');
    } finally {
      setIsLoading(false);
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

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setUrlInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setError(null);
    }
  };

  // Select asset from Media Library
  const handleSelectMediaAsset = (asset: MediaAsset) => {
    onChange(asset.url, asset.name);
    setShowLibraryPicker(false);
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
      <div className="flex items-center justify-between gap-2">
        {label && (
          <label className="block font-cinzel text-[11px] font-semibold tracking-[0.15em] text-[#d4af7a] uppercase">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        {(allowUrlFallback || allowMediaLibrary) && (
          <div className="flex items-center gap-1.5 text-[10px] font-cinzel uppercase">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`px-2 py-0.5 transition-colors cursor-pointer ${
                mode === 'upload' ? 'bg-[#c59b63] text-[#0d0d11] font-bold' : 'text-[#8e877e] hover:text-[#f7f4ee]'
              }`}
            >
              Upload File
            </button>
            {allowMediaLibrary && (
              <button
                type="button"
                onClick={() => {
                  setMode('library');
                  setShowLibraryPicker(true);
                }}
                className={`px-2 py-0.5 transition-colors cursor-pointer flex items-center gap-1 ${
                  mode === 'library' ? 'bg-[#c59b63] text-[#0d0d11] font-bold' : 'text-[#8e877e] hover:text-[#f7f4ee]'
                }`}
              >
                <FolderOpen className="w-3 h-3" />
                <span>Library</span>
              </button>
            )}
            {allowUrlFallback && (
              <button
                type="button"
                onClick={() => setMode('url')}
                className={`px-2 py-0.5 transition-colors cursor-pointer flex items-center gap-1 ${
                  mode === 'url' ? 'bg-[#c59b63] text-[#0d0d11] font-bold' : 'text-[#8e877e] hover:text-[#f7f4ee]'
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

      {/* Error notification */}
      {error && (
        <div className="flex items-center gap-2 p-2 bg-red-950/40 border border-red-800/60 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Mode: URL fallback */}
      {mode === 'url' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/..."
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

      {/* Mode: Media Library modal/picker */}
      {showLibraryPicker && (
        <div className="p-3 bg-[#0d0d11] border border-[#2e2e3d] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1f1f28]">
            <span className="font-cinzel text-[10px] font-bold uppercase text-[#c59b63] flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5" />
              Select from Chambers Media Library
            </span>
            <button
              type="button"
              onClick={() => setShowLibraryPicker(false)}
              className="text-[#8e877e] hover:text-[#f7f4ee] p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
            {db.getMedia().map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => handleSelectMediaAsset(asset)}
                className="group p-1 bg-[#121218] border border-[#22222f] hover:border-[#c59b63] text-left transition-all cursor-pointer"
              >
                <div className="aspect-square bg-black overflow-hidden relative">
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <p className="text-[9px] font-cinzel text-[#d4af7a] truncate mt-1">{asset.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mode: Upload or active preview */}
      {value ? (
        /* Image Preview card */
        <div className="relative group bg-[#0a0a0e] border border-[#2a2a38] hover:border-[#c59b63]/60 transition-colors overflow-hidden">
          <div className={`w-full ${compact ? 'h-32' : aspectClass} flex items-center justify-center bg-black/40 overflow-hidden relative`}>
            <img
              src={value}
              alt="Uploaded Preview"
              className="max-h-full max-w-full object-contain"
              referrerPolicy="no-referrer"
              onError={() => setError('Image could not be loaded. Please re-upload.')}
            />

            {/* Hover overlay with action buttons */}
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-[#c59b63] text-[#0d0d11] font-cinzel text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#d4af7a] cursor-pointer shadow-md"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Replace File</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 bg-rose-950/80 border border-rose-800 text-rose-200 font-cinzel text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-rose-900 cursor-pointer shadow-md"
              >
                <X className="w-3 h-3" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          <div className="p-2.5 bg-[#121217] border-t border-[#1e1e28] flex items-center justify-between text-[10px] font-mono text-[#8a837a]">
            <span className="truncate max-w-[200px] flex items-center gap-1.5 text-[#d4af7a]">
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
              {value.startsWith('data:') ? 'Local Image File Loaded' : 'Linked Image'}
            </span>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[#c59b63] hover:text-[#f7f4ee] font-cinzel uppercase text-[10px] tracking-wider cursor-pointer"
            >
              Change
            </button>
          </div>
        </div>
      ) : (
        /* Dropzone / Upload area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed transition-all cursor-pointer text-center p-6 sm:p-8 flex flex-col items-center justify-center gap-3 ${
            isDragging
              ? 'border-[#c59b63] bg-[#c59b63]/10'
              : 'border-[#2a2a38] hover:border-[#c59b63]/70 bg-[#0c0c10] hover:bg-[#111117]'
          } ${compact ? 'py-4' : ''}`}
        >
          <div className="w-12 h-12 rounded-full bg-[#181822] border border-[#2e2e3e] flex items-center justify-center text-[#c59b63] group-hover:scale-105 transition-transform">
            {isLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin text-[#c59b63]" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
          </div>

          <div className="space-y-1">
            <p className="font-cinzel text-xs font-semibold text-[#f7f4ee] tracking-wide">
              {isLoading ? 'Processing Image File...' : 'Choose Picture File or Drag & Drop'}
            </p>
            <p className="text-[11px] text-[#8e877e]">
              Supports PNG, JPG, WEBP, GIF, SVG up to 10MB
            </p>
          </div>

          <button
            type="button"
            className="mt-1 px-4 py-1.5 bg-[#1a1a24] border border-[#333345] hover:border-[#c59b63] text-[#c59b63] hover:text-[#f7f4ee] font-cinzel text-[10px] font-bold tracking-wider uppercase transition-colors pointer-events-none"
          >
            Browse From Computer
          </button>
        </div>
      )}

      {helperText && <p className="text-[11px] text-[#8e877e] leading-relaxed">{helperText}</p>}
    </div>
  );
};
