import React, { useState } from 'react';
import { ItemTypography } from '../../types';
import { Type, Palette, Eye, RotateCcw } from 'lucide-react';

export interface TypographyFieldConfig {
  key: 'title' | 'desc' | 'body';
  label: string;
  defaultFamily?: 'cormorant' | 'cinzel' | 'sans' | 'playfair' | 'mono';
  defaultSize?: string;
  defaultColor?: string;
}

interface ItemTypographyControlsProps {
  typography?: ItemTypography;
  onChange: (typo: ItemTypography) => void;
  fields?: TypographyFieldConfig[];
  previewTitle?: string;
  previewDesc?: string;
}

const FONT_OPTIONS: { id: 'cormorant' | 'cinzel' | 'sans' | 'playfair' | 'mono'; label: string; previewClass: string }[] = [
  { id: 'cinzel', label: 'Cinzel (Monumental Roman)', previewClass: 'font-cinzel' },
  { id: 'cormorant', label: 'Cormorant Garamond (Editorial Serif)', previewClass: 'font-cormorant' },
  { id: 'sans', label: 'Plus Jakarta Sans (Modern Clean)', previewClass: 'font-sans' },
  { id: 'playfair', label: 'Playfair Display (Luxury Editorial)', previewClass: 'font-playfair' },
  { id: 'mono', label: 'JetBrains Mono (Technical / Case Law)', previewClass: 'font-mono' },
];

const SIZE_OPTIONS: { id: string; label: string }[] = [
  { id: 'xs', label: 'XS (12px)' },
  { id: 'sm', label: 'SM (14px)' },
  { id: 'base', label: 'Base (16px)' },
  { id: 'lg', label: 'LG (18px)' },
  { id: 'xl', label: 'XL (20px)' },
  { id: '2xl', label: '2XL (24px)' },
  { id: '3xl', label: '3XL (30px)' },
  { id: '4xl', label: '4xl (36px)' },
];

const COLOR_PRESETS: { id: 'gold' | 'champagne' | 'ivory' | 'muted' | 'white'; label: string; hex: string }[] = [
  { id: 'ivory', label: 'Ivory Bone', hex: '#f7f4ee' },
  { id: 'gold', label: 'Solid Gold', hex: '#c59b63' },
  { id: 'champagne', label: 'Warm Champagne', hex: '#d4af7a' },
  { id: 'muted', label: 'Muted Slate', hex: '#8e877e' },
  { id: 'white', label: 'Crisp White', hex: '#ffffff' },
];

