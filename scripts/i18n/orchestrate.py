#!/usr/bin/env python3
"""Main orchestrator: delegates the lesson corpus to parallel translation and review agents.

One agent per language per 10-lesson chunk (36 chunks x 3 languages), plus one independent
review agent per translated chunk. Agents run as separate `abacusai -p` processes.

  python3 scripts/i18n/orchestrate.py --langs es zh ru --concurrency 8
"""
import argparse
import json
import os
import subprocess
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from prompts import reviewer_prompt, translator_prompt  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
WORK = os.path.join(ROOT, '.i18n-work')
CLI = os.path.expanduser('~/.abacusai/bin/abacusai')
PRINT_LOCK = threading.Lock()


def log(msg):
    with PRINT_LOCK:
        print(f'[{time.strftime("%H:%M:%S")}] {msg}', flush=True)


def load_json(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def validate(src_path, out_path):
    """Structural check: same keys, same types, same list lengths, non-empty values."""
    src = load_json(src_path)
    try:
        out = load_json(out_path)
    except Exception as e:  # noqa: BLE001
        return f'invalid JSON: {e}'
    if set(src.keys()) != set(out.keys()):
        return f'lesson keys differ (missing {sorted(set(src) - set(out))[:5]})'
    for ln, fields in src.items():
        of = out.get(ln)
        if not isinstance(of, dict):
            return f'lesson {ln}: not an object'
        if set(fields.keys()) != set(of.keys()):
            return f'lesson {ln}: field keys differ'
        for k, v in fields.items():
            ov = of[k]
            if isinstance(v, list):
                if not isinstance(ov, list) or len(ov) != len(v):
                    return f'lesson {ln}.{k}: list length differs'
                if any((not isinstance(x, str)) or not x.strip() for x in ov):
                    return f'lesson {ln}.{k}: empty list item'
            else:
                if not isinstance(ov, str) or not ov.strip():
                    return f'lesson {ln}.{k}: empty or non-string'
    return None


def run_agent(prompt, cwd, timeout, tag='', stall=300, heartbeat=60):
    """Run one agent process, checking every minute what it is doing.

    An agent that produced nothing after `stall` seconds is considered hung
    (the CLI can dead-lock on a streaming error) and is killed so the caller retries.
    """
    cmd = [CLI, '-p', '--permission-mode', 'yolo', '--add-dir', WORK, prompt]
    p = subprocess.Popen(cmd, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    start = time.time()
    while True:
        try:
            out, err = p.communicate(timeout=heartbeat)
            return p.returncode, (out or '')[-800:], (err or '')[-400:]
        except subprocess.TimeoutExpired:
            pass
        elapsed = int(time.time() - start)
        log(f'{tag}: agent alive {elapsed}s')
        if elapsed >= min(stall, timeout):
            p.kill()
            try:
                p.communicate(timeout=30)
            except Exception:  # noqa: BLE001
                pass
            log(f'{tag}: agent stalled after {elapsed}s, killed for retry')
            return -1, '', 'stalled'


def task(lang, chunk, args):
    cid = chunk['id']
    src = chunk['path']
    draft = os.path.join(WORK, 'draft', lang, f'chunk_{cid:03d}.json')
    final = os.path.join(WORK, 'final', lang, f'chunk_{cid:03d}.json')
    os.makedirs(os.path.dirname(draft), exist_ok=True)
    os.makedirs(os.path.dirname(final), exist_ok=True)
    tag = f'{lang}/chunk_{cid:03d}'

    if args.only_missing and os.path.exists(final) and validate(src, final) is None:
        log(f'{tag}: already done, skipped')
        return tag, 'skipped'

    # --- stage 1: translation agent -------------------------------------------------
    if not (os.path.exists(draft) and validate(src, draft) is None):
        for attempt in range(1, args.retries + 1):
            aid = f'T-{lang}-{cid:03d}'
            log(f'{tag}: translating (agent {aid}, attempt {attempt})')
            rc, out, err = run_agent(
                translator_prompt(aid, lang, chunk['first'], chunk['last'], src, draft, tag),
                ROOT, args.timeout, tag=f'{tag} {aid}', stall=args.stall, heartbeat=args.heartbeat)
            problem = validate(src, draft) if os.path.exists(draft) else 'no output file'
            if rc == 0 and problem is None:
                break
            log(f'{tag}: translation attempt {attempt} failed ({problem or err or rc})')
            if os.path.exists(draft) and problem:
                os.remove(draft)
        else:
            return tag, 'translation-failed'

    # --- stage 2: review agent ------------------------------------------------------
    for attempt in range(1, args.retries + 1):
        aid = f'R-{lang}-{cid:03d}'
        log(f'{tag}: reviewing (agent {aid}, attempt {attempt})')
        rc, out, err = run_agent(
            reviewer_prompt(aid, lang, chunk['first'], chunk['last'], src, draft, final, tag),
            ROOT, args.timeout, tag=f'{tag} {aid}', stall=args.stall, heartbeat=args.heartbeat)
        problem = validate(src, final) if os.path.exists(final) else 'no output file'
        if rc == 0 and problem is None:
            log(f'{tag}: OK')
            return tag, 'ok'
        log(f'{tag}: review attempt {attempt} failed ({problem or err or rc})')
        if os.path.exists(final) and problem:
            os.remove(final)

    # review failed but the draft is structurally valid: keep the draft as final
    if validate(src, draft) is None:
        with open(draft, encoding='utf-8') as f:
            data = f.read()
        with open(final, 'w', encoding='utf-8') as f:
            f.write(data)
        log(f'{tag}: review failed, kept unreviewed draft')
        return tag, 'draft-only'
    return tag, 'review-failed'


def max_agents(pending, mem_per_agent):
    """Never more agents than pending jobs, and never more than free memory allows."""
    free_mb = 4096
    try:
        with open('/proc/meminfo', encoding='utf-8') as f:
            info = {l.split(':')[0]: int(l.split()[1]) for l in f if ':' in l}
        free_mb = info.get('MemAvailable', 4 << 20) // 1024
    except Exception:  # noqa: BLE001
        pass
    by_mem = max(4, int(free_mb * 0.8) // max(50, mem_per_agent))
    return max(1, min(pending, by_mem))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--langs', nargs='+', default=['es', 'zh', 'ru'])
    ap.add_argument('--chunks', nargs='*', type=int, help='chunk ids (default: all)')
    ap.add_argument('--concurrency', type=int, default=0,
                    help='0 = as many agents as the machine can hold (default)')
    ap.add_argument('--stall', type=int, default=300, help='kill an agent stuck this long')
    ap.add_argument('--heartbeat', type=int, default=60, help='status check interval per agent')
    ap.add_argument('--mem-per-agent', type=int, default=250, help='MB reserved per agent')
    ap.add_argument('--retries', type=int, default=2)
    ap.add_argument('--timeout', type=int, default=1800)
    ap.add_argument('--only-missing', action='store_true', default=True)
    ap.add_argument('--force', dest='only_missing', action='store_false')
    args = ap.parse_args()

    chunks = load_json(os.path.join(WORK, 'chunks.json'))
    if args.chunks:
        chunks = [c for c in chunks if c['id'] in args.chunks]

    jobs = [(lang, c) for lang in args.langs for c in chunks]
    if args.concurrency <= 0:
        args.concurrency = max_agents(len(jobs), args.mem_per_agent)
    log(f'orchestrator: {len(jobs)} chunk jobs '
        f'({len(chunks)} chunks x {len(args.langs)} languages), '
        f'{len(jobs) * 2} agents, concurrency {args.concurrency}')

    results = {}
    with ThreadPoolExecutor(max_workers=args.concurrency) as ex:
        futures = {ex.submit(task, lang, c, args): (lang, c['id']) for lang, c in jobs}
        done = 0
        for fut in as_completed(futures):
            tag, status = fut.result()
            results[tag] = status
            done += 1
            log(f'progress {done}/{len(jobs)} — {tag}: {status}')

    summary = {}
    for status in results.values():
        summary[status] = summary.get(status, 0) + 1
    log(f'summary: {summary}')
    with open(os.path.join(WORK, 'report.json'), 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=1, sort_keys=True)
    return 0 if not {k: v for k, v in results.items() if v.endswith('failed')} else 1


if __name__ == '__main__':
    sys.exit(main())
