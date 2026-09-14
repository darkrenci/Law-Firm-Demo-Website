import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { ContactMessage } from '../../types';
import { Button } from '../ui/Buttons';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';
import { MessageSquare, Search, Mail, Phone, Clock, Trash2, CheckCircle2 } from 'lucide-react';

export const MessageManager: React.FC = () => {
  const toast = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>(db.getContactMessages());
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setMessages(db.getContactMessages());
    });
    return unsub;
  }, []);

  const handleMarkStatus = (id: string, status: 'unread' | 'read' | 'replied' | 'archived') => {
    db.updateMessageStatus(id, status);
    toast.success('Message Status Updated', `Marked as ${status}`);
    if (selectedMsg && selectedMsg.id === id) {
      setSelectedMsg((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const filtered = messages.filter(
    (m) =>
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f1f28]">
        <div>
          <span className="font-cinzel text-[11px] font-semibold tracking-[0.2em] text-[#c59b63] uppercase block">
            Electronic Inbound Dispatch
          </span>
          <h1 className="font-cormorant text-3xl sm:text-4xl font-light text-[#f7f4ee] mt-1">
            General Contact Messages
          </h1>
        </div>

        <div className="text-xs text-[#8e877e]">
          {messages.filter((m) => m.status === 'unread').length} Unread inquiries
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a837a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages by sender or keyword..."
            className="w-full bg-[#14141a] border border-[#262633] focus:border-[#c59b63] pl-9 pr-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
          />
        </div>
        <span className="text-xs text-[#8e877e]">{filtered.length} Inquiries</span>
      </div>

      <div className="divide-y divide-[#1c1c24] border border-[#22222d] bg-[#121217]">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#8e877e]">No inquiries recorded.</div>
        ) : (
          filtered.map((msg) => (
            <div
              key={msg.id}
              onClick={() => {
                setSelectedMsg(msg);
                if (msg.status === 'unread') {
                  handleMarkStatus(msg.id, 'read');
                }
              }}
              className={`p-5 hover:bg-[#16161f] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                msg.status === 'unread' ? 'bg-[#15151f] border-l-2 border-[#c59b63]' : ''
              }`}
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-cinzel text-xs font-semibold text-[#f7f4ee]">
                    {msg.fullName}
                  </span>
                  <span className="text-xs font-mono text-[#8e877e]">{msg.email}</span>
                  <Badge
                    variant={
                      msg.status === 'unread'
                        ? 'amber'
                        : msg.status === 'replied'
                        ? 'green'
                        : 'charcoal'
                    }
                    size="sm"
                  >
                    {msg.status}
                  </Badge>
                </div>
                <h4 className="text-xs font-medium text-[#ded6c9]">{msg.subject}</h4>
                <p className="text-xs text-[#8e877e] line-clamp-1">{msg.message}</p>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-[#6e6860] flex-shrink-0">
                <span className="font-mono">{new Date(msg.createdAt).toLocaleString()}</span>
                <Button
                  variant="gold-outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMsg(msg);
                  }}
                >
                  View Note
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedMsg && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedMsg(null)}
          title={`Inquiry from ${selectedMsg.fullName}`}
          subtitle={`Subject: ${selectedMsg.subject}`}
          maxWidth="lg"
        >
          <div className="space-y-5 pt-2 text-left text-xs">
            <div className="grid grid-cols-2 gap-4 bg-[#171720] border border-[#262633] p-4">
              <div>
                <span className="font-cinzel text-[10px] text-[#8e877e] uppercase block">
                  Sender Email
                </span>
                <p className="font-mono text-[#ded6c9] mt-0.5">{selectedMsg.email}</p>
              </div>
              <div>
                <span className="font-cinzel text-[10px] text-[#8e877e] uppercase block">
                  Telephone
                </span>
                <p className="font-mono text-[#ded6c9] mt-0.5">
                  {selectedMsg.phone || 'None provided'}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-cinzel text-[10px] text-[#c59b63] uppercase tracking-wider block">
                Message Body
              </span>
              <div className="bg-[#0a0a0d] border border-[#22222d] p-4 text-[#f7f4ee] leading-relaxed whitespace-pre-wrap">
                {selectedMsg.message}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#22222d]">
              <div className="flex items-center gap-2">
                <span className="text-[#8e877e] font-cinzel text-[10px] uppercase">
                  Mark as:
                </span>
                <button
                  onClick={() => handleMarkStatus(selectedMsg.id, 'replied')}
                  className="px-2.5 py-1 bg-[#1a1a24] text-emerald-400 hover:bg-emerald-950 text-[10px] font-cinzel uppercase"
                >
                  Replied
                </button>
                <button
                  onClick={() => handleMarkStatus(selectedMsg.id, 'archived')}
                  className="px-2.5 py-1 bg-[#1a1a24] text-[#8e877e] hover:bg-[#22222d] text-[10px] font-cinzel uppercase"
                >
                  Archive
                </button>
              </div>

              <Button variant="primary" size="sm" onClick={() => setSelectedMsg(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
