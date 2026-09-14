export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMINISTRATOR'
  | 'ATTORNEY'
  | 'EDITOR'
  | 'REVIEWER'
  | 'STAFF'
  | 'VIEWER';

export interface UserPermission {
  module:
    | 'articles'
    | 'attorneys'
    | 'practiceAreas'
    | 'pages'
    | 'faqs'
    | 'news'
    | 'consultations'
    | 'settings'
    | 'media'
    | 'users'
    | 'logs';
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canPublish: boolean;
  canDelete: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  title?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface FirmSettings {
  general: {
    firmName: string;
    tagline: string;
    headline: string;
    subheadline: string;
    logoUrl?: string;
    secondaryLogoUrl?: string;
    faviconUrl?: string;
    establishedYear: number;
  };
  contact: {
    address: string;
    suiteFloor: string;
    cityStateZip: string;
    country: string;
    telephone: string;
    emergencyLine?: string;
    fax?: string;
    email: string;
    consultationEmail: string;
    officeHoursWeekday: string;
    officeHoursWeekend: string;
    googleMapEmbedUrl: string;
  };
  social: {
    linkedin: string;
    facebook: string;
    twitter: string;
    barDirectory: string;
  };
  branding: {
    primaryAccent: string;
    secondaryAccent: string;
    backgroundColor: string;
    cardBackgroundColor: string;
    headingFont: string;
    bodyFont: string;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    socialPreviewImage: string;
    indexSite: boolean;
  };
  // Compatibility properties for simplified settings views
  firmName?: string;
  firmTagline?: string;
  foundedYear?: number;
  jurisdiction?: string;
  seoDefaults?: {
    metaTitle: string;
    metaDescription: string;
  };
  navigation?: MenuItem[];
}

export type SiteSettings = FirmSettings;

export interface ItemTypography {
  titleFontFamily?: 'cormorant' | 'cinzel' | 'sans' | 'playfair' | 'mono';
  titleFontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  titleColor?: 'gold' | 'champagne' | 'ivory' | 'muted' | 'white' | 'custom';
  titleCustomColor?: string;

  descFontFamily?: 'cormorant' | 'cinzel' | 'sans' | 'playfair' | 'mono';
  descFontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  descColor?: 'gold' | 'champagne' | 'ivory' | 'muted' | 'white' | 'custom';
  descCustomColor?: string;

