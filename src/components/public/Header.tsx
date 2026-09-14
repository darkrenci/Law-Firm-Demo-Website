import React, { useState, useEffect } from 'react';
import { Logo } from '../brand/Logo';
import { Button } from '../ui/Buttons';
import {
  Phone,
  Clock,
  MapPin,
  Search,
  Menu,
  X,
  ChevronDown,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { db } from '../../services/db';
import { FirmSettings, MenuItem } from '../../types';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  onNavigate,
  onOpenSearch,
  onOpenAdmin,
}) => {
  const [settings, setSettings] = useState<FirmSettings>(db.getSettings());
  const [navigation, setNavigation] = useState<MenuItem[]>(db.getNavigation());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPracticeDropdownOpen, setIsPracticeDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setSettings(db.getSettings());
      setNavigation(db.getNavigation());
    });
    return unsub;
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    setIsMobileMenuOpen(false);
    setIsPracticeDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Top Pre-Header Utility Bar */}
      <div className="hidden lg:block bg-[#070709] border-b border-[#1c1c24] text-[11px] text-[#a8a199] py-2 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#c59b63]" />
              <span>
                {settings.contact.suiteFloor}, {settings.contact.cityStateZip}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#c59b63]" />
              <span>{settings.contact.officeHoursWeekday}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#c59b63]" />
              <span className="text-[#f7f4ee] font-medium tracking-wide">
                Direct: {settings.contact.telephone}
              </span>
            </div>
            <div className="h-3 w-[1px] bg-[#2a2a35]" />
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 text-[#c59b63] hover:text-[#f4e6d0] transition-colors cursor-pointer"
              title="Access Content Management System"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="font-cinzel tracking-wider uppercase text-[10px]">
                Admin CMS
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0a0a0d]/95 backdrop-blur-md border-b border-[#c59b63]/30 shadow-2xl py-3.5'
            : 'bg-[#0d0d11]/90 backdrop-blur-sm border-b border-[#1f1f2a] py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4 lg:gap-8">
          {/* Brand Logo with generous spacing buffer */}
          <div
            onClick={() => handleLinkClick('/')}
            className="cursor-pointer flex-shrink-0 mr-8 sm:mr-10 lg:mr-12 xl:mr-14"
          >
            <Logo variant="horizontal" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-5 2xl:gap-7 flex-shrink-0">
            {navigation
              .filter((item) => item.isVisible)
              .map((item) => {
                const isActive =
                  item.path === '/'
                    ? currentPath === '/'
                    : currentPath.startsWith(item.path);

                if (item.children && item.children.length > 0) {
                  return (
                    <div
                      key={item.id}
                      className="relative group"
                      onMouseEnter={() => setIsPracticeDropdownOpen(true)}
                      onMouseLeave={() => setIsPracticeDropdownOpen(false)}
                    >
                      <button
                        onClick={() => handleLinkClick(item.path)}
                        className={`flex items-center gap-1.5 font-cinzel text-xs uppercase tracking-[0.18em] py-2 transition-colors cursor-pointer ${
                          isActive
                            ? 'text-[#d4af7a] border-b border-[#c59b63]'
                            : 'text-[#ded6c9] hover:text-[#f7f4ee]'
                        }`}
                      >
                        <span>{item.label}</span>
                        <ChevronDown className="w-3 h-3 text-[#c59b63] transition-transform duration-200 group-hover:rotate-180" />
                      </button>

                      {/* Dropdown Menu */}
                      <div
                        className={`absolute left-0 top-full pt-2 w-64 transition-all duration-200 ${
                          isPracticeDropdownOpen
                            ? 'opacity-100 translate-y-0 pointer-events-auto'
                            : 'opacity-0 -translate-y-2 pointer-events-none'
                        }`}
                      >
                        <div className="bg-[#121217] border border-[#c59b63]/40 shadow-2xl p-2 divide-y divide-[#1f1f28]">
                          {item.children
                            .filter((c) => c.isVisible)
                            .map((child) => (
                              <button
                                key={child.id}
                                onClick={() => handleLinkClick(child.path)}
                                className="w-full text-left px-3.5 py-2.5 text-xs text-[#d8cebe] hover:text-[#f4e6d0] hover:bg-[#1a1a23] transition-colors flex items-center justify-between group/child cursor-pointer"
                              >
                                <span className="font-sans font-medium">{child.label}</span>
                                <span className="text-[#c59b63] opacity-0 group-hover/child:opacity-100 transition-opacity text-xs">
                                  →
                                </span>
                              </button>
                            ))}
                          <div className="pt-1.5 px-2">
                            <button
                              onClick={() => handleLinkClick('/practice-areas')}
                              className="w-full text-center py-2 font-cinzel text-[11px] text-[#c59b63] hover:text-white uppercase tracking-wider"
                            >
                              View All Disciplines
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleLinkClick(item.path)}
                    className={`font-cinzel text-xs uppercase tracking-[0.18em] py-1 transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'text-[#d4af7a] font-semibold border-b border-[#c59b63]'
                        : 'text-[#ded6c9] hover:text-[#f7f4ee]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
          </nav>

          {/* Actions: Search, Admin Switcher & CTA */}
          <div className="hidden sm:flex items-center gap-3 flex-shrink-0 ml-4">
            <button
              onClick={onOpenSearch}
              className="p-2 text-[#a8a199] hover:text-[#c59b63] hover:bg-white/5 transition-colors cursor-pointer"
              title="Search website (Cmd+K)"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-cinzel font-semibold uppercase tracking-wider text-[#c59b63] border border-[#c59b63]/50 hover:bg-[#c59b63] hover:text-[#0d0d11] transition-all cursor-pointer"
              title="Access Admin CMS Portal"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin CMS</span>
            </button>

            <Button
              variant="primary"
              size="md"
              onClick={() => handleLinkClick('/consultation')}
            >
              Request Consultation
            </Button>
          </div>

          {/* Mobile Menu & Search triggers */}
          <div className="flex items-center gap-2 xl:hidden">
            <button
              onClick={onOpenSearch}
              className="p-2 text-[#a8a199] hover:text-[#c59b63] cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#f7f4ee] hover:text-[#c59b63] cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 top-[70px] z-50 bg-[#0b0b0e]/98 border-t border-[#1f1f2a] p-6 overflow-y-auto flex flex-col justify-between">
          <div className="space-y-4">
            {navigation
              .filter((item) => item.isVisible)
              .map((item) => (
                <div key={item.id} className="border-b border-[#1c1c24] pb-3">
                  <button
                    onClick={() => handleLinkClick(item.path)}
                    className="w-full text-left font-cinzel text-sm uppercase tracking-[0.16em] text-[#f7f4ee] hover:text-[#c59b63] py-1"
                  >
                    {item.label}
                  </button>
                  {item.children && (
                    <div className="pl-4 mt-2 space-y-2 border-l border-[#c59b63]/30">
                      {item.children.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleLinkClick(c.path)}
                          className="block text-xs text-[#a8a199] hover:text-[#c59b63]"
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

            <div className="pt-4">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => handleLinkClick('/consultation')}
              >
                Request Consultation
              </Button>
            </div>
          </div>

          <div className="pt-8 border-t border-[#1c1c24] mt-8 text-center space-y-3">
            <p className="text-xs text-[#a8a199]">{settings.contact.telephone}</p>
            <p className="text-xs text-[#a8a199]">{settings.contact.email}</p>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="inline-flex items-center gap-1.5 text-xs text-[#c59b63] uppercase tracking-wider font-cinzel pt-2"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin CMS Portal</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
