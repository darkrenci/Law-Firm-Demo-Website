import React, { useState } from 'react';
import { PageSection, BlockTypography, PracticeArea, Attorney, Article, NewsItem, FAQItem } from '../../types';
import { db } from '../../services/db';
import { Button } from '../ui/Buttons';
import { Modal } from '../ui/Modal';
import { Logo, LalusisLogoMark } from '../brand/Logo';
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
} from 'lucide-react';
import { useToast } from '../ui/Toast';
import { resolveItemTypography } from '../admin/ItemTypographyControls';

interface SectionRendererProps {
  sections?: PageSection[];
  section?: PageSection;
  onNavigate: (path: string) => void;
  // Interactive visual builder element selection
  editMode?: boolean;
  activeElementPart?: string | null;
  onSelectPart?: (part: string) => void;
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({
  sections,
  section,
  onNavigate,
  editMode = false,
  activeElementPart = null,
  onSelectPart,
}) => {
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

const RenderSectionItem: React.FC<{
  section: PageSection;
  onNavigate: (path: string) => void;
  editMode?: boolean;
  activeElementPart?: string | null;
  onSelectPart?: (part: string) => void;
}> = ({ section, onNavigate, editMode, activeElementPart, onSelectPart }) => {
  const { type, content, background, paddingY, typography } = section;
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

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
                className={`flex ${justifyClass} mb-4`}
              >
                <div className="p-4 bg-[#0a0a0d] border border-[#c59b63]/30 shadow-2xl inline-block">
                  {content.customLogoUrl ? (
                    <img
                      src={content.customLogoUrl}
                      alt="Firm Logo"
                      className="object-contain"
                      style={{
                        height: content.logoSize === 'sm' ? 56 : content.logoSize === 'lg' ? 96 : 76,
                        maxHeight: 120,
                      }}
                    />
                  ) : (
                    <LalusisLogoMark size={content.logoSize === 'sm' ? 56 : content.logoSize === 'lg' ? 96 : 76} />
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
                {content.headline || 'Strategic Counsel. Trusted Representation.'}
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

            {/* Part 6: Micro Badges */}
            <EditablePartWrapper
              editMode={editMode}
              partId="stats"
              partLabel="Track Record & Badges"
              activeElementPart={activeElementPart}
              onSelectPart={onSelectPart}
              className={`pt-10 border-t border-[#1f1f28] grid grid-cols-2 md:grid-cols-4 gap-6 text-xs text-[#8e877e] max-w-4xl ${statsTypo.marginClass}`}
            >
              {[
                { value: content.badge1Value || '28+ Years', label: content.badge1Label || 'Trial Eminence' },
                { value: content.badge2Value || '150+', label: content.badge2Label || 'Supreme Court Rulings' },
                { value: content.badge3Value || '₱180B+', label: content.badge3Label || 'Transactions Advised' },
                { value: content.badge4Value || 'Tier 1', label: content.badge4Label || 'Corporate Practice' },
              ].map((badge, bIdx) => (
                <div key={bIdx} className={statsTypo.alignClass}>
                  <span
                    style={statsTypo.customStyle}
                    className={`block ${statsTypo.fontClass} ${statsTypo.sizeClass || 'text-xl'} ${statsTypo.weightClass || 'font-normal'} ${statsTypo.colorClass || 'text-[#f4e6d0]'} ${statsTypo.trackingClass} ${statsTypo.uppercaseClass} ${statsTypo.italicClass}`}
                  >
                    {badge.value}
                  </span>
                  <span
                    style={statsTypo.customStyle}
                    className={`${statsTypo.fontFamily === 'sans' ? 'font-sans' : 'font-cinzel'} text-[10px] tracking-wider ${statsTypo.subColorClass || 'text-[#c59b63]'} uppercase mt-0.5 block`}
                  >
                    {badge.label}
                  </span>
                </div>
              ))}
            </EditablePartWrapper>
          </div>
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
                  className={`${eyeTypo.fontClass} ${eyeTypo.sizeClass || 'text-[11px]'} font-semibold tracking-[0.25em] ${eyeTypo.colorClass || eyeTypo.subColorClass} uppercase block ${eyeTypo.trackingClass} ${eyeTypo.italicClass}`}
                >
                  {content.eyebrow || section.subtitle}
                </span>
              </EditablePartWrapper>
            )}

            {/* Headline / Title */}
            {(content.headline || content.heading || section.title) && (
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
                  {content.headline || content.heading || section.title}
                </h2>
              </EditablePartWrapper>
            )}

            {/* Subheadline / Overview */}
            {(content.subheadline || content.subheading || (content.heading && section.subtitle)) && (
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
                  {content.subheadline || content.subheading || section.subtitle}
                </p>
              </EditablePartWrapper>
            )}

            {/* Body */}
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
                className={`space-y-4 ${bodyTypo.fontClass} ${bodyTypo.sizeClass || 'text-sm sm:text-base'} ${bodyTypo.bodyColorClass || bodyTypo.colorClass} leading-relaxed ${bodyTypo.alignClass} ${bodyTypo.italicClass} ${bodyTypo.trackingClass} ${bodyTypo.dropCapClass}`}
              >
                {(content.body || '').split('\n\n').map((para: string, i: number) => (
                  <p key={i}>{para}</p>
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
                      Makati Financial District
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
      const attorneys = db.getAttorneys(false).slice(0, content.limit || 4);
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
                  {content.eyebrow || 'Senior Advocates'}
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
                  {content.headline || content.heading || section.title || 'Distinguished Partners & Counsel'}
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
              partLabel="Attorneys Roster Grid"
              activeElementPart={activeElementPart}
              onSelectPart={onSelectPart}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {attorneys.map((atty) => (
                  <div
                    key={atty.id}
                    onClick={() => onNavigate(`/attorneys/${atty.slug}`)}
                    className="group bg-[#111116] border border-[#22222d] hover:border-[#c59b63]/60 transition-all duration-300 cursor-pointer text-left overflow-hidden"
                  >
                    <div className="h-72 overflow-hidden relative">
                      <img
                        src={atty.portraitUrl}
                        alt={atty.fullName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111116] via-transparent to-transparent opacity-80" />
                    </div>
                    <div className="p-5 space-y-1">
                      <span className="font-cinzel text-[10px] text-[#c59b63] uppercase tracking-wider block">
                        {atty.professionalTitle}
                      </span>
                      <h4
                        style={cardsTypo.customStyle}
                        className={`${cardsTypo.fontClass} ${cardsTypo.sizeClass || 'text-xl'} ${cardsTypo.colorClass || 'text-[#f7f4ee]'} ${cardsTypo.weightClass || 'font-medium'} group-hover:text-[#f4e6d0] ${cardsTypo.trackingClass} ${cardsTypo.uppercaseClass} ${cardsTypo.italicClass}`}
                      >
                        {atty.fullName}
                      </h4>
                      <p className="text-[11px] text-[#8e877e] truncate pt-1">
                        {atty.primarySpecialization}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </EditablePartWrapper>
          </div>
        </section>
      );
    }

    case 'stats': {
      const statItems = content.stats || content.items || [
        { label: 'Advocacy History', value: '1998', subtitle: 'Makati Chambers' },
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

    case 'articles': {
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

    case 'faq': {
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
