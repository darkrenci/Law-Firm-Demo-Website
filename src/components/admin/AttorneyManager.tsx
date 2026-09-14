import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Attorney } from '../../types';
import { Button } from '../ui/Buttons';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';
import { Users, Plus, Edit3, Trash2, Mail, Phone, Scale, Search, Sparkles } from 'lucide-react';
import { ItemTypographyControls, resolveItemTypography } from './ItemTypographyControls';

interface AttorneyManagerProps {
  onOpenLiveBuilder?: (pageSlug: string) => void;
}

export const AttorneyManager: React.FC<AttorneyManagerProps> = ({ onOpenLiveBuilder }) => {
  const toast = useToast();
  const [attorneys, setAttorneys] = useState<Attorney[]>(db.getAttorneys(true));
  const [editingAttorney, setEditingAttorney] = useState<Attorney | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setAttorneys(db.getAttorneys(true));
    });
    return unsub;
  }, []);

  const handleOpenNew = () => {
    const fresh: Attorney = {
      id: `atty-${Date.now()}`,
      fullName: '',
      slug: '',
      professionalTitle: 'Associate Attorney',
      primarySpecialization: 'Corporate & M&A',
      email: '',
      phone: '+63 (2) 8800-0000',
      portraitUrl:
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
      biography: '',
      barAdmissions: ['Supreme Court of the Philippines (Admitted)'],
      education: ['Juris Doctor, Law'],
      representativeMatters: [],
      isPublished: true,
      displayOrder: attorneys.length + 1,
    };
    setEditingAttorney(fresh);
    setIsNew(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Remove practitioner "${name}" from chamber roster?`)) {
      db.deleteAttorney(id);
      toast.success('Attorney Removed');
    }
  };

  const handleTogglePublish = (atty: Attorney) => {
    db.saveAttorney({ ...atty, isPublished: !atty.isPublished });
    toast.info('Status Updated', `${atty.fullName} is now ${!atty.isPublished ? 'Published' : 'Hidden'}`);
  };

  const filtered = attorneys.filter(
    (a) =>
      a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.primarySpecialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.professionalTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f1f28]">
        <div>
          <span className="font-cinzel text-[11px] font-semibold tracking-[0.2em] text-[#c59b63] uppercase block">
            Chamber Personnel &amp; Counsel
          </span>
          <h1 className="font-cormorant text-3xl sm:text-4xl font-light text-[#f7f4ee] mt-1">
            Attorneys Roster Management
          </h1>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenLiveBuilder && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onOpenLiveBuilder('attorneys')}
              className="border-[#c59b63]/40 text-[#f4e6d0] hover:border-[#c59b63]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c59b63]" />
              <span>Live View Edit Page</span>
            </Button>
          )}

          <Button variant="primary" size="sm" onClick={handleOpenNew}>
            <Plus className="w-3.5 h-3.5" />
            <span>Add Attorney Profile</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a837a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roster by name or specialization..."
            className="w-full bg-[#14141a] border border-[#262633] focus:border-[#c59b63] pl-9 pr-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
          />
        </div>
        <span className="text-xs text-[#8e877e]">{filtered.length} Advocates listed</span>
      </div>

      {/* Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((attorney) => {
          const nameTypo = resolveItemTypography(attorney.typography, 'title', {
            fontFamily: 'font-cormorant',
            fontSize: 'text-xl',
            color: 'text-[#f7f4ee]',
          });
          const titleTypo = resolveItemTypography(attorney.typography, 'desc', {
            fontFamily: 'font-cinzel',
            fontSize: 'text-[10px]',
            color: 'text-[#c59b63]',
          });

          return (
            <div
              key={attorney.id}
              className="bg-[#121217] border border-[#22222d] hover:border-[#c59b63]/60 p-5 flex flex-col justify-between space-y-4 transition-all"
            >
              <div className="flex items-start gap-4">
                <img
                  src={attorney.portraitUrl}
                  alt={attorney.fullName}
                  className="w-16 h-20 object-cover object-top border border-[#2a2a38] flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <span
                    style={titleTypo.customStyle}
                    className={`${titleTypo.fontClass} ${titleTypo.sizeClass} ${titleTypo.colorClass} uppercase tracking-wider block`}
                  >
                    {attorney.professionalTitle}
                  </span>
                  <h3
                    style={nameTypo.customStyle}
                    className={`${nameTypo.fontClass} ${nameTypo.sizeClass} ${nameTypo.colorClass} truncate font-medium`}
                  >
                    {attorney.fullName}
                  </h3>
                  <p className="text-[11px] text-[#a8a199] truncate mt-0.5">
                    {attorney.primarySpecialization}
                  </p>
                  <div className="pt-2 flex items-center gap-1.5">
                    {attorney.typography && Object.keys(attorney.typography).length > 0 && (
                      <span className="text-[9px] font-cinzel text-[#c59b63] bg-[#c59b63]/10 px-1.5 py-0.5 border border-[#c59b63]/30 uppercase tracking-wider">
                        Custom Typo
                      </span>
                    )}
                    <Badge variant={attorney.isPublished ? 'green' : 'amber'} size="sm">
                      {attorney.isPublished ? 'Active' : 'Unpublished'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-xs text-[#8e877e] pt-2 border-t border-[#1c1c24]">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#6e6860]" />
                  <span className="truncate">{attorney.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#6e6860]" />
                  <span>{attorney.phone}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1c1c24] flex items-center justify-between">
                <button
                  onClick={() => handleTogglePublish(attorney)}
                  className="text-[11px] font-cinzel uppercase text-[#8e877e] hover:text-[#f7f4ee] cursor-pointer"
                >
                  {attorney.isPublished ? 'Unpublish' : 'Publish'}
                </button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="gold-outline"
                    size="sm"
                    onClick={() => {
                      setEditingAttorney(attorney);
                      setIsNew(false);
                    }}
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </Button>
                  <button
                    onClick={() => handleDelete(attorney.id, attorney.fullName)}
                    className="p-1.5 text-rose-500/70 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Remove Attorney"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: EDIT / CREATE ATTORNEY */}
      {editingAttorney && (
        <AttorneyEditModal
          attorney={editingAttorney}
          isNew={isNew}
          onClose={() => setEditingAttorney(null)}
          onSave={(saved) => {
            db.saveAttorney(saved);
            toast.success('Roster Updated', `Saved attorney ${saved.fullName}`);
            setEditingAttorney(null);
          }}
        />
      )}
    </div>
  );
};

const AttorneyEditModal: React.FC<{
  attorney: Attorney;
  isNew: boolean;
  onClose: () => void;
  onSave: (atty: Attorney) => void;
}> = ({ attorney, isNew, onClose, onSave }) => {
  const [form, setForm] = useState<Attorney>({ ...attorney });
  const [admissionsStr, setAdmissionsStr] = useState(
    (attorney.barAdmissions || []).join('\n')
  );
  const [educationStr, setEducationStr] = useState(
    (attorney.education || []).join('\n')
  );
  const [mattersStr, setMattersStr] = useState(
    (attorney.representativeMatters || []).join('\n')
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const autoSlug =
      form.slug ||
      form.fullName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    onSave({
      ...form,
      slug: autoSlug,
      barAdmissions: admissionsStr.split('\n').filter((s) => s.trim()),
      education: educationStr.split('\n').filter((s) => s.trim()),
      representativeMatters: mattersStr.split('\n').filter((s) => s.trim()),
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isNew ? 'Register Chamber Advocate' : `Edit Profile: ${attorney.fullName}`}
      subtitle="Maintain biographical detail, academic credentials, and professional appointments."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-2 text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
              Full Legal Name *
            </label>
            <input
              type="text"
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="e.g. Atty. Manuel S. Lalusis"
              className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
              Professional Title / Rank
            </label>
            <input
              type="text"
              required
              value={form.professionalTitle}
              onChange={(e) => setForm({ ...form, professionalTitle: e.target.value })}
              placeholder="e.g. Senior Partner / Managing Partner"
              className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
              Primary Practice Focus
            </label>
            <input
              type="text"
              value={form.primarySpecialization}
              onChange={(e) => setForm({ ...form, primarySpecialization: e.target.value })}
              placeholder="e.g. Corporate M&A, Appellate Advocacy"
              className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
              URL Slug
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="manuel-lalusis (auto-generated if blank)"
              className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
              Chamber Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
              Direct Phone
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
            Portrait Image URL
          </label>
          <input
            type="url"
            value={form.portraitUrl}
            onChange={(e) => setForm({ ...form, portraitUrl: e.target.value })}
            className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
            Professional Biography
          </label>
          <textarea
            rows={4}
            value={form.biography}
            onChange={(e) => setForm({ ...form, biography: e.target.value })}
            className="w-full bg-[#0d0d11] border border-[#2a2a35] p-3 text-xs text-[#f7f4ee] focus:outline-none leading-relaxed"
          />
        </div>

        {/* Custom Typography & Styling */}
        <ItemTypographyControls
          typography={form.typography}
          onChange={(newTypo) => setForm({ ...form, typography: newTypo })}
          fields={[
            { key: 'title', label: 'Full Legal Name', defaultFamily: 'cormorant', defaultSize: 'xl', defaultColor: 'ivory' },
            { key: 'desc', label: 'Professional Title / Rank', defaultFamily: 'cinzel', defaultSize: 'xs', defaultColor: 'gold' },
            { key: 'body', label: 'Biography / Profile Text', defaultFamily: 'sans', defaultSize: 'xs', defaultColor: 'muted' },
          ]}
          previewTitle={form.fullName || 'Atty. Gabriel M. Lalusis'}
          previewDesc={form.biography || `${form.professionalTitle || 'Senior Partner'} · ${form.primarySpecialization || 'Corporate Practice'}`}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-cinzel text-[10px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
              Bar Admissions (1 per line)
            </label>
            <textarea
              rows={3}
              value={admissionsStr}
              onChange={(e) => setAdmissionsStr(e.target.value)}
              className="w-full bg-[#0d0d11] border border-[#2a2a35] p-2 text-xs text-[#f7f4ee] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-cinzel text-[10px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
              Education &amp; Degrees (1 per line)
            </label>
            <textarea
              rows={3}
              value={educationStr}
              onChange={(e) => setEducationStr(e.target.value)}
              className="w-full bg-[#0d0d11] border border-[#2a2a35] p-2 text-xs text-[#f7f4ee] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-cinzel text-[10px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
              Key Matters Advised (1 per line)
            </label>
            <textarea
              rows={3}
              value={mattersStr}
              onChange={(e) => setMattersStr(e.target.value)}
              className="w-full bg-[#0d0d11] border border-[#2a2a35] p-2 text-xs text-[#f7f4ee] focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-[#22222d]">
          <label className="flex items-center gap-2 text-xs text-[#f7f4ee] cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              className="accent-[#c59b63]"
            />
            <span>Publish on public firm directory</span>
          </label>

          <div className="flex gap-3">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Attorney
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
