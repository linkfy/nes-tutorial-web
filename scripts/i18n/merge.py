#!/usr/bin/env python3
"""Merge reviewed chunk translations into the per-language data consumed by the site.

Outputs:
  data/i18n/lessons.<lang>.json  overlay {lesson: {title, summary, b<N>}} (server side)
  data/i18n/index.json           small {lang: [{n, chapter, slug, title}]} index (client side)
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
WORK = os.path.join(ROOT, '.i18n-work')
OUT = os.path.join(ROOT, 'data', 'i18n')
LANGS = ['es', 'zh', 'ru']


def main():
    base = json.load(open(os.path.join(ROOT, 'data', 'lessons.json'), encoding='utf-8'))
    lessons = base['lessons']
    os.makedirs(OUT, exist_ok=True)

    index = {'en': [{'n': l['n'], 'chapter': l['chapter'], 'slug': l['slug'],
                     'title': l['title'], 'summary': l['summary']} for l in lessons]}

    for lang in LANGS:
        overlay = {}
        d = os.path.join(WORK, 'final', lang)
        files = sorted(os.listdir(d)) if os.path.isdir(d) else []
        for name in files:
            if not name.endswith('.json'):
                continue
            with open(os.path.join(d, name), encoding='utf-8') as f:
                overlay.update(json.load(f))
        path = os.path.join(OUT, f'lessons.{lang}.json')
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(overlay, f, ensure_ascii=False, separators=(',', ':'))
        index[lang] = [{
            'n': l['n'], 'chapter': l['chapter'], 'slug': l['slug'],
            'title': overlay.get(str(l['n']), {}).get('title') or l['title'],
            'summary': overlay.get(str(l['n']), {}).get('summary') or l['summary'],
        } for l in lessons]
        print(f'{lang}: {len(overlay)}/{len(lessons)} lessons translated -> {path}')

    with open(os.path.join(OUT, 'index.json'), 'w', encoding='utf-8') as f:
        json.dump({'chapters': base['chapters'], 'lessons': index}, f,
                  ensure_ascii=False, separators=(',', ':'))
    print('index written')


if __name__ == '__main__':
    sys.exit(main())
