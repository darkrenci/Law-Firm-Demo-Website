import React from 'react';
import { db } from '../../services/db';
import { NewsItem } from '../../types';
import { Button } from '../ui/Buttons';
import { Calendar, Tag, ArrowLeft, ArrowRight, Award, Bell } from 'lucide-react';
import { resolveItemTypography } from '../admin/ItemTypographyControls';

interface NewsViewProps {
  slug?: string;
  onNavigate: (path: string) => void;
}

export const NewsView: React.FC<NewsViewProps> = ({ slug, onNavigate }) => {
  const newsList = db.getNews(false);

  if (slug) {
    const item = db.getNewsBySlug(slug);
    if (!item) {
      return (
        <div className="py-24 text-center space-y-4">
          <h2 className="font-cinzel text-xl text-[#f4e6d0]">Notice Not Found</h2>
          <Button variant="gold-outline" size="sm" onClick={() => onNavigate('/news')}>
            Return to News &amp; Events
          </Button>
        </div>
      );
    }

    const titleTypo = resolveItemTypography(item.typography, 'title', {
      fontFamily: 'font-cormorant',
      fontSize: 'text-3xl sm:text-5xl',
      color: 'text-[#f7f4ee]',
    });
    const bodyTypo = resolveItemTypography(item.typography, 'body', {
      fontFamily: 'font-sans',
      fontSize: 'text-sm sm:text-base',
      color: 'text-[#cfc7bc]',
    });

    return (
      <div className="bg-[#0d0d11] min-h-screen py-12 sm:py-20 text-left">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <button
            onClick={() => onNavigate('/news')}
            className="inline-flex items-center gap-2 text-xs font-cinzel uppercase tracking-wider text-[#c59b63] hover:text-[#f7f4ee] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Firm Announcements</span>
          </button>

          <header className="border-b border-[#22222d] pb-6 space-y-3">
            <div className="flex items-center gap-2 text-[11px] text-[#c59b63] font-cinzel uppercase tracking-widest">
              <Bell className="w-3.5 h-3.5" />
              <span>{item.category}</span>
            </div>

            <h1
              style={titleTypo.customStyle}
              className={`${titleTypo.fontClass} ${titleTypo.sizeClass} ${titleTypo.colorClass} font-light`}
            >
              {item.title}
            </h1>

            <div className="flex items-center gap-2 text-xs text-[#8e877e] pt-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(item.publishedAt).toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
            </div>
          </header>

          <div
            style={bodyTypo.customStyle}
            className={`${bodyTypo.fontClass} ${bodyTypo.sizeClass} ${bodyTypo.colorClass} leading-relaxed space-y-6`}
          >
            {item.content.split('\n\n').map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          <div className="pt-8 border-t border-[#22222d]">
            <Button variant="gold-outline" size="sm" onClick={() => onNavigate('/news')}>
              Back to All Announcements
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0d0d11] min-h-screen py-16 sm:py-24 text-left">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="font-cinzel text-xs font-semibold tracking-[0.25em] text-[#c59b63] uppercase">
            Dispatches &amp; Accolades
          </span>
          <h1 className="font-cormorant text-4xl sm:text-6xl font-light text-[#f7f4ee]">
            Firm News &amp; Recognitions
          </h1>
          <p className="text-sm text-[#a8a199] leading-relaxed">
            Institutional developments, partner appointments, judicial commendations, and key chamber briefings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {newsList.map((item) => {
            const cardTitleTypo = resolveItemTypography(item.typography, 'title', {
              fontFamily: 'font-cormorant',
              fontSize: 'text-2xl',
              color: 'text-[#f7f4ee]',
            });
            const cardDescTypo = resolveItemTypography(item.typography, 'desc', {
              fontFamily: 'font-sans',
              fontSize: 'text-xs',
              color: 'text-[#a8a199]',
            });

            return (
              <div
                key={item.id}
                onClick={() => onNavigate(`/news/${item.slug}`)}
                className="group bg-[#121217] border border-[#22222d] hover:border-[#c59b63]/60 transition-all duration-300 p-7 flex flex-col justify-between cursor-pointer"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[11px] text-[#8e877e]">
                    <span className="font-cinzel uppercase tracking-wider text-[#c59b63]">
                      {item.category}
                    </span>
                    <span>{new Date(item.publishedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                  </div>

                  <h3
                    style={cardTitleTypo.customStyle}
                    className={`${cardTitleTypo.fontClass} ${cardTitleTypo.sizeClass} ${cardTitleTypo.colorClass} font-light group-hover:text-[#f4e6d0] leading-snug`}
                  >
                    {item.title}
                  </h3>

                  <p
                    style={cardDescTypo.customStyle}
                    className={`${cardDescTypo.fontClass} ${cardDescTypo.sizeClass} ${cardDescTypo.colorClass} leading-relaxed line-clamp-3`}
                  >
                    {item.excerpt}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#1d1d26] flex items-center justify-between text-xs text-[#c59b63]">
                  <span className="font-cinzel text-[10px] uppercase tracking-wider">
                    Read Notice
                  </span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
