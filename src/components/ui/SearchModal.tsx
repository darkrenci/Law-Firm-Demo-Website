import React, { useState, useMemo } from 'react';
import { Search, X, BookOpen, Users, Briefcase, FileText, HelpCircle, ArrowRight } from 'lucide-react';
import { db } from '../../services/db';
import { Modal } from './Modal';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');

  const attorneys = useMemo(() => db.getAttorneys(false), [isOpen]);
  const practiceAreas = useMemo(() => db.getPracticeAreas(false), [isOpen]);
  const articles = useMemo(() => db.getArticles(false), [isOpen]);
  const news = useMemo(() => db.getNews(false), [isOpen]);
  const faqs = useMemo(() => db.getFAQs(false), [isOpen]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const items: Array<{
      id: string;
      category: 'attorneys' | 'practices' | 'articles' | 'news' | 'faqs';
      title: string;
      subtitle: string;
      path: string;
    }> = [];

    // Attorneys
    attorneys.forEach((a) => {
      if (
        a.fullName.toLowerCase().includes(q) ||
        a.primarySpecialization.toLowerCase().includes(q) ||
        a.professionalTitle.toLowerCase().includes(q)
      ) {
        items.push({
          id: a.id,
          category: 'attorneys',
          title: a.fullName,
          subtitle: `${a.professionalTitle} · ${a.primarySpecialization}`,
          path: `/attorneys/${a.slug}`,
        });
      }
    });

    // Practice Areas
    practiceAreas.forEach((pa) => {
      if (
        pa.title.toLowerCase().includes(q) ||
        pa.shortDescription.toLowerCase().includes(q)
      ) {
        items.push({
          id: pa.id,
          category: 'practices',
          title: pa.title,
          subtitle: pa.shortDescription,
          path: `/practice-areas/${pa.slug}`,
        });
      }
    });

    // Insights Articles
    articles.forEach((art) => {
      if (
        art.title.toLowerCase().includes(q) ||
        art.excerpt.toLowerCase().includes(q) ||
        art.tags.some((t) => t.toLowerCase().includes(q))
      ) {
        items.push({
          id: art.id,
          category: 'articles',
          title: art.title,
          subtitle: `${art.category} · ${art.excerpt.substring(0, 90)}...`,
          path: `/insights/${art.slug}`,
        });
      }
    });

    // News
    news.forEach((n) => {
      if (n.title.toLowerCase().includes(q) || n.excerpt.toLowerCase().includes(q)) {
        items.push({
          id: n.id,
          category: 'news',
          title: n.title,
          subtitle: n.excerpt.substring(0, 90),
          path: `/news/${n.slug}`,
        });
      }
    });

    // FAQs
    faqs.forEach((f) => {
      if (f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)) {
        items.push({
          id: f.id,
          category: 'faqs',
          title: f.question,
          subtitle: f.answer.substring(0, 100),
          path: '/faqs',
        });
      }
    });

    return items;
  }, [query, attorneys, practiceAreas, articles, news, faqs]);

  const handleSelect = (path: string) => {
    onNavigate(path);
    onClose();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'attorneys':
        return <Users className="w-4 h-4 text-[#c59b63]" />;
      case 'practices':
        return <Briefcase className="w-4 h-4 text-[#d4af7a]" />;
      case 'articles':
        return <BookOpen className="w-4 h-4 text-[#e6d5bc]" />;
      case 'news':
        return <FileText className="w-4 h-4 text-[#a8a199]" />;
      case 'faqs':
        return <HelpCircle className="w-4 h-4 text-[#c59b63]" />;
      default:
        return <Search className="w-4 h-4 text-[#c59b63]" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <div className="space-y-4">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#c59b63]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search attorneys, practice areas, legal insights, news, FAQs..."
            autoFocus
            className="w-full bg-[#17171f] border border-[#c59b63]/60 pl-12 pr-10 py-3 text-base text-[#f7f4ee] placeholder:text-[#6e6860] focus:outline-none focus:ring-2 focus:ring-[#c59b63]/40"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a8a199] hover:text-[#f7f4ee] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results / Suggestions */}
        <div className="max-h-[55vh] overflow-y-auto space-y-2 pr-1 divide-y divide-[#20202a]">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-[#8a837a] text-xs font-cinzel tracking-widest uppercase">
              Type keywords above to search across Lalusis &amp; Partners
            </div>
          ) : results.length === 0 ? (
            <div className="py-10 text-center text-[#8a837a]">
              <p className="font-cinzel text-sm text-[#e6d5bc]">No matching records found</p>
              <p className="text-xs text-[#6e6860] mt-1">
                Try searching by attorney name, practice area, or legal topic.
              </p>
            </div>
          ) : (
            results.map((item) => (
              <div
                key={`${item.category}-${item.id}`}
                onClick={() => handleSelect(item.path)}
                className="group flex items-start gap-3.5 p-3 hover:bg-[#1a1a23] cursor-pointer transition-colors"
              >
                <div className="mt-1 p-2 bg-[#121217] border border-[#2a2a35] group-hover:border-[#c59b63]/60 transition-colors">
                  {getCategoryIcon(item.category)}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-cinzel uppercase tracking-wider text-[#c59b63]">
                      {item.category}
                    </span>
                  </div>
                  <h4 className="font-cinzel text-sm font-medium text-[#f7f4ee] group-hover:text-[#f3e5cb] transition-colors truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#a8a199] line-clamp-1 mt-0.5">{item.subtitle}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#6e6860] group-hover:text-[#c59b63] transition-colors self-center flex-shrink-0" />
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="pt-3 border-t border-[#252530] flex items-center justify-between text-[11px] text-[#6e6860]">
          <span>{results.length} result(s)</span>
          <span className="font-mono text-[10px]">ESC to close</span>
        </div>
      </div>
    </Modal>
  );
};
