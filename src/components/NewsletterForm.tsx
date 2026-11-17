import { useState, type FormEvent } from 'react';
import { AlertCircle, CheckCircle2, Mail, Send } from 'lucide-react';
import type { Language } from '../types';
import { getCopy } from '../i18n/translations';
import { subscribeNewsletter } from '../utils/api';
import { validateNewsletterEmail } from '../utils/cmsLogic';

interface NewsletterFormProps {
  lang: Language;
}

type FeedbackState =
  | { kind: 'idle' }
  | { kind: 'invalid' }
  | { kind: 'server_error'; message: string }
  | { kind: 'subscribed'; email: string; alreadySubscribed: boolean };

export function NewsletterForm({ lang }: NewsletterFormProps) {
  const copy = getCopy(lang).footer.newsletter;
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({ kind: 'idle' });

  const validationError = validateNewsletterEmail(email, lang);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const clientError = validateNewsletterEmail(email, lang);
    if (clientError) {
      setFeedback({ kind: 'invalid' });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ kind: 'idle' });

    try {
      const res = await subscribeNewsletter(email, lang);
      setFeedback({
        kind: 'subscribed',
        email: res.email,
        alreadySubscribed: res.alreadySubscribed,
      });
      setEmail('');
    } catch (err) {
      setFeedback({
        kind: 'server_error',
        message: err instanceof Error && err.message ? err.message : copy.errorFallback,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const errorMessage =
    feedback.kind === 'invalid'
      ? validationError || copy.errorFallback
      : feedback.kind === 'server_error'
        ? feedback.message
        : null;

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="rounded-xl bg-slate-800/60 border border-slate-800 p-6 sm:p-7 mb-12"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-6 space-y-1.5">
          <div className="flex items-center gap-2 text-sky-400">
            <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
            <h3
              id="newsletter-heading"
              className="font-display font-bold text-base sm:text-lg text-white tracking-tight"
            >
              {copy.title}
            </h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
            {copy.subtitle}
          </p>
        </div>

        <div className="lg:col-span-6">
          <form onSubmit={handleSubmit} noValidate className="space-y-2.5">
            <div className="flex flex-col sm:flex-row gap-3">
              <label htmlFor="footer-newsletter-email" className="sr-only">
                {copy.label}
              </label>
              <input
                id="footer-newsletter-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (feedback.kind !== 'idle') {
                    setFeedback({ kind: 'idle' });
                  }
                }}
                placeholder={copy.placeholder}
                aria-invalid={errorMessage ? 'true' : 'false'}
                aria-describedby={
                  errorMessage
                    ? 'newsletter-feedback'
                    : feedback.kind === 'subscribed'
                      ? 'newsletter-feedback'
                      : undefined
                }
                className="flex-1 min-w-0 bg-slate-900 border border-slate-700 text-white placeholder-slate-400 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-slate-950 font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{isSubmitting ? copy.submitting : copy.button}</span>
              </button>
            </div>

            {errorMessage && (
              <p
                id="newsletter-feedback"
                role="alert"
                className="flex items-center gap-2 text-xs text-rose-300"
              >
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{errorMessage}</span>
              </p>
            )}

            {feedback.kind === 'subscribed' && (
              <p
                id="newsletter-feedback"
                role="status"
                className="flex items-center gap-2 text-xs text-sky-300"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>
                  {feedback.alreadySubscribed
                    ? copy.alreadySubscribed
                    : copy.success}
                </span>
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
