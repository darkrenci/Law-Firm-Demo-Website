import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { NewsItem } from '../../types';
import { Bell, ArrowRight, X, Calendar, ChevronRight, Shield } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';

interface AnnouncementBannerProps {
  onNavigate: (path: string) => void;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ onNavigate }) => {
  const [announcement, setAnnouncement] = useState<NewsItem | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const checkNews = () => {
      const allNews = db.getNews(false);
      // Prefer category 'announcement' or latest published item
      const activeAnnouncement =
        allNews.find((n) => n.category === 'announcement') ||
        allNews[0] ||
        null;
      setAnnouncement(activeAnnouncement);
    };

    checkNews();
    const unsub = db.subscribe(checkNews);
    return unsub;
  }, []);

  if (!announcement || isDismissed) {
    return null;
  }

  return (
    <>
      {/* Top Banner Bar */}
      <div className="w-full bg-[#100f14] border-b border-[#c59b63]/30 text-[#f7f4ee] py-2.5 px-4 sm:px-8 relative z-30 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-6 text-center sm:text-left">
          {/* Left badge & headline */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#c59b63] text-[#0d0d11] font-cinzel text-[10px] font-bold tracking-widest uppercase flex-shrink-0">
              <Bell className="w-3 h-3 fill-current" />
              <span>Announcement</span>
            </span>

            <p className="text-xs sm:text-sm text-[#ded6c9] font-medium truncate max-w-xl">
              {announcement.title}
            </p>

            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono text-[#8a837a]">
              · {new Date(announcement.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-cinzel text-[#d4af7a] hover:text-[#f7f4ee] uppercase tracking-wider font-semibold group cursor-pointer"
            >
              <span>Read Dispatch</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-[#6e6860] hover:text-[#f7f4ee] transition-colors cursor-pointer"
              title="Dismiss announcement"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Full Announcement Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Official Chamber Dispatch"
          subtitle={`Published on ${new Date(announcement.date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })} · Office of the Managing Partners`}
          maxWidth="2xl"
        >
          <div className="space-y-6 pt-2 text-left">
            {announcement.featuredImage && (
              <div className="border border-[#c59b63]/40 p-1 bg-[#111116]">
                <img
                  src={announcement.featuredImage}
                  alt={announcement.title}
                  className="w-full h-56 sm:h-72 object-cover"
                />
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#c59b63]/20 text-[#d4af7a] border border-[#c59b63]/50 font-cinzel text-[10px] uppercase font-bold tracking-widest">
                  {announcement.category}
                </span>
                <span className="text-[11px] font-mono text-[#8e877e]">
                  REF: LP-DISPATCH-{announcement.id.toUpperCase()}
                </span>
              </div>

              <h2 className="font-cormorant text-2xl sm:text-3xl text-[#f7f4ee] font-normal leading-snug">
                {announcement.title}
              </h2>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#ded6c9] leading-relaxed font-sans border-y border-[#1f1f2a] py-5">
              <p className="font-medium text-[#f4e6d0] text-sm sm:text-base italic font-cormorant">
                "{announcement.excerpt}"
              </p>
              <div className="whitespace-pre-line text-[#a8a199] leading-relaxed">
                {announcement.content}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[#6e6860] font-mono">
                Lalusis &amp; Partners · Attorneys at Law
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    onNavigate('/news');
                  }}
                  className="px-3 py-1.5 text-xs font-cinzel text-[#c59b63] hover:text-[#f4e6d0] uppercase tracking-wider cursor-pointer"
                >
                  View All News &rarr;
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 bg-[#c59b63] text-[#0d0d11] font-cinzel text-xs font-bold uppercase tracking-wider hover:bg-[#d4af7a] cursor-pointer"
                >
                  Close Dispatch
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
