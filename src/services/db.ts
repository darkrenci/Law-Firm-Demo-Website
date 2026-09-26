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
    this.logActivity('Updated Website Settings', 'Website Settings', 'settings', 'Saved full settings payload');
  }

  // --- PAGES & PAGE BUILDER ---
  public getPages(): Page[] {
    let pages = this.load<Page[]>(DB_KEYS.PAGES, initialPages);
    let changed = false;

    // Filter out removed pages: insights, news, faqs
    const removedPageSlugs = ['insights', 'news', 'faqs'];
    const removedPageIds = ['page-insights', 'page-news', 'page-faqs'];
    const originalLen = pages.length;
    pages = pages.filter((p) => !removedPageSlugs.includes(p.slug) && !removedPageIds.includes(p.id));
    if (pages.length !== originalLen) {
      changed = true;
    }

    // Ensure all defined pages exist in storage for live editing
    for (const defPage of initialPages) {
      const exists = pages.some((p) => p.id === defPage.id || p.slug === defPage.slug);
      if (!exists) {
        pages.push(defPage);
        changed = true;
      }
    }

    // Clean up home page sections: remove news, articles, and faq blocks
    const homePage = pages.find((p) => p.id === 'page-home' || p.slug === '');
    if (homePage && homePage.sections) {
      const sectionsBefore = homePage.sections.length;
      homePage.sections = homePage.sections.filter(
        (s) => !['news', 'articles', 'faq', 'faqs'].includes(s.type) && !['sec-news', 'sec-articles', 'sec-faqs'].includes(s.id)
      );
      if (homePage.sections.length !== sectionsBefore) {
        changed = true;
      }

      // Update partners section on home page to be positioned before Practice Areas
      let partnersSec = homePage.sections.find((s) => s.id === 'sec-partners' || s.id === 'sec-attorneys' || s.type === 'attorneys');
      const practicesSec = homePage.sections.find((s) => s.id === 'sec-practices' || s.type === 'practiceAreas');
      const whyUsSec = homePage.sections.find((s) => s.id === 'sec-why-us' || s.type === 'imageText');

      if (!partnersSec) {
        partnersSec = {
          id: 'sec-partners',
          type: 'attorneys',
          title: 'Featured Partners',
          subtitle: 'Leadership & Senior Counsel',
          isVisible: true,
          order: 3,
          content: {
            eyebrow: 'Partners',
            heading: 'Distinguished Partners',
            description: 'Under the guidance of senior leadership, our founding and senior partners direct high-stakes litigation, supreme court appeals, and complex corporate transactions with precision and discretion.',
            limit: 3,
          },
        };
        homePage.sections.push(partnersSec);
        changed = true;
      } else {
        partnersSec.id = 'sec-partners';
        partnersSec.order = 3;
        if (partnersSec.title !== 'Featured Partners') {
          partnersSec.title = 'Featured Partners';
          changed = true;
        }
        if (partnersSec.content) {
          if (partnersSec.content.limit !== 3) {
            partnersSec.content.limit = 3;
            changed = true;
          }
          if (partnersSec.content.heading !== 'Distinguished Partners') {
            partnersSec.content.heading = 'Distinguished Partners';
            changed = true;
          }
          if (partnersSec.content.eyebrow !== 'Partners') {
            partnersSec.content.eyebrow = 'Partners';
            changed = true;
          }
          if (!partnersSec.content.description || partnersSec.content.description.includes('Harvard')) {
            partnersSec.content.description = 'Under the guidance of senior leadership, our founding and senior partners direct high-stakes litigation, supreme court appeals, and complex corporate transactions with precision and discretion.';
            changed = true;
          }
        }
      }

      if (practicesSec && practicesSec.order !== 4) {
        practicesSec.order = 4;
        changed = true;
      }
      if (whyUsSec && whyUsSec.order !== 5) {
        whyUsSec.order = 5;
        changed = true;
      }

      // Ensure no duplicate attorney sections remain on home page
      const attorneySecs = homePage.sections.filter(s => s.type === 'attorneys');
      if (attorneySecs.length > 1) {
        homePage.sections = homePage.sections.filter(s => s.type !== 'attorneys' || s.id === 'sec-partners');
        changed = true;
      }
      homePage.sections.sort((a, b) => (a.order || 0) - (b.order || 0));

      // Update hero section headline to Legal Precision and replace badges with 3 embedded clickable videos
      const homeHeroSec = homePage.sections.find((s) => s.id === 'sec-hero' || s.type === 'hero');
      if (homeHeroSec && homeHeroSec.content) {
        if (!homeHeroSec.content.headline || homeHeroSec.content.headline.includes('Strategic Counsel')) {
          homeHeroSec.content.headline = 'Legal Precision.';
          changed = true;
        }
        // Remove old badges if present
        if (homeHeroSec.content.badge1Value || homeHeroSec.content.badge2Value) {
          delete homeHeroSec.content.badge1Value;
          delete homeHeroSec.content.badge1Label;
          delete homeHeroSec.content.badge2Value;
          delete homeHeroSec.content.badge2Label;
          delete homeHeroSec.content.badge3Value;
          delete homeHeroSec.content.badge3Label;
          delete homeHeroSec.content.badge4Value;
          delete homeHeroSec.content.badge4Label;
          changed = true;
        }
        // Add or ensure 3 embedded videos
        if (!homeHeroSec.content.videos || homeHeroSec.content.videos.length === 0) {
          homeHeroSec.content.videos = [
            {
              id: 'vid-1',
              title: 'Decisive Trial Advocacy & Bureau Leadership',
              subtitle: 'Atty. Leo Lalusis · Managing Partner',
              description: 'Decades of seasoned trial litigation, landmark prosecution commendations, and high-profile public defense.',
              duration: '03:45',
              tag: 'Trial Eminence',
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
              thumbnailUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
            },
            {
              id: 'vid-2',
              title: '150+ Supreme Court Rulings & Appellate Advocacy',
              subtitle: 'Senior Partner Atty. Diosdado Anselmo Lalusis',
              description: 'Over 150 superior appellate rulings, landmark constitutional advocacy, and unmatched jurisprudential depth.',
              duration: '04:12',
              tag: 'Supreme Court Practice',
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              thumbnailUrl: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200&q=80',
            },
            {
              id: 'vid-3',
              title: '₱180B+ Transactions Advised & Tier 1 Practice',
              subtitle: 'Atty. Levy John Lalusis · Partner & Tax Specialist',
              description: 'Cross-border mergers and acquisitions, sovereign regulatory compliance, and premier corporate counsel.',
              duration: '03:18',
              tag: 'Corporate & M&A',
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
              thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
            },
          ];
          changed = true;
        }
      }

      // Update institutional overview section: remove Institutional Heritage and Advocacy Defined per user brief, keep group picture and formatted paragraphs
      const introSec = homePage.sections.find((s) => s.id === 'sec-intro' || s.title?.includes('Introduction') || s.subtitle?.includes('Institutional Overview'));
      if (introSec && introSec.content) {
        if (introSec.content.eyebrow === 'Institutional Heritage' || introSec.content.eyebrow?.includes('Heritage')) {
          introSec.content.eyebrow = '';
          changed = true;
        }
        if (introSec.content.heading?.includes('Advocacy Defined') || introSec.content.heading?.includes('Advocacy')) {
          introSec.content.heading = '';
          changed = true;
        }
        if (introSec.content.stat1Number === '28+' || introSec.content.stat1Number) {
          delete introSec.content.stat1Number;
          delete introSec.content.stat1Label;
          delete introSec.content.stat2Number;
          delete introSec.content.stat2Label;
          delete introSec.content.stat3Number;
          delete introSec.content.stat3Label;
          changed = true;
        }
        if (!introSec.content.imageUrl || introSec.content.imageUrl === '/Group Picture.jpeg' || introSec.content.imageUrl === '/Group%20Picture.jpeg') {
          introSec.content.imageUrl = '/assets/group-picture.svg';
          changed = true;
        }
        if (
          !introSec.content.imageCaption ||
          introSec.content.imageCaption.includes('Left:') ||
          introSec.content.imageCaption.includes('Center:') ||
          introSec.content.imageCaption.includes('Right:') ||
          !introSec.content.imageCaption.includes('L.V.')
        ) {
          introSec.content.imageCaption = 'Founding Partners · Atty. Levy John L.V. Lalusis · Atty. Diosdado Anselmo Q. Lalusis · Atty. Leo Anselmo L.V. Lalusis';
          changed = true;
        }
        if (introSec.content.body && !introSec.content.body.includes('\n\n')) {
          introSec.content.body = "The FIRM is founded by Atty. Leo Lalusis and Atty. Levy John Lalusis, under the guidance of their senior partner, Atty. Diosdado Anselmo Lalusis. Brothers Lalusis, is the son of the late NBI Chief Danielito Q. Lalusis, who served the NBI for almost 30 years prior to his untimely passing.\n\nAtty. Leo Lalusis passed the Bar in 2019 (the last handwritten Bar Examination) in his only attempt. Upon passing, he entered the NBI as Legal Officer assigned in the Legal Division, specifically in Prosecution and High Profile Cases, where he received several commendations, including for the PNP-PDEA incident. During his stay with the NBI, he was also tasked to represent the bureau in various Senate and House of Representatives hearings and attended several specialized investigative courses. Atty. Leo is also a certified Data Protection Officer (UP Open University, 2023) and has handled high-profile cases before the DOJ and Sandiganbayan. He has represented prominent clients in congressional hearings, including the landmark Senate Blue Ribbon Committee hearings in flood control cases, as well as leading public figures and influencers. To further broaden his jurisprudential acumen, he is one of the youngest Master of Laws candidates in the Graduate School of San Beda University.\n\nMeanwhile, Atty. Levy John Lalusis passed the 2024 Bar Examination. Prior to his admission to the bar, he served with distinguished government bodies, specifically within the Presidential Anti-Corruption Commission (PACC) as a graft investigator and the Department of Transportation (DOTr). Atty. Levy is a certified Tax Specialist with multiple accreditations. Alongside his brother Atty. Leo, he has appeared before the Sandiganbayan representing high-profile institutional and private clients in contentious matters.\n\nOn the other hand, Atty. Diosdado Anselmo Lalusis is a seasoned and veteran lawyer who headed the Professional Regulation Commission (PRC) Legal Division for more than a decade. Atty. Diosdado brings seasoned appellate advocacy, exemplary institutional integrity, and foundational legal mentorship to the firm's sovereign and corporate clientele.";
          changed = true;
        }
      }
    }

    // Update any page seo title or hero headline with Strategic Counsel to Legal Precision
    for (const p of pages) {
      if (p.seoTitle && p.seoTitle.includes('Strategic Counsel')) {
        p.seoTitle = p.seoTitle.replace('Strategic Counsel', 'Legal Precision');
        changed = true;
      }
      if (p.sections) {
        for (const s of p.sections) {
          if (s.type === 'hero' && s.content && s.content.headline && s.content.headline.includes('Strategic Counsel')) {
            s.content.headline = 'Legal Precision.';
            changed = true;
          }
          if (s.content && typeof s.content === 'object') {
            for (const key of Object.keys(s.content)) {
              const val = (s.content as any)[key];
              if (typeof val === 'string' && (/Left:\s*/i.test(val) || /Center:\s*/i.test(val) || /Right:\s*/i.test(val))) {
                (s.content as any)[key] = val
                  .replace(/Left:\s*/gi, '')
                  .replace(/Center:\s*/gi, '')
                  .replace(/Right:\s*/gi, '');
                changed = true;
              }
            }
          }
        }
      }
    }

    // Update page-attorneys title to Partners
    const attorneysPage = pages.find((p) => p.id === 'page-attorneys' || p.slug === 'attorneys');
    if (attorneysPage) {
      if (attorneysPage.title !== 'Partners') {
        attorneysPage.title = 'Partners';
        changed = true;
      }
      if (attorneysPage.seoTitle !== 'Distinguished Partners | Lalusis & Partners') {
        attorneysPage.seoTitle = 'Distinguished Partners | Lalusis & Partners';
        changed = true;
      }
      if (attorneysPage.sections) {
        const heroSec = attorneysPage.sections.find((s) => s.id === 'sec-attorneys-hero' || s.type === 'heading');
        if (heroSec && heroSec.content && heroSec.content.heading !== 'Partners') {
          heroSec.content.heading = 'Partners';
          changed = true;
        }
        const gridSec = attorneysPage.sections.find((s) => s.id === 'sec-attorneys-grid' || s.type === 'attorneys');
        if (gridSec) {
          if (gridSec.title !== 'Partners Directory') {
            gridSec.title = 'Partners Directory';
            changed = true;
          }
          if (gridSec.content && gridSec.content.heading !== 'Partners') {
            gridSec.content.heading = 'Partners';
            changed = true;
          }
        }
      }
    }

    // Ensure home page sec-practices has limit 14
    if (homePage) {
      const practiceSec = homePage.sections?.find((s) => s.id === 'sec-practices' || s.type === 'practiceAreas');
      if (practiceSec && practiceSec.content) {
        if (!practiceSec.content.limit || practiceSec.content.limit < 14) {
          practiceSec.content.limit = 14;
          changed = true;
        }
        if (!practiceSec.content.heading || practiceSec.content.heading === 'Practice Areas') {
          practiceSec.content.heading = 'Comprehensive Capabilities across Disciplines';
          changed = true;
        }
      }
    }

    if (changed) {
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
    let list = this.load<Attorney[]>(DB_KEYS.ATTORNEYS, initialAttorneys);

    // Keep the authentic 3 Lalusis partners synchronized with the latest credentials, biographies, and contact details
    const initMap = new Map(initialAttorneys.map((a) => [a.id, a]));
    const synchronized: Attorney[] = initialAttorneys.map((initAtty) => {
      const existing = list.find((a) => a.id === initAtty.id);
      return existing
        ? {
            ...initAtty,
            isPublished: existing.isPublished ?? initAtty.isPublished,
            isPartner: true,
            isFeatured: true,
          }
        : initAtty;
    });

    const isDifferent =
      list.length !== synchronized.length ||
      list.some(
        (a, i) =>
          a.id !== synchronized[i]?.id ||
          a.fullName !== synchronized[i]?.fullName ||
          a.biography !== synchronized[i]?.biography ||
          a.email !== synchronized[i]?.email
      );

    if (isDifferent) {
      list = synchronized;
      this.save(DB_KEYS.ATTORNEYS, list);
    }

    if (includeUnpublished) return list;
    return list.filter((a) => a.isPublished);
  }

  public getAttorneyBySlug(slug: string): Attorney | undefined {
    if (!slug) return undefined;
    const clean = decodeURIComponent(slug).toLowerCase().trim();
    return this.getAttorneys(true).find(
      (a) => a.slug?.toLowerCase() === clean || a.id.toLowerCase() === clean
    );
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
    const nav = this.load<MenuItem[]>(DB_KEYS.NAVIGATION, initialNavigation);
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
