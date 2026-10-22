export interface HeroSection {
  title: string;
  subtitle: string;
  tagline: string;
  badgeText: string;
  description: string;
  primaryBtnText: string;
  primaryBtnLink: string;
  secondaryBtnText: string;
  secondaryBtnLink: string;
  profileImage: string;
  bannerImage: string;
  stats: {
    label: string;
    value: string;
    icon?: string;
  }[];
}

export interface AboutSection {
  badge: string;
  title: string;
  subtitle: string;
  bio: string[];
  experienceYears: string;
  completedProjects: string;
  happyClients: string;
  viewsGenerated: string;
  profileImage: string;
  signatureText: string;
  highlights: string[];
  resumeUrl: string;
}

export type VideoType = 'upload' | 'youtube' | 'vimeo' | 'loom' | 'direct_url';
export type VideoAspectRatio = '16:9' | '9:16' | '1:1';
export type PublishStatus = 'published' | 'draft' | 'hidden';

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  category: string;
  videoType: VideoType;
  videoUrl: string;
  thumbnailUrl: string;
  aspectRatio: VideoAspectRatio;
  duration?: string;
  clientName?: string;
  featured: boolean;
  order: number;
  status: PublishStatus;
  viewsCount?: string;
  tags: string[];
  createdAt: string;
}

export interface DesignItem {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  clientName?: string;
  featured: boolean;
  order: number;
  status: PublishStatus;
  tags: string[];
  createdAt: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category: 'Video Editing' | 'Motion Graphics' | 'Graphic Design' | 'Audio & Color' | 'Tools & Software';
  proficiency: number; // 0-100
  iconName: string;
  description: string;
  featured: boolean;
  order: number;
}

export type CurrencyCode = 'USD' | 'PKR' | 'GBP' | 'AED';

export interface ServicePrices {
  USD?: string;
  PKR?: string;
  GBP?: string;
  AED?: string;
}

export interface PricingSettings {
  defaultCurrency: CurrencyCode;
  enableCurrencySelector: boolean;
  ctaButtonText: string;
  ctaButtonLink: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  category: string;
  deliverables: string[];
  turnaroundTime: string;
  startingPrice: string; // Default display price
  prices?: ServicePrices;
  ctaText?: string;
  ctaLink?: string;
  isPublished?: boolean;
  featured: boolean;
  order: number;
}

export interface TestimonialItem {
  id: string;
  clientName: string;
  clientRole: string;
  clientCompany: string;
  clientAvatar: string;
  rating: number; // 1-5
  reviewText: string;
  projectType: string;
  order: number;
  isPublished: boolean;
  featured: boolean;
}

export type SectionLayout = 
  | 'grid'
  | 'slider'
  | 'carousel'
  | 'split-image-text'
  | 'cards'
  | 'before-after'
  | 'pricing-table'
  | 'faq-accordion'
  | 'stats-counter'
  | 'custom-blocks';

export interface ContentBlock {
  id: string;
  type: 'heading' | 'text' | 'image' | 'video' | 'button' | 'stat' | 'card' | 'badge';
  content: string;
  subcontent?: string;
  imageUrl?: string;
  videoUrl?: string;
  linkUrl?: string;
  badge?: string;
  width?: 'full' | 'half' | 'third';
}

export interface DynamicSection {
  id: string;
  key: string;
  title: string;
  subtitle: string;
  badge?: string;
  layoutType: SectionLayout;
  isEnabled: boolean;
  order: number;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  customData?: any;
  blocks: ContentBlock[];
}

export interface ThemeColors {
  bg: string;
  cardBg: string;
  text: string;
  textMuted: string;
  heading: string;
  accent: string;
  accentHover: string;
  border: string;
  btnBg?: string;
  btnText?: string;
}

export interface SectionColors {
  bg?: string;
  cardBg?: string;
  heading?: string;
  text?: string;
  muted?: string;
  accent?: string;
  border?: string;
  buttonBg?: string;
  buttonText?: string;
}

