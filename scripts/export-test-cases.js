// Test case tooling. It reads the test case documents (docs/test-cases/*.md) and gives you:
//
//  1) MASTER CSV (regression suite): docs/test-cases/<module>-<submodule>.csv, one file per sub-module, no date in the name.
//     It is updated only when a test case changes:  npm run cases:csv
//     Rows that did not change keep their "Last Updated" date, so the file shows what really changed and when.
//  2) RUN CSV (written by the reporter before each run): only the cases that are about to run (buildRows + toCsv).
//  3) TRACEABILITY CHECK: npm run cases:check
//       - master CSV matches the documents
//       - every documented test case has a test in code (and the other way round is reported as a warning)
//       - no duplicate test IDs
//
// Documents are the source of truth: edit the .md file, never the CSV.
const fs = require('fs');
const path = require('path');

const DOCS = path.resolve(__dirname, '..', 'docs', 'test-cases');
const TESTS = path.resolve(__dirname, '..', 'tests');
const HEADER = ['ID', 'Module', 'Sub-module', 'Group', 'Title', 'Priority', 'Preconditions', 'Steps', 'Expected Result', 'Automation'];
const MASTER_HEADER = [...HEADER, 'Regression', 'Last Updated'];
const quote = (v) => `"${String(v).replace(/"/g, '""')}"`;
const clean = (v) => v.trim().replace(/`/g, '');
const byId = (a, b) => a[0].localeCompare(b[0], undefined, { numeric: true });

function today() {
  const d = new Date();
  const two = (n) => String(n).padStart(2, '0');
  return `${two(d.getDate())}-${two(d.getMonth() + 1)}-${d.getFullYear()}`;
}

// Parse every .md document into { base, module, sub, rows }
function listDocs() {
  const out = [];
  if (!fs.existsSync(DOCS)) return out;
  for (const file of fs.readdirSync(DOCS).filter((f) => f.endsWith('.md'))) {
    const lines = fs.readFileSync(path.join(DOCS, file), 'utf8').split(/\r?\n/);
    // module and sub-module come from the "Automation: tests/<module>/<sub>.spec.ts" line of the document
    const auto = lines.join('\n').match(/tests\/([\w-]+)\/([\w-]+)\.spec\.ts/);
    const base = path.basename(file, '.md');
    const module = auto ? auto[1] : base;
    const sub = auto ? auto[2] : module;
    const rows = [];
    let group = '';
    for (const line of lines) {
      const heading = line.match(/^##\s+(?:[A-Z]\.\s*)?(.*)$/);
      if (heading) {
        group = heading[1].trim();
        continue;
      }
      const row = line.match(/^\|\s*(TC_[A-Z0-9_.]+)\s*\|(.*)\|\s*$/);
      if (!row) continue;
      const cells = row[2].split('|').map(clean);
      if (cells.length !== 5) continue; // Title | Priority | Preconditions | Steps | Expected
      const [title, priority, pre, steps, expected] = cells;
      rows.push([row[1], module, sub, group, title, priority, pre, steps, expected, 'Yes']);
    }
    if (rows.length) out.push({ base, module, sub, rows });
  }
  return out;
}

function loadDocs() {
  const map = new Map();
  for (const d of listDocs()) for (const r of d.rows) map.set(`${d.module}/${d.sub}/${r[0]}`, r);
  return map;
}

// ---------- run CSV ----------

// tests = [{ id, title }] that are about to run. A test without a document row gets a "Not documented yet" row.
function buildRows(module, sub, tests) {
  const docs = loadDocs();
  return tests
    .map(
      (t) =>
        docs.get(`${module}/${sub}/${t.id}`) ?? [
          t.id, module, sub, '', t.title, '', '', '', 'Not documented yet (add it to docs/test-cases)', 'Yes',
        ],
    )
    .sort(byId);
}

function toCsv(rows, header = HEADER) {
  // UTF-8 BOM so Excel opens the file with the right encoding
  return '﻿' + [header, ...rows].map((r) => r.map(quote).join(',')).join('\r\n') + '\r\n';
}

// ---------- master CSV ----------

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const s = text.replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"' && s[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const masterPath = (base) => path.join(DOCS, `${base}.csv`);

function readMaster(base) {
  const file = masterPath(base);
  if (!fs.existsSync(file)) return new Map();
  const [, ...rows] = parseCsv(fs.readFileSync(file, 'utf8'));
  return new Map(rows.map((r) => [r[0], r]));
}

const expectedRow = (r) => [...r, 'Yes']; // the 11th column, "Regression"

function exportMaster() {
  const summary = [];
  for (const d of listDocs()) {
    const old = readMaster(d.base);
    let added = 0;
    let changed = 0;
    const rows = d.rows
      .slice()
      .sort(byId)
      .map((r) => {
        const expected = expectedRow(r);
        const previous = old.get(r[0]);
        if (!previous) {
          added++;
          return [...expected, today()];
        }
        const same = expected.every((value, i) => value === previous[i]);
        if (!same) changed++;
        return [...expected, same ? previous[11] || today() : today()];
      });
    const removed = [...old.keys()].filter((id) => !d.rows.some((r) => r[0] === id)).length;
    fs.writeFileSync(masterPath(d.base), toCsv(rows, MASTER_HEADER), 'utf8');
    summary.push({ file: `${d.base}.csv`, total: rows.length, added, changed, removed });
  }
  return summary;
}

// Names of the master CSV files that no longer match their document (empty = all fine)
function checkMaster() {
  const stale = [];
  for (const d of listDocs()) {
    const old = readMaster(d.base);
    const same =
      old.size === d.rows.length &&
      d.rows.every((r) => {
        const previous = old.get(r[0]);
        return previous && expectedRow(r).every((value, i) => value === previous[i]);
      });
    if (!same) stale.push(`${d.base}.csv`);
  }
  return stale;
}

// ---------- traceability ----------

function traceability() {
  const exact = new Map(); // test id -> how many times it appears in code
  const prefixes = []; // data-driven titles such as TC_X_16.${i + 1}
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'setup') walk(file);
        continue;
      }
      if (!entry.name.endsWith('.spec.ts')) continue;
      const source = fs.readFileSync(file, 'utf8');
      // matches test('TC_X_01 - ...' and test(\n 'TC_X_01 - ...' (prettier may wrap the title onto the next line)
      for (const m of source.matchAll(/\btest(?:\.\w+)?\(\s*[`'"](TC_[A-Z0-9]+_\d+(?:\.\d+|\.\$\{[^}]*\})?)/g)) {
        if (m[1].includes('${')) prefixes.push(m[1].split('${')[0]);
        else exact.set(m[1], (exact.get(m[1]) || 0) + 1);
      }
    }
  };
  if (fs.existsSync(TESTS)) walk(TESTS);
  const documented = new Set();
  for (const d of listDocs()) for (const r of d.rows) documented.add(r[0]);
  const inCode = (id) => exact.has(id) || prefixes.some((p) => id.startsWith(p));
  return {
    missingInCode: [...documented].filter((id) => !inCode(id)),
    undocumented: [...exact.keys()].filter((id) => !documented.has(id)),
    duplicates: [...exact.entries()].filter(([, count]) => count > 1).map(([id]) => id),
  };
}

module.exports = { buildRows, toCsv, exportMaster, checkMaster, traceability, parseCsv };

if (require.main === module) {
  if (process.argv.includes('--check')) {
    let failed = false;
    const stale = checkMaster();
    if (stale.length) {
      console.log(`ERROR master CSV is out of date: ${stale.join(', ')}  ->  run: npm run cases:csv`);
      failed = true;
    } else console.log('OK    master CSV files match docs/test-cases.');
    const t = traceability();
    if (t.missingInCode.length) {
      console.log(`ERROR documented but no test in code: ${t.missingInCode.join(', ')}`);
      failed = true;
    }
    if (t.duplicates.length) {
      console.log(`ERROR duplicate test IDs in code: ${t.duplicates.join(', ')}`);
      failed = true;
    }
    if (t.undocumented.length) console.log(`WARN  tests without a document row (${t.undocumented.length}): ${t.undocumented.join(', ')}`);
    if (!failed) console.log('OK    every documented test case has a test, no duplicate IDs.');
    process.exit(failed ? 1 : 0);
  } else {
    for (const s of exportMaster()) {
      console.log(`${s.file}: ${s.total} cases (new ${s.added}, changed ${s.changed}, removed ${s.removed})`);
    }
  }
}
