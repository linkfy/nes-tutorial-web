'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronRight, List, Search, X } from 'lucide-react';
import { chapterName, t, type Lang } from '@/lib/i18n';
import { pad, type ChapterMeta } from '@/lib/lessons';
import { indexChapters as chapters, lessonIndex, type LessonEntry } from '@/lib/lesson-index';

export function LessonNav({ lang, current }: { lang: Lang; current: number }) {
  const s = t(lang);
  const lessons = lessonIndex(lang);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const currentChapter = lessons?.find?.((l: LessonEntry) => l?.n === current)?.chapter ?? 1;
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ [currentChapter]: true });
  // The drawer is portaled to <body>: the sticky header uses backdrop-filter, which would
  // otherwise become the containing block of the fixed panel and clip it to the header height.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setExpanded({ [currentChapter]: true });
  }, [currentChapter]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e?.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const q = (query ?? '').trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!q) return null;
    return (lessons ?? []).filter(
      (l: LessonEntry) => pad(l?.n ?? 0).includes(q) || (l?.title ?? '').toLowerCase().includes(q) || (l?.summary ?? '').toLowerCase().includes(q),
    );
  }, [q, lessons]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-sm bg-card text-heading px-3 py-1 rounded-sm hover:bg-[#1a1a1a] transition shadow"
        aria-label={s.index}
      >
        <List size={14} /> {s.index}
      </button>
      {mounted
        ? createPortal(
      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-50 bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              key="panel"
              className="fixed inset-y-0 left-0 z-50 w-[92vw] max-w-sm bg-[#212121] shadow-2xl flex flex-col"
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.2 }}
              aria-label={s.index}
            >
              <div className="flex items-center justify-between px-4 h-12 border-b border-border">
                <span className="text-heading font-bold">{s.index}</span>
                <button type="button" onClick={() => setOpen(false)} className="p-1 hover:text-heading" aria-label={s.closeIndex}>
                  <X size={18} />
                </button>
              </div>
              <div className="px-4 py-2 border-b border-border relative">
                <Search size={14} className="absolute left-7 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e?.target?.value ?? '')}
                  placeholder={`${s.searchLessons}…`}
                  className="w-full bg-background text-foreground rounded-sm pl-9 pr-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex-1 overflow-y-auto code-scroll px-2 py-2 text-sm">
                {filtered ? (
                  <ul className="space-y-0.5">
                    {filtered.length === 0 ? <li className="px-2 py-2 text-muted-foreground">—</li> : null}
                    {filtered.map((l: LessonEntry) => (
                      <li key={l?.n}>
                        <Link
                          href={`/${lang}/lesson/${l?.n}`}
                          onClick={() => setOpen(false)}
                          className={`block px-2 py-1 rounded-sm hover:bg-background truncate ${l?.n === current ? 'text-primary font-bold' : ''}`}
                        >
                          <span className="text-muted-foreground">{pad(l?.n ?? 0)}</span> {l?.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="space-y-1">
                    <li>
                      <Link href={`/${lang}`} onClick={() => setOpen(false)} className="block px-2 py-1 rounded-sm hover:bg-background text-heading">
                        {s.home}
                      </Link>
                    </li>
                    {(chapters ?? []).map((ch: ChapterMeta) => {
                      const isOpen = !!expanded?.[ch?.n ?? 0];
                      return (
                        <li key={ch?.n}>
                          <button
                            type="button"
                            onClick={() => setExpanded((e) => ({ ...(e ?? {}), [ch?.n ?? 0]: !isOpen }))}
                            className={`w-full flex items-center gap-1 px-2 py-1 rounded-sm hover:bg-background text-left ${ch?.n === currentChapter ? 'text-heading' : ''}`}
                          >
                            {isOpen ? <ChevronDown size={14} className="shrink-0" /> : <ChevronRight size={14} className="shrink-0" />}
                            <span className="text-primary font-bold">{pad(ch?.n ?? 0).slice(1)}</span>
                            <span className="truncate">{chapterName(ch?.n ?? 0, lang)}</span>
                            <span className="ml-auto text-xs text-muted-foreground">{pad(ch?.first ?? 0)}–{pad(ch?.last ?? 0)}</span>
                          </button>
                          {isOpen ? (
                            <ul className="ml-4 border-l border-border pl-2 my-1 space-y-0.5">
                              {(lessons ?? [])
                                .filter((l: LessonEntry) => l?.chapter === ch?.n)
                                .map((l: LessonEntry) => (
                                  <li key={l?.n}>
                                    <Link
                                      href={`/${lang}/lesson/${l?.n}`}
                                      onClick={() => setOpen(false)}
                                      className={`block px-2 py-0.5 rounded-sm hover:bg-background truncate text-[13px] ${l?.n === current ? 'text-primary font-bold' : ''}`}
                                    >
                                      <span className="text-muted-foreground">{pad(l?.n ?? 0)}</span> {l?.title}
                                    </Link>
                                  </li>
                                ))}
                            </ul>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground">{s.keyboardHint}</div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