export type SectionKey =
  | 'hero'
  | 'videos'
  | 'designs'
  | 'skills'
  | 'services'
  | 'pricing'
  | 'about'
  | 'testimonials'
  | 'contact'
  | 'navbar'
  | 'footer';

export interface SectionAnimationSettings {
  enabled: boolean;
  type: 'none' | 'fade-in' | 'fade-up' | 'fade-down' | 'slide-left' | 'slide-right' | 'zoom-in' | 'stagger';
  duration?: number;
  delay?: number;
  hoverEffect?: boolean;
}

export interface ThemeSettings {
  defaultTheme: 'dark' | 'light' | 'system';
  allowThemeToggle: boolean;
  rememberPreference: boolean;
  activePreset?: string;
  darkColors: ThemeColors;
  lightColors: ThemeColors;
  sectionColors?: Partial<Record<SectionKey, SectionColors>>;
  sectionAnimations?: Partial<Record<SectionKey, SectionAnimationSettings>>;
  typography: {
    headingFont: string;
    bodyFont: string;
    baseFontSize: 'sm' | 'md' | 'lg';
  };
  buttonStyle: {
    rounded: 'none' | 'sm' | 'md' | 'lg' | 'full';
    shadow: boolean;
  };
  cardStyle: {
    rounded: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    borderStyle: 'none' | 'subtle' | 'glow';
  };
}

export interface NavigationSettings {
  logoType: 'text' | 'image' | 'both';
  logoText: string;
  logoSubtitle: string;
  logoImageUrl: string;
  menuItems: {
    id: string;
    label: string;
    href: string;
    isExternal: boolean;
    isVisible: boolean;
    order: number;
  }[];
  ctaButton: {
    label: string;
    href: string;
    isVisible: boolean;
  };
  footer: {
    tagline: string;
    copyrightText: string;
    showSocials: boolean;
    columns: {
      title: string;
      links: { label: string; url: string; isExternal?: boolean }[];
    }[];
  };
}

export interface ContactSettings {
  email: string;
  whatsappNumber: string;
  whatsappMessage: string;
  calendarLink: string;
  phone: string;
  location: string;
  workStatus: 'Available for freelance & full-time' | 'Booking for next month' | 'Available for selected projects';
  socialLinks: {
    platform: 'youtube' | 'instagram' | 'linkedin' | 'behance' | 'x' | 'tiktok' | 'fiverr' | 'upwork' | 'other';
    url: string;
    label: string;
    isVisible: boolean;
  }[];
}

export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  keywords: string[];
}

export interface SectionHeadings {
  videos?: {
    badge?: string;
    title?: string;
    subtitle?: string;
    reelsTitle?: string;
    reelsSubtitle?: string;
    longFormTitle?: string;
    longFormSubtitle?: string;
  };
  designs?: {
    badge?: string;
    title?: string;
    subtitle?: string;
  };
  skills?: {
    badge?: string;
    title?: string;
    subtitle?: string;
  };
  services?: {
    badge?: string;
    title?: string;
    subtitle?: string;
  };
  testimonials?: {
    badge?: string;
    title?: string;
    subtitle?: string;
  };
  about?: {
    badge?: string;
    title?: string;
    subtitle?: string;
  };
  contact?: {
    badge?: string;
    title?: string;
    subtitle?: string;
  };
}

export interface CloudStorageSettings {
  provider: 'auto' | 'cloudinary' | 'supabase' | 'server';
  cloudinaryCloudName?: string;
  cloudinaryUploadPreset?: string;
  cloudinaryApiKey?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseBucket?: string;
}

export interface WebsiteData {
  hero: HeroSection;
  about: AboutSection;
  videoCategories: string[];
  videos: VideoItem[];
  designCategories: string[];
  designs: DesignItem[];
  skills: SkillItem[];
  services: ServiceItem[];
  testimonials: TestimonialItem[];
  dynamicSections: DynamicSection[];
  theme: ThemeSettings;
  navigation: NavigationSettings;
  contact: ContactSettings;
  seo: SeoSettings;
  pricingSettings?: PricingSettings;
  sectionHeadings?: SectionHeadings;
  storageSettings?: CloudStorageSettings;
  lastUpdated: string;
}
