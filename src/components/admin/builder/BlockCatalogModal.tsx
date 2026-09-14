import React, { useState } from 'react';
import { SectionType } from '../../../types';
import { Modal } from '../../ui/Modal';
import { Badge } from '../../ui/Badge';
import {
  Layout,
  Heading,
  AlignLeft,
  Image as ImageIcon,
  Columns,
  Briefcase,
  Users,
  BarChart3,
  PhoneCall,
  FileCheck,
  BookOpen,
  Bell,
  HelpCircle,
  Quote,
  Award,
  Minus,
  Search,
} from 'lucide-react';

interface BlockCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlock: (type: SectionType) => void;
  insertPosition?: number | null;
}

interface BlockDefinition {
  type: SectionType;
  title: string;
  category: 'Structure' | 'Content' | 'Database' | 'Interactive' | 'Media';
  desc: string;
  icon: any;
  recommended?: boolean;
}

export const BLOCK_CATALOG: BlockDefinition[] = [
  {
    type: 'container',
    title: 'Container & Framed Box',
    category: 'Structure',
    desc: 'Encapsulated layout box with customizable background canvas, gold or subtle border, and custom padding.',
    icon: Layout,
    recommended: true,
  },
  {
    type: 'text',
    title: 'Custom Typography & Body Text',
    category: 'Content',
    desc: 'Standalone editorial passage with complete control over font family, size, alignment, drop-cap, and styling.',
    icon: AlignLeft,
    recommended: true,
  },
  {
    type: 'button',
    title: 'Button & Link / URL Action',
    category: 'Interactive',
    desc: 'Standalone or dual action buttons with customizable link URL, gold/outline/dark variants, and alignment.',
    icon: PhoneCall,
  },
  {
    type: 'video',
    title: 'Video & Documentary Embed',
    category: 'Media',
    desc: 'Responsive video player supporting YouTube, Vimeo, or MP4 streams with aspect ratio and caption.',
    icon: ImageIcon,
  },
  {
    type: 'hero',
    title: 'Executive Hero Banner',
    category: 'Structure',
    desc: 'Editorial headline, authentic firm monogram, subhead, and dual call-to-actions.',
    icon: Layout,
    recommended: true,
  },
  {
    type: 'heading',
    title: 'Section Heading Block',
    category: 'Content',
    desc: 'Eyebrow label, serif heading, and descriptive doctrine overview.',
    icon: Heading,
  },
  {
    type: 'richText',
    title: 'Rich Narrative & Quotes',
    category: 'Content',
    desc: 'Multi-paragraph body text, pullquote highlight, and author citation.',
    icon: AlignLeft,
  },
  {
    type: 'imageText',
    title: 'Media & Text Split',
    category: 'Media',
    desc: 'Two-column layout with high-resolution imagery and feature bullet points.',
    icon: Columns,
    recommended: true,
  },
  {
    type: 'practiceAreas',
    title: 'Practice Areas Grid',
    category: 'Database',
    desc: 'Dynamic grid of institutional practice disciplines populated from database.',
    icon: Briefcase,
    recommended: true,
  },
  {
    type: 'attorneys',
    title: 'Attorneys Directory Grid',
    category: 'Database',
    desc: 'Dynamic portrait cards of featured partners, senior associates, and counsel.',
    icon: Users,
    recommended: true,
  },
  {
    type: 'stats',
    title: 'Key Milestones & Stats',
    category: 'Content',
    desc: 'Four-column quantitative track record metrics and institutional timeline.',
    icon: BarChart3,
  },
  {
    type: 'cta',
    title: 'Call-to-Action Banner',
    category: 'Interactive',
    desc: 'High-conversion consultation engagement strip with direct inquiry routing.',
    icon: PhoneCall,
    recommended: true,
  },
  {
    type: 'consultationForm',
    title: 'Direct Retainer Inbound Form',
    category: 'Interactive',
    desc: 'Interactive multi-field inquiry submission for confidential conflict checks.',
    icon: FileCheck,
  },
  {
    type: 'articles',
    title: 'Legal Insights Briefings',
    category: 'Database',
    desc: 'Scholarly jurisprudential publications and regulatory analyses.',
    icon: BookOpen,
  },
  {
    type: 'news',
    title: 'Chamber Dispatches',
    category: 'Database',
    desc: 'Transactional announcements, firm milestones, and bar news.',
    icon: Bell,
  },
  {
    type: 'faq',
    title: 'FAQs & Retainer Protocol',
    category: 'Interactive',
    desc: 'Interactive accordion addressing engagement procedures and billing schedules.',
    icon: HelpCircle,
  },
  {
    type: 'testimonials',
    title: 'Client Commendations',
    category: 'Content',
    desc: 'Institutional testimonials from corporate boards and general counsels.',
    icon: Quote,
  },
  {
    type: 'awards',
    title: 'Chamber Distinctions',
    category: 'Content',
    desc: 'Legal 500, Chambers & Partners, and Supreme Court citations.',
    icon: Award,
  },
  {
    type: 'image',
    title: 'Full-Width Architectural Media',
    category: 'Media',
    desc: 'Expansive photography banner showcasing chambers or institutional landmarks.',
    icon: ImageIcon,
  },
  {
    type: 'divider',
    title: 'Decorative Gold Monogram Divider',
    category: 'Structure',
    desc: 'Elegant ornamental separator with subtle bronze fluting.',
    icon: Minus,
  },
];

export const BlockCatalogModal: React.FC<BlockCatalogModalProps> = ({
  isOpen,
  onClose,
  onSelectBlock,
  insertPosition,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Structure', 'Content', 'Database', 'Media', 'Interactive'];

  const filtered = BLOCK_CATALOG.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.desc.toLowerCase().includes(search.toLowerCase()) ||
      b.type.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Insert Block into Page Canvas"
      subtitle={
        insertPosition !== undefined && insertPosition !== null
          ? `Select a block to insert at position #${insertPosition + 1}.`
          : 'Choose a modular component block to add to this page.'
      }
      maxWidth="2xl"
    >
      <div className="space-y-4 pt-2 text-left">
        {/* Search & Category Tabs */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e877e]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search components (e.g. Hero, Attorneys, CTA, Form)..."
              className="w-full bg-[#0d0d11] border border-[#2a2a35] pl-9 pr-3 py-2 text-xs text-[#f7f4ee] focus:border-[#c59b63] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1.5 text-[10px] font-cinzel uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#c59b63] text-[#0d0d11] font-bold'
                    : 'bg-[#15151c] text-[#8e877e] hover:text-[#f7f4ee] hover:bg-[#1f1f2a]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1">
          {filtered.map((block) => {
            const Icon = block.icon;
            return (
              <div
                key={block.type}
                onClick={() => onSelectBlock(block.type)}
                className="bg-[#15151c] border border-[#22222f] hover:border-[#c59b63] p-4 text-left transition-all cursor-pointer group flex flex-col justify-between hover:bg-[#1a1a24]"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-[#0e0e13] border border-[#252533] text-[#c59b63] group-hover:border-[#c59b63]/60">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-cinzel text-xs font-semibold text-[#f7f4ee] group-hover:text-[#c59b63]">
                        {block.title}
                      </span>
                    </div>
                    {block.recommended && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#c59b63]/20 text-[#d4af7a] border border-[#c59b63]/40 uppercase">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#8e877e] leading-relaxed line-clamp-2">
                    {block.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#1d1d27]">
                  <span className="text-[9px] font-mono uppercase text-[#6e6860]">
                    {block.category}
                  </span>
                  <span className="text-[10px] font-cinzel text-[#c59b63] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-semibold">
                    + Insert Block
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
