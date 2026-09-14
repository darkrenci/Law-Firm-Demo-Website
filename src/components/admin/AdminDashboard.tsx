import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Button } from '../ui/Buttons';
import { Badge } from '../ui/Badge';
import { AdminTab } from './AdminLayout';
import {
  Inbox,
  MessageSquare,
  FileText,
  Users,
  Briefcase,
  BookOpen,
  ArrowRight,
  Clock,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Plus,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateTab: (tab: AdminTab) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const [consultations, setConsultations] = useState(db.getConsultationRequests());
  const [messages, setMessages] = useState(db.getContactMessages());
  const [pages, setPages] = useState(db.getPages());
  const [attorneys, setAttorneys] = useState(db.getAttorneys(true));
  const [practices, setPractices] = useState(db.getPracticeAreas(true));
  const [articles, setArticles] = useState(db.getArticles(true));
  const [logs, setLogs] = useState(db.getActivityLogs());

  useEffect(() => {
    const update = () => {
      setConsultations(db.getConsultationRequests());
      setMessages(db.getContactMessages());
      setPages(db.getPages());
      setAttorneys(db.getAttorneys(true));
      setPractices(db.getPracticeAreas(true));
      setArticles(db.getArticles(true));
      setLogs(db.getActivityLogs());
    };
    const unsub = db.subscribe(update);
    return unsub;
  }, []);

  const newConsultations = consultations.filter((c) => c.status === 'new');
  const unreadMessages = messages.filter((m) => m.status === 'unread');

  return (
    <div className="space-y-10 text-left">
      {/* Welcome & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f1f28]">
        <div>
          <span className="font-cinzel text-[11px] font-semibold tracking-[0.2em] text-[#c59b63] uppercase block">
            Executive Command &amp; Oversight
          </span>
          <h1 className="font-cormorant text-3xl sm:text-4xl font-light text-[#f7f4ee] mt-1">
            Chamber Administration Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="gold-outline" size="sm" onClick={() => onNavigateTab('pages')}>
            <Plus className="w-3.5 h-3.5" />
            <span>New Page</span>
          </Button>
          <Button variant="primary" size="sm" onClick={() => onNavigateTab('consultations')}>
            <span>Review Inbound ({newConsultations.length})</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1 */}
        <div
          onClick={() => onNavigateTab('consultations')}
          className="bg-[#121217] border border-[#22222d] hover:border-[#c59b63]/60 p-5 sm:p-6 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="font-cinzel text-[10px] text-[#8e877e] uppercase tracking-wider">
              Inbound Consultations
            </span>
            <div className="p-2 bg-[#171720] text-[#c59b63] group-hover:bg-[#c59b63] group-hover:text-[#0d0d11] transition-colors">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-cormorant text-3xl sm:text-4xl text-[#f7f4ee]">
              {consultations.length}
            </span>
            {newConsultations.length > 0 && (
              <Badge variant="amber" size="sm">
                {newConsultations.length} New
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-[#7e776e] mt-1">Clients awaiting conflict clearance</p>
        </div>

        {/* Metric 2 */}
        <div
          onClick={() => onNavigateTab('pages')}
          className="bg-[#121217] border border-[#22222d] hover:border-[#c59b63]/60 p-5 sm:p-6 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="font-cinzel text-[10px] text-[#8e877e] uppercase tracking-wider">
              Website Pages
            </span>
            <div className="p-2 bg-[#171720] text-[#c59b63] group-hover:bg-[#c59b63] group-hover:text-[#0d0d11] transition-colors">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-cormorant text-3xl sm:text-4xl text-[#f7f4ee]">
              {pages.length}
            </span>
            <span className="text-xs text-[#8e877e]">
              ({pages.reduce((acc, p) => acc + (p.sections?.length || 0), 0)} Sections)
            </span>
          </div>
          <p className="text-[11px] text-[#7e776e] mt-1">Dynamic modular architectures</p>
        </div>

        {/* Metric 3 */}
        <div
          onClick={() => onNavigateTab('attorneys')}
          className="bg-[#121217] border border-[#22222d] hover:border-[#c59b63]/60 p-5 sm:p-6 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="font-cinzel text-[10px] text-[#8e877e] uppercase tracking-wider">
              Chamber Advocates
            </span>
            <div className="p-2 bg-[#171720] text-[#c59b63] group-hover:bg-[#c59b63] group-hover:text-[#0d0d11] transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-cormorant text-3xl sm:text-4xl text-[#f7f4ee]">
              {attorneys.length}
            </span>
            <span className="text-xs text-[#8e877e]">Partners &amp; Counsel</span>
          </div>
          <p className="text-[11px] text-[#7e776e] mt-1">Published in Chamber directory</p>
        </div>

        {/* Metric 4 */}
        <div
          onClick={() => onNavigateTab('articles')}
          className="bg-[#121217] border border-[#22222d] hover:border-[#c59b63]/60 p-5 sm:p-6 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="font-cinzel text-[10px] text-[#8e877e] uppercase tracking-wider">
              Legal Insights
            </span>
            <div className="p-2 bg-[#171720] text-[#c59b63] group-hover:bg-[#c59b63] group-hover:text-[#0d0d11] transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-cormorant text-3xl sm:text-4xl text-[#f7f4ee]">
              {articles.length}
            </span>
            <span className="text-xs text-[#8e877e]">Articles Published</span>
          </div>
          <p className="text-[11px] text-[#7e776e] mt-1">Scholarly jurisprudence commentaries</p>
        </div>
      </div>

      {/* 2-Column: Recent Consultations & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Recent Inbound Consultations (7 cols) */}
        <div className="lg:col-span-7 bg-[#121217] border border-[#22222d] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#1f1f28] pb-4">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-[#c59b63]" />
              <h3 className="font-cinzel text-xs font-semibold uppercase tracking-[0.16em] text-[#f4e6d0]">
                Recent Inbound Case Requests
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('consultations')}
              className="text-xs font-cinzel uppercase text-[#c59b63] hover:text-[#f7f4ee] flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({consultations.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#1c1c24]">
            {consultations.slice(0, 4).map((c) => (
              <div
                key={c.id}
                onClick={() => onNavigateTab('consultations')}
                className="py-3.5 hover:bg-[#171720] px-2 transition-colors cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-cinzel text-xs font-semibold text-[#f7f4ee] truncate">
                      {c.fullName}
                    </span>
                    {c.company && (
                      <span className="text-[11px] text-[#8e877e] truncate">({c.company})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-[#7e776e]">
                    <span className="font-mono text-[#c59b63]">{c.referenceNumber}</span>
                    <span>·</span>
                    <span>{c.practiceArea}</span>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1 flex-shrink-0">
                  <Badge
                    variant={
                      c.status === 'new'
                        ? 'amber'
                        : c.status === 'conflict_cleared'
                        ? 'green'
                        : 'charcoal'
                    }
                    size="sm"
                  >
                    {c.status.replace('_', ' ')}
                  </Badge>
                  <span className="text-[10px] text-[#6e6860] font-mono">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Live Activity Stream (5 cols) */}
        <div className="lg:col-span-5 bg-[#121217] border border-[#22222d] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#1f1f28] pb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#c59b63]" />
              <h3 className="font-cinzel text-xs font-semibold uppercase tracking-[0.16em] text-[#f4e6d0]">
                Firm Activity Audit Log
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('logs')}
              className="text-xs font-cinzel uppercase text-[#c59b63] hover:text-[#f7f4ee] flex items-center gap-1 cursor-pointer"
            >
              <span>Audit Trail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {logs.slice(0, 7).map((log) => (
              <div
                key={log.id}
                className="p-3 bg-[#171720] border border-[#22222e] text-xs space-y-1"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-[#f4e6d0]">{log.action}</span>
                  <span className="text-[10px] text-[#6e6860] font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {log.details && <p className="text-[11px] text-[#8e877e]">{log.details}</p>}
                <div className="flex items-center gap-2 pt-1 text-[10px] text-[#6e6860]">
                  <span className="text-[#c59b63] font-cinzel uppercase">{log.userName}</span>
                  <span>·</span>
                  <span>{log.module}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
