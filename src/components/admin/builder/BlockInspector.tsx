import React, { useState } from 'react';
import { PageSection, BlockTypography } from '../../../types';
import { Button } from '../../ui/Buttons';
import {
  ArrowLeft,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Type,
  ImageIcon,
  Plus,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Video,
  Box,
  Link,
  FileText,
  Palette,
  Lock,
  Shield,
  Award,
  MousePointer,
  CheckCircle2,
  LayoutGrid,
} from 'lucide-react';
import { ImageUploadField } from '../../ui/ImageUploadField';

interface BlockInspectorProps {
  section: PageSection;
  index: number;
  totalSections: number;
  onUpdate: (updated: Partial<PageSection>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose: () => void;
  // Interactive element part navigation
  activePart?: string | null;
  onSelectPart?: (part: string | null) => void;
}

const PRESET_IMAGES = [
  {
    label: 'Supreme Court Architecture',
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Corporate Boardroom',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Law Library & Treatises',
    url: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Scales of Justice & Desk',
    url: 'https://images.unsplash.com/photo-1479142506502-19b3a3b7ff33?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Ayala Triangle Highrise',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  },
];

const PRESET_VIDEOS = [
  {
    label: 'Institutional Profile (Demo Stream)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    label: 'Chambers Overview (YouTube Embed)',
    url: 'https://www.youtube.com/embed/ScMzIvxBSi4',
  },
];

const PartTypographyQuickEditor: React.FC<{
  partId: string;
  partLabel: string;
  partTypo: BlockTypography;
  onChange: (key: keyof BlockTypography, value: any, targetPartId: string) => void;
}> = ({ partId, partLabel, partTypo, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const fontOptions = [
    { id: 'cormorant', label: 'Cormorant', styleClass: 'font-cormorant' },
    { id: 'cinzel', label: 'Cinzel', styleClass: 'font-cinzel' },
    { id: 'sans', label: 'Sans', styleClass: 'font-sans' },
    { id: 'playfair', label: 'Playfair', styleClass: 'font-serif' },
    { id: 'mono', label: 'Mono', styleClass: 'font-mono' },
  ];

  const sizeOptions = [
    { id: 'xs', label: 'XS', desc: '12px' },
    { id: 'sm', label: 'SM', desc: '14px' },
    { id: 'base', label: 'Base', desc: '16px' },
    { id: 'lg', label: 'LG', desc: '18px' },
    { id: 'xl', label: 'XL', desc: '20px' },
    { id: '2xl', label: '2XL', desc: '24px' },
    { id: '3xl', label: '3XL', desc: '30px' },
    { id: '4xl', label: '4XL', desc: '36px+' },
  ];

  const colorTones = [
    { id: 'ivory', label: 'Ivory', color: '#f7f4ee' },
    { id: 'gold', label: 'Gold', color: '#c59b63' },
    { id: 'champagne', label: 'Champagne', color: '#f4e6d0' },
    { id: 'muted', label: 'Muted', color: '#8e877e' },
    { id: 'gradient', label: 'Glow', color: '#d4af7a' },
  ];

  return (
    <div className="p-3 bg-[#0a0a0f] border border-[#232332] space-y-3 mt-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e1e2c] pb-2">
        <div className="flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-[#c59b63]" />
          <span className="font-cinzel text-[10px] font-bold text-[#f4e6d0] uppercase tracking-wider">
            {partLabel} Typography &amp; Tone
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[9px] font-mono text-[#8e877e] hover:text-[#f4e6d0] uppercase cursor-pointer px-1 py-0.5 bg-[#14141c]"
        >
          {isExpanded ? 'Hide' : 'Customize'}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-3 pt-1">
          {/* 1. Font Family */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-cinzel text-[#d4af7a] uppercase font-semibold">Font Family</span>
              <span className="text-[9px] font-mono text-[#c59b63] uppercase font-bold">{partTypo.fontFamily || 'inherited'}</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {fontOptions.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onChange('fontFamily', f.id, partId)}
                  className={`p-1.5 text-center text-[9px] font-cinzel uppercase border transition-all cursor-pointer ${
                    partTypo.fontFamily === f.id
                      ? 'border-[#c59b63] bg-[#1d1d2b] text-[#f4e6d0] font-bold ring-1 ring-[#c59b63]'
                      : 'border-[#22222f] bg-[#0c0c10] text-[#8e877e] hover:border-[#444458]'
                  }`}
                >
                  <span className={f.styleClass}>{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Font Size Scale */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-cinzel text-[#d4af7a] uppercase font-semibold">Font Size Scale</span>
              <span className="text-[9px] font-mono text-[#c59b63] uppercase font-bold">{partTypo.fontSize || 'default'}</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
              {sizeOptions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onChange('fontSize', s.id, partId)}
                  className={`py-1 px-0.5 text-center text-[9px] font-cinzel border transition-all cursor-pointer ${
                    partTypo.fontSize === s.id
                      ? 'border-[#c59b63] bg-[#1d1d2b] text-[#f4e6d0] font-bold ring-1 ring-[#c59b63]'
                      : 'border-[#22222f] bg-[#0c0c10] text-[#8e877e] hover:border-[#444458]'
                  }`}
                  title={`${s.label} (${s.desc})`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Text Tone & Custom Color */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-cinzel text-[#d4af7a] uppercase font-semibold">Text Tone &amp; Color</span>
              <span className="text-[9px] font-mono text-[#c59b63] uppercase font-bold">
                {partTypo.customColor ? partTypo.customColor : (partTypo.textColor || 'theme')}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1 mb-1.5">
              {colorTones.map((tc) => (
                <button
                  key={tc.id}
                  type="button"
                  onClick={() => {
                    onChange('textColor', tc.id, partId);
                    if (partTypo.customColor) {
                      onChange('customColor', undefined, partId);
                    }
                  }}
                  className={`p-1.5 text-center border text-[9px] font-cinzel uppercase transition-all cursor-pointer rounded-xs ${
                    !partTypo.customColor && partTypo.textColor === tc.id
                      ? 'border-[#c59b63] bg-[#1d1d2b] text-[#f4e6d0] font-bold ring-1 ring-[#c59b63]'
                      : 'border-[#22222f] bg-[#0c0c10] text-[#8e877e] hover:border-[#444458]'
                  }`}
                >
                  <div className="w-2.5 h-2.5 rounded-full mx-auto mb-1 border border-black/40 shadow-sm" style={{ backgroundColor: tc.color }} />
                  <span className="block truncate">{tc.label}</span>
                </button>
              ))}
            </div>

            {/* Custom Hex Color Picker */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="color"
                value={partTypo.customColor || '#c59b63'}
                onChange={(e) => onChange('customColor', e.target.value, partId)}
                className="w-7 h-7 bg-transparent cursor-pointer rounded-xs border border-[#333344]"
                title="Pick exact custom hex color"
              />
              <input
                type="text"
                value={partTypo.customColor || ''}
                onChange={(e) => onChange('customColor', e.target.value, partId)}
                placeholder="Or custom hex e.g. #d4af7a"
                className="flex-1 bg-[#09090d] border border-[#242430] px-2 py-1 text-[10px] text-[#f7f4ee] font-mono focus:border-[#c59b63] focus:outline-none"
              />
              {partTypo.customColor && (
                <button
                  type="button"
                  onClick={() => onChange('customColor', undefined, partId)}
                  className="px-2 py-1 bg-[#181824] border border-[#333348] text-[9px] text-[#8e877e] hover:text-[#f4e6d0] font-mono cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* 4. Alignment */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-cinzel text-[#d4af7a] uppercase font-semibold">Alignment</span>
              <span className="text-[9px] font-mono text-[#c59b63] uppercase font-bold">{partTypo.alignment || 'center'}</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: 'left', label: 'Left', icon: AlignLeft },
                { id: 'center', label: 'Center', icon: AlignCenter },
                { id: 'right', label: 'Right', icon: AlignRight },
                { id: 'justify', label: 'Justify', icon: AlignJustify },
              ].map((al) => {
                const Icon = al.icon;
                return (
                  <button
                    key={al.id}
                    type="button"
                    onClick={() => onChange('alignment', al.id, partId)}
                    className={`flex items-center justify-center gap-1 py-1.5 text-[9px] font-cinzel uppercase cursor-pointer rounded-xs ${
                      (partTypo.alignment || 'center') === al.id
                        ? 'bg-[#c59b63] text-[#0d0d11] font-bold shadow-md ring-1 ring-[#c59b63]'
                        : 'text-[#8e877e] hover:text-[#f7f4ee] bg-[#0c0c10] border border-[#22222f]'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{al.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Weight & Letter Spacing */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#1a1a24]">
            <div>
              <label className="block text-[9px] text-[#8e877e] uppercase mb-0.5">Weight</label>
              <select
                value={partTypo.fontWeight || 'normal'}
                onChange={(e) => onChange('fontWeight', e.target.value, partId)}
                className="w-full bg-[#09090d] border border-[#242430] px-2 py-1 text-[10px] text-[#f7f4ee] focus:border-[#c59b63] focus:outline-none cursor-pointer font-cinzel"
              >
                <option value="light">Light (300)</option>
                <option value="normal">Regular (400)</option>
                <option value="medium">Medium (500)</option>
                <option value="semibold">Semi-Bold (600)</option>
                <option value="bold">Bold (700)</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] text-[#8e877e] uppercase mb-0.5">Spacing</label>
              <select
                value={partTypo.letterSpacing || 'normal'}
                onChange={(e) => onChange('letterSpacing', e.target.value, partId)}
                className="w-full bg-[#09090d] border border-[#242430] px-2 py-1 text-[10px] text-[#f7f4ee] focus:border-[#c59b63] focus:outline-none cursor-pointer font-cinzel"
              >
                <option value="tight">Tight</option>
                <option value="normal">Normal</option>
                <option value="wide">Wide</option>
                <option value="widest">Widest</option>
                <option value="monumental">Monumental</option>
              </select>
            </div>
          </div>

          {/* 6. Uppercase & Italic Toggles */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <label className="flex items-center justify-between p-1.5 bg-[#09090d] border border-[#22222f] cursor-pointer">
              <span className="font-cinzel text-[9px] text-[#f7f4ee] uppercase">Uppercase</span>
              <input
                type="checkbox"
                checked={partTypo.isUppercase || false}
                onChange={(e) => onChange('isUppercase', e.target.checked, partId)}
                className="accent-[#c59b63]"
              />
            </label>
            <label className="flex items-center justify-between p-1.5 bg-[#09090d] border border-[#22222f] cursor-pointer">
              <span className="font-cinzel text-[9px] text-[#f7f4ee] uppercase">Italic Slant</span>
              <input
                type="checkbox"
                checked={partTypo.isItalic || false}
                onChange={(e) => onChange('isItalic', e.target.checked, partId)}
                className="accent-[#c59b63]"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export const BlockInspector: React.FC<BlockInspectorProps> = ({
  section,
  index,
  totalSections,
  onUpdate,
  onDuplicate,
  onDelete,
  onClose,
  activePart = null,
  onSelectPart,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'typography'>('content');
  const [isolatePart, setIsolatePart] = useState<boolean>(true);
  const [newPoint, setNewPoint] = useState('');

  const content = section.content || {};
  const typography = section.typography || {};

  const handleContentChange = (key: string, value: any) => {
    const nextContent: Record<string, any> = {
      ...content,
      [key]: value,
    };
    const updates: Partial<PageSection> = {
      content: nextContent,
    };
    if (key === 'headline' || key === 'heading' || key === 'title') {
      updates.title = value;
      nextContent.headline = value;
      nextContent.heading = value;
    }
    if (key === 'subheadline' || key === 'subheading' || key === 'subtitle' || key === 'description') {
      updates.subtitle = value;
      nextContent.subheadline = value;
      nextContent.subheading = value;
    }
    onUpdate(updates);
  };

  const currentEditingPart = (isolatePart && activePart) ? activePart : null;

  // Retrieve typography for a part or fallback to section typography
  const getPartTypography = (partId: string | null): BlockTypography => {
    if (!partId) return typography;
    const partTypo = (section.partTypography && section.partTypography[partId])
      || (content.partTypography && content.partTypography[partId]);
    if (partTypo && Object.keys(partTypo).length > 0) {
      return {
        ...typography,
        ...partTypo,
      };
    }
    // Default characteristics when element hasn't been individually customized
    if (partId === 'subheadline' || partId === 'body') {
      return {
        ...typography,
        fontFamily: 'sans',
        textColor: (typography.textColor === 'gold' ? 'gold' : 'champagne'),
      };
    }
    if (partId === 'eyebrow') {
      return {
        ...typography,
        fontFamily: 'cinzel',
        textColor: 'gold',
      };
    }
    if (partId === 'stats') {
      return {
        ...typography,
        fontFamily: 'cormorant',
        fontSize: '4xl',
        textColor: (typography.textColor === 'gold' ? 'gold' : 'champagne'),
      };
    }
    if (partId === 'buttons') {
      return {
        ...typography,
        fontFamily: 'cinzel',
        fontSize: 'xs',
        isUppercase: true,
      };
    }
    if (partId === 'cards') {
      return {
        ...typography,
        fontFamily: 'cormorant',
      };
    }
    if (partId === 'quote') {
      return {
        ...typography,
        fontFamily: 'cormorant',
        fontSize: '2xl',
        isItalic: true,
      };
    }
    return typography;
  };

  const activeTypo = getPartTypography(currentEditingPart);

  const handleTypographyChange = (key: keyof BlockTypography, value: any, explicitPart?: string | null) => {
    const partToTarget = explicitPart !== undefined ? explicitPart : currentEditingPart;

    if (partToTarget && partToTarget !== 'all') {
      const existingPartTypo = (section.partTypography && section.partTypography[partToTarget])
        || (content.partTypography && content.partTypography[partToTarget])
        || {};

      const updatedPartTypo: BlockTypography = {
        ...existingPartTypo,
        [key]: value,
      };

      const updatedPartTypography = {
        ...(section.partTypography || {}),
        ...(content.partTypography || {}),
        [partToTarget]: updatedPartTypo,
      };

      const updates: Partial<PageSection> = {
        partTypography: updatedPartTypography,
        content: {
          ...content,
          partTypography: updatedPartTypography,
        },
      };

      // Only update section.typography if the target is headline/heading
      if (partToTarget === 'headline' || partToTarget === 'heading') {
        updates.typography = {
          ...typography,
          [key]: value,
        };
      }

      onUpdate(updates);
    } else {
      // Global section-wide typography update
      onUpdate({
        typography: {
          ...typography,
          [key]: value,
        },
      });
    }
  };

  const handleAddPoint = () => {
    if (!newPoint.trim()) return;
    const currentPoints = Array.isArray(content.points) ? content.points : [];
    handleContentChange('points', [...currentPoints, newPoint.trim()]);
    setNewPoint('');
  };

  const handleRemovePoint = (pIndex: number) => {
    const currentPoints = Array.isArray(content.points) ? content.points : [];
    handleContentChange(
      'points',
      currentPoints.filter((_, idx) => idx !== pIndex)
    );
  };

  const scrollToPart = (partId: string) => {
    onSelectPart?.(partId);
    setIsolatePart(true);
    const el = document.getElementById(`part-card-${partId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const isHero = section.type === 'hero';

  const getSectionParts = (secType: string) => {
    if (secType === 'hero') {
      return [
        { id: 'logo', label: 'Emblem Crest', icon: Shield },
        { id: 'eyebrow', label: 'Eyebrow', icon: Type },
        { id: 'headline', label: 'Header 1', icon: FileText },
        { id: 'subheadline', label: 'Subtitle', icon: AlignLeft },
        { id: 'buttons', label: 'Buttons', icon: Link },
        { id: 'stats', label: 'Badges', icon: Award },
      ];
    }
    const parts: { id: string; label: string; icon: any }[] = [];
    parts.push({ id: 'eyebrow', label: 'Eyebrow', icon: Type });
    parts.push({ id: 'headline', label: 'Header 1', icon: FileText });
    parts.push({ id: 'subheadline', label: 'Subtitle', icon: AlignLeft });

    if (['text', 'richText', 'imageText', 'cta'].includes(secType) || content.body) {
      parts.push({ id: 'body', label: 'Body Text', icon: AlignJustify });
    }
    if (['image', 'imageText'].includes(secType) || content.imageUrl) {
      parts.push({ id: 'image', label: 'Imagery', icon: ImageIcon });
    }
    if (['practiceAreas', 'attorneys', 'faq', 'testimonials', 'articles', 'news'].includes(secType)) {
      parts.push({ id: 'cards', label: 'Cards Grid', icon: LayoutGrid });
    }
    if (['stats', 'richText'].includes(secType) || content.stats || content.items || content.stat1Number) {
      parts.push({ id: 'stats', label: 'Metrics', icon: Award });
    }
    if (['imageText', 'articles', 'news', 'cta', 'button', 'container'].includes(secType) || content.buttonText || content.primaryCtaText) {
      parts.push({ id: 'buttons', label: 'Buttons', icon: Link });
    }
    if (content.quote) {
      parts.push({ id: 'quote', label: 'Quote', icon: FileText });
    }
    if (['video'].includes(secType) || content.videoUrl) {
      parts.push({ id: 'video', label: 'Video', icon: Video });
    }
    return parts;
  };

  const getPartLabel = (partId: string) => {
    switch (partId) {
      case 'logo':
        return 'Emblem Crest & Seal';
      case 'eyebrow':
        return 'Eyebrow / Sub-Header';
      case 'headline':
        return 'Header 1 / Section Title';
      case 'subheadline':
        return 'Subtitle / Overview';
      case 'body':
        return 'Body Text & Strategic Pillars';
      case 'buttons':
        return 'Action Buttons & Links';
      case 'stats':
        return 'Quantitative Milestones & Metrics';
      case 'cards':
        return 'Cards Grid & Directory Items';
      case 'image':
        return 'Chamber Photography & Media';
      case 'quote':
        return 'Featured Quote & Attribution';
      case 'video':
        return 'Video Stream & Media';
      default:
        return partId.toUpperCase();
    }
  };

  const availableParts = getSectionParts(section.type);

  // Helper renderer for individual parts
  const renderPartEditor = (partId: string) => {
    switch (partId) {
      case 'logo':
        return (
          <div id="part-card-logo" className="p-3.5 bg-[#121218] border border-[#c59b63]/60 space-y-3">
            <div className="flex items-center justify-between border-b border-[#222230] pb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#c59b63]" />
                <span className="font-cinzel text-[11px] font-bold text-[#f4e6d0] uppercase tracking-wider">
                  Firm Emblem / Logo Crest
                </span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#c59b63] text-[#0d0d11] font-bold uppercase">
                Editing Now
              </span>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-2 bg-[#09090d] border border-[#242430] cursor-pointer">
                <span className="text-[11px] text-[#f7f4ee]">Display Firm Logo Crest</span>
                <input
                  type="checkbox"
                  checked={content.showLogo !== false}
                  onChange={(e) => handleContentChange('showLogo', e.target.checked)}
                  className="accent-[#c59b63]"
                />
              </label>

              <div>
                <label className="block text-[10px] text-[#8e877e] uppercase mb-1">Logo Scale Size</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'sm', label: 'Compact (56px)' },
                    { id: 'md', label: 'Standard (76px)' },
                    { id: 'lg', label: 'Monumental (96px)' },
                  ].map((sz) => (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => handleContentChange('logoSize', sz.id)}
                      className={`p-1.5 text-center text-[10px] font-cinzel uppercase border transition-colors cursor-pointer ${
                        (content.logoSize || 'md') === sz.id
                          ? 'border-[#c59b63] bg-[#1c1c28] text-[#f4e6d0] font-bold'
                          : 'border-[#22222f] bg-[#09090d] text-[#8e877e]'
                      }`}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#8e877e] uppercase mb-1">
                  Custom Logo Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={content.customLogoUrl || ''}
                  onChange={(e) => handleContentChange('customLogoUrl', e.target.value)}
                  placeholder="Leave blank for official Lalusis insignia"
                  className="w-full bg-[#09090d] border border-[#242430] px-2.5 py-1.5 text-xs text-[#f7f4ee] font-mono"
                />
              </div>
            </div>
          </div>
        );

      case 'eyebrow':
        const eyeTypo = getPartTypography('eyebrow');
        return (
          <div id="part-card-eyebrow" className="p-3.5 bg-[#121218] border border-[#c59b63]/60 space-y-3">
            <div className="flex items-center justify-between border-b border-[#222230] pb-2">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-[#c59b63]" />
                <span className="font-cinzel text-[11px] font-bold text-[#f4e6d0] uppercase tracking-wider">
                  Eyebrow / Sub-Header
                </span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#c59b63] text-[#0d0d11] font-bold uppercase">
                Editing Now
              </span>
            </div>
            <div>
              <label className="block font-cinzel text-[10px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
                Eyebrow Text
              </label>
              <input
                type="text"
                value={content.eyebrow || ''}
                onChange={(e) => handleContentChange('eyebrow', e.target.value)}
                placeholder="e.g. THE LALUSIS STANDARD"
                className="w-full bg-[#09090d] border border-[#242430] px-3 py-2 text-xs text-[#f7f4ee] focus:border-[#c59b63] focus:outline-none font-cinzel tracking-wider"
              />
            </div>

            {/* Quick Typography & Tone for Eyebrow */}
            <PartTypographyQuickEditor
              partId="eyebrow"
              partLabel="Eyebrow / Sub-Header"
              partTypo={eyeTypo}
              onChange={handleTypographyChange}
            />
          </div>
        );

      case 'headline':
        const headTypo = getPartTypography('headline');
        return (
          <div id="part-card-headline" className="p-3.5 bg-[#121218] border border-[#c59b63]/60 space-y-4">
            <div className="flex items-center justify-between border-b border-[#222230] pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#c59b63]" />
                <span className="font-cinzel text-[11px] font-bold text-[#f4e6d0] uppercase tracking-wider">
                  Section Heading / Title (Header 1)
                </span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#c59b63] text-[#0d0d11] font-bold uppercase">
                Editing Now
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="block font-cinzel text-[10px] font-semibold tracking-wider text-[#d4af7a] uppercase">
                Headline Text
              </label>
              <textarea
                rows={3}
                value={content.headline ?? content.heading ?? section.title ?? ''}
                onChange={(e) => handleContentChange('headline', e.target.value)}
                placeholder="Enter section headline..."
                className="w-full bg-[#09090d] border border-[#242430] p-2.5 text-sm text-[#f7f4ee] focus:border-[#c59b63] focus:outline-none font-cormorant text-base leading-snug"
              />
            </div>

            {/* Quick Typography & Tone for Headline */}
            <PartTypographyQuickEditor
              partId="headline"
              partLabel="Section Heading / Title (Header 1)"
              partTypo={headTypo}
              onChange={handleTypographyChange}
            />
          </div>
        );

      case 'subheadline':
        const subTypo = getPartTypography('subheadline');
        return (
          <div id="part-card-subheadline" className="p-3.5 bg-[#121218] border border-[#c59b63]/60 space-y-3">
            <div className="flex items-center justify-between border-b border-[#222230] pb-2">
              <div className="flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-[#c59b63]" />
                <span className="font-cinzel text-[11px] font-bold text-[#f4e6d0] uppercase tracking-wider">
                  Subtitle / Overview Description
                </span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#c59b63] text-[#0d0d11] font-bold uppercase">
                Editing Now
              </span>
            </div>
            <div>
              <label className="block font-cinzel text-[10px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
                Subtitle / Overview Text
              </label>
              <textarea
                rows={3}
                value={content.subheadline ?? content.subheading ?? content.description ?? section.subtitle ?? ''}
                onChange={(e) => handleContentChange('subheadline', e.target.value)}
                placeholder="Descriptive overview statement..."
                className="w-full bg-[#09090d] border border-[#242430] p-2.5 text-xs text-[#f7f4ee] focus:border-[#c59b63] focus:outline-none leading-relaxed font-sans"
              />
            </div>

            {/* Quick Typography & Tone for Subtitle */}
            <PartTypographyQuickEditor
              partId="subheadline"
              partLabel="Subtitle / Overview Description"
              partTypo={subTypo}
              onChange={handleTypographyChange}
            />
          </div>
        );

      case 'body':
        const bodyTypo = getPartTypography('body');
        return (
          <div id="part-card-body" className="p-3.5 bg-[#121218] border border-[#c59b63]/60 space-y-4">
            <div className="flex items-center justify-between border-b border-[#222230] pb-2">
              <div className="flex items-center gap-2">
                <AlignJustify className="w-4 h-4 text-[#c59b63]" />
                <span className="font-cinzel text-[11px] font-bold text-[#f4e6d0] uppercase tracking-wider">
                  Body Text &amp; Strategic Pillars
                </span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#c59b63] text-[#0d0d11] font-bold uppercase">
                Editing Now
              </span>
            </div>

            {/* Editorial Body Text */}
            <div className="space-y-1.5">
              <label className="block font-cinzel text-[10px] font-semibold tracking-wider text-[#d4af7a] uppercase">
                Editorial Body Text
              </label>
              <textarea
                rows={5}
                value={content.body || ''}
                onChange={(e) => handleContentChange('body', e.target.value)}
                placeholder="Enter editorial narrative text..."
                className="w-full bg-[#09090d] border border-[#242430] p-2.5 text-xs text-[#f7f4ee] focus:border-[#c59b63] focus:outline-none leading-relaxed font-sans"
              />
            </div>

            {/* Quick Typography & Tone for Body Text */}
            <PartTypographyQuickEditor
              partId="body"
              partLabel="Body Text &amp; Strategic Pillars"
              partTypo={bodyTypo}
              onChange={handleTypographyChange}
            />

            {/* Strategic Pillars / Bullet Points */}
            <div className="space-y-2 pt-2 border-t border-[#1f1f2a]">
              <div className="flex items-center justify-between">
                <label className="block font-cinzel text-[10px] font-semibold tracking-wider text-[#d4af7a] uppercase">
                  Strategic Pillars / Bullet Points
                </label>
                <span className="text-[9px] font-mono text-[#8e877e]">
                  {(Array.isArray(content.points) ? content.points : []).length} items
                </span>
              </div>

              <div className="space-y-2">
                {(Array.isArray(content.points) ? content.points : []).map((point: string, pIdx: number) => (
                  <div
                    key={pIdx}
                    className="flex items-start gap-2 p-2 bg-[#09090d] border border-[#22222d] focus-within:border-[#c59b63]/80"
                  >
                    <span className="text-[#c59b63] font-bold text-xs mt-1">•</span>
                    <textarea
                      rows={2}
                      value={point}
                      onChange={(e) => {
                        const updated = [...(Array.isArray(content.points) ? content.points : [])];
                        updated[pIdx] = e.target.value;
                        handleContentChange('points', updated);
                      }}
                      className="flex-1 bg-transparent text-xs text-[#f7f4ee] focus:outline-none leading-relaxed resize-none font-sans"
                      placeholder="Pillar description..."
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePoint(pIdx)}
                      className="text-[#8e877e] hover:text-rose-400 p-1 cursor-pointer"
                      title="Remove pillar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Pillar */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newPoint}
                  onChange={(e) => setNewPoint(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPoint();
                    }
                  }}
                  placeholder="Add new strategic pillar..."
                  className="flex-1 bg-[#09090d] border border-[#242430] px-2.5 py-1.5 text-xs text-[#f7f4ee] focus:border-[#c59b63] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddPoint}
                  className="px-3 py-1.5 bg-[#1e1e28] border border-[#333345] hover:border-[#c59b63] text-xs text-[#d4af7a] hover:text-[#f7f4ee] cursor-pointer font-cinzel uppercase"
                >
                  + Add Pillar
                </button>
              </div>
            </div>
          </div>
        );

      case 'image':
        return (
          <div id="part-card-image" className="p-3.5 bg-[#121218] border border-[#c59b63]/60 space-y-4">
            <div className="flex items-center justify-between border-b border-[#222230] pb-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#c59b63]" />
                <span className="font-cinzel text-[11px] font-bold text-[#f4e6d0] uppercase tracking-wider">
                  Chamber Photography &amp; Media
                </span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#c59b63] text-[#0d0d11] font-bold uppercase">
                Editing Now
              </span>
            </div>

            <ImageUploadField
              label="Picture File / Upload"
              value={content.imageUrl || ''}
              onChange={(newUrl) => handleContentChange('imageUrl', newUrl)}
              compact={true}
              aspectRatio="landscape"
              helperText="Upload an image file from your computer or choose from library."
            />

            {/* Preset Gallery */}
            <div>
              <label className="block text-[10px] text-[#8e877e] uppercase mb-1.5">
                Quick Select Preset Chamber Photography
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_IMAGES.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleContentChange('imageUrl', img.url)}
                    className={`p-1 border text-left cursor-pointer transition-colors group ${
                      content.imageUrl === img.url
                        ? 'border-[#c59b63] bg-[#1a1a24]'
                        : 'border-[#22222f] hover:border-[#444458] bg-[#0c0c10]'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.label}
                      className="w-full h-14 object-cover mb-1"
                      referrerPolicy="no-referrer"
                    />
                    <span className="block text-[9px] font-cinzel text-[#d4af7a] group-hover:text-[#f7f4ee] truncate">
                      {img.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'buttons':
        const btnTypo = getPartTypography('buttons');
        return (
          <div id="part-card-buttons" className="p-3.5 bg-[#121218] border border-[#c59b63]/60 space-y-4">
            <div className="flex items-center justify-between border-b border-[#222230] pb-2">
              <div className="flex items-center gap-2">
                <Link className="w-4 h-4 text-[#c59b63]" />
                <span className="font-cinzel text-[11px] font-bold text-[#f4e6d0] uppercase tracking-wider">
                  Action Buttons &amp; Navigation Links
                </span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#c59b63] text-[#0d0d11] font-bold uppercase">
                Editing Now
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-[#8e877e] uppercase mb-1">
                  Primary Button Label
                </label>
                <input
                  type="text"
                  value={content.primaryCtaText || content.buttonText || ''}
                  onChange={(e) => {
                    if (content.primaryCtaText !== undefined) {
                      handleContentChange('primaryCtaText', e.target.value);
                    } else {
                      handleContentChange('buttonText', e.target.value);
                    }
                  }}
                  placeholder="e.g. Schedule In-Chamber Briefing"
                  className="w-full bg-[#09090d] border border-[#242430] px-2.5 py-1.5 text-xs text-[#f7f4ee]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#8e877e] uppercase mb-1">
                  Primary Destination URL
                </label>
                <input
                  type="text"
                  value={content.primaryCtaLink || content.buttonLink || ''}
                  onChange={(e) => {
                    if (content.primaryCtaLink !== undefined) {
                      handleContentChange('primaryCtaLink', e.target.value);
                    } else {
                      handleContentChange('buttonLink', e.target.value);
                    }
                  }}
                  placeholder="/consultation"
                  className="w-full bg-[#09090d] border border-[#242430] px-2.5 py-1.5 text-xs text-[#f7f4ee] font-mono"
                />
              </div>

              {(content.secondaryCtaText !== undefined || isHero || section.type === 'cta') && (
                <>
                  <div className="pt-2 border-t border-[#1f1f2a]">
                    <label className="block text-[10px] text-[#8e877e] uppercase mb-1">
                      Secondary Button Label
                    </label>
                    <input
                      type="text"
                      value={content.secondaryCtaText || ''}
                      onChange={(e) => handleContentChange('secondaryCtaText', e.target.value)}
                      placeholder="e.g. Chambers Contact"
                      className="w-full bg-[#09090d] border border-[#242430] px-2.5 py-1.5 text-xs text-[#f7f4ee]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#8e877e] uppercase mb-1">
                      Secondary Destination URL
                    </label>
                    <input
                      type="text"
                      value={content.secondaryCtaLink || ''}
                      onChange={(e) => handleContentChange('secondaryCtaLink', e.target.value)}
                      placeholder="/contact"
                      className="w-full bg-[#09090d] border border-[#242430] px-2.5 py-1.5 text-xs text-[#f7f4ee] font-mono"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Quick Typography & Tone for Call-to-Action Buttons */}
            <PartTypographyQuickEditor
              partId="buttons"
              partLabel="Call-to-Action Buttons"
              partTypo={btnTypo}
              onChange={handleTypographyChange}
            />
          </div>
        );

      case 'cards':
        const cardsTypo = getPartTypography('cards');
        return (
          <div id="part-card-cards" className="p-3.5 bg-[#121218] border border-[#c59b63]/60 space-y-4">
            <div className="flex items-center justify-between border-b border-[#222230] pb-2">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-[#c59b63]" />
                <span className="font-cinzel text-[11px] font-bold text-[#f4e6d0] uppercase tracking-wider">
                  Cards Grid &amp; Directory Records
                </span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#c59b63] text-[#0d0d11] font-bold uppercase">
                Editing Now
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-[#8e877e] uppercase mb-1">
                  Maximum Items to Display
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[3, 4, 6, 12].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleContentChange('limit', num)}
                      className={`p-1.5 text-center text-[10px] font-cinzel border transition-colors cursor-pointer ${
                        (content.limit || 6) === num
                          ? 'border-[#c59b63] bg-[#1e1e2c] text-[#f4e6d0] font-bold'
                          : 'border-[#22222f] bg-[#09090d] text-[#8e877e]'
                      }`}
                    >
                      {num} Items
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#0a0a0e] border border-[#22222f] space-y-1.5">
                <span className="font-cinzel text-[10px] text-[#c59b63] uppercase block font-bold">
                  Dynamic Firm Records
                </span>
                <p className="text-[11px] text-[#a8a199] leading-relaxed">
                  These cards dynamically display live practice areas, partner counsel, and legal analysis directly from your administrative database.
                </p>
              </div>
            </div>

            {/* Quick Typography & Tone for Grid Cards */}
            <PartTypographyQuickEditor
              partId="cards"
              partLabel="Grid Cards &amp; Directory Records"
              partTypo={cardsTypo}
              onChange={handleTypographyChange}
            />
          </div>
        );

      case 'stats':
        const statsTypo = getPartTypography('stats');
        return (
          <div id="part-card-stats" className="p-3.5 bg-[#121218] border border-[#c59b63]/60 space-y-4">
            <div className="flex items-center justify-between border-b border-[#222230] pb-2">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#c59b63]" />
                <span className="font-cinzel text-[11px] font-bold text-[#f4e6d0] uppercase tracking-wider">
                  Firm Milestone &amp; Quantitative Metrics
                </span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#c59b63] text-[#0d0d11] font-bold uppercase">
                Editing Now
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1 bg-[#09090d] p-2 border border-[#242430]">
                <span className="text-[9px] font-mono text-[#c59b63] uppercase">Metric 1</span>
                <input
                  type="text"
                  value={content.badge1Value || content.stat1Number || '1998'}
                  onChange={(e) => {
                    handleContentChange('badge1Value', e.target.value);
                    handleContentChange('stat1Number', e.target.value);
                  }}
                  placeholder="1998"
                  className="w-full bg-[#121218] border border-[#2b2b3b] px-2 py-1 text-xs text-[#f7f4ee] font-cormorant font-bold"
                />
                <input
                  type="text"
                  value={content.badge1Label || content.stat1Label || 'Chambers History'}
                  onChange={(e) => {
                    handleContentChange('badge1Label', e.target.value);
                    handleContentChange('stat1Label', e.target.value);
                  }}
                  placeholder="Chambers History"
                  className="w-full bg-[#121218] border border-[#2b2b3b] px-2 py-1 text-[10px] text-[#8e877e] font-cinzel"
                />
              </div>

              <div className="space-y-1 bg-[#09090d] p-2 border border-[#242430]">
                <span className="text-[9px] font-mono text-[#c59b63] uppercase">Metric 2</span>
                <input
                  type="text"
                  value={content.badge2Value || content.stat2Number || '150+'}
                  onChange={(e) => {
                    handleContentChange('badge2Value', e.target.value);
                    handleContentChange('stat2Number', e.target.value);
                  }}
                  placeholder="150+"
                  className="w-full bg-[#121218] border border-[#2b2b3b] px-2 py-1 text-xs text-[#f7f4ee] font-cormorant font-bold"
                />
                <input
                  type="text"
                  value={content.badge2Label || content.stat2Label || 'Appellate Decisions'}
                  onChange={(e) => {
                    handleContentChange('badge2Label', e.target.value);
                    handleContentChange('stat2Label', e.target.value);
                  }}
                  placeholder="Appellate Decisions"
                  className="w-full bg-[#121218] border border-[#2b2b3b] px-2 py-1 text-[10px] text-[#8e877e] font-cinzel"
                />
              </div>

              <div className="space-y-1 bg-[#09090d] p-2 border border-[#242430]">
                <span className="text-[9px] font-mono text-[#c59b63] uppercase">Metric 3</span>
                <input
                  type="text"
                  value={content.badge3Value || content.stat3Number || '₱180B+'}
                  onChange={(e) => {
                    handleContentChange('badge3Value', e.target.value);
                    handleContentChange('stat3Number', e.target.value);
                  }}
                  placeholder="₱180B+"
                  className="w-full bg-[#121218] border border-[#2b2b3b] px-2 py-1 text-xs text-[#f7f4ee] font-cormorant font-bold"
                />
                <input
                  type="text"
                  value={content.badge3Label || content.stat3Label || 'Transactions Advised'}
                  onChange={(e) => {
                    handleContentChange('badge3Label', e.target.value);
                    handleContentChange('stat3Label', e.target.value);
                  }}
                  placeholder="Transactions Advised"
                  className="w-full bg-[#121218] border border-[#2b2b3b] px-2 py-1 text-[10px] text-[#8e877e] font-cinzel"
                />
              </div>

              <div className="space-y-1 bg-[#09090d] p-2 border border-[#242430]">
                <span className="text-[9px] font-mono text-[#c59b63] uppercase">Metric 4</span>
                <input
                  type="text"
                  value={content.badge4Value || content.stat4Number || '350+'}
                  onChange={(e) => {
                    handleContentChange('badge4Value', e.target.value);
                    handleContentChange('stat4Number', e.target.value);
                  }}
                  placeholder="350+"
                  className="w-full bg-[#121218] border border-[#2b2b3b] px-2 py-1 text-xs text-[#f7f4ee] font-cormorant font-bold"
                />
                <input
                  type="text"
                  value={content.badge4Label || content.stat4Label || 'Corporate Retainers'}
                  onChange={(e) => {
                    handleContentChange('badge4Label', e.target.value);
                    handleContentChange('stat4Label', e.target.value);
                  }}
                  placeholder="Corporate Retainers"
                  className="w-full bg-[#121218] border border-[#2b2b3b] px-2 py-1 text-[10px] text-[#8e877e] font-cinzel"
                />
              </div>
            </div>

            {/* Quick Typography & Tone for Milestone & Quantitative Numbers */}
            <PartTypographyQuickEditor
              partId="stats"
              partLabel="Milestone &amp; Quantitative Metrics"
              partTypo={statsTypo}
              onChange={handleTypographyChange}
            />
          </div>
        );

      case 'quote':
        const quoteTypo = getPartTypography('quote');
        return (
          <div id="part-card-quote" className="p-3.5 bg-[#121218] border border-[#c59b63]/60 space-y-3">
            <div className="flex items-center justify-between border-b border-[#222230] pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#c59b63]" />
                <span className="font-cinzel text-[11px] font-bold text-[#f4e6d0] uppercase tracking-wider">
                  Featured Quote &amp; Inscription
                </span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#c59b63] text-[#0d0d11] font-bold uppercase">
                Editing Now
              </span>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] text-[#8e877e] uppercase mb-1">Quote Inscription</label>
              <textarea
                rows={3}
                value={content.quote || ''}
                onChange={(e) => handleContentChange('quote', e.target.value)}
                placeholder="Quote text..."
                className="w-full bg-[#09090d] border border-[#242430] p-2 text-xs text-[#f7f4ee] italic"
              />
              <label className="block text-[10px] text-[#8e877e] uppercase mb-1">Author / Inscribed Citation</label>
              <input
                type="text"
                value={content.quoteAuthor || ''}
                onChange={(e) => handleContentChange('quoteAuthor', e.target.value)}
                placeholder="Attorney Name or Jurist"
                className="w-full bg-[#09090d] border border-[#242430] px-2.5 py-1.5 text-xs text-[#f7f4ee]"
              />
            </div>

            {/* Quick Typography & Tone for Inscribed Quote */}
            <PartTypographyQuickEditor
              partId="quote"
              partLabel="Featured Quote &amp; Inscription"
              partTypo={quoteTypo}
              onChange={handleTypographyChange}
            />
          </div>
        );

      case 'video':
        return (
          <div id="part-card-video" className="p-3.5 bg-[#121218] border border-[#c59b63]/60 space-y-3">
            <div className="flex items-center justify-between border-b border-[#222230] pb-2">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-[#c59b63]" />
                <span className="font-cinzel text-[11px] font-bold text-[#f4e6d0] uppercase tracking-wider">
                  Video URL &amp; Stream Embed
                </span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#c59b63] text-[#0d0d11] font-bold uppercase">
                Editing Now
              </span>
            </div>
            <div>
              <label className="block text-[10px] text-[#8e877e] uppercase mb-1">Video Stream Embed</label>
              <input
                type="text"
                value={content.videoUrl || ''}
                onChange={(e) => handleContentChange('videoUrl', e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#09090d] border border-[#242430] px-3 py-2 text-xs text-[#f7f4ee] font-mono"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0e0e13] text-[#f7f4ee] select-none">
      {/* Top Inspector Header */}
      <div className="p-3.5 border-b border-[#1c1c25] flex items-center justify-between bg-[#121218]">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onClose}
            className="p-1.5 text-[#8e877e] hover:text-[#f4e6d0] hover:bg-[#1a1a24] transition-colors cursor-pointer"
            title="Return to Blocks Outline"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-xs font-bold text-[#f4e6d0] uppercase truncate">
                {section.title || section.type}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 bg-[#c59b63] text-[#0d0d11] font-bold">
                #{index + 1}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-mono text-[#8a837a] uppercase tracking-wider">
                {section.type}
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 bg-[#171722] text-[#c59b63] border border-[#2b2b3b]">
                <Lock className="w-2.5 h-2.5 text-[#c59b63]" />
                Layout Locked
              </span>
            </div>
          </div>
        </div>

        {/* Quick Block Actions: Duplicate, Visibility, Delete */}
        <div className="flex items-center gap-1">
          <button
            onClick={onDuplicate}
            className="p-1.5 text-[#8e877e] hover:text-[#f4e6d0] transition-colors cursor-pointer"
            title="Duplicate Block Content"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onUpdate({ isVisible: !section.isVisible })}
            className={`p-1.5 transition-colors cursor-pointer ${
              section.isVisible ? 'text-emerald-400 hover:text-emerald-300' : 'text-[#6e6860] hover:text-[#a8a199]'
            }`}
            title={section.isVisible ? 'Hide from live output' : 'Show in live output'}
          >
            {section.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-rose-500/70 hover:text-rose-400 transition-colors cursor-pointer"
            title="Delete Block Content"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sub-tabs: Content Elements & Typography/Tone */}
      <div className="flex border-b border-[#1c1c25] bg-[#0c0c10]">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-cinzel uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === 'content'
              ? 'text-[#c59b63] border-b-2 border-[#c59b63] font-semibold bg-[#14141a]'
              : 'text-[#8e877e] hover:text-[#f7f4ee]'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Content Elements</span>
        </button>
        <button
          onClick={() => setActiveTab('typography')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-cinzel uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === 'typography'
              ? 'text-[#c59b63] border-b-2 border-[#c59b63] font-semibold bg-[#14141a]'
              : 'text-[#8e877e] hover:text-[#f7f4ee]'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Typography &amp; Tone</span>
        </button>
      </div>

      {/* ELEMENT PART SELECTOR / NAVIGATOR BAR */}
      <div className="p-2 bg-[#121218] border-b border-[#22222f] space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-cinzel text-[9px] uppercase tracking-wider text-[#8e877e] flex items-center gap-1">
            <MousePointer className="w-3 h-3 text-[#c59b63]" />
            <span>Target Element Part:</span>
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-[#c59b63] font-bold">
              {activePart ? `Part: ${activePart}` : 'All Parts'}
            </span>
            <button
              type="button"
              onClick={() => setIsolatePart(!isolatePart)}
              className={`px-1.5 py-0.5 text-[8px] font-cinzel uppercase rounded-xs transition-colors cursor-pointer ${
                isolatePart
                  ? 'bg-[#c59b63] text-[#0d0d11] font-bold'
                  : 'bg-[#1e1e2b] text-[#8e877e] hover:text-[#f7f4ee]'
              }`}
              title="Toggle between single-element focused mode and all-fields view"
            >
              {isolatePart ? 'Focused Mode' : 'All Fields'}
            </button>
          </div>
        </div>

        {/* Quick Element Switcher Badges */}
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => {
              setIsolatePart(false);
            }}
            className={`flex items-center gap-1 px-2 py-1 text-[9px] font-cinzel uppercase transition-all cursor-pointer rounded-sm ${
              !isolatePart
                ? 'bg-[#c59b63] text-[#0d0d11] font-bold shadow-md'
                : 'bg-[#181822] text-[#8e877e] hover:text-[#f7f4ee] hover:bg-[#20202e] border border-[#272738]'
            }`}
          >
            <Box className="w-2.5 h-2.5" />
            <span>All Parts</span>
          </button>
          {availableParts.map((item) => {
            const isSelected = activePart === item.id && isolatePart;
            const ItemIcon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectPart?.(item.id);
                  setIsolatePart(true);
                }}
                className={`flex items-center gap-1 px-2 py-1 text-[9px] font-cinzel uppercase transition-all cursor-pointer rounded-sm ${
                  isSelected
                    ? 'bg-[#c59b63] text-[#0d0d11] font-bold shadow-md ring-1 ring-[#c59b63]'
                    : 'bg-[#181822] text-[#8e877e] hover:text-[#f7f4ee] hover:bg-[#20202e] border border-[#272738]'
                }`}
              >
                <ItemIcon className="w-2.5 h-2.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Form Fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left text-xs">
        {/* ========================================================= */}
        {/* 1. CONTENT TAB                                            */}
        {/* ========================================================= */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            {isolatePart && activePart ? (
              <>
                {/* Focused Part Header Banner */}
                <div className="p-3 bg-[#13131c] border-l-2 border-[#c59b63] border-y border-r border-[#222230] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#c59b63] animate-pulse" />
                    <div>
                      <div className="font-cinzel text-xs font-bold text-[#f7f4ee] uppercase">
                        Editing: {getPartLabel(activePart)}
                      </div>
                      <div className="text-[10px] text-[#a8a199]">
                        Isolated view — only this element is shown. Headings and other parts will not change.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsolatePart(false)}
                    className="px-2 py-1 text-[10px] font-cinzel uppercase text-[#c59b63] bg-[#1a1a26] border border-[#333348] hover:border-[#c59b63] transition-colors cursor-pointer"
                  >
                    Show All Parts
                  </button>
                </div>

                {/* Render ONLY the clicked element part */}
                <div>
                  {renderPartEditor(activePart) || (
                    <div className="p-4 bg-[#111116] border border-[#22222d] text-center text-xs text-[#8e877e]">
                      No custom editor available for {activePart}. Select another part above.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* All Parts Mode Info Banner */}
                <div className="p-2.5 bg-[#101016] border border-[#22222d] flex items-center justify-between">
                  <span className="text-[10px] text-[#8e877e]">
                    Displaying all fields for this section
                  </span>
                  {activePart && (
                    <button
                      type="button"
                      onClick={() => setIsolatePart(true)}
                      className="px-2 py-0.5 text-[10px] font-cinzel uppercase text-[#c59b63] hover:underline cursor-pointer"
                    >
                      Focus on {getPartLabel(activePart)}
                    </button>
                  )}
                </div>
            {/* If HERO: Render dedicated, organized element cards */}
            {isHero ? (
              <>
                {/* PART 1: FIRM EMBLEM / LOGO CREST CARD */}
                <div
                  id="part-card-logo"
                  onClick={() => onSelectPart?.('logo')}
                  className={`p-3.5 border transition-all rounded-sm space-y-3 ${
                    activePart === 'logo'
                      ? 'border-[#c59b63] bg-[#171724] ring-1 ring-[#c59b63]/50 shadow-[0_0_20px_rgba(197,155,99,0.15)]'
                      : 'border-[#22222f] bg-[#111116] hover:border-[#333345]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#c59b63]" />
                      <span className="font-cinzel text-[11px] font-bold text-[#f4e6d0] uppercase tracking-wider">
                        Firm Emblem / Logo Crest
                      </span>
                    </div>
                    {activePart === 'logo' && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#c59b63] text-[#0d0d11] font-bold uppercase rounded-xs">
                        Editing Now
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Toggle Show Logo */}
                    <label className="flex items-center justify-between p-2 bg-[#09090d] border border-[#242430] cursor-pointer">
                      <span className="text-[11px] text-[#f7f4ee]">Display Firm Logo Crest</span>
                      <input
                        type="checkbox"
                        checked={content.showLogo !== false}
                        onChange={(e) => handleContentChange('showLogo', e.target.checked)}
                        className="accent-[#c59b63]"
                      />
                    </label>

                    {/* Logo Size Selection */}
                    <div>
                      <label className="block text-[10px] text-[#8e877e] uppercase mb-1">Logo Scale Size</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'sm', label: 'Compact (56px)' },
                          { id: 'md', label: 'Standard (76px)' },
                          { id: 'lg', label: 'Monumental (96px)' },
                        ].map((sz) => (
                          <button
                            key={sz.id}
                            type="button"
                            onClick={() => handleContentChange('logoSize', sz.id)}
                            className={`p-1.5 text-center text-[10px] font-cinzel uppercase border transition-colors cursor-pointer ${
                              (content.logoSize || 'md') === sz.id
                                ? 'border-[#c59b63] bg-[#1c1c28] text-[#f4e6d0] font-bold'
                                : 'border-[#22222f] bg-[#09090d] text-[#8e877e]'
                            }`}
                          >
                            {sz.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Logo Image File option */}
                    <div>
                      <ImageUploadField
                        label="Custom Logo Image File (Optional)"
                        value={content.customLogoUrl || ''}
                        onChange={(newUrl) => handleContentChange('customLogoUrl', newUrl)}
                        compact={true}
                        aspectRatio="square"
                        helperText="Upload custom logo file (PNG/SVG) or leave blank for default crest."
                      />
                      {content.customLogoUrl && (
                        <button
                          type="button"
                          onClick={() => handleContentChange('customLogoUrl', '')}
                          className="text-[10px] font-cinzel text-[#c59b63] hover:underline mt-1 block cursor-pointer"
                        >
                          Reset to Official Lalusis Emblem
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* PART 2: EYEBROW / PRE-TITLE CARD */}
                <div
                  id="part-card-eyebrow"
                  onClick={() => onSelectPart?.('eyebrow')}
                  className={`p-3.5 border transition-all rounded-sm space-y-2 ${
                    activePart === 'eyebrow'
                      ? 'border-[#c59b63] bg-[#171724] ring-1 ring-[#c59b63]/50 shadow-[0_0_20px_rgba(197,155,99,0.15)]'
                      : 'border-[#22222f] bg-[#111116] hover:border-[#333345]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4 text-[#c59b63]" />
                      <span className="font-cinzel text-[11px] font-bold text-[#f4e6d0] uppercase tracking-wider">
                        Eyebrow / Pre-Title
                      </span>
                    </div>
                    {activePart === 'eyebrow' && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#c59b63] text-[#0d0d11] font-bold uppercase rounded-xs">
                        Editing Now
                      </span>
                    )}
                  </div>

                  <input
                    type="text"
                    value={content.eyebrow || ''}
                    onFocus={() => onSelectPart?.('eyebrow')}
                    onChange={(e) => handleContentChange('eyebrow', e.target.value)}
                    placeholder="e.g. Attorneys at Law · Established 1998"
                    className="w-full bg-[#09090d] border border-[#242430] px-3 py-2 text-xs text-[#f7f4ee] focus:border-[#c59b63] focus:outline-none font-sans"
                  />
                </div>

                {/* PART 3: HEADER 1 (MAIN HEADLINE) CARD */}
                <div
                  id="part-card-headline"
                  onClick={() => onSelectPart?.('headline')}
                  className={`p-3.5 border transition-all rounded-sm space-y-3 ${
                    activePart === 'headline'
                      ? 'border-[#c59b63] bg-[#171724] ring-1 ring-[#c59b63]/50 shadow-[0_0_20px_rgba(197,155,99,0.15)]'
                      : 'border-[#22222f] bg-[#111116] hover:border-[#333345]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#c59b63]" />
                      <span className="font-cinzel text-[11px] font-bold text-[#f4e6d0] uppercase tracking-wider">
                        Header 1 (Main Headline)
                      </span>
                    </div>
                    {activePart === 'headline' && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#c59b63] text-[#0d0d11] font-bold uppercase rounded-xs">
                        Editing Now
                      </span>
                    )}
                  </div>

                  <textarea
                    rows={2}
                    value={content.headline || ''}
                    onFocus={() => onSelectPart?.('headline')}
                    onChange={(e) => handleContentChange('headline', e.target.value)}
                    placeholder="Enter commanding legal headline..."
                    className="w-full bg-[#09090d] border border-[#242430] p-2.5 text-xs text-[#f7f4ee] focus:border-[#c59b63] focus:outline-none font-cormorant text-sm leading-snug"
                  />

                  {/* Quick Text Tone Selector directly on Header 1 */}
                  <div>
                    <label className="block text-[10px] text-[#8e877e] uppercase mb-1">
                      Header 1 Text Tone / Accent Color:
                    </label>
                    <div className="grid grid-cols-5 gap-1">
                      {[
                        { id: 'ivory', label: 'Ivory', color: '#f7f4ee' },
                        { id: 'gold', label: 'Gold', color: '#c59b63' },
                        { id: 'champagne', label: 'Champagne', color: '#f4e6d0' },
                        { id: 'muted', label: 'Muted', color: '#a8a199' },
                        { id: 'gradient', label: 'Gradient', color: '#e6d5bc' },
                      ].map((tone) => (
                        <button
                          key={tone.id}
                          type="button"
                          onClick={() => handleTypographyChange('textColor', tone.id)}
                          className={`p-1.5 text-center text-[9px] font-cinzel uppercase border transition-all cursor-pointer ${
                            (typography.textColor || 'ivory') === tone.id
                              ? 'border-[#c59b63] bg-[#1a1a24] text-[#f4e6d0] font-bold'
                              : 'border-[#22222f] bg-[#09090d] text-[#8e877e]'
                          }`}
                          title={tone.label}
                        >
                          <div
                            className="w-2 h-2 rounded-full mx-auto mb-0.5"
                            style={{ backgroundColor: tone.color }}
                          />
                          <span className="truncate block">{tone.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* PART 4: SUBTITLE / PARAGRAPH DESCRIPTION CARD */}
                <div
                  id="part-card-subheadline"
                  onClick={() => onSelectPart?.('subheadline')}
                  className={`p-3.5 border transition-all rounded-sm space-y-3 ${
                    activePart === 'subheadline'
                      ? 'border-[#c59b63] bg-[#171724] ring-1 ring-[#c59b63]/50 shadow-[0_0_20px_rgba(197,155,99,0.15)]'
                      : 'border-[#22222f] bg-[#111116] hover:border-[#333345]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlignLeft className="w-4 h-4 text-[#c59b63]" />
                      <span className="font-cinzel text-[11px] font-bold text-[#f4e6d0] uppercase tracking-wider">
                        Subtitle / Paragraph Description
                      </span>
                    </div>
                    {activePart === 'subheadline' && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#c59b63] text-[#0d0d11] font-bold uppercase rounded-xs">
                        Editing Now
                      </span>
                    )}
                  </div>

                  <textarea
                    rows={3}
                    value={content.subheadline || ''}
                    onFocus={() => onSelectPart?.('subheadline')}
                    onChange={(e) => handleContentChange('subheadline', e.target.value)}
                    placeholder="Enter descriptive paragraph explaining chamber doctrine..."
                    className="w-full bg-[#09090d] border border-[#242430] p-2.5 text-xs text-[#f7f4ee] focus:border-[#c59b63] focus:outline-none leading-relaxed"
                  />

                  {/* Quick Paragraph Alignment Selector */}
                  <div>
                    <label className="block text-[10px] text-[#8e877e] uppercase mb-1">
                      Paragraph &amp; Text Alignment:
                    </label>
                    <div className="grid grid-cols-4 gap-1 bg-[#09090d] p-1 border border-[#242430]">
                      {[
                        { id: 'left', label: 'Left', icon: AlignLeft },
                        { id: 'center', label: 'Center', icon: AlignCenter },
                        { id: 'right', label: 'Right', icon: AlignRight },
                        { id: 'justify', label: 'Justify', icon: AlignJustify },
                      ].map((align) => {
                        const Icon = align.icon;
                        const isSelected = (activeTypo.alignment || 'center') === align.id;
                        return (
                          <button
                            key={align.id}
                            type="button"
                            onClick={() => handleTypographyChange('alignment', align.id)}
                            className={`flex items-center justify-center gap-1 py-1.5 text-[10px] font-cinzel uppercase cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-[#c59b63] text-[#0d0d11] font-bold'
                                : 'text-[#8e877e] hover:text-[#f7f4ee]'
                            }`}
                          >
                            <Icon className="w-3 h-3" />
                            <span>{align.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* PART 5: ACTION BUTTONS (PRIMARY & SECONDARY CTA) */}
                <div
                  id="part-card-buttons"
                  onClick={() => onSelectPart?.('buttons')}
                  className={`p-3.5 border transition-all rounded-sm space-y-3 ${
                    activePart === 'buttons'
                      ? 'border-[#c59b63] bg-[#171724] ring-1 ring-[#c59b63]/50 shadow-[0_0_20px_rgba(197,155,99,0.15)]'
                      : 'border-[#22222f] bg-[#111116] hover:border-[#333345]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link className="w-4 h-4 text-[#c59b63]" />
                      <span className="font-cinzel text-[11px] font-bold text-[#f4e6d0] uppercase tracking-wider">
                        Action Buttons &amp; Links (Primary &amp; Secondary)
                      </span>
                    </div>
                    {activePart === 'buttons' && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#c59b63] text-[#0d0d11] font-bold uppercase rounded-xs">
                        Editing Now
                      </span>
                    )}
                  </div>

                  {/* Primary CTA */}
                  <div className="p-2.5 bg-[#09090d] border border-[#242430] space-y-2">
                    <span className="font-cinzel text-[10px] font-bold text-[#c59b63] uppercase block">
                      1. Primary Button (Solid Gold Accent)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] text-[#8e877e] uppercase mb-0.5">Label Text</label>
                        <input
                          type="text"
                          value={content.ctaPrimaryText || content.primaryCtaText || ''}
                          onFocus={() => onSelectPart?.('buttons')}
                          onChange={(e) => {
                            handleContentChange('ctaPrimaryText', e.target.value);
                            handleContentChange('primaryCtaText', e.target.value);
                          }}
                          placeholder="Request Consultation"
                          className="w-full bg-[#121218] border border-[#2b2b3b] px-2 py-1.5 text-xs text-[#f7f4ee] focus:border-[#c59b63] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-[#8e877e] uppercase mb-0.5">Link Path / URL</label>
                        <input
                          type="text"
                          value={content.ctaPrimaryLink || content.primaryCtaLink || ''}
                          onFocus={() => onSelectPart?.('buttons')}
                          onChange={(e) => {
                            handleContentChange('ctaPrimaryLink', e.target.value);
                            handleContentChange('primaryCtaLink', e.target.value);
                          }}
                          placeholder="/consultation"
                          className="w-full bg-[#121218] border border-[#2b2b3b] px-2 py-1.5 text-xs text-[#f7f4ee] focus:border-[#c59b63] focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Secondary CTA */}
                  <div className="p-2.5 bg-[#09090d] border border-[#242430] space-y-2">
                    <span className="font-cinzel text-[10px] font-bold text-[#a8a199] uppercase block">
                      2. Secondary Button (Gold Outline)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] text-[#8e877e] uppercase mb-0.5">Label Text</label>
                        <input
                          type="text"
                          value={content.ctaSecondaryText || content.secondaryCtaText || ''}
                          onFocus={() => onSelectPart?.('buttons')}
                          onChange={(e) => {
                            handleContentChange('ctaSecondaryText', e.target.value);
                            handleContentChange('secondaryCtaText', e.target.value);
                          }}
                          placeholder="Explore Practice Areas"
                          className="w-full bg-[#121218] border border-[#2b2b3b] px-2 py-1.5 text-xs text-[#f7f4ee] focus:border-[#c59b63] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-[#8e877e] uppercase mb-0.5">Link Path / URL</label>
                        <input
                          type="text"
                          value={content.ctaSecondaryLink || content.secondaryCtaLink || ''}
                          onFocus={() => onSelectPart?.('buttons')}
                          onChange={(e) => {
                            handleContentChange('ctaSecondaryLink', e.target.value);
                            handleContentChange('secondaryCtaLink', e.target.value);
                          }}
                          placeholder="/practice-areas"
                          className="w-full bg-[#121218] border border-[#2b2b3b] px-2 py-1.5 text-xs text-[#f7f4ee] focus:border-[#c59b63] focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* PART 6: TRUST BADGES & METRICS CARD */}
                <div
                  id="part-card-stats"
                  onClick={() => onSelectPart?.('stats')}
                  className={`p-3.5 border transition-all rounded-sm space-y-3 ${
                    activePart === 'stats'
                      ? 'border-[#c59b63] bg-[#171724] ring-1 ring-[#c59b63]/50 shadow-[0_0_20px_rgba(197,155,99,0.15)]'
                      : 'border-[#22222f] bg-[#111116] hover:border-[#333345]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#c59b63]" />
                      <span className="font-cinzel text-[11px] font-bold text-[#f4e6d0] uppercase tracking-wider">
                        Trust Badges &amp; Metrics
                      </span>
                    </div>
                    {activePart === 'stats' && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#c59b63] text-[#0d0d11] font-bold uppercase rounded-xs">
                        Editing Now
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1 bg-[#09090d] p-2 border border-[#242430]">
                      <span className="text-[9px] font-mono text-[#c59b63] uppercase">Badge 1</span>
                      <input
                        type="text"
                        value={content.badge1Value || '28+ Years'}
                        onFocus={() => onSelectPart?.('stats')}
                        onChange={(e) => handleContentChange('badge1Value', e.target.value)}
                        placeholder="28+ Years"
                        className="w-full bg-[#121218] border border-[#2b2b3b] px-2 py-1 text-xs text-[#f7f4ee] font-cormorant font-bold"
                      />
                      <input
                        type="text"
                        value={content.badge1Label || 'Trial Eminence'}
                        onFocus={() => onSelectPart?.('stats')}
                        onChange={(e) => handleContentChange('badge1Label', e.target.value)}
                        placeholder="Trial Eminence"
                        className="w-full bg-[#121218] border border-[#2b2b3b] px-2 py-1 text-[10px] text-[#8e877e] font-cinzel"
                      />
                    </div>

                    <div className="space-y-1 bg-[#09090d] p-2 border border-[#242430]">
                      <span className="text-[9px] font-mono text-[#c59b63] uppercase">Badge 2</span>
                      <input
                        type="text"
                        value={content.badge2Value || '150+'}
                        onFocus={() => onSelectPart?.('stats')}
                        onChange={(e) => handleContentChange('badge2Value', e.target.value)}
                        placeholder="150+"
                        className="w-full bg-[#121218] border border-[#2b2b3b] px-2 py-1 text-xs text-[#f7f4ee] font-cormorant font-bold"
                      />
                      <input
                        type="text"
                        value={content.badge2Label || 'Supreme Court Rulings'}
                        onFocus={() => onSelectPart?.('stats')}
                        onChange={(e) => handleContentChange('badge2Label', e.target.value)}
                        placeholder="Supreme Court Rulings"
                        className="w-full bg-[#121218] border border-[#2b2b3b] px-2 py-1 text-[10px] text-[#8e877e] font-cinzel"
                      />
                    </div>

                    <div className="space-y-1 bg-[#09090d] p-2 border border-[#242430]">
                      <span className="text-[9px] font-mono text-[#c59b63] uppercase">Badge 3</span>
                      <input
                        type="text"
                        value={content.badge3Value || '₱180B+'}
                        onFocus={() => onSelectPart?.('stats')}
                        onChange={(e) => handleContentChange('badge3Value', e.target.value)}
                        placeholder="₱180B+"
                        className="w-full bg-[#121218] border border-[#2b2b3b] px-2 py-1 text-xs text-[#f7f4ee] font-cormorant font-bold"
                      />
                      <input
                        type="text"
                        value={content.badge3Label || 'Transactions Advised'}
                        onFocus={() => onSelectPart?.('stats')}
                        onChange={(e) => handleContentChange('badge3Label', e.target.value)}
                        placeholder="Transactions Advised"
                        className="w-full bg-[#121218] border border-[#2b2b3b] px-2 py-1 text-[10px] text-[#8e877e] font-cinzel"
                      />
                    </div>

                    <div className="space-y-1 bg-[#09090d] p-2 border border-[#242430]">
                      <span className="text-[9px] font-mono text-[#c59b63] uppercase">Badge 4</span>
                      <input
                        type="text"
                        value={content.badge4Value || 'Tier 1'}
                        onFocus={() => onSelectPart?.('stats')}
                        onChange={(e) => handleContentChange('badge4Value', e.target.value)}
                        placeholder="Tier 1"
                        className="w-full bg-[#121218] border border-[#2b2b3b] px-2 py-1 text-xs text-[#f7f4ee] font-cormorant font-bold"
                      />
                      <input
                        type="text"
                        value={content.badge4Label || 'Corporate Practice'}
                        onFocus={() => onSelectPart?.('stats')}
                        onChange={(e) => handleContentChange('badge4Label', e.target.value)}
                        placeholder="Corporate Practice"
                        className="w-full bg-[#121218] border border-[#2b2b3b] px-2 py-1 text-[10px] text-[#8e877e] font-cinzel"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* NON-HERO BLOCKS (Text, Image, Video, Container, News, Points, Quote, etc.) */
              <div className="space-y-4">
                {/* Eyebrow */}
                <div>
                  <label className="block font-cinzel text-[10px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
                    Eyebrow / Sub-Header
                  </label>
                  <input
                    type="text"
                    value={content.eyebrow || ''}
                    onChange={(e) => handleContentChange('eyebrow', e.target.value)}
                    placeholder="e.g. Legal Jurisprudence"
                    className="w-full bg-[#09090d] border border-[#242430] px-3 py-2 text-xs text-[#f7f4ee] focus:border-[#c59b63] focus:outline-none font-sans"
                  />
                </div>

                {/* Headline */}
                <div>
                  <label className="block font-cinzel text-[10px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
                    Headline / Title
                  </label>
                  <textarea
                    rows={2}
                    value={content.headline || ''}
                    onChange={(e) => handleContentChange('headline', e.target.value)}
                    placeholder="Enter section headline..."
                    className="w-full bg-[#09090d] border border-[#242430] p-2.5 text-xs text-[#f7f4ee] focus:border-[#c59b63] focus:outline-none font-cormorant text-sm leading-snug"
                  />
                </div>

                {/* Subheadline */}
                <div>
                  <label className="block font-cinzel text-[10px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
                    Subheadline / Overview
                  </label>
                  <textarea
                    rows={3}
                    value={content.subheadline || ''}
                    onChange={(e) => handleContentChange('subheadline', e.target.value)}
                    placeholder="Descriptive overview..."
                    className="w-full bg-[#09090d] border border-[#242430] p-2.5 text-xs text-[#f7f4ee] focus:border-[#c59b63] focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Body Copy */}
                <div>
                  <label className="block font-cinzel text-[10px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
                    Body Text &amp; Editorial Content
                  </label>
                  <textarea
                    rows={5}
                    value={content.body || ''}
                    onChange={(e) => handleContentChange('body', e.target.value)}
                    placeholder="Enter detailed editorial text..."
                    className="w-full bg-[#09090d] border border-[#242430] p-2.5 text-xs text-[#f7f4ee] focus:border-[#c59b63] focus:outline-none leading-relaxed font-sans"
                  />
                </div>

                {/* Action Button */}
                {(section.type === 'button' || content.buttonText !== undefined || section.type === 'container') && (
                  <div className="space-y-3 pt-3 border-t border-[#1f1f2a]">
                    <span className="font-cinzel text-[11px] font-bold tracking-wider text-[#c59b63] uppercase block">
                      Action Button
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-[#8e877e] uppercase mb-1">Label</label>
                        <input
                          type="text"
                          value={content.buttonText || ''}
                          onChange={(e) => handleContentChange('buttonText', e.target.value)}
                          placeholder="Button Label"
                          className="w-full bg-[#09090d] border border-[#242430] px-2.5 py-1.5 text-xs text-[#f7f4ee]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#8e877e] uppercase mb-1">Link URL</label>
                        <input
                          type="text"
                          value={content.buttonLink || ''}
                          onChange={(e) => handleContentChange('buttonLink', e.target.value)}
                          placeholder="/path or https://"
                          className="w-full bg-[#09090d] border border-[#242430] px-2.5 py-1.5 text-xs text-[#f7f4ee] font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Video Settings */}
                {(section.type === 'video' || content.videoUrl !== undefined) && (
                  <div className="space-y-3 pt-3 border-t border-[#1f1f2a]">
                    <span className="font-cinzel text-[11px] font-bold tracking-wider text-[#c59b63] uppercase block">
                      Video URL &amp; Stream Embed
                    </span>
                    <input
                      type="text"
                      value={content.videoUrl || ''}
                      onChange={(e) => handleContentChange('videoUrl', e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#09090d] border border-[#242430] px-3 py-2 text-xs text-[#f7f4ee] font-mono"
                    />
                  </div>
                )}

                {/* Photography Settings */}
                {(content.imageUrl !== undefined || section.type === 'image' || section.type === 'imageText') && (
                  <div className="space-y-3 pt-3 border-t border-[#1f1f2a]">
                    <ImageUploadField
                      label="Chamber Imagery Picture File"
                      value={content.imageUrl || ''}
                      onChange={(newUrl) => handleContentChange('imageUrl', newUrl)}
                      compact={true}
                      aspectRatio="landscape"
                      helperText="Upload an image file directly from your computer or choose from library."
                    />
                  </div>
                )}

                {/* Bullet Points */}
                {(content.points !== undefined || section.type === 'imageText') && (
                  <div className="space-y-2 pt-3 border-t border-[#1f1f2a]">
                    <label className="block font-cinzel text-[10px] font-semibold tracking-wider text-[#d4af7a] uppercase">
                      Bullet Points
                    </label>
                    <div className="space-y-1.5">
                      {(Array.isArray(content.points) ? content.points : []).map((point: string, pIdx: number) => (
                        <div
                          key={pIdx}
                          className="flex items-center justify-between gap-2 p-1.5 bg-[#14141c] border border-[#22222d] text-xs"
                        >
                          <span className="text-[#f7f4ee] text-[11px] truncate flex-1">• {point}</span>
                          <button
                            type="button"
                            onClick={() => handleRemovePoint(pIdx)}
                            className="text-[#8e877e] hover:text-rose-400 p-1 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={newPoint}
                        onChange={(e) => setNewPoint(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddPoint();
                          }
                        }}
                        placeholder="Add new point..."
                        className="flex-1 bg-[#09090d] border border-[#242430] px-2.5 py-1.5 text-xs text-[#f7f4ee]"
                      />
                      <button
                        type="button"
                        onClick={handleAddPoint}
                        className="px-3 py-1.5 bg-[#1e1e28] border border-[#333345] hover:border-[#c59b63] text-xs text-[#d4af7a] cursor-pointer font-cinzel uppercase"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
              </>
            )}

            {/* General Internal Block Label */}
            <div className="pt-3 border-t border-[#1f1f28]">
              <label className="block text-[10px] text-[#8e877e] uppercase mb-1">
                Admin Block Label
              </label>
              <input
                type="text"
                value={section.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Internal label for page structure"
                className="w-full bg-[#09090d] border border-[#242430] px-3 py-2 text-xs text-[#f7f4ee] focus:border-[#c59b63] focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. TYPOGRAPHY TAB (FONT FAMILY, SIZE, ALIGNMENT, ACCENT)   */}
        {/* ========================================================= */}
        {activeTab === 'typography' && (
          <div className="space-y-5">
            {/* Target Element Selector */}
            <div className="p-3 bg-[#111118] border border-[#c59b63]/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Type className="w-3.5 h-3.5 text-[#c59b63]" />
                  <span className="font-cinzel text-[11px] uppercase font-bold text-[#f7f4ee]">
                    Styling Target: {currentEditingPart ? getPartLabel(currentEditingPart) : 'Entire Section (Global)'}
                  </span>
                </div>
                {currentEditingPart && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#c59b63] text-[#0d0d11] font-bold uppercase">
                    Element Isolated
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#8e877e] leading-relaxed">
                {currentEditingPart
                  ? `Changes to font family, color, size, or alignment will ONLY affect the ${getPartLabel(currentEditingPart)}. Other elements remain untouched.`
                  : 'Section-wide defaults. To style a single element individually, select it below or click it directly on the canvas.'}
              </p>
              <div className="flex flex-wrap gap-1 pt-1.5 border-t border-[#1f1f2a]">
                <button
                  type="button"
                  onClick={() => onSelectPart?.(null)}
                  className={`px-2 py-1 text-[9px] font-cinzel uppercase border transition-all cursor-pointer ${
                    !currentEditingPart
                      ? 'border-[#c59b63] bg-[#c59b63] text-[#0d0d11] font-bold shadow-sm'
                      : 'border-[#242430] bg-[#09090d] text-[#8e877e] hover:text-[#f4e6d0]'
                  }`}
                >
                  All / Section Default
                </button>
                {availableParts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSelectPart?.(p.id)}
                    className={`px-2 py-1 text-[9px] font-cinzel uppercase border transition-all cursor-pointer ${
                      currentEditingPart === p.id
                        ? 'border-[#c59b63] bg-[#c59b63] text-[#0d0d11] font-bold shadow-sm'
                        : 'border-[#242430] bg-[#09090d] text-[#8e877e] hover:text-[#f4e6d0]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Paragraph & Text Alignment (PRIMARY FOCUS) */}
            <div className="p-3 bg-[#13131c] border border-[#222230] space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-cinzel text-[11px] font-bold tracking-wider text-[#d4af7a] uppercase">
                  Paragraph &amp; Text Alignment
                </label>
                <span className="text-[10px] font-mono text-[#c59b63] uppercase font-bold">
                  Active: {activeTypo.alignment || 'center'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 bg-[#09090d] p-1.5 border border-[#242430]">
                {[
                  { id: 'left', label: 'Left', icon: AlignLeft },
                  { id: 'center', label: 'Center', icon: AlignCenter },
                  { id: 'right', label: 'Right', icon: AlignRight },
                  { id: 'justify', label: 'Justify', icon: AlignJustify },
                ].map((align) => {
                  const Icon = align.icon;
                  const isSelected = (activeTypo.alignment || 'center') === align.id;
                  return (
                    <button
                      key={align.id}
                      type="button"
                      onClick={() => handleTypographyChange('alignment', align.id)}
                      className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-cinzel uppercase cursor-pointer transition-all rounded-xs ${
                        isSelected
                          ? 'bg-[#c59b63] text-[#0d0d11] font-bold shadow-md ring-1 ring-[#c59b63]'
                          : 'text-[#8e877e] hover:text-[#f7f4ee] hover:bg-[#151520]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{align.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Text Tone / Accent Color (PRIMARY FOCUS) */}
            <div className="p-3 bg-[#13131c] border border-[#222230] space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-cinzel text-[11px] font-bold tracking-wider text-[#d4af7a] uppercase">
                  Text Tone / Accent Color
                </label>
                <span className="text-[10px] font-mono text-[#c59b63] uppercase font-bold">
                  Active: {activeTypo.customColor ? activeTypo.customColor : (activeTypo.textColor || 'ivory')}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'ivory', label: 'Ivory Bone', color: '#f7f4ee', desc: 'Crisp Editorial' },
                  { id: 'gold', label: 'Solid Gold', color: '#c59b63', desc: 'Chamber Accent' },
                  { id: 'champagne', label: 'Champagne', color: '#f4e6d0', desc: 'Warm Luminary' },
                  { id: 'muted', label: 'Muted Slate', color: '#8e877e', desc: 'Subtle Charcoal' },
                  { id: 'gradient', label: 'Gold Gradient', color: '#d4af7a', desc: 'Lustrous Glow' },
                ].map((tc) => {
                  const isSelected = !activeTypo.customColor && (activeTypo.textColor || 'ivory') === tc.id;
                  return (
                    <button
                      key={tc.id}
                      type="button"
                      onClick={() => {
                        handleTypographyChange('textColor', tc.id);
                        if (activeTypo.customColor) {
                          handleTypographyChange('customColor', undefined);
                        }
                      }}
                      className={`p-2.5 text-center border text-[10px] font-cinzel uppercase transition-all cursor-pointer rounded-xs ${
                        isSelected
                          ? 'border-[#c59b63] bg-[#1d1d2b] text-[#f4e6d0] font-bold ring-1 ring-[#c59b63]'
                          : 'border-[#22222f] bg-[#0c0c10] text-[#8e877e] hover:border-[#444458]'
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full mx-auto mb-1 border border-black/40 shadow-sm"
                        style={{ backgroundColor: tc.color }}
                      />
                      <span className="block font-bold">{tc.label}</span>
                      <span className="text-[8px] font-mono text-[#6e6860]">{tc.desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Hex Color Picker */}
              <div className="pt-2 border-t border-[#1f1f2a] flex items-center gap-2">
                <input
                  type="color"
                  value={activeTypo.customColor || '#c59b63'}
                  onChange={(e) => handleTypographyChange('customColor', e.target.value)}
                  className="w-8 h-8 bg-transparent cursor-pointer rounded-xs border border-[#333344]"
                  title="Pick exact custom hex color"
                />
                <input
                  type="text"
                  value={activeTypo.customColor || ''}
                  onChange={(e) => handleTypographyChange('customColor', e.target.value)}
                  placeholder="Or enter custom hex e.g. #d4af7a"
                  className="flex-1 bg-[#09090d] border border-[#242430] px-2.5 py-1.5 text-xs text-[#f7f4ee] font-mono focus:border-[#c59b63] focus:outline-none"
                />
                {activeTypo.customColor && (
                  <button
                    type="button"
                    onClick={() => handleTypographyChange('customColor', undefined)}
                    className="px-2.5 py-1.5 bg-[#181824] border border-[#333348] text-[10px] text-[#8e877e] hover:text-[#f4e6d0] font-mono cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Font Family Selector */}
            <div>
              <label className="block font-cinzel text-[10px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-2">
                Font Family Archetype
              </label>
              <div className="space-y-1.5">
                {[
                  {
                    id: 'cormorant',
                    label: 'Cormorant Garamond',
                    category: 'Editorial Classical Serif',
                    sample: 'Jurisprudential Advocacy & Trial Doctrine',
                    className: 'font-cormorant',
                  },
                  {
                    id: 'cinzel',
                    label: 'Cinzel Roman',
                    category: 'Classical Monumental / Inscription',
                    sample: 'LALUSIS & PARTNERS · ATTORNEYS AT LAW',
                    className: 'font-cinzel',
                  },
                  {
                    id: 'sans',
                    label: 'Plus Jakarta Sans',
                    category: 'Crisp Modern Geometric Sans',
                    sample: 'Modern corporate advisory and institutional clarity',
                    className: 'font-sans',
                  },
                  {
                    id: 'playfair',
                    label: 'Playfair Display',
                    category: 'High-Contrast Luxury Serif',
                    sample: 'Distinguished Eminence in Commercial Law',
                    className: 'font-serif',
                  },
                  {
                    id: 'mono',
                    label: 'JetBrains Mono',
                    category: 'Legal Docket & Case Code',
                    sample: 'DOCKET NO. 2026-SC-PHIL-18492',
                    className: 'font-mono',
                  },
                ].map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => handleTypographyChange('fontFamily', font.id)}
                    className={`w-full p-2.5 text-left border transition-all cursor-pointer ${
                      (activeTypo.fontFamily || 'cormorant') === font.id
                        ? 'border-[#c59b63] bg-[#1a1a24] text-[#f4e6d0]'
                        : 'border-[#22222f] bg-[#0c0c10] text-[#8e877e] hover:border-[#444458]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-cinzel text-xs font-semibold text-[#f7f4ee]">
                        {font.label}
                      </span>
                      <span className="text-[9px] font-mono text-[#6e6860] uppercase">
                        {font.category}
                      </span>
                    </div>
                    <p className={`text-xs ${font.className} truncate text-[#d4af7a]`}>
                      {font.sample}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size Selector */}
            <div>
              <label className="block font-cinzel text-[10px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-2">
                Headline / Body Font Scale
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'xs', label: 'Fine', desc: '12px' },
                  { id: 'sm', label: 'Compact', desc: '14px' },
                  { id: 'base', label: 'Regular', desc: '16px' },
                  { id: 'lg', label: 'Lead', desc: '18px' },
                  { id: 'xl', label: 'Subhead', desc: '20px' },
                  { id: '2xl', label: 'Title', desc: '24px' },
                  { id: '3xl', label: 'Display', desc: '30px' },
                  { id: '4xl', label: 'Monument', desc: '36px+' },
                ].map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => handleTypographyChange('fontSize', size.id)}
                    className={`p-2 text-center border transition-all cursor-pointer ${
                      (activeTypo.fontSize || 'base') === size.id
                        ? 'border-[#c59b63] bg-[#1a1a24] text-[#f4e6d0] font-bold'
                        : 'border-[#22222f] bg-[#0c0c10] text-[#8e877e]'
                    }`}
                  >
                    <span className="font-cinzel text-xs block">{size.label}</span>
                    <span className="text-[9px] font-mono text-[#6e6860]">{size.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Specials & Treatments */}
            <div className="space-y-3 pt-3 border-t border-[#1f1f2a]">
              <label className="block font-cinzel text-[10px] font-semibold tracking-wider text-[#d4af7a] uppercase">
                Special Treatments &amp; Styling
              </label>

              {/* Weight & Spacing */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-[#8e877e] uppercase mb-1">Font Weight</label>
                  <select
                    value={activeTypo.fontWeight || 'normal'}
                    onChange={(e) => handleTypographyChange('fontWeight', e.target.value)}
                    className="w-full bg-[#09090d] border border-[#242430] px-2.5 py-1.5 text-xs text-[#f7f4ee] focus:border-[#c59b63] focus:outline-none cursor-pointer"
                  >
                    <option value="light">Light (300)</option>
                    <option value="normal">Regular (400)</option>
                    <option value="medium">Medium (500)</option>
                    <option value="semibold">Semi-Bold (600)</option>
                    <option value="bold">Bold (700)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-[#8e877e] uppercase mb-1">Letter Spacing</label>
                  <select
                    value={activeTypo.letterSpacing || 'normal'}
                    onChange={(e) => handleTypographyChange('letterSpacing', e.target.value)}
                    className="w-full bg-[#09090d] border border-[#242430] px-2.5 py-1.5 text-xs text-[#f7f4ee] focus:border-[#c59b63] focus:outline-none cursor-pointer"
                  >
                    <option value="tight">Tight (-0.025em)</option>
                    <option value="normal">Normal (0em)</option>
                    <option value="wide">Wide (0.05em)</option>
                    <option value="widest">Widest (0.15em)</option>
                    <option value="monumental">Monumental (0.25em)</option>
                  </select>
                </div>
              </div>

              {/* Toggle Switches */}
              <div className="space-y-2 pt-2 border-t border-[#1f1f2a]">
                <label className="flex items-center justify-between p-2 bg-[#14141d] border border-[#22222f] cursor-pointer">
                  <span className="font-cinzel text-xs text-[#f7f4ee] uppercase">
                    Uppercase / Small Caps
                  </span>
                  <input
                    type="checkbox"
                    checked={activeTypo.isUppercase || false}
                    onChange={(e) => handleTypographyChange('isUppercase', e.target.checked)}
                    className="accent-[#c59b63]"
                  />
                </label>

                <label className="flex items-center justify-between p-2 bg-[#14141d] border border-[#22222f] cursor-pointer">
                  <span className="font-cinzel text-xs text-[#f7f4ee] uppercase">
                    Editorial Italic Slant
                  </span>
                  <input
                    type="checkbox"
                    checked={activeTypo.isItalic || false}
                    onChange={(e) => handleTypographyChange('isItalic', e.target.checked)}
                    className="accent-[#c59b63]"
                  />
                </label>

                <label className="flex items-center justify-between p-2 bg-[#14141d] border border-[#22222f] cursor-pointer">
                  <span className="font-cinzel text-xs text-[#f7f4ee] uppercase">
                    Editorial Drop Cap (First Letter)
                  </span>
                  <input
                    type="checkbox"
                    checked={activeTypo.dropCap || false}
                    onChange={(e) => handleTypographyChange('dropCap', e.target.checked)}
                    className="accent-[#c59b63]"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
