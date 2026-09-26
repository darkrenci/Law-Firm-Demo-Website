import React, { useState, useEffect, useRef } from 'react';
import { PageSection, BlockTypography, PracticeArea, Attorney, Article, NewsItem, FAQItem } from '../../types';
import { db } from '../../services/db';
import { Button } from '../ui/Buttons';
import { Modal } from '../ui/Modal';
import { Logo, LalusisLogoMark } from '../brand/Logo';
import { processImageFile } from '../ui/ImageUploadField';
import {
  ShieldCheck,
  Scale,
  Briefcase,
  Award,
  BookOpen,
  ArrowRight,
  ChevronDown,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Bell,
  Play,
  ExternalLink,
  Upload,
  X,
  GraduationCap,
} from 'lucide-react';
import { useToast } from '../ui/Toast';
import { resolveItemTypography } from '../admin/ItemTypographyControls';

const getPartnerOfficialPortrait = (fullName?: string, slug?: string, id?: string) => {
  const s = `${fullName || ''} ${slug || ''} ${id || ''}`.toLowerCase();
  if (s.includes('levy')) return '/assets/atty-levy-lalusis.svg';
  if (s.includes('diosdado')) return '/assets/atty-diosdado-lalusis.svg';
  if (s.includes('leo')) return '/assets/atty-leo-lalusis.svg';
  return '/assets/attorney-placeholder.svg';
};

const getEmbedVideoUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('youtube.com/watch?v=')) {
    return url.replace('youtube.com/watch?v=', 'youtube.com/embed/');
  }
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${id}?autoplay=1`;
  }
  if (url.includes('youtube.com/embed/')) {
    return url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`;
  }
  if (url.includes('vimeo.com/')) {
    const id = url.split('vimeo.com/')[1]?.split('?')[0];
    return `https://player.vimeo.com/video/${id}?autoplay=1`;
  }
  return url;
};

interface SectionRendererProps {
  sections?: PageSection[];
  section?: PageSection;
  onNavigate: (path: string) => void;
  // Interactive visual builder element selection
  editMode?: boolean;
  isAdmin?: boolean;
  activeElementPart?: string | null;
  onSelectPart?: (part: string) => void;
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({
  sections,
  section,
  onNavigate,
  editMode = false,
  isAdmin = false,
  activeElementPart = null,
  onSelectPart,
}) => {
  const isEffectiveAdmin = Boolean(
    isAdmin ||
    editMode ||
    (typeof window !== 'undefined' && (
      window.location.pathname.startsWith('/admin') ||
      window.location.hash.includes('/admin')
    ))
  );

  const rawSections: PageSection[] = Array.isArray(sections)
    ? sections
    : section
    ? [section]
    : [];

  const sortedSections = [...rawSections]
    .filter((s) => s && s.isVisible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="w-full flex flex-col">
      {sortedSections.map((sec) => (
        <RenderSectionItem
          key={sec.id}
          section={sec}
          onNavigate={onNavigate}
          editMode={editMode}
          isAdmin={isEffectiveAdmin}
          activeElementPart={activeElementPart}
          onSelectPart={onSelectPart}
        />
      ))}
    </div>
  );
};

export const resolveTypography = (typo?: BlockTypography) => {
  if (!typo) {
    return {
      fontClass: 'font-cormorant',
      alignClass: 'text-center',
      sizeClass: '',
      trackingClass: 'tracking-normal',
      weightClass: 'font-normal',
      colorClass: 'text-[#f7f4ee]',
      bodyColorClass: 'text-[#c8c0b4]',
      subColorClass: 'text-[#a8a199]',
      justifyClass: 'justify-center',
      marginClass: 'mx-auto text-center',
      flexAlignClass: 'items-center text-center',
      uppercaseClass: '',
      italicClass: '',
      dropCapClass: '',
      alignment: 'center' as const,
      textColor: 'ivory' as const,
    };
  }

  let fontClass = 'font-cormorant';
  if (typo.fontFamily === 'cinzel') fontClass = 'font-cinzel';
  else if (typo.fontFamily === 'sans') fontClass = 'font-sans';
  else if (typo.fontFamily === 'playfair') fontClass = 'font-serif';
  else if (typo.fontFamily === 'mono') fontClass = 'font-mono';

  let alignClass = 'text-center';
  if (typo.alignment === 'left') alignClass = 'text-left';
  else if (typo.alignment === 'center') alignClass = 'text-center';
  else if (typo.alignment === 'right') alignClass = 'text-right';
  else if (typo.alignment === 'justify') alignClass = 'text-justify';

  let sizeClass = '';
  if (typo.fontSize === 'xs') sizeClass = 'text-xs';
  else if (typo.fontSize === 'sm') sizeClass = 'text-sm';
  else if (typo.fontSize === 'base') sizeClass = 'text-base';
  else if (typo.fontSize === 'lg') sizeClass = 'text-lg sm:text-xl';
  else if (typo.fontSize === 'xl') sizeClass = 'text-xl sm:text-2xl';
  else if (typo.fontSize === '2xl') sizeClass = 'text-2xl sm:text-3xl';
  else if (typo.fontSize === '3xl') sizeClass = 'text-3xl sm:text-4xl';
  else if (typo.fontSize === '4xl') sizeClass = 'text-4xl sm:text-6xl';

  let trackingClass = 'tracking-normal';
  if (typo.letterSpacing === 'tight') trackingClass = 'tracking-tight';
  else if (typo.letterSpacing === 'wide') trackingClass = 'tracking-wide';
  else if (typo.letterSpacing === 'widest') trackingClass = 'tracking-[0.15em]';
  else if (typo.letterSpacing === 'monumental') trackingClass = 'tracking-[0.25em]';

  let weightClass = 'font-normal';
  if (typo.fontWeight === 'light') weightClass = 'font-light';
  else if (typo.fontWeight === 'medium') weightClass = 'font-medium';
  else if (typo.fontWeight === 'semibold') weightClass = 'font-semibold';
  else if (typo.fontWeight === 'bold') weightClass = 'font-bold';

  let colorClass = 'text-[#f7f4ee]';
  let bodyColorClass = 'text-[#c8c0b4]';
  let subColorClass = 'text-[#a8a199]';
  let customStyle: React.CSSProperties | undefined = undefined;

  if (typo.customColor) {
    colorClass = '';
    customStyle = { color: typo.customColor };
  } else if (typo.textColor === 'gold') {
    colorClass = 'text-[#c59b63]';
    bodyColorClass = 'text-[#d4af7a]';
    subColorClass = 'text-[#c59b63]';
  } else if (typo.textColor === 'champagne') {
    colorClass = 'text-[#f4e6d0]';
    bodyColorClass = 'text-[#e8dccb]';
    subColorClass = 'text-[#f4e6d0]';
  } else if (typo.textColor === 'muted') {
    colorClass = 'text-[#8e877e]';
    bodyColorClass = 'text-[#8e877e]';
    subColorClass = 'text-[#6e6860]';
  } else if (typo.textColor === 'gradient') {
    colorClass = 'gold-gradient-text';
    bodyColorClass = 'text-[#e0c294]';
    subColorClass = 'text-[#d4af7a]';
  }

  const isLeft = typo.alignment === 'left';
  const isRight = typo.alignment === 'right';
  const isJustify = typo.alignment === 'justify';

  const justifyClass = isLeft ? 'justify-start' : isRight ? 'justify-end' : 'justify-center';
  const marginClass = isLeft
    ? 'mr-auto ml-0 text-left'
    : isRight
    ? 'ml-auto mr-0 text-right'
    : isJustify
    ? 'mx-auto text-justify'
    : 'mx-auto text-center';
  const flexAlignClass = isLeft
    ? 'items-start text-left'
    : isRight
    ? 'items-end text-right'
    : isJustify
    ? 'items-stretch text-justify'
    : 'items-center text-center';

  const uppercaseClass = typo.isUppercase ? 'uppercase' : '';
  const italicClass = typo.isItalic ? 'italic' : '';
  const dropCapClass = typo.dropCap
    ? 'first-letter:float-left first-letter:text-5xl first-letter:pr-3.5 first-letter:font-cinzel first-letter:text-[#c59b63] first-letter:font-bold first-letter:leading-none'
    : '';

  return {
    fontClass,
    fontFamily: typo.fontFamily,
    alignClass,
    sizeClass,
    trackingClass,
    weightClass,
    colorClass,
    bodyColorClass,
    subColorClass,
    justifyClass,
    marginClass,
    flexAlignClass,
    uppercaseClass,
    italicClass,
    dropCapClass,
    customStyle,
    alignment: typo.alignment || 'center',
    textColor: typo.textColor || 'ivory',
  };
};

/**
 * Resolve typography for a specific element part within a section
 */
export const resolvePartTypography = (
  section: PageSection,
  partId: string,
  defaultFontFamily: 'cormorant' | 'cinzel' | 'sans' | 'playfair' | 'mono' = 'cormorant'
) => {
  const sectionTypo = section.typography || {};
  const partTypo = (section.partTypography && section.partTypography[partId])
    || (section.content?.partTypography && section.content.partTypography[partId]);

  if (partTypo && Object.keys(partTypo).length > 0) {
    const combined: BlockTypography = {
      fontFamily: partTypo.fontFamily || (partId === 'headline' || partId === 'heading' ? sectionTypo.fontFamily || defaultFontFamily : defaultFontFamily),
      alignment: partTypo.alignment || sectionTypo.alignment || 'center',
      textColor: partTypo.textColor || (partId === 'headline' || partId === 'heading' ? sectionTypo.textColor || 'ivory' : partId === 'eyebrow' || partId === 'stats' ? 'gold' : 'champagne'),
      customColor: partTypo.customColor || sectionTypo.customColor,
      fontSize: partTypo.fontSize || (partId === 'headline' || partId === 'heading' ? sectionTypo.fontSize : partId === 'stats' ? '2xl' : undefined),
      fontWeight: partTypo.fontWeight || (partId === 'headline' || partId === 'heading' ? sectionTypo.fontWeight : undefined),
      letterSpacing: partTypo.letterSpacing || (partId === 'headline' || partId === 'heading' ? sectionTypo.letterSpacing : undefined),
      isUppercase: partTypo.isUppercase !== undefined ? partTypo.isUppercase : (partId === 'eyebrow' || partId === 'buttons' ? true : sectionTypo.isUppercase),
      isItalic: partTypo.isItalic !== undefined ? partTypo.isItalic : (partId === 'headline' || partId === 'heading' ? sectionTypo.isItalic : false),
      dropCap: partTypo.dropCap !== undefined ? partTypo.dropCap : (partId === 'body' ? sectionTypo.dropCap : false),
    };
    return resolveTypography(combined);
  }

  // If no part-specific typography set:
  if (partId === 'headline' || partId === 'heading') {
    return resolveTypography(sectionTypo);
  }

  // Base fallback for non-headline parts
  const fallbackTypo: BlockTypography = {
    fontFamily: defaultFontFamily,
    alignment: sectionTypo.alignment || 'center',
    textColor: (partId === 'eyebrow' || partId === 'stats')
      ? 'gold'
      : (sectionTypo.textColor === 'gold' || sectionTypo.textColor === 'champagne' || sectionTypo.textColor === 'muted')
      ? sectionTypo.textColor
      : 'champagne',
    customColor: sectionTypo.customColor,
    fontSize: partId === 'stats' ? '2xl' : undefined,
    isItalic: false,
    isUppercase: partId === 'eyebrow' || partId === 'buttons',
  };
  return resolveTypography(fallbackTypo);
};

/**
 * Interactive highlight wrapper for individual elements in canvas live edit mode
 */
const EditablePartWrapper: React.FC<{
  editMode?: boolean;
  partId: string;
  partLabel: string;
  activeElementPart?: string | null;
  onSelectPart?: (part: string) => void;
  className?: string;
  children: React.ReactNode;
}> = ({
  editMode,
  partId,
  partLabel,
  activeElementPart,
  onSelectPart,
  className = '',
  children,
}) => {
  if (!editMode) {
    return <div className={className}>{children}</div>;
  }

  const isActive = activeElementPart === partId;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelectPart?.(partId);
      }}
      className={`relative group/part transition-all duration-150 cursor-pointer ${
        isActive
          ? 'ring-2 ring-[#c59b63] ring-offset-2 ring-offset-[#0d0d11] bg-[#c59b63]/10 shadow-[0_0_25px_rgba(197,155,99,0.35)] rounded-sm'
          : 'hover:ring-1 hover:ring-dashed hover:ring-[#c59b63]/80 hover:bg-[#c59b63]/[0.04] rounded-sm'
      } ${className}`}
    >
      {/* Floating Badge on canvas */}
      <div
        className={`absolute -top-3.5 left-2 z-40 transition-all pointer-events-none flex items-center gap-1.5 text-[10px] font-cinzel uppercase tracking-wider px-2 py-0.5 rounded shadow-lg ${
          isActive
            ? 'bg-[#c59b63] text-[#0d0d11] font-bold opacity-100 scale-100'
            : 'bg-[#151522] text-[#d4af7a] border border-[#c59b63]/60 opacity-0 group-hover/part:opacity-100 scale-95 group-hover/part:scale-100'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#0d0d11] animate-ping' : 'bg-[#c59b63]'}`} />
        <span>{isActive ? `Editing: ${partLabel}` : `Click to Edit: ${partLabel}`}</span>
      </div>
      {children}
    </div>
  );
};

/**
 * Compatible Bespoke Legal Architectural Frame for the Partners Group Portrait
 */
