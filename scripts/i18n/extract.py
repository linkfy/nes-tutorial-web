#!/usr/bin/env python3
"""Split the English lesson corpus into 10-lesson chunks of translatable strings.

Only prose is extracted: titles, summaries, headers, paragraphs and list items.
Code blocks are never sent to the translation agents.
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'data', 'lessons.json')
WORK = os.path.join(ROOT, '.i18n-work')
CHUNK_SIZE = 10


def lesson_strings(lesson):
    """Return {key: value} of translatable strings for one lesson."""
    out = {}
    out['title'] = lesson.get('title', '')
    out['summary'] = lesson.get('summary', '')
    for i, b in enumerate(lesson.get('blocks', [])):
        t = b.get('t')
        if t == 'code':
            continue
        out[f'b{i}'] = b.get('c')
    return out


def main():
    data = json.load(open(SRC, encoding='utf-8'))
    lessons = data['lessons']
    os.makedirs(os.path.join(WORK, 'src'), exist_ok=True)
    chunks = []
    for start in range(0, len(lessons), CHUNK_SIZE):
        group = lessons[start:start + CHUNK_SIZE]
        cid = start // CHUNK_SIZE + 1
        payload = {str(l['n']): lesson_strings(l) for l in group}
        path = os.path.join(WORK, 'src', f'chunk_{cid:03d}.json')
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(payload, f, ensure_ascii=False, indent=1)
        chunks.append({'id': cid, 'first': group[0]['n'], 'last': group[-1]['n'], 'path': path})
    with open(os.path.join(WORK, 'chunks.json'), 'w', encoding='utf-8') as f:
        json.dump(chunks, f, indent=1)
    print(f'{len(chunks)} chunks written to {WORK}/src')


if __name__ == '__main__':
    sys.exit(main())
