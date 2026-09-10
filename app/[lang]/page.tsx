import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookOpen, Github, Terminal, Play, RefreshCw, CheckCircle2, XCircle, Wrench, Gamepad2, ChevronRight, Info } from 'lucide-react';
import { chapterLong, chapterName, isLang, t, type Lang } from '@/lib/i18n';
import { chapters, pad, type ChapterMeta } from '@/lib/lessons';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { CodeBlock } from '@/components/code-block';
import { Reveal } from '@/components/reveal';

export const dynamic = 'force-static';

const REPO = 'https://github.com/linkfy/nes-emulator-tutorial-tdd';
const FINAL = 'https://github.com/linkfy/N1_TDD';

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const L: Lang = lang;
  const s = t(L);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader lang={L} />
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-5 md:px-8">
        {/* Hero */}
        <section className="pt-14 pb-12">
          <Reveal>
            <p className="text-primary text-xs uppercase tracking-widest mb-3">{s.heroKicker}</p>
            <h1 className="text-[26px] md:text-4xl leading-tight">{s.siteTitle}</h1>
            <p className="mt-4 max-w-2xl">{s.tagline}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {s.author}: <span className="text-heading">linkfy</span> · 14 {s.chaptersWord} · 356 {s.lessons}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/${L}/lesson/1`}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-sm hover:brightness-110 transition"
              >
                <Play size={16} /> {s.startCourse}
              </Link>
              <a
                href={REPO}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-card text-heading px-4 py-2 rounded-sm hover:bg-[#1a1a1a] transition shadow"
              >
                <Github size={16} /> {s.viewRepo}
              </a>
              <a
                href={FINAL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-card text-heading px-4 py-2 rounded-sm hover:bg-[#1a1a1a] transition shadow"
              >
                <BookOpen size={16} /> {s.finalImpl}
              </a>
            </div>
          </Reveal>
        </section>

        {/* What is this */}
        <Reveal>
          <section className="bg-card rounded-sm p-6 md:p-8 shadow">
            <h2 className="text-[19.5px] flex items-center gap-2">
              <Info size={18} className="text-primary" /> {s.whatIsThis}
            </h2>
            <p className="mt-3">{s.whatIsThisText}</p>
            <div className="mt-5 border-l-2 border-primary pl-4">
              <p className="text-heading font-bold">{s.slowRoute}</p>
              <p className="mt-1 text-sm">{s.slowRouteText}</p>
            </div>
          </section>
        </Reveal>

        {/* Setup */}
        <section className="mt-12">
          <Reveal>
            <h2 className="text-[19.5px] flex items-center gap-2">
              <Terminal size={18} className="text-primary" /> {s.setup}
            </h2>
          </Reveal>
          <ol className="mt-5 space-y-5">
            <Reveal>
              <li className="bg-card rounded-sm p-5 shadow">
                <h3 className="text-base">1. {s.step1}</h3>
                <CodeBlock code={`git clone ${REPO}\ncd nes-emulator-tutorial-tdd`} language="bash" />
              </li>
            </Reveal>
            <Reveal>
              <li className="bg-card rounded-sm p-5 shadow">
                <h3 className="text-base">2. {s.step2}</h3>
                <p className="text-sm mt-1">{s.step2Text}</p>
                <CodeBlock code={`uv --version\nuv sync`} language="bash" />
                <p className="text-xs text-muted-foreground mt-2">
                  <a className="text-primary hover:underline" href="https://docs.astral.sh/uv/getting-started/installation/" target="_blank" rel="noreferrer">
                    docs.astral.sh/uv
                  </a>
                </p>
              </li>
            </Reveal>
            <Reveal>
              <li className="bg-card rounded-sm p-5 shadow">
                <h3 className="text-base">3. {s.step3}</h3>
                <p className="text-sm mt-1">{s.step3Text}</p>
                <CodeBlock code={`uv run pytest tests/chapter_01_cpu/test_001_initial_files.py -v`} language="bash" />
              </li>
            </Reveal>
            <Reveal>
              <li className="bg-card rounded-sm p-5 shadow">
                <h3 className="text-base">4. {s.step4}</h3>
                <p className="text-sm mt-1">{s.step4Text}</p>
                <p className="text-sm mt-3">{s.runAll}</p>
                <CodeBlock code={`uv run pytest`} language="bash" />
              </li>
            </Reveal>
          </ol>
        </section>

        {/* TDD loop */}
        <section className="mt-12">
          <Reveal>
            <h2 className="text-[19.5px] flex items-center gap-2">
              <RefreshCw size={18} className="text-primary" /> {s.tddLoopTitle}
            </h2>
          </Reveal>
          <div className="mt-5 grid md:grid-cols-3 gap-4">
            {[
              { icon: XCircle, title: s.red, text: s.redText, color: 'text-red-400' },
              { icon: CheckCircle2, title: s.green, text: s.greenText, color: 'text-primary' },
              { icon: Wrench, title: s.refactor, text: s.refactorText, color: 'text-heading' },
            ].map((item, i) => {
              const Icon = item?.icon ?? Info;
              return (
                <Reveal key={i} delay={i * 0.08}>
                  <div className="bg-card rounded-sm p-5 shadow h-full hover:bg-[#1c1c1c] transition">
                    <Icon size={22} className={item?.color ?? ''} />
                    <h3 className="mt-3 text-base">{item?.title}</h3>
                    <p className="text-sm mt-1">{item?.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <Reveal>
            <div className="mt-4 bg-card rounded-sm p-5 shadow text-sm">
              <p className="text-heading font-bold">{s.markers}</p>
              <p className="mt-1">{s.markersText}</p>
            </div>
          </Reveal>
        </section>

        {/* Curriculum */}
        <section className="mt-12" id="chapters">
          <Reveal>
            <h2 className="text-[19.5px] flex items-center gap-2">
              <BookOpen size={18} className="text-primary" /> {s.curriculum}
            </h2>
            <p className="mt-2 text-sm">{s.curriculumText}</p>
          </Reveal>
          <div className="mt-5 grid md:grid-cols-2 gap-3">
            {(chapters ?? []).map((ch: ChapterMeta, i: number) => (
              <Reveal key={ch?.n} delay={Math.min(i, 6) * 0.04}>
                <Link
                  href={`/${L}/lesson/${ch?.first ?? 1}`}
                  className="group flex items-start gap-4 bg-card rounded-sm p-4 shadow hover:bg-[#1c1c1c] transition h-full"
                >
                  <span className="text-primary font-bold text-lg w-8 shrink-0">{pad(ch?.n ?? 0).slice(1)}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-heading font-bold">{chapterName(ch?.n ?? 0, L)}</span>
                    <span className="block text-xs mt-1">{chapterLong(ch?.n ?? 0, L)}</span>
                    <span className="block text-xs text-muted-foreground mt-2">
                      {s.tests} {pad(ch?.first ?? 0)}–{pad(ch?.last ?? 0)} · {(ch?.last ?? 0) - (ch?.first ?? 0) + 1} {s.lessons}
                    </span>
                  </span>
                  <ChevronRight size={16} className="mt-1 text-muted-foreground group-hover:text-primary transition" />
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Manual ROMs */}
        <Reveal>
          <section className="mt-12 mb-16 bg-card rounded-sm p-6 shadow">
            <h2 className="text-[19.5px] flex items-center gap-2">
              <Gamepad2 size={18} className="text-primary" /> {s.manualRoms}
            </h2>
            <p className="mt-2 text-sm">{s.manualRomsText}</p>
          </section>
        </Reveal>
      </main>
      <SiteFooter lang={L} />
    </div>
  );
}
