import React, { useState } from 'react';
import { db } from '../../services/db';
import { Button } from '../ui/Buttons';
import { useToast } from '../ui/Toast';
import { MapPin, Phone, Mail, Clock, Shield, CheckCircle2, MessageSquare } from 'lucide-react';

interface ContactViewProps {
  onNavigate: (path: string) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ onNavigate }) => {
  const settings = db.getSettings();
  const toast = useToast();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.message) {
      toast.error('Required Fields', 'Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      db.createContactMessage({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        subject: form.subject || 'General Inquiry',
        message: form.message,
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success('Message Transmitted', 'Our secretarial team has received your communication.');
    }, 600);
  };

  return (
    <div className="bg-[#0d0d11] min-h-screen py-16 sm:py-24 text-left">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-16">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="font-cinzel text-xs font-semibold tracking-[0.25em] text-[#c59b63] uppercase">
            Chambers &amp; Location
          </span>
          <h1 className="font-cormorant text-4xl sm:text-6xl font-light text-[#f7f4ee]">
            Contact Lalusis &amp; Partners
          </h1>
          <p className="text-sm text-[#a8a199] leading-relaxed">
            Headquartered in the Ayala Triangle financial core of Makati City, with consultative facilities in Bonifacio Global City.
          </p>
        </div>

        {/* 2-Column Grid: Contact Information & Direct Message Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Col 1: Chambers Info (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-[#121217] border border-[#262633] p-8 space-y-6">
              <h2 className="font-cinzel text-base font-semibold tracking-[0.18em] text-[#f4e6d0] uppercase border-b border-[#22222d] pb-3">
                Chambers Directory
              </h2>

              <div className="space-y-6 text-xs text-[#a8a199]">
                <div className="flex items-start gap-3.5">
                  <div className="p-2 bg-[#17171e] border border-[#262633] text-[#c59b63]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-cinzel text-xs uppercase tracking-wider text-[#f7f4ee] font-semibold">
                      Chamber Address
                    </h4>
                    <p className="text-[#ded6c9] mt-1">{settings.contact.address}</p>
                    <p>{settings.contact.suiteFloor}</p>
                    <p>{settings.contact.cityStateZip}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2 bg-[#17171e] border border-[#262633] text-[#c59b63]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-cinzel text-xs uppercase tracking-wider text-[#f7f4ee] font-semibold">
                      Direct Telephony
                    </h4>
                    <p className="text-[#f7f4ee] font-mono mt-1">{settings.contact.telephone}</p>
                    <p className="text-[11px] text-[#7e776e]">Facsimile: {settings.contact.fax}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2 bg-[#17171e] border border-[#262633] text-[#c59b63]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-cinzel text-xs uppercase tracking-wider text-[#f7f4ee] font-semibold">
                      Chamber Communications
                    </h4>
                    <p className="text-[#ded6c9] mt-1 font-mono">{settings.contact.email}</p>
                    <p className="text-[11px] text-[#7e776e]">Intake: consultation@lalusislaw.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2 bg-[#17171e] border border-[#262633] text-[#c59b63]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-cinzel text-xs uppercase tracking-wider text-[#f7f4ee] font-semibold">
                      Hours of Operation
                    </h4>
                    <p className="text-[#ded6c9] mt-1">{settings.contact.officeHoursWeekday}</p>
                    <p className="text-[11px] text-[#7e776e]">{settings.contact.officeHoursWeekend}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Privilege Disclaimer */}
            <div className="bg-[#121217] border border-[#262633] p-6 text-xs text-[#7e776e] leading-relaxed space-y-2">
              <div className="flex items-center gap-2 text-[#c59b63] font-cinzel uppercase text-[10px] tracking-wider">
                <Shield className="w-3.5 h-3.5" />
                <span>Notice on Privilege</span>
              </div>
              <p>
                Sending an email or message to Lalusis &amp; Partners will not create an attorney-client relationship. If you are not an existing client, your communication is not protected by the attorney-client privilege.
              </p>
            </div>
          </div>

          {/* Col 2: Direct Message Form (7 cols) */}
          <div className="lg:col-span-7">
            {isSuccess ? (
              <div className="bg-[#121217] border border-[#c59b63] p-10 text-center space-y-6 shadow-2xl">
                <div className="w-12 h-12 rounded-full bg-[#c59b63]/20 border border-[#c59b63] mx-auto flex items-center justify-center text-[#c59b63]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-cormorant text-3xl text-[#f7f4ee]">
                  Message Successfully Dispatched
                </h3>
                <p className="text-sm text-[#a8a199] max-w-md mx-auto leading-relaxed">
                  Thank you for writing to Lalusis &amp; Partners. Our managing chamber administrative desk has recorded your message and will route it appropriately.
                </p>
                <div className="pt-4">
                  <Button
                    variant="gold-outline"
                    size="sm"
                    onClick={() => {
                      setIsSuccess(false);
                      setForm({ fullName: '', email: '', phone: '', subject: '', message: '' });
                    }}
                  >
                    Send Another Note
                  </Button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-[#121217] border border-[#262633] p-8 sm:p-10 space-y-6 shadow-2xl"
              >
                <div className="border-b border-[#22222d] pb-4">
                  <span className="font-cinzel text-[10px] text-[#c59b63] uppercase tracking-[0.2em] block">
                    Direct Electronic Dispatch
                  </span>
                  <h3 className="font-cormorant text-2xl text-[#f7f4ee] font-light mt-1">
                    Send a Message to Chambers
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="e.g. Maria Santos"
                      className="w-full bg-[#0d0d11] border border-[#2a2a35] focus:border-[#c59b63] px-3.5 py-2.5 text-xs text-[#f7f4ee] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="maria@example.com"
                      className="w-full bg-[#0d0d11] border border-[#2a2a35] focus:border-[#c59b63] px-3.5 py-2.5 text-xs text-[#f7f4ee] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1.5">
                      Telephone / Mobile
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+63 917 000 0000"
                      className="w-full bg-[#0d0d11] border border-[#2a2a35] focus:border-[#c59b63] px-3.5 py-2.5 text-xs text-[#f7f4ee] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="e.g., Corporate Governance Inquiry"
                      className="w-full bg-[#0d0d11] border border-[#2a2a35] focus:border-[#c59b63] px-3.5 py-2.5 text-xs text-[#f7f4ee] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1.5">
                    Your Message / Nature of Inquiry *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Provide details regarding your communication..."
                    className="w-full bg-[#0d0d11] border border-[#2a2a35] focus:border-[#c59b63] p-3 text-xs text-[#f7f4ee] focus:outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    isLoading={isSubmitting}
                  >
                    Transmit Message to Reception
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
