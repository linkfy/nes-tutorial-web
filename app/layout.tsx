import './globals.css';
import type { Metadata } from 'next';
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler';

const BASE = process.env.NEXT_BASE_PATH || '';

export const metadata: Metadata = {
  title: 'NES Emulator Tutorial — TDD · linkfy',
  description:
    'Tutorial paso a paso para construir un emulador de NES en Python mediante Test Driven Development. 356 lecciones. / Step-by-step NES emulator tutorial by TDD.',
  icons: { icon: `${BASE}/favicon.svg`, shortcut: `${BASE}/favicon.svg` },
  openGraph: {
    title: 'NES Emulator Tutorial — TDD',
    description: 'Build a NES emulator in Python, one test at a time. 356 lessons by linkfy.',
    images: [`${BASE}/og-image.png`],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js"></script>
      </head>
      <body className="font-mono min-h-screen">
        {children}
        <ChunkLoadErrorHandler />
      </body>
    </html>
  );
}
