import { submitInquiry } from './inquiryService';
import {
  FirmSettings,
  Attorney,
  PracticeArea,
  Article,
  NewsItem,
  FAQCategory,
  FAQItem,
  ConsultationRequest,
  ConsultationStatus,
  ContactMessage,
  MediaItem,
  MenuItem,
  User,
  ActivityLog,
  Page,
  PageSection,
  PageVersion,
} from '../types';
import {
  initialSettings,
  initialAttorneys,
  initialPracticeAreas,
  initialArticles,
  initialNews,
  initialFAQCategories,
  initialFAQs,
  initialMedia,
  initialNavigation,
  initialPages,
} from './seedData';
import { supabaseService } from './supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';

const DB_KEYS = {
  SETTINGS: 'lp_cms_settings_v1',
  PAGES: 'lp_cms_pages_v1',
  PAGE_VERSIONS: 'lp_cms_page_versions_v1',
  ATTORNEYS: 'lp_cms_attorneys_v1',
  PRACTICE_AREAS: 'lp_cms_practice_areas_v1',
  ARTICLES: 'lp_cms_articles_v1',
  NEWS: 'lp_cms_news_v1',
  FAQ_CATEGORIES: 'lp_cms_faq_cats_v1',
  FAQS: 'lp_cms_faqs_v1',
  CONSULTATIONS: 'lp_cms_consultations_v1',
  MESSAGES: 'lp_cms_messages_v1',
  MEDIA: 'lp_cms_media_v1',
  NAVIGATION: 'lp_cms_nav_v1',
  USERS: 'lp_cms_users_v1',
  CURRENT_USER_ID: 'lp_cms_cur_user_v1',
  ACTIVITY_LOGS: 'lp_cms_logs_v1',
};

type Listener = () => void;

class DatabaseService {
  private listeners: Set<Listener> = new Set();
  private verifiedAdmin: User | null = null;
  private privateGeneration = 0;
  private privateCache = new Map<string, unknown>();
  private privateKeys = new Set<string>([DB_KEYS.CONSULTATIONS, DB_KEYS.MESSAGES, DB_KEYS.USERS, DB_KEYS.CURRENT_USER_ID, DB_KEYS.ACTIVITY_LOGS, DB_KEYS.PAGE_VERSIONS]);

  public setVerifiedAdmin(user: User | null): void {
    if (user?.id !== this.verifiedAdmin?.id || !user) {
      this.privateGeneration++;
      this.privateCache.clear();
    }
    this.verifiedAdmin = user;
    for (const key of this.privateKeys) { try { localStorage.removeItem(key); } catch {} }
    this.notify();
  }

