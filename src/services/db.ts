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
  initialConsultations,
  initialContactMessages,
  initialMedia,
  initialNavigation,
  initialUsers,
  initialActivityLogs,
  initialPages,
} from './seedData';

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

  private load<T>(key: string, defaultValue: T): T {
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
  public getUsers(): User[] {
    return this.load<User[]>(DB_KEYS.USERS, initialUsers);
  }

  public getCurrentUser(): User {
    const users = this.getUsers();
    const curId = this.load<string>(DB_KEYS.CURRENT_USER_ID, users[0]?.id || 'usr-1');
    const user = users.find((u) => u.id === curId);
    return user || users[0];
  }

  public setCurrentUser(userId: string): void {
    this.save(DB_KEYS.CURRENT_USER_ID, userId);
    this.logActivity('Switched Active User Role', 'Administration', userId, `User active context changed to ${userId}`);
  }

  public saveUser(user: User): void {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    let updated: User[];
    if (idx >= 0) {
      updated = [...users];
      updated[idx] = user;
    } else {
      updated = [user, ...users];
    }
    this.save(DB_KEYS.USERS, updated);
    this.logActivity(idx >= 0 ? 'Updated User' : 'Created User', 'Users', user.id, `User: ${user.name} (${user.role})`);
  }

  // --- ACTIVITY LOGS ---
  public getActivityLogs(): ActivityLog[] {
    return this.load<ActivityLog[]>(DB_KEYS.ACTIVITY_LOGS, initialActivityLogs);
  }

  public logActivity(action: string, module: string, recordId?: string, details?: string): void {
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
    return this.load<FirmSettings>(DB_KEYS.SETTINGS, initialSettings);
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
    this.logActivity('Updated Website Settings', 'Website Settings', 'settings', 'Saved full settings payload');
  }

  // --- PAGES & PAGE BUILDER ---
  public getPages(): Page[] {
    const pages = this.load<Page[]>(DB_KEYS.PAGES, initialPages);
    const homePage = pages.find((p) => p.id === 'page-home' || p.slug === '');
    if (homePage && (!homePage.sections || !homePage.sections.some((s) => s.type === 'news'))) {
      const newsSection: PageSection = {
        id: 'sec-news',
        type: 'news',
        title: 'Firm Announcements',
        subtitle: 'Latest Developments',
        isVisible: true,
        order: (homePage.sections?.length || 0) + 1,
        content: {
          eyebrow: 'Latest Dispatches',
          headline: 'Official Dispatches & Announcements',
          limit: 3,
          categoryFilter: 'all',
        },
      };
      homePage.sections = [...(homePage.sections || []), newsSection];
      this.save(DB_KEYS.PAGES, pages);
    }
    return pages;
  }

  public getPageBySlug(slug: string): Page | undefined {
    const normalized = slug === '/' ? '' : slug.replace(/^\//, '');
    return this.getPages().find((p) => p.slug === normalized);
  }

  public getPageById(id: string): Page | undefined {
    return this.getPages().find((p) => p.id === id);
  }

  public savePage(page: Page, summary: string = 'Updated page content'): void {
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

  public duplicatePage(id: string): Page | null {
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
    this.savePage(newPage, 'Duplicated from existing page');
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
  public addSection(pageId: string, section: Omit<PageSection, 'id' | 'order'>): PageSection | null {
    const page = this.getPageById(pageId);
    if (!page) return null;
    const newOrder = page.sections.length > 0 ? Math.max(...page.sections.map((s) => s.order)) + 1 : 1;
    const newSection: PageSection = {
      ...section,
      id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      order: newOrder,
    };
    page.sections.push(newSection);
    this.savePage(page, `Added ${section.type} section`);
    return newSection;
  }

  public updateSection(pageId: string, sectionId: string, updates: Partial<PageSection>): boolean {
    const page = this.getPageById(pageId);
    if (!page) return false;
    const idx = page.sections.findIndex((s) => s.id === sectionId);
    if (idx === -1) return false;
    page.sections[idx] = {
      ...page.sections[idx],
      ...updates,
      content: { ...page.sections[idx].content, ...(updates.content || {}) },
    };
    this.savePage(page, `Edited section: ${page.sections[idx].title || page.sections[idx].type}`);
    return true;
  }

  public deleteSection(pageId: string, sectionId: string): boolean {
    const page = this.getPageById(pageId);
    if (!page) return false;
    page.sections = page.sections.filter((s) => s.id !== sectionId);
    this.savePage(page, 'Deleted section');
    return true;
  }

  public reorderSections(pageId: string, newOrderedIds: string[]): boolean {
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
    this.savePage(page, 'Reordered sections');
    return true;
  }

  public duplicateSection(pageId: string, sectionId: string): PageSection | null {
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
    this.savePage(page, `Duplicated section: ${original.title || original.type}`);
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

  public restorePageVersion(pageId: string, versionId: string): boolean {
    const page = this.getPageById(pageId);
    if (!page) return false;
    const allVersions = this.load<PageVersion[]>(DB_KEYS.PAGE_VERSIONS, []);
    const target = allVersions.find((v) => v.id === versionId && v.pageId === pageId);
    if (!target) return false;
    page.sections = JSON.parse(JSON.stringify(target.sectionsSnapshot));
    this.savePage(page, `Restored to Version ${target.versionNumber}`);
    this.logActivity('Restored Page Version', 'Page Builder', pageId, `Restored to Version ${target.versionNumber}`);
    return true;
  }

  // --- ATTORNEYS ---
  public getAttorneys(includeUnpublished: boolean = true): Attorney[] {
    const list = this.load<Attorney[]>(DB_KEYS.ATTORNEYS, initialAttorneys);
    if (includeUnpublished) return list;
    return list.filter((a) => a.isPublished);
  }

  public getAttorneyBySlug(slug: string): Attorney | undefined {
    return this.getAttorneys(true).find((a) => a.slug === slug);
  }

  public saveAttorney(attorney: Attorney): void {
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
    this.logActivity('Deleted Attorney', 'Attorneys', id, `Deleted attorney with ID: ${id}`);
    return true;
  }

  // --- PRACTICE AREAS ---
  public getPracticeAreas(includeDrafts: boolean = true): PracticeArea[] {
    const list = this.load<PracticeArea[]>(DB_KEYS.PRACTICE_AREAS, initialPracticeAreas);
    if (includeDrafts) return list;
    return list.filter((pa) => pa.status === 'published');
  }

  public getPracticeAreaBySlug(slug: string): PracticeArea | undefined {
    return this.getPracticeAreas(true).find((pa) => pa.slug === slug);
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
    this.logActivity(idx >= 0 ? 'Updated Practice Area' : 'Created Practice Area', 'Practice Areas', area.id, `Practice Area: ${area.title}`);
  }

  public deletePracticeArea(id: string): boolean {
    const list = this.getPracticeAreas(true);
    const filtered = list.filter((pa) => pa.id !== id);
    this.save(DB_KEYS.PRACTICE_AREAS, filtered);
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
    return this.getArticles(true).find((a) => a.slug === slug);
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
    return this.getNews(true).find((n) => n.slug === slug);
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
    this.logActivity(idx >= 0 ? 'Updated News' : 'Created News', 'News', news.id, `News: ${news.title}`);
  }

  public deleteNews(id: string): boolean {
    const list = this.getNews(true);
    const filtered = list.filter((n) => n.id !== id);
    this.save(DB_KEYS.NEWS, filtered);
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
    return this.load<ConsultationRequest[]>(DB_KEYS.CONSULTATIONS, initialConsultations);
  }

  public createConsultationRequest(
    data: Omit<ConsultationRequest, 'id' | 'referenceNumber' | 'status' | 'internalNotes' | 'createdAt' | 'updatedAt'>
  ): ConsultationRequest {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const now = new Date().toISOString();
    const req: ConsultationRequest = {
      ...data,
      id: `cr-${Date.now()}`,
      referenceNumber: `LP-${new Date().getFullYear()}-${randomSuffix}`,
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
    return this.load<ContactMessage[]>(DB_KEYS.MESSAGES, initialContactMessages);
  }

  public createContactMessage(
    data: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>
  ): ContactMessage {
    const msg: ContactMessage = {
      ...data,
      id: `msg-${Date.now()}`,
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
  public getMedia(): MediaItem[] {
    return this.load<MediaItem[]>(DB_KEYS.MEDIA, initialMedia);
  }

  public addMedia(item: Omit<MediaItem, 'id' | 'createdAt'> & { id?: string }): MediaItem {
    const newItem: MediaItem = {
      id: item.id || `med-${Date.now()}`,
      name: item.name,
      url: item.url,
      fileType: item.fileType || 'image',
      format: item.format || 'jpg',
      sizeBytes: item.sizeBytes || 102400,
      size: item.size || 'optimized',
      category: item.category as any,
      altText: item.altText,
      createdAt: new Date().toISOString(),
      uploadedAt: new Date().toISOString(),
    };
    this.saveMedia(newItem);
    return newItem;
  }

  public saveMedia(item: MediaItem): void {
    const list = this.getMedia();
    const idx = list.findIndex((m) => m.id === item.id);
    let updated: MediaItem[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = item;
    } else {
      updated = [item, ...list];
    }
    this.save(DB_KEYS.MEDIA, updated);
    this.logActivity(idx >= 0 ? 'Updated Media Item' : 'Uploaded Media Item', 'Media', item.id, `Media: ${item.name}`);
  }

  public deleteMedia(id: string): boolean {
    const list = this.getMedia();
    const filtered = list.filter((m) => m.id !== id);
    this.save(DB_KEYS.MEDIA, filtered);
    this.logActivity('Deleted Media Item', 'Media', id, `Deleted media item: ${id}`);
    return true;
  }

  // --- NAVIGATION ---
  public getNavigation(): MenuItem[] {
    return this.load<MenuItem[]>(DB_KEYS.NAVIGATION, initialNavigation);
  }

  public saveNavigation(nav: MenuItem[]): void {
    this.save(DB_KEYS.NAVIGATION, nav);
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
        if (parsed[name] !== undefined) {
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
