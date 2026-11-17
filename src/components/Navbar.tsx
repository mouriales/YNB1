import { useState, useRef, useEffect } from 'react';
import {
  Waves,
  Globe,
  Shield,
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  LogIn,
  LogOut,
  Check,
} from 'lucide-react';
import type { AuthUser, Language, PageId, Role } from '../types';
import { getCopy } from '../i18n/translations';

interface NavbarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  lang: Language;
  onToggleLang: (lang: Language) => void;
  currentUser: AuthUser;
  onSwitchDemoRole: (role: Role) => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  roleSwitching: boolean;
}

export function Navbar({
  activePage,
  onNavigate,
  lang,
  onToggleLang,
  currentUser,
  onSwitchDemoRole,
  onOpenAuthModal,
  onLogout,
  roleSwitching,
}: NavbarProps) {
  const copy = getCopy(lang);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setRoleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const navItems: { id: PageId; label: string }[] = [
    { id: 'beranda', label: copy.nav.beranda },
    { id: 'tentang', label: copy.nav.tentang },
    { id: 'fokus', label: copy.nav.fokus },
    { id: 'konservasi', label: copy.nav.konservasi },
    { id: 'kabar', label: copy.nav.kabar },
  ];

  const isPrivileged =
    currentUser.role === 'admin' || currentUser.role === 'super_admin';

  const roleLabel =
    currentUser.role === 'super_admin'
      ? copy.roles.super_admin
      : currentUser.role === 'admin'
        ? copy.roles.admin
        : copy.roles.public;

  const handleNavClick = (page: PageId) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 lg:gap-8">
        {/* Zone 1: Brand Mark */}
        <button
          type="button"
          onClick={() => handleNavClick('beranda')}
          className="flex items-center gap-2.5 text-slate-900 hover:text-sky-600 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-md py-1"
        >
          <span className="w-8 h-8 rounded-lg bg-slate-900 text-sky-400 flex items-center justify-center shrink-0">
            <Waves className="w-4 h-4" aria-hidden="true" />
          </span>
          <span className="font-display font-bold text-base sm:text-lg tracking-tight whitespace-nowrap">
            {copy.brandName}
          </span>
        </button>

        {/* Zone 2: Primary Navigation Links */}
        <nav
          aria-label={lang === 'id' ? 'Navigasi utama' : 'Main navigation'}
          className="hidden lg:flex items-center gap-6"
        >
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`text-sm font-medium whitespace-nowrap shrink-0 py-1.5 border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                  isActive
                    ? 'text-slate-900 border-sky-500'
                    : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Language Switcher + Role/Auth Switcher */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {/* Language Switcher */}
          <div
            role="group"
            aria-label="Language switcher"
            className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200"
          >
            <Globe
              className="w-3.5 h-3.5 text-slate-500 ml-2 mr-1 shrink-0"
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() => onToggleLang('id')}
              aria-pressed={lang === 'id'}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                lang === 'id'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ID
            </button>
            <button
              type="button"
              onClick={() => onToggleLang('en')}
              aria-pressed={lang === 'en'}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                lang === 'en'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EN
            </button>
          </div>

          {isPrivileged && (
            <button
              type="button"
              onClick={() => handleNavClick('dashboard')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                activePage === 'dashboard'
                  ? 'bg-sky-600 text-white'
                  : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{copy.nav.dashboard}</span>
            </button>
          )}

          {/* Role / Auth Switcher Widget */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              disabled={roleSwitching}
              onClick={() => setRoleMenuOpen((prev) => !prev)}
              aria-expanded={roleMenuOpen}
              aria-haspopup="menu"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 disabled:opacity-60"
            >
              <Shield className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
              <span>{roleLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            </button>

            {roleMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-lg py-2 z-50"
              >
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {copy.roles.switchRole}
                  </p>
                  <p className="text-xs text-slate-700 font-medium truncate mt-0.5">
                    {currentUser.name}
                  </p>
                </div>

                <div className="py-1">
                  {(['public', 'admin', 'super_admin'] as Role[]).map((r) => {
                    const active = currentUser.role === r;
                    const label =
                      r === 'super_admin'
                        ? copy.roles.super_admin
                        : r === 'admin'
                          ? copy.roles.admin
                          : copy.roles.public;
                    return (
                      <button
                        key={r}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          onSwitchDemoRole(r);
                          setRoleMenuOpen(false);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 text-slate-700"
                      >
                        <span className={active ? 'font-semibold text-slate-900' : ''}>
                          {label}
                        </span>
                        {active && (
                          <Check className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-slate-100 pt-1 px-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRoleMenuOpen(false);
                      onOpenAuthModal();
                    }}
                    className="w-full px-2 py-2 text-left text-xs font-medium text-sky-700 hover:bg-sky-50 rounded-lg flex items-center gap-2"
                  >
                    <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{copy.roles.signIn}</span>
                  </button>
                  {isPrivileged && (
                    <button
                      type="button"
                      onClick={() => {
                        setRoleMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full px-2 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{copy.roles.signOut}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleLang(lang === 'id' ? 'en' : 'id')}
            className="px-2.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-800 border border-slate-200 min-h-[40px]"
            aria-label={lang === 'id' ? 'Ganti bahasa' : 'Toggle language'}
          >
            {lang.toUpperCase()}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={
              mobileMenuOpen
                ? lang === 'id'
                  ? 'Tutup menu'
                  : 'Close menu'
                : lang === 'id'
                  ? 'Buka menu'
                  : 'Open menu'
            }
            aria-expanded={mobileMenuOpen}
            className="p-2.5 rounded-lg text-slate-700 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          <nav
            aria-label={lang === 'id' ? 'Navigasi seluler' : 'Mobile navigation'}
            className="grid gap-1"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium min-h-[44px] ${
                  activePage === item.id
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
            {isPrivileged && (
              <button
                type="button"
                onClick={() => handleNavClick('dashboard')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold min-h-[44px] flex items-center gap-2 ${
                  activePage === 'dashboard'
                    ? 'bg-sky-600 text-white'
                    : 'bg-sky-50 text-sky-700'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                <span>{copy.nav.dashboard}</span>
              </button>
            )}
          </nav>

          <div className="pt-3 border-t border-slate-200 space-y-2">
            <p className="text-xs font-semibold text-slate-500">
              {copy.roles.switchRole}: <span className="text-slate-900">{roleLabel}</span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(['public', 'admin', 'super_admin'] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    onSwitchDemoRole(r);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-2 py-2 rounded-lg text-xs font-semibold min-h-[40px] border ${
                    currentUser.role === r
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  {r === 'super_admin'
                    ? 'Super Admin'
                    : r === 'admin'
                      ? 'Admin'
                      : lang === 'id'
                        ? 'Publik'
                        : 'Public'}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuthModal();
                }}
                className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold border border-slate-300 text-slate-800 hover:bg-slate-50 min-h-[44px] flex items-center justify-center gap-2"
              >
                <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{copy.roles.signIn}</span>
              </button>
              {isPrivileged && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 min-h-[44px] flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{copy.roles.signOut}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
