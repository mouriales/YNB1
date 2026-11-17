import { ArrowRight, Waves } from 'lucide-react';
import type { ContentItem, Language, PageId } from '../types';
import { getCopy } from '../i18n/translations';
import { formatNumber, pickText } from '../utils/cmsLogic';
import { HeroCarousel } from './HeroCarousel';

interface HomeViewProps {
  lang: Language;
  slides: ContentItem[];
  posts: ContentItem[];
  onNavigate: (page: PageId) => void;
  onOpenDetail: (item: ContentItem) => void;
}

export function HomeView({
  lang,
  slides,
  posts,
  onNavigate,
  onOpenDetail,
}: HomeViewProps) {
  const copy = getCopy(lang);

  const stats = [
    { value: formatNumber(14200, lang) + '+', label: copy.home.statCoralLabel },
    { value: formatNumber(48, lang) + ' ha', label: copy.home.statMangroveLabel },
    { value: formatNumber(32, lang), label: copy.home.statVillagesLabel },
    { value: formatNumber(214, lang) + '+', label: copy.home.statVolunteersLabel },
  ];

  const latestNews = posts.filter((p) => p.section === 'kabar').slice(0, 3);
  const focusHighlights = posts.filter((p) => p.section === 'fokus').slice(0, 2);
  const previewItems = [...latestNews, ...focusHighlights].slice(0, 4);

  return (
    <div>
      <HeroCarousel
        slides={slides}
        lang={lang}
        onOpenSlideTarget={(slide) => {
          onNavigate(slide.section);
          onOpenDetail(slide);
        }}
      />

      {/* Quick Stats / Mission Highlight Band */}
      <section className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-2">
              <h2 className="font-display text-2xl font-bold tracking-tight text-balance">
                {copy.home.statsHeading}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-md">
                {copy.home.statsSub}
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('fokus')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                >
                  <span>{copy.home.exploreWork}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <span className="text-slate-600" aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => onNavigate('konservasi')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-sky-300 transition-colors"
                >
                  <span>{copy.home.joinAction}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-800 lg:pl-8">
              {stats.map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <p className="font-display text-2xl sm:text-3xl font-bold text-sky-400 tabular-nums">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-300 leading-snug">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Latest Updates Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-slate-200">
          <div className="space-y-1.5">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {copy.home.latestHeading}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
              {copy.home.latestSub}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('kabar')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 hover:text-sky-600 whitespace-nowrap shrink-0"
          >
            <span>{copy.home.viewAllNews}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
          {previewItems.map((item) => {
            const sectionText =
              item.section === 'fokus'
                ? copy.common.sectionFokus
                : item.section === 'konservasi'
                  ? copy.common.sectionKonservasi
                  : copy.common.sectionKabar;
            return (
              <article
                key={item.id}
                className="group bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col hover:border-sky-300 hover:shadow-sm transition-all"
              >
                <div className="aspect-[16/10] w-full bg-slate-100 overflow-hidden relative">
                  <img
                    src={item.imageUrl}
                    alt={pickText(item.title, lang)}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-800 to-sky-900 flex items-center justify-center">
                    <Waves className="w-8 h-8 text-sky-300/40" aria-hidden="true" />
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="font-semibold text-sky-700">
                        {sectionText}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{item.publishedAt}</span>
                    </div>
                    <h3 className="font-display font-bold text-base text-slate-900 leading-snug line-clamp-2">
                      {pickText(item.title, lang)}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {pickText(item.excerpt, lang)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenDetail(item)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-sky-700 pt-2 border-t border-slate-100"
                  >
                    <span>{copy.carousel.readMore}</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
