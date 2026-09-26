import React, { useState } from 'react';
import { db } from '../../services/db';
import { Attorney } from '../../types';
import { Button } from '../ui/Buttons';
import {
  Mail,
  Phone,
  GraduationCap,
  Scale,
  Award,
  BookOpen,
  ArrowLeft,
  Search,
  ChevronRight,
} from 'lucide-react';
import { resolveItemTypography } from '../admin/ItemTypographyControls';

export const getPartnerOfficialPortrait = (fullName?: string, slug?: string, id?: string) => {
  const s = `${fullName || ''} ${slug || ''} ${id || ''}`.toLowerCase();
  if (s.includes('levy')) return '/assets/atty-levy-lalusis.svg';
  if (s.includes('diosdado')) return '/assets/atty-diosdado-lalusis.svg';
  if (s.includes('leo')) return '/assets/atty-leo-lalusis.svg';
  return '/assets/attorney-placeholder.svg';
};

interface AttorneysViewProps {
  slug?: string;
  currentSlug?: string;
  onNavigate: (path: string) => void;
}

export const AttorneysView: React.FC<AttorneysViewProps> = ({ slug, currentSlug, onNavigate }) => {
  const activeSlug = slug || currentSlug;
  const attorneys = db.getAttorneys(false);

  // If a specific attorney slug is passed, render deep profile
  if (activeSlug) {
    const attorney = db.getAttorneyBySlug(activeSlug);
    if (!attorney) {
      return (
        <div className="py-24 text-center space-y-4">
          <h2 className="font-cinzel text-xl text-[#f4e6d0]">Partner Not Found</h2>
          <p className="text-xs text-[#a8a199]">The requested partner profile is not available.</p>
          <Button variant="gold-outline" size="sm" onClick={() => onNavigate('/attorneys')}>
            Return to Partners
          </Button>
        </div>
      );
    }

    return <AttorneyProfileDetail attorney={attorney} onNavigate={onNavigate} />;
  }

  // Otherwise render Directory
  return <AttorneysDirectory attorneys={attorneys} onNavigate={onNavigate} />;
};

