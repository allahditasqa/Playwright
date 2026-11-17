// Custom Playwright reporter. For every run it produces:
//   1. BEFORE the tests start: reports/<module>/<sub> test cases <DD-MM-YYYY>_<HH-mm>.csv
//      (only the test cases that are about to run, with steps and expected results from docs/test-cases)
//   2. AFTER the run: reports/<module>/<sub> test <DD-MM-YYYY>_<HH-mm>.html
//      (one self-contained HTML file per module, screenshots embedded, opens without a server)
//   3. reports/index.html: run history, newest run on top, module-wise rows under each run
//      (data lives in reports/history.json; it is rebuilt from the report files if it is deleted)
// Old reports are never overwritten because the date and time are part of the file name.
//
// Module and sub-module come from the spec path: tests/<module>/<sub>.spec.ts
import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
// The CSV and test-case helpers are shared with the CLI scripts, so they live in a plain JS file.
const { buildRows, toCsv, checkMaster } = require('../scripts/export-test-cases.js') as {
  buildRows: (module: string, sub: string, tests: { id: string; title: string }[]) => string[][];
  toCsv: (rows: string[][]) => string;
  checkMaster: () => string[];
};

interface Row {
  id: string;
  title: string;
  group: string;
  status: string;
  duration: number;
  retry: number;
  error: string;
  shots: { name: string; src: string }[];
}

interface Group {
  module: string;
  sub: string;
  rows: Map<string, Row>;
}

/** One report file = one entry in history.json. */
interface Entry {
  module: string;
  sub: string;
  file: string; // relative to the reports folder
  csv?: string;
  results?: Record<string, string>; // test case id -> status (used by the sign-off generator)
  ts: string;
  date: string; // DD-MM-YYYY
  time: string; // HH:mm
  total: number;
  passed: number;
  failed: number;
  skipped: number;
}

