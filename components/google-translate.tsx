'use client';

import { useEffect } from 'react';
import { Languages } from 'lucide-react';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    _DumpException?: (e: unknown) => void;
    google?: {
      translate?: {
        TranslateElement?: new (
          opts: { pageLanguage: string; layout?: unknown; autoDisplay?: boolean },
          id: string,
        ) => unknown;
      };
    };
  }
}

const SCRIPT_ID = 'google-translate-script';

/** Google Translate widget: lets visitors pick any language for the whole page. */
export function GoogleTranslate({ pageLanguage, label }: { pageLanguage: string; label: string }) {
  useEffect(() => {
    const init = () => {
      try {
        const container = document.getElementById('google_translate_element');
        if (!container || container.childElementCount > 0) return;
        const TE = window.google?.translate?.TranslateElement;
        if (!TE) return;
        new TE({ pageLanguage, autoDisplay: false }, 'google_translate_element');
      } catch (err) {
        console.warn('Google Translate init failed', err);
      }
    };
    window.googleTranslateElementInit = init;
    // Google's loader rethrows its internal (non-fatal) exceptions as uncaught errors
    // unless a _DumpException hook already exists. Log them quietly instead.
    if (!window._DumpException) {
      window._DumpException = (e: unknown) => {
        console.warn('Google Translate internal exception', e);
      };
    }
    let cancelled = false;
    let attempt = 0;
    const load = () => {
      if (cancelled) return;
      document.getElementById(SCRIPT_ID)?.remove();
      attempt += 1;
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = `https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit&_r=${attempt}`;
      script.async = true;
      script.onload = () => {
        // Google sometimes answers with an empty body; retry if the library did not arrive.
        setTimeout(() => {
          if (!window.google?.translate?.TranslateElement && attempt < 4) load();
          else init();
        }, 1500);
      };
      script.onerror = () => {
        if (attempt < 4) {
          setTimeout(load, 1000 * attempt);
          return;
        }
        console.warn('Google Translate script could not be loaded; translation widget hidden');
        document.getElementById('gt-wrap')?.classList.add('hidden');
      };
      document.body.appendChild(script);
    };
    if (window.google?.translate?.TranslateElement) init();
    else load();
    return () => {
      cancelled = true;
    };
  }, [pageLanguage]);

  return (
    <div id="gt-wrap" className="gt-wrap inline-flex items-center gap-1 text-sm" title={label}>
      <Languages size={14} className="text-primary shrink-0" aria-hidden />
      <div id="google_translate_element" className="notranslate" translate="no" aria-label={label} />
    </div>
  );
}
