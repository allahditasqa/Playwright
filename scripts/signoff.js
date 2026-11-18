// Generates a sign-off report DRAFT for a module from real run data, so the numbers are never typed by hand:
// execution results, High-priority check, exit criteria, defects and observations, and a recommendation.
//   npm run signoff -- <module>        ->  docs/signoff/<module> signoff <DD-MM-YYYY>.md
// Inputs: reports/history.json (the latest run of every sub-module), the master CSV files (docs/test-cases)
// and the defect log (docs/defects/<module>.md, optional). A QA engineer reviews the draft and adds the narrative.
const fs = require('fs');
const path = require('path');
const { parseCsv, slugify } = require('./lib/test-cases');

const ROOT = path.resolve(__dirname, '..');
const moduleName = process.argv[2];
if (!moduleName) {
  console.log('Usage: npm run signoff -- <module>   (for example: npm run signoff -- auth)');
  process.exit(1);
}

const pretty = (s) => s.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const two = (n) => String(n).padStart(2, '0');
const now = new Date();
const today = `${two(now.getDate())}-${two(now.getMonth() + 1)}-${now.getFullYear()}`;

// latest run of every sub-module
const historyFile = path.join(ROOT, 'reports', 'history.json');
if (!fs.existsSync(historyFile)) {
  console.log('reports/history.json not found. Run the tests first.');
  process.exit(1);
}
// history.json: runs (newest first), each run has one entry per module
const history = [];
for (const run of JSON.parse(fs.readFileSync(historyFile, 'utf8'))) {
  for (const m of run.Modules) {
    if (slugify(m.Module) !== moduleName) continue;
    const id = run.RunId; // YYYYMMDD-HHmmss
    history.push({
      sub: moduleName,
      date: `${id.slice(6, 8)}-${id.slice(4, 6)}-${id.slice(0, 4)}`,
      time: `${id.slice(9, 11)}:${id.slice(11, 13)}:${id.slice(13, 15)}`,
      total: m.Total,
      passed: m.Passed,
      failed: m.Failed,
      results: m.Results,
    });
  }
}
const latest = new Map();
for (const e of history) if (!latest.has(e.sub)) latest.set(e.sub, e);
if (!latest.size) {
  console.log(`No run found for module "${moduleName}". Run its tests first.`);
  process.exit(1);
}

// master CSV rows of the module
const docsDir = path.join(ROOT, 'docs', 'test-cases');
const master = new Map(); // sub-module -> rows
for (const file of fs.readdirSync(docsDir).filter((f) => f.endsWith('.csv'))) {
  const [, ...rows] = parseCsv(fs.readFileSync(path.join(docsDir, file), 'utf8'));
  for (const r of rows) {
    if (slugify(r[1]) !== moduleName) continue;
    if (!master.has(moduleName)) master.set(moduleName, []);
    master.get(moduleName).push(r);
  }
}

// Prefer the latest FULL run (every documented case) over a newer partial run such as a smoke run.
// (history is already sorted newest first)
for (const sub of latest.keys()) {
  const documented = (master.get(sub) || []).length;
  const fullRun = history.find((e) => e.sub === sub && e.total >= documented);
  if (fullRun) latest.set(sub, fullRun);
}

// numbers per sub-module
const table = [];
let total = 0;
let executed = 0;
let passed = 0;
let failed = 0;
let notExecuted = 0;
let highTotal = 0;
let highPassed = 0;
const highNotOk = [];
for (const sub of [...new Set([...master.keys(), ...latest.keys()])].sort()) {
  const rows = master.get(sub) || [];
  const run = latest.get(sub);
  const results = run && run.results;
  const subTotal = rows.length || (run ? run.total : 0);
  const subPassed = results ? rows.filter((r) => results[r[0]] === 'passed').length : run ? run.passed : 0;
  const subFailed = results
    ? rows.filter((r) => ['failed', 'timedOut'].includes(results[r[0]])).length
    : run
      ? run.failed
      : 0;
  const subExecuted = subPassed + subFailed;
  const subNotExecuted = Math.max(subTotal - subExecuted, 0);
  total += subTotal;
  executed += subExecuted;
  passed += subPassed;
  failed += subFailed;
  notExecuted += subNotExecuted;
  table.push(
    `| ${pretty(sub)} | ${subTotal} | ${subExecuted} | ${subPassed} | ${subFailed} | ${subNotExecuted} | ${
      subExecuted ? `${Math.round((subPassed / subExecuted) * 100)}%` : '-'
    } |`,
  );
  for (const r of rows.filter((row) => row[5] === 'High')) {
    highTotal++;
    if (results && results[r[0]] === 'passed') highPassed++;
    else highNotOk.push(`${r[0]} (${results ? results[r[0]] || 'not executed' : 'unknown'})`);
  }
}
const passRate = executed ? Math.round((passed / executed) * 100) : 0;

