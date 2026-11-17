import { X, MapPin, User, Calendar, Waves } from 'lucide-react';
import type { ContentItem, Language } from '../types';
import { getCopy } from '../i18n/translations';
import { pickText } from '../utils/cmsLogic';

interface DetailModalProps {
  item: ContentItem | null;
  lang: Language;
  onClose: () => void;
}

export function DetailModal({ item, lang, onClose }: DetailModalProps) {
  if (!item) return null;
  const copy = getCopy(lang);

  const sectionLabel =
    item.section === 'fokus'
      ? copy.common.sectionFokus
      : item.section === 'konservasi'
        ? copy.common.sectionKonservasi
        : copy.common.sectionKabar;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="relative h-60 sm:h-72 w-full bg-slate-900 shrink-0">
          <img
            src={item.imageUrl}
            alt={pickText(item.title, lang)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-900 to-sky-900 flex items-center justify-center">
            <Waves className="w-12 h-12 text-sky-400/30" aria-hidden="true" />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.common.close}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/75 hover:bg-slate-900 text-white flex items-center justify-center border border-white/20"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-sky-700">{sectionLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{pickText(item.category, lang)}</span>
          </div>

          <h2
            id="detail-modal-title"
            className="font-display text-2xl sm:text-3xl font-bold text-slate-900 leading-tight text-balance"
          >
            {pickText(item.title, lang)}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pb-4 border-b border-slate-200">
            <span className="inline-flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              {item.author}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              {item.location}
            </span>
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              {item.publishedAt}
            </span>
          </div>

          <p className="text-base font-medium text-slate-800 leading-relaxed">
            {pickText(item.excerpt, lang)}
          </p>

          <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
            {pickText(item.body, lang)}
          </p>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
            >
              {copy.common.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
