import React, { useState } from 'react';
import { db } from '../../services/db';
import { FAQItem, FAQCategory } from '../../types';
import { Button } from '../ui/Buttons';
import { Search, ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';
import { resolveItemTypography } from '../admin/ItemTypographyControls';

interface FAQsViewProps {
  onNavigate: (path: string) => void;
}

export const FAQsView: React.FC<FAQsViewProps> = ({ onNavigate }) => {
  const categories = db.getFAQCategories();
  const allFaqs = db.getFAQs(false);

  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openFaqId, setOpenFaqId] = useState<string | null>(allFaqs[0]?.id || null);

  const filtered = allFaqs.filter((faq) => {
    const matchesCat = selectedCatId === 'all' || faq.categoryId === selectedCatId;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="bg-[#0d0d11] min-h-screen py-16 sm:py-24 text-left">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 space-y-14">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="font-cinzel text-xs font-semibold tracking-[0.25em] text-[#c59b63] uppercase">
            Clarity &amp; Retainer Protocols
          </span>
          <h1 className="font-cormorant text-4xl sm:text-6xl font-light text-[#f7f4ee]">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-[#a8a199] leading-relaxed">
            Essential information regarding conflict-checking clearance, retainer engagement frameworks, confidentiality protections, and fee billing structures.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a837a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs by question or keyword..."
            className="w-full bg-[#14141a] border border-[#2a2a35] focus:border-[#c59b63] pl-11 pr-4 py-3 text-sm text-[#f7f4ee] placeholder:text-[#6e6860] focus:outline-none"
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-center gap-2 flex-wrap border-b border-[#1c1c24] pb-4">
          <button
            onClick={() => setSelectedCatId('all')}
            className={`font-cinzel text-xs uppercase tracking-wider px-4 py-2 transition-all cursor-pointer ${
              selectedCatId === 'all'
                ? 'bg-[#c59b63] text-[#0d0d11] font-semibold'
                : 'text-[#a8a199] hover:text-[#f7f4ee] hover:bg-[#181820]'
            }`}
          >
            All Questions ({allFaqs.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              className={`font-cinzel text-xs uppercase tracking-wider px-4 py-2 transition-all cursor-pointer ${
                selectedCatId === cat.id
                  ? 'bg-[#c59b63] text-[#0d0d11] font-semibold'
                  : 'text-[#a8a199] hover:text-[#f7f4ee] hover:bg-[#181820]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* FAQs Accordion */}
        <div className="divide-y divide-[#22222d] border-y border-[#22222d]">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[#8e877e]">
              <p className="font-cinzel text-sm text-[#ded6c9]">No matching questions found</p>
              <p className="text-xs text-[#6e6860] mt-1">
                Try a different keyword or contact our chambers directly.
              </p>
            </div>
          ) : (
            filtered.map((faq) => {
              const isOpen = openFaqId === faq.id;
              const questionTypo = resolveItemTypography(faq.typography, 'title', {
                fontFamily: 'font-cinzel',
                fontSize: 'text-sm sm:text-base',
                color: 'text-[#f7f4ee]',
              });
              const answerTypo = resolveItemTypography(faq.typography, 'desc', {
                fontFamily: 'font-sans',
                fontSize: 'text-xs sm:text-sm',
                color: 'text-[#b8b0a5]',
              });

              return (
                <div key={faq.id} className="py-6">
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full flex items-start justify-between text-left group cursor-pointer gap-4"
                  >
                    <span
                      style={questionTypo.customStyle}
                      className={`${questionTypo.fontClass} ${questionTypo.sizeClass} ${questionTypo.colorClass} font-medium group-hover:text-[#c59b63] transition-colors`}
                    >
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#c59b63] transform transition-transform duration-200 mt-1 flex-shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div
                      style={answerTypo.customStyle}
                      className={`pt-4 leading-relaxed pr-8 animate-fadeIn ${answerTypo.fontClass} ${answerTypo.sizeClass} ${answerTypo.colorClass}`}
                    >
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Still Have Questions Box */}
        <div className="bg-[#121217] border border-[#262633] p-8 sm:p-10 text-center space-y-4">
          <div className="w-10 h-10 rounded-full bg-[#191922] border border-[#c59b63]/50 mx-auto flex items-center justify-center text-[#c59b63]">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h3 className="font-cormorant text-2xl text-[#f7f4ee]">
            Have an Unanswered Question or Complex Matter?
          </h3>
          <p className="text-xs text-[#a8a199] max-w-md mx-auto leading-relaxed">
            Our Managing Partner and practice group chairs are available for confidential consultations.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Button variant="primary" size="md" onClick={() => onNavigate('/consultation')}>
              Request Consultation
            </Button>
            <Button variant="gold-outline" size="md" onClick={() => onNavigate('/contact')}>
              Direct Contact
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
