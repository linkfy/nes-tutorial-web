import Link from 'next/link';
import { Gamepad2, Github, GraduationCap } from 'lucide-react';
import { t, type Lang } from '@/lib/i18n';
import { LangSwitcher } from '@/components/lang-switcher';

export function SiteHeader({
  lang,
  altPath,
  children,
}: {
  lang: Lang;
  /** path after the language prefix, so the switcher keeps the reader on the same page */
  altPath?: string;
  children?: React.ReactNode;
}) {
  const s = t(lang);
  return (
    <header className="sticky top-0 z-40 bg-[#212121]/90 backdrop-blur border-b border-border">
      <div className="max-w-[1200px] mx-auto px-5 md:px-8 h-12 flex items-center gap-3">
        <Link href={`/${lang}`} className="flex items-center gap-2 text-heading font-bold hover:text-primary transition">
          <Gamepad2 size={18} className="text-primary" />
          <span className="hidden sm:inline">{s.siteTitle}</span>
          <span className="sm:hidden">NES TDD</span>
        </Link>
        <div className="flex-1 flex items-center gap-2 min-w-0">{children}</div>
        <a
          href="https://github.com/linkfy/nes-emulator-tutorial-tdd"
          target="_blank"
          rel="noreferrer"
          className="hidden md:inline-flex items-center gap-1 text-sm hover:text-heading transition"
          aria-label="GitHub"
        >
          <Github size={16} /> GitHub
        </a>
        <a
          href="https://minigen.io/"
          target="_blank"
          rel="noreferrer"
          title={s.academyTooltip}
          className="hidden md:inline-flex items-center gap-1 text-sm hover:text-heading transition"
        >
          <GraduationCap size={16} /> {s.academy}
        </a>
        <LangSwitcher lang={lang} path={altPath ?? ''} />
      </div>
    </header>
  );
}
