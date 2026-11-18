// Custom Playwright reporter: module-wise reports that open without a server.
// After every run it writes (see scripts/lib/report-writer.js, shared with the other automation repositories):
//   reports/<module-slug>/<Module Name> test <DD-MM-YYYY>_<HH-mm-ss>.html        one self-contained HTML report per module
//   reports/<module-slug>/<Module Name> test cases <DD-MM-YYYY>_<HH-mm-ss>.csv   the cases of the module + the real result of this run
//   reports/index.html and reports/history.json                                  all runs, newest on top
// Old reports are never overwritten because the date and time are part of the file name.
// The module of a test comes from its test case document (docs/test-cases), found through the TC_ ID in the test title.
import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { exec } from 'child_process';
import fs from 'fs';
import { ENV } from '../config/env';

const { writeRun } = require('../scripts/lib/report-writer.js') as {
  writeRun: (run: Record<string, unknown>) => { files: string[]; index: string };
};
const { checkMaster } = require('../scripts/lib/test-cases.js') as { checkMaster: () => string[] };

interface Row {
  id: string;
  title: string;
  suite: string;
  status: string;
  known: boolean;
  note: string;
  duration: number;
  retry: number;
  error: string;
  shots: { name: string; src: string }[];
}

const ID = /TC_[A-Z0-9_.]+/;

export default class OfflineReporter implements Reporter {
  private rows = new Map<string, Row>();
  private startedAt = new Date();
  private reportsDir: string;
  private autoOpen: boolean;

  constructor(options: { outputDir?: string; open?: boolean } = {}) {
    this.reportsDir = options.outputDir ?? 'reports';
    // Open the report in the browser when the run ends (not on CI, and not when OFFLINE_REPORT_OPEN=0)
    this.autoOpen = (options.open ?? true) && !process.env.CI && process.env.OFFLINE_REPORT_OPEN !== '0';
  }

  onBegin(): void {
    this.startedAt = new Date();
    if (process.argv.includes('--list')) return;
    try {
      const stale = checkMaster();
      if (stale.length)
        console.log(`\nNOTE: master test case CSV is out of date (${stale.join(', ')}). Run: npm run cases:csv`);
    } catch {
      /* the check is a courtesy, never block a run */
    }
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const id = test.title.match(ID)?.[0];
    if (!id) return; // the login setup is not a test case

    const shots = result.attachments
      .filter((a) => a.contentType.startsWith('image/'))
      .map((a) => {
        const buffer = a.body ?? (a.path ? fs.readFileSync(a.path) : null);
        return buffer ? { name: a.name, src: `data:${a.contentType};base64,${buffer.toString('base64')}` } : null;
      })
      .filter((shot): shot is { name: string; src: string } => shot !== null);

    const status = result.status === 'passed' ? 'passed' : result.status === 'skipped' ? 'skipped' : 'failed';
    // test.fail() = a known defect: it fails as expected, so the outcome is "expected"
    const known = test.expectedStatus === 'failed' && status === 'failed';
    // On a retry the last attempt wins
    this.rows.set(test.id, {
      id,
      title: test.title,
      suite: test.titlePath().slice(2, -1).join(' › '),
      status: known ? 'passed' : status,
      known,
      note: test.annotations.find((a) => a.type === 'fail')?.description ?? '',
      duration: result.duration,
      retry: result.retry,
      error: result.error ? (result.error.message ?? String(result.error)) : '',
      shots,
    });
  }

  onEnd(): void {
    if (this.rows.size === 0) return; // nothing ran (for example --list)
    const { files, index } = writeRun({
      reportsDir: this.reportsDir,
      startedAt: this.startedAt,
      durationSec: Math.round((Date.now() - this.startedAt.getTime()) / 1000),
      tool: 'Playwright',
      browser: 'Chromium (Desktop Chrome)',
      url: `${ENV.baseURL} (UI), ${ENV.apiURL} (API)`,
      results: [...this.rows.values()],
    });
    for (const file of files.filter((f) => f.endsWith('.html'))) console.log(`\nModule report: ${file}`);
    console.log(`All reports index: ${index}`);
    if (this.autoOpen) {
      const opener = process.platform === 'win32' ? 'start ""' : process.platform === 'darwin' ? 'open' : 'xdg-open';
      exec(`${opener} "${index}"`, (err) => {
        if (err) console.log('Could not open the report automatically:', err.message);
      });
    }
  }
}
