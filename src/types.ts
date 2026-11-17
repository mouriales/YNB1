export type Role = 'public' | 'admin' | 'super_admin';

export type Language = 'id' | 'en';

export type PageId =
  | 'beranda'
  | 'tentang'
  | 'fokus'
  | 'konservasi'
  | 'kabar'
  | 'dashboard';

export type ContentSection = 'fokus' | 'konservasi' | 'kabar';

export interface LocalizedText {
  id: string;
  en: string;
}

export interface ContentItem {
  id: string;
  section: ContentSection;
  category: LocalizedText;
  title: LocalizedText;
  excerpt: LocalizedText;
  body: LocalizedText;
  imageUrl: string;
  publishedAt: string;
  author: string;
  location: string;
  targetGoal?: number;
  currentProgress?: number;
  unitLabel?: LocalizedText;
  ctaLabel?: LocalizedText;
}

export interface AboutContent {
  profile: LocalizedText;
  vision: LocalizedText;
  mission: LocalizedText[];
  email: string;
  phone: string;
  address: LocalizedText;
  officeName: string;
  lat: number;
  lng: number;
  instagram: string;
  linkedin: string;
  youtube: string;
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AppBootstrapData {
  posts: ContentItem[];
  carouselIds: string[];
  about: AboutContent;
  admins?: AdminAccount[];
  currentUser: AuthUser;
}

export interface ImagePreset {
  id: string;
  label: LocalizedText;
  url: string;
}
