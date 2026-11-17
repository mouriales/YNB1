import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterNewsPosts,
  isRoleAuthorized,
  normalizeNewsletterEmail,
  pickText,
  resolveCarouselSlides,
  validateAboutInput,
  validateAdminAccountInput,
  validateCampaignJoinInput,
  validateCarouselSelection,
  validateNewsletterEmail,
  validatePostInput,
} from './cmsLogic';
import type { ContentItem } from '../types';

const samplePosts: ContentItem[] = [
  {
    id: 'p1',
    section: 'fokus',
    category: { id: 'Terumbu Karang', en: 'Coral Reef' },
    title: { id: 'Restorasi Karang', en: 'Coral Restoration' },
    excerpt: { id: 'Pemulihan terumbu karang pesisir.', en: 'Coastal coral reef recovery.' },
    body: { id: 'Detail panjang mengenai restorasi terumbu karang.', en: 'Long detail on coral reef restoration.' },
    imageUrl: '/img1.jpg',
    publishedAt: '2026-10-01',
    author: 'Nata Team',
    location: 'Kepulauan Seribu',
  },
  {
    id: 'p2',
    section: 'kabar',
    category: { id: 'Riset', en: 'Research' },
    title: { id: 'Survei Ekosistem Mangrove', en: 'Mangrove Ecosystem Survey' },
    excerpt: { id: 'Laporan riset mangrove Teluk Jakarta.', en: 'Jakarta Bay mangrove research report.' },
    body: { id: 'Riset tahunan mengenai kerapatan vegetasi mangrove.', en: 'Annual research on mangrove density.' },
    imageUrl: '/img2.jpg',
    publishedAt: '2026-10-12',
    author: 'Dr. Sari',
    location: 'Muara Angke',
  },
  {
    id: 'p3',
    section: 'konservasi',
    category: { id: 'Kampanye', en: 'Campaign' },
    title: { id: 'Aksi Bersih Pesisir', en: 'Coastal Cleanup Action' },
    excerpt: { id: 'Program relawan bersih pantai.', en: 'Volunteer shoreline cleanup program.' },
    body: { id: 'Bergabung bersama ratusan relawan menjaga kebersihan pesisir.', en: 'Join hundreds of volunteers.' },
    imageUrl: '/img3.jpg',
    publishedAt: '2026-11-01',
    author: 'Tim Relawan',
    location: 'Ancol',
  },
];

test('RBAC authorization enforces Admin vs Super Admin boundaries', () => {
  assert.equal(isRoleAuthorized('public', 'manage_posts'), false);
  assert.equal(isRoleAuthorized('admin', 'manage_posts'), true);
  assert.equal(isRoleAuthorized('admin', 'manage_carousel'), false);
  assert.equal(isRoleAuthorized('admin', 'edit_about'), false);
  assert.equal(isRoleAuthorized('admin', 'manage_admins'), false);
  assert.equal(isRoleAuthorized('super_admin', 'manage_posts'), true);
  assert.equal(isRoleAuthorized('super_admin', 'manage_carousel'), true);
  assert.equal(isRoleAuthorized('super_admin', 'edit_about'), true);
  assert.equal(isRoleAuthorized('super_admin', 'manage_admins'), true);
});

test('resolveCarouselSlides preserves pinned order and deduplicates', () => {
  const slides = resolveCarouselSlides(samplePosts, ['p3', 'p1', 'p3'], 3);
  assert.deepEqual(
    slides.map((s) => s.id),
    ['p3', 'p1', 'p2']
  );
});

test('filterNewsPosts filters by category and search query across languages', () => {
  const byCategory = filterNewsPosts(samplePosts, '', 'Research', 'en');
  assert.equal(byCategory.length, 1);
  assert.equal(byCategory[0].id, 'p2');

  const byQuery = filterNewsPosts(samplePosts, 'Kepulauan Seribu', 'all', 'id');
  assert.equal(byQuery.length, 1);
  assert.equal(byQuery[0].id, 'p1');
});

test('pickText selects correct language with fallback', () => {
  assert.equal(pickText({ id: 'Halo', en: 'Hello' }, 'id'), 'Halo');
  assert.equal(pickText({ id: 'Halo', en: 'Hello' }, 'en'), 'Hello');
});

