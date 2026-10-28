export type UserRole = 'member' | 'admin';
export type AccountStatus = 'active' | 'suspended';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  jobTitle?: string;
  company?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export type ResourceType = 'solution' | 'manual' | 'guide' | 'tutorial' | 'article' | 'project';
export type FileFormat = 'PDF' | 'DOCX' | 'XLSX' | 'TXT' | 'ZIP' | 'SCRIPT' | 'YAML' | 'JSON';
export type Visibility = 'public' | 'members_only';
export type PublicationStatus = 'published' | 'draft' | 'archived';

export interface Resource {
  id: string;
  title: string;
  shortDescription: string;
  content: string; // Markdown or formatted documentation/guide steps
  category: string;
  resourceType: ResourceType;
  tags: string[];
  fileName: string;
  fileType: FileFormat;
  fileSize: string;
  fileUrl?: string; // Firebase Storage URL or asset link
  fileData?: string; // Raw script/code/document content for direct client export
  version: string;
  author: string;
  thumbnailUrl?: string;
  visibility: Visibility;
  status: PublicationStatus;
  sourceUrl?: string;
  license?: string;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserBookmark {
  id?: string;
  resourceId: string;
  createdAt: string;
}

export interface UserDownload {
  id?: string;
  resourceId: string;
  resourceTitle: string;
  fileName: string;
  downloadedAt: string;
}

export interface PlatformModule {
  id: string;
  label: string;
  description: string;
  path: string;
  icon: string;
  enabled: boolean;
  order: number;
  showOnHome: boolean;
}

export interface PlatformStat {
  label: string;
  value: string;
  icon: string;
}

export interface PlatformTestimonial {
  author: string;
  role: string;
  company: string;
  quote: string;
  rating?: number;
}

export interface PlatformService {
  title: string;
  description: string;
  deliverables: string[];
  icon: string;
}

export interface SiteSettings {
  // Brand identity
  siteTitle: string;
  tagline: string;
  logoText: string;
  logoUrl?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  typography: string;
  themePreference: 'system' | 'light' | 'dark';
  footerText: string;

  // Expert / Consultant / Organization Profile
  expertName?: string;
  expertTitle?: string;
  expertBio?: string;
  expertAvatarUrl?: string;

  // Contact details
  contactEmail: string;
  contactPhone: string;
  contactLocation: string;
  socialLinks: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    youtube?: string;
  };

  // Homepage Hero & Sections
  heroHeading: string;
  heroSubheading: string;
  heroDescription: string;
  heroPrimaryBtnText: string;
  heroPrimaryBtnPath: string;
  heroSecondaryBtnText: string;
  heroSecondaryBtnPath: string;
  heroBackgroundStyle: 'navy-gradient' | 'cyber-grid' | 'minimalist';

  // Section visibility toggles
  showHero: boolean;
  showStats: boolean;
  showModules: boolean;
  showFeaturedResources: boolean;
  showServices: boolean;
  showTestimonials: boolean;
  showAboutExpert: boolean;
  showNewsletter: boolean;

  // Dynamic modules & lists
  modules: PlatformModule[];
  stats: PlatformStat[];
  testimonials: PlatformTestimonial[];
  services: PlatformService[];
  featuredResourceIds: string[];

  // General & Governance
  defaultLanguage: string;
  seoTitle: string;
  seoDescription: string;
  registrationEnabled: boolean;
  allowPublicDownloads: boolean;
  categories: string[];
  supportedResourceTypes: { id: ResourceType; label: string; enabled: boolean }[];
  updatedAt?: string;
}

export interface AuditLog {
  id?: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  performedBy: string;
  performedByUid: string;
  performedAt: string;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'replied' | 'archived';
  createdAt: string;
}

export * from './payment';

