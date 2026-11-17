import { useState, useEffect } from 'react';
import { X, Lock } from 'lucide-react';
import type { Language } from '../types';
import { getCopy } from '../i18n/translations';

interface AuthModalProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
}

export function AuthModal({ isOpen, lang, onClose, onLogin }: AuthModalProps) {
  const copy = getCopy(lang);
  const [email, setEmail] = useState('superadmin@natabahari.org');
  const [password, setPassword] = useState('NataSuper2026!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onLogin(email, password);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Autentikasi gagal.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-slate-900 text-sky-400 flex items-center justify-center">
              <Lock className="w-4 h-4" aria-hidden="true" />
            </span>
            <div>
              <h2
                id="auth-modal-title"
                className="font-display text-lg font-bold text-slate-900"
              >
                {copy.roles.signIn}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'id'
                  ? 'Masuk dengan akun Admin atau Super Admin'
                  : 'Sign in with your Admin or Super Admin account'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.common.close}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="auth-email"
              className="block text-xs font-semibold text-slate-700"
            >
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="auth-password"
              className="block text-xs font-semibold text-slate-700"
            >
              {lang === 'id' ? 'Kata Sandi' : 'Password'}
            </label>
            <input
              id="auth-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">
              {lang === 'id' ? 'Kredensial Demo:' : 'Demo Credentials:'}
            </p>
            <p className="font-mono text-[11px]">
              Super Admin: superadmin@natabahari.org / NataSuper2026!
            </p>
            <p className="font-mono text-[11px]">
              Admin: admin@natabahari.org / NataAdmin2026!
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700"
            >
              {copy.common.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold disabled:opacity-60"
            >
              {loading ? '...' : copy.roles.signIn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
