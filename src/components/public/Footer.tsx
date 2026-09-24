import React, { useState, useEffect } from 'react';
import { Logo } from '../brand/Logo';
import { db } from '../../services/db';
import { FirmSettings, PracticeArea } from '../../types';
import { MapPin, Phone, Mail, Clock, Shield, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAdmin }) => {
  const [settings, setSettings] = useState<FirmSettings>(db.getSettings());
  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>(
    db.getPracticeAreas(false).slice(0, 6)
  );

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setSettings(db.getSettings());
      setPracticeAreas(db.getPracticeAreas(false).slice(0, 6));
    });
    return unsub;
  }, []);

  return (
    <footer className="bg-[#070709] border-t border-[#1c1c24] text-[#a8a199] relative">
      {/* Decorative top gold line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#c59b63]/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Col 1: Brand & Identity (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div onClick={() => onNavigate('/')} className="cursor-pointer">
              <Logo variant="horizontal" />
            </div>
            <p className="text-xs sm:text-sm text-[#8e877e] leading-relaxed font-sans pr-4">
              Lalusis &amp; Partners is an institutional Philippine law firm dedicated to high-consequence corporate counseling, complex commercial dispute resolution, and supreme appellate advocacy.
            </p>
            <div className="pt-2">
              <span className="font-cinzel text-[11px] tracking-[0.2em] text-[#c59b63] uppercase block">
                Established {settings.general.establishedYear} · Makati City
              </span>
              <p className="text-xs text-[#6e6860] mt-1 font-mono">
                Republic of the Philippines
              </p>
            </div>
          </div>

          {/* Col 2: Practice Areas (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-cinzel text-xs font-semibold tracking-[0.2em] text-[#f4e6d0] uppercase border-b border-[#1c1c24] pb-2">
              Practice Areas
            </h4>
            <ul className="space-y-2.5 text-xs">
              {practiceAreas.map((pa) => (
                <li key={pa.id}>
                  <button
                    onClick={() => onNavigate(`/practice-areas/${pa.slug}`)}
                    className="hover:text-[#c59b63] transition-colors text-left block"
                  >
                    {pa.title}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => onNavigate('/practice-areas')}
                  className="text-[#c59b63] hover:text-[#f7f4ee] transition-colors font-cinzel text-[11px] uppercase tracking-wider pt-1 inline-flex items-center gap-1"
                >
                  <span>All Practice Areas</span>
                  <span>→</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Links & Firm Resources (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-cinzel text-xs font-semibold tracking-[0.2em] text-[#f4e6d0] uppercase border-b border-[#1c1c24] pb-2">
              The Firm
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/about')}
                  className="hover:text-[#c59b63] transition-colors"
                >
                  About Lalusis
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/attorneys')}
                  className="hover:text-[#c59b63] transition-colors"
                >
                  Partners
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/contact')}
                  className="hover:text-[#c59b63] transition-colors"
                >
                  Contact &amp; Chambers
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/consultation')}
                  className="hover:text-[#c59b63] transition-colors"
                >
                  Request Consultation
                </button>
              </li>
              {/* Commented out / hidden per user request (can be uncommented to restore):
              <li>
                <button
                  onClick={() => onNavigate('/insights')}
                  className="hover:text-[#c59b63] transition-colors"
                >
                  Legal Insights
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/news')}
                  className="hover:text-[#c59b63] transition-colors"
                >
                  News &amp; Announcements
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/faqs')}
                  className="hover:text-[#c59b63] transition-colors"
                >
                  FAQs &amp; Retainer
                </button>
              </li>
              */}
            </ul>
          </div>

          {/* Col 4: Executive Chambers & Consultation (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-cinzel text-xs font-semibold tracking-[0.2em] text-[#f4e6d0] uppercase border-b border-[#1c1c24] pb-2">
              Executive Chambers
            </h4>
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#c59b63] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#d8cebe]">{settings.contact.address}</p>
                  <p>{settings.contact.suiteFloor}</p>
                  <p>{settings.contact.cityStateZip}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <Phone className="w-4 h-4 text-[#c59b63] flex-shrink-0" />
                <span className="text-[#f7f4ee] font-mono">{settings.contact.telephone}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#c59b63] flex-shrink-0" />
                <span className="text-[#d8cebe]">{settings.contact.email}</span>
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <Clock className="w-4 h-4 text-[#c59b63] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#d8cebe]">{settings.contact.officeHoursWeekday}</p>
                  <p className="text-[#7e776e]">{settings.contact.officeHoursWeekend}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="mt-14 pt-8 border-t border-[#181820] text-[11px] text-[#6e6860] leading-relaxed">
          <p>
            <strong className="text-[#8e877e] uppercase font-cinzel">Legal Disclaimer:</strong> The materials and information presented on this website are provided solely for general educational and informational purposes and do not constitute legal advice. Communicating with Lalusis &amp; Partners or any of its attorneys through this website, via email, or by submitting a consultation form does not create an attorney-client relationship. You should not act or refrain from acting on the basis of any content included without seeking appropriate legal or professional counsel on your specific factual circumstances.
          </p>
        </div>

        {/* Bottom Bar: Copyright & Admin Portal */}
        <div className="mt-8 pt-6 border-t border-[#14141a] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7a746b]">
          <div>
            &copy; {new Date().getFullYear()} {settings.general.firmName}, Attorneys at Law. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('/about')}
              className="hover:text-[#c59b63] transition-colors"
            >
              Privacy &amp; Privilege
            </button>
            <div className="h-3 w-[1px] bg-[#22222c]" />
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 text-[#c59b63] hover:text-[#f4e6d0] transition-colors font-cinzel uppercase tracking-wider text-[11px]"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>CMS Administration</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
