/** Renders text with `backtick` spans as inline code. Server-safe. */
export function InlineCode({ text }: { text: string }) {
  const parts = (text ?? '').split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((p: string, i: number) =>
        p?.startsWith?.('`') && p?.endsWith?.('`') && p.length > 2 ? (
          <code key={i} translate="no" className="notranslate">{p.slice(1, -1)}</code>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}
