# QA Process: from framework to sign-off

This repository is not only a set of scripts. It shows the full life cycle of a tested module, the same way a QA team works.
Each module goes through the same steps, and every step leaves a file in the repository.

## 1. Life cycle and deliverables

| # | Step | What happens | Deliverable |
| --- | --- | --- | --- |
| 0 | Framework (once) | Playwright + TypeScript, Page Object Model, reporters, CI | `README.md`, `playwright.config.ts`, `pages/`, `reporters/` |
| 1 | Analysis | Explore the application by hand: flows, rules, risks | Notes in the test strategy |
| 2 | Test strategy / plan | Scope, approach, environment, data, entry and exit criteria, risks | [docs/TEST_STRATEGY.md](TEST_STRATEGY.md) |
| 3 | Test design | Test cases in plain English, one standard format, design techniques | `docs/test-cases/<module>-<sub>.md` ([standard](TEST_CASE_STANDARD.md)) |
| 4 | Automation | Page objects and spec files, only for stable, repeatable cases | `pages/`, `tests/<module>/<sub>.spec.ts` |
| 5 | Execution | module report and CSV with the real results after the run, history | `reports/<module>/...` and `reports/index.html` |
| 6 | Defects / observations | Anything wrong or doubtful, with evidence | `docs/defects/<module>.md` ([template](templates/defect-log.md)) |
| 7 | Sign-off | Final report: coverage, results, defects, risks, recommendation | `docs/signoff/<module> signoff <date>.md` |

## 2. Test design techniques used
- **Equivalence partitioning and boundary values**: empty, valid, invalid, wrong case, very long input.
- **Positive and negative cases** for every feature, plus **error guessing** (spaces, special characters, SQL text).
- **State transition**: logged out → logged in → logged out; empty cart → one item → two items → order complete.
- **Business rules**: totals, sorting order, mandatory fields.
- **Access control**: a protected page opened without a login.
- **API contract checks**: status codes, response shape, filtering, error status for unknown ids.

## 3. Entry and exit criteria

**Entry:** test strategy and test case documents are written, the application is reachable, the code compiles.

**Exit (needed for a sign-off):**
- every **High** priority case was executed and passed,
- the overall pass rate of executed cases is **95% or more**,
- there is **no open Critical or High defect**,
- cases that were not executed are listed with a reason.

## 4. Severity

| Severity | Meaning | Example |
| --- | --- | --- |
| Critical | Core flow is broken, data is lost, security hole | A user can buy without logging in |
| High | A major feature does not work and there is no workaround | A valid user cannot log in |
| Medium | Partly working or a workaround exists | Sorting works but one option is wrong |
| Low | Cosmetic | Spelling, alignment |

An **observation** is something that looks odd but may be intended; it needs a decision from the product owner.

## 5. Sign-off decision
- **Signed off**: exit criteria met, nothing pending.
- **Conditional sign-off**: criteria nearly met; known gaps (not executed cases, open observations) are written down.
- **Not signed off**: a Critical or High defect is open, or a High case failed.

The report is generated from real run data (`npm run signoff -- <module>`), so the numbers cannot be mistyped.
QA gives the recommendation; the product owner approves.

## 6. Quality gates before every commit
`npm run check` runs, in one command: type check, lint, format check and the **traceability check**
(every documented test case has a test, no duplicate IDs, the master CSV matches the documents).
The same command runs in CI on every push.
