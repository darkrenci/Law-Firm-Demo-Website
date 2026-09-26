import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { SiteSettings, NavItem } from '../../types';
import { Button } from '../ui/Buttons';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';
import { SupabaseSetupBanner } from './SupabaseSetupBanner';
import {
  Settings,
  Save,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Building,
  Phone,
  Search,
  Shield,
} from 'lucide-react';

export const SettingsManager: React.FC = () => {
  const toast = useToast();
  const [settings, setSettings] = useState<SiteSettings>(db.getSettings());
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'nav' | 'backup'>('general');

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setSettings(db.getSettings());
    });
    return unsub;
  }, []);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    db.saveSettings(settings);
    toast.success('Settings Saved', 'Firm configuration committed to database.');
  };

  // NAVIGATION BUILDER HANDLERS
  const handleMoveNav = (index: number, direction: 'up' | 'down') => {
    const nav = [...settings.navigation];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= nav.length) return;
    const temp = nav[index];
    nav[index] = nav[targetIdx];
    nav[targetIdx] = temp;
    const updated = { ...settings, navigation: nav };
    setSettings(updated);
    db.saveSettings(updated);
    toast.info('Navigation Reordered');
  };

  const handleAddNavItem = () => {
    const newNav: NavItem = {
      id: `nav-${Date.now()}`,
      label: 'New Link',
      path: '/new-page',
      order: settings.navigation.length + 1,
    };
    const updated = { ...settings, navigation: [...settings.navigation, newNav] };
    setSettings(updated);
    db.saveSettings(updated);
    toast.success('Nav Item Added');
  };

  const handleDeleteNavItem = (id: string) => {
    const updated = { ...settings, navigation: settings.navigation.filter((n) => n.id !== id) };
    setSettings(updated);
    db.saveSettings(updated);
    toast.success('Nav Item Removed');
  };

  const handleUpdateNavItem = (id: string, field: 'label' | 'path', value: string) => {
    const updatedNav = settings.navigation.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    const updated = { ...settings, navigation: updatedNav };
    setSettings(updated);
    db.saveSettings(updated);
  };

  // BACKUP & RESTORE
  const handleExportJSON = () => {
    const jsonStr = db.exportDatabaseBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lalusis_partners_cms_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup Exported', 'Full CMS database snapshot downloaded.');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        const success = db.restoreDatabaseBackup(content);
        if (success) {
          toast.success('Database Restored', 'All CMS state successfully recovered.');
        } else {
          toast.error('Restore Failed', 'Invalid database JSON structure.');
        }
      } catch (err) {
        toast.error('Import Error', 'Could not parse JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (
      confirm(
        'WARNING: This will reset all CMS content, pages, attorneys, and settings back to default seeded data. Continue?'
      )
    ) {
      db.resetToDefaults();
      toast.info('Factory Reset', 'Database restored to initial state.');
    }
  };

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f1f28]">
        <div>
          <span className="font-cinzel text-[11px] font-semibold tracking-[0.2em] text-[#c59b63] uppercase block">
            System &amp; Configuration
          </span>
          <h1 className="font-cormorant text-3xl sm:text-4xl font-light text-[#f7f4ee] mt-1">
            Chamber Settings &amp; Navigation
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="gold-outline" size="sm" onClick={handleExportJSON}>
            <Download className="w-3.5 h-3.5" />
            <span>Export Database JSON</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1f1f28] pb-3">
        {[
          { id: 'general', label: 'Firm Identity & SEO' },
          { id: 'contact', label: 'Chambers & Telephony' },
          { id: 'nav', label: 'Navigation Menu Builder' },
          { id: 'backup', label: 'Database Backup & Restore' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 text-xs font-cinzel uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === t.id
                ? 'bg-[#c59b63] text-[#0d0d11] font-semibold'
                : 'text-[#a8a199] hover:text-[#f7f4ee] hover:bg-[#161620]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: GENERAL & SEO */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveGeneral} className="space-y-6 max-w-3xl bg-[#121217] border border-[#22222d] p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
                Firm Official Name
              </label>
              <input
                type="text"
                value={settings.firmName}
                onChange={(e) => setSettings({ ...settings, firmName: e.target.value })}
                className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
                Sub-Brand Tagline / Title
              </label>
              <input
                type="text"
                value={settings.firmTagline}
                onChange={(e) => setSettings({ ...settings, firmTagline: e.target.value })}
                className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
                Year Founded
              </label>
              <input
                type="number"
                value={settings.foundedYear}
                onChange={(e) =>
                  setSettings({ ...settings, foundedYear: parseInt(e.target.value) || 2012 })
                }
                className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
                Dispute Jurisdiction
              </label>
              <input
                type="text"
                value={settings.jurisdiction}
                onChange={(e) => setSettings({ ...settings, jurisdiction: e.target.value })}
                className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#22222d] space-y-4">
            <h3 className="font-cinzel text-xs uppercase tracking-wider text-[#c59b63]">
              Default Search Engine Metadata (SEO)
            </h3>
            <div>
              <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
                Default Meta Title
              </label>
              <input
                type="text"
                value={settings.seoDefaults.metaTitle}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    seoDefaults: { ...settings.seoDefaults, metaTitle: e.target.value },
                  })
                }
                className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
                Default Meta Description
              </label>
              <textarea
                rows={3}
                value={settings.seoDefaults.metaDescription}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    seoDefaults: { ...settings.seoDefaults, metaDescription: e.target.value },
                  })
                }
                className="w-full bg-[#0d0d11] border border-[#2a2a35] p-2.5 text-xs text-[#f7f4ee] focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" variant="primary" size="md">
              <Save className="w-3.5 h-3.5" />
              <span>Save General Settings</span>
            </Button>
          </div>
        </form>
      )}

      {/* TAB 2: CONTACT & TELEPHONY */}
      {activeTab === 'contact' && (
        <form onSubmit={handleSaveGeneral} className="space-y-6 max-w-3xl bg-[#121217] border border-[#22222d] p-6 sm:p-8">
          <div>
            <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
              Main Building Address
            </label>
            <input
              type="text"
              value={settings.contact.address}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  contact: { ...settings.contact, address: e.target.value },
                })
              }
              className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
                Suite / Level / Tower
              </label>
              <input
                type="text"
                value={settings.contact.suiteFloor}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, suiteFloor: e.target.value },
                  })
                }
                className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
                City / Postal Code
              </label>
              <input
                type="text"
                value={settings.contact.cityStateZip}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, cityStateZip: e.target.value },
                  })
                }
                className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
                Chamber Phone
              </label>
              <input
                type="text"
                value={settings.contact.telephone}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, telephone: e.target.value },
                  })
                }
                className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
                Facsimile
              </label>
              <input
                type="text"
                value={settings.contact.fax}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, fax: e.target.value },
                  })
                }
                className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={settings.contact.email}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, email: e.target.value },
                  })
                }
                className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
                Weekday Hours
              </label>
              <input
                type="text"
                value={settings.contact.officeHoursWeekday}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, officeHoursWeekday: e.target.value },
                  })
                }
                className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">
                Weekend / Emergency
              </label>
              <input
                type="text"
                value={settings.contact.officeHoursWeekend}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, officeHoursWeekend: e.target.value },
                  })
                }
                className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" variant="primary" size="md">
              <Save className="w-3.5 h-3.5" />
              <span>Save Contact Parameters</span>
            </Button>
          </div>
        </form>
      )}

      {/* TAB 3: NAVIGATION MENU BUILDER */}
      {activeTab === 'nav' && (
        <div className="space-y-6 max-w-3xl bg-[#121217] border border-[#22222d] p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-[#22222d]">
            <div>
              <h3 className="font-cinzel text-xs uppercase tracking-wider text-[#f4e6d0]">
                Header Navigation Flow
              </h3>
              <p className="text-xs text-[#8e877e] mt-0.5">
                Reorder or edit public menu links. Changes propagate across the site header and mobile menu.
              </p>
            </div>

            <Button variant="gold-outline" size="sm" onClick={handleAddNavItem}>
              <Plus className="w-3.5 h-3.5" />
              <span>Add Link</span>
            </Button>
          </div>

          <div className="space-y-3">
            {settings.navigation.map((item, index) => (
              <div
                key={item.id}
                className="bg-[#171720] border border-[#262633] p-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => handleMoveNav(index, 'up')}
                      disabled={index === 0}
                      className="text-[#6e6860] hover:text-[#c59b63] disabled:opacity-20 cursor-pointer p-0.5"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleMoveNav(index, 'down')}
                      disabled={index === settings.navigation.length - 1}
                      className="text-[#6e6860] hover:text-[#c59b63] disabled:opacity-20 cursor-pointer p-0.5"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="font-mono text-xs text-[#c59b63] w-4">{index + 1}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 flex-1">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => handleUpdateNavItem(item.id, 'label', e.target.value)}
                    placeholder="Link Label"
                    className="bg-[#0d0d11] border border-[#2a2a35] px-3 py-1.5 text-xs text-[#f7f4ee] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={item.path}
                    onChange={(e) => handleUpdateNavItem(item.id, 'path', e.target.value)}
                    placeholder="/path"
                    className="bg-[#0d0d11] border border-[#2a2a35] px-3 py-1.5 text-xs text-[#f7f4ee] focus:outline-none font-mono"
                  />
                </div>

                <button
                  onClick={() => handleDeleteNavItem(item.id)}
                  className="text-rose-500/70 hover:text-rose-400 p-1.5 cursor-pointer"
                  title="Remove Menu Item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DATABASE BACKUP & RESTORE */}
      {activeTab === 'backup' && (
        <div className="space-y-6 max-w-3xl">
          <SupabaseSetupBanner />
          <div className="bg-[#121217] border border-[#22222d] p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="font-cinzel text-xs uppercase tracking-wider text-[#c59b63]">
              Persistence Engine &amp; Backup
            </h3>
            <p className="text-xs text-[#a8a199] mt-1 leading-relaxed">
              Export a complete JSON snapshot containing all website pages, visual sections, attorneys, practice disciplines, articles, and consultation logs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#22222d]">
            <div className="bg-[#171720] border border-[#262633] p-5 space-y-3">
              <h4 className="font-cinzel text-xs uppercase text-[#f7f4ee] font-semibold">
                Export Current State
              </h4>
              <p className="text-[11px] text-[#8e877e]">
                Download a clean, structured JSON file that can be restored on any device or used as an archive.
              </p>
              <Button variant="gold-outline" size="sm" onClick={handleExportJSON}>
                <Download className="w-3.5 h-3.5" />
                <span>Download Database JSON</span>
              </Button>
            </div>

            <div className="bg-[#171720] border border-[#262633] p-5 space-y-3">
              <h4 className="font-cinzel text-xs uppercase text-[#f7f4ee] font-semibold">
                Restore Database
              </h4>
              <p className="text-[11px] text-[#8e877e]">
                Upload a valid JSON backup file to overwrite current database state with an earlier snapshot.
              </p>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#20202b] hover:bg-[#2b2b3b] text-xs text-[#f7f4ee] cursor-pointer font-cinzel uppercase tracking-wider transition-colors">
                <Upload className="w-3.5 h-3.5 text-[#c59b63]" />
                <span>Upload JSON Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-rose-900/30">
            <div className="bg-rose-950/20 border border-rose-900/40 p-4 flex items-center justify-between gap-4">
              <div>
                <h5 className="font-cinzel text-xs uppercase text-rose-300 font-semibold">
                  Factory Seed Reset
                </h5>
                <p className="text-[11px] text-[#a8a199] mt-0.5">
                  Clear all local changes and reseed the CMS with the authoritative Lalusis &amp; Partners firm baseline.
                </p>
              </div>

              <Button variant="danger" size="sm" onClick={handleResetDefaults}>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Defaults</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