/* eslint-disable no-control-regex -- strips ANSI colour codes (\u001b) from error messages on purpose */
const esc = (s: string) =>
  s
    .replace(/\u001b\[[0-9;]*m/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
/* eslint-enable no-control-regex */

const pretty = (s: string) => s.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const two = (n: number) => String(n).padStart(2, '0');

const STYLE = `
:root{--bg:#f6f7f9;--fg:#1c1f24;--card:#fff;--line:#dde1e6;--pass:#1a7f37;--fail:#cf222e;--skip:#8a6d00;--mute:#6b7380}
@media(prefers-color-scheme:dark){:root{--bg:#14161a;--fg:#e6e8eb;--card:#1d2026;--line:#2e333b;--pass:#3fb950;--fail:#ff7b72;--skip:#d4a72c;--mute:#9aa3b0}}
body{margin:0;padding:24px 16px;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,Segoe UI,sans-serif}
main{max-width:1100px;margin:auto}h1{margin:0 0 4px}h2{margin:28px 0 8px}.meta{color:var(--mute);font-size:13px}a{color:inherit}
.sum{display:flex;gap:12px;flex-wrap:wrap;margin:16px 0}.sum div{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:10px 16px}
.sum b{font-size:22px;display:block}.card{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--line);border-radius:8px;padding:12px 16px;margin:12px 0}
.card.pass{border-left-color:var(--pass)}.card.fail{border-left-color:var(--fail)}.card.skip{border-left-color:var(--skip)}
.head{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}.badge{font-size:12px;text-transform:uppercase;padding:2px 8px;border-radius:99px;border:1px solid currentColor}
.badge.pass{color:var(--pass)}.badge.fail{color:var(--fail)}.badge.skip{color:var(--skip)}
pre{background:var(--bg);padding:10px;border-radius:6px;overflow:auto;white-space:pre-wrap;color:var(--fail)}
.shots{display:flex;gap:12px;flex-wrap:wrap;margin-top:10px}figure{margin:0}img{max-width:300px;border:1px solid var(--line);border-radius:6px;cursor:zoom-in}
img.big{max-width:100%;cursor:zoom-out}figcaption{font-size:12px;color:var(--mute)}
table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line)}th,td{text-align:left;padding:8px 12px;border-bottom:1px solid var(--line)}
.pass-t{color:var(--pass)}.fail-t{color:var(--fail)}.skip-t{color:var(--skip)}
`;

export default class OfflineReporter implements Reporter {
  private groups = new Map<string, Group>();
  private startedAt = new Date();
  private bases = new Map<string, string>(); // module/sub -> report file name without extension
  private csvFiles = new Map<string, string>(); // module/sub -> relative CSV path
  private reportsDir: string;
  private autoOpen: boolean;

  constructor(options: { outputDir?: string; open?: boolean } = {}) {
    this.reportsDir = path.resolve(options.outputDir ?? 'reports');
    // Open the report in the browser when the run ends (not on CI, and not when OFFLINE_REPORT_OPEN=0)
    this.autoOpen = (options.open ?? true) && !process.env.CI && process.env.OFFLINE_REPORT_OPEN !== '0';
  }

  /** Runs before the first test: writes the CSV of the test cases that are about to run. */
  onBegin(_config: FullConfig, suite: Suite): void {
    this.startedAt = new Date();
    if (process.argv.includes('--list')) return; // only listing tests: write nothing

    try {
      const stale = checkMaster();
      if (stale.length)
        console.log(`\nNOTE: master test case CSV is out of date (${stale.join(', ')}). Run: npm run cases:csv`);
    } catch {
      /* the check is a courtesy, never block a run */
    }

    const d = this.startedAt;
    const stamp = `${two(d.getDate())}-${two(d.getMonth() + 1)}-${d.getFullYear()}_${two(d.getHours())}-${two(d.getMinutes())}`;
    const planned = new Map<string, { module: string; sub: string; tests: { id: string; title: string }[] }>();
    for (const test of suite.allTests()) {
      const { module, sub } = this.locate(test);
      if (module === 'setup') continue;
      const key = `${module}/${sub}`;
      if (!planned.has(key)) planned.set(key, { module, sub, tests: [] });
      planned.get(key)!.tests.push({ id: test.title.match(/TC_[A-Z0-9_.]+/)?.[0] ?? '', title: test.title });
    }

    for (const [key, p] of planned) {
      const dir = path.join(this.reportsDir, p.module);
      fs.mkdirSync(dir, { recursive: true });
      // "<sub> test DD-MM-YYYY_HH-mm". A second run in the same minute gets the seconds appended.
      let base = `${p.sub.replace(/[-_]/g, ' ')} test ${stamp}`;
      if (fs.existsSync(path.join(dir, `${base}.html`)) || fs.existsSync(path.join(dir, this.csvName(base)))) {
        base += `-${two(d.getSeconds())}`;
      }
      this.bases.set(key, base);
      fs.writeFileSync(path.join(dir, this.csvName(base)), toCsv(buildRows(p.module, p.sub, p.tests)), 'utf8');
      this.csvFiles.set(key, `${p.module}/${this.csvName(base)}`);
      console.log(`Test cases CSV (${p.tests.length} cases): ${path.join(dir, this.csvName(base))}`);
    }
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const { module, sub } = this.locate(test);
    if (module === 'setup') return;
    const key = `${module}/${sub}`;
    if (!this.groups.has(key)) this.groups.set(key, { module, sub, rows: new Map() });

    const shots = result.attachments
      .filter((a) => a.contentType.startsWith('image/'))
      .map((a) => {
        const buffer = a.body ?? (a.path ? fs.readFileSync(a.path) : null);
        return buffer ? { name: a.name, src: `data:${a.contentType};base64,${buffer.toString('base64')}` } : null;
      })
      .filter((shot): shot is { name: string; src: string } => shot !== null);

    // On a retry the last attempt wins
    this.groups.get(key)!.rows.set(test.id, {
      id: test.title.match(/TC_[A-Z0-9_.]+/)?.[0] ?? '',
      title: test.title,
      group: test.titlePath().slice(2, -1).join(' › '),
      status: result.status,
      duration: result.duration,
      retry: result.retry,
      error: result.error ? (result.error.message ?? String(result.error)) : '',
      shots,
    });
  }

  onEnd(result: FullResult): void {
    if (this.groups.size === 0) return; // nothing ran (for example --list)

    const d = this.startedAt;
    const date = `${two(d.getDate())}-${two(d.getMonth() + 1)}-${d.getFullYear()}`;
    const stamp = `${date}_${two(d.getHours())}-${two(d.getMinutes())}`;
    const durationSec = Math.round((Date.now() - d.getTime()) / 1000);

    const historyFile = path.join(this.reportsDir, 'history.json');
    let history: Entry[] = [];
    try {
      history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    } catch {
      /* first run */
    }

    const written: string[] = [];
    const groups = [...this.groups.values()].sort((a, b) =>
      `${a.module}/${a.sub}`.localeCompare(`${b.module}/${b.sub}`),
    );
    for (const g of groups) {
      const rows = [...g.rows.values()].sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));
      const key = `${g.module}/${g.sub}`;
      const name = `${this.bases.get(key) ?? `${g.sub.replace(/[-_]/g, ' ')} test ${stamp}`}.html`;
      const entry: Entry = {
        module: g.module,
        sub: g.sub,
        file: `${g.module}/${name}`,
        csv: this.csvFiles.get(key),
        results: Object.fromEntries(rows.filter((r) => r.id).map((r) => [r.id, r.status])),
        ts: d.toISOString(),
        date,
        time: `${two(d.getHours())}:${two(d.getMinutes())}`,
        total: rows.length,
        passed: rows.filter((r) => r.status === 'passed').length,
        failed: rows.filter((r) => r.status === 'failed' || r.status === 'timedOut').length,
        skipped: rows.filter((r) => r.status === 'skipped').length,
      };
      const full = path.join(this.reportsDir, g.module, name);
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, this.renderModule(g, rows, entry, durationSec, result.status), 'utf8');
      history.push(entry);
      written.push(full);
    }

    history = this.syncWithFiles(history);
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2), 'utf8');
    const indexFile = this.writeIndex(history);

    for (const file of written) console.log(`\nModule report: ${file}`);
    console.log(`All reports index: ${indexFile}`);
    if (this.autoOpen) {
      const toOpen = written.length === 1 ? written[0] : indexFile;
      const opener = process.platform === 'win32' ? 'start ""' : process.platform === 'darwin' ? 'open' : 'xdg-open';
      exec(`${opener} "${toOpen}"`, (err) => {
        if (err) console.log('Could not open the report automatically:', err.message);
      });
    }
  }

  // ---------- helpers ----------

  private locate(test: TestCase): { module: string; sub: string } {
    const rel = path.relative(process.cwd(), test.location.file).split(path.sep);
    return { module: rel[1] ?? 'general', sub: (rel[2] ?? rel[1] ?? 'tests').replace(/\.spec\.ts$/, '') };
  }

  /** "login test 17-11-2026_15-20" -> "login test cases 17-11-2026_15-20.csv" */
  private csvName(base: string): string {
    return `${base.replace(' test ', ' test cases ')}.csv`;
  }

  /**
   * Keeps history.json and the report files in agreement:
   * a report file that exists but is missing from history is added back (counts are read from the HTML),
   * an entry whose file was deleted is dropped (no dead links in the index).
   */
  private syncWithFiles(history: Entry[]): Entry[] {
    const kept = history.filter((e) => fs.existsSync(path.join(this.reportsDir, e.file)));
    const known = new Set(kept.map((e) => e.file));
    const nameRe = /^(.*) test (\d{2})-(\d{2})-(\d{4})_(\d{2})-(\d{2})(?:-(\d{2}))?\.html$/;
    const sumRe =
      /<div class="sum"><div><b>(\d+)<\/b>total<\/div><div><b class="pass-t">(\d+)<\/b>passed<\/div><div><b class="fail-t">(\d+)<\/b>failed<\/div><div><b class="skip-t">(\d+)<\/b>skipped/;
    for (const module of fs.existsSync(this.reportsDir) ? fs.readdirSync(this.reportsDir) : []) {
      const dir = path.join(this.reportsDir, module);
      if (!fs.statSync(dir).isDirectory()) continue;
      for (const name of fs.readdirSync(dir)) {
        const file = `${module}/${name}`;
        const m = name.match(nameRe);
        if (!m || known.has(file)) continue;
        const [, sub, dd, mm, yyyy, hh, mi, ss] = m;
        const counts = fs.readFileSync(path.join(dir, name), 'utf8').match(sumRe);
        const csv = this.csvName(name.replace(/\.html$/, ''));
        kept.push({
          module,
          sub: sub.replace(/ /g, '-'),
          file,
          csv: fs.existsSync(path.join(dir, csv)) ? `${module}/${csv}` : undefined,
          ts: `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss ?? '00'}`,
          date: `${dd}-${mm}-${yyyy}`,
          time: `${hh}:${mi}`,
          total: Number(counts?.[1] ?? 0),
          passed: Number(counts?.[2] ?? 0),
          failed: Number(counts?.[3] ?? 0),
          skipped: Number(counts?.[4] ?? 0),
        });
      }
    }
    return kept;
  }

  private renderModule(g: Group, rows: Row[], e: Entry, durationSec: number, overall: string): string {
    const cards = rows
      .map((r) => {
        const cls = r.status === 'passed' ? 'pass' : r.status === 'skipped' ? 'skip' : 'fail';
        const images = r.shots
          .map(
            (s) =>
              `<figure><img src="${s.src}" alt="${esc(s.name)}" onclick="this.classList.toggle('big')"><figcaption>${esc(s.name)}</figcaption></figure>`,
          )
          .join('');
        return `<section class="card ${cls}">
  <div class="head"><span class="badge ${cls}">${esc(r.status)}</span><b>${esc(r.title)}</b>
  <span class="meta">${esc(r.group)} · ${(r.duration / 1000).toFixed(1)}s${r.retry ? ` · retry #${r.retry}` : ''}</span></div>
  ${r.error ? `<pre>${esc(r.error)}</pre>` : ''}
  ${images ? `<div class="shots">${images}</div>` : '<p class="meta">No screenshot (the test was skipped)</p>'}
</section>`;
      })
      .join('\n');

    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(pretty(g.sub))} Test Report ${esc(e.date)} ${esc(e.time)}</title><style>${STYLE}</style></head><body><main>
<p class="meta"><a href="../index.html">&larr; All reports</a></p>
<h1>${esc(pretty(g.module))} &rsaquo; ${esc(pretty(g.sub))}</h1>
<div class="meta">Run: ${esc(e.date)} ${esc(e.time)} · duration ${durationSec}s · overall: ${esc(overall)} · click a screenshot to enlarge</div>
<div class="sum"><div><b>${e.total}</b>total</div><div><b class="pass-t">${e.passed}</b>passed</div><div><b class="fail-t">${e.failed}</b>failed</div><div><b class="skip-t">${e.skipped}</b>skipped</div></div>
${cards}
</main></body></html>`;
  }

  /** reports/index.html: newest run on top, module-wise rows under each run. */
  private writeIndex(history: Entry[]): string {
    // Sort by date and time (the ts format can differ between old and rebuilt entries)
    const sortKey = (e: Entry) => `${e.date.split('-').reverse().join('')}${e.time}`;
    const sorted = [...history].sort((a, b) => sortKey(b).localeCompare(sortKey(a)) || b.ts.localeCompare(a.ts));

    const runs = new Map<string, Entry[]>();
    for (const e of sorted) {
      const key = `${e.date} ${e.time}`;
      if (!runs.has(key)) runs.set(key, []);
      runs.get(key)!.push(e);
    }

    let body = '';
    for (const [when, list] of runs) {
      const sum = (pick: (e: Entry) => number) => list.reduce((n, e) => n + pick(e), 0);
      const rows = list
        .sort((a, b) => `${a.module}/${a.sub}`.localeCompare(`${b.module}/${b.sub}`))
        .map(
          (
            e,
          ) => `<tr><td>${esc(pretty(e.module))}</td><td><a href="${esc(encodeURI(e.file))}">${esc(pretty(e.sub))}</a></td><td>${e.total}</td>
<td class="pass-t">${e.passed}</td><td class="${e.failed ? 'fail-t' : ''}">${e.failed}</td><td class="skip-t">${e.skipped}</td>
<td class="${e.failed ? 'fail-t' : 'pass-t'}">${e.failed ? 'Failed' : 'Passed'}</td>
<td>${e.csv ? `<a href="${esc(encodeURI(e.csv))}">CSV</a>` : ''}</td></tr>`,
        )
        .join('\n');
      body += `<h2>${esc(when)} <span class="meta">&nbsp;total ${sum((e) => e.total)} · <span class="pass-t">${sum((e) => e.passed)} pass</span> · <span class="${sum((e) => e.failed) ? 'fail-t' : ''}">${sum((e) => e.failed)} fail</span> · <span class="skip-t">${sum((e) => e.skipped)} skip</span></span></h2>
<table><thead><tr><th>Module</th><th>Sub-module</th><th>Total</th><th>Pass</th><th>Fail</th><th>Skip</th><th>Result</th><th>Test cases</th></tr></thead><tbody>${rows}</tbody></table>`;
    }

    const file = path.join(this.reportsDir, 'index.html');
    fs.mkdirSync(this.reportsDir, { recursive: true });
    fs.writeFileSync(
      file,
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Test Reports</title><style>${STYLE}</style></head><body><main>
<h1>Test Reports</h1><div class="meta">History: newest run first, module-wise rows under each run. Old entries are never overwritten or deleted.</div>
${body}
</main></body></html>`,
      'utf8',
    );
    return file;
  }
}
