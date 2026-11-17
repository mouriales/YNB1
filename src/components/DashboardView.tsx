import { useState, useEffect } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  ShieldCheck,
  Images,
  FileText,
  UserPlus,
  Building2,
} from 'lucide-react';
import type {
  AboutContent,
  AdminAccount,
  AuthUser,
  ContentItem,
  ContentSection,
  Language,
} from '../types';
import { getCopy } from '../i18n/translations';
import {
  isRoleAuthorized,
  pickText,
  resolveCarouselSlides,
  validateAboutInput,
  validateAdminAccountInput,
  validateCarouselSelection,
} from '../utils/cmsLogic';

type DashboardTab = 'posts' | 'carousel' | 'about' | 'admins';

interface DashboardViewProps {
  lang: Language;
  currentUser: AuthUser;
  posts: ContentItem[];
  carouselIds: string[];
  about: AboutContent;
  admins: AdminAccount[];
  onOpenCreatePost: (section: ContentSection) => void;
  onEditPost: (item: ContentItem) => void;
  onDeletePost: (item: ContentItem) => void;
  onSaveCarousel: (ids: string[]) => Promise<void>;
  onSaveAbout: (updated: AboutContent) => Promise<void>;
  onCreateAdmin: (payload: {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'super_admin';
  }) => Promise<void>;
  onDeleteAdmin: (id: string) => Promise<void>;
}

