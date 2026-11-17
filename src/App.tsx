import { useState, useEffect, useMemo } from 'react';
import type {
  AboutContent,
  AdminAccount,
  AuthUser,
  ContentItem,
  ContentSection,
  Language,
  PageId,
  Role,
} from './types';
import {
  createAdminAccount,
  createPost,
  deleteAdminAccount,
  deletePost,
  fetchBootstrap,
  fetchConfig,
  joinCampaign,
  loginWithCredentials,
  logoutSession,
  switchDemoRole,
  updateAbout,
  updateCarousel,
  updatePost,
  type PostPayload,
} from './utils/api';
import { resolveCarouselSlides } from './utils/cmsLogic';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { AboutView } from './components/AboutView';
import { FocusView } from './components/FocusView';
import { ConserveView } from './components/ConserveView';
import { NewsView } from './components/NewsView';
import { DashboardView } from './components/DashboardView';
import { Footer } from './components/Footer';
import { PostModal } from './components/PostModal';
import { DetailModal } from './components/DetailModal';
import { AuthModal } from './components/AuthModal';

const DEFAULT_ABOUT: AboutContent = {
  profile: {
    id: 'Yayasan Nata Bahari adalah organisasi konservasi kelautan Indonesia.',
    en: 'Yayasan Nata Bahari is an Indonesian marine conservation foundation.',
  },
  vision: {
    id: 'Laut Nusantara yang lestari dan berdaya lenting.',
    en: 'Resilient Indonesian oceans for generations to come.',
  },
  mission: [],
  email: 'sekretariat@natabahari.org',
  phone: '+62 21 5550 8420',
  address: {
    id: 'Muara Angke, Jakarta Utara',
    en: 'Muara Angke, North Jakarta',
  },
  officeName: 'Stasiun Pesisir Yayasan Nata Bahari',
  lat: -6.1088,
  lng: 106.7745,
  instagram: '@natabahari.id',
  linkedin: 'linkedin.com/company/yayasan-nata-bahari',
  youtube: 'youtube.com/@natabahari',
};

const PUBLIC_USER: AuthUser = {
  id: 'public-visitor',
  name: 'Pengunjung Publik',
  email: '',
  role: 'public',
};

