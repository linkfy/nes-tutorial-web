import Link from 'next/link';
import { t, type Lang } from '@/lib/i18n';

export function SiteFooter({ lang }: { lang: Lang }) {
  const s = t(lang);
  return (
    <footer className="bg-[#212121] border-t border-border">
      <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-6 text-xs flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <p>{s.footer}</p>
        <nav className="flex gap-4">
          <Link href={`/${lang}`} className="hover:text-heading">{s.home}</Link>
          <Link href={`/${lang}/lesson/1`} className="hover:text-heading">{s.startCourse}</Link>
          <a href="https://github.com/linkfy/nes-emulator-tutorial-tdd" target="_blank" rel="noreferrer" className="hover:text-heading">GitHub</a>
        </nav>
      </div>
    </footer>
  );
}
