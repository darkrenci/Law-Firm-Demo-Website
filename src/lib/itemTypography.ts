import type React from 'react';
import type { ItemTypography } from '../types';
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