const InstitutionalImageFrame: React.FC<{
  imageUrl?: string;
  imageAlt?: string;
  caption?: string;
  sectionId?: string;
  editMode?: boolean;
  isAdmin?: boolean;
}> = ({
  imageUrl,
  imageAlt = 'Lalusis & Partners Founding Partners',
  caption = 'Partners of Lalusis & Partners · Atty. Levy John L.V. Lalusis · Atty. Diosdado Anselmo Q. Lalusis · Atty. Leo Anselmo L.V. Lalusis',
  sectionId,
  editMode = false,
  isAdmin = false,
}) => {
  const DEFAULT_PORTRAIT = '/assets/group-picture.svg';
  const resolveSrc = (src?: string) => {
    if (!src || src === '/Group Picture.jpeg' || src === '/Group%20Picture.jpeg') {
      return DEFAULT_PORTRAIT;
    }
    return src;
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localSrc, setLocalSrc] = useState<string>(() => resolveSrc(imageUrl));
  const [hasError, setHasError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const toast = useToast();

  const isEffectiveAdmin = Boolean(
    isAdmin ||
    editMode ||
    (typeof window !== 'undefined' && (
      window.location.pathname.startsWith('/admin') ||
      window.location.hash.includes('/admin')
    ))
  );

  useEffect(() => {
    setLocalSrc(resolveSrc(imageUrl));
    setHasError(false);
  }, [imageUrl]);

  const handleFile = async (file: File) => {
    if (!isEffectiveAdmin) return;
    setIsUploading(true);
    try {
      const processed = await processImageFile(file, 1800, 0.88);
      setLocalSrc(processed.dataUrl);
      setHasError(false);
      if (sectionId) {
        db.updateSection('page-home', sectionId, {
          content: { imageUrl: processed.dataUrl },
        });
      }
      toast.success('Partner Group Portrait Updated', 'Image loaded and stored in firm records.');
    } catch (e: any) {
      toast.error('Upload Failed', e?.message || 'Failed to process image file.');
    } finally {
      setIsUploading(false);
      setIsDragging(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    if (!isEffectiveAdmin) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragOver={isEffectiveAdmin ? (e) => {
        e.preventDefault();
        setIsDragging(true);
      } : undefined}
      onDragLeave={isEffectiveAdmin ? () => setIsDragging(false) : undefined}
      onDrop={isEffectiveAdmin ? onDrop : undefined}
      className={`relative w-full my-6 p-2.5 sm:p-4 bg-gradient-to-b from-[#181614] via-[#100f13] to-[#08080a] border-2 transition-all duration-300 ${
        isDragging && isEffectiveAdmin
          ? 'border-[#c59b63] shadow-[0_0_50px_rgba(197,155,99,0.35)] scale-[1.01]'
          : 'border-[#c59b63]/60 shadow-[0_24px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(197,155,99,0.12)]'
      }`}
    >
      {/* 4 Architectural Brass/Gold Corner Accents */}
      <div className="absolute -top-1.5 -left-1.5 w-6 h-6 border-t-2 border-l-2 border-[#d4af7a] pointer-events-none z-20" />
      <div className="absolute -top-1.5 -right-1.5 w-6 h-6 border-t-2 border-r-2 border-[#d4af7a] pointer-events-none z-20" />
      <div className="absolute -bottom-1.5 -left-1.5 w-6 h-6 border-b-2 border-l-2 border-[#d4af7a] pointer-events-none z-20" />
      <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-2 border-r-2 border-[#d4af7a] pointer-events-none z-20" />

      {/* Decorative Gold Corner Rivets */}
      <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-[#c59b63] rotate-45 z-20 opacity-80 pointer-events-none" />
      <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#c59b63] rotate-45 z-20 opacity-80 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-[#c59b63] rotate-45 z-20 opacity-80 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-[#c59b63] rotate-45 z-20 opacity-80 pointer-events-none" />

      {/* Inner Golden Reveal Frame */}
      <div className="relative overflow-hidden border border-[#c59b63]/35 bg-[#060608]">
        {!hasError ? (
          <div className="relative group">
            <img
              src={localSrc}
              alt={imageAlt}
              onError={() => {
                if (localSrc !== DEFAULT_PORTRAIT) {
                  setLocalSrc(DEFAULT_PORTRAIT);
                } else {
                  setHasError(true);
                }
              }}
              className="w-full h-auto max-h-[580px] object-cover object-top block select-none transition-transform duration-500 group-hover:scale-[1.01]"
            />
            {/* Ambient vignette gradient overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0a0a0e] via-transparent to-black/20 opacity-60" />

            {/* Hover update control - strictly visible on admin side only */}
            {isEffectiveAdmin && (
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0a0d]/90 hover:bg-[#c59b63] text-[#c59b63] hover:text-[#0a0a0d] border border-[#c59b63]/60 text-[11px] font-cinzel uppercase tracking-wider transition-all backdrop-blur-sm shadow-xl cursor-pointer"
                  title="Update or Replace Image"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Replace Photo</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Stately interactive dropzone placeholder */
          <div
            onClick={isEffectiveAdmin ? () => fileInputRef.current?.click() : undefined}
            className={`py-14 sm:py-20 px-6 text-center flex flex-col items-center justify-center space-y-4 transition-colors ${
              isEffectiveAdmin ? 'cursor-pointer hover:bg-white/[0.02]' : 'select-none'
            }`}
          >
            <div className="w-16 h-16 text-[#c59b63] mx-auto drop-shadow-lg">
              <LalusisLogoMark className="w-full h-full" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h4 className="font-cinzel text-base sm:text-lg font-semibold tracking-[0.16em] text-[#f4e6d0] uppercase">
                Institutional Chamber Portrait
              </h4>
              <p className="text-xs text-[#a8a199] font-sans">
                Founding Partners of Lalusis &amp; Partners
              </p>
            </div>
            {isEffectiveAdmin && (
              <>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#16161f] border border-[#c59b63]/60 text-[#c59b63] text-xs font-cinzel uppercase tracking-widest hover:bg-[#c59b63] hover:text-[#0d0d11] transition-all">
                    <Upload className="w-4 h-4" />
                    <span>Select or Drop Group Picture</span>
                  </span>
                </div>
                <p className="text-[10px] text-[#706c64] uppercase tracking-wider font-mono">
                  Accepts Group Picture.jpeg, PNG, WEBP
                </p>
              </>
            )}
          </div>
        )}

        {/* Hidden File Input for Direct Local Selection (Admin Only) */}
        {isEffectiveAdmin && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />
        )}

        {/* Executive Brass Nameplate Bar */}
        <div className="py-3 px-4 sm:px-6 bg-[#0c0c11] border-t border-[#c59b63]/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 text-[#c59b63] flex-shrink-0 hidden sm:block">
              <LalusisLogoMark className="w-full h-full" />
            </div>
            <div>
              <span className="font-cinzel text-[11px] sm:text-xs font-bold tracking-[0.22em] text-[#f4e6d0] uppercase block">
                Founding Partners · Lalusis &amp; Partners
              </span>
              <span className="font-sans text-[11px] text-[#c59b63] tracking-wide block sm:inline mt-0.5">
                Atty. Levy John L.V. Lalusis · Senior Partner Atty. Diosdado Anselmo Q. Lalusis · Atty. Leo Anselmo L.V. Lalusis
              </span>
            </div>
          </div>

          {/* Update Photo button - strictly visible on admin side only */}
          {isEffectiveAdmin && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 bg-[#14141c] hover:bg-[#c59b63]/20 border border-[#c59b63]/40 text-[#c59b63] hover:text-[#f4e6d0] text-[10px] font-cinzel uppercase tracking-wider transition-all cursor-pointer"
            >
              <Upload className="w-3 h-3" />
              <span>{hasError ? 'Upload Photo' : 'Update Photo'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const RenderSectionItem: React.FC<{
  section: PageSection;
  onNavigate: (path: string) => void;
  editMode?: boolean;
  isAdmin?: boolean;
  activeElementPart?: string | null;
  onSelectPart?: (part: string) => void;
}> = ({ section, onNavigate, editMode, isAdmin, activeElementPart, onSelectPart }) => {
  const { type, content, background, paddingY, typography } = section;
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<any | null>(null);
  const [selectedPartnerModal, setSelectedPartnerModal] = useState<Attorney | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeVideoModal) setActiveVideoModal(null);
        if (selectedPartnerModal) setSelectedPartnerModal(null);
      }
    };
    if (activeVideoModal || selectedPartnerModal) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeVideoModal, selectedPartnerModal]);

  const bgClasses = {
    dark: 'bg-[#0d0d11] text-[#f7f4ee]',
    charcoal: 'bg-[#121217] text-[#f7f4ee]',
    surface: 'bg-[#17171f] text-[#f7f4ee]',
    gold_tint: 'bg-gradient-to-b from-[#141318] via-[#1a1714] to-[#121217] text-[#f7f4ee]',
  };

  const pyClasses = {
    none: 'py-0',
    sm: 'py-8 sm:py-12',
    md: 'py-14 sm:py-20',
    lg: 'py-20 sm:py-28',
    xl: 'py-24 sm:py-36',
  };

  const bg = bgClasses[background || 'dark'];
  const py = pyClasses[paddingY || 'md'];
  const typo = resolveTypography(typography);
  const headTypo = resolvePartTypography(section, 'headline', typography?.fontFamily || 'cormorant');
  const subTypo = resolvePartTypography(section, 'subheadline', 'sans');
  const bodyTypo = resolvePartTypography(section, 'body', 'sans');
  const eyeTypo = resolvePartTypography(section, 'eyebrow', 'cinzel');
  const statsTypo = resolvePartTypography(section, 'stats', 'cormorant');
  const buttonsTypo = resolvePartTypography(section, 'buttons', 'cinzel');
  const cardsTypo = resolvePartTypography(section, 'cards', 'cormorant');
  const quoteTypo = resolvePartTypography(section, 'quote', 'cormorant');

  switch (type) {
    case 'hero': {
      const isLeft = headTypo.alignment === 'left';
      const isRight = headTypo.alignment === 'right';
      const isJustify = headTypo.alignment === 'justify';

      const justifyClass = isLeft ? 'justify-start' : isRight ? 'justify-end' : 'justify-center';
      const marginClass = isLeft
        ? 'mr-auto ml-0 text-left'
        : isRight
        ? 'ml-auto mr-0 text-right'
        : isJustify
        ? 'mx-auto text-justify'
        : 'mx-auto text-center';

      return (
        <section className={`relative overflow-hidden ${bg} ${py} border-b border-[#1c1c25]`}>
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#c59b63_1px,transparent_1px)] [background-size:24px_24px]" />
          
          <div className={`max-w-6xl mx-auto px-6 lg:px-12 relative z-10 ${headTypo.alignClass} space-y-8`}>
            {/* Part 1: Authentic Brand Emblem / Logo */}
            {content.showLogo !== false && (
              <EditablePartWrapper
                editMode={editMode}
                partId="logo"
                partLabel="Firm Logo / Emblem Crest"
                activeElementPart={activeElementPart}
                onSelectPart={onSelectPart}
                className={`flex ${justifyClass} mb-6`}
              >
                <div className="p-6 sm:p-8 bg-[#0a0a0d]/95 border-2 border-[#c59b63]/50 shadow-[0_0_60px_rgba(197,155,99,0.22)] inline-block backdrop-blur-sm">
                  {content.customLogoUrl ? (
                    <img
                      src={content.customLogoUrl}
                      alt="Firm Logo"
                      className="object-contain"
                      style={{
                        height: content.logoSize === 'sm' ? 120 : content.logoSize === 'lg' ? 240 : 180,
                        maxHeight: 260,
                      }}
                    />
                  ) : (
                    <LalusisLogoMark size={content.logoSize === 'sm' ? 120 : content.logoSize === 'lg' ? 240 : 180} />
                  )}
                </div>
              </EditablePartWrapper>
            )}

            {/* Part 2: Eyebrow */}
            <EditablePartWrapper
              editMode={editMode}
              partId="eyebrow"
              partLabel="Eyebrow / Pre-Title"
              activeElementPart={activeElementPart}
              onSelectPart={onSelectPart}
              className={`inline-flex items-center gap-3 ${eyeTypo.justifyClass}`}
            >
              <div className="h-[1px] w-8 bg-[#c59b63]/40" />
              <span
                style={eyeTypo.customStyle}
                className={`${eyeTypo.fontClass} ${eyeTypo.sizeClass || 'text-xs'} uppercase tracking-[0.3em] ${eyeTypo.colorClass || 'text-[#d4af7a]'} ${eyeTypo.weightClass || 'font-medium'} ${eyeTypo.trackingClass} ${eyeTypo.italicClass}`}
              >
                {content.eyebrow || 'Attorneys at Law · Established 1998'}
              </span>
              <div className="h-[1px] w-8 bg-[#c59b63]/40" />
            </EditablePartWrapper>

            {/* Part 3: Main Headline (Header 1) */}
            <EditablePartWrapper
              editMode={editMode}
              partId="headline"
              partLabel="Header 1 (Main Headline)"
              activeElementPart={activeElementPart}
              onSelectPart={onSelectPart}
            >
              <h1
                style={headTypo.customStyle}
                className={`${headTypo.fontClass} ${headTypo.sizeClass || 'text-4xl sm:text-6xl lg:text-7xl'} ${headTypo.trackingClass} ${headTypo.weightClass} ${headTypo.colorClass} ${headTypo.uppercaseClass} ${headTypo.italicClass} leading-[1.1] max-w-4xl ${headTypo.marginClass}`}
              >
                {content.headline && !content.headline.includes('Strategic Counsel')
                  ? content.headline
                  : 'Legal Precision.'}
              </h1>
            </EditablePartWrapper>

            {/* Part 4: Subheadline / Paragraph */}
            <EditablePartWrapper
              editMode={editMode}
              partId="subheadline"
              partLabel="Subtitle / Paragraph Description"
              activeElementPart={activeElementPart}
              onSelectPart={onSelectPart}
            >
              <p
                style={subTypo.customStyle}
                className={`${subTypo.fontClass} ${subTypo.sizeClass || 'text-sm sm:text-lg'} ${subTypo.colorClass} ${subTypo.weightClass} ${subTypo.trackingClass} ${subTypo.uppercaseClass} ${subTypo.italicClass} max-w-2xl ${subTypo.marginClass} leading-relaxed`}
              >
                {content.subheadline ||
                  'Representing multinational corporations, prominent families, and industry pioneers across high-stakes corporate transactions, commercial litigation, and appellate advocacy.'}
              </p>
            </EditablePartWrapper>

            {/* Part 5: Call to Action Buttons */}
            <EditablePartWrapper
              editMode={editMode}
              partId="buttons"
              partLabel="Action Buttons (Primary & Secondary CTA)"
              activeElementPart={activeElementPart}
              onSelectPart={onSelectPart}
              className={`pt-4 flex flex-col sm:flex-row items-center ${justifyClass} gap-4`}
            >
              <Button
                variant="primary"
                size="lg"
                onClick={() => onNavigate(content.ctaPrimaryLink || content.primaryCtaLink || '/consultation')}
                className={`${buttonsTypo.fontClass} ${buttonsTypo.sizeClass} ${buttonsTypo.trackingClass} ${buttonsTypo.uppercaseClass} ${buttonsTypo.italicClass}`}
                style={buttonsTypo.customStyle}
              >
                {content.ctaPrimaryText || content.primaryCtaText || 'Request Consultation'}
              </Button>
              <Button
                variant="gold-outline"
                size="lg"
                onClick={() => onNavigate(content.ctaSecondaryLink || content.secondaryCtaLink || '/practice-areas')}
                className={`${buttonsTypo.fontClass} ${buttonsTypo.sizeClass} ${buttonsTypo.trackingClass} ${buttonsTypo.uppercaseClass} ${buttonsTypo.italicClass}`}
                style={buttonsTypo.customStyle}
              >
                {content.ctaSecondaryText || content.secondaryCtaText || 'Explore Practice Areas'}
              </Button>
            </EditablePartWrapper>

            {/* Part 6: 3 Embedded Videos (Clickable & Popupable) */}
            <EditablePartWrapper
              editMode={editMode}
              partId="videos"
              partLabel="Embedded Video Showcase (3 Features)"
              activeElementPart={activeElementPart}
              onSelectPart={onSelectPart}
              className={`pt-10 border-t border-[#1f1f28] w-full max-w-6xl mt-4 ${statsTypo.marginClass}`}
            >
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#c59b63] animate-pulse" />
                    <span className="font-cinzel text-[11px] tracking-[0.25em] text-[#c59b63] uppercase">
                      Executive Video Briefings · Click to Watch
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#8e877e] hidden sm:inline">
                    3 Embedded Features · Interactive Popups
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                  {(
                    (Array.isArray(content.videos) && content.videos.length > 0)
                      ? content.videos
                      : [
                          {
                            id: 'vid-1',
                            title: 'Decisive Trial Advocacy & Bureau Leadership',
                            subtitle: 'Atty. Leo Lalusis · Managing Partner',
                            description: 'Decades of seasoned trial litigation, landmark prosecution commendations, and high-profile public defense.',
                            duration: '03:45',
                            tag: 'Trial Eminence',
                            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                            thumbnailUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
                          },
                          {
                            id: 'vid-2',
                            title: '150+ Supreme Court Rulings & Appellate Advocacy',
                            subtitle: 'Senior Partner Atty. Diosdado Anselmo Lalusis',
                            description: 'Over 150 superior appellate rulings, landmark constitutional advocacy, and unmatched jurisprudential depth.',
                            duration: '04:12',
                            tag: 'Supreme Court Practice',
                            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                            thumbnailUrl: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200&q=80',
                          },
                          {
                            id: 'vid-3',
                            title: '₱180B+ Transactions Advised & Tier 1 Practice',
                            subtitle: 'Atty. Levy John Lalusis · Partner & Tax Specialist',
                            description: 'Cross-border mergers and acquisitions, sovereign regulatory compliance, and premier corporate counsel.',
                            duration: '03:18',
                            tag: 'Corporate & M&A',
                            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                            thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
                          },
                        ]
                  ).map((vid: any, vIdx: number) => (
                    <div
                      key={vid.id || vIdx}
                      role="button"
                      tabIndex={0}
                      aria-label={`Watch ${vid.title}`}
                      onClick={() => {
                        if (editMode) {
                          onSelectPart?.('videos');
                        }
                        setActiveVideoModal(vid);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setActiveVideoModal(vid);
                        }
                      }}
                      className="group relative bg-[#0b0b0f] border border-[#22222e] hover:border-[#c59b63]/70 transition-all duration-300 flex flex-col cursor-pointer overflow-hidden shadow-lg hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)] text-left focus:outline-none focus:ring-1 focus:ring-[#c59b63]"
                    >
                      {/* Video Thumbnail / Preview Container */}
                      <div className="aspect-video relative overflow-hidden bg-black/80">
                        {/* Background Thumbnail Image */}
                        <img
                          src={vid.thumbnailUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80'}
                          alt={vid.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-95"
                          loading="lazy"
                        />
                        {/* Gradient Scrim */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f] via-black/40 to-black/30" />

                        {/* Top Category Badge */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 text-[9px] font-cinzel font-semibold tracking-widest uppercase bg-[#09090c]/90 text-[#c59b63] border border-[#c59b63]/40 backdrop-blur-sm">
                            {vid.tag || `Feature 0${vIdx + 1}`}
                          </span>
                        </div>

                        {/* Top Right Duration Pill */}
                        {vid.duration && (
                          <div className="absolute top-2.5 right-2.5">
                            <span className="px-1.5 py-0.5 text-[9px] font-mono tracking-wider bg-black/85 text-[#ded6c9] border border-white/10 backdrop-blur-sm">
                              {vid.duration}
                            </span>
                          </div>
                        )}

                        {/* Center Glowing Gold Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#0d0d12]/85 backdrop-blur-md border border-[#c59b63] flex items-center justify-center text-[#c59b63] group-hover:scale-115 group-hover:bg-[#c59b63] group-hover:text-[#09090c] transition-all duration-300 shadow-[0_0_20px_rgba(197,155,99,0.35)] group-hover:shadow-[0_0_30px_rgba(197,155,99,0.7)]">
                            <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5 fill-current" />
                          </div>
                        </div>

                        {/* Bottom helper text inside preview */}
                        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] text-[#ded6c9]/80 font-mono">
                          <span className="flex items-center gap-1 group-hover:text-[#f7f4ee] transition-colors">
                            <Play className="w-2.5 h-2.5 text-[#c59b63] fill-current" /> Watch Feature
                          </span>
                          <span className="text-[#8e877e] group-hover:text-[#c59b63] transition-colors">
                            Popup Player ↗
                          </span>
                        </div>
                      </div>

                      {/* Card Content Description */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5 bg-[#0e0e13]/90 border-t border-[#1a1a24]">
                        <div className="space-y-1">
                          <h3 className="font-cormorant text-base sm:text-lg font-bold text-[#f7f4ee] group-hover:text-[#e4c18f] transition-colors leading-snug line-clamp-1">
                            {vid.title}
                          </h3>
                          {vid.speaker && (
                            <p className="font-cinzel text-[11px] text-[#c59b63] tracking-wider line-clamp-1">
                              {vid.speaker}
                            </p>
                          )}
                          {vid.subtitle && (
                            <p className="text-xs text-[#8e877e] line-clamp-2 leading-relaxed pt-0.5">
                              {vid.subtitle}
                            </p>
                          )}
                        </div>

                        {/* Bottom Expand Action Button */}
                        <div className="pt-2 border-t border-[#1a1a24] flex items-center justify-between text-xs">
                          <span className="font-cinzel text-[10px] text-[#c59b63] group-hover:text-[#f7f4ee] uppercase tracking-wider flex items-center gap-1.5 transition-colors">
                            <span>Watch Popup Video</span>
                            <ArrowRight className="w-3 h-3 text-[#c59b63] group-hover:translate-x-1 transition-transform" />
                          </span>
                          <span className="text-[10px] font-mono text-[#8e877e]">
                            [HD Stream]
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </EditablePartWrapper>
          </div>

          {/* Video Popup Modal */}
          {activeVideoModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
              role="dialog"
              aria-modal="true"
            >
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity cursor-pointer"
                onClick={() => setActiveVideoModal(null)}
              />

              {/* Modal Container */}
              <div className="relative w-full max-w-4xl bg-[#0e0e13] border border-[#c59b63]/50 shadow-2xl z-10 flex flex-col text-left overflow-hidden animate-fadeIn">
                {/* Modal Header */}
                <div className="px-5 py-4 bg-[#121218] border-b border-[#242432] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-cinzel text-[10px] tracking-[0.2em] text-[#c59b63] uppercase block">
                      {activeVideoModal.tag || 'Executive Video Archive'}
                    </span>
                    <h3 className="font-cormorant text-lg sm:text-xl font-bold text-[#f7f4ee]">
                      {activeVideoModal.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveVideoModal(null)}
                    className="p-1.5 text-[#8e877e] hover:text-[#f7f4ee] hover:bg-[#1f1f2b] transition-colors rounded-none flex items-center gap-1.5 text-xs cursor-pointer"
                    title="Close (Esc)"
                  >
                    <span className="font-mono text-[10px] hidden sm:inline text-[#8e877e]">ESC</span>
                    <X className="w-5 h-5 text-[#c59b63]" />
                  </button>
                </div>

                {/* Video Player */}
                <div className="aspect-video w-full bg-black relative overflow-hidden border-b border-[#242432]">
                  {Boolean(
                    activeVideoModal.videoUrl?.includes('youtube.com') ||
                    activeVideoModal.videoUrl?.includes('youtu.be') ||
                    activeVideoModal.videoUrl?.includes('vimeo.com')
                  ) ? (
                    <iframe
                      src={getEmbedVideoUrl(activeVideoModal.videoUrl)}
                      title={activeVideoModal.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <video
                      key={activeVideoModal.videoUrl}
                      autoPlay
                      controls
                      playsInline
                      src={activeVideoModal.videoUrl}
                      className="w-full h-full object-contain"
                    >
                      Your browser does not support HTML5 video playback.
                    </video>
                  )}
                </div>

                {/* Modal Footer / Matter Overview */}
                <div className="p-5 sm:p-6 bg-[#0e0e13] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-xl">
                    {activeVideoModal.speaker && (
                      <p className="font-cinzel text-xs text-[#c59b63] tracking-wider uppercase">
                        {activeVideoModal.speaker}
                      </p>
                    )}
                    {activeVideoModal.description && (
                      <p className="text-xs text-[#ded6c9] leading-relaxed">
                        {activeVideoModal.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Button
                      variant="gold-outline"
                      size="sm"
                      onClick={() => {
                        setActiveVideoModal(null);
                        onNavigate('/consultation');
                      }}
                      className="font-cinzel text-xs"
                    >
                      Request Consultation
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveVideoModal(null)}
                      className="font-cinzel text-xs text-[#8e877e] hover:text-[#f7f4ee]"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      );
    }

    case 'heading':
      return (
        <div className={`${bg} ${py} border-b border-[#1a1a23]`}>
          <div className={`max-w-4xl ${headTypo.marginClass} px-6 ${headTypo.alignClass} space-y-3`}>
            {(content.eyebrow || section.subtitle) && (
              <EditablePartWrapper
                editMode={editMode}
                partId="eyebrow"
                partLabel="Eyebrow / Sub-Header"
                activeElementPart={activeElementPart}
                onSelectPart={onSelectPart}
              >
                <span
                  style={eyeTypo.customStyle}
                  className={`${eyeTypo.fontClass} ${eyeTypo.sizeClass || 'text-[11px]'} font-semibold tracking-[0.25em] ${eyeTypo.colorClass || eyeTypo.subColorClass} uppercase ${eyeTypo.trackingClass} ${eyeTypo.italicClass}`}
                >
                  {content.eyebrow || section.subtitle}
                </span>
              </EditablePartWrapper>
            )}
            <EditablePartWrapper
                editMode={editMode}
                partId="headline"
                partLabel="Section Heading / Title"
                activeElementPart={activeElementPart}
                onSelectPart={onSelectPart}
            >
              <h2
                style={headTypo.customStyle}
                className={`${headTypo.fontClass} ${headTypo.sizeClass || 'text-3xl sm:text-5xl'} ${headTypo.weightClass} ${headTypo.trackingClass} ${headTypo.colorClass} ${headTypo.uppercaseClass} ${headTypo.italicClass} leading-tight`}
              >
                {content.headline || content.heading || section.title}
              </h2>
            </EditablePartWrapper>
            {(content.subheadline || content.subheading) && (
              <EditablePartWrapper
                editMode={editMode}
                partId="subheadline"
                partLabel="Subheadline / Overview"
                activeElementPart={activeElementPart}
                onSelectPart={onSelectPart}
              >
                <p
                  style={subTypo.customStyle}
                  className={`${subTypo.fontClass} ${subTypo.sizeClass || 'text-sm sm:text-base'} ${subTypo.colorClass || subTypo.bodyColorClass} max-w-2xl ${subTypo.marginClass} leading-relaxed pt-1 ${subTypo.weightClass} ${subTypo.trackingClass} ${subTypo.uppercaseClass} ${subTypo.italicClass}`}
                >
                  {content.subheadline || content.subheading}
                </p>
              </EditablePartWrapper>
            )}
            <div className={`w-12 h-[1px] bg-[#c59b63]/60 ${typo.marginClass} mt-4`} />
          </div>
        </div>
      );

    case 'text':
      return (
        <section className={`${bg} ${py} border-b border-[#1a1a23]`}>
          <div className={`max-w-4xl ${headTypo.marginClass} px-6 ${headTypo.alignClass} space-y-5`}>
            {content.eyebrow && (
              <EditablePartWrapper
                editMode={editMode}
                partId="eyebrow"
                partLabel="Eyebrow / Sub-Header"
                activeElementPart={activeElementPart}
                onSelectPart={onSelectPart}
              >
                <span
                  style={eyeTypo.customStyle}
                  className={`${eyeTypo.fontClass} ${eyeTypo.sizeClass || 'text-[11px]'} font-semibold tracking-[0.25em] ${eyeTypo.colorClass || eyeTypo.subColorClass} uppercase block ${eyeTypo.trackingClass} ${eyeTypo.italicClass}`}
                >
                  {content.eyebrow}
                </span>
              </EditablePartWrapper>
            )}
            {(content.headline || content.heading || section.title) && (
              <EditablePartWrapper
                editMode={editMode}
                partId="headline"
                partLabel="Section Heading / Title"
                activeElementPart={activeElementPart}
                onSelectPart={onSelectPart}
              >
                <h2
                  style={headTypo.customStyle}
                  className={`${headTypo.fontClass} ${headTypo.sizeClass || 'text-2xl sm:text-4xl'} ${headTypo.weightClass} ${headTypo.colorClass} leading-tight ${headTypo.trackingClass} ${headTypo.uppercaseClass} ${headTypo.italicClass}`}
                >
                  {content.headline || content.heading || section.title}
                </h2>
              </EditablePartWrapper>
            )}
            <EditablePartWrapper
              editMode={editMode}
              partId="body"
              partLabel="Body Text & Editorial Content"
              activeElementPart={activeElementPart}
              onSelectPart={onSelectPart}
            >
              <div
                style={bodyTypo.customStyle}
                className={`${bodyTypo.fontClass} ${bodyTypo.sizeClass || 'text-base sm:text-lg'} ${bodyTypo.weightClass} ${bodyTypo.trackingClass} ${bodyTypo.bodyColorClass || bodyTypo.colorClass} ${bodyTypo.uppercaseClass} ${bodyTypo.italicClass} ${bodyTypo.dropCapClass} leading-relaxed space-y-4`}
              >
                {(content.body || 'Legal jurisprudence and strategic counsel...').split('\n\n').map((paragraph: string, idx: number) => (
                  <p key={idx} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </EditablePartWrapper>
          </div>
        </section>
      );

    case 'container': {
      const widthClasses: Record<string, string> = {
        sm: 'max-w-3xl',
        md: 'max-w-4xl',
        lg: 'max-w-5xl',
        xl: 'max-w-7xl',
      };
      const borderClasses: Record<string, string> = {
        none: 'border-0',
        subtle: 'border border-[#22222f]',
        gold: 'border border-[#c59b63]/50 shadow-[0_0_30px_rgba(197,155,99,0.08)]',
        double: 'border-2 border-[#c59b63]/80 p-2 ring-1 ring-[#c59b63]/30',
      };

      const maxWidthClass = widthClasses[content.maxWidth || 'lg'] || 'max-w-5xl';
      const borderClass = borderClasses[content.borderStyle || 'gold'] || 'border border-[#c59b63]/50';

      return (
        <section className={`${bg} ${py} border-b border-[#1a1a23]`}>
          <div className={`${maxWidthClass} mx-auto px-6`}>
            <div className={`bg-[#111116] ${borderClass} p-8 sm:p-14 ${typo.alignClass} space-y-6 relative overflow-hidden`}>
              <div className="space-y-3">
                {content.eyebrow && (
                  <EditablePartWrapper
                    editMode={editMode}
                    partId="eyebrow"
                    partLabel="Eyebrow / Category"
                    activeElementPart={activeElementPart}
                    onSelectPart={onSelectPart}
                  >
                    <span
                      style={eyeTypo.customStyle}
                      className={`${eyeTypo.fontClass} ${eyeTypo.sizeClass || 'text-[11px]'} font-semibold tracking-[0.25em] ${eyeTypo.colorClass || 'text-[#c59b63]'} uppercase block ${eyeTypo.trackingClass} ${eyeTypo.italicClass}`}
                    >
                      {content.eyebrow}
                    </span>
                  </EditablePartWrapper>
                )}
                {(content.headline || content.heading || section.title) && (
                  <EditablePartWrapper
                    editMode={editMode}
                    partId="headline"
                    partLabel="Section Heading / Title"
                    activeElementPart={activeElementPart}
                    onSelectPart={onSelectPart}
                  >
                    <h2
                      style={headTypo.customStyle}
                      className={`${headTypo.fontClass} ${headTypo.sizeClass || 'text-2xl sm:text-4xl'} ${headTypo.weightClass} ${headTypo.trackingClass} ${headTypo.colorClass} ${headTypo.uppercaseClass} ${headTypo.italicClass} leading-snug`}
                    >
                      {content.headline || content.heading || section.title}
                    </h2>
                  </EditablePartWrapper>
                )}
              </div>

              {content.body && (
                <EditablePartWrapper
                  editMode={editMode}
                  partId="body"
                  partLabel="Body Text / Description"
                  activeElementPart={activeElementPart}
                  onSelectPart={onSelectPart}
                >
                  <p
                    style={bodyTypo.customStyle}
                    className={`${bodyTypo.fontClass} ${bodyTypo.sizeClass || 'text-sm sm:text-base'} ${bodyTypo.bodyColorClass || 'text-[#b8b0a5]'} ${bodyTypo.weightClass} ${bodyTypo.trackingClass} ${bodyTypo.uppercaseClass} ${bodyTypo.italicClass} leading-relaxed max-w-3xl mx-auto`}
                  >
                    {content.body}
                  </p>
                </EditablePartWrapper>
              )}

              {content.buttonText && (
                <EditablePartWrapper
                  editMode={editMode}
                  partId="buttons"
                  partLabel="Container Button"
                  activeElementPart={activeElementPart}
                  onSelectPart={onSelectPart}
                >
                  <div className={`pt-4 flex ${content.buttonAlign === 'center' ? 'justify-center' : content.buttonAlign === 'right' ? 'justify-end' : 'justify-start'}`}>
                    <Button
                      variant={(content.buttonVariant as any) || 'primary'}
                      size="lg"
                      className={`${buttonsTypo.fontClass} ${buttonsTypo.sizeClass} ${buttonsTypo.trackingClass} ${buttonsTypo.uppercaseClass} ${buttonsTypo.italicClass}`}
                      style={buttonsTypo.customStyle}
                      onClick={() => {
                        if (content.buttonLink?.startsWith('http')) {
                          window.open(content.buttonLink, '_blank');
                        } else {
                          onNavigate(content.buttonLink || '/consultation');
                        }
                      }}
                    >
                      {content.buttonText}
                    </Button>
                  </div>
                </EditablePartWrapper>
              )}
            </div>
          </div>
        </section>
      );
    }

    case 'button': {
      const alignClasses: Record<string, string> = {
        left: 'justify-start',
        center: 'justify-center',
        right: 'justify-end',
      };
      const alignClass = alignClasses[content.buttonAlign || 'center'] || 'justify-center';

      return (
        <section className={`${bg} ${py} border-b border-[#1a1a23]`}>
          <div className="max-w-4xl mx-auto px-6">
            <EditablePartWrapper
              editMode={editMode}
              partId="buttons"
              partLabel="Action Button"
              activeElementPart={activeElementPart}
              onSelectPart={onSelectPart}
            >
              <div className={`flex items-center ${alignClass} gap-4`}>
                <Button
                  variant={(content.buttonVariant as any) || 'primary'}
                  size="lg"
                  className={`${buttonsTypo.fontClass} ${buttonsTypo.sizeClass} ${buttonsTypo.trackingClass} ${buttonsTypo.uppercaseClass} ${buttonsTypo.italicClass}`}
                  style={buttonsTypo.customStyle}
                  onClick={() => {
                    if (content.buttonLink?.startsWith('http')) {
                      window.open(content.buttonLink, '_blank');
                    } else {
                      onNavigate(content.buttonLink || '/consultation');
                    }
                  }}
                >
                  <span>{content.buttonText || 'Take Action'}</span>
                  {content.buttonLink?.startsWith('http') && <ExternalLink className="w-3.5 h-3.5 ml-2" />}
                </Button>
              </div>
            </EditablePartWrapper>
          </div>
        </section>
      );
    }

    case 'video': {
      const aspectClasses: Record<string, string> = {
        '16:9': 'aspect-video',
        '21:9': 'aspect-[21/9]',
        '4:3': 'aspect-[4/3]',
      };
      const aspectClass = aspectClasses[content.aspectRatio || '16:9'] || 'aspect-video';
      const videoUrl = content.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
      const isEmbed = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') || videoUrl.includes('vimeo.com');

      return (
        <section className={`${bg} ${py} border-b border-[#1a1a23]`}>
          <div className="max-w-5xl mx-auto px-6 text-center space-y-4">
            <EditablePartWrapper
              editMode={editMode}
              partId="video"
              partLabel="Video Player Embed"
              activeElementPart={activeElementPart}
              onSelectPart={onSelectPart}
            >
              <div className={`w-full ${aspectClass} bg-[#0a0a0d] border border-[#c59b63]/40 p-1.5 sm:p-2 shadow-2xl relative overflow-hidden`}>
                {isEmbed ? (
                  <iframe
                    src={videoUrl}
                    title={content.caption || 'Video Embed'}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={videoUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </EditablePartWrapper>
            {content.caption && (
              <p className="font-cinzel text-xs text-[#d4af7a] uppercase tracking-wider pt-2">
                {content.caption}
              </p>
            )}
          </div>
        </section>
      );
    }

    case 'news': {
      const allNews = db.getNews(false);
      const filteredNews =
        content.categoryFilter && content.categoryFilter !== 'all'
          ? allNews.filter((n) => n.category === content.categoryFilter)
          : allNews;
      const displayNews = filteredNews.slice(0, content.limit || 3);

      return (
        <section className={`${bg} ${py} border-b border-[#1a1a23]`}>
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className={`flex flex-col md:flex-row md:items-end justify-between mb-12 ${typo.alignClass === 'text-center' ? 'md:items-center text-center' : typo.alignClass === 'text-right' ? 'md:items-end text-right' : 'text-left'}`}>
              <div className={`space-y-3 ${typo.marginClass}`}>
                <EditablePartWrapper
                  editMode={editMode}
                  partId="eyebrow"
                  partLabel="Eyebrow / Sub-Header"
                  activeElementPart={activeElementPart}
                  onSelectPart={onSelectPart}
                >
                  <div className={`flex items-center gap-2 ${eyeTypo.justifyClass}`}>
                    <Bell className={`w-4 h-4 ${eyeTypo.colorClass || eyeTypo.subColorClass}`} />
                    <span
                      style={eyeTypo.customStyle}
                      className={`${eyeTypo.fontClass} ${eyeTypo.sizeClass || 'text-[11px]'} font-semibold tracking-[0.25em] ${eyeTypo.colorClass || eyeTypo.subColorClass} uppercase ${eyeTypo.trackingClass} ${eyeTypo.italicClass}`}
                    >
                      {content.eyebrow || 'Chambers Announcements'}
                    </span>
                  </div>
                </EditablePartWrapper>

                <EditablePartWrapper
                  editMode={editMode}
                  partId="headline"
                  partLabel="News Headline / Section Title"
                  activeElementPart={activeElementPart}
                  onSelectPart={onSelectPart}
                >
                  <h2
                    style={headTypo.customStyle}
                    className={`${headTypo.fontClass} ${headTypo.sizeClass || 'text-3xl sm:text-5xl'} ${headTypo.weightClass} ${headTypo.colorClass} leading-tight ${headTypo.trackingClass} ${headTypo.uppercaseClass} ${headTypo.italicClass}`}
                  >
                    {content.headline || content.heading || section.title || 'Official Dispatches & Regulatory Filings'}
                  </h2>
                </EditablePartWrapper>

                {(content.subheadline || content.subheading || content.description || section.subtitle) && (
                  <EditablePartWrapper
                    editMode={editMode}
                    partId="subheadline"
                    partLabel="Subheadline / Overview Description"
                    activeElementPart={activeElementPart}
                    onSelectPart={onSelectPart}
                  >
                    <p
                      style={subTypo.customStyle}
                      className={`${subTypo.fontClass} ${subTypo.sizeClass || 'text-sm'} ${subTypo.bodyColorClass || subTypo.colorClass} max-w-2xl ${subTypo.marginClass} leading-relaxed ${subTypo.weightClass} ${subTypo.trackingClass} ${subTypo.uppercaseClass} ${subTypo.italicClass}`}
                    >
                      {content.subheadline || content.subheading || content.description || section.subtitle}
                    </p>
                  </EditablePartWrapper>
                )}
              </div>

              <EditablePartWrapper
                editMode={editMode}
                partId="buttons"
                partLabel="Dispatches Navigation Button"
                activeElementPart={activeElementPart}
                onSelectPart={onSelectPart}
              >
                <Button
                  variant="gold-outline"
                  size="sm"
                  onClick={() => onNavigate(content.buttonLink || '/news')}
                  className={`${buttonsTypo.fontClass} ${buttonsTypo.sizeClass} ${buttonsTypo.trackingClass} ${buttonsTypo.uppercaseClass} ${buttonsTypo.italicClass} mt-4 md:mt-0`}
                  style={buttonsTypo.customStyle}
                >
                  {content.buttonText || 'Browse All Dispatches'}
                </Button>
              </EditablePartWrapper>
            </div>

            <EditablePartWrapper
              editMode={editMode}
              partId="cards"
              partLabel="News Dispatches Grid"
              activeElementPart={activeElementPart}
              onSelectPart={onSelectPart}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {displayNews.map((item) => {
                  const itemTitleTypo = resolveItemTypography(item.typography, 'title', {
                    fontFamily: cardsTypo.fontClass,
                    fontSize: cardsTypo.sizeClass || 'text-2xl',
                    color: cardsTypo.colorClass || 'text-[#f7f4ee]',
                  });
                  const itemDescTypo = resolveItemTypography(item.typography, 'desc', {
                    fontFamily: 'font-sans',
                    fontSize: 'text-xs',
                    color: 'text-[#a8a199]',
                  });

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedNews(item)}
                      className="group bg-[#111116] border border-[#22222d] hover:border-[#c59b63]/60 transition-all duration-300 cursor-pointer text-left flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-2xl"
                    >
                      {item.featuredImage && (
                        <div className="h-48 overflow-hidden relative border-b border-[#1c1c25]">
                          <img
                            src={item.featuredImage}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90"
                          />
                          <div className="absolute top-3 left-3 px-2 py-0.5 bg-[#0d0d11]/90 backdrop-blur-sm border border-[#c59b63]/40 text-[#d4af7a] font-cinzel text-[9px] uppercase font-bold tracking-widest">
                            {item.category}
                          </div>
                        </div>
                      )}

                      <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[11px] font-mono text-[#8e877e]">
                            <Calendar className="w-3 h-3 text-[#c59b63]" />
                            <span>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>

                          <h3
                            style={{ ...cardsTypo.customStyle, ...itemTitleTypo.customStyle }}
                            className={`${itemTitleTypo.fontClass} ${itemTitleTypo.sizeClass} ${cardsTypo.weightClass || 'font-light'} ${itemTitleTypo.colorClass} group-hover:text-[#f4e6d0] leading-snug ${cardsTypo.trackingClass} ${cardsTypo.uppercaseClass} ${cardsTypo.italicClass}`}
                          >
                            {item.title}
                          </h3>

                          <p
                            style={itemDescTypo.customStyle}
                            className={`${itemDescTypo.fontClass} ${itemDescTypo.sizeClass} ${itemDescTypo.colorClass} leading-relaxed line-clamp-3`}
                          >
                            {item.excerpt}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-[#1a1a23] flex items-center justify-between text-xs text-[#c59b63] font-cinzel font-semibold uppercase tracking-wider">
                          <span>Read Dispatch</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </EditablePartWrapper>
          </div>

          {/* Detailed Modal Reader for Announcement */}
          {selectedNews && (
            <Modal
              isOpen={Boolean(selectedNews)}
              onClose={() => setSelectedNews(null)}
              title="Official Chamber Dispatch"
              subtitle={`Published ${new Date(selectedNews.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })} · Office of the Managing Partners`}
              maxWidth="2xl"
            >
              <div className="space-y-6 pt-2 text-left">
                {selectedNews.featuredImage && (
                  <div className="border border-[#c59b63]/40 p-1 bg-[#111116]">
                    <img
                      src={selectedNews.featuredImage}
                      alt={selectedNews.title}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <span className="px-2 py-0.5 bg-[#c59b63]/20 text-[#d4af7a] border border-[#c59b63]/50 font-cinzel text-[10px] uppercase font-bold tracking-widest inline-block">
                    {selectedNews.category}
                  </span>
                  <h2 className="font-cormorant text-2xl sm:text-3xl text-[#f7f4ee] font-normal leading-snug">
                    {selectedNews.title}
                  </h2>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-[#ded6c9] leading-relaxed font-sans border-y border-[#1f1f2a] py-5">
                  <p className="font-medium text-[#f4e6d0] text-sm sm:text-base italic font-cormorant">
                    "{selectedNews.excerpt}"
                  </p>
                  <div className="whitespace-pre-line text-[#a8a199] leading-relaxed">
                    {selectedNews.content}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-[#6e6860] font-mono">
                    Lalusis &amp; Partners · Official Record
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedNews(null);
                        onNavigate(`/news/${selectedNews.slug}`);
                      }}
                      className="px-3 py-1.5 text-xs font-cinzel text-[#c59b63] hover:text-[#f4e6d0] uppercase tracking-wider cursor-pointer"
                    >
                      Full Article &rarr;
                    </button>
                    <button
                      onClick={() => setSelectedNews(null)}
                      className="px-4 py-1.5 bg-[#c59b63] text-[#0d0d11] font-cinzel text-xs font-bold uppercase tracking-wider hover:bg-[#d4af7a] cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </Modal>
          )}
        </section>
      );
    }

    case 'image':
      return (
        <section className={`${bg} ${py} border-b border-[#1a1a23]`}>
          <div className="max-w-6xl mx-auto px-6 text-center space-y-3">
            <EditablePartWrapper
              editMode={editMode}
              partId="image"
              partLabel="Image Media Block"
              activeElementPart={activeElementPart}
              onSelectPart={onSelectPart}
            >
              <div className="border border-[#c59b63]/30 p-2 sm:p-3 bg-[#111116] shadow-2xl inline-block w-full">
                <img
                  src={content.imageUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80'}
                  alt={content.caption || 'Chambers Photography'}
                  className="w-full h-80 sm:h-[480px] object-cover filter brightness-95"
                />
              </div>
            </EditablePartWrapper>
            {content.caption && (
              <p className="font-cinzel text-xs text-[#8e877e] uppercase tracking-widest pt-2">
                {content.caption}
              </p>
            )}
          </div>
        </section>
      );

    case 'richText': {
      return (
        <div className={`${bg} ${py} border-b border-[#1a1a23]`}>
          <div className={`max-w-4xl mx-auto px-6 space-y-6 flex flex-col ${typo.flexAlignClass}`}>
            {/* Eyebrow */}
            {Boolean(content.eyebrow) && (
              <EditablePartWrapper
                editMode={editMode}
                partId="eyebrow"
                partLabel="Eyebrow / Sub-Header"
                activeElementPart={activeElementPart}
                onSelectPart={onSelectPart}
              >
                <span
                  style={eyeTypo.customStyle}
                  className={`${eyeTypo.fontClass} ${eyeTypo.sizeClass || 'text-[11px]'} font-semibold tracking-[0.25em] ${eyeTypo.colorClass || eyeTypo.subColorClass} uppercase block ${eyeTypo.trackingClass} ${eyeTypo.italicClass}`}
                >
                  {content.eyebrow}
                </span>
              </EditablePartWrapper>
            )}

            {/* Headline / Title */}
            {Boolean(content.headline || content.heading) && (
              <EditablePartWrapper
                editMode={editMode}
                partId="headline"
                partLabel="Section Heading / Title"
                activeElementPart={activeElementPart}
                onSelectPart={onSelectPart}
                className="w-full"
              >
                <h2
                  style={headTypo.customStyle}
                  className={`${headTypo.fontClass} ${headTypo.sizeClass || 'text-2xl sm:text-4xl'} ${headTypo.weightClass} ${headTypo.colorClass} leading-snug pb-2 border-b border-[#252532] ${headTypo.trackingClass} ${headTypo.uppercaseClass} ${headTypo.italicClass}`}
                >
                  {content.headline || content.heading}
                </h2>
              </EditablePartWrapper>
            )}

            {/* Subheadline / Overview */}
            {Boolean(content.subheadline || content.subheading) && (
              <EditablePartWrapper
                editMode={editMode}
                partId="subheadline"
                partLabel="Subheadline / Overview"
                activeElementPart={activeElementPart}
                onSelectPart={onSelectPart}
                className="w-full"
              >
                <p
                  style={subTypo.customStyle}
                  className={`${subTypo.fontClass} ${subTypo.sizeClass || 'text-sm sm:text-base'} ${subTypo.colorClass || subTypo.subColorClass} ${subTypo.weightClass} ${subTypo.trackingClass} ${subTypo.uppercaseClass} ${subTypo.italicClass}`}
                >
                  {content.subheadline || content.subheading}
                </p>
              </EditablePartWrapper>
            )}

            {/* Upper Part: Partner Group Portrait with Compatible Bespoke Legal Frame */}
            {(content.imageUrl || content.image || section.id === 'sec-intro' || section.subtitle?.toLowerCase().includes('institutional overview') || section.title?.toLowerCase().includes('introduction')) && (
              <EditablePartWrapper
                editMode={editMode}
                partId="image"
                partLabel="Partner Group Portrait / Featured Image"
                activeElementPart={activeElementPart}
                onSelectPart={onSelectPart}
                className="w-full my-2"
              >
                <InstitutionalImageFrame
                  imageUrl={content.imageUrl || content.image || '/assets/group-picture.svg'}
                  imageAlt={content.imageAlt || 'Lalusis & Partners Founding Partners'}
                  caption={content.imageCaption || 'Partners of Lalusis & Partners · Atty. Levy John L.V. Lalusis, Senior Partner Atty. Diosdado Anselmo Q. Lalusis, and Atty. Leo Anselmo L.V. Lalusis'}
                  sectionId={section.id}
                  editMode={editMode}
                  isAdmin={isAdmin}
                />
              </EditablePartWrapper>
            )}

            {/* Body: Institutional Overview Content Justified */}
            <EditablePartWrapper
              editMode={editMode}
              partId="body"
              partLabel="Body Text & Editorial Content"
              activeElementPart={activeElementPart}
              onSelectPart={onSelectPart}
              className="w-full"
            >
              <div
                style={bodyTypo.customStyle}
                className={`space-y-4 sm:space-y-5 ${bodyTypo.fontClass} ${bodyTypo.sizeClass || 'text-sm sm:text-base'} ${bodyTypo.bodyColorClass || bodyTypo.colorClass} leading-relaxed sm:leading-loose text-justify [text-align-last:left] [text-justify:inter-word] hyphens-auto ${bodyTypo.italicClass} ${bodyTypo.trackingClass} ${bodyTypo.dropCapClass}`}
              >
                {(content.body || '').split('\n\n').map((para: string, i: number) => (
                  <p
                    key={i}
                    className="leading-relaxed sm:leading-loose text-justify [text-align-last:left] [text-justify:inter-word] text-[#ded6c9]"
                  >
                    {para}
                  </p>
                ))}
              </div>
            </EditablePartWrapper>

            {/* Optional Stats */}
            {Boolean(
              content.stat1Number ||
              content.badge1Value ||
              content.stats ||
              content.items
            ) && (
              <EditablePartWrapper
                editMode={editMode}
                partId="stats"
                partLabel="Key Metrics & Milestones"
                activeElementPart={activeElementPart}
                onSelectPart={onSelectPart}
                className="w-full pt-6 mt-4 border-t border-[#1f1f2a]"
              >
                {(() => {
                  const statList = [
                    {
                      value: content.stat1Number || content.badge1Value,
                      label: content.stat1Label || content.badge1Label || 'Appellate Advocacy',
                    },
                    {
                      value: content.stat2Number || content.badge2Value,
                      label: content.stat2Label || content.badge2Label || 'Deals Advised',
                    },
                    {
                      value: content.stat3Number || content.badge3Value,
                      label: content.stat3Label || content.badge3Label || 'Retention Rate',
                    },
                    {
                      value: content.stat4Number || content.badge4Value,
                      label: content.stat4Label || content.badge4Label || 'Corporate Retainers',
                    },
                  ].filter((item) => item.value);

                  const itemsToRender =
                    statList.length > 0
                      ? statList
                      : Array.isArray(content.stats)
                      ? content.stats.map((s: any) => ({ value: s.value || s.number, label: s.label }))
                      : Array.isArray(content.items)
                      ? content.items.map((s: any) => ({ value: s.value || s.number, label: s.label }))
                      : [];

                  const colClass =
                    itemsToRender.length === 4
                      ? 'grid-cols-2 lg:grid-cols-4'
                      : itemsToRender.length === 3
                      ? 'grid-cols-1 sm:grid-cols-3'
                      : itemsToRender.length === 2
                      ? 'grid-cols-2'
                      : 'grid-cols-1 sm:grid-cols-3';

                  return (
                    <div className={`grid ${colClass} gap-4 sm:gap-6 ${statsTypo.alignClass}`}>
                      {itemsToRender.map((statItem, idx) => (
                        <div
                          key={idx}
                          className={`p-4 bg-[#111116] border border-[#22222d] transition-colors hover:border-[#c59b63]/40 ${statsTypo.alignClass}`}
                        >
                          <span
                            style={statsTypo.customStyle}
                            className={`${statsTypo.fontClass} ${statsTypo.sizeClass || 'text-3xl sm:text-4xl'} ${statsTypo.weightClass || 'font-light'} ${statsTypo.colorClass || 'text-[#f4e6d0]'} ${statsTypo.trackingClass} ${statsTypo.uppercaseClass} ${statsTypo.italicClass} block leading-tight`}
                          >
                            {statItem.value}
                          </span>
                          <span
                            style={statsTypo.customStyle}
                            className={`${
                              statsTypo.fontFamily === 'sans' ? 'font-sans' : 'font-cinzel'
                            } text-[10px] uppercase tracking-wider ${
                              statsTypo.subColorClass || 'text-[#c59b63]'
                            } mt-1.5 block`}
                          >
                            {statItem.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </EditablePartWrapper>
            )}

            {/* Optional Quote */}
            {content.quote && (
              <EditablePartWrapper
                editMode={editMode}
                partId="quote"
                partLabel="Featured Quote / Inscription"
                activeElementPart={activeElementPart}
                onSelectPart={onSelectPart}
                className="w-full"
              >
                <blockquote
                  style={quoteTypo.customStyle}
                  className={`my-6 border-l-2 border-[#c59b63] pl-6 py-2 ${quoteTypo.fontClass} ${quoteTypo.sizeClass || 'text-xl sm:text-2xl'} ${quoteTypo.colorClass || 'text-[#f4e6d0]'} ${quoteTypo.italicClass || 'italic'} ${quoteTypo.alignClass} bg-[#17171e]/70`}
                >
                  "{content.quote}"
                  {content.quoteAuthor && (
                    <cite
                      className={`block not-italic ${quoteTypo.fontFamily === 'sans' ? 'font-sans' : 'font-cinzel'} text-xs uppercase tracking-widest text-[#c59b63] mt-2`}
                    >
                      — {content.quoteAuthor}
                    </cite>
                  )}
                </blockquote>
              </EditablePartWrapper>
            )}
          </div>
        </div>
      );
    }

    case 'imageText':
      return (
        <div className={`${bg} ${py} border-b border-[#1a1a23]`}>
          <div className="max-w-6xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Media side */}
            <div className="lg:col-span-6 relative order-2 lg:order-1">
              <EditablePartWrapper
                editMode={editMode}
                partId="image"
                partLabel="Chamber Photography & Media"
                activeElementPart={activeElementPart}
                onSelectPart={onSelectPart}
              >
                <div className="relative border border-[#c59b63]/30 p-2 sm:p-3 bg-[#111116]">
                  <img
                    src={
                      content.imageUrl ||
                      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'
                    }
                    alt={content.headline || content.heading || section.title || 'Lalusis Law Office'}
                    className="w-full h-80 sm:h-[420px] object-cover filter brightness-90 contrast-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-4 -right-4 bg-[#0a0a0d] border border-[#c59b63] p-4 text-left shadow-2xl hidden sm:block">
                    <span className="font-cinzel text-[10px] text-[#c59b63] uppercase tracking-widest block">
                      Institutional Standard
                    </span>
                    <p className="font-cormorant text-lg text-[#f4e6d0] mt-0.5">
                      Quezon City Legal Chambers
                    </p>
                  </div>
                </div>
              </EditablePartWrapper>
            </div>

            {/* Text side */}
            <div className={`lg:col-span-6 space-y-6 order-1 lg:order-2 ${headTypo.alignClass}`}>
              {(content.eyebrow || section.subtitle) && (
                <EditablePartWrapper
                  editMode={editMode}
                  partId="eyebrow"
                  partLabel="Eyebrow / Category"
                  activeElementPart={activeElementPart}
                  onSelectPart={onSelectPart}
                >
                  <span
                    style={eyeTypo.customStyle}
                    className={`${eyeTypo.fontClass} ${eyeTypo.sizeClass || 'text-[11px]'} font-semibold tracking-[0.25em] ${eyeTypo.colorClass || eyeTypo.subColorClass} uppercase ${eyeTypo.trackingClass} ${eyeTypo.italicClass}`}
                  >
                    {content.eyebrow || section.subtitle}
                  </span>
                </EditablePartWrapper>
              )}

              <EditablePartWrapper
                editMode={editMode}
                partId="headline"
                partLabel="Section Heading / Title"
                activeElementPart={activeElementPart}
                onSelectPart={onSelectPart}
              >
                <h2
                  style={headTypo.customStyle}
                  className={`${headTypo.fontClass} ${headTypo.sizeClass || 'text-3xl sm:text-5xl'} ${headTypo.weightClass} ${headTypo.colorClass} leading-tight ${headTypo.trackingClass} ${headTypo.uppercaseClass} ${headTypo.italicClass}`}
                >
                  {content.headline || content.heading || section.title || 'Upholding Rigorous Analytical Standards'}
                </h2>
              </EditablePartWrapper>

              {(content.subheadline || content.subheading) && (
                <EditablePartWrapper
                  editMode={editMode}
                  partId="subheadline"
                  partLabel="Subheadline / Overview"
                  activeElementPart={activeElementPart}
                  onSelectPart={onSelectPart}
                >
                  <p
                    style={subTypo.customStyle}
                    className={`${subTypo.fontClass} ${subTypo.sizeClass || 'text-sm sm:text-base'} ${subTypo.colorClass || subTypo.subColorClass} ${subTypo.weightClass} ${subTypo.trackingClass} ${subTypo.uppercaseClass} ${subTypo.italicClass}`}
                  >
                    {content.subheadline || content.subheading}
                  </p>
                </EditablePartWrapper>
              )}

              <EditablePartWrapper
                editMode={editMode}
                partId="body"
                partLabel="Body Text & Strategic Pillars"
                activeElementPart={activeElementPart}
                onSelectPart={onSelectPart}
              >
                <div
                  style={bodyTypo.customStyle}
                  className={`space-y-4 ${bodyTypo.fontClass} ${bodyTypo.sizeClass || 'text-sm'} ${bodyTypo.bodyColorClass || bodyTypo.colorClass} ${bodyTypo.weightClass} ${bodyTypo.trackingClass} ${bodyTypo.uppercaseClass} ${bodyTypo.italicClass} ${bodyTypo.dropCapClass} leading-relaxed`}
                >
                  {(content.body || '').split('\n\n').map((para: string, i: number) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>

                {content.points && content.points.length > 0 && (
                  <ul className="space-y-3 pt-4">
                    {content.points.map((pt: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-[#ded6c9]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c59b63] mt-2 flex-shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </EditablePartWrapper>

              {(content.primaryCtaText || content.buttonText) && (
                <EditablePartWrapper
                  editMode={editMode}
                  partId="buttons"
                  partLabel="Action Button"
                  activeElementPart={activeElementPart}
                  onSelectPart={onSelectPart}
                  className={`pt-2 flex ${buttonsTypo.justifyClass}`}
                >
                  <Button
                    variant="gold-outline"
                    size="md"
                    className={`${buttonsTypo.fontClass} ${buttonsTypo.sizeClass} ${buttonsTypo.trackingClass} ${buttonsTypo.uppercaseClass} ${buttonsTypo.italicClass}`}
                    style={buttonsTypo.customStyle}
                    onClick={() => onNavigate(content.primaryCtaLink || content.buttonLink || '/about')}
                  >
                    {content.primaryCtaText || content.buttonText}
                  </Button>
                </EditablePartWrapper>
              )}
            </div>
          </div>
        </div>
      );

    case 'practiceAreas': {
      const practiceList = db.getPracticeAreas(false).slice(0, content.limit || 6);
      return (
        <section className={`${bg} ${py} border-b border-[#1a1a23]`}>
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className={`max-w-3xl ${headTypo.marginClass} mb-14 space-y-3 ${headTypo.alignClass}`}>
              <EditablePartWrapper
                editMode={editMode}
                partId="eyebrow"
                partLabel="Eyebrow / Category"
                activeElementPart={activeElementPart}
                onSelectPart={onSelectPart}
              >
                <span
                  style={eyeTypo.customStyle}
                  className={`${eyeTypo.fontClass} ${eyeTypo.sizeClass || 'text-[11px]'} font-semibold tracking-[0.25em] ${eyeTypo.colorClass || eyeTypo.subColorClass} uppercase ${eyeTypo.trackingClass} ${eyeTypo.italicClass}`}
                >
                  {content.eyebrow || 'Core Legal Disciplines'}
                </span>
              </EditablePartWrapper>

              <EditablePartWrapper
                editMode={editMode}
                partId="headline"
                partLabel="Section Heading / Title"
                activeElementPart={activeElementPart}
                onSelectPart={onSelectPart}
              >
                <h2
                  style={headTypo.customStyle}
                  className={`${headTypo.fontClass} ${headTypo.sizeClass || 'text-3xl sm:text-5xl'} ${headTypo.weightClass} ${headTypo.colorClass} leading-tight ${headTypo.trackingClass} ${headTypo.uppercaseClass} ${headTypo.italicClass}`}
                >
                  {content.headline || content.heading || section.title || 'Institutional Practice Areas'}
                </h2>
              </EditablePartWrapper>

              <EditablePartWrapper
                editMode={editMode}
                partId="subheadline"
                partLabel="Subtitle / Overview Description"
                activeElementPart={activeElementPart}
                onSelectPart={onSelectPart}
              >
                <p
                  style={subTypo.customStyle}
                  className={`${subTypo.fontClass} ${subTypo.sizeClass || 'text-sm'} ${subTypo.bodyColorClass || subTypo.colorClass} max-w-2xl ${subTypo.marginClass} leading-relaxed ${subTypo.weightClass} ${subTypo.trackingClass} ${subTypo.uppercaseClass} ${subTypo.italicClass}`}
                >
                  {content.subheadline ||
                    content.subheading ||
                    content.description ||
                    section.subtitle ||
                    'Structured multi-disciplinary advocacy engineered for high-stakes corporate disputes, sovereign regulations, and cross-border transactions.'}
                </p>
              </EditablePartWrapper>
            </div>

            <EditablePartWrapper
              editMode={editMode}
              partId="cards"
              partLabel="Practice Area Cards Grid"
              activeElementPart={activeElementPart}
              onSelectPart={onSelectPart}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {practiceList.map((area) => {
                  const itemTitleTypo = resolveItemTypography(area.typography, 'title', {
                    fontFamily: cardsTypo.fontClass,
                    fontSize: cardsTypo.sizeClass || 'text-2xl',
                    color: cardsTypo.colorClass || 'text-[#f7f4ee]',
                  });
                  const itemDescTypo = resolveItemTypography(area.typography, 'desc', {
                    fontFamily: 'font-sans',
                    fontSize: 'text-xs',
                    color: 'text-[#a8a199]',
                  });

                  return (
                    <div
                      key={area.id}
                      onClick={() => onNavigate(`/practice-areas/${area.slug}`)}
                      className="group bg-[#111116] border border-[#22222d] hover:border-[#c59b63]/60 p-8 transition-all duration-300 flex flex-col justify-between cursor-pointer text-left"
                    >
                      <div className="space-y-4">
                        <div className="w-10 h-10 bg-[#191922] border border-[#2e2e3d] group-hover:border-[#c59b63] flex items-center justify-center text-[#c59b63] transition-colors">
                          <Scale className="w-5 h-5" />
                        </div>
                        <h3
                          style={{ ...cardsTypo.customStyle, ...itemTitleTypo.customStyle }}
                          className={`${itemTitleTypo.fontClass} ${itemTitleTypo.sizeClass} ${cardsTypo.weightClass || 'font-light'} ${itemTitleTypo.colorClass} group-hover:text-[#f4e6d0] ${cardsTypo.trackingClass} ${cardsTypo.uppercaseClass} ${cardsTypo.italicClass}`}
                        >
                          {area.title}
                        </h3>
                        <p
                          style={itemDescTypo.customStyle}
                          className={`${itemDescTypo.fontClass} ${itemDescTypo.sizeClass} ${itemDescTypo.colorClass} leading-relaxed line-clamp-3`}
                        >
                          {area.shortDescription}
                        </p>
                      </div>
                      <div className="pt-6 border-t border-[#1a1a23] mt-6 flex items-center justify-between text-[11px] font-cinzel uppercase tracking-wider text-[#c59b63]">
                        <span>View Discipline</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </EditablePartWrapper>
          </div>
        </section>
      );
    }

    case 'attorneys': {
      const allAttorneys = db.getAttorneys(false);
      
      // Explicit 3 Solo Card Partners Layout requested by user:
      // Left Side: Atty. Levy John Lalusis
      // Center: Atty. Diosdado Anselmo Lalusis
      // Right Side: Atty. Leo Lalusis
      const levy = allAttorneys.find((a) => a.id === 'atty-2' || a.fullName.toLowerCase().includes('levy'));
      const diosdado = allAttorneys.find((a) => a.id === 'atty-3' || a.fullName.toLowerCase().includes('diosdado'));
      const leo = allAttorneys.find((a) => a.id === 'atty-1' || a.fullName.toLowerCase().includes('leo'));

      let attorneys: Attorney[] = [];
      if (levy && diosdado && leo) {
        attorneys = [levy, diosdado, leo];
      } else {
        const partnerAttorneys = allAttorneys.filter((a) => a.isPartner);
        attorneys = (partnerAttorneys.length >= 3 ? partnerAttorneys : allAttorneys)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .slice(0, content.limit || 3);
      }

      return (
        <section className={`${bg} ${py} border-b border-[#1a1a23]`}>
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className={`max-w-3xl ${headTypo.marginClass} mb-14 space-y-3 ${headTypo.alignClass}`}>
              <EditablePartWrapper
                editMode={editMode}
                partId="eyebrow"
                partLabel="Eyebrow / Category"
                activeElementPart={activeElementPart}
                onSelectPart={onSelectPart}
              >
                <span
                  style={eyeTypo.customStyle}
                  className={`${eyeTypo.fontClass} ${eyeTypo.sizeClass || 'text-[11px]'} font-semibold tracking-[0.25em] ${eyeTypo.colorClass || eyeTypo.subColorClass} uppercase ${eyeTypo.trackingClass} ${eyeTypo.italicClass}`}
                >
                  {content.eyebrow || 'Partners'}
                </span>
              </EditablePartWrapper>

              <EditablePartWrapper
                editMode={editMode}
                partId="headline"
                partLabel="Section Heading / Title"
                activeElementPart={activeElementPart}
                onSelectPart={onSelectPart}
              >
                <h2
                  style={headTypo.customStyle}
                  className={`${headTypo.fontClass} ${headTypo.sizeClass || 'text-3xl sm:text-5xl'} ${headTypo.weightClass} ${headTypo.colorClass} leading-tight ${headTypo.trackingClass} ${headTypo.uppercaseClass} ${headTypo.italicClass}`}
                >
                  {content.headline || content.heading || section.title || 'Distinguished Partners'}
                </h2>
              </EditablePartWrapper>

              {(content.subheadline || content.subheading || content.description || section.subtitle) && (
                <EditablePartWrapper
                  editMode={editMode}
                  partId="subheadline"
                  partLabel="Subtitle / Overview Description"
                  activeElementPart={activeElementPart}
                  onSelectPart={onSelectPart}
                >
                  <p
                    style={subTypo.customStyle}
                    className={`${subTypo.fontClass} ${subTypo.sizeClass || 'text-sm'} ${subTypo.bodyColorClass || subTypo.colorClass} max-w-2xl ${subTypo.marginClass} leading-relaxed ${subTypo.weightClass} ${subTypo.trackingClass} ${subTypo.uppercaseClass} ${subTypo.italicClass}`}
                  >
                    {content.subheadline || content.subheading || content.description || section.subtitle}
                  </p>
                </EditablePartWrapper>
              )}
            </div>

            <EditablePartWrapper
              editMode={editMode}
              partId="cards"
              partLabel="Partners Solo Cards Panel (Click to View Full Credentials)"
              activeElementPart={activeElementPart}
              onSelectPart={onSelectPart}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {attorneys.map((atty) => {
                  const roleBadge = atty.professionalTitle.includes('Senior')
                    ? 'Senior Partner'
                    : 'Founding Partner';

                  return (
                    <div
                      key={atty.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`View credentials and certificates of ${atty.fullName}`}
                      onClick={() => {
                        if (editMode) {
                          onSelectPart?.('cards');
                        }
                        setSelectedPartnerModal(atty);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedPartnerModal(atty);
                        }
                      }}
                      className="group relative bg-[#101015] border border-[#232330] hover:border-[#c59b63] transition-all duration-300 cursor-pointer text-left overflow-hidden flex flex-col shadow-xl hover:shadow-[0_12px_35px_rgba(197,155,99,0.18)] focus:outline-none focus:ring-1 focus:ring-[#c59b63]"
                    >
                      {/* Portrait Frame with Executive Brass Accent */}
                      <div className="aspect-[4/5] sm:h-80 overflow-hidden relative bg-[#0a0a0e]">
                        <img
                          src={atty.portraitUrl || getPartnerOfficialPortrait(atty.fullName, atty.slug, atty.id)}
                          alt={atty.fullName}
                          onError={(e) => {
                            const target = e.currentTarget;
                            const fallback = getPartnerOfficialPortrait(atty.fullName, atty.slug, atty.id);
                            if (!target.src.endsWith(fallback)) {
                              target.src = fallback;
                            } else if (!target.src.includes('attorney-placeholder.svg')) {
                              target.src = '/assets/attorney-placeholder.svg';
                            }
                          }}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 filter brightness-95 group-hover:brightness-100"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                        {/* Gradient Scrim */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#101015] via-black/25 to-transparent opacity-90" />

                        {/* Top Role Badge */}
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 text-[9px] font-cinzel font-semibold tracking-widest uppercase bg-[#0a0a0d]/90 text-[#c59b63] border border-[#c59b63]/40 backdrop-blur-sm shadow-md">
                            {roleBadge}
                          </span>
                        </div>

                        {/* Hover Overlay Hint */}
                        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="px-2.5 py-1 text-[9px] font-cinzel tracking-wider uppercase bg-[#c59b63] text-[#09090c] font-bold shadow-md flex items-center gap-1">
                            <span>View Full Credentials</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>

                      {/* Solo Card Body */}
                      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4 bg-[#101015] border-t border-[#1e1e28]">
                        <div className="space-y-2">
                          <span className="font-cinzel text-[10px] text-[#c59b63] uppercase tracking-[0.2em] block font-semibold">
                            {atty.professionalTitle}
                          </span>
                          <h3
                            style={cardsTypo.customStyle}
                            className={`${cardsTypo.fontClass} ${cardsTypo.sizeClass || 'text-2xl'} ${cardsTypo.colorClass || 'text-[#f7f4ee]'} font-semibold group-hover:text-[#e4c18f] transition-colors ${cardsTypo.trackingClass} ${cardsTypo.uppercaseClass} ${cardsTypo.italicClass}`}
                          >
                            {atty.fullName}
                          </h3>
                          <p className="text-xs text-[#a8a199] line-clamp-2 leading-relaxed font-sans">
                            {atty.primarySpecialization}
                          </p>

                          {/* Highlight Badges / Credentials Pills */}
                          <div className="pt-2 flex flex-wrap gap-1.5">
                            {atty.barAdmissions?.[0] && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono bg-[#181822] text-[#c59b63] border border-[#2b2b3b]">
                                <Scale className="w-2.5 h-2.5 text-[#c59b63]" />
                                <span className="truncate max-w-[180px]">
                                  {atty.barAdmissions[0].includes('2019')
                                    ? 'Bar 2019 (1st Attempt)'
                                    : atty.barAdmissions[0].includes('2024')
                                    ? 'Bar 2024 (PACC/NPC/DOTr)'
                                    : 'Bar 1986 (40 Yrs Exp)'}
                                </span>
                              </span>
                            )}
                            {atty.education?.[0] && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono bg-[#181822] text-[#ded6c9] border border-[#2b2b3b]">
                                <GraduationCap className="w-2.5 h-2.5 text-[#a8a199]" />
                                <span className="truncate max-w-[180px]">
                                  {atty.education[0].includes('Master of Laws')
                                    ? 'LL.M. Candidate'
                                    : atty.education[0].includes('Tax Compliance')
                                    ? 'Tax Compliance Specialist'
                                    : atty.education[0].includes('Teacher')
                                    ? 'Licensed Prof. Teacher'
                                    : 'Juris Doctor'}
                                </span>
                              </span>
                            )}
                            {atty.awards?.[0] && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono bg-[#181822] text-[#ded6c9] border border-[#2b2b3b]">
                                <Award className="w-2.5 h-2.5 text-[#c59b63]" />
                                <span className="truncate max-w-[180px]">
                                  {atty.awards[0].includes('NBI')
                                    ? 'NBI Commended'
                                    : atty.awards[0].includes('PRC')
                                    ? 'PRC Legal Head (10+ Yrs)'
                                    : 'Certified TCS & DPO'}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Interactive Bottom Action Button */}
                        <div className="pt-3 border-t border-[#1e1e28] flex items-center justify-between">
                          <span className="font-cinzel text-[11px] text-[#c59b63] group-hover:text-[#f7f4ee] uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-colors">
                            <span>Full Credentials &amp; Certifications</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#c59b63] group-hover:translate-x-1 transition-transform" />
                          </span>
                          <span className="text-[10px] font-mono text-[#8e877e]">
                            [Clickable Popup]
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </EditablePartWrapper>
          </div>

          {/* Full Information, Credentials & Certificates Popup Modal */}
          {selectedPartnerModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
              role="dialog"
              aria-modal="true"
            >
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity cursor-pointer"
                onClick={() => setSelectedPartnerModal(null)}
              />

              {/* Modal Container */}
              <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#0d0d12] border border-[#c59b63]/60 shadow-[0_0_50px_rgba(0,0,0,0.9)] z-10 flex flex-col text-left overflow-hidden animate-fadeIn">
                {/* Modal Header */}
                <div className="px-6 py-4 bg-[#121218] border-b border-[#242432] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#c59b63]" />
                    <span className="font-cinzel text-[11px] tracking-[0.25em] text-[#c59b63] uppercase font-bold">
                      Official Partner Dossier &amp; Certified Credentials
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPartnerModal(null)}
                    className="p-1.5 text-[#8e877e] hover:text-[#f7f4ee] hover:bg-[#1f1f2b] transition-colors rounded-none flex items-center gap-1.5 text-xs cursor-pointer"
                    title="Close (Esc)"
                  >
                    <span className="font-mono text-[10px] hidden sm:inline text-[#8e877e]">ESC</span>
                    <X className="w-5 h-5 text-[#c59b63]" />
                  </button>
                </div>

                {/* Modal Scrollable Content */}
                <div className="p-6 sm:p-8 overflow-y-auto space-y-8 text-left">
                  {/* Partner Hero Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start pb-8 border-b border-[#21212e]">
                    {/* Portrait Column */}
                    <div className="md:col-span-4 space-y-4">
                      <div className="border border-[#c59b63]/50 p-1.5 bg-[#14141c] shadow-lg">
                        <img
                          src={selectedPartnerModal.portraitUrl || getPartnerOfficialPortrait(selectedPartnerModal.fullName, selectedPartnerModal.slug, selectedPartnerModal.id)}
                          alt={selectedPartnerModal.fullName}
                          onError={(e) => {
                            const target = e.currentTarget;
                            const fallback = getPartnerOfficialPortrait(selectedPartnerModal.fullName, selectedPartnerModal.slug, selectedPartnerModal.id);
                            if (!target.src.endsWith(fallback)) {
                              target.src = fallback;
                            } else if (!target.src.includes('attorney-placeholder.svg')) {
                              target.src = '/assets/attorney-placeholder.svg';
                            }
                          }}
                          className="w-full aspect-[3/4] object-cover object-top filter brightness-95"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="bg-[#121219] border border-[#22222f] p-4 space-y-2.5 text-xs">
                        {selectedPartnerModal.email && (
                          <div className="flex items-center gap-2.5 text-[#ded6c9]">
                            <Mail className="w-4 h-4 text-[#c59b63] shrink-0" />
                            <span className="font-mono text-[11px] truncate">{selectedPartnerModal.email}</span>
                          </div>
                        )}
                        {selectedPartnerModal.directPhone && (
                          <div className="flex items-center gap-2.5 text-[#ded6c9]">
                            <Phone className="w-4 h-4 text-[#c59b63] shrink-0" />
                            <span className="font-mono text-[11px]">{selectedPartnerModal.directPhone}</span>
                          </div>
                        )}
                        <div className="pt-2">
                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full font-cinzel text-xs uppercase"
                            onClick={() => {
                              setSelectedPartnerModal(null);
                              onNavigate('/consultation');
                            }}
                          >
                            Request Consultation
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Details Column */}
                    <div className="md:col-span-8 space-y-4">
                      <div>
                        <span className="font-cinzel text-xs font-semibold text-[#c59b63] uppercase tracking-[0.25em] block">
                          {selectedPartnerModal.professionalTitle}
                        </span>
                        <h2 className="font-cormorant text-3xl sm:text-4xl font-bold text-[#f7f4ee] mt-1">
                          {selectedPartnerModal.fullName}
                        </h2>
                        <p className="text-xs sm:text-sm font-cinzel text-[#ded6c9] tracking-wider mt-1.5 uppercase">
                          Practice Focus: {selectedPartnerModal.primarySpecialization}
                        </p>
                      </div>

                      {/* Professional Narrative */}
                      <div className="space-y-3 pt-2">
                        <h4 className="font-cinzel text-xs font-semibold tracking-[0.2em] text-[#c59b63] uppercase">
                          Executive Biography &amp; Practice Narrative
                        </h4>
                        <p className="text-xs sm:text-sm text-[#c8c0b4] leading-relaxed font-sans text-justify">
                          {selectedPartnerModal.biography}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Executive Credentials & Certificates Highlight Strip */}
                  <div className="bg-[#101017] border border-[#c59b63]/30 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#181824] border border-[#c59b63]/50 flex items-center justify-center text-[#c59b63] shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-cinzel text-[11px] font-bold tracking-[0.2em] text-[#f4e6d0] uppercase block">
                          Official Credentials &amp; Verified Licensures
                        </span>
                        <span className="text-[11px] font-sans text-[#a8a199]">
                          Supreme Court of the Philippines · Active Bar Roll &amp; Accreditations
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 text-[10px] font-mono tracking-wider bg-[#0a0a0e] text-[#c59b63] border border-[#c59b63]/40 uppercase flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c59b63] animate-pulse" />
                        <span>Good Standing</span>
                      </span>
                      <span className="px-2.5 py-1 text-[10px] font-mono tracking-wider bg-[#0a0a0e] text-[#ded6c9] border border-[#2b2b3b] uppercase">
                        Certified Dossier
                      </span>
                    </div>
                  </div>

                  {/* Comprehensive Credentials, Certificates & Honors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    {/* 1. Bar Admissions & Licensure */}
                    {selectedPartnerModal.barAdmissions && selectedPartnerModal.barAdmissions.length > 0 && (
                      <div className="bg-[#121218] border border-[#21212d] p-5 space-y-3">
                        <h4 className="font-cinzel text-xs font-semibold tracking-[0.2em] text-[#f4e6d0] uppercase flex items-center gap-2 border-b border-[#232332] pb-2.5">
                          <Scale className="w-4 h-4 text-[#c59b63]" />
                          <span>Bar Admissions &amp; Supreme Court Licensure</span>
                        </h4>
                        <ul className="space-y-2 text-xs text-[#a8a199] list-disc pl-5 leading-relaxed">
                          {selectedPartnerModal.barAdmissions.map((adm, i) => (
                            <li key={i} className="text-[#ded6c9]">
                              {adm}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 2. Academic Credentials & Certifications */}
                    {selectedPartnerModal.education && selectedPartnerModal.education.length > 0 && (
                      <div className="bg-[#121218] border border-[#21212d] p-5 space-y-3">
                        <h4 className="font-cinzel text-xs font-semibold tracking-[0.2em] text-[#f4e6d0] uppercase flex items-center gap-2 border-b border-[#232332] pb-2.5">
                          <GraduationCap className="w-4 h-4 text-[#c59b63]" />
                          <span>Academic Degrees &amp; Certifications</span>
                        </h4>
                        <ul className="space-y-2 text-xs text-[#a8a199] list-disc pl-5 leading-relaxed">
                          {selectedPartnerModal.education.map((edu, i) => (
                            <li key={i} className="text-[#ded6c9]">
                              {edu}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 3. Government & Regulatory Service Record */}
                    {selectedPartnerModal.professionalExperience && selectedPartnerModal.professionalExperience.length > 0 && (
                      <div className="bg-[#121218] border border-[#21212d] p-5 space-y-3">
                        <h4 className="font-cinzel text-xs font-semibold tracking-[0.2em] text-[#f4e6d0] uppercase flex items-center gap-2 border-b border-[#232332] pb-2.5">
                          <Building2 className="w-4 h-4 text-[#c59b63]" />
                          <span>Government &amp; Institutional Service Record</span>
                        </h4>
                        <ul className="space-y-2 text-xs text-[#a8a199] list-disc pl-5 leading-relaxed">
                          {selectedPartnerModal.professionalExperience.map((exp, i) => (
                            <li key={i} className="text-[#ded6c9]">
                              {exp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 4. Honors, Citations & Awards */}
                    {selectedPartnerModal.awards && selectedPartnerModal.awards.length > 0 && (
                      <div className="bg-[#121218] border border-[#21212d] p-5 space-y-3">
                        <h4 className="font-cinzel text-xs font-semibold tracking-[0.2em] text-[#f4e6d0] uppercase flex items-center gap-2 border-b border-[#232332] pb-2.5">
                          <Award className="w-4 h-4 text-[#c59b63]" />
                          <span>Distinctions, Commendations &amp; Awards</span>
                        </h4>
                        <ul className="space-y-2 text-xs text-[#a8a199] list-disc pl-5 leading-relaxed">
                          {selectedPartnerModal.awards.map((award, i) => (
                            <li key={i} className="text-[#ded6c9]">
                              {award}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 5. Professional Memberships */}
                    {selectedPartnerModal.memberships && selectedPartnerModal.memberships.length > 0 && (
                      <div className="bg-[#121218] border border-[#21212d] p-5 space-y-3">
                        <h4 className="font-cinzel text-xs font-semibold tracking-[0.2em] text-[#f4e6d0] uppercase flex items-center gap-2 border-b border-[#232332] pb-2.5">
                          <ShieldCheck className="w-4 h-4 text-[#c59b63]" />
                          <span>Professional Guilds &amp; Memberships</span>
                        </h4>
                        <ul className="space-y-2 text-xs text-[#a8a199] list-disc pl-5 leading-relaxed">
                          {selectedPartnerModal.memberships.map((mem, i) => (
                            <li key={i} className="text-[#ded6c9]">
                              {mem}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 6. Selected Publications / Research */}
                    {selectedPartnerModal.selectedPublications && selectedPartnerModal.selectedPublications.length > 0 && (
                      <div className="bg-[#121218] border border-[#21212d] p-5 space-y-3">
                        <h4 className="font-cinzel text-xs font-semibold tracking-[0.2em] text-[#f4e6d0] uppercase flex items-center gap-2 border-b border-[#232332] pb-2.5">
                          <BookOpen className="w-4 h-4 text-[#c59b63]" />
                          <span>Selected Legal Publications &amp; Treatises</span>
                        </h4>
                        <ul className="space-y-2 text-xs text-[#a8a199] list-disc pl-5 leading-relaxed">
                          {selectedPartnerModal.selectedPublications.map((pub, i) => (
                            <li key={i} className="text-[#ded6c9] italic">
                              "{pub}"
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 sm:p-5 bg-[#121218] border-t border-[#242432] flex items-center justify-between shrink-0">
                  <span className="text-[11px] font-mono text-[#8e877e] hidden sm:inline">
                    Lalusis &amp; Partners · Verified Partner Registry
                  </span>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <Button
                      variant="gold-outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPartnerModal(null);
                        onNavigate('/consultation');
                      }}
                      className="font-cinzel text-xs"
                    >
                      Schedule Consultation
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPartnerModal(null)}
                      className="font-cinzel text-xs text-[#8e877e] hover:text-[#f7f4ee]"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      );
    }

    case 'stats': {
      const statItems = content.stats || content.items || [
        { label: 'Advocacy History', value: '1986', subtitle: 'Quezon City Chambers' },
        { label: 'Deals Advised', value: '₱180B+', subtitle: 'M&A and Transactions' },
        { label: 'Precedents', value: '150+', subtitle: 'Supreme Court Decisions' },
        { label: 'Corporate Clients', value: '350+', subtitle: 'Institutional Retainers' },
      ];

      return (
        <section className={`${bg} ${py} border-b border-[#1a1a23]`}>
          <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-10">
            {/* Optional Section Header */}
            {(content.eyebrow || content.headline || content.heading || section.title) && (
              <div className={`max-w-3xl ${typo.marginClass} space-y-2.5 ${typo.alignClass}`}>
                {content.eyebrow && (
                  <EditablePartWrapper
                    editMode={editMode}
                    partId="eyebrow"
                    partLabel="Eyebrow / Sub-Header"
                    activeElementPart={activeElementPart}
                    onSelectPart={onSelectPart}
                  >
                    <span
                      style={eyeTypo.customStyle}
                      className={`${eyeTypo.fontClass} ${eyeTypo.sizeClass || 'text-[11px]'} font-semibold tracking-[0.25em] ${eyeTypo.colorClass || eyeTypo.subColorClass} uppercase ${eyeTypo.trackingClass} ${eyeTypo.italicClass}`}
                    >
                      {content.eyebrow}
                    </span>
                  </EditablePartWrapper>
                )}
                <EditablePartWrapper
                  editMode={editMode}
                  partId="headline"
                  partLabel="Section Heading / Title"
                  activeElementPart={activeElementPart}
                  onSelectPart={onSelectPart}
                >
                  <h2
                    style={headTypo.customStyle}
                    className={`${headTypo.fontClass} ${headTypo.sizeClass || 'text-2xl sm:text-4xl'} ${headTypo.weightClass} ${headTypo.colorClass} leading-tight ${headTypo.trackingClass} ${headTypo.uppercaseClass} ${headTypo.italicClass}`}
                  >
                    {content.headline || content.heading || section.title}
                  </h2>
                </EditablePartWrapper>
                {(content.subheadline || content.subheading || section.subtitle) && (
                  <EditablePartWrapper
                    editMode={editMode}
                    partId="subheadline"
                    partLabel="Subtitle / Overview"
                    activeElementPart={activeElementPart}
                    onSelectPart={onSelectPart}
                  >
                    <p
                      style={subTypo.customStyle}
                      className={`${subTypo.fontClass} ${subTypo.sizeClass || 'text-sm'} ${subTypo.colorClass || subTypo.bodyColorClass} max-w-xl ${subTypo.marginClass} leading-relaxed ${subTypo.weightClass} ${subTypo.trackingClass} ${subTypo.uppercaseClass} ${subTypo.italicClass}`}
                    >
                      {content.subheadline || content.subheading || section.subtitle}
                    </p>
                  </EditablePartWrapper>
                )}
              </div>
            )}

            <EditablePartWrapper
              editMode={editMode}
              partId="stats"
              partLabel="Firm Milestone & Quantitative Metrics"
              activeElementPart={activeElementPart}
              onSelectPart={onSelectPart}
            >
              <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 ${statsTypo.alignClass} divide-x divide-[#22222f]/50`}>
                {statItems.map((stat: any, idx: number) => (
                  <div key={idx} className={`px-4 ${statsTypo.alignClass}`}>
                    <div
                      style={statsTypo.customStyle}
                      className={`${statsTypo.fontClass} ${statsTypo.sizeClass || 'text-4xl sm:text-5xl'} ${statsTypo.weightClass || 'font-light'} ${statsTypo.colorClass || 'text-[#f4e6d0]'} ${statsTypo.trackingClass} ${statsTypo.uppercaseClass} ${statsTypo.italicClass} tracking-tight`}
                    >
                      {stat.value || stat.number}
                    </div>
                    <div
                      style={statsTypo.customStyle}
                      className={`${statsTypo.fontFamily === 'sans' ? 'font-sans' : 'font-cinzel'} text-xs uppercase tracking-[0.16em] ${statsTypo.subColorClass || 'text-[#c59b63]'} mt-2`}
                    >
                      {stat.label}
                    </div>
                    {(stat.subtitle || stat.sublabel) && (
                      <div className="text-[11px] text-[#8e877e] mt-1">{stat.subtitle || stat.sublabel}</div>
                    )}
                  </div>
                ))}
              </div>
            </EditablePartWrapper>
          </div>
        </section>
      );
    }

    case 'articles':
    case 'insights': {
      const articleList = db.getArticles(false).slice(0, content.limit || 3);
      return (
        <section className={`${bg} ${py} border-b border-[#1a1a23]`}>
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className={`flex flex-col md:flex-row md:items-end justify-between mb-12 ${headTypo.alignClass === 'text-center' ? 'md:items-center text-center' : headTypo.alignClass === 'text-right' ? 'md:items-end text-right' : 'text-left'}`}>
              <div className={`space-y-3 ${headTypo.marginClass}`}>
                <EditablePartWrapper
                  editMode={editMode}
                  partId="eyebrow"
                  partLabel="Eyebrow / Sub-Header"
                  activeElementPart={activeElementPart}
                  onSelectPart={onSelectPart}
                >
                  <span
                    style={eyeTypo.customStyle}
                    className={`${eyeTypo.fontClass} ${eyeTypo.sizeClass || 'text-[11px]'} font-semibold tracking-[0.25em] ${eyeTypo.colorClass || eyeTypo.subColorClass} uppercase ${eyeTypo.trackingClass} ${eyeTypo.italicClass}`}
                  >
                    {content.eyebrow || 'Scholarly Commentary'}
                  </span>
                </EditablePartWrapper>

                <EditablePartWrapper
                  editMode={editMode}
                  partId="headline"
                  partLabel="Section Heading / Title"
                  activeElementPart={activeElementPart}
                  onSelectPart={onSelectPart}
                >
                  <h2
                    style={headTypo.customStyle}
                    className={`${headTypo.fontClass} ${headTypo.sizeClass || 'text-3xl sm:text-5xl'} ${headTypo.weightClass} ${headTypo.colorClass} leading-tight ${headTypo.trackingClass} ${headTypo.uppercaseClass} ${headTypo.italicClass}`}
                  >
                    {content.headline || content.heading || section.title || 'Legal Insights & Analysis'}
                  </h2>
                </EditablePartWrapper>

                {(content.subheadline || content.subheading || content.description || section.subtitle) && (
                  <EditablePartWrapper
                    editMode={editMode}
                    partId="subheadline"
                    partLabel="Subtitle / Overview"
                    activeElementPart={activeElementPart}
                    onSelectPart={onSelectPart}
                  >
                    <p
                      style={subTypo.customStyle}
                      className={`${subTypo.fontClass} ${subTypo.sizeClass || 'text-sm'} ${subTypo.bodyColorClass || subTypo.colorClass} max-w-xl ${subTypo.marginClass} leading-relaxed ${subTypo.weightClass} ${subTypo.trackingClass} ${subTypo.uppercaseClass} ${subTypo.italicClass}`}
                    >
                      {content.subheadline || content.subheading || content.description || section.subtitle}
                    </p>
                  </EditablePartWrapper>
                )}
              </div>

              <EditablePartWrapper
                editMode={editMode}
                partId="buttons"
                partLabel="Browse Insights Button"
                activeElementPart={activeElementPart}
                onSelectPart={onSelectPart}
              >
                <Button
                  variant="gold-outline"
                  size="sm"
                  onClick={() => onNavigate(content.buttonLink || '/insights')}
                  className={`${buttonsTypo.fontClass} ${buttonsTypo.sizeClass} ${buttonsTypo.trackingClass} ${buttonsTypo.uppercaseClass} ${buttonsTypo.italicClass} mt-4 md:mt-0`}
                  style={buttonsTypo.customStyle}
                >
                  {content.buttonText || 'Browse All Insights'}
                </Button>
              </EditablePartWrapper>
            </div>

            <EditablePartWrapper
              editMode={editMode}
              partId="cards"
              partLabel="Insights Articles Grid"
              activeElementPart={activeElementPart}
              onSelectPart={onSelectPart}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {articleList.map((art) => (
                  <article
                    key={art.id}
                    onClick={() => onNavigate(`/insights/${art.slug}`)}
                    className="group bg-[#111116] border border-[#22222d] hover:border-[#c59b63]/60 transition-all duration-300 cursor-pointer text-left flex flex-col justify-between"
                  >
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between text-[11px] text-[#8e877e]">
                        <span className="font-cinzel uppercase tracking-wider text-[#c59b63]">
                          {art.category}
                        </span>
                        <span>{art.readingTimeMinutes || art.readTime || 5} min read</span>
                      </div>

                      <h3
                        style={cardsTypo.customStyle}
                        className={`${cardsTypo.fontClass} ${cardsTypo.sizeClass || 'text-2xl'} ${cardsTypo.weightClass || 'font-light'} ${cardsTypo.colorClass || 'text-[#f7f4ee]'} group-hover:text-[#f4e6d0] leading-snug ${cardsTypo.trackingClass} ${cardsTypo.uppercaseClass} ${cardsTypo.italicClass}`}
                      >
                        {art.title}
                      </h3>

                      <p className="text-xs text-[#a8a199] leading-relaxed line-clamp-3">
                        {art.excerpt}
                      </p>
                    </div>

                    <div className="p-6 pt-0 border-t border-[#1a1a23] mt-4 flex items-center justify-between text-xs text-[#6e6860]">
                      <span>Official Insight</span>
                      <span className="text-[#c59b63] font-cinzel text-[10px] uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                        Read Note →
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </EditablePartWrapper>
          </div>
        </section>
      );
    }

    case 'faq':
    case 'faqs': {
      const faqs = db.getFAQs(false).slice(0, content.limit || 5);
      return (
        <section className={`${bg} ${py} border-b border-[#1a1a23]`}>
          <div className="max-w-4xl mx-auto px-6">
            <div className={`mb-12 space-y-3 ${headTypo.marginClass} ${headTypo.alignClass}`}>
              <EditablePartWrapper
                editMode={editMode}
                partId="eyebrow"
                partLabel="Eyebrow / Sub-Header"
                activeElementPart={activeElementPart}
                onSelectPart={onSelectPart}
              >
                <span
                  style={eyeTypo.customStyle}
                  className={`${eyeTypo.fontClass} ${eyeTypo.sizeClass || 'text-[11px]'} font-semibold tracking-[0.25em] ${eyeTypo.colorClass || eyeTypo.subColorClass} uppercase ${eyeTypo.trackingClass} ${eyeTypo.italicClass}`}
                >
                  {content.eyebrow || 'Institutional Clarity'}
                </span>
              </EditablePartWrapper>

              <EditablePartWrapper
                editMode={editMode}
                partId="headline"
                partLabel="Section Heading / Title"
                activeElementPart={activeElementPart}
                onSelectPart={onSelectPart}
              >
                <h2
                  style={headTypo.customStyle}
                  className={`${headTypo.fontClass} ${headTypo.sizeClass || 'text-3xl sm:text-5xl'} ${headTypo.weightClass} ${headTypo.colorClass} leading-tight ${headTypo.trackingClass} ${headTypo.uppercaseClass} ${headTypo.italicClass}`}
                >
                  {content.headline || content.heading || section.title || 'Frequently Asked Questions'}
                </h2>
              </EditablePartWrapper>

              {(content.subheadline || content.subheading || section.subtitle) && (
                <EditablePartWrapper
                  editMode={editMode}
                  partId="subheadline"
                  partLabel="Subtitle / Overview Description"
                  activeElementPart={activeElementPart}
                  onSelectPart={onSelectPart}
                >
                  <p
                    style={subTypo.customStyle}
                    className={`${subTypo.fontClass} ${subTypo.sizeClass || 'text-sm'} ${subTypo.bodyColorClass || subTypo.colorClass} max-w-2xl ${subTypo.marginClass} leading-relaxed ${subTypo.weightClass} ${subTypo.trackingClass} ${subTypo.uppercaseClass} ${subTypo.italicClass}`}
                  >
                    {content.subheadline || content.subheading || section.subtitle}
                  </p>
                </EditablePartWrapper>
              )}
            </div>

            <EditablePartWrapper
              editMode={editMode}
              partId="cards"
              partLabel="FAQ Accordion List"
              activeElementPart={activeElementPart}
              onSelectPart={onSelectPart}
            >
              <FaqAccordionList faqs={faqs} />
            </EditablePartWrapper>
          </div>
        </section>
      );
    }

    case 'testimonials':
      return (
        <section className={`${bg} ${py} border-b border-[#1a1a23]`}>
          <div className="max-w-5xl mx-auto px-6 space-y-12">
            <div className={`space-y-3 ${headTypo.marginClass} ${headTypo.alignClass}`}>
              <EditablePartWrapper
                editMode={editMode}
                partId="eyebrow"
                partLabel="Eyebrow / Sub-Header"
                activeElementPart={activeElementPart}
                onSelectPart={onSelectPart}
              >
                <span
                  style={eyeTypo.customStyle}
                  className={`${eyeTypo.fontClass} ${eyeTypo.sizeClass || 'text-[11px]'} font-semibold tracking-[0.25em] ${eyeTypo.colorClass || eyeTypo.subColorClass} uppercase ${eyeTypo.trackingClass} ${eyeTypo.italicClass}`}
                >
                  {content.eyebrow || 'Accolades & Judicial Recognition'}
                </span>
              </EditablePartWrapper>

              <EditablePartWrapper
                editMode={editMode}
                partId="headline"
                partLabel="Section Heading / Title"
                activeElementPart={activeElementPart}
                onSelectPart={onSelectPart}
              >
                <h2
                  style={headTypo.customStyle}
                  className={`${headTypo.fontClass} ${headTypo.sizeClass || 'text-3xl sm:text-5xl'} ${headTypo.weightClass} ${headTypo.colorClass} leading-tight ${headTypo.trackingClass} ${headTypo.uppercaseClass} ${headTypo.italicClass}`}
                >
                  {content.headline || content.heading || section.title || 'Institutional Standing'}
                </h2>
              </EditablePartWrapper>

              {(content.subheadline || content.subheading || section.subtitle) && (
                <EditablePartWrapper
                  editMode={editMode}
                  partId="subheadline"
                  partLabel="Subtitle / Overview"
                  activeElementPart={activeElementPart}
                  onSelectPart={onSelectPart}
                >
                  <p
                    style={subTypo.customStyle}
                    className={`${subTypo.fontClass} ${subTypo.sizeClass || 'text-sm'} ${subTypo.bodyColorClass || subTypo.colorClass} max-w-xl ${subTypo.marginClass} leading-relaxed ${subTypo.weightClass} ${subTypo.trackingClass} ${subTypo.uppercaseClass} ${subTypo.italicClass}`}
                  >
                    {content.subheadline || content.subheading || section.subtitle}
                  </p>
                </EditablePartWrapper>
              )}
            </div>

            <EditablePartWrapper
              editMode={editMode}
              partId="cards"
              partLabel="Testimonials & Peer Accolades"
              activeElementPart={activeElementPart}
              onSelectPart={onSelectPart}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                {(content.testimonials || [
                  {
                    quote:
                      'Lalusis & Partners delivered immaculate appellate counsel before the Supreme Court en banc. Their command of constitutional statutory construction is peerless.',
                    author: 'General Counsel',
                    role: 'Major Philippine Conglomerate',
                  },
                  {
                    quote:
                      'In multi-jurisdictional M&A negotiations, their corporate structuring saved tens of millions in potential exposure. Truly an elite boutique firm.',
                    author: 'Managing Director',
                    role: 'Southeast Asian Sovereign Investment Fund',
                  },
                ]).map((t: any, i: number) => (
                  <div
                    key={i}
                    className="bg-[#111116] border border-[#22222d] p-8 space-y-4 relative"
                  >
                    <div className="text-[#c59b63] font-serif text-3xl">“</div>
                    <p
                      style={quoteTypo.customStyle || cardsTypo.customStyle}
                      className={`${cardsTypo.fontClass || quoteTypo.fontClass || 'font-cormorant'} ${cardsTypo.sizeClass || quoteTypo.sizeClass || 'text-xl'} ${cardsTypo.colorClass || quoteTypo.colorClass || 'text-[#ded6c9]'} leading-relaxed italic ${cardsTypo.trackingClass} ${cardsTypo.uppercaseClass}`}
                    >
                      {t.quote}
                    </p>
                    <div className="pt-4 border-t border-[#1c1c24]">
                      <span className="font-cinzel text-xs text-[#f4e6d0] block uppercase tracking-wider">
                        {t.author}
                      </span>
                      <span className="text-[11px] text-[#8e877e]">{t.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </EditablePartWrapper>
          </div>
        </section>
      );

    case 'cta':
      return (
        <section className={`${bg} ${py} border-b border-[#1a1a23] relative overflow-hidden`}>
          <div className={`max-w-4xl ${headTypo.marginClass} px-6 space-y-6 relative z-10 ${headTypo.alignClass}`}>
            <EditablePartWrapper
              editMode={editMode}
              partId="eyebrow"
              partLabel="Eyebrow / Sub-Header"
              activeElementPart={activeElementPart}
              onSelectPart={onSelectPart}
            >
              <span
                style={eyeTypo.customStyle}
                className={`${eyeTypo.fontClass} ${eyeTypo.sizeClass || 'text-[11px]'} font-semibold tracking-[0.25em] ${eyeTypo.colorClass || eyeTypo.subColorClass} uppercase ${eyeTypo.trackingClass} ${eyeTypo.italicClass}`}
              >
                {content.eyebrow || 'Confidential Engagement'}
              </span>
            </EditablePartWrapper>

            <EditablePartWrapper
              editMode={editMode}
              partId="headline"
              partLabel="Consultation Banner Title"
              activeElementPart={activeElementPart}
              onSelectPart={onSelectPart}
            >
              <h2
                style={headTypo.customStyle}
                className={`${headTypo.fontClass} ${headTypo.sizeClass || 'text-3xl sm:text-5xl'} ${headTypo.weightClass} ${headTypo.colorClass} leading-tight ${headTypo.trackingClass} ${headTypo.uppercaseClass} ${headTypo.italicClass}`}
              >
                {content.headline || content.heading || section.title || 'Schedule an Executive Legal Consultation'}
              </h2>
            </EditablePartWrapper>

            <EditablePartWrapper
              editMode={editMode}
              partId="subheadline"
              partLabel="Subtitle / Advisory Scope"
              activeElementPart={activeElementPart}
              onSelectPart={onSelectPart}
            >
              <p
                style={subTypo.customStyle}
                className={`${subTypo.fontClass} ${subTypo.sizeClass || 'text-sm sm:text-base'} ${subTypo.bodyColorClass || subTypo.colorClass} max-w-2xl ${subTypo.marginClass} leading-relaxed ${subTypo.weightClass} ${subTypo.trackingClass} ${subTypo.uppercaseClass} ${subTypo.italicClass}`}
              >
                {content.subheadline ||
                  content.body ||
                  content.description ||
                  section.subtitle ||
                  'Our partners provide discreet, conflict-cleared guidance on complex corporate, litigation, and cross-border regulatory matters.'}
              </p>
            </EditablePartWrapper>

            <EditablePartWrapper
              editMode={editMode}
              partId="buttons"
              partLabel="Call-To-Action Action Buttons"
              activeElementPart={activeElementPart}
              onSelectPart={onSelectPart}
            >
              <div className={`pt-4 flex flex-col sm:flex-row items-center ${buttonsTypo.justifyClass} gap-4`}>
                <Button
                  variant="primary"
                  size="lg"
                  className={`${buttonsTypo.fontClass} ${buttonsTypo.sizeClass} ${buttonsTypo.trackingClass} ${buttonsTypo.uppercaseClass} ${buttonsTypo.italicClass}`}
                  style={buttonsTypo.customStyle}
                  onClick={() => onNavigate(content.primaryCtaLink || content.buttonLink || '/consultation')}
                >
                  {content.primaryCtaText || content.buttonText || 'Initiate Case Evaluation'}
                </Button>
                <Button
                  variant="gold-outline"
                  size="lg"
                  className={`${buttonsTypo.fontClass} ${buttonsTypo.sizeClass} ${buttonsTypo.trackingClass} ${buttonsTypo.uppercaseClass} ${buttonsTypo.italicClass}`}
                  style={buttonsTypo.customStyle}
                  onClick={() => onNavigate(content.secondaryCtaLink || '/contact')}
                >
                  {content.secondaryCtaText || 'Chambers Contact'}
                </Button>
              </div>
            </EditablePartWrapper>
          </div>
        </section>
      );

    case 'consultationForm':
      return (
        <section className={`${bg} ${py} border-b border-[#1a1a23]`}>
          <div className="max-w-3xl mx-auto px-6">
            <EmbeddedConsultationForm />
          </div>
        </section>
      );

    case 'contact':
    case 'contactInfo':
      return (
        <section className={`${bg} ${py} border-b border-[#1a1a23] relative overflow-hidden`}>
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className={`mb-12 space-y-3 ${headTypo.marginClass} ${headTypo.alignClass}`}>
              <EditablePartWrapper
                editMode={editMode}
                partId="eyebrow"
                partLabel="Eyebrow / Category"
                activeElementPart={activeElementPart}
                onSelectPart={onSelectPart}
              >
                <span
                  style={eyeTypo.customStyle}
                  className={`${eyeTypo.fontClass} ${eyeTypo.sizeClass || 'text-[11px]'} font-semibold tracking-[0.25em] ${eyeTypo.colorClass || eyeTypo.subColorClass} uppercase ${eyeTypo.trackingClass} ${eyeTypo.italicClass}`}
                >
                  {content.eyebrow || 'Chambers & Communications'}
                </span>
              </EditablePartWrapper>

              <EditablePartWrapper
                editMode={editMode}
                partId="headline"
                partLabel="Main Section Headline"
                activeElementPart={activeElementPart}
                onSelectPart={onSelectPart}
              >
                <h2
                  style={headTypo.customStyle}
                  className={`${headTypo.fontClass} ${headTypo.sizeClass || 'text-3xl sm:text-5xl'} ${headTypo.weightClass} ${headTypo.colorClass} leading-tight ${headTypo.trackingClass} ${headTypo.uppercaseClass} ${headTypo.italicClass}`}
                >
                  {content.headline || content.heading || section.title || 'Official Legal Chambers'}
                </h2>
              </EditablePartWrapper>

              {(content.subheadline || content.subheading || section.subtitle) && (
                <EditablePartWrapper
                  editMode={editMode}
                  partId="subheadline"
                  partLabel="Subheadline / Advisory"
                  activeElementPart={activeElementPart}
                  onSelectPart={onSelectPart}
                >
                  <p
                    style={subTypo.customStyle}
                    className={`${subTypo.fontClass} ${subTypo.sizeClass || 'text-sm sm:text-base'} ${subTypo.bodyColorClass || subTypo.colorClass} max-w-2xl ${subTypo.marginClass} leading-relaxed ${subTypo.weightClass} ${subTypo.trackingClass} ${subTypo.uppercaseClass} ${subTypo.italicClass}`}
                  >
                    {content.subheadline || content.subheading || section.subtitle}
                  </p>
                </EditablePartWrapper>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Chambers Directory Cards */}
              <div className="lg:col-span-5 space-y-4">
                <EditablePartWrapper
                  editMode={editMode}
                  partId="cards"
                  partLabel="Chambers Contact Cards"
                  activeElementPart={activeElementPart}
                  onSelectPart={onSelectPart}
                >
                  <div className="space-y-4">
                    <div className="bg-[#121217] border border-[#22222d] hover:border-[#c59b63]/50 p-6 transition-all text-left">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-[#181822] border border-[#2b2b3a] text-[#c59b63] flex-shrink-0">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-cinzel text-xs font-semibold text-[#f4e6d0] uppercase tracking-wider">
                            {content.addressTitle || 'Principal Legal Chambers'}
                          </h4>
                          <p className="text-xs text-[#a8a199] leading-relaxed">
                            {content.address || '110, Unit 20, Suite J, Future Point Plaza Suites, Panay Avenue, South Triangle, 1103, Quezon City, NCR, Second District, Philippines'}
                          </p>
                          <span className="text-[10px] text-[#c59b63] block pt-1 font-mono">
                            By Appointment &amp; Scheduled Retainers
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#121217] border border-[#22222d] hover:border-[#c59b63]/50 p-6 transition-all text-left">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-[#181822] border border-[#2b2b3a] text-[#c59b63] flex-shrink-0">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-cinzel text-xs font-semibold text-[#f4e6d0] uppercase tracking-wider">
                            Direct Telephone Lines
                          </h4>
                          <p className="text-xs text-[#a8a199] leading-relaxed">
                            Primary Mobile / Hotline: <span className="text-[#f7f4ee] font-mono">{content.phone || '+63 917 327 5931'}</span>
                          </p>
                          <p className="text-xs text-[#a8a199] leading-relaxed">
                            Chambers Contact: <span className="text-[#f7f4ee] font-mono">+63 917 327 5931</span>
                          </p>
                          <p className="text-[11px] text-[#8e877e] leading-relaxed pt-1">
                            Urgent Criminal Defense &amp; Injunction Dispatch: 24/7
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#121217] border border-[#22222d] hover:border-[#c59b63]/50 p-6 transition-all text-left">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-[#181822] border border-[#2b2b3a] text-[#c59b63] flex-shrink-0">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-cinzel text-xs font-semibold text-[#f4e6d0] uppercase tracking-wider">
                            Electronic Communications
                          </h4>
                          <p className="text-xs text-[#a8a199] leading-relaxed">
                            General: <span className="text-[#c59b63] font-mono">{content.email || 'lalusispartners@gmail.com'}</span>
                          </p>
                          <p className="text-xs text-[#a8a199] leading-relaxed">
                            Client Intake &amp; Retainer: <span className="text-[#c59b63] font-mono">lalusispartners@gmail.com</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#121217] border border-[#22222d] hover:border-[#c59b63]/50 p-6 transition-all text-left">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-[#181822] border border-[#2b2b3a] text-[#c59b63] flex-shrink-0">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-cinzel text-xs font-semibold text-[#f4e6d0] uppercase tracking-wider">
                            Chambers Hours
                          </h4>
                          <p className="text-xs text-[#a8a199] leading-relaxed">
                            Monday – Friday: 8:30 AM – 6:30 PM PHT
                          </p>
                          <p className="text-[11px] text-[#8e877e] leading-relaxed">
                            Saturday: By Prior Partner Consultation Only
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </EditablePartWrapper>
              </div>

              {/* Consultation Intake Form */}
              <div className="lg:col-span-7">
                <EmbeddedConsultationForm />
              </div>
            </div>
          </div>
        </section>
      );

    case 'divider':
      return (
        <div className="py-4 flex items-center justify-center bg-[#0d0d11]">
          <div className="h-[1px] w-32 bg-[#c59b63]/40" />
        </div>
      );

    case 'spacer':
      return <div className="h-12 sm:h-20 bg-transparent" />;

    default:
      return null;
  }
};

const FaqAccordionList: React.FC<{ faqs: FAQItem[] }> = ({ faqs }) => {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);

  return (
    <div className="divide-y divide-[#22222d] border-y border-[#22222d] text-left">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div key={faq.id} className="py-5">
            <button
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              className="w-full flex items-center justify-between text-left group cursor-pointer"
            >
              <span className="font-cinzel text-sm sm:text-base font-medium text-[#f7f4ee] group-hover:text-[#c59b63] transition-colors pr-4">
                {faq.question}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#c59b63] transform transition-transform duration-200 flex-shrink-0 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="pt-4 text-xs sm:text-sm text-[#a8a199] leading-relaxed font-sans pr-8 animate-fadeIn">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const EmbeddedConsultationForm: React.FC = () => {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [refNumber, setRefNumber] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    practiceArea: 'Corporate & M&A',
    urgencyLevel: 'Standard' as 'Immediate' | 'Standard' | 'Exploratory',
    preferredDate: '',
    preferredTimeSlot: 'Morning (9:00 AM - 12:00 PM)',
    caseSummary: '',
    conflictCheckConsent: true,
  });

  const practiceAreas = db.getPracticeAreas(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.caseSummary) {
      toast.error('Required Fields', 'Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const created = db.createConsultationRequest({
        fullName: formData.fullName,
        emailAddress: formData.email,
        contactNumber: formData.phone,
        company: formData.company,
        practiceAreaId: formData.practiceArea,
        urgencyLevel: formData.urgencyLevel,
        preferredDate: formData.preferredDate || new Date().toISOString().split('T')[0],
        preferredTime: formData.preferredTimeSlot,
        briefConcern: formData.caseSummary,
        privacyConsent: formData.conflictCheckConsent,
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      setRefNumber(created.referenceNumber);
      toast.success('Inquiry Logged', `Your case reference is ${created.referenceNumber}`);
    }, 600);
  };

  if (isSuccess) {
    return (
      <div className="bg-[#121217] border border-[#c59b63] p-8 sm:p-10 text-center space-y-6 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-[#c59b63]/20 border border-[#c59b63] mx-auto flex items-center justify-center text-[#c59b63]">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <span className="font-cinzel text-xs text-[#c59b63] uppercase tracking-[0.2em] block">
            Submission Confirmed
          </span>
          <h3 className="font-cormorant text-2xl sm:text-3xl text-[#f7f4ee]">
            Consultation Request Received
          </h3>
          <p className="text-sm text-[#a8a199] max-w-md mx-auto">
            Your intake request has been routed to our Managing Partner’s intake committee. Reference number:
          </p>
          <div className="py-2">
            <span className="inline-block font-mono text-sm px-4 py-1.5 bg-[#0b0b0e] border border-[#c59b63]/60 text-[#f4e6d0]">
              {refNumber}
            </span>
          </div>
          <p className="text-xs text-[#7e776e]">
            Our chambers will initiate conflict checks and contact you via telephone or encrypted email within 24 to 48 hours.
          </p>
        </div>
        <div className="pt-4">
          <Button
            variant="gold-outline"
            size="sm"
            onClick={() => {
              setIsSuccess(false);
              setFormData({
                fullName: '',
                email: '',
                phone: '',
                company: '',
                practiceArea: 'Corporate & M&A',
                urgencyLevel: 'Standard',
                preferredDate: '',
                preferredTimeSlot: 'Morning (9:00 AM - 12:00 PM)',
                caseSummary: '',
                conflictCheckConsent: true,
              });
            }}
          >
            Submit Another Inquiry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#121217] border border-[#262633] p-8 sm:p-10 space-y-6 text-left shadow-2xl"
    >
      <div className="border-b border-[#22222d] pb-4 mb-2">
        <span className="font-cinzel text-[10px] text-[#c59b63] uppercase tracking-[0.2em] block">
          Intake &amp; Retainer Protocols
        </span>
        <h3 className="font-cormorant text-2xl text-[#f7f4ee] font-light mt-1">
          Confidential Legal Inquiry
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1.5">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="e.g., Atty. Johnathan Doe / Director Smith"
            className="w-full bg-[#0d0d11] border border-[#2a2a35] focus:border-[#c59b63] px-3.5 py-2.5 text-xs text-[#f7f4ee] focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1.5">
            Official Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="name@company.com"
            className="w-full bg-[#0d0d11] border border-[#2a2a35] focus:border-[#c59b63] px-3.5 py-2.5 text-xs text-[#f7f4ee] focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1.5">
            Direct Telephone / Mobile
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+63 (2) 8800-0000"
            className="w-full bg-[#0d0d11] border border-[#2a2a35] focus:border-[#c59b63] px-3.5 py-2.5 text-xs text-[#f7f4ee] focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1.5">
            Company / Corporate Entity
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="Entity or individual name"
            className="w-full bg-[#0d0d11] border border-[#2a2a35] focus:border-[#c59b63] px-3.5 py-2.5 text-xs text-[#f7f4ee] focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1.5">
            Target Practice Area
          </label>
          <select
            value={formData.practiceArea}
            onChange={(e) => setFormData({ ...formData, practiceArea: e.target.value })}
            className="w-full bg-[#0d0d11] border border-[#2a2a35] focus:border-[#c59b63] px-3.5 py-2.5 text-xs text-[#f7f4ee] focus:outline-none cursor-pointer"
          >
            {practiceAreas.map((pa) => (
              <option key={pa.id} value={pa.title} className="bg-[#0d0d11]">
                {pa.title}
              </option>
            ))}
            <option value="General Corporate Counsel" className="bg-[#0d0d11]">
              General Corporate Counsel
            </option>
            <option value="Other / Multi-disciplinary" className="bg-[#0d0d11]">
              Other / Multi-disciplinary
            </option>
          </select>
        </div>

        <div>
          <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1.5">
            Urgency / Timeline
          </label>
          <select
            value={formData.urgencyLevel}
            onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value as any })}
            className="w-full bg-[#0d0d11] border border-[#2a2a35] focus:border-[#c59b63] px-3.5 py-2.5 text-xs text-[#f7f4ee] focus:outline-none cursor-pointer"
          >
            <option value="Immediate">Urgent / Injunction Hearing Pending</option>
            <option value="Standard">Standard (Within 2 Business Days)</option>
            <option value="Exploratory">Exploratory / Strategic Advisory</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1.5">
          Executive Summary of Matter *
        </label>
        <textarea
          rows={4}
          required
          value={formData.caseSummary}
          onChange={(e) => setFormData({ ...formData, caseSummary: e.target.value })}
          placeholder="Please describe the general legal context, adverse parties (for conflict check clearance), and principal relief sought..."
          className="w-full bg-[#0d0d11] border border-[#2a2a35] focus:border-[#c59b63] p-3 text-xs text-[#f7f4ee] focus:outline-none leading-relaxed"
        />
        <p className="text-[10px] text-[#7e776e] mt-1">
          * Do not include sensitive trade secrets until conflict clearance has been formally verified.
        </p>
      </div>

      <div className="pt-2">
        <label className="flex items-start gap-2.5 text-xs text-[#a8a199] cursor-pointer">
          <input
            type="checkbox"
            checked={formData.conflictCheckConsent}
            onChange={(e) => setFormData({ ...formData, conflictCheckConsent: e.target.checked })}
            className="mt-0.5 accent-[#c59b63]"
          />
          <span className="text-[11px] leading-relaxed">
            I understand and acknowledge that submitting this inquiry does not create an attorney-client relationship.
          </span>
        </label>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isSubmitting}
        >
          Submit Inquiry to Managing Partner
        </Button>
      </div>
    </form>
  );
};
