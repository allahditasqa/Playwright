// Runs only the test cases chosen from the master CSV files (docs/test-cases/*.csv).
//   npm run test:regression                     every case marked Regression = Yes
//   npm run test:smoke                          only High priority cases (fast check)
//   node scripts/run-regression.js --module auth        one module
//   node scripts/run-regression.js --priority High --dry    show what would run, run nothing
// Any other flag (for example --headed or --workers=1) is passed straight to Playwright.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { parseCsv } = require('./export-test-cases.js');

const DOCS = path.resolve(__dirname, '..', 'docs', 'test-cases');
const args = process.argv.slice(2);
let priority = null;
let moduleName = null;
let dry = false;
const passThrough = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--priority') priority = args[++i];
  else if (args[i] === '--module') moduleName = args[++i];
  else if (args[i] === '--dry') dry = true;
  else passThrough.push(args[i]);
}

const ids = [];
const modules = new Set();
for (const file of fs.readdirSync(DOCS).filter((f) => f.endsWith('.csv'))) {
  const [, ...rows] = parseCsv(fs.readFileSync(path.join(DOCS, file), 'utf8'));
  for (const r of rows) {
    // columns: 0 ID, 1 Module, 5 Priority, 10 Regression
    if (r[10] !== 'Yes') continue;
    if (priority && r[5] !== priority) continue;
    if (moduleName && r[1] !== moduleName) continue;
    ids.push(r[0]);
    modules.add(r[1]);
  }
}
if (!ids.length) {
  console.log('No test cases selected. Create the master CSV first: npm run cases:csv');
  process.exit(1);
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const grep = `(${ids.map(escapeRegex).join('|')}) - `;
console.log(`${priority ? `${priority} priority` : 'Regression'} suite: ${ids.length} cases, modules: ${[...modules].join(', ')}`);
if (dry) {
  console.log(ids.join(', '));
  process.exit(0);
}

const cli = require.resolve('@playwright/test/cli');
const result = spawnSync(process.execPath, [cli, 'test', '-g', grep, ...passThrough], {
  stdio: 'inherit',
  cwd: path.resolve(__dirname, '..'),
});
process.exit(result.status ?? 1);
