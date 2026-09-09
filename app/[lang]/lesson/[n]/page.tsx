import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { FileCode2, FlaskConical, Terminal } from 'lucide-react';
import { chapterName, isLang, LANGS, t, translateHeader, type Lang } from '@/lib/i18n';
import { getImplementationSnippets, getLesson, lessons, pad, type Block, type ImplSnippet, type Lesson, type LessonTest } from '@/lib/lessons';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { CodeBlock } from '@/components/code-block';
import { LessonNav } from '@/components/lesson-nav';
import { PrevNext } from '@/components/prev-next';
import { KeyboardNav } from '@/components/keyboard-nav';
import { InlineCode } from '@/components/inline-code';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  const out: { lang: string; n: string }[] = [];
  for (const lang of LANGS) {
    for (const l of lessons ?? []) out.push({ lang, n: String(l?.n ?? 0) });
  }
  return out;
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; n: string }> }): Promise<Metadata> {
  const { lang, n } = await params;
  const lesson = getLesson(Number(n));
  const L: Lang = isLang(lang) ? lang : 'en';
  const s = t(L);
  return {
    title: `${s.lesson} ${pad(lesson?.n ?? 0)} — ${lesson?.title ?? ''} · ${s.siteTitle}`,
    description: lesson?.summary ?? '',
  };
}

function renderBlocks(blocks: Block[], lang: Lang) {
  return (blocks ?? []).map((b: Block, i: number) => {
    if (!b) return null;
    if (b.t === 'h') {
      return (
        <h3 key={i} className="mt-7 mb-2 text-[15px] text-primary uppercase tracking-wide">
          {translateHeader(b.c ?? '', lang)}
        </h3>
      );
    }
    if (b.t === 'code') {
      return <CodeBlock key={i} code={b.c ?? ''} />;
    }
    if (b.t === 'list') {
      return (
        <ul key={i} className="mt-2 space-y-1 list-disc pl-6">
          {(b.c ?? []).map((item: string, j: number) => (
            <li key={j}>
              <InlineCode text={item ?? ''} />
            </li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="mt-3">
        <InlineCode text={b.c ?? ''} />
      </p>
    );
  });
}

export default async function LessonPage({ params }: { params: Promise<{ lang: string; n: string }> }) {
  const { lang, n } = await params;
  if (!isLang(lang)) notFound();
  const L: Lang = lang;
  const s = t(L);
  const num = Number(n);
  const lesson: Lesson | undefined = getLesson(num);
  if (!lesson) notFound();

  const prev = getLesson(num - 1);
  const next = getLesson(num + 1);
  const total = lessons?.length ?? 0;
  const snippets: ImplSnippet[] = getImplementationSnippets(lesson);
  const hasImpl = snippets.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader lang={L} altPath={`/lesson/${num}`}>
        <LessonNav lang={L} current={num} />
        <span className="hidden lg:inline text-xs text-muted-foreground truncate">
          {s.chapter} {pad(lesson?.chapter ?? 0).slice(1)} · {chapterName(lesson?.chapter ?? 0, L)}
        </span>
      </SiteHeader>
      <KeyboardNav prevHref={prev ? `/${L}/lesson/${prev.n}` : undefined} nextHref={next ? `/${L}/lesson/${next.n}` : undefined} />

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-5 md:px-8 py-8">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,46%)] gap-8">
          {/* Lesson content */}
          <article className="min-w-0">
            <nav className="text-xs text-muted-foreground flex flex-wrap items-center gap-1">
              <Link href={`/${L}`} className="hover:text-heading">{s.home}</Link>
              <span>/</span>
              <Link href={`/${L}#chapters`} className="hover:text-heading">
                {s.chapter} {pad(lesson?.chapter ?? 0).slice(1)}: {chapterName(lesson?.chapter ?? 0, L)}
              </Link>
              <span>/</span>
              <span className="text-foreground">{s.lesson} {pad(lesson?.n ?? 0)}</span>
            </nav>

            <h1 className="mt-4 text-[26px] leading-tight">
              <span className="text-primary">{pad(lesson?.n ?? 0)}.</span> {lesson?.title}
            </h1>
            <p className="mt-2 text-heading">{lesson?.summary}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {s.lesson} {lesson?.n} {s.lessonOf} {total} · <span className="font-mono">{lesson?.file}</span>
            </p>

            <PrevNext lang={L} prev={prev} next={next} compact />

            <div className="lesson-prose mt-6">{renderBlocks(lesson?.blocks ?? [], L)}</div>

            <div className="mt-8 bg-card rounded-sm p-4 shadow text-sm">
              <p className="text-heading font-bold flex items-center gap-2">
                <Terminal size={16} className="text-primary" /> {s.runThis}
              </p>
              <CodeBlock code={`uv run pytest ${lesson?.file ?? ''} -v`} language="bash" />
            </div>

            <PrevNext lang={L} prev={prev} next={next} />
          </article>

          {/* Code panel */}
          <aside className="min-w-0">
            <div className="lg:sticky lg:top-16 bg-card rounded-sm shadow overflow-hidden">
              <div className="px-4 py-2 border-b border-border flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-heading text-sm font-bold">
                  <FileCode2 size={16} className="text-primary" /> {hasImpl ? s.implCode : s.testCode}
                </span>
                {!hasImpl ? <span className="text-xs text-muted-foreground truncate">{lesson?.slug}.py</span> : null}
              </div>
              <div className="code-scroll overflow-auto lg:max-h-[calc(100vh-9rem)]">
                {hasImpl ? (
                  snippets.map((sn: ImplSnippet, i: number) => (
                    <div key={i} className={i > 0 ? 'border-t border-border' : ''}>
                      {sn?.header ? (
                        <p className="px-4 pt-3 text-[11px] uppercase tracking-wide text-primary">
                          {translateHeader(sn.header, L)}
                        </p>
                      ) : null}
                      <CodeBlock code={sn?.code ?? ''} language="python" className="!mt-0 !rounded-none !bg-transparent" />
                    </div>
                  ))
                ) : (
                  <>
                    <p className="px-4 pt-3 text-xs text-muted-foreground">{s.implFallback}</p>
                    <CodeBlock code={lesson?.code ?? ''} language="python" className="!mt-0 !rounded-none !bg-transparent" />
                  </>
                )}
              </div>
              {hasImpl ? (
                <details className="border-t border-border text-xs group">
                  <summary className="px-4 py-3 cursor-pointer flex items-center gap-2 text-heading font-bold hover:text-primary select-none">
                    <FlaskConical size={14} className="text-primary" /> {s.showTest}
                    <span className="text-muted-foreground font-normal truncate">{lesson?.slug}.py</span>
                  </summary>
                  <div className="code-scroll overflow-auto max-h-[50vh]">
                    <CodeBlock code={lesson?.code ?? ''} language="python" className="!mt-0 !rounded-none !bg-transparent" />
                  </div>
                  {(lesson?.tests?.length ?? 0) > 0 ? (
                    <div className="px-4 py-3 border-t border-border">
                      <p className="text-heading font-bold mb-1">{s.testsInFile} ({lesson?.tests?.length ?? 0})</p>
                      <ul className="space-y-0.5">
                        {(lesson?.tests ?? []).map((tt: LessonTest) => (
                          <li key={tt?.name} className="truncate">
                            <code className="text-foreground">{tt?.name}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </details>
              ) : null}
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter lang={L} />
    </div>
  );
}
