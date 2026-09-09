import Link from 'next/link';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';
import { t, type Lang } from '@/lib/i18n';
import { pad, type Lesson } from '@/lib/lessons';

export function PrevNext({
  lang,
  prev,
  next,
  compact = false,
}: {
  lang: Lang;
  prev?: Lesson;
  next?: Lesson;
  compact?: boolean;
}) {
  const s = t(lang);
  const base = 'inline-flex items-center gap-2 rounded-sm transition';
  const btn = compact ? `${base} px-3 py-1.5 text-sm` : `${base} px-4 py-2`;
  return (
    <nav className={`flex items-stretch justify-between gap-3 ${compact ? 'mt-5' : 'mt-10 pt-6 border-t border-border'}`} aria-label={`${s.prev} / ${s.next}`}>
      {prev ? (
        <Link href={`/${lang}/lesson/${prev.n}`} className={`${btn} bg-card text-heading hover:bg-[#1a1a1a] shadow max-w-[48%]`}>
          <ArrowLeft size={16} className="shrink-0" />
          <span className="truncate">
            <span className="text-muted-foreground">{s.prev}: </span>
            {pad(prev.n)} {compact ? '' : prev.title}
          </span>
        </Link>
      ) : (
        <Link href={`/${lang}`} className={`${btn} bg-card text-heading hover:bg-[#1a1a1a] shadow`} title={s.firstLesson}>
          <Home size={16} /> {s.home}
        </Link>
      )}
      {next ? (
        <Link href={`/${lang}/lesson/${next.n}`} className={`${btn} bg-primary text-primary-foreground hover:brightness-110 shadow max-w-[48%] text-right`}>
          <span className="truncate">
            <span className="opacity-80">{s.next}: </span>
            {pad(next.n)} {compact ? '' : next.title}
          </span>
          <ArrowRight size={16} className="shrink-0" />
        </Link>
      ) : (
        <Link href={`/${lang}`} className={`${btn} bg-primary text-primary-foreground hover:brightness-110 shadow`} title={s.lastLesson}>
          {s.backToIndex} <Home size={16} />
        </Link>
      )}
    </nav>
  );
}