export default function App() {
  const [lang, setLang] = useState<Language>('id');
  const [activePage, setActivePage] = useState<PageId>('beranda');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [posts, setPosts] = useState<ContentItem[]>([]);
  const [carouselIds, setCarouselIds] = useState<string[]>([]);
  const [about, setAbout] = useState<AboutContent>(DEFAULT_ABOUT);
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser>(PUBLIC_USER);
  const [mapsApiKey, setMapsApiKey] = useState<string>(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  );

  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [roleSwitching, setRoleSwitching] = useState(false);

  const [detailItem, setDetailItem] = useState<ContentItem | null>(null);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [postModalSection, setPostModalSection] =
    useState<ContentSection>('fokus');
  const [editingPost, setEditingPost] = useState<ContentItem | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [confirmDeleteItem, setConfirmDeleteItem] =
    useState<ContentItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const onQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuota);
  }, []);

  useEffect(() => {
    if (!toastMsg) return;
    const t = window.setTimeout(() => setToastMsg(null), 3500);
    return () => window.clearTimeout(t);
  }, [toastMsg]);

  useEffect(() => {
    let active = true;
    async function init() {
      try {
        const [boot, cfg] = await Promise.all([
          fetchBootstrap(),
          fetchConfig().catch(() => ({ mapsApiKey: '' })),
        ]);
        if (!active) return;
        setPosts(boot.posts);
        setCarouselIds(boot.carouselIds);
        setAbout(boot.about);
        setCurrentUser(boot.currentUser);
        if (boot.admins) setAdmins(boot.admins);
        if (cfg.mapsApiKey) setMapsApiKey(cfg.mapsApiKey);
      } catch (err) {
        if (!active) return;
        setLoadError(
          err instanceof Error ? err.message : 'Gagal memuat data aplikasi.'
        );
      } finally {
        if (active) setLoading(false);
      }
    }
    init();
    return () => {
      active = false;
    };
  }, []);

  const heroSlides = useMemo(
    () => resolveCarouselSlides(posts, carouselIds, 6),
    [posts, carouselIds]
  );

  const focusItems = useMemo(
    () => posts.filter((p) => p.section === 'fokus'),
    [posts]
  );
  const conserveItems = useMemo(
    () => posts.filter((p) => p.section === 'konservasi'),
    [posts]
  );
  const newsItems = useMemo(
    () => posts.filter((p) => p.section === 'kabar'),
    [posts]
  );

  const handleNavigate = (page: PageId) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchDemoRole = async (targetRole: Role) => {
    setRoleSwitching(true);
    try {
      const res = await switchDemoRole(targetRole);
      setCurrentUser(res.user);
      setAdmins(res.admins || []);
      if (targetRole === 'public' && activePage === 'dashboard') {
        setActivePage('beranda');
      }
      setToastMsg(
        lang === 'id'
          ? `Mode tampilan beralih ke ${
              targetRole === 'super_admin'
                ? 'Super Admin'
                : targetRole === 'admin'
                  ? 'Admin'
                  : 'Pengunjung Publik'
            }`
          : `Switched view mode to ${
              targetRole === 'super_admin'
                ? 'Super Admin'
                : targetRole === 'admin'
                  ? 'Admin'
                  : 'Public Visitor'
            }`
      );
    } catch (err) {
      setToastMsg(
        err instanceof Error ? err.message : 'Gagal mengganti mode peran.'
      );
    } finally {
      setRoleSwitching(false);
    }
  };

  const handleCredentialLogin = async (email: string, password: string) => {
    const res = await loginWithCredentials(email, password);
    setCurrentUser(res.user);
    setAdmins(res.admins || []);
    setToastMsg(
      lang === 'id'
        ? `Masuk sebagai ${res.user.name}`
        : `Signed in as ${res.user.name}`
    );
  };

  const handleLogout = async () => {
    await logoutSession();
    setCurrentUser(PUBLIC_USER);
    setAdmins([]);
    if (activePage === 'dashboard') {
      setActivePage('beranda');
    }
    setToastMsg(
      lang === 'id' ? 'Anda telah keluar.' : 'Signed out successfully.'
    );
  };

  const handleSavePost = async (payload: PostPayload, existingId?: string) => {
    if (existingId) {
      const { post } = await updatePost(existingId, payload);
      setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)));
      setToastMsg(
        lang === 'id' ? 'Topik berhasil diperbarui.' : 'Topic updated.'
      );
    } else {
      const { post } = await createPost(payload);
      setPosts((prev) => [post, ...prev]);
      setToastMsg(
        lang === 'id' ? 'Topik baru dipublikasikan.' : 'New topic published.'
      );
    }
  };

  const handleConfirmDeletePost = async () => {
    if (!confirmDeleteItem) return;
    try {
      const res = await deletePost(confirmDeleteItem.id);
      setPosts((prev) => prev.filter((p) => p.id !== res.deletedId));
      setCarouselIds(res.carouselIds);
      setConfirmDeleteItem(null);
      setToastMsg(lang === 'id' ? 'Konten dihapus.' : 'Content deleted.');
    } catch (err) {
      setToastMsg(
        err instanceof Error ? err.message : 'Gagal menghapus konten.'
      );
    }
  };

  const handleJoinCampaign = async (
    campaignId: string,
    payload: { name: string; email: string; amount: number }
  ) => {
    const { post } = await joinCampaign(campaignId, payload);
    setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)));
  };

  const handleSaveAbout = async (updated: AboutContent) => {
    const res = await updateAbout(updated);
    setAbout(res.about);
    setToastMsg(
      lang === 'id'
        ? 'Profil Tentang Kami disimpan.'
        : 'About Us profile saved.'
    );
  };

  const handleSaveCarousel = async (ids: string[]) => {
    const res = await updateCarousel(ids);
    setCarouselIds(res.carouselIds);
    setToastMsg(
      lang === 'id'
        ? '6 slide carousel Beranda disimpan.'
        : '6 homepage carousel slides saved.'
    );
  };

  const handleCreateAdmin = async (payload: {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'super_admin';
  }) => {
    const res = await createAdminAccount(payload);
    setAdmins((prev) => [...prev, res.admin]);
  };

  const handleDeleteAdmin = async (id: string) => {
    const res = await deleteAdminAccount(id);
    setAdmins((prev) => prev.filter((a) => a.id !== res.deletedId));
    setToastMsg(lang === 'id' ? 'Akun admin dihapus.' : 'Admin account deleted.');
  };

  const openCreateModal = (section: ContentSection) => {
    setEditingPost(null);
    setPostModalSection(section);
    setPostModalOpen(true);
  };

  const openEditModal = (item: ContentItem) => {
    setEditingPost(item);
    setPostModalSection(item.section);
    setPostModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      {/* Google Maps Demo Quota Banner (Case A) */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        lang={lang}
        onToggleLang={setLang}
        currentUser={currentUser}
        onSwitchDemoRole={handleSwitchDemoRole}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        roleSwitching={roleSwitching}
      />

      <main className="flex-1">
        {loading ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center text-sm text-slate-500">
            {lang === 'id'
              ? 'Memuat portal Yayasan Nata Bahari...'
              : 'Loading Yayasan Nata Bahari portal...'}
          </div>
        ) : loadError ? (
          <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-3">
            <p className="text-sm font-semibold text-rose-700">{loadError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
            >
              {lang === 'id' ? 'Muat Ulang' : 'Reload'}
            </button>
          </div>
        ) : (
          <>
            {activePage === 'beranda' && (
              <HomeView
                lang={lang}
                slides={heroSlides}
                posts={posts}
                onNavigate={handleNavigate}
                onOpenDetail={setDetailItem}
              />
            )}

            {activePage === 'tentang' && (
              <AboutView
                lang={lang}
                role={currentUser.role}
                about={about}
                mapsApiKey={mapsApiKey}
                onSaveAbout={handleSaveAbout}
              />
            )}

            {activePage === 'fokus' && (
              <FocusView
                lang={lang}
                role={currentUser.role}
                items={focusItems}
                onAddTopic={() => openCreateModal('fokus')}
                onEditTopic={openEditModal}
                onDeleteTopic={setConfirmDeleteItem}
                onOpenDetail={setDetailItem}
              />
            )}

            {activePage === 'konservasi' && (
              <ConserveView
                lang={lang}
                role={currentUser.role}
                items={conserveItems}
                onAddCampaign={() => openCreateModal('konservasi')}
                onEditCampaign={openEditModal}
                onDeleteCampaign={setConfirmDeleteItem}
                onOpenDetail={setDetailItem}
                onJoinCampaign={handleJoinCampaign}
              />
            )}

            {activePage === 'kabar' && (
              <NewsView
                lang={lang}
                role={currentUser.role}
                items={newsItems}
                onAddArticle={() => openCreateModal('kabar')}
                onEditArticle={openEditModal}
                onDeleteArticle={setConfirmDeleteItem}
                onOpenDetail={setDetailItem}
              />
            )}

            {activePage === 'dashboard' && (
              <DashboardView
                lang={lang}
                currentUser={currentUser}
                posts={posts}
                carouselIds={carouselIds}
                about={about}
                admins={admins}
                onOpenCreatePost={openCreateModal}
                onEditPost={openEditModal}
                onDeletePost={setConfirmDeleteItem}
                onSaveCarousel={handleSaveCarousel}
                onSaveAbout={handleSaveAbout}
                onCreateAdmin={handleCreateAdmin}
                onDeleteAdmin={handleDeleteAdmin}
              />
            )}
          </>
        )}
      </main>

      <Footer lang={lang} about={about} onNavigate={handleNavigate} />

      <DetailModal
        item={detailItem}
        lang={lang}
        onClose={() => setDetailItem(null)}
      />

      <PostModal
        isOpen={postModalOpen}
        lang={lang}
        defaultSection={postModalSection}
        editingItem={editingPost}
        onClose={() => setPostModalOpen(false)}
        onSubmit={handleSavePost}
      />

      <AuthModal
        isOpen={authModalOpen}
        lang={lang}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleCredentialLogin}
      />

      {/* Delete Confirmation Dialog */}
      {confirmDeleteItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2
              id="delete-confirm-title"
              className="font-display text-base font-bold text-slate-900"
            >
              {lang === 'id' ? 'Konfirmasi Hapus' : 'Confirm Deletion'}
            </h2>
            <p className="text-sm text-slate-600">
              {lang === 'id'
                ? 'Hapus topik ini secara permanen dari portal dan carousel?'
                : 'Permanently delete this item from the portal and carousel?'}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteItem(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700"
              >
                {lang === 'id' ? 'Batal' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePost}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                {lang === 'id' ? 'Hapus' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Toast */}
      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-lg shadow-lg border border-slate-700"
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}
