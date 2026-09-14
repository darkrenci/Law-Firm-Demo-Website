import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { ConsultationRequest, ConsultationStatus } from '../../types';
import { Button } from '../ui/Buttons';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';
import {
  Inbox,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building,
  User,
  Phone,
  Mail,
  Calendar,
  Shield,
  FileText,
  Download,
} from 'lucide-react';

export const ConsultationManager: React.FC = () => {
  const toast = useToast();
  const [consultations, setConsultations] = useState<ConsultationRequest[]>(
    db.getConsultationRequests()
  );
  const [selectedCase, setSelectedCase] = useState<ConsultationRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setConsultations(db.getConsultationRequests());
    });
    return unsub;
  }, []);

  const handleUpdateStatus = (id: string, status: ConsultationStatus) => {
    db.updateConsultationStatus(id, status);
    toast.success('Status Transitioned', `Case moved to ${status.replace('_', ' ')}`);
    if (selectedCase && selectedCase.id === id) {
      setSelectedCase((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const handleAddNotes = (id: string, notes: string) => {
    db.updateConsultationStatus(id, selectedCase?.status || 'under_review', notes);
    toast.success('Internal Notes Recorded');
    if (selectedCase) {
      setSelectedCase((prev) => (prev ? { ...prev, internalNotes: notes } : null));
    }
  };

  const exportCSV = () => {
    const rows = [
      ['Ref', 'Name', 'Email', 'Company', 'Practice', 'Urgency', 'Date', 'Status'],
      ...consultations.map((c) => [
        c.referenceNumber,
        c.fullName,
        c.email,
        c.company || '',
        c.practiceArea,
        c.urgencyLevel,
        new Date(c.createdAt).toLocaleDateString(),
        c.status,
      ]),
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lalusis_inbound_consultations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Export Generated', 'Consultation ledger CSV downloaded.');
  };

  const filtered = consultations.filter((c) => {
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.practiceArea.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f1f28]">
        <div>
          <span className="font-cinzel text-[11px] font-semibold tracking-[0.2em] text-[#c59b63] uppercase block">
            Intake Pipeline &amp; Conflict Clearance
          </span>
          <h1 className="font-cormorant text-3xl sm:text-4xl font-light text-[#f7f4ee] mt-1">
            Consultation Intake CRM
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={exportCSV}>
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a837a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ref #, client name, entity..."
            className="w-full bg-[#14141a] border border-[#262633] focus:border-[#c59b63] pl-9 pr-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[10px] font-cinzel text-[#8e877e] uppercase tracking-wider">
            Filter:
          </span>
          {[
            { id: 'all', label: 'All Inbound' },
            { id: 'new', label: 'New' },
            { id: 'under_review', label: 'Under Review' },
            { id: 'conflict_cleared', label: 'Cleared' },
            { id: 'retainer_sent', label: 'Retainer Sent' },
            { id: 'completed', label: 'Retained' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1 text-[11px] font-cinzel uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-[#c59b63] text-[#0d0d11] font-bold'
                  : 'bg-[#15151c] text-[#a8a199] hover:text-[#f7f4ee]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Consultations Table */}
      <div className="bg-[#121217] border border-[#22222d] overflow-x-auto">
        <table className="w-full text-left text-xs text-[#ded6c9]">
          <thead className="bg-[#181822] text-[#8e877e] font-cinzel text-[10px] uppercase tracking-wider border-b border-[#22222d]">
            <tr>
              <th className="py-3.5 px-4 font-semibold">Reference</th>
              <th className="py-3.5 px-4 font-semibold">Prospective Client</th>
              <th className="py-3.5 px-4 font-semibold">Corporate Entity</th>
              <th className="py-3.5 px-4 font-semibold">Practice Focus</th>
              <th className="py-3.5 px-4 font-semibold">Urgency</th>
              <th className="py-3.5 px-4 font-semibold">Intake Date</th>
              <th className="py-3.5 px-4 font-semibold">Status</th>
              <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1c1c24]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#8e877e]">
                  No consultation inquiries matching filter.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-[#181822]/80 transition-colors cursor-pointer"
                  onClick={() => setSelectedCase(item)}
                >
                  <td className="py-3.5 px-4 font-mono text-[#c59b63] font-medium whitespace-nowrap">
                    {item.referenceNumber}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#f7f4ee]">
                    {item.fullName}
                  </td>
                  <td className="py-3.5 px-4 text-[#a8a199]">
                    {item.company || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-[#ded6c9]">
                    {item.practiceArea}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-semibold uppercase font-cinzel ${
                        item.urgencyLevel === 'Immediate'
                          ? 'text-rose-400'
                          : 'text-[#8e877e]'
                      }`}
                    >
                      {item.urgencyLevel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#8e877e] font-mono whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Badge
                      variant={
                        item.status === 'new'
                          ? 'amber'
                          : item.status === 'conflict_cleared'
                          ? 'green'
                          : item.status === 'completed'
                          ? 'gold'
                          : 'charcoal'
                      }
                      size="sm"
                    >
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCase(item);
                      }}
                      className="px-2.5 py-1 bg-[#1a1a24] hover:bg-[#c59b63] hover:text-[#0d0d11] text-[#c59b63] text-[10px] font-cinzel uppercase tracking-wider transition-colors"
                    >
                      Review Case
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* DETAIL MODAL: REVIEW CONSULTATION & MANAGE CONFLICT STATUS */}
      {selectedCase && (
        <CaseDetailModal
          cCase={selectedCase}
          onClose={() => setSelectedCase(null)}
          onStatusChange={(status) => handleUpdateStatus(selectedCase.id, status)}
          onSaveNotes={(notes) => handleAddNotes(selectedCase.id, notes)}
        />
      )}
    </div>
  );
};

const CaseDetailModal: React.FC<{
  cCase: ConsultationRequest;
  onClose: () => void;
  onStatusChange: (status: ConsultationStatus) => void;
  onSaveNotes: (notes: string) => void;
}> = ({ cCase, onClose, onStatusChange, onSaveNotes }) => {
  const [internalNotes, setInternalNotes] = useState(cCase.internalNotes || '');

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Matter Intake: ${cCase.referenceNumber}`}
      subtitle={`Submitted by ${cCase.fullName} on ${new Date(cCase.createdAt).toLocaleString()}`}
      maxWidth="2xl"
    >
      <div className="space-y-6 pt-2 text-left">
        {/* Status Transition Control Bar */}
        <div className="bg-[#181822] border border-[#2a2a38] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-xs uppercase text-[#8e877e] tracking-wider">
              Intake Status:
            </span>
            <Badge variant="gold" size="md">
              {cCase.status.replace('_', ' ')}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#8e877e] font-cinzel uppercase">
              Transition to:
            </span>
            <select
              value={cCase.status}
              onChange={(e) => onStatusChange(e.target.value as ConsultationStatus)}
              className="bg-[#0d0d11] border border-[#c59b63] text-xs text-[#f4e6d0] px-3 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="new">New</option>
              <option value="under_review">Under Review</option>
              <option value="conflict_cleared">Conflict Cleared</option>
              <option value="scheduled">Consultation Scheduled</option>
              <option value="retainer_sent">Retainer Agreement Sent</option>
              <option value="completed">Retained / Retainer Executed</option>
              <option value="declined">Declined / Adverse Conflict</option>
            </select>
          </div>
        </div>

        {/* 2-Col Case Facts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#121217] border border-[#22222d] p-4">
          <div>
            <span className="font-cinzel text-[10px] text-[#8e877e] uppercase block">
              Contact Name &amp; Role
            </span>
            <p className="font-semibold text-sm text-[#f7f4ee] mt-0.5">{cCase.fullName}</p>
            {cCase.company && (
              <p className="text-[#c59b63] text-xs font-mono">{cCase.company}</p>
            )}
          </div>

          <div>
            <span className="font-cinzel text-[10px] text-[#8e877e] uppercase block">
              Direct Contact
            </span>
            <p className="text-[#ded6c9] mt-0.5">{cCase.email}</p>
            <p className="text-[#8e877e] font-mono">{cCase.phone || 'No phone provided'}</p>
          </div>

          <div>
            <span className="font-cinzel text-[10px] text-[#8e877e] uppercase block">
              Target Legal Discipline
            </span>
            <p className="text-[#f7f4ee] font-medium mt-0.5">{cCase.practiceArea}</p>
          </div>

          <div>
            <span className="font-cinzel text-[10px] text-[#8e877e] uppercase block">
              Preferred Window &amp; Urgency
            </span>
            <p className="text-[#f7f4ee] mt-0.5">
              {cCase.preferredDate || 'Flexible'} ({cCase.preferredTimeSlot})
            </p>
            <p
              className={`text-[10px] font-cinzel font-semibold mt-0.5 ${
                cCase.urgencyLevel === 'Immediate' ? 'text-rose-400' : 'text-[#8e877e]'
              }`}
            >
              Urgency: {cCase.urgencyLevel}
            </p>
          </div>
        </div>

        {/* Case Narrative */}
        <div className="space-y-2">
          <span className="font-cinzel text-xs font-semibold tracking-wider text-[#d4af7a] uppercase">
            Disclosed Matter Summary &amp; Adverse Entities
          </span>
          <div className="bg-[#0a0a0d] border border-[#22222d] p-4 text-xs text-[#f7f4ee] leading-relaxed whitespace-pre-wrap">
            {cCase.caseSummary}
          </div>
        </div>

        {/* Confidential Internal Notes */}
        <div className="space-y-2 pt-2 border-t border-[#22222d]">
          <span className="font-cinzel text-xs font-semibold tracking-wider text-[#d4af7a] uppercase">
            Internal Partner Conflict Notes &amp; Assigned Counsel
          </span>
          <textarea
            rows={3}
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            placeholder="Record conflicts check findings, assigned attorney, or billing rate agreements..."
            className="w-full bg-[#0a0a0d] border border-[#2a2a35] p-2.5 text-xs text-[#f7f4ee] focus:outline-none leading-relaxed"
          />
          <div className="flex justify-end pt-1">
            <Button
              variant="gold-outline"
              size="sm"
              onClick={() => onSaveNotes(internalNotes)}
            >
              Save Internal Notes
            </Button>
          </div>
        </div>

        <div className="pt-4 flex justify-end border-t border-[#22222d]">
          <Button variant="primary" size="sm" onClick={onClose}>
            Close Matter Docket
          </Button>
        </div>
      </div>
    </Modal>
  );
};
