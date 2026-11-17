import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import crypto from 'node:crypto';
import type {
  AboutContent,
  AdminAccount,
  AuthUser,
  ContentItem,
  ContentSection,
} from './src/types.ts';
import {
  isRoleAuthorized,
  normalizeNewsletterEmail,
  validateAboutInput,
  validateAdminAccountInput,
  validateCampaignJoinInput,
  validateCarouselSelection,
  validateNewsletterEmail,
  validatePostInput,
} from './src/utils/cmsLogic.ts';
import {
  hashPassword,
  signAuthToken,
  verifyAuthToken,
  verifyPassword,
} from './server/auth.ts';
import { loadDatabase, saveDatabase } from './server/store.ts';

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_VISITOR: AuthUser = {
  id: 'public-visitor',
  name: 'Pengunjung Publik',
  email: '',
  role: 'public',
};

function sanitizeAdminList(
  admins: ReturnType<typeof loadDatabase>['admins']
): AdminAccount[] {
  return admins.map(({ passwordHash: _ignored, ...rest }) => rest);
}

function getAuthenticatedUser(req: express.Request): AuthUser {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return PUBLIC_VISITOR;
  }
  const token = header.slice('Bearer '.length).trim();
  const verified = verifyAuthToken(token);
  if (!verified) return PUBLIC_VISITOR;
  if (verified.role === 'public') return PUBLIC_VISITOR;

  const db = loadDatabase();
  const account = db.admins.find((a) => a.id === verified.id);
  if (!account) return PUBLIC_VISITOR;
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/config', (_req, res) => {
    const mapsApiKey =
      process.env.VITE_GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_MAPS_API_KEY ||
      '';
    res.json({ mapsApiKey });
  });

  app.get('/api/bootstrap', (req, res) => {
    const db = loadDatabase();
    const currentUser = getAuthenticatedUser(req);
    const payload: Record<string, unknown> = {
      posts: db.posts,
      carouselIds: db.carouselIds,
      about: db.about,
      currentUser,
    };
    if (isRoleAuthorized(currentUser.role, 'manage_admins')) {
      payload.admins = sanitizeAdminList(db.admins);
    }
    res.json(payload);
  });

  app.get('/api/auth/me', (req, res) => {
    const currentUser = getAuthenticatedUser(req);
    res.json({ user: currentUser });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };
    if (!email || !password) {
      res.status(400).json({ error: 'Email dan kata sandi wajib diisi.' });
      return;
    }

    const db = loadDatabase();
    const account = db.admins.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (!account || !verifyPassword(password, account.passwordHash)) {
      res.status(401).json({ error: 'Email atau kata sandi tidak valid.' });
      return;
    }

    const user: AuthUser = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
    };
    const token = signAuthToken(user);
    res.json({
      user,
      token,
      admins:
        user.role === 'super_admin' ? sanitizeAdminList(db.admins) : undefined,
    });
  });

  // Demonstration mode role switcher: authenticates into demo Visitor / Admin / Super Admin sessions
  app.post('/api/auth/demo-switch', (req, res) => {
    const { targetRole } = req.body as { targetRole?: string };
    if (targetRole === 'public') {
      res.json({ user: PUBLIC_VISITOR, token: null });
      return;
    }
    if (targetRole !== 'admin' && targetRole !== 'super_admin') {
      res.status(400).json({ error: 'Peran demo tidak valid.' });
      return;
    }

    const db = loadDatabase();
    const account = db.admins.find((a) => a.role === targetRole);
    if (!account) {
      res
        .status(404)
        .json({ error: 'Akun demo untuk peran tersebut tidak ditemukan.' });
      return;
    }

    const user: AuthUser = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
    };
    const token = signAuthToken(user);
    res.json({
      user,
      token,
      admins:
        user.role === 'super_admin' ? sanitizeAdminList(db.admins) : undefined,
    });
  });

  app.post('/api/auth/logout', (_req, res) => {
    res.json({ user: PUBLIC_VISITOR });
  });

  // Admin & Super Admin: Create Post
  app.post('/api/posts', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!isRoleAuthorized(user.role, 'manage_posts')) {
      res
        .status(403)
        .json({ error: 'Akses ditolak. Diperlukan peran Admin atau Super Admin.' });
      return;
    }

    const body = req.body as Partial<ContentItem> & {
      section?: ContentSection;
    };
    if (
      body.section !== 'fokus' &&
      body.section !== 'konservasi' &&
      body.section !== 'kabar'
    ) {
      res.status(400).json({ error: 'Seksi konten tidak valid.' });
      return;
    }

    const titleId = body.title?.id?.trim() || '';
    const titleEn = body.title?.en?.trim() || titleId;
    const categoryId = body.category?.id?.trim() || '';
    const categoryEn = body.category?.en?.trim() || categoryId;
    const excerptId = body.excerpt?.id?.trim() || '';
    const excerptEn = body.excerpt?.en?.trim() || excerptId;
    const bodyId = body.body?.id?.trim() || '';
    const bodyEn = body.body?.en?.trim() || bodyId;
    const imageUrl = body.imageUrl?.trim() || '';

    const validationError = validatePostInput({
      titleId,
      excerptId,
      bodyId,
      categoryId,
      imageUrl,
    });
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    const db = loadDatabase();
    const newItem: ContentItem = {
      id: `${body.section}-${crypto.randomUUID().slice(0, 8)}`,
      section: body.section,
      category: { id: categoryId, en: categoryEn },
      title: { id: titleId, en: titleEn },
      excerpt: { id: excerptId, en: excerptEn },
      body: { id: bodyId, en: bodyEn },
      imageUrl,
      publishedAt:
        body.publishedAt?.trim() || new Date().toISOString().slice(0, 10),
      author: body.author?.trim() || user.name,
      location: body.location?.trim() || 'Kepulauan Indonesia',
      ...(body.section === 'konservasi'
        ? {
            targetGoal: Number(body.targetGoal) > 0 ? Number(body.targetGoal) : 500,
            currentProgress:
              Number(body.currentProgress) >= 0 ? Number(body.currentProgress) : 0,
            unitLabel: {
              id: body.unitLabel?.id?.trim() || 'Partisipan',
              en: body.unitLabel?.en?.trim() || body.unitLabel?.id?.trim() || 'Participants',
            },
            ctaLabel: {
              id: body.ctaLabel?.id?.trim() || 'Ikut Beraksi',
              en: body.ctaLabel?.en?.trim() || 'Take Action',
            },
          }
        : {}),
    };

    db.posts.unshift(newItem);
    saveDatabase(db);
    res.status(201).json({ post: newItem });
  });

  // Admin & Super Admin: Update Post
  app.put('/api/posts/:id', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!isRoleAuthorized(user.role, 'manage_posts')) {
      res
        .status(403)
        .json({ error: 'Akses ditolak. Diperlukan peran Admin atau Super Admin.' });
      return;
    }

    const db = loadDatabase();
    const index = db.posts.findIndex((p) => p.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: 'Konten tidak ditemukan.' });
      return;
    }

    const existing = db.posts[index];
    const body = req.body as Partial<ContentItem>;
    const titleId =
      body.title?.id !== undefined ? body.title.id.trim() : existing.title.id;
    const titleEn =
      body.title?.en !== undefined
        ? body.title.en.trim() || titleId
        : existing.title.en || titleId;
    const categoryId =
      body.category?.id !== undefined
        ? body.category.id.trim()
        : existing.category.id;
    const categoryEn =
      body.category?.en !== undefined
        ? body.category.en.trim() || categoryId
        : existing.category.en || categoryId;
    const excerptId =
      body.excerpt?.id !== undefined
        ? body.excerpt.id.trim()
        : existing.excerpt.id;
    const excerptEn =
      body.excerpt?.en !== undefined
        ? body.excerpt.en.trim() || excerptId
        : existing.excerpt.en || excerptId;
    const bodyId =
      body.body?.id !== undefined ? body.body.id.trim() : existing.body.id;
    const bodyEn =
      body.body?.en !== undefined
        ? body.body.en.trim() || bodyId
        : existing.body.en || bodyId;
    const imageUrl =
      body.imageUrl !== undefined ? body.imageUrl.trim() : existing.imageUrl;

    const validationError = validatePostInput({
      titleId,
      excerptId,
      bodyId,
      categoryId,
      imageUrl,
    });
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    const updated: ContentItem = {
      ...existing,
      section:
        body.section === 'fokus' ||
        body.section === 'konservasi' ||
        body.section === 'kabar'
          ? body.section
          : existing.section,
      category: { id: categoryId, en: categoryEn },
      title: { id: titleId, en: titleEn },
      excerpt: { id: excerptId, en: excerptEn },
      body: { id: bodyId, en: bodyEn },
      imageUrl,
      author: body.author?.trim() || existing.author,
      location: body.location?.trim() || existing.location,
      publishedAt: body.publishedAt?.trim() || existing.publishedAt,
      ...(existing.section === 'konservasi' || body.section === 'konservasi'
        ? {
            targetGoal:
              body.targetGoal !== undefined
                ? Math.max(1, Number(body.targetGoal))
                : existing.targetGoal ?? 500,
            currentProgress:
              body.currentProgress !== undefined
                ? Math.max(0, Number(body.currentProgress))
                : existing.currentProgress ?? 0,
            unitLabel: body.unitLabel ?? existing.unitLabel,
            ctaLabel: body.ctaLabel ?? existing.ctaLabel,
          }
        : {}),
    };

    db.posts[index] = updated;
    saveDatabase(db);
    res.json({ post: updated });
  });

  // Admin & Super Admin: Delete Post
  app.delete('/api/posts/:id', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!isRoleAuthorized(user.role, 'manage_posts')) {
      res
        .status(403)
        .json({ error: 'Akses ditolak. Diperlukan peran Admin atau Super Admin.' });
      return;
    }

    const db = loadDatabase();
    const exists = db.posts.some((p) => p.id === req.params.id);
    if (!exists) {
      res.status(404).json({ error: 'Konten tidak ditemukan.' });
      return;
    }

    db.posts = db.posts.filter((p) => p.id !== req.params.id);
    db.carouselIds = db.carouselIds.filter((id) => id !== req.params.id);
    saveDatabase(db);
    res.json({ deletedId: req.params.id, carouselIds: db.carouselIds });
  });

  // Public Action: Participate in a Mari Konservasi campaign
  app.post('/api/campaigns/:id/join', (req, res) => {
    const { name, email, amount } = req.body as {
      name?: string;
      email?: string;
      amount?: number;
    };
    const parsedAmount = Number(amount);
    const joinErr = validateCampaignJoinInput(
      {
        name: name || '',
        email: email || '',
        amount: parsedAmount,
      },
      'id'
    );
    if (joinErr) {
      res.status(400).json({ error: joinErr });
      return;
    }
    const pledge = parsedAmount;

    const db = loadDatabase();
    const idx = db.posts.findIndex(
      (p) => p.id === req.params.id && p.section === 'konservasi'
    );
    if (idx === -1) {
      res.status(404).json({ error: 'Kampanye tidak ditemukan.' });
      return;
    }

    const target = db.posts[idx];
    target.currentProgress = (target.currentProgress ?? 0) + pledge;
    db.volunteers.push({
      id: `vol-${crypto.randomUUID().slice(0, 8)}`,
      campaignId: target.id,
      name: name!.trim(),
      email: email!.trim().toLowerCase(),
      amount: pledge,
      createdAt: new Date().toISOString(),
    });
    saveDatabase(db);
    res.json({ post: target });
  });

  // Super Admin Only: Update Tentang Kami
  app.put('/api/about', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!isRoleAuthorized(user.role, 'edit_about')) {
      res
        .status(403)
        .json({ error: 'Akses ditolak. Hanya Super Admin yang dapat mengubah Tentang Kami.' });
      return;
    }

    const incoming = req.body as Partial<AboutContent>;
    const err = validateAboutInput({
      email: incoming.email || '',
      phone: incoming.phone || '',
      lat: incoming.lat === undefined || incoming.lat === null ? Number.NaN : Number(incoming.lat),
      lng: incoming.lng === undefined || incoming.lng === null ? Number.NaN : Number(incoming.lng),
      profileId: incoming.profile?.id || '',
    });
    if (err) {
      res.status(400).json({ error: err });
      return;
    }

    const db = loadDatabase();
    const nextProfileId = incoming.profile!.id.trim();
    const nextVisionId = incoming.vision?.id?.trim() ?? db.about.vision.id;
    const nextAddressId = incoming.address?.id?.trim() ?? db.about.address.id;

    db.about = {
      profile: {
        id: nextProfileId,
        en: incoming.profile?.en?.trim() || nextProfileId,
      },
      vision: {
        id: nextVisionId,
        en: incoming.vision?.en?.trim() || nextVisionId,
      },
      mission: Array.isArray(incoming.mission)
        ? incoming.mission.map((m) => ({
            id: (m.id || '').trim(),
            en: (m.en || m.id || '').trim(),
          }))
        : db.about.mission,
      email: incoming.email!.trim(),
      phone: incoming.phone!.trim(),
      address: {
        id: nextAddressId,
        en: incoming.address?.en?.trim() || nextAddressId,
      },
      officeName: incoming.officeName?.trim() || db.about.officeName,
      lat: Number(incoming.lat),
      lng: Number(incoming.lng),
      instagram: incoming.instagram?.trim() || db.about.instagram,
      linkedin: incoming.linkedin?.trim() || db.about.linkedin,
      youtube: incoming.youtube?.trim() || db.about.youtube,
    };

    saveDatabase(db);
    res.json({ about: db.about });
  });

  // Super Admin Only: Set 6 Featured Carousel Slides
  app.put('/api/carousel', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!isRoleAuthorized(user.role, 'manage_carousel')) {
      res
        .status(403)
        .json({ error: 'Akses ditolak. Hanya Super Admin yang dapat mengatur Carousel.' });
      return;
    }

    const { carouselIds } = req.body as { carouselIds?: string[] };
    const db = loadDatabase();
    const err = validateCarouselSelection(
      Array.isArray(carouselIds) ? carouselIds : [],
      db.posts.map((p) => p.id)
    );
    if (err) {
      res.status(400).json({ error: err });
      return;
    }

    db.carouselIds = carouselIds!;
    saveDatabase(db);
    res.json({ carouselIds: db.carouselIds });
  });

  // Super Admin Only: List / Create / Delete Admin Accounts
  app.get('/api/admins', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!isRoleAuthorized(user.role, 'manage_admins')) {
      res
        .status(403)
        .json({ error: 'Akses ditolak. Hanya Super Admin yang dapat mengelola akun admin.' });
      return;
    }
    const db = loadDatabase();
    res.json({ admins: sanitizeAdminList(db.admins) });
  });

  app.post('/api/admins', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!isRoleAuthorized(user.role, 'manage_admins')) {
      res
        .status(403)
        .json({ error: 'Akses ditolak. Hanya Super Admin yang dapat membuat akun admin.' });
      return;
    }

    const { name, email, password, role } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      role?: 'admin' | 'super_admin';
    };

    const db = loadDatabase();
    const err = validateAdminAccountInput(
      {
        name: name || '',
        email: email || '',
        password: password || '',
        role: role || 'admin',
      },
      db.admins.map((a) => a.email)
    );
    if (err) {
      res.status(400).json({ error: err });
      return;
    }

    const created = {
      id: `adm-${crypto.randomUUID().slice(0, 8)}`,
      name: name!.trim(),
      email: email!.trim().toLowerCase(),
      role: role === 'super_admin' ? ('super_admin' as const) : ('admin' as const),
      createdAt: new Date().toISOString().slice(0, 10),
      passwordHash: hashPassword(password!.trim()),
    };

    db.admins.push(created);
    saveDatabase(db);
    const { passwordHash: _ignored, ...safeAdmin } = created;
    res.status(201).json({ admin: safeAdmin });
  });

  app.delete('/api/admins/:id', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!isRoleAuthorized(user.role, 'manage_admins')) {
      res
        .status(403)
        .json({ error: 'Akses ditolak. Hanya Super Admin yang dapat menghapus akun admin.' });
      return;
    }

    const db = loadDatabase();
    const target = db.admins.find((a) => a.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: 'Akun admin tidak ditemukan.' });
      return;
    }
    if (target.id === 'admin-super-1' || target.id === user.id) {
      res
        .status(400)
        .json({ error: 'Akun Super Admin utama atau akun yang sedang aktif tidak dapat dihapus.' });
      return;
    }

    db.admins = db.admins.filter((a) => a.id !== req.params.id);
    saveDatabase(db);
    res.json({ deletedId: req.params.id });
  });

  app.post('/api/newsletter', (req, res) => {
    const { email, lang } = req.body as { email?: string; lang?: 'id' | 'en' };
    const locale = lang === 'en' ? 'en' : 'id';
    const err = validateNewsletterEmail(email || '', locale);
    if (err) {
      res.status(400).json({ error: err });
      return;
    }

    const normalizedEmail = normalizeNewsletterEmail(email || '');
    const db = loadDatabase();
    const existing = db.newsletterSubscribers.find(
      (subscriber) => subscriber.email === normalizedEmail
    );
    if (existing) {
      res.json({
        subscribed: true,
        alreadySubscribed: true,
        email: normalizedEmail,
      });
      return;
    }

    db.newsletterSubscribers.push({
      id: `sub-${crypto.randomUUID().slice(0, 8)}`,
      email: normalizedEmail,
      subscribedAt: new Date().toISOString(),
    });
    saveDatabase(db);
    res.status(201).json({
      subscribed: true,
      alreadySubscribed: false,
      email: normalizedEmail,
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Yayasan Nata Bahari server listening on http://localhost:${PORT}`);
  });
}

startServer();
