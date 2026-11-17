import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ArrowRight,
  Waves,
} from 'lucide-react';
import type { ContentItem, Language, Role } from '../types';
import { getCopy } from '../i18n/translations';
import {
  filterNewsPosts,
  isRoleAuthorized,
  pickText,
} from '../utils/cmsLogic';

interface NewsViewProps {
  lang: Language;
  role: Role;
  items: ContentItem[];
  onAddArticle: () => void;
  onEditArticle: (item: ContentItem) => void;
  onDeleteArticle: (item: ContentItem) => void;
  onOpenDetail: (item: ContentItem) => void;
}

export function NewsView({
  lang,
  role,
  items,
  onAddArticle,
  onEditArticle,
  onDeleteArticle,
  onOpenDetail,
}: NewsViewProps) {
  const copy = getCopy(lang);
  const canManage = isRoleAuthorized(role, 'manage_posts');

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = useMemo(() => {
    const seen: Record<string, { key: string; label: string }> = {};
    for (const item of items) {
      const key = item.category.id.toLowerCase();
      if (!seen[key]) {
        seen[key] = {
          key,
          label: pickText(item.category, lang),
        };
      }
    }
    return Object.values(seen);
  }, [items, lang]);

  const filtered = useMemo(
    () => filterNewsPosts(items, query, selectedCategory, lang),
    [items, query, selectedCategory, lang]
  );

  const leadArticle = filtered[0] || null;
  const secondaryArticles = filtered.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-slate-200">
        <div className="space-y-2 max-w-3xl">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight text-balance">
            {copy.news.title}
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            {copy.news.subtitle}
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={onAddArticle}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>{copy.news.addBtn}</span>
          </button>
        )}
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Category filter"
          className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {copy.news.allCategories}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat.key
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <label htmlFor="news-search" className="sr-only">
            {copy.news.searchPlaceholder}
          </label>
          <input
            id="news-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.news.searchPlaceholder}
            className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-12 text-center space-y-3">
          <p className="text-sm text-slate-600">{copy.news.empty}</p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
          >
            {lang === 'id' ? 'Reset Filter' : 'Reset Filters'}
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Lead Article */}
          {leadArticle && (
            <article className="rounded-xl border border-slate-200 bg-white overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
              <div className="lg:col-span-7 aspect-[16/9] lg:aspect-auto lg:h-full min-h-[280px] bg-slate-100 relative overflow-hidden">
                <img
                  src={leadArticle.imageUrl}
                  alt={pickText(leadArticle.title, lang)}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-800 to-sky-900 flex items-center justify-center">
                  <Waves className="w-12 h-12 text-sky-300/40" aria-hidden="true" />
                </div>
              </div>

              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-sky-700">
                        {pickText(leadArticle.category, lang)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{leadArticle.publishedAt}</span>
                    </div>

                    {canManage && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditArticle(leadArticle)}
                          aria-label={`Edit ${pickText(leadArticle.title, lang)}`}
                          className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        >
                          <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteArticle(leadArticle)}
                          aria-label={`Delete ${pickText(leadArticle.title, lang)}`}
                          className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h2 className="font-display text-2xl font-bold text-slate-900 leading-snug text-balance">
                    {pickText(leadArticle.title, lang)}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {pickText(leadArticle.excerpt, lang)}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    <span>{leadArticle.author}</span>
                    <span aria-hidden="true"> · </span>
                    <span>{leadArticle.location}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenDetail(leadArticle)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-600 whitespace-nowrap shrink-0"
                  >
                    <span>{copy.news.readArticle}</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          )}

          {/* Secondary Articles Grid */}
          {secondaryArticles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {secondaryArticles.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[16/10] w-full bg-slate-100 relative overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={pickText(item.title, lang)}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-800 to-sky-900 flex items-center justify-center">
                        <Waves className="w-8 h-8 text-sky-300/40" aria-hidden="true" />
                      </div>
                    </div>

                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <span className="font-semibold text-sky-700">
                            {pickText(item.category, lang)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{item.publishedAt}</span>
                        </div>
                        {canManage && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onEditArticle(item)}
                              aria-label={`Edit ${pickText(item.title, lang)}`}
                              className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            >
                              <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteArticle(item)}
                              aria-label={`Delete ${pickText(item.title, lang)}`}
                              className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        )}
                      </div>

                      <h3 className="font-display text-lg font-bold text-slate-900 leading-snug">
                        {pickText(item.title, lang)}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {pickText(item.excerpt, lang)}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 truncate">
                      {item.author}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenDetail(item)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-600 whitespace-nowrap shrink-0"
                    >
                      <span>{copy.news.readArticle}</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
