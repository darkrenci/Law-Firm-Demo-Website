import React, { useState } from 'react';
import { db } from '../../services/db';
import { Button } from '../ui/Buttons';
import { useToast } from '../ui/Toast';
import { ShieldCheck, CheckCircle2, AlertCircle, Clock, Calendar, FileText } from 'lucide-react';

interface ConsultationViewProps {
  onNavigate: (path: string) => void;
}

export const ConsultationView: React.FC<ConsultationViewProps> = ({ onNavigate }) => {
  const toast = useToast();
  const practiceAreas = db.getPracticeAreas(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    practiceArea: 'Corporate & M&A',
    urgencyLevel: 'Standard' as 'Immediate' | 'Standard' | 'Exploratory',
    preferredDate: '',
    preferredTimeSlot: 'Morning (9:00 AM - 12:00 PM)',
    caseSummary: '',
    conflictCheckConsent: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.caseSummary) {
      toast.error('Required Fields Missing', 'Please fill in all mandatory fields.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const created = db.createConsultationRequest({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        practiceArea: formData.practiceArea,
        urgencyLevel: formData.urgencyLevel,
        preferredDate: formData.preferredDate || new Date().toISOString().split('T')[0],
        preferredTimeSlot: formData.preferredTimeSlot,
        caseSummary: formData.caseSummary,
        conflictCheckConsent: formData.conflictCheckConsent,
      });

      setIsSubmitting(false);
      setSubmittedRef(created.referenceNumber);
      toast.success('Inquiry Filed', `Case reference code: ${created.referenceNumber}`);
    }, 700);
  };

  return (
    <div className="bg-[#0d0d11] min-h-screen py-16 sm:py-24 text-left">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="font-cinzel text-xs font-semibold tracking-[0.25em] text-[#c59b63] uppercase">
            Executive Engagement Protocol
          </span>
          <h1 className="font-cormorant text-4xl sm:text-6xl font-light text-[#f7f4ee]">
            Request Legal Consultation
          </h1>
          <p className="text-sm text-[#a8a199] leading-relaxed">
            Please submit your confidential matter parameters below. Our conflicts committee conducts an immediate adverse party review prior to confirming partner consultations.
          </p>
        </div>

        {submittedRef ? (
          <div className="bg-[#121217] border border-[#c59b63] p-10 sm:p-14 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-[#c59b63]/15 border border-[#c59b63] mx-auto flex items-center justify-center text-[#c59b63]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-3">
              <span className="font-cinzel text-xs text-[#c59b63] uppercase tracking-[0.25em] block">
                Official Intake Recorded
              </span>
              <h2 className="font-cormorant text-3xl sm:text-4xl text-[#f7f4ee]">
                Matter Received for Conflict Clearance
              </h2>
              <p className="text-sm text-[#a8a199] max-w-lg mx-auto leading-relaxed">
                Your consultation request has been assigned the tracking reference number below. Please quote this number during future communications:
              </p>
              <div className="py-3">
                <span className="inline-block font-mono text-base px-6 py-2 bg-[#0a0a0d] border border-[#c59b63] text-[#f4e6d0] tracking-wider">
                  {submittedRef}
                </span>
              </div>
              <p className="text-xs text-[#7e776e] max-w-md mx-auto">
                A partner or senior associate will contact you within our standard intake window of 24–48 hours.
              </p>
            </div>

            <div className="pt-6 flex justify-center gap-4">
              <Button variant="primary" size="md" onClick={() => onNavigate('/')}>
                Return to Firm Homepage
              </Button>
              <Button
                variant="gold-outline"
                size="md"
                onClick={() => {
                  setSubmittedRef(null);
                  setFormData({
                    fullName: '',
                    email: '',
                    phone: '',
                    company: '',
                    practiceArea: 'Corporate & M&A',
                    urgencyLevel: 'Standard',
                    preferredDate: '',
                    preferredTimeSlot: 'Morning (9:00 AM - 12:00 PM)',
                    caseSummary: '',
                    conflictCheckConsent: true,
                  });
                }}
              >
                Submit Another Request
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-[#121217] border border-[#262633] p-8 sm:p-12 shadow-2xl space-y-8">
            {/* Disclaimer Bar */}
            <div className="bg-[#171720] border-l-2 border-[#c59b63] p-4 text-xs text-[#a8a199] flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#c59b63] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#f4e6d0] font-cinzel tracking-wider uppercase text-[11px] block mb-0.5">
                  Conflict-of-Interest &amp; Confidentiality Notice
                </strong>
                Submission of preliminary information through this intake portal allows us to identify potential conflicts of interest before formal retainer. All disclosures are maintained in high confidence.
              </div>
            </div>

            {/* Consultation Intake Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1.5">
                    Client Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Atty. Alexander Tan / Director Chen"
                    className="w-full bg-[#0d0d11] border border-[#2a2a35] focus:border-[#c59b63] px-3.5 py-2.5 text-xs text-[#f7f4ee] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1.5">
                    Official Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@organization.com"
                    className="w-full bg-[#0d0d11] border border-[#2a2a35] focus:border-[#c59b63] px-3.5 py-2.5 text-xs text-[#f7f4ee] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1.5">
                    Telephone / Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+63 (2) 8800-0000"
                    className="w-full bg-[#0d0d11] border border-[#2a2a35] focus:border-[#c59b63] px-3.5 py-2.5 text-xs text-[#f7f4ee] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1.5">
                    Corporate Entity / Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Corporation or entity name"
                    className="w-full bg-[#0d0d11] border border-[#2a2a35] focus:border-[#c59b63] px-3.5 py-2.5 text-xs text-[#f7f4ee] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1.5">
                    Target Legal Discipline
                  </label>
                  <select
                    value={formData.practiceArea}
                    onChange={(e) => setFormData({ ...formData, practiceArea: e.target.value })}
                    className="w-full bg-[#0d0d11] border border-[#2a2a35] focus:border-[#c59b63] px-3.5 py-2.5 text-xs text-[#f7f4ee] focus:outline-none cursor-pointer"
                  >
                    {practiceAreas.map((pa) => (
                      <option key={pa.id} value={pa.title} className="bg-[#0d0d11]">
                        {pa.title}
                      </option>
                    ))}
                    <option value="General Corporate Counsel" className="bg-[#0d0d11]">
                      General Corporate Counsel
                    </option>
                    <option value="Executive Advisory" className="bg-[#0d0d11]">
                      Executive Advisory
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1.5">
                    Urgency Level
                  </label>
                  <select
                    value={formData.urgencyLevel}
                    onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value as any })}
                    className="w-full bg-[#0d0d11] border border-[#2a2a35] focus:border-[#c59b63] px-3.5 py-2.5 text-xs text-[#f7f4ee] focus:outline-none cursor-pointer"
                  >
                    <option value="Immediate">Urgent / Hearing or TRO Scheduled</option>
                    <option value="Standard">Standard (Within 2 Business Days)</option>
                    <option value="Exploratory">Exploratory / Strategic Engagement</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1.5">
                    Preferred Consultation Date
                  </label>
                  <input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full bg-[#0d0d11] border border-[#2a2a35] focus:border-[#c59b63] px-3.5 py-2.5 text-xs text-[#f7f4ee] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1.5">
                    Preferred Window
                  </label>
                  <select
                    value={formData.preferredTimeSlot}
                    onChange={(e) => setFormData({ ...formData, preferredTimeSlot: e.target.value })}
                    className="w-full bg-[#0d0d11] border border-[#2a2a35] focus:border-[#c59b63] px-3.5 py-2.5 text-xs text-[#f7f4ee] focus:outline-none cursor-pointer"
                  >
                    <option value="Morning (9:00 AM - 12:00 PM)">Morning (9:00 AM - 12:00 PM)</option>
                    <option value="Afternoon (1:00 PM - 5:00 PM)">Afternoon (1:00 PM - 5:00 PM)</option>
                    <option value="Evening (5:00 PM - 7:00 PM)">Evening (5:00 PM - 7:00 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1.5">
                  Matter Description &amp; Adverse Parties *
                </label>
                <textarea
                  rows={5}
                  required
                  value={formData.caseSummary}
                  onChange={(e) => setFormData({ ...formData, caseSummary: e.target.value })}
                  placeholder="Outline the nature of the dispute or transaction, names of key opposing individuals or corporate entities (essential for conflict checks), and key milestones."
                  className="w-full bg-[#0d0d11] border border-[#2a2a35] focus:border-[#c59b63] p-3 text-xs text-[#f7f4ee] focus:outline-none leading-relaxed"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs text-[#a8a199] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.conflictCheckConsent}
                    onChange={(e) => setFormData({ ...formData, conflictCheckConsent: e.target.checked })}
                    className="mt-0.5 accent-[#c59b63]"
                  />
                  <span className="text-[11px] leading-relaxed">
                    I acknowledge that transmitting this consultation inquiry does not establish an attorney-client relationship until an engagement letter is formally countersigned.
                  </span>
                </label>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isSubmitting}
                >
                  Submit for Partner Review
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