export const ItemTypographyControls: React.FC<ItemTypographyControlsProps> = ({
  typography = {} as ItemTypography,
  onChange,
  fields = [
    { key: 'title', label: 'Title / Headline', defaultFamily: 'cinzel', defaultSize: 'lg', defaultColor: 'ivory' },
    { key: 'desc', label: 'Short Summary / Card Text', defaultFamily: 'sans', defaultSize: 'xs', defaultColor: 'muted' },
  ],
  previewTitle = 'Corporate Law & Mergers & Acquisitions',
  previewDesc = 'Comprehensive strategic counsel for multi-billion acquisitions, joint ventures, and regulatory compliance.',
}) => {
  const [activeTab, setActiveTab] = useState<'title' | 'desc' | 'body'>(fields[0]?.key || 'title');

  // Get current active field values
  const currentFamily =
    activeTab === 'title'
      ? typography.titleFontFamily
      : activeTab === 'desc'
      ? typography.descFontFamily
      : typography.bodyFontFamily;

  const currentSize =
    activeTab === 'title'
      ? typography.titleFontSize
      : activeTab === 'desc'
      ? typography.descFontSize
      : typography.bodyFontSize;

  const currentColor =
    activeTab === 'title'
      ? typography.titleColor
      : activeTab === 'desc'
      ? typography.descColor
      : typography.bodyColor;

  const currentCustomColor =
    activeTab === 'title'
      ? typography.titleCustomColor
      : activeTab === 'desc'
      ? typography.descCustomColor
      : typography.bodyCustomColor;

  const updateField = (updates: Partial<ItemTypography>) => {
    onChange({
      ...typography,
      ...updates,
    });
  };

  const handleFamilyChange = (family: any) => {
    if (activeTab === 'title') updateField({ titleFontFamily: family });
    else if (activeTab === 'desc') updateField({ descFontFamily: family });
    else updateField({ bodyFontFamily: family });
  };

  const handleSizeChange = (size: any) => {
    if (activeTab === 'title') updateField({ titleFontSize: size });
    else if (activeTab === 'desc') updateField({ descFontSize: size });
    else updateField({ bodyFontSize: size });
  };

  const handlePresetColor = (preset: 'gold' | 'champagne' | 'ivory' | 'muted' | 'white') => {
    if (activeTab === 'title') updateField({ titleColor: preset, titleCustomColor: undefined });
    else if (activeTab === 'desc') updateField({ descColor: preset, descCustomColor: undefined });
    else updateField({ bodyColor: preset, bodyCustomColor: undefined });
  };

  const handleCustomColor = (hex: string) => {
    if (activeTab === 'title') updateField({ titleColor: 'custom', titleCustomColor: hex });
    else if (activeTab === 'desc') updateField({ descColor: 'custom', descCustomColor: hex });
    else updateField({ bodyColor: 'custom', bodyCustomColor: hex });
  };

  const handleResetCurrent = () => {
    if (activeTab === 'title') {
      updateField({
        titleFontFamily: undefined,
        titleFontSize: undefined,
        titleColor: undefined,
        titleCustomColor: undefined,
      });
    } else if (activeTab === 'desc') {
      updateField({
        descFontFamily: undefined,
        descFontSize: undefined,
        descColor: undefined,
        descCustomColor: undefined,
      });
    } else {
      updateField({
        bodyFontFamily: undefined,
        bodyFontSize: undefined,
        bodyColor: undefined,
        bodyCustomColor: undefined,
      });
    }
  };

  // Resolve styles for live preview
  const resolvedTitle = resolveItemTypography(typography, 'title', {
    fontFamily: 'font-cinzel',
    fontSize: 'text-base',
    color: 'text-[#f7f4ee]',
  });

  const resolvedDesc = resolveItemTypography(typography, 'desc', {
    fontFamily: 'font-sans',
    fontSize: 'text-xs',
    color: 'text-[#8e877e]',
  });

  return (
    <div className="bg-[#101016] border border-[#232332] p-4 space-y-4 text-left">
      <div className="flex items-center justify-between border-b border-[#1d1d28] pb-2.5">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-[#c59b63]" />
          <span className="font-cinzel text-xs font-semibold uppercase tracking-wider text-[#d4af7a]">
            Custom Typography &amp; Color Styling
          </span>
        </div>
        <button
          type="button"
          onClick={handleResetCurrent}
          className="text-[10px] font-cinzel text-[#8e877e] hover:text-[#f7f4ee] flex items-center gap-1 cursor-pointer transition-colors"
          title="Reset active element styling to standard defaults"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset {fields.find((f) => f.key === activeTab)?.label}</span>
        </button>
      </div>

      {/* Target Element Tabs */}
      <div className="flex items-center gap-1 bg-[#09090e] p-1 border border-[#1f1f2a]">
        {fields.map((field) => (
          <button
            key={field.key}
            type="button"
            onClick={() => setActiveTab(field.key)}
            className={`flex-1 py-1.5 px-3 text-xs font-cinzel uppercase tracking-wider transition-all cursor-pointer text-center ${
              activeTab === field.key
                ? 'bg-[#c59b63] text-[#0b0b0e] font-bold shadow-sm'
                : 'text-[#8e877e] hover:text-[#f7f4ee] hover:bg-[#14141d]'
            }`}
          >
            {field.label}
          </button>
        ))}
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1. Font Family */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-cinzel font-semibold tracking-wider text-[#8e877e] uppercase">
            Font Family
          </label>
          <select
            value={currentFamily || ''}
            onChange={(e) => handleFamilyChange(e.target.value ? (e.target.value as any) : undefined)}
            className="w-full bg-[#09090d] border border-[#232330] focus:border-[#c59b63] px-2.5 py-1.5 text-xs text-[#f7f4ee] focus:outline-none"
          >
            <option value="">Default (Inherited)</option>
            {FONT_OPTIONS.map((f) => (
              <option key={f.id} value={f.id} className="bg-[#121218] text-[#f7f4ee]">
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Font Size */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-cinzel font-semibold tracking-wider text-[#8e877e] uppercase">
            Font Size Scale
          </label>
          <select
            value={currentSize || ''}
            onChange={(e) => handleSizeChange(e.target.value ? (e.target.value as any) : undefined)}
            className="w-full bg-[#09090d] border border-[#232330] focus:border-[#c59b63] px-2.5 py-1.5 text-xs text-[#f7f4ee] focus:outline-none"
          >
            <option value="">Default (Inherited)</option>
            {SIZE_OPTIONS.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#121218] text-[#f7f4ee]">
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Text Color Presets & Custom Hex */}
      <div className="space-y-2 pt-1 border-t border-[#191924]">
        <label className="block text-[10px] font-cinzel font-semibold tracking-wider text-[#8e877e] uppercase">
          Text Color
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {COLOR_PRESETS.map((preset) => {
            const isSelected = currentColor === preset.id && !currentCustomColor;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetColor(preset.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 border text-[11px] font-cinzel uppercase tracking-wider transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#c59b63] bg-[#c59b63]/20 text-[#f4e6d0] shadow-sm font-semibold'
                    : 'border-[#242433] bg-[#0d0d12] text-[#8e877e] hover:border-[#38384d] hover:text-[#f7f4ee]'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full border border-black/40" style={{ backgroundColor: preset.hex }} />
                <span>{preset.label}</span>
              </button>
            );
          })}

          {/* Custom Color Input */}
          <div className="flex items-center gap-1.5 bg-[#0d0d12] border border-[#242433] px-2 py-0.5">
            <input
              type="color"
              value={currentCustomColor || '#c59b63'}
              onChange={(e) => handleCustomColor(e.target.value)}
              className="w-5 h-5 bg-transparent border-0 cursor-pointer p-0"
              title="Pick custom color"
            />
            <input
              type="text"
              value={currentCustomColor || ''}
              onChange={(e) => handleCustomColor(e.target.value)}
              placeholder="Custom Hex (#)"
              className="w-20 bg-transparent text-[11px] font-mono text-[#f7f4ee] focus:outline-none placeholder:text-[#555]"
            />
          </div>
        </div>
      </div>

      {/* Live Preview Box */}
      <div className="bg-[#09090d] border border-[#1e1e2b] p-3.5 space-y-1.5">
        <div className="flex items-center justify-between text-[9px] font-cinzel text-[#8e877e] uppercase tracking-wider mb-1">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-[#c59b63]" />
            <span>Interactive Styling Preview</span>
          </span>
          <span className="font-mono text-[9px] text-[#c59b63]">
            {activeTab.toUpperCase()}: {currentFamily || 'inherit'} / {currentSize || 'default'}
          </span>
        </div>

        <h4
          style={resolvedTitle.customStyle}
          className={`${resolvedTitle.fontClass} ${resolvedTitle.sizeClass} ${resolvedTitle.colorClass} transition-all`}
        >
          {previewTitle}
        </h4>
        <p
          style={resolvedDesc.customStyle}
          className={`${resolvedDesc.fontClass} ${resolvedDesc.sizeClass} ${resolvedDesc.colorClass} leading-relaxed transition-all`}
        >
          {previewDesc}
        </p>
      </div>
    </div>
  );
};

// Helper function to resolve classes and styles
export function resolveItemTypography(
  typo?: ItemTypography,
  part: 'title' | 'desc' | 'body' = 'title',
  defaults: {
    fontFamily: string;
    fontSize: string;
    color: string;
  } = {
    fontFamily: 'font-cinzel',
    fontSize: 'text-base',
    color: 'text-[#f7f4ee]',
  }
) {
  if (!typo) {
    return {
      fontClass: defaults.fontFamily,
      sizeClass: defaults.fontSize,
      colorClass: defaults.color,
      customStyle: {},
    };
  }

  let family = part === 'title' ? typo.titleFontFamily : part === 'desc' ? typo.descFontFamily : typo.bodyFontFamily;
  let size = part === 'title' ? typo.titleFontSize : part === 'desc' ? typo.descFontSize : typo.bodyFontSize;
  let color = part === 'title' ? typo.titleColor : part === 'desc' ? typo.descColor : typo.bodyColor;
  let customColor =
    part === 'title' ? typo.titleCustomColor : part === 'desc' ? typo.descCustomColor : typo.bodyCustomColor;

  // Font family class
  let fontClass = defaults.fontFamily;
  if (family === 'cinzel') fontClass = 'font-cinzel';
  else if (family === 'cormorant') fontClass = 'font-cormorant';
  else if (family === 'sans') fontClass = 'font-sans';
  else if (family === 'playfair') fontClass = 'font-playfair';
  else if (family === 'mono') fontClass = 'font-mono';

  // Font size class
  let sizeClass = defaults.fontSize;
  if (size === 'xs') sizeClass = 'text-xs';
  else if (size === 'sm') sizeClass = 'text-sm';
  else if (size === 'base') sizeClass = 'text-base';
  else if (size === 'lg') sizeClass = 'text-lg';
  else if (size === 'xl') sizeClass = 'text-xl';
  else if (size === '2xl') sizeClass = 'text-2xl';
  else if (size === '3xl') sizeClass = 'text-3xl';
  else if (size === '4xl') sizeClass = 'text-4xl';

  // Text color class & customStyle
  let colorClass = defaults.color;
  let customStyle: React.CSSProperties = {};

  if (color === 'custom' && customColor) {
    colorClass = '';
    customStyle = { color: customColor };
  } else if (color === 'gold') {
    colorClass = 'text-[#c59b63]';
  } else if (color === 'champagne') {
    colorClass = 'text-[#d4af7a]';
  } else if (color === 'ivory') {
    colorClass = 'text-[#f7f4ee]';
  } else if (color === 'muted') {
    colorClass = 'text-[#8e877e]';
  } else if (color === 'white') {
    colorClass = 'text-[#ffffff]';
  }

  return {
    fontClass,
    sizeClass,
    colorClass,
    customStyle,
  };
}