test('validators reject invalid inputs and accept valid ones', () => {
  assert.ok(
    validatePostInput({
      titleId: 'Ab',
      excerptId: 'Short',
      bodyId: 'Too short',
      categoryId: '',
      imageUrl: '',
    })
  );
  assert.equal(
    validatePostInput({
      titleId: 'Program Baru',
      excerptId: 'Ringkasan program baru konservasi laut.',
      bodyId: 'Penjelasan lengkap mengenai program konservasi laut berkelanjutan.',
      categoryId: 'Konservasi',
      imageUrl: '/src/assets/images/coral.jpg',
    }),
    null
  );

  assert.ok(
    validateAboutInput({
      email: 'bad-email',
      phone: '123',
      lat: 95,
      lng: 106,
      profileId: 'Short',
    })
  );
  assert.equal(
    validateAboutInput({
      email: 'kontak@natabahari.org',
      phone: '+62 21 5550192',
      lat: -6.1088,
      lng: 106.7745,
      profileId: 'Yayasan Nata Bahari adalah lembaga konservasi maritim di Indonesia.',
    }),
    null
  );

  assert.ok(
    validateAdminAccountInput(
      { name: 'Rina', email: 'rina@natabahari.org', password: 'secret', role: 'admin' },
      ['rina@natabahari.org']
    )
  );
  assert.equal(
    validateAdminAccountInput(
      { name: 'Rina Wijaya', email: 'rina2@natabahari.org', password: 'password123', role: 'admin' },
      ['rina@natabahari.org']
    ),
    null
  );

  assert.ok(validateCarouselSelection(['p1', 'p2'], ['p1', 'p2', 'p3']));
  assert.ok(validateCarouselSelection(['p1', 'p1', 'p2', 'p3', 'p4', 'p5'], ['p1', 'p2', 'p3', 'p4', 'p5', 'p6']));
  assert.equal(
    validateCarouselSelection(['p1', 'p2', 'p3', 'p4', 'p5', 'p6'], ['p1', 'p2', 'p3', 'p4', 'p5', 'p6']),
    null
  );
});

test('newsletter email normalization and validation handle invalid and valid addresses', () => {
  assert.equal(normalizeNewsletterEmail('  Relawan@NataBahari.ORG '), 'relawan@natabahari.org');
  assert.equal(validateNewsletterEmail('', 'id'), 'Alamat email wajib diisi.');
  assert.equal(validateNewsletterEmail('   ', 'en'), 'Email address is required.');
  assert.equal(validateNewsletterEmail('invalid-email', 'id'), 'Format alamat email tidak valid.');
  assert.equal(validateNewsletterEmail('user@domain', 'en'), 'Please enter a valid email address.');
  assert.equal(
    validateNewsletterEmail(`${'a'.repeat(245)}@example.org`, 'en'),
    'Email address is too long.'
  );
  assert.equal(validateNewsletterEmail('relawan@natabahari.org', 'id'), null);
  assert.equal(validateNewsletterEmail('  ocean.lover+news@example.co.id ', 'en'), null);
});

test('campaign join validation and NaN coordinate checks reject invalid inputs', () => {
  assert.ok(
    validateCampaignJoinInput({ name: '   ', email: 'a@b.org', amount: 5 }, 'id')
  );
  assert.ok(
    validateCampaignJoinInput({ name: 'Andi', email: 'bad', amount: 5 }, 'en')
  );
  assert.ok(
    validateCampaignJoinInput({ name: 'Andi', email: 'a@b.org', amount: 0 }, 'id')
  );
  assert.ok(
    validateCampaignJoinInput({ name: 'Andi', email: 'a@b.org', amount: 501 }, 'en')
  );
  assert.equal(
    validateCampaignJoinInput({ name: 'Andi Pratama', email: 'andi@natabahari.org', amount: 10 }, 'id'),
    null
  );
  assert.ok(
    validateAboutInput({
      email: 'kontak@natabahari.org',
      phone: '+62 21 5550192',
      lat: Number.NaN,
      lng: 106.7745,
      profileId: 'Yayasan Nata Bahari adalah lembaga konservasi maritim di Indonesia.',
    })
  );
});
