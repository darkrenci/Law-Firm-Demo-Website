import { NavigationLink } from '../ui/NavigationLink';
import React from 'react';
import { db } from '../../services/db';
import { PracticeArea } from '../../types';
import { Button } from '../ui/Buttons';
import { Scale, ArrowLeft, ArrowRight, CheckCircle2, Shield, Users } from 'lucide-react';
import { resolveItemTypography } from '../../lib/itemTypography';

interface PracticeAreasViewProps {
  slug?: string;
  currentSlug?: string;
  onNavigate: (path: string) => void;
}

// Published practices have dedicated, crawlable detail pages.
const ENABLE_PRACTICE_DETAILS = true;

export const PracticeAreasView: React.FC<PracticeAreasViewProps> = ({ slug, currentSlug, onNavigate }) => {
  const activeSlug = slug || currentSlug;
  const practiceAreas = db.getPracticeAreas(false);

  if (ENABLE_PRACTICE_DETAILS && activeSlug) {
    const area = practiceAreas.find(item => item.slug === activeSlug);
    if (!area) {
      return (
        <div className="py-24 text-center space-y-4">
          <h2 className="font-cinzel text-xl text-[#f4e6d0]">Practice Area Not Found</h2>
          <NavigationLink href={'/practice-areas'} variant="gold-outline" size="sm" onClick={() => onNavigate('/practice-areas')}>
            Return to All Practices
          </NavigationLink>
        </div>
      );
    }
    return <PracticeAreaDetail area={area} onNavigate={onNavigate} />;
  }

  return (
    <div className="bg-[#0d0d11] min-h-screen py-16 sm:py-24 text-left">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h1 className="font-cormorant text-4xl sm:text-6xl font-light text-[#f7f4ee]">
            Chamber Practice Areas
          </h1>
          <p className="text-sm text-[#a8a199] leading-relaxed">
            Our specialized practice groups provide comprehensive institutional counsel, regulatory navigation, and aggressive trial advocacy across the commercial landscape.
          </p>
        </div>

        {/* Practice Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {practiceAreas.map((area) => {
            const titleTypo = resolveItemTypography(area.typography, 'title', {
              fontFamily: 'font-cinzel',
              fontSize: 'text-lg',
              color: 'text-[#f7f4ee]',
            });
            const descTypo = resolveItemTypography(area.typography, 'desc', {
              fontFamily: 'font-sans',
              fontSize: 'text-xs',
              color: 'text-[#a8a199]',
            });

            return (
              <div
                key={area.id}
                
                className={`group bg-[#121217] border border-[#22222d] transition-all duration-300 p-8 flex flex-col justify-between select-text ${
                  ENABLE_PRACTICE_DETAILS ? 'hover:border-[#c59b63]/60 cursor-pointer' : 'cursor-default'
                }`}
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-[#181822] border border-[#2d2d3c] flex items-center justify-center text-[#c59b63] transition-colors">
                    <Scale className="w-6 h-6" />
                  </div>
                  <h3
                    style={titleTypo.customStyle}
                    className={`${titleTypo.fontClass} ${titleTypo.sizeClass} ${titleTypo.colorClass} font-medium`}
                  >
                    <NavigationLink href={`/practice-areas/${area.slug}`} onClick={() => onNavigate(`/practice-areas/${area.slug}`)}>{area.title}</NavigationLink>
                  </h3>
                  <p
                    style={descTypo.customStyle}
                    className={`${descTypo.fontClass} ${descTypo.sizeClass} ${descTypo.colorClass} leading-relaxed line-clamp-3`}
                  >
                    {area.shortDescription}
                  </p>
                </div>

                {/* Explore Scope action link - hidden for now per user request, preserved to re-enable later */}
                {ENABLE_PRACTICE_DETAILS && (
                  <div className="pt-6 mt-6 border-t border-[#1d1d26] flex items-center justify-between text-xs text-[#c59b63]">
                    <span className="font-cinzel text-[10px] tracking-wider uppercase">
                      Explore Scope
                    </span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const PracticeAreaDetail: React.FC<{
  area: PracticeArea;
  onNavigate: (path: string) => void;
}> = ({ area, onNavigate }) => {
  const attorneys = db.getAttorneys(false);
  const relevantAttorneys = attorneys.filter(
    (a) =>
      area.relatedAttorneyIds?.includes(a.id) || a.practiceAreaIds?.includes(area.id) ||
      a.primarySpecialization.toLowerCase().includes(area.title.toLowerCase())
  );

  const titleTypo = resolveItemTypography(area.typography, 'title', {
    fontFamily: 'font-cormorant',
    fontSize: 'text-4xl sm:text-6xl',
    color: 'text-[#f7f4ee]',
  });
  const descTypo = resolveItemTypography(area.typography, 'desc', {
    fontFamily: 'font-sans',
    fontSize: 'text-base',
    color: 'text-[#b8b0a5]',
  });
  const bodyTypo = resolveItemTypography(area.typography, 'body', {
    fontFamily: 'font-sans',
    fontSize: 'text-sm',
    color: 'text-[#c8c0b4]',
  });

  return (
    <div className="bg-[#0d0d11] min-h-screen py-12 sm:py-20 text-left">
      <div className="max-w-6xl mx-auto px-6 lg:px-12 space-y-12">
        {/* Back link */}
        <NavigationLink href={'/practice-areas'}
          onClick={() => onNavigate('/practice-areas')}
          className="inline-flex items-center gap-2 text-xs font-cinzel uppercase tracking-wider text-[#c59b63] hover:text-[#f7f4ee] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Practice Disciplines</span>
        </NavigationLink>

        {/* Hero Banner for Practice */}
        <div className="bg-[#121217] border border-[#262633] p-8 sm:p-12 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#191922] border border-[#c59b63]/40 flex items-center justify-center text-[#c59b63]">
              <Scale className="w-5 h-5" />
            </div>
            <span className="font-cinzel text-xs font-semibold tracking-[0.2em] text-[#c59b63] uppercase">
              Legal Services in Quezon City
            </span>
          </div>

          <h1
            style={titleTypo.customStyle}
            className={`${titleTypo.fontClass} ${titleTypo.sizeClass} ${titleTypo.colorClass} font-light`}
          >
            {area.title}
          </h1>

          <p
            style={descTypo.customStyle}
            className={`${descTypo.fontClass} ${descTypo.sizeClass} ${descTypo.colorClass} max-w-3xl leading-relaxed`}
          >
            {area.shortDescription}
          </p>

          <div className="pt-2">
            <NavigationLink href={'/consultation'}
              variant="primary"
              size="md"
              onClick={() => onNavigate('/consultation')}
            >
              Request a Consultation
            </NavigationLink>
          </div>
        </div>

        {/* Deep Overview and Scope */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-[#121217] border border-[#22222d] p-8 space-y-6">
              <h2 className="font-cinzel text-base font-semibold tracking-[0.16em] text-[#f4e6d0] uppercase border-b border-[#22222d] pb-3">
                Practice Scope &amp; Legal Framework
              </h2>
              <div
                style={bodyTypo.customStyle}
                className={`${bodyTypo.fontClass} ${bodyTypo.sizeClass} ${bodyTypo.colorClass} space-y-4 leading-relaxed`}
              >
                <PracticeCopy text={area.detailedDescription || area.fullDescription || area.shortDescription} />
              </div>
            </div>

            <section className="bg-[#121217] border border-[#22222d] p-6 sm:p-8 space-y-4">
              <h2 className="font-cormorant text-2xl">Discuss your {area.title.toLowerCase()} matter</h2>
              <p className="text-sm text-[#c8c0b4] leading-relaxed">Contact our Quezon City office with a brief summary of your matter, the parties involved, and any known dates or deadlines. The initial inquiry helps the firm assess the appropriate next steps.</p>
              <p className="text-sm text-[#c8c0b4] leading-relaxed">Prepare a timeline and a list of relevant documents for discussion. Please avoid sending confidential documents through the initial inquiry form until the firm confirms how to share them.</p>
              <NavigationLink href="/contact" onClick={() => onNavigate('/contact')} className="inline-block text-[#c59b63] underline">Office location and contact details</NavigationLink>
            </section>

            {area.faqs && area.faqs.length > 0 && (
              <section className="bg-[#121217] border border-[#22222d] p-6 sm:p-8 space-y-5">
                <h2 className="font-cormorant text-2xl">Questions about {area.title.toLowerCase()}</h2>
                {area.faqs.map((faq, index) => <div key={index} className="space-y-2"><h3 className="text-sm font-semibold text-[#f4e6d0]">{faq.question}</h3><PracticeCopy text={faq.answer} /></div>)}
              </section>
            )}
            {/* Core Services Breakdown */}
            {area.keyServices && area.keyServices.length > 0 && (
              <div className="bg-[#121217] border border-[#22222d] p-8 space-y-6">
                <h3 className="font-cinzel text-base font-semibold tracking-[0.16em] text-[#f4e6d0] uppercase border-b border-[#22222d] pb-3">
                  Scope of Advisory &amp; Representation
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {area.keyServices.map((srv, i) => (
                    <div
                      key={i}
                      className="bg-[#17171f] border border-[#252533] p-4 flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#c59b63] flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-[#ded6c9] leading-relaxed">{srv}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: Group Leaders */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#121217] border border-[#22222d] p-6 space-y-5">
              <h4 className="font-cinzel text-xs font-semibold tracking-[0.2em] text-[#f4e6d0] uppercase border-b border-[#22222d] pb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#c59b63]" />
                <span>Group Counsel</span>
              </h4>

              {relevantAttorneys.length > 0 ? (
                <div className="space-y-4">
                  {relevantAttorneys.map((atty) => (
                    <NavigationLink href={`/attorneys/${atty.slug}`}
                      key={atty.id}
                      onClick={() => onNavigate(`/attorneys/${atty.slug}`)}
                      className="group flex items-center gap-3 p-2 bg-[#17171e] border border-[#252533] hover:border-[#c59b63]/50 cursor-pointer transition-colors"
                    >
                      <img
                        src={atty.partnerPageImageUrl || atty.portraitUrl}
                        alt={atty.fullName}
                        className="w-12 h-14 object-cover object-top border border-[#2e2e3d]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <span className="font-cinzel text-[9px] text-[#c59b63] uppercase tracking-wider block">
                          {(atty.professionalTitle || '').replace(/^[-–—]\s*/, '').trim()}
                        </span>
                        <h5 className="font-cormorant text-base text-[#f7f4ee] group-hover:text-[#f4e6d0] truncate">
                          {atty.fullName}
                        </h5>
                        <p className="text-[10px] text-[#8e877e] truncate">
                          {atty.primarySpecialization}
                        </p>
                      </div>
                    </NavigationLink>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#8e877e]">
                  Practitioners available for immediate consultation across this group.
                </p>
              )}

              <div className="pt-2">
                <NavigationLink href={'/consultation'}
                  variant="gold-outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onNavigate('/consultation')}
                >
                  Request Group Review
                </NavigationLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Render the CMS's basic text formatting without injecting HTML.
function PracticeCopy({ text }: { text: string }) {
  const inline = (line: string) => line.split(/(\*\*[^*]+\*\*)/g).map((part, i) => part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part);
  return <>{text.split(/\n\s*\n/).filter(Boolean).map((block, i) => {
    const lines = block.split('\n');
    if (lines.every(line => /^[-*] /.test(line))) return <ul key={i} className="list-disc pl-5 space-y-2">{lines.map((line, j) => <li key={j}>{inline(line.slice(2))}</li>)}</ul>;
    return <div key={i} className="space-y-2 text-sm leading-relaxed text-[#c8c0b4]">{lines.map((line, j) => /^#{1,6} /.test(line) ? <h3 key={j} className="text-base font-semibold text-[#f4e6d0]">{inline(line.replace(/^#{1,6} /, ''))}</h3> : <p key={j}>{inline(line)}</p>)}</div>;
  })}</>;
}
