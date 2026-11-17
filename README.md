# Playwright Test Automation Framework (TypeScript)

[![CI](https://github.com/allahditasqa/Playwright/actions/workflows/ci.yml/badge.svg)](https://github.com/allahditasqa/Playwright/actions/workflows/ci.yml)
![Playwright](https://img.shields.io/badge/Playwright-1.65-2EAD33?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Tests](https://img.shields.io/badge/tests-47%20(UI%20%2B%20API)-brightgreen)

A complete UI and API test automation framework with a **Page Object Model**, module-wise reporting, a managed
regression suite and a documented QA process. The tests run against two public demo services, so you can clone the
repository and run everything yourself in about 30 seconds.

| Target | URL |
| --- | --- |
| Web shop (UI tests) | https://www.saucedemo.com |
| REST API (API tests) | https://jsonplaceholder.typicode.com |

> **Sibling frameworks:** [Cypress](https://github.com/allahditasqa/Cypress) (web) and [Appium](https://github.com/allahditasqa/Appium) (Android + iOS, Java).

---

## What this repository demonstrates

- **Clean architecture:** tests → fixtures → page objects and components → API layer → config, data and utils. Locators live only in page objects.
- **Fast and stable tests:** one login per run (saved session), no hard waits, independent tests, parallel execution.
- **UI and API in one framework:** the same fixtures, reports and process cover both.
- **Reporting that a team can use:** a self-contained HTML report **per module**, named with the run date and time, a **history page** of all runs, and a CSV of the test cases that were about to run.
- **Regression management:** a master CSV of every test case, `smoke` and `regression` runs built from it, and a **traceability check** that fails when documents, CSV and test code disagree.
- **A real QA process:** strategy, test case standard, defect log and **sign-off reports generated from run data**.
- **Quality gates:** TypeScript strict mode, ESLint (with the Playwright plugin), Prettier, and a CI pipeline.

## Tech stack

| Area | Tool |
| --- | --- |
| Test runner | Playwright Test 1.65 |
| Language | TypeScript 6 (strict) |
| Pattern | Page Object Model + reusable components + fixtures |
| Reports | Custom reporter (HTML + CSV + history) and the built-in Playwright HTML report |
| Lint and format | ESLint 10 + `eslint-plugin-playwright`, Prettier |
| CI | GitHub Actions |

## Architecture

```
tests/<module>/<sub>.spec.ts      WHAT to check (steps and assertions only, no locators)
        │ uses
fixtures/test-fixtures.ts         ready objects: loginPage, inventoryPage, cartPage, checkoutPage, postsApi ...
        │ uses
pages/ + components/              HOW to talk to the UI (locators and actions); components are reusable parts (header menu)
api/                              HOW to talk to the REST API (a thin client per resource)
config/ · test-data/ · utils/     environment settings, test users and products, shared constants
        │ runs on
playwright.config.ts              projects: setup · auth · chromium · api (+ firefox, webkit on demand)
reporters/ · scripts/ · docs/     reporting, CSV and sign-off tooling, QA process documents
```

### Design decisions (and why)

| Decision | Why |
| --- | --- |
| Locators only in page objects | A UI change is fixed in one file, never in every test |
| `data-test` attributes via `getByTestId` | Stable against styling and text changes |
| One saved login session (`storageState`) | Only the login tests pay for a real login; the rest start inside the app |
| `auth` project starts logged out, `chromium` project reuses the session | Each test gets exactly the state it needs, nothing leaks between tests |
| Every folder under `tests/` is picked up automatically | Adding a module needs no config change |
| Retries are **off locally**, 1 on CI | A flaky test must be visible on a developer machine, not hidden |
| Titles are full English sentences with the test data | The report reads like a test case; no need to open the code |
| Report file names contain date and time | Old reports are never overwritten, so a run can be compared later |
| Documents are the source of truth, the CSV is generated | One place to edit, and `npm run cases:check` catches drift |

## Project structure

```
.
├── api/                  PostsApi (REST client for JSONPlaceholder)
├── components/           HeaderMenu (burger menu, reusable on every page)
├── config/env.ts         BASE_URL / API_URL, optional TEST_ENV=<name> -> .env.<name>
├── docs/
│   ├── QA_PROCESS.md     life cycle from framework to sign-off
│   ├── TEST_STRATEGY.md  scope, approach, environment, risks, exit criteria
│   ├── TEST_CASE_STANDARD.md
│   ├── test-cases/       one document (.md) and one master CSV per sub-module
│   ├── signoff/          sign-off reports generated from run data
│   └── templates/        defect log and sign-off templates
├── fixtures/             test-fixtures.ts
├── pages/                BasePage, LoginPage, InventoryPage, ProductDetailsPage, CartPage, CheckoutPage
├── reporters/            offline-report.ts (module-wise HTML, run CSV, history index)
├── scripts/              export-test-cases, run-regression, signoff, open-reports
├── test-data/            users, products, expected messages
├── tests/                auth · inventory · cart · checkout · api · setup
└── .github/workflows/    ci.yml
```

## Test coverage

| Module | Sub-module | Test cases | Type |
| --- | --- | --- | --- |
| Auth | Login | 15 | UI: valid and invalid login, validation messages, SQL text, access without login |
| Inventory | Products | 10 | UI: list, four sort orders, cart badge, product details |
| Cart | Cart | 5 | UI: add, remove, continue shopping, start checkout |
| Checkout | Checkout | 9 | UI end to end: required fields, order completion, totals = item total + tax |
| API | Posts | 8 | REST: status codes, response shape, filtering, create, update, delete, unknown id |
| **Total** | | **47** | 20 of them are High priority (the smoke suite) |

## Getting started

**Prerequisites:** Node.js 20 or newer.

```bash
git clone https://github.com/allahditasqa/Playwright.git
cd Playwright
npm install
npx playwright install chromium
npm test
```

| Goal | Command |
| --- | --- |
| Run everything | `npm test` |
| Watch the browser | `npm run test:headed` (slow motion: `SLOWMO=300`) |
| Interactive UI mode | `npm run test:ui` |
| One module | `npm run test:auth` · `test:inventory` · `test:cart` · `test:checkout` · `test:api` |
| One test | `npx playwright test -g "TC_LOGIN_03"` |
| **Smoke** (High priority only) | `npm run test:smoke` |
| **Regression** (all cases in the master CSV) | `npm run test:regression` |
| Firefox and WebKit as well | `ALL_BROWSERS=1 npx playwright test --project=firefox --project=webkit` |
| All quality gates | `npm run check` |
| Open the reports history | `npm run reports` |

## Reporting

Every run produces three things, in a folder per module:

```
reports/
├── index.html                                        history of all runs (newest on top)
└── auth/
    ├── login test cases 17-11-2026_17-04.csv         the cases about to run, with steps and expected results (written BEFORE the run)
    └── login test 17-11-2026_17-04.html              the report, one file, screenshots embedded
```

![Reports history](docs/images/reports-index.png)

![Module report](docs/images/module-report.png)

## Regression and traceability

- `docs/test-cases/<module>-<sub>.md` is the source of truth. `npm run cases:csv` turns it into a **master CSV**; unchanged rows keep their `Last Updated` date.
- `npm run test:regression` and `npm run test:smoke` build their selection from the master CSV, not from tags in code.
- `npm run cases:check` fails when a document row has no test, a test ID appears twice, or the CSV is stale. It also runs in CI.

## Sign-off reports

`npm run signoff -- <module>` writes `docs/signoff/<module> signoff <date>.md` from real run data: results per sub-module,
the High-priority check, the exit criteria, the defect log and a recommendation (**Signed off**, **Conditional** or **Not signed off**).
See [docs/signoff](docs/signoff) for the five generated reports and [docs/QA_PROCESS.md](docs/QA_PROCESS.md) for the rules.

## Sample: how a test reads

```ts
test('TC_LOGIN_08 - Login with username "standard_user" and the wrong password "wrong_password"', async ({
  page,
  loginPage,
}) => {
  await loginPage.login(USERS.standard, 'wrong_password');
  await loginPage.expectError(MESSAGES.badCredentials);
  await expect(page).toHaveURL(ROUTE.login);
});
```

```ts
// pages/LoginPage.ts: locators and actions live here, not in the test
readonly usernameInput = this.page.getByTestId('username');
async login(username: string, password: string) {
  await this.usernameInput.fill(username);
  await this.passwordInput.fill(password);
  await this.loginButton.click();
}
```

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every push and pull request:

1. **Quality gates:** type check, lint, format check, traceability check, `playwright test --list`.
2. **UI + API tests** on a clean Linux runner; the reports are uploaded as an artifact.

## Roadmap

- JSON schema validation for API responses
- Visual comparison for the products page
- Accessibility checks with axe
- Allure or Playwright blob reports merged across shards