// defects and observations (docs/defects/<module>.md): rows start with DEF_ or OBS_
const defectFile = path.join(ROOT, 'docs', 'defects', `${moduleName}.md`);
const defects = [];
if (fs.existsSync(defectFile)) {
  for (const line of fs.readFileSync(defectFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\|\s*((?:DEF|OBS)_[A-Z0-9_]+)\s*\|(.*)\|\s*$/);
    if (!m) continue;
    const c = m[2].split('|').map((x) => x.trim());
    defects.push({ id: m[1], title: c[1], severity: c[2], status: c[3] });
  }
}
const closed = /closed|rejected|fixed/i;
const openDefects = defects.filter((d) => d.id.startsWith('DEF') && !closed.test(d.status));
const criticalOrHigh = openDefects.filter((d) => /critical|high/i.test(d.severity));
const openObservations = defects.filter((d) => d.id.startsWith('OBS') && !closed.test(d.status));

// exit criteria and recommendation
const highOk = highTotal > 0 && highPassed === highTotal;
const rateOk = passRate >= 95;
const noBlocker = criticalOrHigh.length === 0;
const allRun = notExecuted === 0;
let recommendation = 'CONDITIONAL SIGN-OFF';
if (highNotOk.some((x) => /failed|timedOut/.test(x)) || !noBlocker) recommendation = 'NOT SIGNED OFF';
else if (highOk && rateOk && noBlocker && allRun && openObservations.length === 0) recommendation = 'SIGNED OFF';
const yesNo = (ok) => (ok ? 'Yes' : '**No**');

const reasons = [];
if (!highOk) reasons.push(`${highTotal - highPassed} High case(s) not passed or not executed: ${highNotOk.join(', ')}`);
if (!allRun) reasons.push(`${notExecuted} case(s) not executed`);
if (!rateOk) reasons.push(`pass rate ${passRate}% is below 95%`);
if (!noBlocker) reasons.push(`${criticalOrHigh.length} open Critical/High defect(s)`);
if (openObservations.length) reasons.push(`${openObservations.length} open observation(s)`);

const runs = [...latest.values()].map((e) => `${e.date} ${e.time}`).join(', ');
const md = `# ${pretty(moduleName)} - Sign-off Report

**Date:** ${today}  |  **Prepared by:** QA (SDET)
**Recommendation: ${recommendation}**
> The numbers are generated by \`npm run signoff -- ${moduleName}\` from the latest runs. QA reviews them and adds comments.

## 1. Summary
${failed === 0 && executed > 0 ? `All ${executed} executed case(s) passed` : `${passed} of ${executed} executed case(s) passed (${failed} failed)`}${notExecuted ? `, ${notExecuted} case(s) were not executed` : ''}. ${
  criticalOrHigh.length ? `${criticalOrHigh.length} open Critical/High defect(s).` : 'No open Critical/High defect.'
} ${reasons.length ? `Open points: ${reasons.join('; ')}.` : 'All exit criteria are met and nothing is pending.'}

## 2. Execution results

| Sub-module | Total | Executed | Passed | Failed | Not executed | Pass rate |
| --- | --- | --- | --- | --- | --- | --- |
${table.join('\n')}
| **${pretty(moduleName)} total** | **${total}** | **${executed}** | **${passed}** | **${failed}** | **${notExecuted}** | **${passRate}%** |

**Latest runs used:** ${runs}

## 3. Exit criteria

| Criterion | Result | Met? |
| --- | --- | --- |
| All High priority cases executed and passed | ${highPassed} of ${highTotal} passed${highNotOk.length ? ` (not ok: ${highNotOk.join(', ')})` : ''} | ${yesNo(highOk)} |
| Pass rate 95% or more | ${passRate}% (${passed} of ${executed}) | ${yesNo(rateOk)} |
| No open Critical or High defect | ${criticalOrHigh.length} open | ${yesNo(noBlocker)} |
| All cases executed | ${notExecuted} not executed | ${yesNo(allRun)} |

## 4. Defects and observations
${
  defects.length
    ? `Defect log: \`docs/defects/${moduleName}.md\`\n\n| ID | Title | Severity | Status |\n| --- | --- | --- | --- |\n${defects
        .map((d) => `| ${d.id} | ${d.title} | ${d.severity} | ${d.status} |`)
        .join('\n')}`
    : 'No defect or observation logged.'
}

## 5. Risks, limitations and next steps
(QA to complete: what was not covered and why, risks, what must happen before the final sign-off.)

## 6. Approval

| Role | Name | Decision | Date |
| --- | --- | --- | --- |
| QA (SDET) | | Recommends: ${recommendation.toLowerCase()} | ${today} |
| Product Owner | | | |
`;

let out = path.join(ROOT, 'docs', 'signoff', `${moduleName} signoff ${today}.md`);
if (fs.existsSync(out)) {
  out = path.join(ROOT, 'docs', 'signoff', `${moduleName} signoff ${today}_${two(now.getHours())}-${two(now.getMinutes())}.md`);
}
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, md, 'utf8');
console.log(`Sign-off draft: ${path.relative(ROOT, out)}\nRecommendation: ${recommendation}`);
