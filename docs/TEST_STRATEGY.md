# Test strategy: Swag Labs demo shop and JSONPlaceholder API

**Version:** 1.0  |  **Prepared by:** QA (SDET)

## 1. Objective
Show a complete, repeatable automation approach for a typical web shop: login, browsing and sorting products, cart,
checkout, plus a REST API. The target applications are public demo services, so anyone can run the suite.

## 2. Applications under test

| Application | URL | Purpose |
| --- | --- | --- |
| Swag Labs (Sauce Demo) | https://www.saucedemo.com | Web shop UI: login, products, cart, checkout |
| JSONPlaceholder | https://jsonplaceholder.typicode.com | Fake REST API: posts and comments |

## 3. Scope

| Module | Sub-module | Test cases | Type |
| --- | --- | --- | --- |
| Auth | Login | 15 | UI |
| Inventory | Products | 10 | UI |
| Cart | Cart | 5 | UI |
| Checkout | Checkout | 9 | UI, end to end |
| API | Posts | 8 | API |

**Out of scope:** the special demo users that are built to misbehave (`problem_user`, `performance_glitch_user`),
visual regression, load and performance testing, accessibility audits, mobile browsers.

## 4. Approach

| Type | How | Automated |
| --- | --- | --- |
| Functional (positive and negative) | Page Object Model, one spec per sub-module | Yes |
| Business rules | Sorting order, cart badge, totals = item total + tax | Yes |
| Validation | Required fields on login and checkout | Yes |
| Security basics | SQL text in the username, protected page without login | Yes |
| API | Status codes, response shape, filtering, unknown ids | Yes |
| Cross-browser | Optional run on Firefox and WebKit (`ALL_BROWSERS=1`) | Yes, on demand |
| Exploratory, usability, accessibility | By hand before a release | No |

## 5. Environment and data
- **Browser:** Chromium desktop 1440 x 900 (Firefox and WebKit optional). **Node:** 22 or newer.
- **Accounts:** public demo users printed on the login page (`standard_user`, `locked_out_user`).
- **Isolation:** the logged-in modules reuse one saved session; the cart is empty at the start of each test because
  every test gets a fresh browser context.
- **State:** the demo shop keeps the cart in the browser, and the API fakes writes, so nothing needs cleaning up.

## 6. Entry and exit criteria
See [QA_PROCESS.md](QA_PROCESS.md). In short: all High cases pass, pass rate 95% or more, no open Critical or High defect.

## 7. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Public demo services can be slow or change text | Failing tests that are not product bugs | Messages and prices live in `test-data/`, one-line fixes; retries only on CI |
| Shared public API | Rate limits or downtime | API tests are small and independent |
| UI text changes | Broken locators | Locators use stable `data-test` attributes, never CSS paths |

## 8. Deliverables
Test case documents and master CSV, automation code, per-run CSV and module-wise reports with a history index,
defect log, sign-off reports, CI pipeline.
