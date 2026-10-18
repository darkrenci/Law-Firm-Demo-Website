import { isMysqlBackend } from '../../lib/mysqlClient';
import { backendRequest } from '../../lib/mysqlClient';
import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { SiteSettings, NavItem, GlobalLayoutSettings } from '../../types';
import { defaultGlobalLayout } from '../../config/globalLayout';
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
  RefreshCw,
  KeyRound,
  Wrench,
} from 'lucide-react';

export const SettingsManager: React.FC = () => {
  const toast = useToast();
  const initialState = () => ({ ...db.getSettings(), navigation: db.getNavigation() });
  const [settings, setSettings] = useState<SiteSettings>(initialState);
  const [savedSettings, setSavedSettings] = useState<SiteSettings>(initialState);
  const [navigationDirty, setNavigationDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'nav' | 'layout' | 'maintenance' | 'system' | 'backup'>('general');
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [checkingSystem, setCheckingSystem] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const layout = { ...defaultGlobalLayout, ...settings.layout };
  const settingsWithoutNavigation = (value: SiteSettings) => ({ ...value, navigation: [] });
  const settingsDirty = JSON.stringify(settingsWithoutNavigation(settings)) !== JSON.stringify(settingsWithoutNavigation(savedSettings));

  const updateLayout = (field: keyof GlobalLayoutSettings, value: string) => {
    setSettings(current => ({
      ...current,
      layout: { ...defaultGlobalLayout, ...current.layout, [field]: value },
    }));
  };

  useEffect(() => {
    const unsub = db.subscribe(() => {
      const fresh = { ...db.getSettings(), navigation: db.getNavigation() };
      setSettings(fresh);
      setSavedSettings(fresh);
      setNavigationDirty(false);
    });
    return unsub;
  }, []);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsDirty) return toast.info('No Changes', 'There is nothing new to update.');
    if (!window.confirm('Update these website settings now? The changes will be visible on the public website.')) return;
    try {
      await db.saveSettings(settings);
      setSavedSettings(current => ({ ...settings, navigation: current.navigation }));
      toast.success('Settings Saved', 'Firm configuration committed to database.');
    } catch (error) { toast.error('Save Failed', (error as Error).message); }
  };

  const saveNavigation = async () => {
    if (!navigationDirty) return toast.info('No Changes', 'There is nothing new to update.');
    if (!window.confirm('Publish these navigation changes now? This will update the public website menu.')) return;
    try {
      await db.saveNavigation(settings.navigation);
      setSavedSettings(current => ({ ...current, navigation: settings.navigation }));
      setNavigationDirty(false);
      toast.success('Navigation Updated', 'The public website menu was updated successfully.');
    } catch (error) {
      setSettings(current => ({ ...current, navigation: db.getNavigation() }));
      setNavigationDirty(false);
      toast.error('Navigation Save Failed', (error as Error).message);
    }
  };

  // NAVIGATION BUILDER HANDLERS
  const handleMoveNav = (index: number, direction: 'up' | 'down') => {
    const nav = [...settings.navigation];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= nav.length) return;
    const temp = nav[index];
    nav[index] = nav[targetIdx];
    nav[targetIdx] = temp;
    setSettings({ ...settings, navigation: nav });
    setNavigationDirty(true);
  };

  const handleAddNavItem = () => {
    const newNav: NavItem = {
      id: `nav-${Date.now()}`,
      label: 'New Link',
      path: '/new-page',
      order: settings.navigation.length + 1,
    };
    setSettings({ ...settings, navigation: [...settings.navigation, newNav] });
    setNavigationDirty(true);
  };

  const handleDeleteNavItem = (id: string) => {
    setSettings({ ...settings, navigation: settings.navigation.filter((n) => n.id !== id) });
    setNavigationDirty(true);
  };

  const handleUpdateNavItem = (id: string, field: 'label' | 'path', value: string) => {
    const updatedNav = settings.navigation.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setSettings({ ...settings, navigation: updatedNav });
    setNavigationDirty(true);
  };

  // BACKUP & RESTORE
  const handleExportJSON = async () => {
    let jsonStr: string;
    try {
      jsonStr = isMysqlBackend ? JSON.stringify(await backendRequest('/api/admin/backup'), null, 2) : db.exportDatabaseBackup();
    } catch (error) { toast.error('Backup Failed', (error as Error).message); return; }
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lalusis_partners_cms_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup Exported', isMysqlBackend ? 'MySQL CMS snapshot downloaded.' : 'CMS snapshot downloaded.');
  };

  const checkSystem = async () => {
    setCheckingSystem(true);
    try { setSystemStatus(await backendRequest('/api/admin/system-status')); }
    catch (error) { toast.error('System Check Failed', (error as Error).message); }
    finally { setCheckingSystem(false); }
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error('Password Mismatch', 'The new passwords do not match.');
    if (!window.confirm('Change the administrator password now? Other active sessions will be signed out.')) return;
    try {
      await backendRequest('/api/auth/change-password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password Changed', 'Other administrator sessions were signed out.');
    } catch (error) { toast.error('Password Change Failed', (error as Error).message); }
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
          { id: 'layout', label: 'Global Header & Footer' },
          { id: 'maintenance', label: 'Maintenance Mode' },
          ...(isMysqlBackend ? [{ id: 'system', label: 'System & Security' }] : []),
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

      {(settingsDirty || navigationDirty) && (
        <div className="max-w-5xl border border-amber-500/40 bg-amber-950/20 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div><p className="font-cinzel text-xs uppercase tracking-wider text-amber-300">Unsaved changes</p><p className="text-[11px] text-[#b8afa3] mt-1">Review the changes and use the save button in this section. You will be asked to confirm before anything is written to MySQL.</p></div>
          <button type="button" onClick={() => { setSettings(savedSettings); setNavigationDirty(false); }} className="text-xs text-[#d8cebe] underline underline-offset-4 cursor-pointer">Discard changes</button>
        </div>
      )}

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
                value={settings.seoDefaults?.metaTitle ?? settings.seo?.defaultTitle ?? ''}
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
                value={settings.seoDefaults?.metaDescription ?? settings.seo?.defaultDescription ?? ''}
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
            <Button type="submit" variant="primary" size="md" disabled={!settingsDirty}>
              <Save className="w-3.5 h-3.5" />
              <span>Review &amp; Save Settings</span>
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
            <Button type="submit" variant="primary" size="md" disabled={!settingsDirty}>
              <Save className="w-3.5 h-3.5" />
              <span>Review &amp; Save Contact</span>
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
          <div className="pt-4 border-t border-[#22222d] flex items-center justify-between gap-4">
            <span className={`text-[11px] font-cinzel uppercase tracking-wider ${navigationDirty ? 'text-amber-300' : 'text-emerald-400'}`}>{navigationDirty ? 'Changes awaiting confirmation' : 'Navigation is up to date'}</span>
            <Button variant="primary" size="md" disabled={!navigationDirty} onClick={() => void saveNavigation()}><Save className="w-3.5 h-3.5" /><span>Review &amp; Save Navigation</span></Button>
          </div>
        </div>
      )}

      {/* TAB 4: DATABASE BACKUP & RESTORE */}
      {activeTab === 'layout' && (
        <form onSubmit={handleSaveGeneral} className="space-y-7 max-w-5xl bg-[#121217] border border-[#22222d] p-6 sm:p-8">
          <div className="border-b border-[#22222d] pb-4">
            <h3 className="font-cinzel text-xs uppercase tracking-wider text-[#f4e6d0]">Global Header</h3>
            <p className="text-xs text-[#8e877e] mt-1">These values appear on every public page. Main menu items remain in the Navigation Menu Builder.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {([
              ['headerPhoneLabel', 'Telephone Prefix', 'Direct'],
              ['headerCtaLabel', 'CTA Button Label', 'Request Consultation'],
              ['headerCtaPath', 'CTA Destination', '/consultation'],
            ] as [keyof GlobalLayoutSettings, string, string][]).map(([field,label,placeholder]) => (
              <label key={field} className="block">
                <span className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">{label}</span>
                <input type="text" value={layout[field]} placeholder={placeholder} onChange={event => updateLayout(field,event.target.value)} className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none" />
              </label>
            ))}
          </div>

          <div className="border border-[#2a2a35] bg-[#0a0a0d] p-4 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-[#d8cebe]">{layout.headerPhoneLabel}: {settings.contact.telephone}</span>
            <span className="px-5 py-2 bg-[#c59b63] text-[#0d0d11] font-cinzel text-xs uppercase tracking-wider">{layout.headerCtaLabel}</span>
          </div>

          <div className="border-b border-[#22222d] pb-4 pt-2">
            <h3 className="font-cinzel text-xs uppercase tracking-wider text-[#f4e6d0]">Global Footer</h3>
            <p className="text-xs text-[#8e877e] mt-1">Edit shared column headings, public link labels, and copyright wording.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {([
              ['footerPracticeAreasHeading', 'Practice Areas Heading'],
              ['footerFirmHeading', 'Firm Links Heading'],
              ['footerChambersHeading', 'Contact Column Heading'],
              ['footerAllPracticeAreasLabel', 'All Practice Areas Link'],
              ['footerAboutLabel', 'About Link'],
              ['footerPartnersLabel', 'Partners Link'],
              ['footerContactLabel', 'Contact Link'],
              ['footerConsultationLabel', 'Consultation Link'],
              ['footerOpeningScreenLabel', 'Opening Screen Link'],
              ['footerPrivacyLabel', 'Privacy Link'],
              ['footerCopyrightLabel', 'Copyright Text'],
            ] as [keyof GlobalLayoutSettings, string][]).map(([field,label]) => (
              <label key={field} className={field === 'footerCopyrightLabel' ? 'block md:col-span-2' : 'block'}>
                <span className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1">{label}</span>
                <input type="text" value={layout[field]} onChange={event => updateLayout(field,event.target.value)} className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-xs text-[#f7f4ee] focus:outline-none" />
              </label>
            ))}
          </div>

          <div className="border border-[#2a2a35] bg-[#070709] p-5 grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
            <div><strong className="font-cinzel text-[#f4e6d0] uppercase tracking-wider">{layout.footerPracticeAreasHeading}</strong><p className="text-[#c59b63] mt-3">{layout.footerAllPracticeAreasLabel} →</p></div>
            <div><strong className="font-cinzel text-[#f4e6d0] uppercase tracking-wider">{layout.footerFirmHeading}</strong><p className="text-[#a8a199] mt-3">{layout.footerAboutLabel}</p><p className="text-[#a8a199] mt-2">{layout.footerPartnersLabel}</p></div>
            <div><strong className="font-cinzel text-[#f4e6d0] uppercase tracking-wider">{layout.footerChambersHeading}</strong><p className="text-[#a8a199] mt-3">{settings.contact.email}</p></div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" size="md" disabled={!settingsDirty}><Save className="w-3.5 h-3.5" /><span>Review &amp; Save Layout</span></Button>
          </div>
        </form>
      )}

      {activeTab === 'maintenance' && (
        <form onSubmit={handleSaveGeneral} className="space-y-6 max-w-3xl bg-[#121217] border border-[#22222d] p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#1d1d25] text-[#c59b63]"><Wrench className="w-5 h-5" /></div>
            <div>
              <h3 className="font-cinzel text-sm text-[#f7f4ee] uppercase tracking-wider">Public website maintenance</h3>
              <p className="text-sm text-[#a8a199] mt-2 leading-relaxed max-w-xl">When enabled, every public page is replaced by the maintenance notice. The administrator portal at <strong className="text-[#d8cebe]">/admin</strong> remains available so you can turn it off.</p>
            </div>
          </div>
          <label className="flex items-center justify-between gap-5 bg-[#0d0d11] border border-[#2a2a35] p-5 cursor-pointer">
            <span><span className="block text-sm text-[#f7f4ee]">Enable maintenance mode</span><span className="block text-xs text-[#8e877e] mt-1">The public site will no longer show its normal pages.</span></span>
            <input type="checkbox" checked={settings.maintenance?.enabled === true} onChange={(event) => setSettings({ ...settings, maintenance: { enabled: event.target.checked } })} className="w-5 h-5 accent-[#c59b63] cursor-pointer" />
          </label>
          <div className="flex justify-end"><Button type="submit" variant="primary" size="md" disabled={!settingsDirty}><Save className="w-3.5 h-3.5" /><span>Save Maintenance Setting</span></Button></div>
        </form>
      )}

      {activeTab === 'backup' && (
        <div className="space-y-6 max-w-3xl">
          {!isMysqlBackend && <SupabaseSetupBanner />}
          <div className="bg-[#121217] border border-[#22222d] p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="font-cinzel text-xs uppercase tracking-wider text-[#c59b63]">
              Persistence Engine &amp; Backup
            </h3>
              <p className="text-xs text-[#a8a199] mt-1 leading-relaxed">
              {isMysqlBackend ? 'Download a server-generated snapshot of the CMS records currently stored in MySQL. Uploaded media files require a separate filesystem backup.' : 'Export a JSON snapshot of the local CMS state.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#22222d]">
            {!isMysqlBackend && <div className="bg-[#171720] border border-[#262633] p-5 space-y-3">
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
            </div>}

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

          {!isMysqlBackend && <div className="pt-6 border-t border-rose-900/30">
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
          </div>}
        </div>
      </div>
      )}

      {activeTab === 'system' && isMysqlBackend && (
        <div className="space-y-6 max-w-3xl">
          <div className="bg-[#121217] border border-[#22222d] p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div><h3 className="font-cinzel text-xs uppercase tracking-wider text-[#c59b63]">Application Health</h3><p className="text-xs text-[#8e877e] mt-1">Checks connections without exposing passwords or hosting secrets.</p></div>
              <Button variant="gold-outline" size="sm" onClick={() => void checkSystem()}><RefreshCw className={`w-3.5 h-3.5 ${checkingSystem ? 'animate-spin' : ''}`} /><span>Run Check</span></Button>
            </div>
            {systemStatus ? <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[['MySQL',systemStatus.database],['Private media',systemStatus.mediaConfigured && systemStatus.mediaWritable],['SMTP configuration',systemStatus.smtpConfigured]].map(([label,ok]) => <div key={String(label)} className="border border-[#292934] bg-[#0d0d11] p-4"><div className={`text-xs font-cinzel uppercase ${ok ? 'text-emerald-400' : 'text-rose-400'}`}>{ok ? 'Operational' : 'Needs attention'}</div><div className="text-xs text-[#d8cebe] mt-2">{label}</div></div>)}
            </div> : <p className="text-xs text-[#8e877e]">Run the check to verify the production services.</p>}
          </div>
          <form onSubmit={changePassword} className="bg-[#121217] border border-[#22222d] p-6 sm:p-8 space-y-4">
            <div><h3 className="font-cinzel text-xs uppercase tracking-wider text-[#c59b63] flex items-center gap-2"><KeyRound className="w-4 h-4" />Change Administrator Password</h3><p className="text-xs text-[#8e877e] mt-1">At least 12 characters. Other active sessions will be signed out.</p></div>
            {([['currentPassword','Current password'],['newPassword','New password'],['confirmPassword','Confirm new password']] as const).map(([field,label]) => <label key={field} className="block"><span className="block text-xs text-[#d8cebe] mb-1">{label}</span><input required minLength={field === 'currentPassword' ? undefined : 12} type="password" autoComplete={field === 'currentPassword' ? 'current-password' : 'new-password'} value={passwords[field]} onChange={event => setPasswords({...passwords,[field]:event.target.value})} className="w-full bg-[#0d0d11] border border-[#2a2a35] px-3 py-2 text-sm text-[#f7f4ee] focus:outline-none" /></label>)}
            <div className="flex justify-end"><Button type="submit" variant="primary" size="md"><Shield className="w-3.5 h-3.5" /><span>Update Password</span></Button></div>
          </form>
        </div>
      )}
    </div>
  );
};
