import { supabase, isSupabaseConfigured, STORAGE_BUCKET } from '../lib/supabase';
import {
  FirmSettings,
  Attorney,
  PracticeArea,
  Article,
  NewsItem,
  ConsultationRequest,
  ContactMessage,
  MediaItem,
  MenuItem,
  Page,
} from '../types';

export interface UploadResult {
  url: string;
  storagePath: string;
  mediaItem: MediaItem;
}

export class SupabaseService {
  private isConfigured: boolean = isSupabaseConfigured;
  private isSchemaReady: boolean = false;
  private hasCheckedSchema: boolean = false;

  public getStatus() {
    const metaEnv = (import.meta as any).env || {};
    return {
      isConfigured: this.isConfigured,
      isSchemaReady: this.isSchemaReady,
      hasCheckedSchema: this.hasCheckedSchema,
      supabaseUrl: metaEnv.VITE_SUPABASE_URL || '',
    };
  }

  // Probe whether PostgreSQL tables are present in the Supabase schema cache
  public async checkSchemaReady(): Promise<boolean> {
    if (!this.isConfigured) {
      this.isSchemaReady = false;
      this.hasCheckedSchema = true;
      return false;
    }

    try {
      const { error } = await supabase.from('site_settings').select('id').limit(1);
      if (error) {
        if (
          error.code === 'PGRST205' ||
          error.message?.includes('schema cache') ||
          error.message?.includes('relation "public.site_settings" does not exist')
        ) {
          this.isSchemaReady = false;
          this.hasCheckedSchema = true;
          return false;
        }
        // Permission or empty check errors still mean the table exists
        if (error.code === 'PGRST116' || error.code === '42501') {
          this.isSchemaReady = true;
          this.hasCheckedSchema = true;
          return true;
        }
        this.isSchemaReady = false;
        this.hasCheckedSchema = true;
        return false;
      }

      this.isSchemaReady = true;
      this.hasCheckedSchema = true;
      return true;
    } catch {
      this.isSchemaReady = false;
      this.hasCheckedSchema = true;
      return false;
    }
  }

