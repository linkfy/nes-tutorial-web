import Link from 'next/link';
import { Languages } from 'lucide-react';
import { LANGS, LANG_LABELS, t, type Lang } from '@/lib/i18n';

/**
 * Native language switcher: every language is a real, pre-rendered page,
 * so switching is just a link to the same route under another prefix.
 */
export function LangSwitcher({ lang, path = '' }: { lang: Lang; path?: string }) {
  const s = t(lang);
  return (
    <nav className="flex items-center gap-1" aria-label={s.language}>
      <Languages size={15} className="text-primary shrink-0" aria-hidden />
      <ul className="flex items-center gap-0.5">
        {LANGS.map((l: Lang) => (
          <li key={l}>
            <Link
              href={`/${l}${path}`}
              hrefLang={l}
              lang={l}
              aria-current={l === lang ? 'true' : undefined}
              className={`px-1.5 py-0.5 rounded-sm text-xs transition ${
                l === lang ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:text-heading hover:bg-card'
              }`}
            >
              {LANG_LABELS[l]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
