import { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  ArrowRight,
  X,
  CheckCircle2,
  Waves,
} from 'lucide-react';
import type { ContentItem, Language, Role } from '../types';
import { getCopy } from '../i18n/translations';
import {
  formatNumber,
  isRoleAuthorized,
  pickText,
  validateCampaignJoinInput,
} from '../utils/cmsLogic';

interface ConserveViewProps {
  lang: Language;
  role: Role;
  items: ContentItem[];
  onAddCampaign: () => void;
  onEditCampaign: (item: ContentItem) => void;
  onDeleteCampaign: (item: ContentItem) => void;
  onOpenDetail: (item: ContentItem) => void;
  onJoinCampaign: (
    campaignId: string,
    payload: { name: string; email: string; amount: number }
  ) => Promise<void>;
}

export function ConserveView({
  lang,
  role,
  items,
  onAddCampaign,
  onEditCampaign,
  onDeleteCampaign,
  onOpenDetail,
  onJoinCampaign,
}: ConserveViewProps) {
  const copy = getCopy(lang);
  const canManage = isRoleAuthorized(role, 'manage_posts');

  const [selectedCampaign, setSelectedCampaign] = useState<ContentItem | null>(
    null
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [amountInput, setAmountInput] = useState('5');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign) return;

    const parsedAmount = amountInput.trim() === '' ? Number.NaN : Number(amountInput);
    const clientErr = validateCampaignJoinInput(
      { name, email, amount: parsedAmount },
      lang
    );
    if (clientErr) {
      setFormError(clientErr);
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      await onJoinCampaign(selectedCampaign.id, {
        name: name.trim(),
        email: email.trim(),
        amount: parsedAmount,
      });
      setSuccessMsg(copy.conserve.thankYou);
      setName('');
      setEmail('');
      setAmountInput('5');
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Gagal mengirim komitmen.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-slate-200">
        <div className="space-y-2 max-w-3xl">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight text-balance">
            {copy.conserve.title}
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            {copy.conserve.subtitle}
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={onAddCampaign}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>{copy.conserve.addBtn}</span>
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-12 text-center space-y-3">
          <p className="text-sm text-slate-600">
            {lang === 'id'
              ? 'Belum ada kampanye konservasi yang dipublikasikan.'
              : 'No conservation campaigns published yet.'}
          </p>
          {canManage && (
            <button
              type="button"
              onClick={onAddCampaign}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{copy.conserve.addBtn}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {items.map((item) => {
          const goal = Math.max(1, item.targetGoal || 500);
          const progress = item.currentProgress || 0;
          const pct = Math.min(100, Math.round((progress / goal) * 100));
          const unit = pickText(item.unitLabel, lang) || (lang === 'id' ? 'Dukungan' : 'Pledges');
          const actionText = pickText(item.ctaLabel, lang) || copy.conserve.joinBtn;

          return (
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
                    <Waves className="w-10 h-10 text-sky-300/40" aria-hidden="true" />
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="font-semibold text-sky-700">
                        {pickText(item.category, lang)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{item.location}</span>
                    </div>

                    {canManage && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditCampaign(item)}
                          aria-label={`Edit ${pickText(item.title, lang)}`}
                          className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        >
                          <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteCampaign(item)}
                          aria-label={`Delete ${pickText(item.title, lang)}`}
                          className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h2 className="font-display text-lg font-bold text-slate-900 leading-snug">
                    {pickText(item.title, lang)}
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {pickText(item.excerpt, lang)}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-4 border-t border-slate-100 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">
                      {copy.conserve.progressLabel}
                    </span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {pct}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 tabular-nums">
                    {formatNumber(progress, lang)} / {formatNumber(goal, lang)}{' '}
                    {unit}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCampaign(item);
                      setFormError(null);
                      setSuccessMsg(null);
                      setAmountInput('5');
                    }}
                    className="flex-1 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    {actionText}
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenDetail(item)}
                    aria-label={`${copy.carousel.readMore} ${pickText(item.title, lang)}`}
                    className="p-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
        </div>
      )}

      {/* Participation / Volunteer Pledge Modal */}
      {selectedCampaign && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="join-campaign-title"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-sky-700">
                  {pickText(selectedCampaign.category, lang)}
                </p>
                <h2
                  id="join-campaign-title"
                  className="font-display text-lg font-bold text-slate-900 mt-0.5"
                >
                  {copy.conserve.modalTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCampaign(null)}
                aria-label={copy.common.close}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {successMsg ? (
              <div className="py-4 space-y-4 text-center">
                <CheckCircle2
                  className="w-10 h-10 text-emerald-600 mx-auto"
                  aria-hidden="true"
                />
                <p className="text-sm font-medium text-slate-900">
                  {successMsg}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedCampaign(null)}
                  className="w-full py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold"
                >
                  {copy.common.close}
                </button>
              </div>
            ) : (
              <form onSubmit={handleJoinSubmit} noValidate className="space-y-4">
                <p className="text-xs text-slate-600">
                  {pickText(selectedCampaign.title, lang)}
                </p>

                {formError && (
                  <div
                    role="alert"
                    className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs"
                  >
                    {formError}
                  </div>
                )}

                <div className="space-y-1">
                  <label
                    htmlFor="pledge-name"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    {copy.conserve.nameLabel}
                  </label>
                  <input
                    id="pledge-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Andi Pratama"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="pledge-email"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    {copy.conserve.emailLabel}
                  </label>
                  <input
                    id="pledge-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="andi@example.com"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="pledge-amount"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    {copy.conserve.contributionLabel} (
                    {pickText(selectedCampaign.unitLabel, lang) || 'Unit'})
                  </label>
                  <input
                    id="pledge-amount"
                    type="number"
                    min={1}
                    max={500}
                    required
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCampaign(null)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700"
                  >
                    {copy.common.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold disabled:opacity-60"
                  >
                    {submitting ? '...' : copy.conserve.submitAction}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