  constructor() {
    this.setVerifiedAdmin(null);
    this.initSupabaseSync();
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => { void this.refreshFromSupabase(); });
      window.addEventListener('online', () => { void this.refreshFromSupabase(); });
    }
  }

  private async initSupabaseSync() {
    if (!isSupabaseConfigured) return;
    try {
      const isReady = await supabaseService.checkSchemaReady();
      if (!isReady) {
        // Suppress errors and operate safely in fallback mode
        return;
      }

      // 2. Fetch fresh cloud data
      await this.refreshFromSupabase();

      // 3. Setup real-time cloud subscription
      supabaseService.subscribeToRealtimeChanges(() => {
        this.refreshFromSupabase();
      });
    } catch (e) {
      console.warn('Supabase sync initialization warning:', e);
    }
  }

  public async triggerSupabaseSetupCheck(): Promise<{ ready: boolean; message: string }> {
    if (!isSupabaseConfigured) {
      return { ready: false, message: 'Supabase credentials are not configured.' };
    }
    const isReady = await supabaseService.checkSchemaReady();
    if (!isReady) {
      return {
        ready: false,
        message: 'PostgreSQL tables not found. Please run the SQL schema migration in Supabase SQL Editor.',
      };
    }

    const migrationRes = await supabaseService.migrateInitialData({
      settings: this.getSettings(),
      pages: this.getPages(),
      attorneys: this.getAttorneys(true),
      practiceAreas: this.getPracticeAreas(true),
      articles: this.getArticles(true),
      news: this.getNews(true),
      media: this.getMedia(),
      navigation: this.getNavigation(),
      consultations: this.getConsultationRequests(),
      messages: this.getContactMessages(),
    });

    await this.refreshFromSupabase();
    this.notify();
    return { ready: true, message: migrationRes.message || 'Supabase connected and synchronized!' };
  }

  public async refreshFromSupabase(): Promise<void> {
    if (!isSupabaseConfigured) return;
    const isReady = await supabaseService.checkSchemaReady();
    if (!isReady) return;

    try {
      const privateGeneration = this.privateGeneration;
      const [settings, pages, attorneys, practiceAreas, articles, news, media, navigation, consultations, messages] =
        await Promise.all([
          supabaseService.getSettings(),
          supabaseService.getPages(),
          supabaseService.getAttorneys(),
          supabaseService.getPracticeAreas(),
          supabaseService.getArticles(),
          supabaseService.getNews(),
          supabaseService.getMedia(),
          supabaseService.getNavigation(),
          this.verifiedAdmin ? supabaseService.getConsultations() : Promise.resolve(null),
          this.verifiedAdmin ? supabaseService.getContactMessages() : Promise.resolve(null),
        ]);

      let hasChanges = false;
      if (settings) {
        this.save(DB_KEYS.SETTINGS, settings);
        hasChanges = true;
      }
      if (pages !== null) {
        this.save(DB_KEYS.PAGES, pages);
        hasChanges = true;
      }
      if (attorneys !== null) {
        this.save(DB_KEYS.ATTORNEYS, attorneys);
        hasChanges = true;
      }
      if (practiceAreas !== null) {
        this.save(DB_KEYS.PRACTICE_AREAS, practiceAreas);
        hasChanges = true;
      }
      if (articles !== null) {
        this.save(DB_KEYS.ARTICLES, articles);
        hasChanges = true;
      }
      if (news !== null) {
        this.save(DB_KEYS.NEWS, news);
        hasChanges = true;
      }
      if (media !== null) {
        this.save(DB_KEYS.MEDIA, media);
        hasChanges = true;
      }
      if (navigation !== null) {
        this.save(DB_KEYS.NAVIGATION, navigation);
        hasChanges = true;
      }
      if (consultations !== null && this.verifiedAdmin && privateGeneration === this.privateGeneration) {
        this.save(DB_KEYS.CONSULTATIONS, consultations);
        hasChanges = true;
      }
      if (messages !== null && this.verifiedAdmin && privateGeneration === this.privateGeneration) {
        this.save(DB_KEYS.MESSAGES, messages);
        hasChanges = true;
      }

      if (hasChanges) {
        this.notify();
      }
    } catch (err) {
      console.warn('Error refreshing from Supabase:', err);
    }
  }

  private async requireCloudWrite(write: () => Promise<boolean>): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error('Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your hosting environment and redeploy before publishing changes.');
    }
    if (!await supabaseService.checkSchemaReady() || !await write()) {
      throw new Error('Supabase could not save this change. Check the database schema, connection, and write permissions, then try again.');
    }
  }

  private load<T>(key: string, defaultValue: T): T {
    if (this.privateKeys.has(key)) return (this.verifiedAdmin ? this.privateCache.get(key) as T : undefined) ?? defaultValue;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn(`Failed to read ${key} from storage:`, e);
    }
    return defaultValue;
  }

  private save<T>(key: string, value: T): void {
    if (this.privateKeys.has(key)) {
      if (this.verifiedAdmin) this.privateCache.set(key, value);
      this.notify();
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to save ${key} to storage:`, e);
    }
    this.notify();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Error in DB listener:', e);
      }
    });
  }

  // --- CURRENT USER & AUTH ---
  public getUsers(): User[] { return this.verifiedAdmin ? [this.verifiedAdmin] : []; }

  public getCurrentUser(): User {
    return this.verifiedAdmin || { id: 'visitor', name: 'Visitor', email: '', role: 'VIEWER', isActive: false, createdAt: '' };
  }

  public setCurrentUser(userId: string): void {
    if (userId !== this.verifiedAdmin?.id) throw new Error('Administrator identity is managed by Supabase authentication.');
  }

  public saveUser(_user: User): void {
    throw new Error('Manage administrator accounts in Supabase, not local browser storage.');
  }

  // --- ACTIVITY LOGS ---
  public getActivityLogs(): ActivityLog[] {
    return this.load<ActivityLog[]>(DB_KEYS.ACTIVITY_LOGS, []);
  }

  public logActivity(action: string, module: string, recordId?: string, details?: string): void {
    if (!this.verifiedAdmin) return;
    const currentUser = this.getCurrentUser();
    const log: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      module,
      recordId,
      details,
      timestamp: new Date().toISOString(),
    };
    const logs = this.getActivityLogs();
    this.save(DB_KEYS.ACTIVITY_LOGS, [log, ...logs.slice(0, 199)]);
  }

  // --- SETTINGS ---
  public getSettings(): FirmSettings {
    const settings = this.load<FirmSettings>(DB_KEYS.SETTINGS, initialSettings);
    let changed = false;
    if (settings.general) {
      if (settings.general.tagline === 'Strategic Counsel. Trusted Representation.') {
        settings.general.tagline = 'Legal Precision.';
        changed = true;
      }
      if (settings.general.headline === 'Strategic Counsel. Trusted Representation.') {
        settings.general.headline = 'Legal Precision.';
        changed = true;
      }
    }
    if (settings.seo && settings.seo.defaultTitle?.includes('Strategic Counsel')) {
      settings.seo.defaultTitle = 'Lalusis & Partners | Attorneys at Law – Legal Precision';
      changed = true;
    }
    if (
      !settings.contact ||
      settings.contact.email !== 'lalusispartners@gmail.com' ||
      settings.contact.telephone !== '+63 917 327 5931' ||
      !settings.contact.address?.includes('Future Point Plaza')
    ) {
      settings.contact = {
        ...settings.contact,
        address: '110, Unit 20, Suite J, Future Point Plaza Suites, Panay Avenue',
        suiteFloor: 'Unit 20, Suite J, Future Point Plaza Suites',
        cityStateZip: 'South Triangle, 1103, Quezon City, NCR, Second District',
        country: 'Philippines',
        telephone: '+63 917 327 5931',
        emergencyLine: '+63 917 327 5931',
        email: 'lalusispartners@gmail.com',
        consultationEmail: 'lalusispartners@gmail.com',
        officeHoursWeekday: 'Monday – Friday: 8:30 AM – 6:30 PM (PHT)',
        officeHoursWeekend: 'Saturday: By Prior Appointment Only',
        googleMapEmbedUrl: 'https://maps.google.com/maps?q=Future+Point+Plaza+Suites+Panay+Avenue+Quezon+City&t=&z=16&ie=UTF8&iwloc=&output=embed',
      };
      changed = true;
    }
    if (changed) {
      this.save(DB_KEYS.SETTINGS, settings);
    }
    return settings;
  }

  public updateSettings(updates: Partial<FirmSettings>): void {
    const current = this.getSettings();
    const merged: FirmSettings = {
      ...current,
      ...updates,
      general: { ...current.general, ...(updates.general || {}) },
      contact: { ...current.contact, ...(updates.contact || {}) },
      social: { ...current.social, ...(updates.social || {}) },
      branding: { ...current.branding, ...(updates.branding || {}) },
      seo: { ...current.seo, ...(updates.seo || {}) },
    };
    this.save(DB_KEYS.SETTINGS, merged);
    this.logActivity('Updated Website Settings', 'Website Settings', 'settings', 'Modified firm metadata, contact, or branding');
  }

  public saveSettings(settings: any): void {
    this.save(DB_KEYS.SETTINGS, settings);
    supabaseService.saveSettings(settings).catch((e) => console.warn('Supabase saveSettings:', e));
    this.logActivity('Updated Website Settings', 'Website Settings', 'settings', 'Saved full settings payload');
  }

  // --- PAGES & PAGE BUILDER ---
  public getPages(): Page[] {
    const pages = this.load<Page[]>(DB_KEYS.PAGES, initialPages);
    const coreSlugs = new Set(['', 'home', 'about', 'attorneys', 'practice-areas', 'contact']);
    const normalize = (slug: string) => slug === 'home' ? '' : slug === 'partners' ? 'attorneys' : slug;
    const missing = initialPages.filter((page) => coreSlugs.has(page.slug) &&
      !pages.some((saved) => saved.id === page.id || normalize(saved.slug) === normalize(page.slug)));
    // Restore missing core routes only; never replace saved content or sections.
    // Replace the original sample clips in existing cloud/cache records too.
    // Explicitly selected custom videos remain editable and are preserved.
    const sampleNames = ['ForBiggerBlazes', 'BigBuckBunny', 'ElephantsDream'];
    const durations = ['00:16', '00:59', '00:34'];
    return [...pages, ...structuredClone(missing)].map(page => ({
      ...page,
      sections: (page.sections || []).map(section => {
        if (!Array.isArray(section.content?.videos)) return section;
        return {...section, content: {...section.content, videos: section.content.videos.map((video: any) => {
          const index = sampleNames.findIndex(name => video.videoUrl === `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/${name}.mp4`);
          return index < 0 ? video : {...video, videoUrl: `/videos/news-${index + 1}.mp4`, duration: durations[index]};
        })}};
      }),
    }));
  }

  public getPageBySlug(slug: string): Page | undefined {
    const normalized = slug === '/' ? '' : slug.replace(/^\//, '');
    return this.getPages().find((p) => p.slug === normalized);
  }

  public getPageById(id: string): Page | undefined {
    return this.getPages().find((p) => p.id === id);
  }

  public async savePage(page: Page, summary: string = 'Updated page content'): Promise<void> {
    await this.requireCloudWrite(() => supabaseService.savePage(page));
    const pages = this.getPages();
    const idx = pages.findIndex((p) => p.id === page.id);
    const now = new Date().toISOString();
    const updatedPage: Page = {
      ...page,
      updatedAt: now,
    };

    let updated: Page[];
    if (idx >= 0) {
      updated = [...pages];
      updated[idx] = updatedPage;
      this.createPageVersion(page.id, updatedPage.sections, summary);
    } else {
      updated = [updatedPage, ...pages];
      this.createPageVersion(page.id, updatedPage.sections, 'Initial page creation');
    }

    this.save(DB_KEYS.PAGES, updated);
    this.logActivity(idx >= 0 ? 'Updated Page' : 'Created Page', 'Pages', page.id, `Page: ${page.title} (/${page.slug})`);
  }

  public async duplicatePage(id: string): Promise<Page | null> {
    const page = this.getPageById(id);
    if (!page) return null;
    const newPage: Page = {
      ...page,
      id: `page-${Date.now()}`,
      title: `${page.title} (Copy)`,
      slug: `${page.slug}-copy-${Math.floor(Math.random() * 1000)}`,
      isPublished: false,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      sections: page.sections.map((s) => ({
        ...s,
        id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      })),
    };
    await this.savePage(newPage, 'Duplicated from existing page');
    return newPage;
  }

  public deletePage(id: string): boolean {
    const pages = this.getPages();
    if (id === 'page-home') return false; // Prevent deleting home page
    const filtered = pages.filter((p) => p.id !== id);
    this.save(DB_KEYS.PAGES, filtered);
    this.logActivity('Deleted Page', 'Pages', id, `Deleted page with ID: ${id}`);
    return true;
  }

  // --- PAGE BUILDER SECTION ACTIONS ---
  public async addSection(pageId: string, section: Omit<PageSection, 'id' | 'order'>): Promise<PageSection | null> {
    const page = this.getPageById(pageId);
    if (!page) return null;
    const newOrder = page.sections.length > 0 ? Math.max(...page.sections.map((s) => s.order)) + 1 : 1;
    const newSection: PageSection = {
      ...section,
      id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      order: newOrder,
    };
    page.sections.push(newSection);
    await this.savePage(page, `Added ${section.type} section`);
    return newSection;
  }

  public async updateSection(pageId: string, sectionId: string, updates: Partial<PageSection>): Promise<boolean> {
    const page = this.getPageById(pageId);
    if (!page) return false;
    const idx = page.sections.findIndex((s) => s.id === sectionId);
    if (idx === -1) return false;
    page.sections[idx] = {
      ...page.sections[idx],
      ...updates,
      content: { ...page.sections[idx].content, ...(updates.content || {}) },
    };
    await this.savePage(page, `Edited section: ${page.sections[idx].title || page.sections[idx].type}`);
    return true;
  }

  public async deleteSection(pageId: string, sectionId: string): Promise<boolean> {
    const page = this.getPageById(pageId);
    if (!page) return false;
    page.sections = page.sections.filter((s) => s.id !== sectionId);
    await this.savePage(page, 'Deleted section');
    return true;
  }

  public async reorderSections(pageId: string, newOrderedIds: string[]): Promise<boolean> {
    const page = this.getPageById(pageId);
    if (!page) return false;
    const sectionMap = new Map(page.sections.map((s) => [s.id, s]));
    const reordered: PageSection[] = [];
    newOrderedIds.forEach((id, index) => {
      const s = sectionMap.get(id);
      if (s) {
        reordered.push({ ...s, order: index + 1 });
      }
    });
    page.sections = reordered;
    await this.savePage(page, 'Reordered sections');
    return true;
  }

  public async duplicateSection(pageId: string, sectionId: string): Promise<PageSection | null> {
    const page = this.getPageById(pageId);
    if (!page) return null;
    const original = page.sections.find((s) => s.id === sectionId);
    if (!original) return null;
    const cloned: PageSection = {
      ...JSON.parse(JSON.stringify(original)),
      id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `${original.title || original.type} (Copy)`,
      order: original.order + 1,
    };
    page.sections.splice(page.sections.indexOf(original) + 1, 0, cloned);
    // adjust subsequent orders
    page.sections.forEach((s, idx) => {
      s.order = idx + 1;
    });
    await this.savePage(page, `Duplicated section: ${original.title || original.type}`);
    return cloned;
  }

  // --- PAGE VERSIONS ---
  public getPageVersions(pageId: string): PageVersion[] {
    const allVersions = this.load<PageVersion[]>(DB_KEYS.PAGE_VERSIONS, []);
    return allVersions.filter((v) => v.pageId === pageId).sort((a, b) => b.versionNumber - a.versionNumber);
  }

  private createPageVersion(pageId: string, sections: PageSection[], summary: string): void {
    const allVersions = this.load<PageVersion[]>(DB_KEYS.PAGE_VERSIONS, []);
    const existing = allVersions.filter((v) => v.pageId === pageId);
    const nextVersion = existing.length > 0 ? Math.max(...existing.map((v) => v.versionNumber)) + 1 : 1;
    const currentUser = this.getCurrentUser();
    const newVersion: PageVersion = {
      id: `ver-${Date.now()}`,
      pageId,
      versionNumber: nextVersion,
      modifiedBy: currentUser.name,
      timestamp: new Date().toISOString(),
      changeSummary: summary,
      sectionsSnapshot: JSON.parse(JSON.stringify(sections)),
    };
    this.save(DB_KEYS.PAGE_VERSIONS, [newVersion, ...allVersions.slice(0, 150)]);
  }

  public async restorePageVersion(pageId: string, versionId: string): Promise<boolean> {
    const page = this.getPageById(pageId);
    if (!page) return false;
    const allVersions = this.load<PageVersion[]>(DB_KEYS.PAGE_VERSIONS, []);
    const target = allVersions.find((v) => v.id === versionId && v.pageId === pageId);
    if (!target) return false;
    page.sections = JSON.parse(JSON.stringify(target.sectionsSnapshot));
    await this.savePage(page, `Restored to Version ${target.versionNumber}`);
    this.logActivity('Restored Page Version', 'Page Builder', pageId, `Restored to Version ${target.versionNumber}`);
    return true;
  }

  // --- ATTORNEYS ---
  public getAttorneys(includeUnpublished: boolean = true): Attorney[] {
    const list = this.load<Attorney[]>(DB_KEYS.ATTORNEYS, initialAttorneys);
    return includeUnpublished ? list : list.filter((a) => a.isPublished);
  }

  public getAttorneyBySlug(slug: string): Attorney | undefined {
    if (!slug) return undefined;
    const clean = decodeURIComponent(slug).toLowerCase().trim();
    return this.getAttorneys(true).find(
      (a) => a.slug?.toLowerCase() === clean || a.id.toLowerCase() === clean
    );
  }

  public async saveAttorney(attorney: Attorney): Promise<void> {
    await this.requireCloudWrite(() => supabaseService.saveAttorney(attorney));
    const list = this.getAttorneys(true);
    const idx = list.findIndex((a) => a.id === attorney.id);
    let updated: Attorney[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = attorney;
    } else {
      updated = [...list, attorney];
    }
    this.save(DB_KEYS.ATTORNEYS, updated);
    this.logActivity(idx >= 0 ? 'Updated Attorney' : 'Created Attorney', 'Attorneys', attorney.id, `Attorney: ${attorney.fullName}`);
  }

  public deleteAttorney(id: string): boolean {
    const list = this.getAttorneys(true);
    const filtered = list.filter((a) => a.id !== id);
    this.save(DB_KEYS.ATTORNEYS, filtered);
    supabaseService.deleteAttorney(id).catch((e) => console.warn('Supabase deleteAttorney:', e));
    this.logActivity('Deleted Attorney', 'Attorneys', id, `Deleted attorney with ID: ${id}`);
    return true;
  }

  // --- PRACTICE AREAS ---
  public getPracticeAreas(includeDrafts: boolean = true): PracticeArea[] {
    let list = this.load<PracticeArea[]>(DB_KEYS.PRACTICE_AREAS, initialPracticeAreas);
    // Ensure the 14 standardized practice areas are present and updated:
    if (!list || list.length < 14 || !list.some((p) => p.slug === 'criminal-and-administrative-litigation')) {
      list = initialPracticeAreas;
      this.save(DB_KEYS.PRACTICE_AREAS, list);
    }
    if (includeDrafts) return list;
    return list.filter((pa) => pa.status === 'published');
  }

  public getPracticeAreaBySlug(slug: string): PracticeArea | undefined {
    if (!slug) return undefined;
    const clean = decodeURIComponent(slug).toLowerCase().trim();
    return this.getPracticeAreas(true).find(
      (pa) => pa.slug?.toLowerCase() === clean || pa.id.toLowerCase() === clean
    );
  }

  public savePracticeArea(area: PracticeArea): void {
    const list = this.getPracticeAreas(true);
    const idx = list.findIndex((pa) => pa.id === area.id);
    let updated: PracticeArea[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = area;
    } else {
      updated = [...list, area];
    }
    this.save(DB_KEYS.PRACTICE_AREAS, updated);
    supabaseService.savePracticeArea(area).catch((e) => console.warn('Supabase savePracticeArea:', e));
    this.logActivity(idx >= 0 ? 'Updated Practice Area' : 'Created Practice Area', 'Practice Areas', area.id, `Practice Area: ${area.title}`);
  }

  public deletePracticeArea(id: string): boolean {
    const list = this.getPracticeAreas(true);
    const filtered = list.filter((pa) => pa.id !== id);
    this.save(DB_KEYS.PRACTICE_AREAS, filtered);
    supabaseService.deletePracticeArea(id).catch((e) => console.warn('Supabase deletePracticeArea:', e));
    this.logActivity('Deleted Practice Area', 'Practice Areas', id, `Deleted practice area: ${id}`);
    return true;
  }

  // --- LEGAL INSIGHTS (ARTICLES) ---
  public getArticles(includeUnpublished: boolean = true): Article[] {
    const list = this.load<Article[]>(DB_KEYS.ARTICLES, initialArticles);
    if (includeUnpublished) return list;
    return list.filter((a) => a.status === 'published');
  }

  public getArticleBySlug(slug: string): Article | undefined {
    if (!slug) return undefined;
    const clean = decodeURIComponent(slug).toLowerCase().trim();
    return this.getArticles(true).find(
      (a) => a.slug?.toLowerCase() === clean || a.id.toLowerCase() === clean
    );
  }

  public saveArticle(article: Article): void {
    const list = this.getArticles(true);
    const idx = list.findIndex((a) => a.id === article.id);
    const now = new Date().toISOString();
    const user = this.getCurrentUser();

    // Create a snapshot version
    const versionEntry = {
      versionNumber: (article.versions?.length || 0) + 1,
      editedAt: now,
      editedBy: user.name,
      title: article.title,
      content: article.content,
    };

    const updatedArticle: Article = {
      ...article,
      updatedAt: now,
      versions: [...(article.versions || []), versionEntry],
    };

    let updated: Article[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = updatedArticle;
    } else {
      updated = [updatedArticle, ...list];
    }
    this.save(DB_KEYS.ARTICLES, updated);
    supabaseService.saveArticle(updatedArticle).catch((e) => console.warn('Supabase saveArticle:', e));
    this.logActivity(idx >= 0 ? 'Updated Article' : 'Created Article', 'Legal Insights', article.id, `Title: "${article.title}" (${article.status})`);
  }

  public restoreArticleVersion(articleId: string, versionNumber: number): boolean {
    const article = this.getArticleBySlug(articleId) || this.getArticles(true).find((a) => a.id === articleId);
    if (!article || !article.versions) return false;
    const target = article.versions.find((v) => v.versionNumber === versionNumber);
    if (!target) return false;
    article.title = target.title;
    article.content = target.content;
    this.saveArticle(article);
    return true;
  }

  public deleteArticle(id: string): boolean {
    const list = this.getArticles(true);
    const filtered = list.filter((a) => a.id !== id);
    this.save(DB_KEYS.ARTICLES, filtered);
    supabaseService.deleteArticle(id).catch((e) => console.warn('Supabase deleteArticle:', e));
    this.logActivity('Deleted Article', 'Legal Insights', id, `Deleted article with ID: ${id}`);
    return true;
  }

  // --- NEWS ---
  public getNews(includeDrafts: boolean = true): NewsItem[] {
    const list = this.load<NewsItem[]>(DB_KEYS.NEWS, initialNews);
    if (includeDrafts) return list;
    return list.filter((n) => n.status === 'published');
  }

  public getNewsBySlug(slug: string): NewsItem | undefined {
    if (!slug) return undefined;
    const clean = decodeURIComponent(slug).toLowerCase().trim();
    return this.getNews(true).find(
      (n) => n.slug?.toLowerCase() === clean || n.id.toLowerCase() === clean
    );
  }

  public saveNews(news: NewsItem): void {
    const list = this.getNews(true);
    const idx = list.findIndex((n) => n.id === news.id);
    let updated: NewsItem[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = news;
    } else {
      updated = [news, ...list];
    }
    this.save(DB_KEYS.NEWS, updated);
    supabaseService.saveNews(news).catch((e) => console.warn('Supabase saveNews:', e));
    this.logActivity(idx >= 0 ? 'Updated News' : 'Created News', 'News', news.id, `News: ${news.title}`);
  }

  public deleteNews(id: string): boolean {
    const list = this.getNews(true);
    const filtered = list.filter((n) => n.id !== id);
    this.save(DB_KEYS.NEWS, filtered);
    supabaseService.deleteNews(id).catch((e) => console.warn('Supabase deleteNews:', e));
    this.logActivity('Deleted News', 'News', id, `Deleted news item: ${id}`);
    return true;
  }

  // --- FAQS ---
  public getFAQCategories(): FAQCategory[] {
    return this.load<FAQCategory[]>(DB_KEYS.FAQ_CATEGORIES, initialFAQCategories);
  }

  public saveFAQCategory(cat: FAQCategory): void {
    const list = this.getFAQCategories();
    const idx = list.findIndex((c) => c.id === cat.id);
    let updated: FAQCategory[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = cat;
    } else {
      updated = [...list, cat];
    }
    this.save(DB_KEYS.FAQ_CATEGORIES, updated);
  }

  public getFAQs(includeUnpublished: boolean = true): FAQItem[] {
    const list = this.load<FAQItem[]>(DB_KEYS.FAQS, initialFAQs);
    if (includeUnpublished) return list;
    return list.filter((f) => f.isPublished);
  }

  public saveFAQ(faq: FAQItem): void {
    const list = this.getFAQs(true);
    const idx = list.findIndex((f) => f.id === faq.id);
    let updated: FAQItem[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = faq;
    } else {
      updated = [...list, faq];
    }
    this.save(DB_KEYS.FAQS, updated);
    this.logActivity(idx >= 0 ? 'Updated FAQ' : 'Created FAQ', 'FAQs', faq.id, `FAQ: "${faq.question.substring(0, 40)}..."`);
  }

  public deleteFAQ(id: string): boolean {
    const list = this.getFAQs(true);
    const filtered = list.filter((f) => f.id !== id);
    this.save(DB_KEYS.FAQS, filtered);
    this.logActivity('Deleted FAQ', 'FAQs', id, `Deleted FAQ: ${id}`);
    return true;
  }

  // --- CONSULTATION REQUESTS ---
  public getConsultationRequests(): ConsultationRequest[] {
    return this.load<ConsultationRequest[]>(DB_KEYS.CONSULTATIONS, []);
  }

  public async createConsultationRequest(
    data: Omit<ConsultationRequest, 'id' | 'referenceNumber' | 'status' | 'internalNotes' | 'createdAt' | 'updatedAt'>
  ): Promise<ConsultationRequest> {
    const result = await submitInquiry({ kind: 'consultation', fullName: data.fullName,
      email: data.emailAddress || data.email || '', phone: data.contactNumber || data.phone,
      company: data.company, practiceArea: data.practiceArea || data.practiceAreaId,
      urgency: data.urgencyLevel, preferredDate: data.preferredDate,
      preferredTime: data.preferredTime || data.preferredTimeSlot,
      message: data.briefConcern || data.caseSummary || '',
      consent: data.privacyConsent ?? data.conflictCheckConsent ?? false });
    const now = new Date().toISOString();
    const req: ConsultationRequest = {
      ...data,
      id: result.id,
      referenceNumber: result.referenceNumber,
      status: 'new',
      internalNotes: 'Client submitted online request. Pending conflict review.',
      createdAt: now,
      updatedAt: now,
    };
    const list = this.getConsultationRequests();
    this.save(DB_KEYS.CONSULTATIONS, [req, ...list]);
    this.logActivity('New Consultation Inbound', 'Consultations', req.id, `Client: ${req.fullName} (${req.referenceNumber})`);
    return req;
  }

  public updateConsultationStatus(
    id: string,
    status: ConsultationStatus,
    notes?: string
  ): boolean {
    const list = this.getConsultationRequests();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    const current = list[idx];
    list[idx] = {
      ...current,
      status,
      internalNotes: notes !== undefined ? notes : current.internalNotes,
      updatedAt: new Date().toISOString(),
    };
    this.save(DB_KEYS.CONSULTATIONS, list);
    this.logActivity('Updated Consultation Status', 'Consultations', id, `Reference ${current.referenceNumber} status changed to ${status}`);
    return true;
  }

  // --- CONTACT MESSAGES ---
  public getContactMessages(): ContactMessage[] {
    return this.load<ContactMessage[]>(DB_KEYS.MESSAGES, []);
  }

  public async createContactMessage(
    data: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>
  ): Promise<ContactMessage> {
    const result = await submitInquiry({ kind: 'contact', fullName: data.fullName,
      email: data.email || data.emailAddress || '', phone: data.phone || data.contactNumber,
      subject: data.subject, message: data.message });
    const msg: ContactMessage = {
      ...data,
      id: result.id,
      status: 'unread',
      createdAt: new Date().toISOString(),
    };
    const list = this.getContactMessages();
    this.save(DB_KEYS.MESSAGES, [msg, ...list]);
    this.logActivity('New Contact Message', 'Messages', msg.id, `From: ${msg.fullName} (${msg.subject})`);
    return msg;
  }

  public updateContactMessageStatus(
    id: string,
    status: 'unread' | 'read' | 'replied' | 'archived',
    notes?: string
  ): boolean {
    const list = this.getContactMessages();
    const idx = list.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    list[idx] = {
      ...list[idx],
      status,
      internalNotes: notes !== undefined ? notes : list[idx].internalNotes,
    };
    this.save(DB_KEYS.MESSAGES, list);
    return true;
  }

  public updateMessageStatus(
    id: string,
    status: 'unread' | 'read' | 'replied' | 'archived',
    notes?: string
  ): boolean {
    return this.updateContactMessageStatus(id, status, notes);
  }

  // --- MEDIA LIBRARY ---
  public autoAdaptMediaItem(
    item: MediaItem,
    attorneys?: Attorney[]
  ): { item: MediaItem; wasUpdated: boolean } {
    const rawName = item.name ? item.name.trim() : '';
    const isGeneric =
      !rawName ||
      rawName.toLowerCase().includes('picture file') ||
      rawName.endsWith('*') ||
      rawName.toLowerCase() === 'image' ||
      rawName.toLowerCase() === 'photo' ||
      rawName.toLowerCase() === 'visual asset' ||
      rawName.toLowerCase() === 'general media' ||
      /^med-\d+$/.test(rawName);

    // If it already has an authentic title and valid non-general category, keep it
    if (!isGeneric && item.category && item.category !== 'general') {
      return { item, wasUpdated: false };
    }

    const attyList = attorneys || this.getAttorneys(true);
    let updatedName = item.name;
    let updatedCategory = item.category;
    let updatedAlt = item.altText;

    const urlLower = (item.url || '').toLowerCase();
    const altLower = (item.altText || '').toLowerCase();

    // 1. Direct match with attorney portraits and placement images
    const matchedAtty = attyList.find(
      (a) =>
        (a.homeCardImageUrl && (a.homeCardImageUrl === item.url || item.url.includes(`${a.slug}-home-card`))) ||
        (a.homeModalImageUrl && (a.homeModalImageUrl === item.url || item.url.includes(`${a.slug}-home-modal`))) ||
        (a.partnerPageImageUrl && (a.partnerPageImageUrl === item.url || item.url.includes(`${a.slug}-partner-page`))) ||
        (a.portraitUrl && (a.portraitUrl === item.url || item.url.includes(a.slug)))
    );

    if (matchedAtty) {
      if (matchedAtty.homeCardImageUrl === item.url) {
        updatedName = `${matchedAtty.fullName} – Home Page Card Portrait`;
      } else if (matchedAtty.homeModalImageUrl === item.url) {
        updatedName = `${matchedAtty.fullName} – Home Page Popup Modal Portrait`;
      } else if (matchedAtty.partnerPageImageUrl === item.url) {
        updatedName = `${matchedAtty.fullName} – Partner Page Portrait`;
      } else {
        updatedName = `${matchedAtty.fullName} – Founding Partner Official Portrait`;
      }
      updatedCategory = 'branding';
      updatedAlt = `${matchedAtty.fullName}, ${matchedAtty.primarySpecialization || matchedAtty.professionalTitle}`;
    }
    // 2. Attorney keyword matching in URL or alt text
    else if (urlLower.includes('levy') || altLower.includes('levy')) {
      updatedName = 'Atty. Levy John L.V. Lalusis – Founding Partner';
      updatedCategory = 'branding';
      updatedAlt = 'Atty. Levy John L.V. Lalusis, Founding Partner';
    } else if (urlLower.includes('leo') || altLower.includes('leo')) {
      updatedName = 'Atty. Leo Anselmo L.V. Lalusis – Founding Partner';
      updatedCategory = 'branding';
      updatedAlt = 'Atty. Leo Anselmo L.V. Lalusis, Founding Partner';
    } else if (urlLower.includes('diosdado') || altLower.includes('diosdado')) {
      updatedName = 'Senior Partner Atty. Diosdado Anselmo Q. Lalusis';
      updatedCategory = 'branding';
      updatedAlt = 'Senior Partner Atty. Diosdado Anselmo Q. Lalusis';
    } else if (
      urlLower.includes('group') ||
      urlLower.includes('three') ||
      urlLower.includes('partners') ||
      altLower.includes('founding partners')
    ) {
      updatedName = 'Founding Partners Institutional Chamber Portrait';
      updatedCategory = 'branding';
      updatedAlt = 'Founding Partners of Lalusis & Partners Law Firm';
    } else if (urlLower.includes('justice') || urlLower.includes('scale') || urlLower.includes('statue')) {
      updatedName = 'Supreme Court Architecture & Scale of Justice';
      updatedCategory = 'branding';
      updatedAlt = 'Supreme Court Architecture & Scale of Justice';
    } else if (urlLower.includes('library') || urlLower.includes('book')) {
      updatedName = 'Firm Reference Library & Classical Chambers';
      updatedCategory = 'architectural';
      updatedAlt = 'Firm Reference Library & Classical Chambers';
    } else if (urlLower.includes('office') || urlLower.includes('hallway') || urlLower.includes('corridor')) {
      updatedName = 'Corporate Chambers & Practice Facilities';
      updatedCategory = 'architectural';
      updatedAlt = 'Corporate Chambers & Practice Facilities';
    }
    // 3. Clean filename from URL if generic
    else if (isGeneric) {
      try {
        const urlObj = item.url.split('?')[0].split('/');
        const filename = decodeURIComponent(urlObj[urlObj.length - 1] || '');
        const cleanName = filename
          .replace(/^\d+-[a-z0-9]+-/, '')
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]+/g, ' ')
          .trim()
          .replace(/\b\w/g, (c) => c.toUpperCase());

        if (cleanName && !cleanName.toLowerCase().includes('picture file')) {
          updatedName = cleanName;
          updatedAlt = cleanName;
        } else {
          updatedName = 'Chamber Visual Asset';
        }
      } catch {
        updatedName = 'Chamber Visual Asset';
      }
    }

    if (!updatedCategory || updatedCategory === 'general') {
      updatedCategory = 'branding';
    }

    const wasUpdated =
      updatedName !== item.name ||
      updatedCategory !== item.category ||
      updatedAlt !== item.altText;

    return {
      item: {
        ...item,
        name: updatedName,
        category: (updatedCategory as any) || 'branding',
        altText: updatedAlt || updatedName,
      },
      wasUpdated,
    };
  }

  public getMedia(): MediaItem[] {
    return this.load<MediaItem[]>(DB_KEYS.MEDIA, []);
  }

  public addMedia(item: Omit<MediaItem, 'id' | 'createdAt'> & { id?: string }): MediaItem {
    const list = this.getMedia();
    const existingIdx = item.id
      ? list.findIndex((m) => m.id === item.id)
      : list.findIndex((m) => m.url === item.url);

    if (existingIdx >= 0) {
      const existing = list[existingIdx];
      const updatedItem: MediaItem = {
        ...existing,
        name: item.name,
        category: item.category as any,
        altText: item.altText || item.name,
        uploadedAt: new Date().toISOString(),
      };
      this.saveMedia(updatedItem);
      return updatedItem;
    }

    const newItem: MediaItem = {
      id: item.id || `med-${Date.now()}`,
      name: item.name,
      url: item.url,
      fileType: item.fileType || 'image',
      format: item.format || 'jpg',
      sizeBytes: item.sizeBytes || 102400,
      size: item.size || 'optimized',
      category: item.category as any,
      altText: item.altText || item.name,
      createdAt: new Date().toISOString(),
      uploadedAt: new Date().toISOString(),
    };
    this.saveMedia(newItem);
    return newItem;
  }

  public saveMedia(item: MediaItem): void {
    const list = this.getMedia();
    const idx = list.findIndex((m) => m.id === item.id || m.url === item.url);
    let updated: MediaItem[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = { ...list[idx], ...item };
    } else {
      updated = [item, ...list];
    }
    this.save(DB_KEYS.MEDIA, updated);
    supabaseService.saveMedia(item).catch((e) => console.warn('Supabase saveMedia:', e));
    this.logActivity(idx >= 0 ? 'Updated Media Item' : 'Uploaded Media Item', 'Media', item.id, `Media: ${item.name}`);
  }

  public async deleteMedia(id: string): Promise<boolean> {
    await this.requireCloudWrite(() => supabaseService.deleteMedia(id));
    const list = this.getMedia();
    const filtered = list.filter((m) => m.id !== id);
    this.save(DB_KEYS.MEDIA, filtered);
    this.logActivity('Deleted Media Item', 'Media', id, `Deleted media item: ${id}`);
    return true;
  }

  // --- NAVIGATION ---
  public getNavigation(): MenuItem[] {
    const stored = this.load<MenuItem[]>(DB_KEYS.NAVIGATION, initialNavigation);
    const normalize = (path: string) => path === '/partners' ? '/attorneys' : path;
    const missing = initialNavigation.filter((item) =>
      !stored.some((saved) => saved.id === item.id || normalize(saved.path) === normalize(item.path)));
    const nav = [...stored, ...structuredClone(missing)].sort((a, b) => a.order - b.order);
    const removedPaths = ['/insights', '/news', '/faqs'];
    const removedIds = ['nav-insights', 'nav-news', 'nav-faqs'];
    let changed = false;

    const filtered = nav.filter((item) => {
      if (removedPaths.includes(item.path) || removedIds.includes(item.id)) {
        changed = true;
        return false;
      }
      return true;
    });

    const updated = filtered.map((item, idx) => {
      let newItem = item;
      if (item.id === 'nav-attorneys' || item.path === '/attorneys' || item.path === '/partners') {
        if (item.label !== 'PARTNERS') {
          changed = true;
          newItem = { ...item, label: 'PARTNERS' };
        }
      }
      if (newItem.order !== idx + 1) {
        changed = true;
        newItem = { ...newItem, order: idx + 1 };
      }
      return newItem;
    });

    if (changed) {
      this.save(DB_KEYS.NAVIGATION, updated);
    }
    return updated;
  }

  public saveNavigation(nav: MenuItem[]): void {
    this.save(DB_KEYS.NAVIGATION, nav);
    supabaseService.saveNavigation(nav).catch((e) => console.warn('Supabase saveNavigation:', e));
    this.logActivity('Updated Navigation Menu', 'Website', 'navigation', 'Modified website header navigation hierarchy');
  }

  // --- DATABASE RESET / BACKUP / RESTORE ---
  public resetToDefaults(): void {
    Object.values(DB_KEYS).forEach((k) => localStorage.removeItem(k));
    this.notify();
  }

  public exportBackupJson(): string {
    const backup: Record<string, any> = {};
    Object.entries(DB_KEYS).forEach(([name, key]) => {
      try {
        const data = localStorage.getItem(key);
        if (data) backup[name] = JSON.parse(data);
      } catch (e) {
        console.warn(`Export skip for ${name}:`, e);
      }
    });
    return JSON.stringify(backup, null, 2);
  }

  public exportDatabaseBackup(): string {
    return this.exportBackupJson();
  }

  public importBackupJson(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      Object.entries(DB_KEYS).forEach(([name, key]) => {
        if (!this.privateKeys.has(key) && parsed[name] !== undefined) {
          localStorage.setItem(key, JSON.stringify(parsed[name]));
        }
      });
      this.notify();
      return true;
    } catch (e) {
      console.error('Failed to import backup:', e);
      return false;
    }
  }

  public restoreDatabaseBackup(jsonStr: string): boolean {
    return this.importBackupJson(jsonStr);
  }
}

export const db = new DatabaseService();
