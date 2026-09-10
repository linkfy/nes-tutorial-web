import raw from '@/data/lessons.json';
import esRaw from '@/data/i18n/lessons.es.json';
import zhRaw from '@/data/i18n/lessons.zh.json';
import ruRaw from '@/data/i18n/lessons.ru.json';
import type { Lang } from '@/lib/i18n';

export type Block =
  | { t: 'p'; c: string }
  | { t: 'h'; c: string }
  | { t: 'code'; c: string }
  | { t: 'list'; c: string[] };

export interface LessonTest {
  name: string;
  doc: string;
}

export interface Lesson {
  n: number;
  slug: string;
  title: string;
  chapter: number;
  file: string;
  summary: string;
  blocks: Block[];
  code: string;
  tests: LessonTest[];
}

export interface ChapterMeta {
  n: number;
  dir: string;
  first: number;
  last: number;
}

interface Data {
  chapters: ChapterMeta[];
  lessons: Lesson[];
}

const data = (raw ?? { chapters: [], lessons: [] }) as unknown as Data;

export const lessons: Lesson[] = data?.lessons ?? [];
export const chapters: ChapterMeta[] = data?.chapters ?? [];

/** Per-lesson prose translations: { "12": { title, summary, "b3": "..." } }. */
type LessonOverlay = Record<string, Record<string, string | string[]>>;

const overlays: Record<Lang, LessonOverlay> = {
  en: {},
  es: (esRaw ?? {}) as LessonOverlay,
  zh: (zhRaw ?? {}) as LessonOverlay,
  ru: (ruRaw ?? {}) as LessonOverlay,
};

/** Returns the lesson with its prose replaced by the translation for `lang` (code untouched). */
function localize(lesson: Lesson, lang: Lang): Lesson {
  const tr = overlays?.[lang]?.[String(lesson?.n ?? 0)];
  if (!tr) return lesson;
  return {
    ...lesson,
    title: (tr.title as string) || lesson.title,
    summary: (tr.summary as string) || lesson.summary,
    blocks: (lesson?.blocks ?? []).map((b: Block, i: number) => {
      if (!b || b.t === 'code') return b;
      const c = tr[`b${i}`];
      if (c === undefined) return b;
      if (b.t === 'list') return Array.isArray(c) ? { t: 'list', c } : b;
      return typeof c === 'string' ? { ...b, c } : b;
    }),
  };
}

export function getLessons(lang: Lang = 'en'): Lesson[] {
  if (lang === 'en') return lessons;
  return (lessons ?? []).map((l: Lesson) => localize(l, lang));
}

export function getLesson(n: number, lang: Lang = 'en'): Lesson | undefined {
  const safe = Number(n);
  if (!Number.isFinite(safe)) return undefined;
  const lesson = lessons?.find?.((l: Lesson) => l?.n === safe);
  return lesson ? localize(lesson, lang) : undefined;
}

export function getChapterLessons(chapter: number, lang: Lang = 'en'): Lesson[] {
  return (lessons ?? []).filter((l: Lesson) => l?.chapter === chapter).map((l: Lesson) => localize(l, lang));
}

export interface ImplSnippet {
  header: string;
  code: string;
}

const EXCLUDED_HEADERS = /^(files? to|files? involved|locations?$|file and symbols|symbols to|steps to reproduce|manual command)/i;
const PYTHON_LIKE = /^\s*(def |class |import |from \w+ import|return |if |for |while |@|[A-Za-z_][\w.\[\]]* *(=|\+=|-=|\|=|&=))/m;

/** Code blocks from the lesson docstring that look like implementation examples (not file lists). */
export function getImplementationSnippets(lesson: Lesson | undefined): ImplSnippet[] {
  const blocks = lesson?.blocks ?? [];
  let header = '';
  const strict: ImplSnippet[] = [];
  const loose: ImplSnippet[] = [];
  for (const b of blocks) {
    if (!b) continue;
    if (b.t === 'h') {
      header = b.c ?? '';
      continue;
    }
    if (b.t !== 'code') continue;
    const code = b.c ?? '';
    if (header && EXCLUDED_HEADERS.test(header)) continue;
    const lineCount = code.split('\n').length;
    if (lineCount >= 3 && PYTHON_LIKE.test(code)) strict.push({ header, code });
    else if (lineCount >= 2) loose.push({ header, code });
  }
  return strict.length > 0 ? strict : loose;
}

export function pad(n: number): string {
  return String(n ?? 0).padStart(3, '0');
}
