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

## 9. Requirements (the traceability targets)
The demo applications have no written specification, so the requirements below are derived from the visible behaviour of the application.
Every test case names one of them in its Traceability table. API cases name the section of the JSONPlaceholder guide.

| ID | Requirement | Test cases |
| --- | --- | --- |
| REQ-AUTH-01 | The login page shows the logo, both fields and the Login button; the password is hidden | TC_LOGIN_01, 02 |
| REQ-AUTH-02 | A valid user can log in (button or Enter) and the products page opens | TC_LOGIN_03, 04 |
| REQ-AUTH-03 | The session stays after a reload; Logout returns to the login page | TC_LOGIN_05, 06 |
| REQ-AUTH-04 | A locked-out user cannot log in and sees a clear message | TC_LOGIN_07 |
| REQ-AUTH-05 | Wrong, unknown, wrongly-cased or malicious credentials are rejected with a message | TC_LOGIN_08, 09, 12, 13 |
| REQ-AUTH-06 | An empty username or password shows a validation message | TC_LOGIN_10, 11 |
| REQ-AUTH-07 | The error message can be closed | TC_LOGIN_14 |
| REQ-AUTH-08 | Protected pages need a login | TC_LOGIN_15 |
| REQ-INV-01 | The products page lists the products with name and price | TC_PRODUCTS_01 |
| REQ-INV-02 | The list can be sorted by name and by price, in both directions | TC_PRODUCTS_02 to 05 |
| REQ-INV-03 | The cart badge shows the number of items | TC_PRODUCTS_06 to 08 |
| REQ-INV-04 | A product has a details page with a way back | TC_PRODUCTS_09, 10 |
| REQ-CART-01 | Added products are listed in the cart | TC_CART_01, 02 |
| REQ-CART-02 | Products can be removed from the cart | TC_CART_03 |
| REQ-CART-03 | From the cart the user can continue shopping or start the checkout | TC_CART_04, 05 |
| REQ-CHK-01 | The checkout asks for first name, last name and postal code and validates them | TC_CHECKOUT_01 to 05 |
| REQ-CHK-02 | An order can be finished and the cart is empty afterwards | TC_CHECKOUT_06, 08 |
| REQ-CHK-03 | The overview totals are correct (item total + tax) | TC_CHECKOUT_07, 09 |

## 10. Reports
Module-wise reports are written after every run and committed to the repository: `reports/index.html`, `reports/history.json` and, per module,
`reports/<module-slug>/<Module Name> test <DD-MM-YYYY>_<HH-mm-ss>.html` plus the matching `... test cases ...csv` with the real result of each case.
