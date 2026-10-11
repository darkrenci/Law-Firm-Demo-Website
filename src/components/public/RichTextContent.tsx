import React from 'react';
import { sanitizeRichText } from '../../lib/richText';

interface RichTextContentProps {
  value: string;
  className?: string;
  style?: React.CSSProperties;
}

export const RichTextContent: React.FC<RichTextContentProps> = ({ value, className = '', style }) => (
  <div
    style={style}
    className={`${className} [&_a]:text-[#d4af7a] [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-2 [&_blockquote]:border-[#c59b63] [&_blockquote]:pl-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-6`}
    dangerouslySetInnerHTML={{ __html: sanitizeRichText(value) }}
  />
);

