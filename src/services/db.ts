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
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.listeners.forEach((listener) => {
          try {
            listener();
          } catch (e) {
            console.error('Error in DB listener:', e);
          }
        });
      }, 0);
    } else {
      this.listeners.forEach((listener) => {
        try {
          listener();
        } catch (e) {
          console.error('Error in DB listener:', e);
        }
      });
    }
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
    if (changed && typeof window !== 'undefined') {
      try {
        localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(settings));
      } catch {}
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
    const bodyText =
      "The FIRM was founded by brothers Atty. Leo Anselmo L.V. Lalusis and Atty. Levy John L.V. Lalusis, under the guidance of their senior partner and uncle, Atty. Diosdado Anselmo Q. Lalusis, LPT.\n\n" +
      "The brothers Atty. Leo and Atty. Levy are the sons of the late Chief Danielito Q. Lalusis, who served the National Bureau of Investigation (NBI) with utmost integrity and excellence for almost 30 years prior to his untimely passing.\n\n" +
      "With their combined training and experience, the brothers, Atty. Leo and Atty. Levy bring proactive, adaptive, and client-centered legal representation tailored to each client's distinct needs and circumstances. Guided by the principle of LEGAL PRECISION, the firm delivers legal representation grounded in rigorous preparation and a steadfast commitment to achieving results that serve its clients' best interests.";

    const rawPages = this.load<Page[]>(DB_KEYS.PAGES, initialPages);
    let cleaned = false;
    const pages = rawPages.map((page) => {
      let mod = page;
      if (mod.id === 'page-home' || mod.slug === '') {
        const hero = mod.sections.find(s => s.id === 'sec-hero' || s.type === 'hero');
        const hasDuplicateIntro = mod.sections.some(s => s.id === 'sec-intro');
        const isNotExactBody = hero?.content?.body !== bodyText;
        const hasEyebrow = Boolean(hero?.content?.eyebrow);
        if (hero && (!hero.content?.body || hero.content?.subheadline || hasDuplicateIntro || isNotExactBody || hasEyebrow)) {
          cleaned = true;
          mod = {
            ...mod,
            sections: mod.sections
              .filter(s => s.id !== 'sec-intro')
              .map(s => {
                if (s.id === 'sec-hero' || s.type === 'hero') {
                  const { eyebrow, subheadline, ctaPrimaryText, ctaPrimaryLink, ctaSecondaryText, ctaSecondaryLink, ...restContent } = s.content || {};
                  return {
                    ...s,
                    content: {
                      ...restContent,
                      imageUrl: restContent.imageUrl || '/assets/founding-partners.jpg',
                      imageAlt: restContent.imageAlt || 'Lalusis & Partners Founding Partners',
                      imageCaption: restContent.imageCaption || 'Partners of Lalusis & Partners · Atty. Levy John L.V. Lalusis · Senior Partner Atty. Diosdado Anselmo Q. Lalusis · Atty. Leo Anselmo L.V. Lalusis',
                      body: bodyText,
                      introVideoUrl: restContent.introVideoUrl || '/videos/introduction.mp4',
                      introPosterUrl: restContent.introPosterUrl || '/videos/introduction.jpg',
                    },
                  };
                }
                return s;
              }),
          };
        }
      }
      if (mod.id === 'page-about' || mod.slug === 'about') {
        const aboutStory = mod.sections.find(s => s.id === 'sec-about-story' || (s.type === 'imageText' && s.title?.includes('Heritage')));
        if (aboutStory && aboutStory.content?.body !== bodyText) {
          cleaned = true;
          mod = {
            ...mod,
            sections: mod.sections.map(s => {
              if (s.id === 'sec-about-story' || (s.type === 'imageText' && s.title?.includes('Heritage'))) {
                return {
                  ...s,
                  content: {
                    ...s.content,
                    body: bodyText,
                  },
                };
              }
              return s;
            }),
          };
        }
      }
      if (mod.sections.some((s) => s.id === 'sec-stats' || (s.type === 'stats' && s.title === 'Firm Milestones'))) {
        cleaned = true;
        mod = {
          ...mod,
          sections: mod.sections.filter(
            (s) => s.id !== 'sec-stats' && !(s.type === 'stats' && s.title === 'Firm Milestones')
          ),
        };
      }
      // Remove unwanted sections: Why Choose Us (Ethos), Guiding Principles (Values), redundant hero headers, home contact-info, CTA banners, and about hero header
      const sectionsToHide = new Set([
        'sec-why-us',
        'sec-about-values',
        'sec-about-hero',
        'sec-attorneys-hero',
        'sec-pa-hero',
        'sec-contact-hero',
        'sec-contact-info',
        'sec-cta',
        'sec-attorneys-cta',
        'sec-pa-cta',
      ]);
      const shouldRemoveSection = (s: any) =>
        sectionsToHide.has(s.id) ||
        s.type === 'cta' ||
        s.content?.headline?.toLowerCase().includes('schedule') ||
        s.content?.heading?.toLowerCase().includes('schedule') ||
        s.content?.headline?.toLowerCase().includes('consult with our senior') ||
        s.content?.heading?.toLowerCase().includes('consult with our senior') ||
        s.content?.headline?.toLowerCase().includes('retain strategic counsel') ||
        s.content?.heading?.toLowerCase().includes('retain strategic counsel') ||
        s.content?.heading?.toLowerCase().includes('a legacy of strategic') ||
        s.content?.headline?.toLowerCase().includes('a legacy of strategic') ||
        s.content?.subheading?.toLowerCase().includes('founded in 1998') ||
        s.content?.subheadline?.toLowerCase().includes('founded in 1998') ||
        s.title?.toLowerCase().includes('about hero header');

      if (mod.sections.some(s => shouldRemoveSection(s))) {
        cleaned = true;
        mod = {
          ...mod,
          sections: mod.sections.filter(s => !shouldRemoveSection(s)),
        };
      }

      // Sanitize any residual imageEyebrow or imageCaption containing 'Institutional Standard' or 'Quezon City Legal Chambers'
      if (mod.sections.some(s =>
        s.content?.imageEyebrow?.toLowerCase().includes('institutional') ||
        s.content?.imageCaption?.toLowerCase().includes('quezon city legal chambers') ||
        s.content?.caption?.toLowerCase().includes('quezon city legal chambers')
      )) {
        cleaned = true;
        mod = {
          ...mod,
          sections: mod.sections.map(s => {
            if (s.content) {
              return {
                ...s,
                content: {
                  ...s.content,
                  imageEyebrow: s.content.imageEyebrow?.toLowerCase().includes('institutional') ? '' : s.content.imageEyebrow,
                  imageCaption: s.content.imageCaption?.toLowerCase().includes('quezon city legal chambers') ? '' : s.content.imageCaption,
                  caption: s.content.caption?.toLowerCase().includes('quezon city legal chambers') ? '' : s.content.caption,
                },
              };
            }
            return s;
          }),
        };
      }

      // Replace contact heading with Connect with Our Partners
      if (mod.sections.some(s =>
        s.id === 'sec-contact-main' &&
        (s.content?.headline !== 'Connect with Our Partners' || s.content?.heading !== 'Connect with Our Partners')
      )) {
        cleaned = true;
        mod = {
          ...mod,
          sections: mod.sections.map(s => {
            if (s.id === 'sec-contact-main') {
              return {
                ...s,
                content: {
                  ...s.content,
                  eyebrow: '',
                  headline: 'Connect with Our Partners',
                  heading: 'Connect with Our Partners',
                  subheadline: '',
                  subheading: '',
                },
              };
            }
            return s;
          }),
        };
      }

      // Remove all small gold eyebrows across all sections
      if (mod.sections.some(s => Boolean(s.content?.eyebrow))) {
        cleaned = true;
        mod = {
          ...mod,
          sections: mod.sections.map(s => ({
            ...s,
            content: {
              ...s.content,
              eyebrow: '',
            },
          })),
        };
      }

      // Clear boilerplate subtitles / descriptions across practice areas, attorneys, and contact
      const hasUnwantedSubtitles = mod.sections.some(s =>
        s.content?.description?.includes('cross-border') ||
        s.content?.subheadline?.includes('cross-border') ||
        s.content?.description?.includes('Fourteen dedicated') ||
        s.content?.description?.includes('Our partners blend specialized') ||
        s.content?.body?.includes('Schedule a confidential evaluation') ||
        s.content?.subheadline?.includes('Future Point Plaza Suites, Panay') ||
        s.content?.subheading?.includes('Future Point Plaza Suites, Panay') ||
        s.content?.subheading?.includes('Grand Tower') ||
        s.content?.subheading?.includes('Ayala') ||
        (s.id === 'sec-practices' && (s.content?.description || s.content?.subheadline)) ||
        (s.id === 'sec-contact-info' && (s.content?.subheading || s.content?.subheadline || s.subtitle)) ||
        (s.id === 'sec-attorneys-grid' && (s.content?.description || s.content?.subheadline)) ||
        (s.id === 'sec-attorneys-cta' && (s.content?.body || s.content?.subheadline)) ||
        (s.id === 'sec-pa-grid' && (s.content?.description || s.content?.subheadline)) ||
        (s.id === 'sec-pa-cta' && (s.content?.body || s.content?.subheadline)) ||
        (s.id === 'sec-contact-main' && (s.content?.subheadline || s.content?.subheading))
      );

      if (hasUnwantedSubtitles) {
        cleaned = true;
        mod = {
          ...mod,
          sections: mod.sections.map(s => {
            const isTarget =
              s.id === 'sec-practices' ||
              s.id === 'sec-contact-info' ||
              s.id === 'sec-attorneys-grid' ||
              s.id === 'sec-attorneys-cta' ||
              s.id === 'sec-pa-grid' ||
              s.id === 'sec-pa-cta' ||
              s.id === 'sec-contact-main' ||
              s.content?.description?.includes('cross-border') ||
              s.content?.subheadline?.includes('cross-border') ||
              s.content?.description?.includes('Fourteen dedicated') ||
              s.content?.description?.includes('Our partners blend specialized') ||
              s.content?.body?.includes('Schedule a confidential evaluation') ||
              s.content?.subheadline?.includes('Future Point Plaza Suites, Panay') ||
              s.content?.subheading?.includes('Future Point Plaza Suites, Panay') ||
              s.content?.subheading?.includes('Grand Tower') ||
              s.content?.subheading?.includes('Ayala');

            if (isTarget) {
              const { description, subheadline, subheading, body, ...restContent } = s.content || {};
              const nextContent: Record<string, any> = {
                ...restContent,
                description: '',
                subheadline: '',
                subheading: '',
              };
              if (s.id === 'sec-attorneys-cta' || s.id === 'sec-pa-cta' || s.content?.body?.includes('Schedule a confidential evaluation')) {
                nextContent.body = '';
              } else if (body !== undefined) {
                nextContent.body = body;
              }
              return {
                ...s,
                subtitle: '',
                content: nextContent,
              };
            }
            return s;
          }),
        };
      }
      return mod;
    });
    if (cleaned && typeof window !== 'undefined') {
      try {
        localStorage.setItem(DB_KEYS.PAGES, JSON.stringify(pages));
      } catch {}
    }
    const coreSlugs = new Set(['', 'home', 'about', 'attorneys', 'practice-areas', 'contact']);
    const normalize = (slug: string) => slug === 'home' ? '' : slug === 'partners' ? 'attorneys' : slug;
    const missing = initialPages.filter((page) => coreSlugs.has(page.slug) &&
      !pages.some((saved) => saved.id === page.id || normalize(saved.slug) === normalize(page.slug)));
    // Restore missing core routes only; never replace saved content or sections.
    // Replace the original sample clips in existing cloud/cache records too.
    // Explicitly selected custom videos remain editable and are preserved.
    const sampleNames = ['ForBiggerBlazes', 'BigBuckBunny', 'ElephantsDream'];
    const durations = ['00:16', '00:59', '00:34'];
    const legacyTitles = ["Decisive Trial Advocacy & Bureau Leadership","150+ Supreme Court Rulings & Appellate Advocacy","₱180B+ Transactions Advised & Tier 1 Practice"];
    return [...pages, ...structuredClone(missing)].map(page => ({
      ...page,
      sections: (page.sections || []).map(section => {
        if (!Array.isArray(section.content?.videos)) return section;
        return {...section, content: {...section.content, videos: section.content.videos.map((video: any) => {
          const index = sampleNames.findIndex(name => video.videoUrl === `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/${name}.mp4`);
          const updated = index < 0 ? video : {...video, videoUrl: `/videos/news-${index + 1}.mp4`, duration: durations[index]};
          const legacyIndex = legacyTitles.indexOf(updated.title);
          return legacyIndex < 0 ? updated : {...updated, title: `News Highlight ${legacyIndex + 1}`, subtitle: 'News & Public Affairs', tag: 'Highlights', description: 'Selected news and public affairs highlights.'};
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
    let list = this.load<Attorney[]>(DB_KEYS.ATTORNEYS, initialAttorneys);
    let changed = false;
    list = list.map((a) => {
      // Senior Partner Atty. Diosdado
      if (
        a.id === 'atty-3' ||
        a.slug?.toLowerCase().includes('diosdado') ||
        a.fullName?.toLowerCase().includes('diosdado')
      ) {
        const expected = 'SENIOR PARTNER · SENIOR ADVISORY COUNSEL & ADMINISTRATIVE LITIGANT';
        if (a.professionalTitle !== expected) {
          changed = true;
          return {
            ...a,
            professionalTitle: expected,
          };
        }
      }
      // Founding Partner Atty. Levy (with Litigant Lawyer)
      if (
        a.id === 'atty-2' ||
        a.slug?.toLowerCase().includes('levy') ||
        a.fullName?.toLowerCase().includes('levy')
      ) {
        const expected = 'Founding Partner · Corporate Regulatory Compliance, Tax & Real Estate, Litigant Lawyer';
        if (a.professionalTitle !== expected) {
          changed = true;
          return {
            ...a,
            professionalTitle: expected,
            primarySpecialization: a.primarySpecialization?.includes('Litigant Lawyer')
              ? a.primarySpecialization
              : 'Corporate Regulatory Compliance, Tax & Estate Planning, Real Estate & Housing, Litigant Lawyer, and Government Investigations',
          };
        }
      }
      // Founding Partner Atty. Leo (High-Profile Litigation & Criminal Defense)
      if (
        a.id === 'atty-1' ||
        a.slug?.toLowerCase().includes('leo') ||
        a.fullName?.toLowerCase().includes('leo')
      ) {
        const expected = 'Founding Partner · High-Profile Litigation & Criminal Defense';
        const expectedBio =
          'Atty. Leo Lalusis passed the Bar in 2019, the last traditional (handwritten) Bar Examination, in his first and only attempt. After being admitted to the Bar, he followed in his father\'s footsteps and joined the NBI as a Legal Officer. There, he was assigned to the Bureau’s Legal Division, specifically the Prosecution and High-Profile Cases Team, where he received several commendations for working on cases such as the sensational PNP-PDEA Shootout in 2021 and the investigation into the murder of Percival “Percy Lapid” Mabasa in 2022, among others. During his time with the NBI, he attended several investigative courses and was also tasked with representing the premier investigative agency in various Senate and House of Representatives hearings.\n\n' +
          'As a litigation lawyer, Atty. Leo is well experienced, having attended several high-profile cases before the Department of Justice (DOJ), the Office of the Ombudsman, and the Sandiganbayan.\n\n' +
          'Having compiled a portfolio of several high-profile cases, Atty. Leo has also represented clients before the Senate of the Philippines, among which includes the controversial probe on the Flood Control Scam conducted by the Senate Blue Ribbon Committee. This earned him the trust and confidence of several high-profile celebrities and social media influencers who continue to retain his services for delivering satisfactory representation.\n\n' +
          'With a desire to deepen his legal knowledge, Atty. Leo attended several legal trainings and certificate courses to keep abreast of the complexities of emerging fields of law and ensure that the client’s best interests are delivered. He became a Certified Data Protection Officer, certified by the University of the Philippines (UP) Open University in 2021, and is currently taking his Master of Laws (LL.M.) at the San Beda University Graduate School of Law, one of the youngest in his class.';

        if (
          a.professionalTitle !== expected ||
          a.primarySpecialization?.includes('Litigant Lawyer') ||
          a.biography !== expectedBio
        ) {
          changed = true;
          return {
            ...a,
            professionalTitle: expected,
            primarySpecialization:
              'High-Profile Criminal Defense, Congressional Inquiries, DOJ/Ombudsman/Sandiganbayan Advocacy, and Data Privacy',
            biography: expectedBio,
          };
        }
      }
      return a;
    });

    if (changed && typeof window !== 'undefined') {
      try {
        localStorage.setItem(DB_KEYS.ATTORNEYS, JSON.stringify(list));
      } catch {}
    }

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
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(DB_KEYS.PRACTICE_AREAS, JSON.stringify(list));
        } catch {}
      }
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

    // If it's a video asset, preserve video classification
    if (
      item.category === 'video' ||
      item.fileType === 'video' ||
      /\.(mp4|webm|mov|ogg)($|\?)/i.test(item.url || '') ||
      (item.url || '').includes('youtube.com') ||
      (item.url || '').includes('youtu.be') ||
      (item.url || '').includes('vimeo.com')
    ) {
      return {
        item: {
          ...item,
          fileType: 'video',
          category: 'video',
        },
        wasUpdated: item.fileType !== 'video' || item.category !== 'video',
      };
    }

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
    const list = this.load<MediaItem[]>(DB_KEYS.MEDIA, initialMedia);
    if (list.length > 0 && initialMedia.length > 0) {
      const hasAnyVideo = list.some((m) => m.category === 'video' || m.fileType === 'video');
      if (!hasAnyVideo) {
        const initialVideos = initialMedia.filter((m) => m.category === 'video' || m.fileType === 'video');
        if (initialVideos.length > 0) {
          const merged = [...initialVideos, ...list];
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(DB_KEYS.MEDIA, JSON.stringify(merged));
            } catch {}
          }
          return merged;
        }
      }
    }
    return list;
  }

  public getPopupVideos(): Array<{
    id: string;
    title: string;
    subtitle: string;
    description?: string;
    duration: string;
    tag: string;
    videoUrl: string;
    thumbnailUrl: string;
  }> {
    const defaultVideos = [
      {
        id: 'vid-1',
        title: 'Decisive Trial Advocacy & Bureau Leadership',
        subtitle: 'Atty. Leo Lalusis · Managing Partner',
        description:
          'Decades of seasoned trial litigation, landmark prosecution commendations, and high-profile public defense.',
        duration: '03:45',
        tag: 'Trial Eminence',
        videoUrl:
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
      },
      {
        id: 'vid-2',
        title: '150+ Supreme Court Rulings & Appellate Advocacy',
        subtitle: 'Senior Partner Atty. Diosdado Anselmo Lalusis',
        description:
          'Over 150 superior appellate rulings, landmark constitutional advocacy, and unmatched jurisprudential depth.',
        duration: '04:12',
        tag: 'Supreme Court Practice',
        videoUrl:
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200&q=80',
      },
      {
        id: 'vid-3',
        title: '₱180B+ Transactions Advised & Tier 1 Practice',
        subtitle: 'Atty. Levy John Lalusis · Partner & Tax Specialist',
        description:
          'Cross-border mergers and acquisitions, sovereign regulatory compliance, and premier corporate counsel.',
        duration: '03:18',
        tag: 'Corporate & M&A',
        videoUrl:
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      },
    ];

    const homePage = this.getPageBySlug('/') || this.getPageBySlug('home') || this.getPageById('page-home');
    if (!homePage) return defaultVideos;

    const heroSection = homePage.sections.find((s) => s.type === 'hero');
    if (!heroSection || !Array.isArray(heroSection.content?.videos) || heroSection.content.videos.length < 3) {
      return defaultVideos;
    }

    return heroSection.content.videos;
  }

  public async assignPopupVideo(
    slotIndex: 0 | 1 | 2,
    videoData: {
      title?: string;
      subtitle?: string;
      videoUrl: string;
      thumbnailUrl?: string;
      tag?: string;
      duration?: string;
      description?: string;
    }
  ): Promise<boolean> {
    const homePage = this.getPageBySlug('/') || this.getPageBySlug('home') || this.getPageById('page-home');
    if (!homePage) return false;

    const heroSection = homePage.sections.find((s) => s.type === 'hero');
    if (!heroSection) return false;

    const currentVideos =
      Array.isArray(heroSection.content.videos) && heroSection.content.videos.length >= 3
        ? [...heroSection.content.videos]
        : this.getPopupVideos();

    currentVideos[slotIndex] = {
      ...currentVideos[slotIndex],
      ...videoData,
      videoUrl: videoData.videoUrl,
      thumbnailUrl: videoData.thumbnailUrl || currentVideos[slotIndex].thumbnailUrl,
    };

    const updatedSections = homePage.sections.map((s) =>
      s.id === heroSection.id
        ? {
            ...s,
            content: {
              ...s.content,
              videos: currentVideos,
            },
          }
        : s
    );

    await this.savePage({ ...homePage, sections: updatedSections }, `Updated Popup Video ${slotIndex + 1}`);

    // Synchronize media list tags so assigned slot is clear
    const mediaList = this.getMedia();
    let hasMediaUpdates = false;
    const targetSlotNum = slotIndex + 1;
    const updatedMediaList = mediaList.map((m) => {
      if (m.url === videoData.videoUrl) {
        hasMediaUpdates = true;
        return { ...m, assignedPopupSlot: targetSlotNum, speaker: videoData.subtitle || m.speaker, tag: videoData.tag || m.tag };
      }
      if (m.assignedPopupSlot === targetSlotNum) {
        hasMediaUpdates = true;
        return { ...m, assignedPopupSlot: undefined };
      }
      return m;
    });

    if (hasMediaUpdates) {
      this.save(DB_KEYS.MEDIA, updatedMediaList);
    }

    this.notify();
    return true;
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
        thumbnailUrl: item.thumbnailUrl || existing.thumbnailUrl,
        duration: item.duration || existing.duration,
        assignedPopupSlot: item.assignedPopupSlot ?? existing.assignedPopupSlot,
        speaker: item.speaker || existing.speaker,
        tag: item.tag || existing.tag,
        description: item.description || existing.description,
        uploadedAt: new Date().toISOString(),
      };
      this.saveMedia(updatedItem);
      if (typeof item.assignedPopupSlot === 'number' && item.assignedPopupSlot >= 1 && item.assignedPopupSlot <= 3) {
        void this.assignPopupVideo((item.assignedPopupSlot - 1) as 0 | 1 | 2, {
          title: item.name,
          subtitle: item.speaker,
          videoUrl: item.url,
          thumbnailUrl: item.thumbnailUrl,
          tag: item.tag,
          duration: item.duration,
          description: item.description,
        });
      }
      return updatedItem;
    }

    const newItem: MediaItem = {
      id: item.id || `med-${Date.now()}`,
      name: item.name,
      url: item.url,
      fileType: item.fileType || (item.category === 'video' ? 'video' : 'image'),
      format: item.format || (item.category === 'video' ? 'MP4' : 'jpg'),
      sizeBytes: item.sizeBytes || 102400,
      size: item.size || 'optimized',
      category: item.category as any,
      altText: item.altText || item.name,
      thumbnailUrl: item.thumbnailUrl,
      duration: item.duration,
      assignedPopupSlot: item.assignedPopupSlot,
      speaker: item.speaker,
      tag: item.tag,
      description: item.description,
      createdAt: new Date().toISOString(),
      uploadedAt: new Date().toISOString(),
    };
    this.saveMedia(newItem);
    if (typeof item.assignedPopupSlot === 'number' && item.assignedPopupSlot >= 1 && item.assignedPopupSlot <= 3) {
      void this.assignPopupVideo((item.assignedPopupSlot - 1) as 0 | 1 | 2, {
        title: item.name,
        subtitle: item.speaker,
        videoUrl: item.url,
        thumbnailUrl: item.thumbnailUrl,
        tag: item.tag,
        duration: item.duration,
        description: item.description,
      });
    }
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

    if (changed && typeof window !== 'undefined') {
      try {
        localStorage.setItem(DB_KEYS.NAVIGATION, JSON.stringify(updated));
      } catch {}
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
