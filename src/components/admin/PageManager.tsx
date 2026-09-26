import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../services/db';
import { Page, PageSection, SectionType } from '../../types';
import { Button } from '../ui/Buttons';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';
import { SectionRenderer } from '../public/SectionRenderer';
import { BlockInspector } from './builder/BlockInspector';
import { BlockCatalogModal, BLOCK_CATALOG } from './builder/BlockCatalogModal';
import {
  FileText,
  Plus,
  Trash2,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  History,
  RotateCcw,
  Check,
  Globe,
  Settings as SettingsIcon,
  Layers,
  ChevronRight,
  ExternalLink,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  Minimize2,
  Layout,
  RefreshCw,
  Lock,
} from 'lucide-react';

interface PageManagerProps {
  onPreviewPage: (slug: string) => void;
  initialPageSlug?: string;
}

export const PageManager: React.FC<PageManagerProps> = ({ onPreviewPage, initialPageSlug }) => {
  const toast = useToast();
  const [pages, setPages] = useState<Page[]>(db.getPages());
  const [selectedPageId, setSelectedPageId] = useState<string>('page-home');
  
  // Local working copy for real-time live preview while editing
  const [workingPage, setWorkingPage] = useState<Page>(() => {
    const all = db.getPages();
    if (initialPageSlug) {
      const initFound = all.find(
        (p) =>
          p.slug === initialPageSlug ||
          p.slug === `/${initialPageSlug}` ||
          p.id === initialPageSlug ||
          p.id === `page-${initialPageSlug}`
      );
      if (initFound) return JSON.parse(JSON.stringify(initFound));
    }
    const p = all.find((item) => item.id === 'page-home') || all[0];
    return JSON.parse(JSON.stringify(p || { sections: [] }));
  });

  useEffect(() => {
    if (initialPageSlug) {
      const found = pages.find(
        (p) =>
          p.slug === initialPageSlug ||
          p.slug === `/${initialPageSlug}` ||
          p.id === initialPageSlug ||
          p.id === `page-${initialPageSlug}`
      );
      if (found && found.id !== selectedPageId) {
        setSelectedPageId(found.id);
        setWorkingPage(JSON.parse(JSON.stringify(found)));
        setSelectedSectionId(found.sections[0]?.id || null);
      }
    }
  }, [initialPageSlug, pages]);

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [activeElementPart, setActiveElementPart] = useState<string | null>('headline');
  const [viewMode, setViewMode] = useState<'visual' | 'outline'>('visual');
  const [viewportDevice, setViewportDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Modals
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [insertAtIndex, setInsertAtIndex] = useState<number | null>(null);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isPageSettingsOpen, setIsPageSettingsOpen] = useState(false);
  const [isCreatePageOpen, setIsCreatePageOpen] = useState(false);

  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Listen to external DB updates if we aren't currently editing unsaved changes
  useEffect(() => {
    const unsub = db.subscribe(() => {
      const allPages = db.getPages();
      setPages(allPages);
      if (!isDirty) {
        const found = allPages.find((p) => p.id === selectedPageId) || allPages[0];
        if (found) {
          setWorkingPage(JSON.parse(JSON.stringify(found)));
        }
      }
    });
    return unsub;
  }, [selectedPageId, isDirty]);

  // Handle switching pages
  const handleSelectPage = (pageId: string) => {
    if (isDirty) {
      if (!confirm('You have unsaved changes on this page. Discard changes and switch page?')) {
        return;
      }
    }
    setSelectedPageId(pageId);
    setSelectedSectionId(null);
    setIsDirty(false);
    const target = pages.find((p) => p.id === pageId) || pages[0];
    if (target) {
      setWorkingPage(JSON.parse(JSON.stringify(target)));
    }
  };

  // Currently selected section object
  const activeSection = workingPage.sections?.find((s) => s.id === selectedSectionId) || null;
  const activeSectionIndex = workingPage.sections?.findIndex((s) => s.id === selectedSectionId) ?? -1;

  // Real-time section update handler
  const handleUpdateSection = (sectionId: string, updates: Partial<PageSection>) => {
    setWorkingPage((prev) => {
      const nextSections = (prev.sections || []).map((sec) => {
        if (sec.id === sectionId) {
          return { ...sec, ...updates };
        }
        return sec;
      });
      return { ...prev, sections: nextSections };
    });
    setIsDirty(true);
  };


  // Duplicate section
  const handleDuplicateSection = (secId: string) => {
    const sections = [...(workingPage.sections || [])];
    const srcIdx = sections.findIndex((s) => s.id === secId);
    if (srcIdx === -1) return;

    const src = sections[srcIdx];
    const cloned: PageSection = {
      ...JSON.parse(JSON.stringify(src)),
      id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `${src.title || src.type} (Cloned)`,
      order: srcIdx + 2,
    };

    sections.splice(srcIdx + 1, 0, cloned);
    sections.forEach((s, i) => {
      s.order = i + 1;
    });

    setWorkingPage((prev) => ({ ...prev, sections }));
    setSelectedSectionId(cloned.id);
    setIsDirty(true);
    toast.success('Section Duplicated', 'Cloned block inserted directly below.');
  };

  // Delete section
  const handleDeleteSection = (secId: string) => {
    if (!confirm('Are you sure you want to remove this section from the page?')) return;
    const sections = (workingPage.sections || []).filter((s) => s.id !== secId);
    sections.forEach((s, i) => {
      s.order = i + 1;
    });

    setWorkingPage((prev) => ({ ...prev, sections }));
    if (selectedSectionId === secId) {
      setSelectedSectionId(null);
    }
    setIsDirty(true);
    toast.info('Section Removed', 'Block deleted from canvas.');
  };

  // Toggle visibility
  const handleToggleVisibility = (secId: string) => {
    const sec = workingPage.sections?.find((s) => s.id === secId);
    if (!sec) return;
    handleUpdateSection(secId, { isVisible: !sec.isVisible });
  };

  // Add new section from Catalog
  const handleInsertSection = (type: SectionType) => {
    const defaultContents: Record<SectionType, any> = {
      hero: {
        headline: 'Corporate Counsel & Strategic Advocacy',
        subheadline: 'Trusted trial representation and high-stakes corporate advisory for discerning institutions.',
        eyebrow: 'Attorneys at Law · Established 2012',
        primaryCtaText: 'Request Consultation',
        primaryCtaLink: '/consultation',
        secondaryCtaText: 'Practice Areas',
        secondaryCtaLink: '/practice-areas',
      },
      heading: {
        eyebrow: 'Chamber Doctrine',
        headline: 'Preeminent Jurisprudential Counsel',
        subheadline: 'Anchored by institutional integrity, analytical rigor, and relentless diligence.',
      },
      richText: {
        body: 'Our advocates combine encyclopedic regulatory mastery with high-stakes courtroom precision. We guide corporations through turbulent legal waters.',
        quote: 'Unwavering commitment to excellence before the bar of justice.',
        quoteAuthor: 'Lalusis & Partners Firm Standard',
      },
      imageText: {
        headline: 'Analytical Precision & Rigorous Due Diligence',
        eyebrow: 'Our Methodology',
        body: 'Every corporate acquisition, arbitration docket, and regulatory audit is handled by senior partners with extensive courtroom track records.',
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
        points: ['Supreme Court Advocacy', 'SEC Compliance Reviews', 'Cross-Border Arbitrations'],
      },
      practiceAreas: {
        eyebrow: 'Disciplines',
        headline: 'Institutional Practice Areas',
        limit: 6,
      },
      attorneys: {
        eyebrow: 'Partners',
        headline: 'Distinguished Partners',
        limit: 4,
      },
      stats: {
        stats: [
          { label: 'Advocacy History', value: '1986', subtitle: 'Quezon City Chambers' },
          { label: 'Deals Advised', value: '₱180B+', subtitle: 'M&A and Transactions' },
          { label: 'Precedents', value: '140+', subtitle: 'Supreme Court Decisions' },
          { label: 'Corporate Clients', value: '350+', subtitle: 'Institutional Retainers' },
        ],
      },
      articles: {
        eyebrow: 'Scholarly Insights',
        headline: 'Legal Insights & Briefings',
        limit: 3,
      },
      news: {
        eyebrow: 'Announcements',
        headline: 'Chamber Dispatches',
        limit: 3,
      },
      faq: {
        eyebrow: 'Retainer Protocol',
        headline: 'Frequently Asked Questions',
        limit: 5,
      },
      testimonials: {
        eyebrow: 'Client Commendations',
        headline: 'Institutional Testimonials',
      },
      cta: {
        eyebrow: 'Engage Our Chamber',
        headline: 'Retain Confirmed Legal Counsel',
        subheadline: 'Conflict-checked representation available for corporate mergers and contentious disputes.',
        primaryCtaText: 'Initiate Inquiry',
        primaryCtaLink: '/consultation',
      },
      consultationForm: {},
      contactInfo: {},
      contactForm: {},
      image: {
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
        caption: 'Future Point Plaza Suites, Quezon City',
      },
      gallery: {
        images: [
          'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
        ],
      },
      awards: {
        eyebrow: 'Distinctions',
        headline: 'Chamber Ratings & Recognitions',
      },
      container: {
        eyebrow: 'Institutional Division',
        headline: 'Corporate Advisory & Transactional Chambers',
        body: 'Providing structured legal counsel for sovereign capital and global enterprises across complex jurisdictions.',
        buttonText: 'Schedule In-Chamber Briefing',
        buttonLink: '/consultation',
        buttonVariant: 'primary',
        maxWidth: 'lg',
        borderStyle: 'gold',
      },
      button: {
        buttonText: 'Request Retainer Consultation',
        buttonLink: '/consultation',
        buttonVariant: 'primary',
        buttonAlign: 'center',
      },
      text: {
        eyebrow: 'Doctrinal Commentary',
        headline: 'On Constitutional Precedent and Fiduciary Duty',
        body: 'The highest calling of an institutional advocate is the zealous and ethical representation of client interests before the bar of justice. We anchor our practice in meticulous doctrinal research and trial preparation.',
      },
      video: {
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        caption: 'Lalusis & Partners — Institutional Retainer & Trial Documentary',
        aspectRatio: '16:9',
      },
      divider: {},
      spacer: {},
    };

    const newSection: PageSection = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Block`,
      isVisible: true,
      background: 'dark',
      paddingY: 'md',
      typography: {
        fontFamily: type === 'heading' ? 'cinzel' : 'cormorant',
        fontSize: 'base',
        alignment: 'left',
        fontWeight: 'normal',
        letterSpacing: 'normal',
        textColor: 'ivory',
      },
      content: defaultContents[type] || {},
      order: 1,
    };

    const sections = [...(workingPage.sections || [])];
    if (insertAtIndex !== null && insertAtIndex >= 0) {
      sections.splice(insertAtIndex + 1, 0, newSection);
    } else {
      sections.push(newSection);
    }

    sections.forEach((s, idx) => {
      s.order = idx + 1;
    });

    setWorkingPage((prev) => ({ ...prev, sections }));
    setSelectedSectionId(newSection.id);
    setIsAddSectionOpen(false);
    setInsertAtIndex(null);
    setIsDirty(true);
    toast.success('Block Inserted', `Added ${newSection.title} to page canvas.`);
  };

  // Save & Publish changes to DB
  const handleSaveAndPublish = () => {
    setIsSaving(true);
    try {
      db.savePage(workingPage, `Updated via Live Visual Builder (${workingPage.sections?.length || 0} sections)`);
      setIsDirty(false);
      setIsSaving(false);
      toast.success('Page Saved & Published', 'All changes are now live on the public website.');
    } catch (err) {
      setIsSaving(false);
      toast.error('Failed to Save Page', 'An unexpected error occurred while persisting page data.');
    }
  };

  // Discard changes
  const handleDiscardChanges = () => {
    if (!confirm('Discard all unsaved changes and reload from database?')) return;
    const original = pages.find((p) => p.id === selectedPageId) || pages[0];
    if (original) {
      setWorkingPage(JSON.parse(JSON.stringify(original)));
    }
    setIsDirty(false);
    toast.info('Changes Discarded', 'Reverted to the last published snapshot.');
  };

  // Scroll to section in preview when selected
  const handleSelectSectionFromCanvas = (secId: string, partId?: string) => {
    setSelectedSectionId(secId);
    setIsSidebarOpen(true);
    if (partId) {
      setActiveElementPart(partId);
    } else if (!activeElementPart) {
      setActiveElementPart('headline');
    }
    if (viewMode === 'outline') {
      setViewMode('visual');
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0b0b0e] text-[#f7f4ee] overflow-hidden select-none">
      {/* 1. TOP GLOBAL BUILDER TOOLBAR */}
      <div className="h-14 border-b border-[#1f1f2a] bg-[#101016] px-4 flex items-center justify-between gap-4 flex-shrink-0 z-20">
        {/* Left: Page Selector & Mode Toggle */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 bg-[#09090d] border border-[#232330] px-3 py-1.5 min-w-[200px] sm:min-w-[240px]">
            <Layers className="w-3.5 h-3.5 text-[#c59b63] flex-shrink-0" />
            <select
              value={selectedPageId}
              onChange={(e) => handleSelectPage(e.target.value)}
              className="bg-transparent text-xs text-[#f7f4ee] font-medium focus:outline-none cursor-pointer w-full truncate"
            >
              {pages.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#121218] text-[#f7f4ee]">
                  {p.title} (/{p.slug || 'home'})
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle: Visual Split vs Outline */}
          <div className="hidden md:flex items-center p-0.5 bg-[#09090d] border border-[#232330]">
            <button
              onClick={() => setViewMode('visual')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-cinzel uppercase tracking-wider transition-colors cursor-pointer ${
                viewMode === 'visual'
                  ? 'bg-[#c59b63] text-[#0d0d11] font-bold shadow-sm'
                  : 'text-[#8e877e] hover:text-[#f7f4ee]'
              }`}
              title="Live Split-Screen Visual Builder (WordPress Style)"
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Live Visual</span>
            </button>
            <button
              onClick={() => setViewMode('outline')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-cinzel uppercase tracking-wider transition-colors cursor-pointer ${
                viewMode === 'outline'
                  ? 'bg-[#c59b63] text-[#0d0d11] font-bold shadow-sm'
                  : 'text-[#8e877e] hover:text-[#f7f4ee]'
              }`}
              title="Structure and Block Hierarchy View"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Structure</span>
            </button>
          </div>

          {/* Toggle Inspector Pane Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono border cursor-pointer transition-colors ${
              isSidebarOpen
                ? 'bg-[#1a1a24] text-[#d4af7a] border-[#c59b63]/50'
                : 'bg-[#0e0e13] text-[#8e877e] hover:text-[#f7f4ee] border-[#232332]'
            }`}
            title={isSidebarOpen ? 'Hide Inspector to view Full Canvas width' : 'Show Inspector & Blocks'}
          >
            {isSidebarOpen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isSidebarOpen ? 'Inspector ON' : 'Full Canvas'}</span>
          </button>

          {/* Layout Fixed / Content Mode Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-[#13131b] border border-[#232332] text-[10px] font-mono text-[#a8a199]" title="Architectural layout and grid structure are locked to preserve firm design standards.">
            <Lock className="w-3 h-3 text-[#c59b63]" />
            <span className="text-[#f7f4ee]">Layout Fixed</span>
            <span className="text-[#6e6860]">·</span>
            <span className="text-[#8e877e]">Content Mode</span>
          </div>

          {/* Page Status indicator */}
          <div className="hidden xl:flex items-center gap-2 text-xs">
            {isDirty ? (
              <span className="flex items-center gap-1.5 text-amber-400 font-mono text-[11px] bg-amber-500/10 border border-amber-500/30 px-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Unsaved Changes
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Published &amp; Synced
              </span>
            )}
          </div>
        </div>

        {/* Center: Device Viewport Controls (when in visual mode) */}
        {viewMode === 'visual' && (
          <div className="hidden sm:flex items-center gap-1 bg-[#09090d] border border-[#232330] p-0.5">
            <button
              onClick={() => setViewportDevice('desktop')}
              className={`p-1.5 transition-colors cursor-pointer ${
                viewportDevice === 'desktop'
                  ? 'bg-[#1e1e28] text-[#c59b63]'
                  : 'text-[#8e877e] hover:text-[#f7f4ee]'
              }`}
              title="Desktop View (100% Fluid)"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewportDevice('tablet')}
              className={`p-1.5 transition-colors cursor-pointer ${
                viewportDevice === 'tablet'
                  ? 'bg-[#1e1e28] text-[#c59b63]'
                  : 'text-[#8e877e] hover:text-[#f7f4ee]'
              }`}
              title="Tablet View (768px Canvas)"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewportDevice('mobile')}
              className={`p-1.5 transition-colors cursor-pointer ${
                viewportDevice === 'mobile'
                  ? 'bg-[#1e1e28] text-[#c59b63]'
                  : 'text-[#8e877e] hover:text-[#f7f4ee]'
              }`}
              title="Mobile Device (390px iPhone View)"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Right: Actions, Version History, SEO & Save Button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isDirty && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDiscardChanges}
              title="Discard unsaved edits"
              className="hidden lg:flex"
            >
              Discard
            </Button>
          )}

          <Button
            variant="gold-outline"
            size="sm"
            onClick={() => setIsVersionHistoryOpen(true)}
            title="View Page Snapshots & Restore"
            className="hidden md:flex"
          >
            <History className="w-3.5 h-3.5" />
            <span>Versions</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsPageSettingsOpen(true)}
            title="SEO Metadata & Settings"
            className="hidden md:flex"
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>SEO</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPreviewPage(workingPage.slug ? `/${workingPage.slug}` : '/')}
            title="Preview on Public Site"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveAndPublish}
            isLoading={isSaving}
            className="shadow-lg shadow-[#c59b63]/20"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save &amp; Publish</span>
          </Button>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE: SPLIT BUILDER OR OUTLINE */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative min-w-0">
        {/* ============================================================ */}
        {/* LEFT PANE: WORDPRESS / GUTENBERG INSPECTOR & BLOCK OUTLINE   */}
        {/* ============================================================ */}
        <div
          className={`${
            isSidebarOpen ? 'flex' : 'hidden'
          } w-full md:w-80 lg:w-88 xl:w-96 max-md:max-h-[45vh] md:h-full bg-[#0d0d12] border-b md:border-b-0 md:border-r border-[#1f1f2a] flex-col flex-shrink-0 z-10 transition-all ${
            viewMode === 'visual' ? '' : 'hidden lg:flex'
          }`}
        >
          {activeSection ? (
            /* Selected Block Inspector */
            <BlockInspector
              section={activeSection}
              index={activeSectionIndex}
              totalSections={(workingPage.sections || []).length}
              onUpdate={(updates) => handleUpdateSection(activeSection.id, updates)}
              onDuplicate={() => handleDuplicateSection(activeSection.id)}
              onDelete={() => handleDeleteSection(activeSection.id)}
              onClose={() => setSelectedSectionId(null)}
              activePart={activeElementPart}
              onSelectPart={setActiveElementPart}
            />
          ) : (
            /* Document Hierarchy / Block List */
            <div className="flex flex-col h-full">
              {/* Document Header */}
              <div className="p-4 border-b border-[#1c1c25] bg-[#101016] flex items-center justify-between">
                <div>
                  <span className="font-cinzel text-xs font-bold text-[#f4e6d0] uppercase block">
                    {workingPage.title}
                  </span>
                  <span className="text-[10px] font-mono text-[#8a837a]">
                    {(workingPage.sections || []).length} Section Blocks
                  </span>
                </div>

                <Button
                  variant="gold-outline"
                  size="sm"
                  onClick={() => {
                    setInsertAtIndex(null);
                    setIsAddSectionOpen(true);
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Block</span>
                </Button>
              </div>

              {/* Scrollable Block List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                <div className="text-[10px] font-cinzel text-[#8e877e] uppercase tracking-wider px-1 pb-1">
                  Click a block to edit its live content:
                </div>

                {(workingPage.sections || []).map((section, idx) => (
                  <div
                    key={section.id}
                    onClick={() => setSelectedSectionId(section.id)}
                    className={`p-3 bg-[#13131a] border transition-all cursor-pointer group flex items-center justify-between gap-3 ${
                      selectedSectionId === section.id
                        ? 'border-[#c59b63] bg-[#1a1a24] shadow-md'
                        : section.isVisible
                        ? 'border-[#1e1e28] hover:border-[#c59b63]/60 hover:bg-[#161620]'
                        : 'border-dashed border-[#22222f] opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-xs font-bold text-[#c59b63] w-4 text-center">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-cinzel text-xs font-semibold text-[#f7f4ee] uppercase truncate group-hover:text-[#c59b63]">
                            {section.title || section.type}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 bg-[#1f1f2b] text-[#a8a199] border border-[#2b2b3b]">
                            {section.type}
                          </span>
                        </div>
                        {section.content?.headline && (
                          <p className="text-[11px] text-[#8e877e] truncate mt-0.5 max-w-[200px]">
                            "{section.content.headline}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleVisibility(section.id);
                        }}
                        className="p-1 text-[#8e877e] hover:text-[#f7f4ee]"
                        title={section.isVisible ? 'Hide section' : 'Show section'}
                      >
                        {section.isVisible ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <ChevronRight className="w-4 h-4 text-[#8e877e]" />
                    </div>
                  </div>
                ))}

                {/* Empty page prompt */}
                {(!workingPage.sections || workingPage.sections.length === 0) && (
                  <div className="p-8 text-center border border-dashed border-[#222230] space-y-3">
                    <p className="text-xs text-[#8e877e]">This page has no content blocks yet.</p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsAddSectionOpen(true)}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Insert First Block</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Inserter Footer */}
              <div className="p-3 border-t border-[#1c1c25] bg-[#101016]">
                <button
                  onClick={() => {
                    setInsertAtIndex(null);
                    setIsAddSectionOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-[#161622] border border-[#2a2a38] hover:border-[#c59b63] text-xs font-cinzel text-[#d4af7a] uppercase tracking-wider transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Browse Component Catalogue</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* RIGHT PANE: REAL-TIME WORDPRESS LIVE OUTPUT CANVAS           */}
        {/* ============================================================ */}
        <div
          ref={previewContainerRef}
          className={`flex-1 min-w-0 overflow-x-hidden overflow-y-auto bg-[#07070a] transition-all relative ${
            viewMode === 'outline' ? 'hidden' : 'flex flex-col items-center'
          }`}
        >
          {/* Canvas Viewport Frame */}
          <div
            className={`w-full min-w-0 transition-all duration-300 min-h-full flex flex-col overflow-x-hidden ${
              viewportDevice === 'desktop'
                ? 'max-w-full'
                : viewportDevice === 'tablet'
                ? 'max-w-[768px] my-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] border-4 border-[#232330] rounded-xl overflow-hidden'
                : 'max-w-[390px] my-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] border-4 border-[#232330] rounded-3xl overflow-hidden'
            }`}
          >
            {/* Tablet/Mobile Device Bezel Header */}
            {viewportDevice !== 'desktop' && (
              <div className="bg-[#15151e] border-b border-[#242432] p-2 flex items-center justify-between text-[11px] font-mono text-[#8a837a] select-none">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#353545]" />
                  <span>{viewportDevice === 'tablet' ? 'iPad Pro 768px' : 'iPhone 390px'}</span>
                </div>
                <span>Live Canvas</span>
              </div>
            )}

            {/* Rendered Live Website Output with WordPress Interactive Overlays */}
            <div className="w-full min-w-0 max-w-full bg-[#0d0d11] text-[#f7f4ee] flex-1 flex flex-col relative overflow-x-hidden">
              {(workingPage.sections || []).map((sec, idx) => {
                const isSelected = selectedSectionId === sec.id;

                return (
                  <div key={sec.id} className="relative group">
                    {/* Visual Hover & Active Selection Border */}
                    <div
                      className={`absolute inset-0 pointer-events-none transition-all z-20 ${
                        isSelected
                          ? 'ring-2 ring-[#c59b63] ring-inset shadow-[0_0_20px_rgba(197,155,99,0.25)]'
                          : 'group-hover:ring-1 group-hover:ring-[#c59b63]/60 group-hover:ring-inset'
                      }`}
                    />

                    {/* WordPress-style Floating Block Action Bar on Hover */}
                    <div
                      className={`absolute top-2 left-3 z-30 transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'opacity-100'
                          : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {/* Block Identification Tag */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectSectionFromCanvas(sec.id);
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-cinzel font-bold uppercase tracking-wider shadow-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#c59b63] text-[#0d0d11]'
                            : 'bg-[#151520] text-[#d4af7a] border border-[#c59b63]/60 hover:bg-[#c59b63] hover:text-[#0d0d11]'
                        }`}
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>
                          {sec.title || sec.type} #{idx + 1}
                        </span>
                      </button>

                      {/* Layout Position Locked Indicator */}
                      <div className="flex items-center px-1.5 py-1 bg-[#151520] border border-[#2b2b3c] shadow-lg text-[10px] font-mono text-[#a8a199] gap-1" title="Layout position is fixed and locked">
                        <Lock className="w-2.5 h-2.5 text-[#c59b63]" />
                        <span className="hidden sm:inline">Position Locked</span>
                      </div>

                      {/* Duplicate */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateSection(sec.id);
                        }}
                        className="p-1.5 bg-[#151520] border border-[#2b2b3c] text-[#8e877e] hover:text-[#f7f4ee] shadow-lg cursor-pointer"
                        title="Duplicate this block"
                      >
                        <Copy className="w-3 h-3" />
                      </button>

                      {/* Visibility Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleVisibility(sec.id);
                        }}
                        className={`p-1.5 bg-[#151520] border border-[#2b2b3c] shadow-lg cursor-pointer ${
                          sec.isVisible ? 'text-emerald-400' : 'text-[#6e6860]'
                        }`}
                        title={sec.isVisible ? 'Hide from public' : 'Show to public'}
                      >
                        {sec.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSection(sec.id);
                        }}
                        className="p-1.5 bg-[#151520] border border-[#2b2b3c] text-rose-400/80 hover:text-rose-400 shadow-lg cursor-pointer"
                        title="Delete Block"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Section Visibility Watermark when Draft/Hidden */}
                    {!sec.isVisible && (
                      <div className="absolute top-2 right-3 z-30 px-2 py-0.5 bg-zinc-900/90 border border-zinc-700 text-zinc-400 text-[10px] font-mono uppercase tracking-wider">
                        Hidden from Public
                      </div>
                    )}

                    {/* The Actual Section Rendered by SectionRenderer */}
                    <div
                      onClick={() => handleSelectSectionFromCanvas(sec.id)}
                      className={`cursor-pointer transition-opacity ${
                        !sec.isVisible ? 'opacity-40 grayscale-[40%]' : ''
                      }`}
                    >
                      <SectionRenderer
                        section={sec}
                        onNavigate={() => {}}
                        isAdmin={true}
                        editMode={selectedSectionId === sec.id}
                        activeElementPart={selectedSectionId === sec.id ? activeElementPart : null}
                        onSelectPart={(part) => {
                          setSelectedSectionId(sec.id);
                          setActiveElementPart(part);
                          if (viewMode === 'outline') {
                            setViewMode('visual');
                          }
                        }}
                      />
                    </div>

                    {/* Gutenberg-style Insert Block Here Divider */}
                    <div className="relative h-6 group/divider flex items-center justify-center -my-3 z-30">
                      <div className="w-full h-[1px] bg-transparent group-hover/divider:bg-[#c59b63]/60 transition-colors" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInsertAtIndex(idx);
                          setIsAddSectionOpen(true);
                        }}
                        className="opacity-0 group-hover/divider:opacity-100 transition-all px-2.5 py-0.5 bg-[#c59b63] text-[#0d0d11] font-cinzel text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1 cursor-pointer scale-90 hover:scale-100"
                        title="Insert block at this position"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Insert Block Here</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Bottom Canvas Append Area */}
              <div className="p-10 border-t border-[#1c1c25] bg-[#0c0c10] text-center space-y-3">
                <p className="text-xs font-cinzel uppercase tracking-[0.2em] text-[#8e877e]">
                  End of Page Structure
                </p>
                <Button
                  variant="gold-outline"
                  size="sm"
                  onClick={() => {
                    setInsertAtIndex(null);
                    setIsAddSectionOpen(true);
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Append New Section Block</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* OUTLINE MODE: DRAG & REORDER OVERVIEW (ALTERNATE VIEW)       */}
        {/* ============================================================ */}
        {viewMode === 'outline' && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-[#1f1f2a] pb-4">
              <div>
                <span className="font-cinzel text-xs text-[#c59b63] uppercase tracking-[0.2em]">
                  Document Hierarchy
                </span>
                <h2 className="font-cormorant text-3xl font-light text-[#f7f4ee] mt-0.5">
                  Page Outline &amp; Sequence
                </h2>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setInsertAtIndex(null);
                  setIsAddSectionOpen(true);
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Block</span>
              </Button>
            </div>

            <div className="space-y-3">
              {(workingPage.sections || []).map((section, index) => (
                <div
                  key={section.id}
                  className={`bg-[#121218] border ${
                    section.isVisible ? 'border-[#222230]' : 'border-dashed border-[#22222e] opacity-60'
                  } hover:border-[#c59b63] p-4 transition-all flex items-center justify-between gap-4`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#161622] border border-[#262638] text-[11px] font-mono text-[#a8a199]" title="Layout position is fixed and locked">
                      <Lock className="w-3 h-3 text-[#c59b63]" />
                      <span className="text-[#c59b63] font-bold">#{index + 1}</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-cinzel text-sm font-semibold text-[#f7f4ee] uppercase">
                          {section.title || section.type}
                        </span>
                        <Badge variant="gold" size="sm">
                          {section.type}
                        </Badge>
                        <span className="text-[10px] text-[#6e6860] font-mono">
                          [{section.background} · {section.paddingY}]
                        </span>
                      </div>
                      {section.content?.headline && (
                        <p className="text-xs text-[#8e877e] truncate max-w-xl mt-1">
                          "{section.content.headline}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleVisibility(section.id)}
                      className={`p-1.5 text-xs transition-colors cursor-pointer ${
                        section.isVisible ? 'text-emerald-400' : 'text-[#6e6860]'
                      }`}
                      title={section.isVisible ? 'Hide Block' : 'Show Block'}
                    >
                      {section.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleDuplicateSection(section.id)}
                      className="p-1.5 text-[#8e877e] hover:text-[#f7f4ee] transition-colors cursor-pointer"
                      title="Duplicate Block"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedSectionId(section.id);
                        setViewMode('visual');
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#1a1a24] border border-[#2a2a35] hover:border-[#c59b63] text-xs text-[#d4af7a] hover:text-[#f7f4ee] font-cinzel uppercase tracking-wider cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Live Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="p-1.5 text-rose-500/70 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete Block"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: BLOCK CATALOG MODAL */}
      <BlockCatalogModal
        isOpen={isAddSectionOpen}
        onClose={() => setIsAddSectionOpen(false)}
        onSelectBlock={handleInsertSection}
        insertPosition={insertAtIndex}
      />

      {/* MODAL: PAGE SETTINGS & SEO */}
      {workingPage && (
        <PageSettingsModal
          isOpen={isPageSettingsOpen}
          page={workingPage}
          onClose={() => setIsPageSettingsOpen(false)}
          onSave={(updates) => {
            setWorkingPage((prev) => ({ ...prev, ...updates }));
            db.savePage({ ...workingPage, ...updates });
            toast.success('Page Settings Saved');
            setIsPageSettingsOpen(false);
          }}
        />
      )}

      {/* MODAL: VERSION HISTORY & RESTORE */}
      {workingPage && (
        <PageVersionHistoryModal
          isOpen={isVersionHistoryOpen}
          pageId={workingPage.id}
          onClose={() => setIsVersionHistoryOpen(false)}
          onRestore={(verId) => {
            db.restorePageVersion(workingPage.id, verId);
            const restored = db.getPageById(workingPage.id);
            if (restored) {
              setWorkingPage(JSON.parse(JSON.stringify(restored)));
            }
            setIsDirty(false);
            toast.success('Version Restored', 'Reverted page sections to prior snapshot.');
            setIsVersionHistoryOpen(false);
          }}
        />
      )}
    </div>
  );
};

// SUB-COMPONENT: PAGE SETTINGS MODAL
const PageSettingsModal: React.FC<{
  isOpen: boolean;
  page: Page;
  onClose: () => void;
  onSave: (updates: Partial<Page>) => void;
}> = ({ isOpen, page, onClose, onSave }) => {
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [isPublished, setIsPublished] = useState(page.isPublished);
  const [metaTitle, setMetaTitle] = useState(page.seo?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(page.seo?.metaDescription || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      slug: slug.trim().replace(/^\//, ''),
      isPublished,
      seo: {
        metaTitle,
        metaDescription,
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Page Configuration &amp; SEO Metadata"
      subtitle="Configure route path, search engine indexing, and publication visibility."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-left">
        <div>
          <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
            Page Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:border-[#c59b63] focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
            URL Route Slug
          </label>
          <input
            type="text"
            value={slug}
            disabled={page.id === 'page-home'}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. corporate-counsel (leave blank for home)"
            className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:border-[#c59b63] focus:outline-none disabled:opacity-50 font-mono"
          />
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-2 text-xs text-[#f7f4ee] cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="accent-[#c59b63]"
            />
            <span>Publish Page Live on Website</span>
          </label>
        </div>

        <div className="border-t border-[#22222d] pt-4 space-y-4">
          <h4 className="font-cinzel text-xs uppercase tracking-wider text-[#c59b63]">
            Search Engine Optimization (SEO)
          </h4>
          <div>
            <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
              Search Meta Title
            </label>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="e.g. Lalusis &amp; Partners | Attorneys at Law"
              className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:border-[#c59b63] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
              Search Meta Description
            </label>
            <textarea
              rows={3}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Brief summary for Google snippets..."
              className="w-full bg-[#0d0d11] border border-[#2a2a35] p-2.5 text-xs text-[#f7f4ee] focus:border-[#c59b63] focus:outline-none leading-relaxed font-sans"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-[#22222d]">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Save Settings
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// SUB-COMPONENT: PAGE VERSION HISTORY MODAL
const PageVersionHistoryModal: React.FC<{
  isOpen: boolean;
  pageId: string;
  onClose: () => void;
  onRestore: (versionId: string) => void;
}> = ({ isOpen, pageId, onClose, onRestore }) => {
  const versions = db.getPageVersions(pageId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Page Version Snapshots"
      subtitle="Review previous snapshots and restore previous layouts with 1 click."
      maxWidth="lg"
    >
      <div className="space-y-3 pt-2 text-left">
        {versions.length === 0 ? (
          <p className="py-8 text-center text-xs text-[#8e877e]">
            No previous version snapshots saved yet for this page.
          </p>
        ) : (
          versions.map((ver) => (
            <div
              key={ver.id}
              className="bg-[#171720] border border-[#22222d] p-4 flex items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-cinzel text-xs font-semibold text-[#f4e6d0]">
                    Version {ver.versionNumber}
                  </span>
                  <span className="text-[10px] text-[#6e6860]">
                    ({ver.sectionsSnapshot.length} Sections)
                  </span>
                </div>
                <p className="text-[11px] text-[#a8a199] mt-0.5">{ver.changeSummary}</p>
                <p className="text-[10px] text-[#6e6860] mt-1 font-mono">
                  Saved by {ver.modifiedBy} · {new Date(ver.timestamp).toLocaleString()}
                </p>
              </div>

              <Button
                variant="gold-outline"
                size="sm"
                onClick={() => onRestore(ver.id)}
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restore</span>
              </Button>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};
