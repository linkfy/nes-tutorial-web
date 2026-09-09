import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';

let registered = false;
function ensure(): void {
  if (registered) return;
  try {
    hljs.registerLanguage('python', python);
    hljs.registerLanguage('bash', bash);
  } catch {
    /* already registered */
  }
  registered = true;
}

function escapeHtml(s: string): string {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const PY_HINT = /(\bdef\b|\bclass\b|\bimport\b|\bfrom\b|\breturn\b|\bself\b|\bassert\b|=|#|\bif\b|\bfor\b)/;

/** Server-side syntax highlighting. Returns safe HTML. */
export function highlightCode(code: string, language: 'python' | 'bash' | 'auto' = 'auto'): string {
  const src = code ?? '';
  ensure();
  try {
    if (language === 'auto') {
      const trimmed = src.trim();
      if (/^(uv |pytest|python|pip|git |cd |ls |\$ )/m.test(trimmed) && !PY_HINT.test(trimmed.replace(/uv run pytest.*/g, ''))) {
        return hljs.highlight(src, { language: 'bash' })?.value ?? escapeHtml(src);
      }
      if (!PY_HINT.test(trimmed)) return escapeHtml(src);
      return hljs.highlight(src, { language: 'python' })?.value ?? escapeHtml(src);
    }
    return hljs.highlight(src, { language })?.value ?? escapeHtml(src);
  } catch {
    return escapeHtml(src);
  }
}
