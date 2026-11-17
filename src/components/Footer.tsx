import { Waves, Mail, Phone } from 'lucide-react';
import type { AboutContent, Language, PageId } from '../types';
import { getCopy } from '../i18n/translations';
import { pickText } from '../utils/cmsLogic';
import { NewsletterForm } from './NewsletterForm';

interface FooterProps {
  lang: Language;
  about: AboutContent;
  onNavigate: (page: PageId) => void;
}

export function Footer({ lang, about, onNavigate }: FooterProps) {
  const copy = getCopy(lang);

  const links: { id: PageId; label: string }[] = [
    { id: 'beranda', label: copy.nav.beranda },
    { id: 'tentang', label: copy.nav.tentang },
    { id: 'fokus', label: copy.nav.fokus },
    { id: 'konservasi', label: copy.nav.konservasi },
    { id: 'kabar', label: copy.nav.kabar },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <NewsletterForm lang={lang} />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-slate-800">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5 text-white">
              <span className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-400/30 text-sky-400 flex items-center justify-center">
                <Waves className="w-4 h-4" aria-hidden="true" />
              </span>
              <span className="font-display font-bold text-lg tracking-tight">
                {copy.brandName}
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              {pickText(about.profile, lang)}
            </p>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {lang === 'id' ? 'Navigasi' : 'Navigation'}
            </h3>
            <ul className="space-y-2 text-sm">
              {links.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className="text-slate-300 hover:text-sky-400 transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {copy.about.contactTitle}
            </h3>
            <div className="space-y-2 text-sm text-slate-300">
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" aria-hidden="true" />
                <span>{about.email}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" aria-hidden="true" />
                <span className="tabular-nums">{about.phone}</span>
              </p>
              <p className="text-xs text-slate-400 leading-relaxed pt-1">
                {pickText(about.address, lang)}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            © 2026 Yayasan Nata Bahari.{' '}
            {lang === 'id'
              ? 'Seluruh hak cipta dilindungi.'
              : 'All rights reserved.'}
          </p>
          <p>
            {lang === 'id'
              ? 'Jakarta Utara & Kepulauan Indonesia'
              : 'North Jakarta & Indonesian Archipelago'}
          </p>
        </div>
      </div>
    </footer>
  );
}
