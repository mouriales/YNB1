import { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Pencil,
  Save,
  X,
  Compass,
  Globe,
} from 'lucide-react';
import type { AboutContent, Language, Role } from '../types';
import { getCopy } from '../i18n/translations';
import { isRoleAuthorized, pickText, validateAboutInput } from '../utils/cmsLogic';
import { OfficeMap } from './OfficeMap';

interface AboutViewProps {
  lang: Language;
  role: Role;
  about: AboutContent;
  mapsApiKey: string;
  onSaveAbout: (updated: AboutContent) => Promise<void>;
}

export function AboutView({
  lang,
  role,
  about,
  mapsApiKey,
  onSaveAbout,
}: AboutViewProps) {
  const copy = getCopy(lang);
  const canEdit = isRoleAuthorized(role, 'edit_about');

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<AboutContent>(about);
  const [latInput, setLatInput] = useState(String(about.lat));
  const [lngInput, setLngInput] = useState(String(about.lng));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(about);
    setLatInput(String(about.lat));
    setLngInput(String(about.lng));
  }, [about]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLat = latInput.trim() === '' ? Number.NaN : Number(latInput);
    const parsedLng = lngInput.trim() === '' ? Number.NaN : Number(lngInput);
    const validationErr = validateAboutInput({
      email: draft.email,
      phone: draft.phone,
      lat: parsedLat,
      lng: parsedLng,
      profileId: draft.profile.id,
    });
    if (validationErr) {
      setError(validationErr);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSaveAbout({
        ...draft,
        lat: parsedLat,
        lng: parsedLng,
      });
      setEditing(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal menyimpan perubahan.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-slate-200">
        <div className="space-y-2 max-w-3xl">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight text-balance">
            {copy.about.title}
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            {copy.about.subtitle}
          </p>
        </div>

        {canEdit && !editing && (
          <button
            type="button"
            onClick={() => {
              setDraft(about);
              setLatInput(String(about.lat));
              setLngInput(String(about.lng));
              setError(null);
              setEditing(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <Pencil className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
            <span>{copy.about.editBtn}</span>
          </button>
        )}
      </div>

      {/* Super Admin Real-Time Inline Editor */}
      {canEdit && editing && (
        <form
          onSubmit={handleSave}
          className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-6"
        >
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <h2 className="font-display text-lg font-bold text-slate-900">
              {lang === 'id'
                ? 'Editor Profil & Lokasi (Super Admin)'
                : 'Profile & Map Coordinate Editor (Super Admin)'}
            </h2>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60"
              aria-label={copy.about.cancelBtn}
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium"
            >
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label
                htmlFor="about-profile-id"
                className="block text-xs font-semibold text-slate-700"
              >
                Profil Organisasi (ID)
              </label>
              <textarea
                id="about-profile-id"
                rows={3}
                value={draft.profile.id}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    profile: { ...draft.profile, id: e.target.value },
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="about-profile-en"
                className="block text-xs font-semibold text-slate-700"
              >
                Organization Profile (EN)
              </label>
              <textarea
                id="about-profile-en"
                rows={3}
                value={draft.profile.en}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    profile: { ...draft.profile, en: e.target.value },
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="about-vision-id"
                className="block text-xs font-semibold text-slate-700"
              >
                Visi (ID)
              </label>
              <textarea
                id="about-vision-id"
                rows={2}
                value={draft.vision.id}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    vision: { ...draft.vision, id: e.target.value },
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="about-vision-en"
                className="block text-xs font-semibold text-slate-700"
              >
                Vision (EN)
              </label>
              <textarea
                id="about-vision-en"
                rows={2}
                value={draft.vision.en}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    vision: { ...draft.vision, en: e.target.value },
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="about-email"
                className="block text-xs font-semibold text-slate-700"
              >
                {copy.about.emailLabel}
              </label>
              <input
                id="about-email"
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="about-phone"
                className="block text-xs font-semibold text-slate-700"
              >
                {copy.about.phoneLabel}
              </label>
              <input
                id="about-phone"
                type="text"
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label
                htmlFor="about-office-name"
                className="block text-xs font-semibold text-slate-700"
              >
                {lang === 'id' ? 'Nama Kantor / Stasiun Pesisir' : 'Coastal Office Name'}
              </label>
              <input
                id="about-office-name"
                type="text"
                value={draft.officeName}
                onChange={(e) =>
                  setDraft({ ...draft, officeName: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="about-address-id"
                className="block text-xs font-semibold text-slate-700"
              >
                Alamat Lengkap (ID)
              </label>
              <input
                id="about-address-id"
                type="text"
                value={draft.address.id}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    address: { ...draft.address, id: e.target.value },
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="about-address-en"
                className="block text-xs font-semibold text-slate-700"
              >
                Full Address (EN)
              </label>
              <input
                id="about-address-en"
                type="text"
                value={draft.address.en}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    address: { ...draft.address, en: e.target.value },
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="about-lat"
                className="block text-xs font-semibold text-slate-700"
              >
                Latitude (e.g. -6.1088)
              </label>
              <input
                id="about-lat"
                type="number"
                step="0.0001"
                value={latInput}
                onChange={(e) => setLatInput(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="about-lng"
                className="block text-xs font-semibold text-slate-700"
              >
                Longitude (e.g. 106.7745)
              </label>
              <input
                id="about-lng"
                type="number"
                step="0.0001"
                value={lngInput}
                onChange={(e) => setLngInput(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              {copy.about.cancelBtn}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{saving ? '...' : copy.about.saveBtn}</span>
            </button>
          </div>
        </form>
      )}

      {/* Main Content: Profile / Vision / Mission + Contact Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-10">
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-slate-900">
              {copy.about.profileTitle}
            </h2>
            <p className="text-base text-slate-700 leading-relaxed max-w-prose">
              {pickText(about.profile, lang)}
            </p>
          </section>

          <section className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <h2 className="font-display text-lg font-bold text-slate-900">
              {copy.about.visionTitle}
            </h2>
            <p className="text-base text-slate-700 leading-relaxed">
              {pickText(about.vision, lang)}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold text-slate-900">
              {copy.about.missionTitle}
            </h2>
            <ol className="divide-y divide-slate-200 border-t border-b border-slate-200">
              {about.mission.map((item, idx) => (
                <li key={idx} className="py-4 flex items-start gap-4">
                  <span className="font-mono text-xs font-semibold text-sky-700 pt-1 tabular-nums">
                    0{idx + 1}.
                  </span>
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                    {pickText(item, lang)}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Contact Column */}
        <aside className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
            <h2 className="font-display text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
              {copy.about.contactTitle}
            </h2>

            <dl className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <dt className="text-xs font-semibold text-slate-500">
                    {copy.about.emailLabel}
                  </dt>
                  <dd className="text-slate-900 font-medium mt-0.5">
                    {about.email}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <dt className="text-xs font-semibold text-slate-500">
                    {copy.about.phoneLabel}
                  </dt>
                  <dd className="text-slate-900 font-medium mt-0.5 tabular-nums">
                    {about.phone}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <dt className="text-xs font-semibold text-slate-500">
                    {copy.about.addressLabel}
                  </dt>
                  <dd className="text-slate-700 leading-relaxed mt-0.5">
                    {pickText(about.address, lang)}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Compass className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <dt className="text-xs font-semibold text-slate-500">
                    {copy.about.coordinatesLabel}
                  </dt>
                  <dd className="font-mono text-xs text-slate-800 mt-0.5 tabular-nums">
                    {about.lat.toFixed(4)}, {about.lng.toFixed(4)}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                <Globe className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" aria-hidden="true" />
                <div className="space-y-1">
                  <dt className="text-xs font-semibold text-slate-500">
                    {copy.about.socialLabel}
                  </dt>
                  <dd className="text-xs text-slate-700 space-y-1">
                    <p>Instagram: {about.instagram}</p>
                    <p>LinkedIn: {about.linkedin}</p>
                    <p>YouTube: {about.youtube}</p>
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      {/* Interactive Google Maps Section */}
      <section className="space-y-4 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl font-bold text-slate-900">
            {copy.about.mapTitle}
          </h2>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            {about.officeName}
          </span>
        </div>
        <OfficeMap
          apiKey={mapsApiKey}
          lat={about.lat}
          lng={about.lng}
          officeName={about.officeName}
          address={pickText(about.address, lang)}
          lang={lang}
        />
      </section>
    </div>
  );
}
