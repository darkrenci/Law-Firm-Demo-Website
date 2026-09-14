import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import type { User, UserRole } from '../../types';
import { Logo, LalusisLogoMark } from '../brand/Logo';
import {
  LayoutDashboard,
  FileText,
  Users,
  Briefcase,
  BookOpen,
  Bell,
  HelpCircle,
  Inbox,
  MessageSquare,
  Image as ImageIcon,
  Settings,
  Shield,
  ExternalLink,
  Menu,
  X,
  History,
  LogOut,
  ChevronRight,
  Database,
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  | 'pages'
  | 'attorneys'
  | 'practice-areas'
  | 'articles'
  | 'news'
  | 'faqs'
  | 'consultations'
  | 'messages'
  | 'media'
  | 'settings'
  | 'logs';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onExitAdmin: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  onExitAdmin,
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User>(db.getCurrentUser());
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [consultationsCount, setConsultationsCount] = useState<number>(0);
  const [messagesCount, setMessagesCount] = useState<number>(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      setCurrentUser(db.getCurrentUser());
      setUsers(db.getUsers());
      setConsultationsCount(
        db.getConsultationRequests().filter((c) => c.status === 'new').length
      );
      setMessagesCount(
        db.getContactMessages().filter((m) => m.status === 'unread').length
      );
    };
    update();
    const unsub = db.subscribe(update);
    return unsub;
  }, []);

  const handleRoleSwitch = (userId: string) => {
    db.setCurrentUser(userId);
  };

  const navItems = [
    {
      group: 'Overview',
      items: [
        { id: 'dashboard' as AdminTab, label: 'Executive Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      group: 'Architecture & Content',
      items: [
        { id: 'pages' as AdminTab, label: 'Page Builder', icon: FileText },
        { id: 'practice-areas' as AdminTab, label: 'Practice Areas', icon: Briefcase },
        { id: 'attorneys' as AdminTab, label: 'Attorneys Directory', icon: Users },
        { id: 'articles' as AdminTab, label: 'Legal Insights', icon: BookOpen },
        { id: 'news' as AdminTab, label: 'News & Announcements', icon: Bell },
        { id: 'faqs' as AdminTab, label: 'FAQs & Retainer Protocol', icon: HelpCircle },
      ],
    },
    {
      group: 'Communications & Inbound',
      items: [
        {
          id: 'consultations' as AdminTab,
          label: 'Consultation Inbound',
          icon: Inbox,
          badge: consultationsCount > 0 ? consultationsCount : undefined,
        },
        {
          id: 'messages' as AdminTab,
          label: 'Contact Messages',
          icon: MessageSquare,
          badge: messagesCount > 0 ? messagesCount : undefined,
        },
        { id: 'media' as AdminTab, label: 'Media Library', icon: ImageIcon },
      ],
    },
    {
      group: 'Firm Governance',
      items: [
        { id: 'settings' as AdminTab, label: 'Website Settings & SEO', icon: Settings },
        { id: 'logs' as AdminTab, label: 'Audit Activity Trail', icon: History },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0d] text-[#f7f4ee] flex flex-col antialiased text-left">
      {/* Top Bar */}
      <header className="h-16 bg-[#0f0f14] border-b border-[#1f1f28] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-1.5 text-[#a8a199] hover:text-[#f7f4ee] lg:hidden cursor-pointer"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-7 h-7 text-[#c59b63]">
              <LalusisLogoMark />
            </div>
            <div>
              <span className="font-cinzel text-xs font-semibold tracking-[0.16em] text-[#f4e6d0] uppercase block">
                Lalusis &amp; Partners
              </span>
              <span className="text-[10px] font-mono text-[#8a837a] uppercase tracking-wider">
                CMS Management Platform
              </span>
            </div>
          </div>
        </div>

        {/* Right Tools: Role Switcher & Live Site Button */}
        <div className="flex items-center gap-4">
          {/* RBAC Simulation Switcher */}
          <div className="hidden sm:flex items-center gap-2 bg-[#15151c] border border-[#262633] px-3 py-1.5">
            <Shield className="w-3.5 h-3.5 text-[#c59b63]" />
            <span className="text-[10px] font-cinzel uppercase text-[#8e877e] tracking-wider">
              Active Context:
            </span>
            <select
              value={currentUser.id}
              onChange={(e) => handleRoleSwitch(e.target.value)}
              className="bg-transparent text-xs text-[#d4af7a] font-medium focus:outline-none cursor-pointer"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id} className="bg-[#15151c] text-[#f7f4ee]">
                  {u.name} ({u.role.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>

          {/* Return to Public Website */}
          <button
            onClick={onExitAdmin}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#c59b63] text-[#0d0d10] font-cinzel text-[11px] font-semibold tracking-wider uppercase hover:bg-[#d4af7a] transition-colors cursor-pointer"
          >
            <span>View Public Site</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </header>

      {/* Main Admin Workspace Shell */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0e0e13] border-r border-[#1c1c25] transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:block pt-16 lg:pt-0 ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col justify-between p-4 overflow-y-auto">
            <div className="space-y-6">
              {navItems.map((group, gIdx) => (
                <div key={gIdx} className="space-y-1">
                  <div className="px-3 py-1 text-[10px] font-cinzel font-semibold uppercase tracking-[0.2em] text-[#6e6860]">
                    {group.group}
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onTabChange(item.id);
                            setIsMobileSidebarOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer text-left ${
                            isActive
                              ? 'bg-[#1a1a24] text-[#f4e6d0] border-l-2 border-[#c59b63] font-medium'
                              : 'text-[#a8a199] hover:bg-[#14141a] hover:text-[#f7f4ee]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon
                              className={`w-4 h-4 flex-shrink-0 ${
                                isActive ? 'text-[#c59b63]' : 'text-[#8a837a]'
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge !== undefined && (
                            <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#c59b63] text-[#0d0d11]">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Current Profile Card */}
            <div className="pt-4 border-t border-[#1a1a23] mt-6">
              <div className="flex items-center gap-3 p-2 bg-[#121217] border border-[#20202b]">
                <div className="w-8 h-8 rounded-full bg-[#1b1b26] border border-[#c59b63]/50 flex items-center justify-center font-cinzel text-xs text-[#c59b63] font-semibold">
                  {currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[#f7f4ee] font-medium truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-[#8e877e] uppercase tracking-wider font-mono">
                    {currentUser.role.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/80 z-30 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Content View Container */}
        <main
          className={`flex-1 bg-[#0a0a0d] ${
            currentTab === 'pages'
              ? 'p-0 overflow-hidden flex flex-col h-[calc(100vh-61px)]'
              : 'overflow-y-auto p-4 sm:p-8 lg:p-10'
          }`}
        >
          <div className={currentTab === 'pages' ? 'h-full w-full flex-1 flex flex-col overflow-hidden' : 'max-w-7xl mx-auto'}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
