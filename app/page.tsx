import Link from 'next/link';

// Static landing page: works without JavaScript (meta refresh + visible link),
// so it behaves the same on GitHub Pages as in the preview.
const BASE = process.env.NEXT_BASE_PATH || '';

export default function RootRedirect() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <meta httpEquiv="refresh" content={`0; url=${BASE}/en/`} />
      <div className="text-center space-y-4 p-8">
        <h1 className="text-2xl">NES Emulator Tutorial — TDD</h1>
        <p>Redirecting...</p>
        <div className="flex gap-3 justify-center">
          <Link href="/en" className="bg-primary text-primary-foreground px-4 py-2 rounded-sm hover:brightness-110">
            Open the tutorial
          </Link>
        </div>
      </div>
    </main>
  );
}
