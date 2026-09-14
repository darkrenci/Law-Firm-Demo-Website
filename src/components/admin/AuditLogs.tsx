import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { ActivityLog } from '../../types';
import { Button } from '../ui/Buttons';
import { Badge } from '../ui/Badge';
import { History, Search, Filter, ShieldCheck, Clock } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>(db.getActivityLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModule, setFilterModule] = useState<string>('all');

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setLogs(db.getActivityLogs());
    });
    return unsub;
  }, []);

  const filtered = logs.filter((log) => {
    const matchesModule = filterModule === 'all' || log.module === filterModule;
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesModule && matchesSearch;
  });

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f1f28]">
        <div>
          <span className="font-cinzel text-[11px] font-semibold tracking-[0.2em] text-[#c59b63] uppercase block">
            System Compliance &amp; Governance
          </span>
          <h1 className="font-cormorant text-3xl sm:text-4xl font-light text-[#f7f4ee] mt-1">
            Administrative Audit Trail
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#8e877e]">
          <ShieldCheck className="w-4 h-4 text-[#c59b63]" />
          <span>Immutable Session Activity Ledger</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a837a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit actions, user, details..."
            className="w-full bg-[#14141a] border border-[#262633] focus:border-[#c59b63] pl-9 pr-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[10px] font-cinzel text-[#8e877e] uppercase">Module:</span>
          {[
            'all',
            'pages',
            'attorneys',
            'practice_areas',
            'articles',
            'consultations',
            'settings',
          ].map((mod) => (
            <button
              key={mod}
              onClick={() => setFilterModule(mod)}
              className={`px-3 py-1 text-[11px] font-cinzel uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                filterModule === mod
                  ? 'bg-[#c59b63] text-[#0d0d11] font-bold'
                  : 'bg-[#15151c] text-[#a8a199] hover:text-[#f7f4ee]'
              }`}
            >
              {mod.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#121217] border border-[#22222d] overflow-x-auto">
        <table className="w-full text-left text-xs text-[#ded6c9]">
          <thead className="bg-[#181822] text-[#8e877e] font-cinzel text-[10px] uppercase tracking-wider border-b border-[#22222d]">
            <tr>
              <th className="py-3 px-4 font-semibold">Timestamp</th>
              <th className="py-3 px-4 font-semibold">Actor / User</th>
              <th className="py-3 px-4 font-semibold">Action</th>
              <th className="py-3 px-4 font-semibold">Module</th>
              <th className="py-3 px-4 font-semibold">Operation Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1c1c24]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-[#8e877e]">
                  No audit trail records found.
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr key={log.id} className="hover:bg-[#16161f]">
                  <td className="py-3 px-4 font-mono text-[#8e877e] whitespace-nowrap text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-medium text-[#f7f4ee]">
                    {log.userName}
                  </td>
                  <td className="py-3 px-4 text-[#d4af7a] font-medium whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <Badge variant="charcoal" size="sm">
                      {log.module}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-[#a8a199] text-[11px] max-w-md truncate">
                    {log.details || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
