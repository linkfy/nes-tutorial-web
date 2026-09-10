#!/usr/bin/env node
/**
 * Static export post-step: every page under out/<lang>/ must declare its real language.
 * Next renders <html lang> from the root layout, which cannot know the route segment.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const OUT = process.env.NEXT_EXPORT_DIR || 'out';
const TAGS = { en: 'en', es: 'es', zh: 'zh-CN', ru: 'ru' };

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(p)));
    else if (e.name.endsWith('.html')) files.push(p);
  }
  return files;
}

async function main() {
  if (!existsSync(OUT)) {
    console.error(`postbuild-lang: ${OUT}/ not found, nothing to do`);
    return;
  }
  let patched = 0;
  for (const [lang, tag] of Object.entries(TAGS)) {
    const dir = path.join(OUT, lang);
    if (!existsSync(dir)) continue;
    for (const file of await walk(dir)) {
      const html = await readFile(file, 'utf8');
      const next = html.replace(/<html([^>]*?)\slang="[^"]*"/i, `<html$1 lang="${tag}"`);
      if (next !== html) {
        await writeFile(file, next);
        patched += 1;
      }
    }
  }
  console.log(`postbuild-lang: ${patched} pages tagged with their language`);
}

main();
