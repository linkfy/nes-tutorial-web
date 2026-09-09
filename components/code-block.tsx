import { highlightCode } from '@/lib/highlight';

export function CodeBlock({
  code,
  language = 'auto',
  className = '',
}: {
  code: string;
  language?: 'python' | 'bash' | 'auto';
  className?: string;
}) {
  const html = highlightCode(code ?? '', language);
  return (
    <pre translate="no" className={`notranslate code-scroll bg-[#1b1b1b] rounded-sm p-4 mt-3 overflow-x-auto text-[13px] leading-relaxed ${className}`}>
      <code className="hljs" dangerouslySetInnerHTML={{ __html: html ?? '' }} />
    </pre>
  );
}
