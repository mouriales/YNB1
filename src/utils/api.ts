import type {
  AboutContent,
  AdminAccount,
  AppBootstrapData,
  AuthUser,
  ContentItem,
  ContentSection,
  Language,
} from '../types';

const TOKEN_STORAGE_KEY = 'ynb_auth_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors in restricted environments
  }
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export async function fetchConfig(): Promise<{ mapsApiKey: string }> {
  return apiFetch<{ mapsApiKey: string }>('/api/config');
}

export async function fetchBootstrap(): Promise<AppBootstrapData> {
  return apiFetch<AppBootstrapData>('/api/bootstrap');
}

export async function loginWithCredentials(
  email: string,
  password: string
): Promise<{ user: AuthUser; token: string; admins?: AdminAccount[] }> {
  const result = await apiFetch<{
    user: AuthUser;
    token: string;
    admins?: AdminAccount[];
  }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setStoredToken(result.token);
  return result;
}

export async function switchDemoRole(
  targetRole: 'public' | 'admin' | 'super_admin'
): Promise<{ user: AuthUser; token: string | null; admins?: AdminAccount[] }> {
  const result = await apiFetch<{
    user: AuthUser;
    token: string | null;
    admins?: AdminAccount[];
  }>('/api/auth/demo-switch', {
    method: 'POST',
    body: JSON.stringify({ targetRole }),
  });
  setStoredToken(result.token);
  return result;
}

export async function logoutSession(): Promise<void> {
  setStoredToken(null);
  await apiFetch('/api/auth/logout', { method: 'POST' });
}

export interface PostPayload {
  section: ContentSection;
  category: { id: string; en: string };
  title: { id: string; en: string };
  excerpt: { id: string; en: string };
  body: { id: string; en: string };
  imageUrl: string;
  author: string;
  location: string;
  publishedAt?: string;
  targetGoal?: number;
  currentProgress?: number;
  unitLabel?: { id: string; en: string };
  ctaLabel?: { id: string; en: string };
}

export async function createPost(payload: PostPayload): Promise<{ post: ContentItem }> {
  return apiFetch<{ post: ContentItem }>('/api/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updatePost(
  id: string,
  payload: Partial<PostPayload>
): Promise<{ post: ContentItem }> {
  return apiFetch<{ post: ContentItem }>(`/api/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deletePost(
  id: string
): Promise<{ deletedId: string; carouselIds: string[] }> {
  return apiFetch<{ deletedId: string; carouselIds: string[] }>(
    `/api/posts/${id}`,
    { method: 'DELETE' }
  );
}

export async function joinCampaign(
  id: string,
  payload: { name: string; email: string; amount: number }
): Promise<{ post: ContentItem }> {
  return apiFetch<{ post: ContentItem }>(`/api/campaigns/${id}/join`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAbout(
  payload: AboutContent
): Promise<{ about: AboutContent }> {
  return apiFetch<{ about: AboutContent }>('/api/about', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function updateCarousel(
  carouselIds: string[]
): Promise<{ carouselIds: string[] }> {
  return apiFetch<{ carouselIds: string[] }>('/api/carousel', {
    method: 'PUT',
    body: JSON.stringify({ carouselIds }),
  });
}

export async function createAdminAccount(payload: {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'super_admin';
}): Promise<{ admin: AdminAccount }> {
  return apiFetch<{ admin: AdminAccount }>('/api/admins', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminAccount(
  id: string
): Promise<{ deletedId: string }> {
  return apiFetch<{ deletedId: string }>(`/api/admins/${id}`, {
    method: 'DELETE',
  });
}

export async function subscribeNewsletter(
  email: string,
  lang: Language
): Promise<{ subscribed: boolean; alreadySubscribed: boolean; email: string }> {
  return apiFetch<{ subscribed: boolean; alreadySubscribed: boolean; email: string }>(
    '/api/newsletter',
    {
      method: 'POST',
      body: JSON.stringify({ email, lang }),
    }
  );
}
