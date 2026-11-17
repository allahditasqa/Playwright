# Test case standard

Every module uses the same format and structure, in simple English, so that anyone can read and run a case.

## 1. Where things live

| Item | Location | Example |
| --- | --- | --- |
| Test case document | `docs/test-cases/<module>-<sub>.md` | `docs/test-cases/auth-login.md` |
| **Master CSV** (regression list) | `docs/test-cases/<module>-<sub>.csv` | `docs/test-cases/auth-login.csv` |
| Automation | `tests/<module>/<sub>.spec.ts` | `tests/auth/login.spec.ts` |
| Page object | `pages/<Name>Page.ts` | `pages/LoginPage.ts` |
| Run CSV (before each run) | `reports/<module>/<sub> test cases <DD-MM-YYYY>_<HH-mm>.csv` | |
| Report (after each run) | `reports/<module>/<sub> test <DD-MM-YYYY>_<HH-mm>.html` | |
| History of all runs | `reports/index.html` | |

One sub-module = one document + one spec file + one report.

## 2. Test case ID
`TC_<SUBMODULE>_<NN>`, for example `TC_LOGIN_03`. An ID is never reused.
The test title in code is `TC_LOGIN_03 - <title>`, and the document row has the same ID and title.

## 3. Title rule
A title is one complete English sentence that says **what is done** and **which data is used**, for example:
`Login with username "standard_user" and the wrong password "wrong_password"`.
It appears unchanged in the document, in the code, in the CSV and in the report.

## 4. Columns of every test case table (never change)

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |

- **Priority:** `High` (core flow, the product is unusable if it fails), `Medium`, `Low` (cosmetic).
- **Steps:** short, numbered, action words: `1. Open the login page. 2. Click Login.`
- **Expected result:** clear and checkable.

## 5. Writing rules
1. Simple English, active voice: "Click Login", not "Login should be clicked".
2. One test case checks one thing.
3. Quote exact interface text: "Epic sadface: Username is required".
4. Do not hard-code values that change; write the relationship ("the total equals the item total plus the tax").
5. A test case is never silently changed: update the document, run `npm run cases:csv`, review the diff.

## 6. Master CSV (for regression)
- The master CSV is generated from the documents: `npm run cases:csv`. Edit the document, never the CSV.
- Rows that did not change keep their `Last Updated` date, so the CSV shows what changed and when.
- `npm run cases:check` fails when a document, the CSV and the test code do not agree.
- `npm run test:regression` runs every case marked `Regression = Yes`; `npm run test:smoke` runs only the High priority cases.
