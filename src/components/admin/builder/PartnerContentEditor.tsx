import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { db } from '../../../services/db';
import type { Attorney } from '../../../types';
import { AttorneyEditModal } from '../AttorneyManager';
import { useToast } from '../../ui/Toast';

export function PartnerContentEditor() {
  const [partners, setPartners] = useState(() => db.getAttorneys(true));
  const [editing, setEditing] = useState<Attorney | null>(null);
  const toast = useToast();
  useEffect(() => db.subscribe(() => setPartners(db.getAttorneys(true))), []);
  return <div className="space-y-2">
    <p className="text-xs text-[#a8a199]">Edit each partner's card, popup credentials and three photo placements. Save Attorney publishes the profile across the website.</p>
    {partners.map(partner => <button type="button" key={partner.id} onClick={() => setEditing(partner)} className="block w-full border border-[#c59b63]/50 p-2 text-left text-xs text-[#d4af7a]">
      Edit {partner.fullName}
    </button>)}
    {editing && createPortal(<AttorneyEditModal key={editing.id} attorney={editing} isNew={false} onClose={() => setEditing(null)} onSave={async saved => {
      await db.saveAttorney(saved);
      toast.success('Partner Published', 'Card, popup and profile updated.');
      setEditing(null);
    }} />, document.body)}
  </div>;
}
