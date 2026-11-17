import type {
  ContentItem,
  Language,
  LocalizedText,
  Role,
} from '../types';

export type AdminAction =
  | 'manage_posts'
  | 'manage_carousel'
  | 'edit_about'
  | 'manage_admins';

export function pickText(text: LocalizedText | undefined, lang: Language): string {
  if (!text) return '';
  return (lang === 'en' ? text.en || text.id : text.id || text.en).trim();
}

export function isRoleAuthorized(role: Role, action: AdminAction): boolean {
  if (role === 'super_admin') return true;
  if (role === 'admin') return action === 'manage_posts';
  return false;
}

export function resolveCarouselSlides(
  posts: ContentItem[],
  pinnedIds: string[],
  maxSlides = 6
): ContentItem[] {
  const byId: Record<string, ContentItem> = {};
  for (const post of posts) {
    byId[post.id] = post;
  }

  const seen: Record<string, boolean> = {};
  const slides: ContentItem[] = [];

  for (const id of pinnedIds) {
    const match = byId[id];
    if (match && !seen[id]) {
      slides.push(match);
      seen[id] = true;
    }
    if (slides.length >= maxSlides) break;
  }

  if (slides.length < maxSlides) {
    for (const post of posts) {
      if (!seen[post.id]) {
        slides.push(post);
        seen[post.id] = true;
      }
      if (slides.length >= maxSlides) break;
    }
  }

  return slides;
}

export function filterNewsPosts(
  posts: ContentItem[],
  query: string,
  categoryKey: string,
  lang: Language
): ContentItem[] {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedCategory = categoryKey.trim().toLowerCase();

  return posts.filter((post) => {
    const catId = post.category.id.toLowerCase();
    const catEn = post.category.en.toLowerCase();

    const matchesCategory =
      !normalizedCategory ||
      normalizedCategory === 'all' ||
      normalizedCategory === 'semua' ||
      catId === normalizedCategory ||
      catEn === normalizedCategory;

    if (!matchesCategory) return false;
    if (!normalizedQuery) return true;

    const haystack = [
      pickText(post.title, lang),
      pickText(post.excerpt, lang),
      pickText(post.body, lang),
      pickText(post.category, lang),
      post.author,
      post.location,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

export function validatePostInput(input: {
  titleId: string;
  excerptId: string;
  bodyId: string;
  categoryId: string;
  imageUrl: string;
}): string | null {
  if (!input.titleId.trim() || input.titleId.trim().length < 4) {
    return 'Judul minimal 4 karakter.';
  }
  if (!input.categoryId.trim()) {
    return 'Kategori wajib diisi.';
  }
  if (!input.excerptId.trim() || input.excerptId.trim().length < 10) {
    return 'Ringkasan minimal 10 karakter.';
  }
  if (!input.bodyId.trim() || input.bodyId.trim().length < 20) {
    return 'Konten lengkap minimal 20 karakter.';
  }
  if (!input.imageUrl.trim()) {
    return 'Gambar sampul wajib dipilih.';
  }
  return null;
}

export function validateAboutInput(input: {
  email: string;
  phone: string;
  lat: number;
  lng: number;
  profileId: string;
}): string | null {
  if (!input.profileId.trim() || input.profileId.trim().length < 20) {
    return 'Profil organisasi minimal 20 karakter.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(input.email.trim())) {
    return 'Format email kontak tidak valid.';
  }
  if (!input.phone.trim() || input.phone.trim().length < 6) {
    return 'Nomor telepon kontak tidak valid.';
  }
  if (!Number.isFinite(input.lat) || input.lat < -90 || input.lat > 90) {
    return 'Latitude harus berada di antara -90 dan 90.';
  }
  if (!Number.isFinite(input.lng) || input.lng < -180 || input.lng > 180) {
    return 'Longitude harus berada di antara -180 dan 180.';
  }
  return null;
}

export function validateAdminAccountInput(
  input: {
    name: string;
    email: string;
    password?: string;
    role: string;
  },
  existingEmails: string[]
): string | null {
  if (!input.name.trim() || input.name.trim().length < 2) {
    return 'Nama lengkap minimal 2 karakter.';
  }
  const email = input.email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Format email admin tidak valid.';
  }
  if (existingEmails.some((e) => e.toLowerCase() === email)) {
    return 'Email sudah terdaftar sebagai akun admin.';
  }
  if (input.password !== undefined && input.password.trim().length < 6) {
    return 'Kata sandi minimal 6 karakter.';
  }
  if (input.role !== 'admin' && input.role !== 'super_admin') {
    return 'Peran harus Admin atau Super Admin.';
  }
  return null;
}

export function validateCarouselSelection(
  selectedIds: string[],
  validPostIds: string[]
): string | null {
  if (selectedIds.length !== 6) {
    return 'Carousel beranda harus memiliki tepat 6 slide terpilih.';
  }
  const unique = new Set(selectedIds);
  if (unique.size !== 6) {
    return 'Setiap slide carousel harus berasal dari topik yang berbeda.';
  }
  const validSet = new Set(validPostIds);
  for (const id of selectedIds) {
    if (!validSet.has(id)) {
      return 'Terdapat topik carousel yang sudah tidak tersedia.';
    }
  }
  return null;
}

export function normalizeNewsletterEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateNewsletterEmail(
  email: string,
  lang: Language = 'id'
): string | null {
  const normalized = normalizeNewsletterEmail(email);
  if (!normalized) {
    return lang === 'en'
      ? 'Email address is required.'
      : 'Alamat email wajib diisi.';
  }
  if (normalized.length > 254) {
    return lang === 'en'
      ? 'Email address is too long.'
      : 'Alamat email terlalu panjang.';
  }
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
  if (!emailRegex.test(normalized)) {
    return lang === 'en'
      ? 'Please enter a valid email address.'
      : 'Format alamat email tidak valid.';
  }
  return null;
}

export function validateCampaignJoinInput(
  input: {
    name: string;
    email: string;
    amount: number;
  },
  lang: Language = 'id'
): string | null {
  if (!input.name.trim() || input.name.trim().length < 2) {
    return lang === 'en'
      ? 'Full name must be at least 2 characters.'
      : 'Nama lengkap minimal 2 karakter.';
  }
  const emailErr = validateNewsletterEmail(input.email, lang);
  if (emailErr) {
    return emailErr;
  }
  if (
    !Number.isFinite(input.amount) ||
    !Number.isInteger(input.amount) ||
    input.amount < 1 ||
    input.amount > 500
  ) {
    return lang === 'en'
      ? 'Contribution units must be a whole number between 1 and 500.'
      : 'Jumlah unit kontribusi harus bilangan bulat antara 1 hingga 500.';
  }
  return null;
}

export function formatNumber(value: number, lang: Language): string {
  return new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US').format(value);
}
