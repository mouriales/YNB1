import { Plus, Pencil, Trash2, ArrowRight, Waves } from 'lucide-react';
import type { ContentItem, Language, Role } from '../types';
import { getCopy } from '../i18n/translations';
import { isRoleAuthorized, pickText } from '../utils/cmsLogic';

interface FocusViewProps {
  lang: Language;
  role: Role;
  items: ContentItem[];
  onAddTopic: () => void;
  onEditTopic: (item: ContentItem) => void;
  onDeleteTopic: (item: ContentItem) => void;
  onOpenDetail: (item: ContentItem) => void;
}

export function FocusView({
  lang,
  role,
  items,
  onAddTopic,
  onEditTopic,
  onDeleteTopic,
  onOpenDetail,
}: FocusViewProps) {
  const copy = getCopy(lang);
  const canManage = isRoleAuthorized(role, 'manage_posts');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-slate-200">
        <div className="space-y-2 max-w-3xl">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight text-balance">
            {copy.focus.title}
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            {copy.focus.subtitle}
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={onAddTopic}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>{copy.focus.addBtn}</span>
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-12 text-center space-y-3">
          <p className="text-sm text-slate-600">{copy.focus.empty}</p>
          {canManage && (
            <button
              type="button"
              onClick={onAddTopic}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{copy.focus.addBtn}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((item, idx) => (
            <article
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col hover:border-sky-300 transition-colors"
            >
              <div className="aspect-[16/9] w-full bg-slate-100 relative overflow-hidden">
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
                  <Waves className="w-10 h-10 text-sky-300/40" aria-hidden="true" />
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono font-semibold text-sky-700 tabular-nums">
                        {String(idx + 1).padStart(2, '0')}.
                      </span>
                      <span>{pickText(item.category, lang)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.location}</span>
                    </div>

                    {canManage && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEditTopic(item)}
                          aria-label={`${copy.focus.editBtn} ${pickText(item.title, lang)}`}
                          className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        >
                          <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteTopic(item)}
                          aria-label={`${copy.focus.deleteBtn} ${pickText(item.title, lang)}`}
                          className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h2 className="font-display text-xl font-bold text-slate-900 leading-snug">
                    {pickText(item.title, lang)}
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {pickText(item.excerpt, lang)}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {item.author}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenDetail(item)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-600"
                  >
                    <span>{copy.focus.readTopic}</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
