import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import type { User } from '../../types';
import { AdminTab } from '../admin/AdminLayout';
import {
  Shield,
  Globe,
  ChevronUp,
  ChevronDown,
  LayoutDashboard,
  FileText,
  Briefcase,
  Users,
  BookOpen,
  Inbox,
  Settings,
  Sparkles,
  Layers,
} from 'lucide-react';

interface DemoSwitcherProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  adminTab?: AdminTab;
  onSelectAdminTab?: (tab: AdminTab) => void;
}

export const DemoSwitcher: React.FC<DemoSwitcherProps> = ({
  currentPath,
  onNavigate,
  adminTab = 'dashboard',
  onSelectAdminTab,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<User>(db.getCurrentUser());
  const [users, setUsers] = useState<User[]>(db.getUsers());

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setCurrentUser(db.getCurrentUser());
      setUsers(db.getUsers());
    });
    return unsub;
  }, []);

  const isAdmin = currentPath.startsWith('/admin');

  const handleRoleChange = (userId: string) => {
    db.setCurrentUser(userId);
  };

  const quickAdminTabs: { id: AdminTab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pages', label: 'Pages', icon: FileText },
    { id: 'attorneys', label: 'Attorneys', icon: Users },
    { id: 'practice-areas', label: 'Practices', icon: Briefcase },
    { id: 'articles', label: 'Insights', icon: BookOpen },
    { id: 'consultations', label: 'Inquiries', icon: Inbox },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      aria-label="Demo Mode Controls"
      className="fixed bottom-4 right-4 z-50 font-sans select-none print:hidden"
    >
      {/* Minimized Pill */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-3.5 py-2 bg-[#121218]/95 backdrop-blur-md border border-[#c59b63] text-[#f4e6d0] shadow-2xl hover:bg-[#1a1a24] transition-all cursor-pointer group"
          title="Open Demo Switcher"
        >
          <div className="w-2 h-2 rounded-full bg-[#c59b63] animate-pulse" />
          <span className="font-cinzel text-xs font-semibold tracking-wider uppercase text-[#c59b63] group-hover:text-[#f4e6d0]">
            Demo Switcher
          </span>
          <span className="text-[10px] px-1.5 py-0.5 bg-[#20202c] text-[#8e877e] font-mono">
            {isAdmin ? 'CMS Mode' : 'Public Mode'}
          </span>
          <ChevronUp className="w-3.5 h-3.5 text-[#c59b63]" />
        </button>
      ) : (
        /* Expanded Floating Card */
        <div className="w-80 sm:w-96 bg-[#0f0f15]/98 backdrop-blur-md border border-[#c59b63]/60 shadow-[0_10px_35px_rgba(0,0,0,0.8)] p-4 space-y-3.5 transition-all">
          {/* Header & Collapse */}
          <div className="flex items-center justify-between border-b border-[#222230] pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#c59b63]" />
              <span className="font-cinzel text-[11px] font-bold text-[#f4e6d0] uppercase tracking-[0.16em]">
                Demo Sandbox Controls
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-[#8e877e] hover:text-[#f4e6d0] cursor-pointer"
              title="Minimize panel"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Primary View Segmented Toggle */}
          <div>
            <div className="text-[10px] font-cinzel text-[#8e877e] uppercase tracking-wider mb-1.5 flex justify-between items-center">
              <span>Active Viewport</span>
              <span className="text-[9px] font-mono text-[#c59b63]">
                {isAdmin ? 'Current: /admin' : `Current: ${currentPath || '/'}`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#09090d] border border-[#1f1f2b]">
              <button
                onClick={() => {
                  if (isAdmin) onNavigate('/');
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-cinzel font-semibold tracking-wider uppercase transition-all cursor-pointer ${
                  !isAdmin
                    ? 'bg-[#c59b63] text-[#0d0d11] shadow-md font-bold'
                    : 'text-[#8e877e] hover:text-[#f4e6d0] hover:bg-[#161622]'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Public Site</span>
              </button>

              <button
                onClick={() => {
                  if (!isAdmin) onNavigate('/admin');
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-cinzel font-semibold tracking-wider uppercase transition-all cursor-pointer ${
                  isAdmin
                    ? 'bg-[#c59b63] text-[#0d0d11] shadow-md font-bold'
                    : 'text-[#8e877e] hover:text-[#f4e6d0] hover:bg-[#161622]'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin CMS</span>
              </button>
            </div>
          </div>

          {/* If In Admin: Quick Tab Selector */}
          {isAdmin && onSelectAdminTab && (
            <div>
              <div className="text-[10px] font-cinzel text-[#8e877e] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-[#c59b63]" />
                <span>Direct Module Jump</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {quickAdminTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = adminTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onSelectAdminTab(tab.id)}
                      className={`flex flex-col items-center justify-center p-1.5 text-[10px] border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#1b1b26] border-[#c59b63] text-[#f4e6d0]'
                          : 'bg-[#0d0d12] border-[#1d1d28] text-[#8e877e] hover:border-[#404050] hover:text-[#f4e6d0]'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 mb-1 ${isActive ? 'text-[#c59b63]' : ''}`} />
                      <span className="truncate max-w-full">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick RBAC Role Context Switcher */}
          <div className="pt-2 border-t border-[#1f1f2c] flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-cinzel text-[#8e877e] uppercase tracking-wider">
                User Role:
              </span>
            </div>
            <select
              value={currentUser.id}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="bg-[#171722] border border-[#2b2b3a] text-[#d4af7a] text-[11px] px-2 py-1 focus:outline-none focus:border-[#c59b63] cursor-pointer"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id} className="bg-[#121218] text-[#f7f4ee]">
                  {u.name} ({u.role.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </aside>
  );
};