export function DashboardView({
  lang,
  currentUser,
  posts,
  carouselIds,
  about,
  admins,
  onOpenCreatePost,
  onEditPost,
  onDeletePost,
  onSaveCarousel,
  onSaveAbout,
  onCreateAdmin,
  onDeleteAdmin,
}: DashboardViewProps) {
  const copy = getCopy(lang);
  const isSuperAdmin = currentUser.role === 'super_admin';

  const [activeTab, setActiveTab] = useState<DashboardTab>('posts');
  const [sectionFilter, setSectionFilter] = useState<'all' | ContentSection>(
    'all'
  );

  // Carousel manager state (6 slots)
  const [selectedSlides, setSelectedSlides] = useState<string[]>(() =>
    resolveCarouselSlides(posts, carouselIds, 6).map((p) => p.id)
  );
  const [carouselMsg, setCarouselMsg] = useState<string | null>(null);
  const [carouselErr, setCarouselErr] = useState<string | null>(null);
  const [savingCarousel, setSavingCarousel] = useState(false);

  // About editor state
  const [aboutDraft, setAboutDraft] = useState<AboutContent>(about);
  const [latInput, setLatInput] = useState(String(about.lat));
  const [lngInput, setLngInput] = useState(String(about.lng));
  const [aboutMsg, setAboutMsg] = useState<string | null>(null);
  const [aboutErr, setAboutErr] = useState<string | null>(null);
  const [savingAbout, setSavingAbout] = useState(false);

  // Admin management state
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminRole, setAdminRole] = useState<'admin' | 'super_admin'>('admin');
  const [adminMsg, setAdminMsg] = useState<string | null>(null);
  const [adminErr, setAdminErr] = useState<string | null>(null);
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  useEffect(() => {
    setSelectedSlides(
      resolveCarouselSlides(posts, carouselIds, 6).map((p) => p.id)
    );
  }, [posts, carouselIds]);

  useEffect(() => {
    setAboutDraft(about);
    setLatInput(String(about.lat));
    setLngInput(String(about.lng));
  }, [about]);

  useEffect(() => {
    if (!isSuperAdmin && activeTab !== 'posts') {
      setActiveTab('posts');
    }
  }, [isSuperAdmin, activeTab]);

  if (!isRoleAuthorized(currentUser.role, 'manage_posts')) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-3">
        <h1 className="font-display text-2xl font-bold text-slate-900">
          {lang === 'id'
            ? 'Akses Terbatas'
            : 'Restricted Access'}
        </h1>
        <p className="text-sm text-slate-600">
          {lang === 'id'
            ? 'Gunakan pengalih peran di bilah navigasi atau masuk sebagai Admin / Super Admin untuk membuka Dashboard CMS.'
            : 'Use the role switcher in the top bar or sign in as Admin / Super Admin to access the CMS Dashboard.'}
        </p>
      </div>
    );
  }

  const filteredPosts =
    sectionFilter === 'all'
      ? posts
      : posts.filter((p) => p.section === sectionFilter);

  const handleSlideSelect = (slotIdx: number, postId: string) => {
    const next = [...selectedSlides];
    next[slotIdx] = postId;
    setSelectedSlides(next);
    setCarouselMsg(null);
    setCarouselErr(null);
  };

  const handleMoveSlide = (slotIdx: number, delta: -1 | 1) => {
    const target = slotIdx + delta;
    if (target < 0 || target >= selectedSlides.length) return;
    const next = [...selectedSlides];
    const tmp = next[slotIdx];
    next[slotIdx] = next[target];
    next[target] = tmp;
    setSelectedSlides(next);
    setCarouselMsg(null);
  };

  const handleCarouselSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateCarouselSelection(
      selectedSlides,
      posts.map((p) => p.id)
    );
    if (err) {
      setCarouselErr(err);
      return;
    }
    setSavingCarousel(true);
    setCarouselErr(null);
    setCarouselMsg(null);
    try {
      await onSaveCarousel(selectedSlides);
      setCarouselMsg(
        lang === 'id'
          ? '6 slide carousel Beranda berhasil diperbarui.'
          : '6 homepage carousel slides updated successfully.'
      );
    } catch (saveErr) {
      setCarouselErr(
        saveErr instanceof Error ? saveErr.message : 'Gagal menyimpan carousel.'
      );
    } finally {
      setSavingCarousel(false);
    }
  };

  const handleAboutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLat = latInput.trim() === '' ? Number.NaN : Number(latInput);
    const parsedLng = lngInput.trim() === '' ? Number.NaN : Number(lngInput);
    const err = validateAboutInput({
      email: aboutDraft.email,
      phone: aboutDraft.phone,
      lat: parsedLat,
      lng: parsedLng,
      profileId: aboutDraft.profile.id,
    });
    if (err) {
      setAboutErr(err);
      return;
    }
    setSavingAbout(true);
    setAboutErr(null);
    setAboutMsg(null);
    try {
      await onSaveAbout({
        ...aboutDraft,
        lat: parsedLat,
        lng: parsedLng,
      });
      setAboutMsg(
        lang === 'id'
          ? 'Informasi Tentang Kami & koordinat peta diperbarui.'
          : 'About Us content & map coordinates updated.'
      );
    } catch (saveErr) {
      setAboutErr(
        saveErr instanceof Error ? saveErr.message : 'Gagal memperbarui data.'
      );
    } finally {
      setSavingAbout(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateAdminAccountInput(
      {
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: adminRole,
      },
      admins.map((a) => a.email)
    );
    if (err) {
      setAdminErr(err);
      return;
    }

    setCreatingAdmin(true);
    setAdminErr(null);
    setAdminMsg(null);
    try {
      await onCreateAdmin({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: adminRole,
      });
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
      setAdminRole('admin');
      setAdminMsg(
        lang === 'id'
          ? 'Akun admin baru berhasil dibuat.'
          : 'New admin account created.'
      );
    } catch (createErr) {
      setAdminErr(
        createErr instanceof Error
          ? createErr.message
          : 'Gagal membuat akun admin.'
      );
    } finally {
      setCreatingAdmin(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-700">
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            <span>
              {currentUser.name} ·{' '}
              {isSuperAdmin ? copy.roles.super_admin : copy.roles.admin}
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {copy.dashboard.title}
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            {copy.dashboard.subtitle}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="CMS Dashboard sections"
        className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'posts'}
          onClick={() => setActiveTab('posts')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'posts'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{copy.dashboard.tabPosts}</span>
        </button>

        {isSuperAdmin && (
          <>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'carousel'}
              onClick={() => setActiveTab('carousel')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'carousel'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Images className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{copy.dashboard.tabCarousel}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'about'}
              onClick={() => setActiveTab('about')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'about'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{copy.dashboard.tabAbout}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'admins'}
              onClick={() => setActiveTab('admins')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'admins'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{copy.dashboard.tabAdmins}</span>
            </button>
          </>
        )}
      </div>

      {!isSuperAdmin && (
        <p className="text-xs text-slate-500">{copy.dashboard.restrictedNote}</p>
      )}

      {/* TAB 1: Content Manager (Admin & Super Admin) */}
      {activeTab === 'posts' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
              {(['all', 'fokus', 'konservasi', 'kabar'] as const).map((sec) => {
                const label =
                  sec === 'all'
                    ? copy.news.allCategories
                    : sec === 'fokus'
                      ? copy.common.sectionFokus
                      : sec === 'konservasi'
                        ? copy.common.sectionKonservasi
                        : copy.common.sectionKabar;
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setSectionFilter(sec)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                      sectionFilter === sec
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() =>
                onOpenCreatePost(
                  sectionFilter === 'all' ? 'fokus' : sectionFilter
                )
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>{copy.dashboard.createPost}</span>
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 overflow-x-auto bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">{lang === 'id' ? 'Judul' : 'Title'}</th>
                  <th className="py-3 px-4">{lang === 'id' ? 'Halaman' : 'Section'}</th>
                  <th className="py-3 px-4">{lang === 'id' ? 'Kategori' : 'Category'}</th>
                  <th className="py-3 px-4">{copy.common.published}</th>
                  <th className="py-3 px-4 text-right">
                    {lang === 'id' ? 'Aksi' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredPosts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 px-4 text-center text-sm text-slate-500"
                    >
                      {lang === 'id'
                        ? 'Belum ada topik pada kategori halaman ini.'
                        : 'No topics published in this section yet.'}
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map((item) => {
                    const secLabel =
                      item.section === 'fokus'
                        ? copy.common.sectionFokus
                        : item.section === 'konservasi'
                          ? copy.common.sectionKonservasi
                          : copy.common.sectionKabar;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-medium text-slate-900 max-w-md">
                          <p className="truncate">{pickText(item.title, lang)}</p>
                          <p className="text-xs text-slate-500 truncate">
                            {item.location}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-xs text-sky-700 font-semibold whitespace-nowrap">
                          {secLabel}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                          {pickText(item.category, lang)}
                        </td>
                        <td className="py-3 px-4 text-xs font-mono text-slate-500 tabular-nums whitespace-nowrap">
                          {item.publishedAt}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onEditPost(item)}
                              aria-label={`Edit ${pickText(item.title, lang)}`}
                              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            >
                              <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeletePost(item)}
                              aria-label={`Delete ${pickText(item.title, lang)}`}
                              className="p-2 rounded-md text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Featured 6-Slide Carousel Manager (Super Admin) */}
      {activeTab === 'carousel' && isSuperAdmin && (
        <form onSubmit={handleCarouselSubmit} className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
            <div className="space-y-1">
              <h2 className="font-display text-lg font-bold text-slate-900">
                {copy.dashboard.tabCarousel}
              </h2>
              <p className="text-sm text-slate-600">
                {copy.dashboard.carouselHelp}
              </p>
            </div>

            {carouselErr && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium"
              >
                {carouselErr}
              </div>
            )}
            {carouselMsg && (
              <div
                role="status"
                className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium"
              >
                {carouselMsg}
              </div>
            )}

            <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
              {Array.from({ length: 6 }).map((_, idx) => {
                const currentId = selectedSlides[idx] || '';
                const matched = posts.find((p) => p.id === currentId);
                return (
                  <div
                    key={idx}
                    className="py-4 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="flex items-center gap-3 sm:w-40 shrink-0">
                      <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-md tabular-nums">
                        Slide 0{idx + 1}
                      </span>
                    </div>

                    <div className="flex-1">
                      <label htmlFor={`carousel-slot-${idx}`} className="sr-only">
                        Slide {idx + 1} topic
                      </label>
                      <select
                        id={`carousel-slot-${idx}`}
                        value={currentId}
                        onChange={(e) => handleSlideSelect(idx, e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="" disabled>
                          {lang === 'id' ? '-- Pilih Topik --' : '-- Select Topic --'}
                        </option>
                        {posts.map((post) => {
                          const sec =
                            post.section === 'fokus'
                              ? copy.common.sectionFokus
                              : post.section === 'konservasi'
                                ? copy.common.sectionKonservasi
                                : copy.common.sectionKabar;
                          return (
                            <option key={post.id} value={post.id}>
                              [{sec}] {pickText(post.title, lang)}
                            </option>
                          );
                        })}
                      </select>
                      {matched && (
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {pickText(matched.excerpt, lang)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveSlide(idx, -1)}
                        aria-label={`Move slide ${idx + 1} up`}
                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                      >
                        <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === 5}
                        onClick={() => handleMoveSlide(idx, 1)}
                        aria-label={`Move slide ${idx + 1} down`}
                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                      >
                        <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingCarousel}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold disabled:opacity-60"
              >
                <Save className="w-3.5 h-3.5" aria-hidden="true" />
                <span>
                  {savingCarousel ? '...' : copy.dashboard.saveCarousel}
                </span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: Tentang Kami Editor (Super Admin) */}
      {activeTab === 'about' && isSuperAdmin && (
        <form
          onSubmit={handleAboutSubmit}
          className="rounded-xl border border-slate-200 bg-white p-6 space-y-5"
        >
          <h2 className="font-display text-lg font-bold text-slate-900">
            {copy.dashboard.tabAbout}
          </h2>

          {aboutErr && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium"
            >
              {aboutErr}
            </div>
          )}
          {aboutMsg && (
            <div
              role="status"
              className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium"
            >
              {aboutMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label
                htmlFor="cms-about-profile-id"
                className="block text-xs font-semibold text-slate-700"
              >
                Profil Organisasi (ID)
              </label>
              <textarea
                id="cms-about-profile-id"
                rows={3}
                value={aboutDraft.profile.id}
                onChange={(e) =>
                  setAboutDraft({
                    ...aboutDraft,
                    profile: { ...aboutDraft.profile, id: e.target.value },
                  })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="cms-about-profile-en"
                className="block text-xs font-semibold text-slate-700"
              >
                Organization Profile (EN)
              </label>
              <textarea
                id="cms-about-profile-en"
                rows={3}
                value={aboutDraft.profile.en}
                onChange={(e) =>
                  setAboutDraft({
                    ...aboutDraft,
                    profile: { ...aboutDraft.profile, en: e.target.value },
                  })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="cms-about-email"
                className="block text-xs font-semibold text-slate-700"
              >
                {copy.about.emailLabel}
              </label>
              <input
                id="cms-about-email"
                type="email"
                value={aboutDraft.email}
                onChange={(e) =>
                  setAboutDraft({ ...aboutDraft, email: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="cms-about-phone"
                className="block text-xs font-semibold text-slate-700"
              >
                {copy.about.phoneLabel}
              </label>
              <input
                id="cms-about-phone"
                type="text"
                value={aboutDraft.phone}
                onChange={(e) =>
                  setAboutDraft({ ...aboutDraft, phone: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="cms-about-lat"
                className="block text-xs font-semibold text-slate-700"
              >
                Latitude
              </label>
              <input
                id="cms-about-lat"
                type="number"
                step="0.0001"
                value={latInput}
                onChange={(e) => setLatInput(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="cms-about-lng"
                className="block text-xs font-semibold text-slate-700"
              >
                Longitude
              </label>
              <input
                id="cms-about-lng"
                type="number"
                step="0.0001"
                value={lngInput}
                onChange={(e) => setLngInput(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingAbout}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{savingAbout ? '...' : copy.about.saveBtn}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: Admin Account Manager (Super Admin) */}
      {activeTab === 'admins' && isSuperAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form
            onSubmit={handleAdminSubmit}
            className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6 space-y-4 h-fit"
          >
            <h2 className="font-display text-lg font-bold text-slate-900">
              {copy.dashboard.addAdminTitle}
            </h2>

            {adminErr && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium"
              >
                {adminErr}
              </div>
            )}
            {adminMsg && (
              <div
                role="status"
                className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium"
              >
                {adminMsg}
              </div>
            )}

            <div className="space-y-1">
              <label
                htmlFor="admin-name-input"
                className="block text-xs font-semibold text-slate-700"
              >
                {copy.dashboard.adminName}
              </label>
              <input
                id="admin-name-input"
                type="text"
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Budi Hartono"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="admin-email-input"
                className="block text-xs font-semibold text-slate-700"
              >
                {copy.dashboard.adminEmail}
              </label>
              <input
                id="admin-email-input"
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="budi@natabahari.org"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="admin-password-input"
                className="block text-xs font-semibold text-slate-700"
              >
                {copy.dashboard.adminPassword}
              </label>
              <input
                id="admin-password-input"
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="admin-role-select"
                className="block text-xs font-semibold text-slate-700"
              >
                {copy.dashboard.adminRole}
              </label>
              <select
                id="admin-role-select"
                value={adminRole}
                onChange={(e) =>
                  setAdminRole(e.target.value as 'admin' | 'super_admin')
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="admin">{copy.roles.admin}</option>
                <option value="super_admin">{copy.roles.super_admin}</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={creatingAdmin}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold disabled:opacity-60"
            >
              {creatingAdmin ? '...' : copy.dashboard.createAdminBtn}
            </button>
          </form>

          <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white overflow-x-auto h-fit">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">{copy.dashboard.adminName}</th>
                  <th className="py-3 px-4">{copy.dashboard.adminEmail}</th>
                  <th className="py-3 px-4">{copy.dashboard.adminRole}</th>
                  <th className="py-3 px-4 text-right">
                    {lang === 'id' ? 'Aksi' : 'Action'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {admins.map((adm) => {
                  const isProtected =
                    adm.id === 'admin-super-1' || adm.id === currentUser.id;
                  return (
                    <tr key={adm.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {adm.name}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-600">
                        {adm.email}
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-sky-700">
                        {adm.role === 'super_admin'
                          ? copy.roles.super_admin
                          : copy.roles.admin}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isProtected ? (
                          <span className="text-xs text-slate-400">
                            {copy.dashboard.protectedAccount}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onDeleteAdmin(adm.id)}
                            aria-label={`${copy.dashboard.deleteAdmin} ${adm.name}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>{copy.dashboard.deleteAdmin}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