  // --- STORAGE: FILE UPLOAD & VALIDATION ---
  public async uploadMediaFile(
    file: File,
    options: {
      category?: 'portrait' | 'architectural' | 'branding' | 'general';
      customName?: string;
      altText?: string;
    } = {}
  ): Promise<UploadResult> {
    if (!this.isConfigured) {
      throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

    if (!this.isSchemaReady) {
      const ready = await this.checkSchemaReady();
      if (!ready) {
        throw new Error(
          'Supabase database tables are not yet created. Please run the SQL migration schema in your Supabase SQL Editor.'
        );
      }
    }

    // 1. Validation
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'application/pdf',
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      throw new Error(`Invalid file type: ${file.type}. Allowed: JPG, PNG, WEBP, GIF, SVG, PDF.`);
    }

    const maxSizeBytes = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSizeBytes) {
      throw new Error(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is 25MB.`);
    }

    // 2. Generate Collision-Proof Unique Storage Path
    const sanitizedName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '-')
      .replace(/-+/g, '-');
    const timestamp = Date.now();
    const uniqueId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID().slice(0, 8)
        : Math.random().toString(36).substring(2, 10);
    const storagePath = `uploads/${timestamp}-${uniqueId}-${sanitizedName}`;

    // 3. Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.warn('Supabase Storage Upload Warning:', uploadError.message);
      throw new Error(`Failed to upload to Supabase Storage: ${uploadError.message}`);
    }

    // 4. Retrieve Public CDN URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(uploadData.path);

    const publicUrl = urlData.publicUrl;

    // 5. Create PostgreSQL Media Record with Clean Title
    const cleanedFallback = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const isGenericLabel =
      !options.customName ||
      options.customName.toLowerCase().includes('picture file') ||
      options.customName.endsWith('*') ||
      options.customName.toLowerCase() === 'image' ||
      options.customName.toLowerCase() === 'photo';

    const resolvedName = !isGenericLabel ? options.customName! : cleanedFallback || 'Chamber Visual Asset';

    const mediaItem: MediaItem = {
      id: `med-${timestamp}`,
      name: resolvedName,
      url: publicUrl,
      fileType: file.type.startsWith('image/') ? 'image' : 'document',
      format: file.name.split('.').pop()?.toUpperCase() || 'FILE',
      sizeBytes: file.size,
      size: `${(file.size / 1024).toFixed(0)} KB`,
      category: options.category || 'general',
      altText: options.altText || resolvedName,
      createdAt: new Date().toISOString(),
      uploadedAt: new Date().toISOString(),
    };

    const { error: dbError } = await supabase.from('media').insert({
      id: mediaItem.id,
      name: mediaItem.name,
      filename: file.name,
      original_name: file.name,
      storage_path: uploadData.path,
      url: mediaItem.url,
      file_type: mediaItem.fileType,
      format: mediaItem.format,
      size_bytes: mediaItem.sizeBytes,
      size: mediaItem.size,
      category: mediaItem.category,
      alt_text: mediaItem.altText,
      created_at: mediaItem.createdAt,
      updated_at: mediaItem.uploadedAt,
    });

    if (dbError) {
      console.warn('Supabase Media Table Insert Warning:', dbError.message);
      await supabase.storage.from(STORAGE_BUCKET).remove([uploadData.path]);
      throw new Error(`Failed to record media in database: ${dbError.message}`);
    }

    return {
      url: publicUrl,
      storagePath: uploadData.path,
      mediaItem,
    };
  }

  // --- STORAGE: DELETE MEDIA ---
  public async deleteMedia(id: string, storagePath?: string): Promise<boolean> {
    if (!this.isConfigured || !this.isSchemaReady) return false;

    try {
      if (storagePath) {
        await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
      } else {
        const { data } = await supabase.from('media').select('storage_path').eq('id', id).maybeSingle();
        if (data?.storage_path) {
          await supabase.storage.from(STORAGE_BUCKET).remove([data.storage_path]);
        }
      }

      const { error } = await supabase.from('media').delete().eq('id', id);
      if (error) {
        if (error.code !== 'PGRST205') {
          console.warn('Failed to delete media from database:', error.message);
        }
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Error during media deletion:', e);
      return false;
    }
  }

  // --- STORAGE: SAVE / UPDATE MEDIA ITEM METADATA ---
  public async saveMedia(item: MediaItem): Promise<boolean> {
    if (!this.isConfigured || !this.isSchemaReady) return false;
    try {
      const { error } = await supabase.from('media').upsert({
        id: item.id,
        name: item.name,
        url: item.url,
        file_type: item.fileType || 'image',
        format: item.format || 'JPG',
        size_bytes: item.sizeBytes || 0,
        size: item.size || 'optimized',
        category: item.category || 'general',
        alt_text: item.altText || item.name,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        if (error.code === 'PGRST205') this.isSchemaReady = false;
        console.warn('Supabase saveMedia warning:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Error saving media to Supabase:', e);
      return false;
    }
  }

  // --- FETCH QUERIES (SINGLE SOURCE OF TRUTH) ---
  public async getMedia(): Promise<MediaItem[] | null> {
    if (!this.isConfigured || !this.isSchemaReady) return null;
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST205') this.isSchemaReady = false;
      return null;
    }

    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      url: row.url,
      fileType: row.file_type || 'image',
      format: row.format || 'JPG',
      sizeBytes: Number(row.size_bytes || 0),
      size: row.size || 'optimized',
      category: row.category || 'general',
      altText: row.alt_text || row.name,
      createdAt: row.created_at,
      uploadedAt: row.updated_at || row.created_at,
    }));
  }

  public async getSettings(): Promise<FirmSettings | null> {
    if (!this.isConfigured || !this.isSchemaReady) return null;
    const { data, error } = await supabase
      .from('site_settings')
      .select('settings')
      .eq('id', 'firm_settings')
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST205') this.isSchemaReady = false;
      return null;
    }
    return data?.settings || null;
  }

  public async saveSettings(settings: FirmSettings): Promise<boolean> {
    if (!this.isConfigured || !this.isSchemaReady) return false;
    const { error } = await supabase.from('site_settings').upsert({
      id: 'firm_settings',
      settings,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      if (error.code === 'PGRST205') {
        this.isSchemaReady = false;
        return false;
      }
      console.warn('Supabase saveSettings warning:', error.message);
      return false;
    }
    return true;
  }

  public async getPages(): Promise<Page[] | null> {
    if (!this.isConfigured || !this.isSchemaReady) return null;
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      if (error.code === 'PGRST205') this.isSchemaReady = false;
      return null;
    }

    return (data || []).map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      isPublished: row.is_published,
      seoTitle: row.meta_title,
      seoDescription: row.meta_description,
      sections: row.sections || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  public async savePage(page: Page): Promise<boolean> {
    if (!this.isConfigured || !this.isSchemaReady) return false;
    const { error } = await supabase.from('pages').upsert({
      id: page.id,
      slug: page.slug,
      title: page.title,
      is_published: page.isPublished,
      meta_title: page.seoTitle || page.seo?.metaTitle,
      meta_description: page.seoDescription || page.seo?.metaDescription,
      sections: page.sections,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      if (error.code === 'PGRST205') {
        this.isSchemaReady = false;
        return false;
      }
      console.warn('Supabase savePage warning:', error.message);
      return false;
    }
    return true;
  }

  public async getAttorneys(): Promise<Attorney[] | null> {
    if (!this.isConfigured || !this.isSchemaReady) return null;
    const { data, error } = await supabase
      .from('attorneys')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      if (error.code === 'PGRST205') this.isSchemaReady = false;
      return null;
    }

    return (data || []).map((row) => ({
      id: row.id,
      slug: row.slug,
      fullName: row.full_name,
      professionalTitle: row.professional_title,
      portraitUrl: row.portrait_url,
      primarySpecialization: row.primary_specialization,
      biography: row.biography,
      email: row.email,
      directPhone: row.direct_phone,
      linkedinUrl: row.linkedin_url,
      isPartner: row.is_partner,
      isFeatured: row.is_featured,
      isPublished: row.is_published,
      order: row.order_index,
      practiceAreaIds: row.practice_area_ids || [],
      education: row.education || [],
      barAdmissions: row.bar_admissions || [],
      professionalExperience: row.professional_experience || [],
      memberships: row.memberships || [],
      awards: row.awards || [],
      selectedPublications: row.selected_publications || [],
    }));
  }

  public async saveAttorney(attorney: Attorney): Promise<boolean> {
    if (!this.isConfigured || !this.isSchemaReady) return false;
    const { error } = await supabase.from('attorneys').upsert({
      id: attorney.id,
      slug: attorney.slug,
      full_name: attorney.fullName,
      professional_title: attorney.professionalTitle,
      portrait_url: attorney.portraitUrl,
      primary_specialization: attorney.primarySpecialization,
      biography: attorney.biography,
      email: attorney.email,
      direct_phone: attorney.directPhone,
      linkedin_url: attorney.linkedinUrl,
      is_partner: attorney.isPartner ?? true,
      is_featured: attorney.isFeatured ?? true,
      is_published: attorney.isPublished ?? true,
      order_index: attorney.order ?? 0,
      practice_area_ids: attorney.practiceAreaIds || [],
      education: attorney.education || [],
      bar_admissions: attorney.barAdmissions || [],
      professional_experience: attorney.professionalExperience || [],
      memberships: attorney.memberships || [],
      awards: attorney.awards || [],
      selected_publications: attorney.selectedPublications || [],
      updated_at: new Date().toISOString(),
    });
    if (error) {
      if (error.code === 'PGRST205') {
        this.isSchemaReady = false;
        return false;
      }
      console.warn('Supabase saveAttorney warning:', error.message);
      return false;
    }
    return true;
  }

  public async deleteAttorney(id: string): Promise<boolean> {
    if (!this.isConfigured || !this.isSchemaReady) return false;
    const { error } = await supabase.from('attorneys').delete().eq('id', id);
    return !error;
  }

  public async getPracticeAreas(): Promise<PracticeArea[] | null> {
    if (!this.isConfigured || !this.isSchemaReady) return null;
    const { data, error } = await supabase
      .from('practice_areas')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      if (error.code === 'PGRST205') this.isSchemaReady = false;
      return null;
    }

    return (data || []).map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      iconName: row.icon_name,
      shortDescription: row.short_description || '',
      fullDescription: row.full_description,
      keyServices: row.key_capabilities || [],
      status: (row.is_published ? 'published' : 'draft') as any,
      order: row.order_index || 0,
    }));
  }

  public async savePracticeArea(area: PracticeArea): Promise<boolean> {
    if (!this.isConfigured || !this.isSchemaReady) return false;
    const { error } = await supabase.from('practice_areas').upsert({
      id: area.id,
      slug: area.slug,
      title: area.title,
      icon_name: area.iconName,
      short_description: area.shortDescription,
      full_description: area.fullDescription,
      key_capabilities: area.keyServices || [],
      is_published: area.status === 'published',
      order_index: area.order ?? 0,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      if (error.code === 'PGRST205') this.isSchemaReady = false;
      return false;
    }
    return true;
  }

  public async deletePracticeArea(id: string): Promise<boolean> {
    if (!this.isConfigured || !this.isSchemaReady) return false;
    const { error } = await supabase.from('practice_areas').delete().eq('id', id);
    return !error;
  }

  public async getArticles(): Promise<Article[] | null> {
    if (!this.isConfigured || !this.isSchemaReady) return null;
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST205') this.isSchemaReady = false;
      return null;
    }
    return (data || []).map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt || '',
      content: row.content || '',
      readTime: row.reading_time || '5 min read',
      category: row.category || 'Legal Insights',
      publishedAt: row.published_at || row.created_at,
      authorName: row.author?.name,
      authorId: row.author?.id,
      status: row.status || 'published',
      featuredImage: row.featured_image,
      relatedPracticeAreaId: row.practice_area_id,
      tags: [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  public async saveArticle(art: Article): Promise<boolean> {
    if (!this.isConfigured || !this.isSchemaReady) return false;
    const { error } = await supabase.from('articles').upsert({
      id: art.id,
      slug: art.slug,
      title: art.title,
      excerpt: art.excerpt,
      content: art.content,
      reading_time: art.readTime,
      category: art.category,
      published_at: art.publishedAt,
      author: { id: art.authorId, name: art.authorName },
      status: art.status,
      featured_image: art.featuredImage,
      practice_area_id: art.relatedPracticeAreaId,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      if (error.code === 'PGRST205') this.isSchemaReady = false;
      return false;
    }
    return true;
  }

  public async deleteArticle(id: string): Promise<boolean> {
    if (!this.isConfigured || !this.isSchemaReady) return false;
    const { error } = await supabase.from('articles').delete().eq('id', id);
    return !error;
  }

  public async getNews(): Promise<NewsItem[] | null> {
    if (!this.isConfigured || !this.isSchemaReady) return null;
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST205') this.isSchemaReady = false;
      return null;
    }
    return (data || []).map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt || '',
      content: row.content || '',
      date: row.date,
      category: row.category || 'announcement',
      status: row.status || 'published',
      featuredImage: row.featured_image,
    }));
  }

  public async saveNews(news: NewsItem): Promise<boolean> {
    if (!this.isConfigured || !this.isSchemaReady) return false;
    const { error } = await supabase.from('news').upsert({
      id: news.id,
      slug: news.slug,
      title: news.title,
      excerpt: news.excerpt,
      content: news.content,
      date: news.date,
      category: news.category,
      status: news.status,
      featured_image: news.featuredImage,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      if (error.code === 'PGRST205') this.isSchemaReady = false;
      return false;
    }
    return true;
  }

  public async deleteNews(id: string): Promise<boolean> {
    if (!this.isConfigured || !this.isSchemaReady) return false;
    const { error } = await supabase.from('news').delete().eq('id', id);
    return !error;
  }

  public async getNavigation(): Promise<MenuItem[] | null> {
    if (!this.isConfigured || !this.isSchemaReady) return null;
    const { data, error } = await supabase
      .from('navigation')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      if (error.code === 'PGRST205') this.isSchemaReady = false;
      return null;
    }
    return (data || []).map((row) => ({
      id: row.id,
      label: row.label,
      path: row.path,
      isVisible: row.is_visible,
      order: row.order_index,
      children: row.children || [],
    }));
  }

  public async saveNavigation(items: MenuItem[]): Promise<boolean> {
    if (!this.isConfigured || !this.isSchemaReady) return false;
    try {
      await supabase.from('navigation').delete().neq('id', '___dummy___');
      const { error } = await supabase.from('navigation').insert(
        items.map((it, idx) => ({
          id: it.id,
          label: it.label,
          path: it.path,
          is_visible: it.isVisible,
          order_index: idx + 1,
          children: it.children || [],
          updated_at: new Date().toISOString(),
        }))
      );
      if (error) {
        if (error.code === 'PGRST205') this.isSchemaReady = false;
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  public async getConsultations(): Promise<ConsultationRequest[] | null> {
    if (!this.isConfigured || !this.isSchemaReady) return null;
    const { data, error } = await supabase
      .from('consultation_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST205') this.isSchemaReady = false;
      return null;
    }
    return (data || []).map((row) => ({
      id: row.id,
      referenceNumber: row.reference_number,
      fullName: row.full_name,
      emailAddress: row.email_address,
      contactNumber: row.contact_number,
      company: row.company_name,
      preferredConsultationType: row.preferred_consultation_type,
      practiceAreaId: row.practice_area_id,
      preferredDate: row.preferred_date,
      preferredTime: row.preferred_time,
      briefConcern: row.brief_concern,
      privacyConsent: row.privacy_consent,
      status: row.status,
      internalNotes: row.internal_notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  public async saveConsultation(req: ConsultationRequest): Promise<boolean> {
    if (!this.isConfigured || !this.isSchemaReady) return false;
    const { error } = await supabase.from('consultation_requests').upsert({
      id: req.id,
      reference_number: req.referenceNumber,
      full_name: req.fullName,
      email_address: req.emailAddress || req.email,
      contact_number: req.contactNumber || req.phone,
      company_name: req.company,
      preferred_consultation_type: req.preferredConsultationType || 'online',
      practice_area_id: req.practiceAreaId,
      preferred_date: req.preferredDate,
      preferred_time: req.preferredTime,
      brief_concern: req.briefConcern || req.caseSummary || 'General Legal Consultation',
      privacy_consent: req.privacyConsent ?? true,
      status: req.status,
      internal_notes: req.internalNotes,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      if (error.code === 'PGRST205') this.isSchemaReady = false;
      return false;
    }
    return !error;
  }

  public async getContactMessages(): Promise<ContactMessage[] | null> {
    if (!this.isConfigured || !this.isSchemaReady) return null;
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST205') this.isSchemaReady = false;
      return null;
    }
    return (data || []).map((row) => ({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      subject: row.subject,
      message: row.message,
      status: row.status,
      internalNotes: row.notes,
      createdAt: row.created_at,
    }));
  }

  public async saveContactMessage(msg: ContactMessage): Promise<boolean> {
    if (!this.isConfigured || !this.isSchemaReady) return false;
    const { error } = await supabase.from('contact_messages').upsert({
      id: msg.id,
      full_name: msg.fullName,
      email: msg.email || msg.emailAddress,
      phone: msg.phone || msg.contactNumber,
      subject: msg.subject,
      message: msg.message,
      status: msg.status,
      notes: msg.internalNotes,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      if (error.code === 'PGRST205') this.isSchemaReady = false;
      return false;
    }
    return !error;
  }

  // --- AUTOMATIC INITIAL DATA MIGRATION ---
  public async migrateInitialData(seed: {
    settings: FirmSettings;
    pages: Page[];
    attorneys: Attorney[];
    practiceAreas: PracticeArea[];
    articles: Article[];
    news: NewsItem[];
    media: MediaItem[];
    navigation: MenuItem[];
    consultations: ConsultationRequest[];
    messages: ContactMessage[];
  }): Promise<{ migrated: boolean; message: string }> {
    if (!this.isConfigured) {
      return { migrated: false, message: 'Supabase credentials not configured yet.' };
    }

    const ready = await this.checkSchemaReady();
    if (!ready) {
      return {
        migrated: false,
        message: 'PostgreSQL database tables not yet created in Supabase schema.',
      };
    }

    try {
      const { data: existingPages, error } = await supabase.from('pages').select('id').limit(1);
      if (error) {
        if (error.code === 'PGRST205') {
          this.isSchemaReady = false;
          return { migrated: false, message: 'Tables missing in schema cache.' };
        }
        return { migrated: false, message: error.message };
      }

      if (existingPages && existingPages.length > 0) {
        return { migrated: false, message: 'Supabase database already populated.' };
      }

      // Populate tables cleanly
      await this.saveSettings(seed.settings);

      for (const p of seed.pages) {
        await this.savePage(p);
      }

      for (const a of seed.attorneys) {
        await this.saveAttorney(a);
      }

      for (const pa of seed.practiceAreas) {
        await this.savePracticeArea(pa);
      }

      for (const art of seed.articles) {
        await this.saveArticle(art);
      }

      for (const n of seed.news) {
        await this.saveNews(n);
      }

      await this.saveNavigation(seed.navigation);

      for (const m of seed.media) {
        await supabase.from('media').upsert({
          id: m.id,
          name: m.name,
          url: m.url,
          file_type: m.fileType || 'image',
          format: m.format,
          size_bytes: m.sizeBytes || 10240,
          size: m.size,
          category: m.category,
          alt_text: m.altText,
          created_at: m.createdAt,
          updated_at: m.uploadedAt || m.createdAt,
        });
      }

      return { migrated: true, message: 'Successfully migrated initial data to Supabase.' };
    } catch (e: any) {
      return { migrated: false, message: e?.message || 'Migration failed' };
    }
  }

  // --- REALTIME SUBSCRIPTIONS ---
  public subscribeToRealtimeChanges(onUpdate: (table: string) => void): () => void {
    if (!this.isConfigured || !this.isSchemaReady) return () => {};

    try {
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          (payload) => {
            onUpdate(payload.table);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      return () => {};
    }
  }
}

export const supabaseService = new SupabaseService();
