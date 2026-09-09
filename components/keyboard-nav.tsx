'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function KeyboardNav({ prevHref, nextHref }: { prevHref?: string; nextHref?: string }) {
  const router = useRouter();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e?.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase?.() ?? '';
      if (tag === 'input' || tag === 'textarea' || e?.metaKey || e?.ctrlKey || e?.altKey) return;
      if (e?.key === 'ArrowLeft' && prevHref) router?.push?.(prevHref);
      if (e?.key === 'ArrowRight' && nextHref) router?.push?.(nextHref);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prevHref, nextHref, router]);
  return null;
}