const AttorneysDirectory: React.FC<{
  attorneys: Attorney[];
  onNavigate: (path: string) => void;
}> = ({ attorneys, onNavigate }) => {
  const [filterSpec, setFilterSpec] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const specializations = ['All', ...Array.from(new Set(attorneys.map((a) => a.primarySpecialization)))];

  const filtered = attorneys.filter((a) => {
    const matchesSpec = filterSpec === 'All' || a.primarySpecialization === filterSpec;
    const matchesQuery =
      a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.professionalTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.biography.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpec && matchesQuery;
  });

  return (
    <div className="bg-[#0d0d11] min-h-screen py-16 sm:py-24 text-left">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="font-cinzel text-xs font-semibold tracking-[0.25em] text-[#c59b63] uppercase">
            Chamber Partners
          </span>
          <h1 className="font-cormorant text-4xl sm:text-6xl font-light text-[#f7f4ee]">
            Partners
          </h1>
          <p className="text-sm text-[#a8a199] leading-relaxed">
            Our partners represent a select consortium of former judicial clerks, bar examiners, and veteran litigators dedicated to authoritative legal practice.
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12 pb-6 border-b border-[#1c1c24]">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {specializations.map((spec) => (
              <button
                key={spec}
                onClick={() => setFilterSpec(spec)}
                className={`font-cinzel text-xs uppercase tracking-wider px-3.5 py-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  filterSpec === spec
                    ? 'bg-[#c59b63] text-[#0d0d11] font-semibold'
                    : 'text-[#a8a199] hover:text-[#f7f4ee] hover:bg-[#181820]'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a837a]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name..."
              className="w-full bg-[#14141a] border border-[#262633] focus:border-[#c59b63] pl-9 pr-3 py-1.5 text-xs text-[#f7f4ee] focus:outline-none placeholder:text-[#6e6860]"
            />
          </div>
        </div>

        {/* Grid of Attorneys */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((attorney) => {
            const nameTypo = resolveItemTypography(attorney.typography, 'title', {
              fontFamily: 'font-cormorant',
              fontSize: 'text-2xl',
              color: 'text-[#f7f4ee]',
            });
            const titleTypo = resolveItemTypography(attorney.typography, 'desc', {
              fontFamily: 'font-cinzel',
              fontSize: 'text-[10px]',
              color: 'text-[#c59b63]',
            });
            const bioTypo = resolveItemTypography(attorney.typography, 'body', {
              fontFamily: 'font-sans',
              fontSize: 'text-xs',
              color: 'text-[#a8a199]',
            });

            return (
              <div
                key={attorney.id}
                onClick={() => onNavigate(`/attorneys/${attorney.slug}`)}
                className="group bg-[#121217] border border-[#22222d] hover:border-[#c59b63]/60 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[#181820]">
                  <img
                    src={attorney.partnerPageImageUrl || attorney.portraitUrl || getPartnerOfficialPortrait(attorney.fullName, attorney.slug, attorney.id)}
                    alt={attorney.fullName}
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallback = getPartnerOfficialPortrait(attorney.fullName, attorney.slug, attorney.id);
                      if (!target.src.endsWith(fallback)) {
                        target.src = fallback;
                      } else if (!target.src.includes('attorney-placeholder.svg')) {
                        target.src = '/assets/attorney-placeholder.svg';
                      }
                    }}
                    className="w-full h-full object-cover object-top filter brightness-90 group-hover:scale-105 group-hover:brightness-100 transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e13] via-transparent to-transparent opacity-85" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span
                      style={titleTypo.customStyle}
                      className={`${titleTypo.fontClass} ${titleTypo.sizeClass} ${titleTypo.colorClass} tracking-[0.2em] uppercase block`}
                    >
                      {attorney.professionalTitle}
                    </span>
                    <h3
                      style={nameTypo.customStyle}
                      className={`${nameTypo.fontClass} ${nameTypo.sizeClass} ${nameTypo.colorClass} font-light group-hover:text-[#f4e6d0] mt-0.5`}
                    >
                      {attorney.fullName}
                    </h3>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="inline-block text-[10px] font-cinzel tracking-wider uppercase text-[#c59b63] border border-[#c59b63]/30 px-2 py-0.5">
                      {attorney.primarySpecialization}
                    </span>
                    <p
                      style={bioTypo.customStyle}
                      className={`${bioTypo.fontClass} ${bioTypo.sizeClass} ${bioTypo.colorClass} leading-relaxed line-clamp-3 pt-1`}
                    >
                      {attorney.biography}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#1d1d26] flex items-center justify-between text-xs text-[#c59b63]">
                    <span className="text-[11px] text-[#7e776e] font-sans">
                      {attorney.email}
                    </span>
                    <span className="font-cinzel text-[11px] uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                      Profile →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const AttorneyProfileDetail: React.FC<{
  attorney: Attorney;
  onNavigate: (path: string) => void;
}> = ({ attorney, onNavigate }) => {
  const nameTypo = resolveItemTypography(attorney.typography, 'title', {
    fontFamily: 'font-cormorant',
    fontSize: 'text-4xl sm:text-5xl',
    color: 'text-[#f7f4ee]',
  });
  const titleTypo = resolveItemTypography(attorney.typography, 'desc', {
    fontFamily: 'font-cinzel',
    fontSize: 'text-xs',
    color: 'text-[#c59b63]',
  });
  const bioTypo = resolveItemTypography(attorney.typography, 'body', {
    fontFamily: 'font-sans',
    fontSize: 'text-sm',
    color: 'text-[#c8c0b4]',
  });

  return (
    <div className="bg-[#0d0d11] min-h-screen py-12 sm:py-20 text-left">
      <div className="max-w-6xl mx-auto px-6 lg:px-12 space-y-12">
        {/* Back Link */}
        <button
          onClick={() => onNavigate('/attorneys')}
          className="inline-flex items-center gap-2 text-xs font-cinzel uppercase tracking-wider text-[#c59b63] hover:text-[#f7f4ee] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Partners</span>
        </button>

        {/* Profile Card Header */}
        <div className="bg-[#121217] border border-[#252533] p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Portrait Col */}
          <div className="lg:col-span-4 space-y-4">
            <div className="border border-[#c59b63]/40 p-1.5 bg-[#17171e]">
              <img
                src={attorney.partnerPageImageUrl || attorney.portraitUrl || getPartnerOfficialPortrait(attorney.fullName, attorney.slug, attorney.id)}
                alt={attorney.fullName}
                onError={(e) => {
                  const target = e.currentTarget;
                  const fallback = getPartnerOfficialPortrait(attorney.fullName, attorney.slug, attorney.id);
                  if (!target.src.endsWith(fallback)) {
                    target.src = fallback;
                  } else if (!target.src.includes('attorney-placeholder.svg')) {
                    target.src = '/assets/attorney-placeholder.svg';
                  }
                }}
                className="w-full aspect-[3/4] object-cover object-top filter brightness-95"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="bg-[#17171e] border border-[#22222d] p-4 space-y-3 text-xs">
              <div className="flex items-center gap-2.5 text-[#ded6c9]">
                <Mail className="w-4 h-4 text-[#c59b63] flex-shrink-0" />
                <span className="font-mono text-[11px]">{attorney.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#ded6c9]">
                <Phone className="w-4 h-4 text-[#c59b63] flex-shrink-0" />
                <span className="font-mono text-[11px]">{attorney.phone}</span>
              </div>
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={() => onNavigate('/consultation')}
                >
                  Consult With Partner
                </Button>
              </div>
            </div>
          </div>

          {/* Details Col */}
          <div className="lg:col-span-8 space-y-8">
            <div>
              <span
                style={titleTypo.customStyle}
                className={`${titleTypo.fontClass} ${titleTypo.sizeClass} ${titleTypo.colorClass} font-semibold tracking-[0.25em] uppercase block`}
              >
                {attorney.professionalTitle}
              </span>
              <h1
                style={nameTypo.customStyle}
                className={`${nameTypo.fontClass} ${nameTypo.sizeClass} ${nameTypo.colorClass} font-light mt-1`}
              >
                {attorney.fullName}
              </h1>
              <p className="text-sm font-cinzel text-[#d4af7a] mt-2 uppercase tracking-wider">
                Practice Focus: {attorney.primarySpecialization}
              </p>
            </div>

            {/* Biography */}
            <div className="space-y-4 leading-relaxed border-t border-[#22222d] pt-6">
              <h3 className="font-cinzel text-xs font-semibold tracking-[0.2em] text-[#f4e6d0] uppercase">
                Professional Background
              </h3>
              <p
                style={bioTypo.customStyle}
                className={`${bioTypo.fontClass} ${bioTypo.sizeClass} ${bioTypo.colorClass}`}
              >
                {attorney.biography}
              </p>
            </div>

            {/* Admissions */}
            {attorney.barAdmissions && attorney.barAdmissions.length > 0 && (
              <div className="space-y-3 border-t border-[#22222d] pt-6">
                <h3 className="font-cinzel text-xs font-semibold tracking-[0.2em] text-[#f4e6d0] uppercase flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#c59b63]" />
                  <span>Bar Admissions &amp; Licensure</span>
                </h3>
                <ul className="space-y-1.5 pl-6 list-disc text-xs text-[#a8a199]">
                  {attorney.barAdmissions.map((adm, i) => (
                    <li key={i}>{adm}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Education */}
            {attorney.education && attorney.education.length > 0 && (
              <div className="space-y-3 border-t border-[#22222d] pt-6">
                <h3 className="font-cinzel text-xs font-semibold tracking-[0.2em] text-[#f4e6d0] uppercase flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#c59b63]" />
                  <span>Academic Credentials</span>
                </h3>
                <ul className="space-y-1.5 pl-6 list-disc text-xs text-[#a8a199]">
                  {attorney.education.map((edu, i) => (
                    <li key={i}>{edu}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Representative Matters */}
            {attorney.representativeMatters && attorney.representativeMatters.length > 0 && (
              <div className="space-y-3 border-t border-[#22222d] pt-6">
                <h3 className="font-cinzel text-xs font-semibold tracking-[0.2em] text-[#f4e6d0] uppercase flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#c59b63]" />
                  <span>Select Representative Engagements</span>
                </h3>
                <ul className="space-y-2 text-xs text-[#b8b0a5]">
                  {attorney.representativeMatters.map((matter, i) => (
                    <li key={i} className="flex items-start gap-2 bg-[#17171e] p-3 border border-[#22222d]">
                      <span className="text-[#c59b63] font-serif text-sm">§</span>
                      <span>{matter}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
