import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { ContentItem, ContentSection, Language } from '../types';
import { getCopy, IMAGE_PRESETS } from '../i18n/translations';
import type { PostPayload } from '../utils/api';
import { pickText, validatePostInput } from '../utils/cmsLogic';

interface PostModalProps {
  isOpen: boolean;
  lang: Language;
  defaultSection: ContentSection;
  editingItem: ContentItem | null;
  onClose: () => void;
  onSubmit: (payload: PostPayload, existingId?: string) => Promise<void>;
}

export function PostModal({
  isOpen,
  lang,
  defaultSection,
  editingItem,
  onClose,
  onSubmit,
}: PostModalProps) {
  const copy = getCopy(lang);

  const [section, setSection] = useState<ContentSection>(defaultSection);
  const [categoryId, setCategoryId] = useState('');
  const [categoryEn, setCategoryEn] = useState('');
  const [titleId, setTitleId] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [excerptId, setExcerptId] = useState('');
  const [excerptEn, setExcerptEn] = useState('');
  const [bodyId, setBodyId] = useState('');
  const [bodyEn, setBodyEn] = useState('');
  const [imageUrl, setImageUrl] = useState(IMAGE_PRESETS[0].url);
  const [author, setAuthor] = useState('Tim Yayasan Nata Bahari');
  const [location, setLocation] = useState('Kepulauan Seribu, Jakarta');
  const [targetGoalInput, setTargetGoalInput] = useState('500');
  const [unitLabelId, setUnitLabelId] = useState('Partisipan');
  const [unitLabelEn, setUnitLabelEn] = useState('Participants');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setSaving(false);
    if (editingItem) {
      setSection(editingItem.section);
      setCategoryId(editingItem.category.id);
      setCategoryEn(editingItem.category.en);
      setTitleId(editingItem.title.id);
      setTitleEn(editingItem.title.en);
      setExcerptId(editingItem.excerpt.id);
      setExcerptEn(editingItem.excerpt.en);
      setBodyId(editingItem.body.id);
      setBodyEn(editingItem.body.en);
      setImageUrl(editingItem.imageUrl);
      setAuthor(editingItem.author);
      setLocation(editingItem.location);
      setTargetGoalInput(String(editingItem.targetGoal ?? 500));
      setUnitLabelId(editingItem.unitLabel?.id ?? 'Partisipan');
      setUnitLabelEn(editingItem.unitLabel?.en ?? 'Participants');
    } else {
      setSection(defaultSection);
      setCategoryId('');
      setCategoryEn('');
      setTitleId('');
      setTitleEn('');
      setExcerptId('');
      setExcerptEn('');
      setBodyId('');
      setBodyEn('');
      setImageUrl(IMAGE_PRESETS[0].url);
      setAuthor('Tim Yayasan Nata Bahari');
      setLocation('Kepulauan Seribu, Jakarta');
      setTargetGoalInput('500');
      setUnitLabelId('Partisipan');
      setUnitLabelEn('Participants');
    }
  }, [isOpen, editingItem, defaultSection]);

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validatePostInput({
      titleId,
      excerptId,
      bodyId,
      categoryId,
      imageUrl,
    });
    if (err) {
      setError(err);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSubmit(
        {
          section,
          category: {
            id: categoryId.trim(),
            en: categoryEn.trim() || categoryId.trim(),
          },
          title: {
            id: titleId.trim(),
            en: titleEn.trim() || titleId.trim(),
          },
          excerpt: {
            id: excerptId.trim(),
            en: excerptEn.trim() || excerptId.trim(),
          },
          body: {
            id: bodyId.trim(),
            en: bodyEn.trim() || bodyId.trim(),
          },
          imageUrl: imageUrl.trim(),
          author: author.trim() || 'Tim Yayasan Nata Bahari',
          location: location.trim() || 'Indonesia',
          ...(section === 'konservasi'
            ? {
                targetGoal: Math.max(1, Math.round(Number(targetGoalInput)) || 500),
                unitLabel: {
                  id: unitLabelId.trim() || 'Partisipan',
                  en: unitLabelEn.trim() || unitLabelId.trim() || 'Participants',
                },
                ctaLabel: {
                  id: 'Ikut Beraksi',
                  en: 'Take Action',
                },
              }
            : {}),
        },
        editingItem?.id
      );
      onClose();
    } catch (submitErr) {
      setError(
        submitErr instanceof Error ? submitErr.message : 'Gagal menyimpan konten.'
      );
    } finally {
      setSaving(false);
    }
  };

  const modalTitle = editingItem
    ? lang === 'id'
      ? 'Edit Topik / Artikel'
      : 'Edit Topic / Article'
    : lang === 'id'
      ? 'Tambah Topik / Artikel Baru'
      : 'Create New Topic / Article';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <h2
            id="post-modal-title"
            className="font-display text-lg font-bold text-slate-900"
          >
            {modalTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.common.close}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <form
          onSubmit={handleFormSubmit}
          className="p-6 overflow-y-auto space-y-5"
        >
          {error && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium"
            >
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label
                htmlFor="post-section"
                className="block text-xs font-semibold text-slate-700"
              >
                {lang === 'id' ? 'Halaman Target' : 'Target Page'}
              </label>
              <select
                id="post-section"
                value={section}
                onChange={(e) => setSection(e.target.value as ContentSection)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="fokus">{copy.common.sectionFokus}</option>
                <option value="konservasi">{copy.common.sectionKonservasi}</option>
                <option value="kabar">{copy.common.sectionKabar}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="post-image-preset"
                className="block text-xs font-semibold text-slate-700"
              >
                {lang === 'id' ? 'Foto Sampul' : 'Cover Image'}
              </label>
              <select
                id="post-image-preset"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {IMAGE_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.url}>
                    {pickText(preset.label, lang)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="post-category-id"
                className="block text-xs font-semibold text-slate-700"
              >
                Kategori (ID) *
              </label>
              <input
                id="post-category-id"
                type="text"
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                placeholder="Restorasi Karang / Riset"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="post-category-en"
                className="block text-xs font-semibold text-slate-700"
              >
                Category (EN)
              </label>
              <input
                id="post-category-en"
                type="text"
                value={categoryEn}
                onChange={(e) => setCategoryEn(e.target.value)}
                placeholder="Coral Restoration / Research"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="post-title-id"
                className="block text-xs font-semibold text-slate-700"
              >
                Judul (ID) *
              </label>
              <input
                id="post-title-id"
                type="text"
                required
                value={titleId}
                onChange={(e) => setTitleId(e.target.value)}
                placeholder="Konservasi Padang Lamun Teluk Banten"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="post-title-en"
                className="block text-xs font-semibold text-slate-700"
              >
                Title (EN)
              </label>
              <input
                id="post-title-en"
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="Banten Bay Seagrass Meadow Conservation"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label
                htmlFor="post-excerpt-id"
                className="block text-xs font-semibold text-slate-700"
              >
                Ringkasan Singkat (ID) *
              </label>
              <textarea
                id="post-excerpt-id"
                rows={2}
                required
                value={excerptId}
                onChange={(e) => setExcerptId(e.target.value)}
                placeholder="Deskripsi ringkas untuk kartu dan slide carousel..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label
                htmlFor="post-excerpt-en"
                className="block text-xs font-semibold text-slate-700"
              >
                Short Excerpt (EN)
              </label>
              <textarea
                id="post-excerpt-en"
                rows={2}
                value={excerptEn}
                onChange={(e) => setExcerptEn(e.target.value)}
                placeholder="Optional English summary (defaults to Indonesian text if left blank)..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label
                htmlFor="post-body-id"
                className="block text-xs font-semibold text-slate-700"
              >
                Isi Lengkap (ID) *
              </label>
              <textarea
                id="post-body-id"
                rows={4}
                required
                value={bodyId}
                onChange={(e) => setBodyId(e.target.value)}
                placeholder="Uraian lengkap program, riset, atau kampanye..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label
                htmlFor="post-body-en"
                className="block text-xs font-semibold text-slate-700"
              >
                Full Body (EN)
              </label>
              <textarea
                id="post-body-en"
                rows={3}
                value={bodyEn}
                onChange={(e) => setBodyEn(e.target.value)}
                placeholder="Optional English body content..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="post-author"
                className="block text-xs font-semibold text-slate-700"
              >
                {copy.common.author}
              </label>
              <input
                id="post-author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="post-location"
                className="block text-xs font-semibold text-slate-700"
              >
                {copy.common.location}
              </label>
              <input
                id="post-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {section === 'konservasi' && (
              <>
                <div className="space-y-1 sm:col-span-2">
                  <label
                    htmlFor="post-target-goal"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    {lang === 'id' ? 'Target Kampanye' : 'Campaign Goal'}
                  </label>
                  <input
                    id="post-target-goal"
                    type="number"
                    min={1}
                    value={targetGoalInput}
                    onChange={(e) => setTargetGoalInput(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="post-unit-id"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Satuan Unit (ID)
                  </label>
                  <input
                    id="post-unit-id"
                    type="text"
                    value={unitLabelId}
                    onChange={(e) => setUnitLabelId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="post-unit-en"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Unit Label (EN)
                  </label>
                  <input
                    id="post-unit-en"
                    type="text"
                    value={unitLabelEn}
                    onChange={(e) => setUnitLabelEn(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {copy.common.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{saving ? '...' : copy.common.save}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
