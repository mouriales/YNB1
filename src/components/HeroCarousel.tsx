import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Pause,
  Play,
  Waves,
} from 'lucide-react';
import type { ContentItem, Language } from '../types';
import { getCopy } from '../i18n/translations';
import { pickText } from '../utils/cmsLogic';

interface HeroCarouselProps {
  slides: ContentItem[];
  lang: Language;
  onOpenSlideTarget: (slide: ContentItem) => void;
}

export function HeroCarousel({
  slides,
  lang,
  onOpenSlideTarget,
}: HeroCarouselProps) {
  const copy = getCopy(lang);
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [imgFailed, setImgFailed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (activeIndex >= slides.length) {
      setActiveIndex(0);
    }
  }, [slides.length, activeIndex]);

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [autoPlay, slides.length]);

  if (slides.length === 0) {
    return null;
  }

  const current = slides[activeIndex] || slides[0];
  const sectionLabel =
    current.section === 'fokus'
      ? copy.common.sectionFokus
      : current.section === 'konservasi'
        ? copy.common.sectionKonservasi
        : copy.common.sectionKabar;

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label={copy.carousel.slideLabel}
      className="relative w-full bg-slate-950 overflow-hidden"
    >
      <div className="relative h-[500px] sm:h-[560px] lg:h-[600px] w-full">
        {!imgFailed[current.id] ? (
          <img
            key={current.id}
            src={current.imageUrl}
            alt={pickText(current.title, lang)}
            referrerPolicy="no-referrer"
            onError={() =>
              setImgFailed((prev) => ({ ...prev, [current.id]: true }))
            }
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-sky-950 to-slate-950 flex items-center justify-center">
            <Waves className="w-24 h-24 text-sky-500/20" aria-hidden="true" />
          </div>
        )}

        {/* Measured Contrast Scrim */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-950/25"
        />

        {/* Foreground Content */}
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-20 sm:pb-24">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-xs font-medium tracking-wide text-sky-300">
              <span className="tabular-nums font-mono">
                {String(activeIndex + 1).padStart(2, '0')} /{' '}
                {String(slides.length).padStart(2, '0')}
              </span>
              <span aria-hidden="true">·</span>
              <span>{sectionLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{pickText(current.category, lang)}</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight text-balance">
              {pickText(current.title, lang)}
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-200 leading-relaxed max-w-xl">
              {pickText(current.excerpt, lang)}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onOpenSlideTarget(current)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span>{copy.carousel.readMore}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <span className="text-xs text-slate-300">
                {current.location}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Controls Bar: Dots + Prev/Next + Auto-play Toggle */}
        <div className="absolute bottom-5 inset-x-0 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2" role="tablist" aria-label="Slide indicators">
            {slides.map((slide, idx) => {
              const selected = idx === activeIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-label={`Slide ${idx + 1}: ${pickText(slide.title, lang)}`}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    selected
                      ? 'w-8 bg-sky-400'
                      : 'w-2.5 bg-white/40 hover:bg-white/70'
                  }`}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={goPrev}
              aria-label={copy.carousel.prev}
              className="w-9 h-9 rounded-lg bg-slate-900/75 hover:bg-slate-900 text-white border border-white/15 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label={copy.carousel.next}
              className="w-9 h-9 rounded-lg bg-slate-900/75 hover:bg-slate-900 text-white border border-white/15 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setAutoPlay((prev) => !prev)}
              aria-label={autoPlay ? copy.carousel.pause : copy.carousel.play}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-slate-900/75 hover:bg-slate-900 text-slate-200 text-xs font-medium border border-white/15 transition-colors"
            >
              {autoPlay ? (
                <>
                  <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{lang === 'id' ? 'Jeda' : 'Pause'}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{lang === 'id' ? 'Putar' : 'Play'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