  bodyFontFamily?: 'cormorant' | 'cinzel' | 'sans' | 'playfair' | 'mono';
  bodyFontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  bodyColor?: 'gold' | 'champagne' | 'ivory' | 'muted' | 'white' | 'custom';
  bodyCustomColor?: string;
}

export interface BlockTypography {
  fontFamily?: 'cormorant' | 'cinzel' | 'sans' | 'playfair' | 'mono';
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  alignment?: 'left' | 'center' | 'right' | 'justify';
  fontWeight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  letterSpacing?: 'tight' | 'normal' | 'wide' | 'widest' | 'monumental';
  isUppercase?: boolean;
  isItalic?: boolean;
  textColor?: 'gold' | 'champagne' | 'ivory' | 'muted' | 'gradient';
  customColor?: string;
  dropCap?: boolean;
}

export type SectionBlockType =
  | 'hero'
  | 'heading'
  | 'richText'
  | 'text'
  | 'container'
  | 'button'
  | 'video'
  | 'image'
  | 'imageText'
  | 'gallery'
  | 'stats'
  | 'attorneys'
  | 'practiceAreas'
  | 'articles'
  | 'news'
  | 'faq'
  | 'testimonials'
  | 'awards'
  | 'cta'
  | 'contactInfo'
  | 'contactForm'
  | 'consultationForm'
  | 'divider'
  | 'spacer';

export type SectionType = SectionBlockType;

export interface PageSection {
  id: string;
  type: SectionBlockType;
  title?: string;
  subtitle?: string;
  isVisible: boolean;
  order: number;
  content: Record<string, any>;
  background?: 'dark' | 'charcoal' | 'surface' | 'gold_tint';
  paddingY?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  typography?: BlockTypography;
  partTypography?: Record<string, BlockTypography>;
  customClasses?: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  template?: 'default' | 'editorial' | 'minimal' | 'fullwidth';
  sections: PageSection[];
  seoTitle?: string;
  seoDescription?: string;
  seo?: {
    metaTitle: string;
    metaDescription: string;
  };
  updatedAt: string;
  createdAt: string;
}

export interface PageVersion {
  id: string;
  pageId: string;
  versionNumber: number;
  modifiedBy: string;
  timestamp: string;
  changeSummary: string;
  sectionsSnapshot: PageSection[];
}

export interface Attorney {
  id: string;
  slug: string;
  fullName: string;
  professionalTitle: string;
  portraitUrl: string;
  primarySpecialization: string;
  biography: string;
  practiceAreaIds?: string[];
  education: string[];
  barAdmissions: string[];
  representativeMatters?: string[];
  professionalExperience?: string[];
  memberships?: string[];
  awards?: string[];
  selectedPublications?: string[];
  email: string;
  directPhone?: string;
  phone?: string;
  linkedinUrl?: string;
  isPartner?: boolean;
  isFeatured?: boolean;
  order?: number;
  displayOrder?: number;
  isPublished: boolean;
  typography?: ItemTypography;
}

export interface PracticeArea {
  id: string;
  slug: string;
  title: string;
  icon?: string;
  iconName?: string;
  shortDescription: string;
  fullDescription?: string;
  detailedDescription?: string;
  keyServices?: string[];
  featuredImage?: string;
  relatedAttorneyIds?: string[];
  faqs?: { question: string; answer: string }[];
  seoTitle?: string;
  seoDescription?: string;
  status: 'published' | 'draft' | 'archived';
  order: number;
  typography?: ItemTypography;
}

export type ArticleStatus =
  | 'draft'
  | 'for_review'
  | 'review'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'archived';

export interface ArticleVersion {
  versionNumber: number;
  editedAt: string;
  editedBy: string;
  title: string;
  content: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  featuredImage?: string;
  authorId?: string;
  authorName?: string;
  category:
    | 'Legal Insights'
    | 'Case Discussions'
    | 'Legal Updates'
    | 'Guides'
    | 'Commentaries'
    | 'Firm Publications'
    | 'Corporate Jurisprudence'
    | 'Constitutional Law'
    | 'Arbitration & Dispute Resolution'
    | 'Regulatory Circulars'
    | 'Banking & Finance'
    | string;
  tags: string[];
  excerpt: string;
  content: string;
  publishedAt: string;
  readTime?: string;
  readingTimeMinutes?: number;
  relatedAttorneyId?: string;
  relatedPracticeAreaId?: string;
  seoTitle?: string;
  metaDescription?: string;
  socialPreviewImage?: string;
  status: ArticleStatus;
  versions?: ArticleVersion[];
  createdAt: string;
  updatedAt: string;
  typography?: ItemTypography;
}

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  category:
    | 'announcement'
    | 'award'
    | 'event'
    | 'seminar'
    | 'partner'
    | 'community'
    | 'Chamber Announcement'
    | string;
  excerpt: string;
  content: string;
  date?: string;
  publishedDate?: string;
  publishedAt?: string;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  featuredImage?: string;
  typography?: ItemTypography;
}

export interface FAQCategory {
  id: string;
  name: string;
  order: number;
}

export interface FAQItem {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
  order: number;
  isPublished: boolean;
  typography?: ItemTypography;
}

export type ConsultationStatus =
  | 'new'
  | 'under_review'
  | 'conflict_cleared'
  | 'contacted'
  | 'scheduled'
  | 'retainer_sent'
  | 'completed'
  | 'declined'
  | 'closed';

export type ConsultationType = 'in_person' | 'online' | 'phone';

export interface ConsultationRequest {
  id: string;
  referenceNumber: string;
  fullName: string;
  email?: string;
  emailAddress?: string;
  phone?: string;
  contactNumber?: string;
  company?: string;
  practiceArea?: string;
  practiceAreaId?: string;
  urgencyLevel?: 'Immediate' | 'Standard' | 'Exploratory' | string;
  preferredDate?: string;
  preferredTime?: string;
  preferredTimeSlot?: string;
  preferredConsultationType?: ConsultationType;
  caseSummary?: string;
  briefConcern?: string;
  conflictCheckConsent?: boolean;
  privacyConsent?: boolean;
  status: ConsultationStatus;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  fullName: string;
  email?: string;
  emailAddress?: string;
  phone?: string;
  contactNumber?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  internalNotes?: string;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  fileType?: 'image' | 'document';
  format?: string;
  sizeBytes?: number;
  size?: string;
  category: 'branding' | 'attorneys' | 'offices' | 'insights' | 'general' | 'portrait' | 'architectural';
  altText: string;
  createdAt?: string;
  uploadedAt?: string;
}

export type MediaAsset = MediaItem;

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  isExternal?: boolean;
  isVisible?: boolean;
  order: number;
  children?: MenuItem[];
}

export type NavItem = MenuItem;

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  recordId?: string;
  details?: string;
  timestamp: string;
}
