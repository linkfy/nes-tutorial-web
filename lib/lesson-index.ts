import indexRaw from '@/data/i18n/index.json';
import type { Lang } from '@/lib/i18n';
import type { ChapterMeta } from '@/lib/lessons';

/** Lightweight per-language lesson list for client components (no code payload). */
export interface LessonEntry {
  n: number;
  chapter: number;
  slug: string;
  title: string;
  summary: string;
}

interface IndexData {
  chapters: ChapterMeta[];
  lessons: Record<string, LessonEntry[]>;
}

const data = (indexRaw ?? { chapters: [], lessons: {} }) as unknown as IndexData;

export const indexChapters: ChapterMeta[] = data?.chapters ?? [];

export function lessonIndex(lang: Lang): LessonEntry[] {
  return data?.lessons?.[lang] ?? data?.lessons?.en ?? [];
}
