# Auth - Login Test Cases

**Module:** Auth | **Sub-module:** Login | **Spec:** `tests/auth/login.spec.ts`
**Report:** `reports/<module>/<Module Name> test <DD-MM-YYYY>_<HH-mm-ss>.html` (all runs: `reports/index.html`)  |  **Master CSV:** `docs/test-cases/auth-login.csv`

## Overview
The login page lets a user sign in with a username and a password. After a successful login the products page opens.

## Scope and notes
- All cases start without a saved session.
- The demo credentials are public (printed on the login page of https://www.saucedemo.com).
- Error messages are copied from the app so a wording change shows up as a failing test.

## A. Page

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC_LOGIN_01 | Check the logo, username, password and Login button are visible on the login page | High | User is logged out | 1. Open the login page. | The logo, the username field, the password field and the Login button are visible. |
| TC_LOGIN_02 | Check the password field hides the typed text | Low | User is logged out | 1. Type any text in the password field. | The typed text is hidden (the field type is password). |

## B. Positive (valid login)

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC_LOGIN_03 | Login with username "standard_user" and the correct password by clicking Login | High | User is logged out | 1. Type the username `standard_user` and the correct password. 2. Click Login. | The products page opens. |
| TC_LOGIN_04 | Login with username "standard_user" and the correct password by pressing Enter | Medium | User is logged out | 1. Type the username `standard_user` and the correct password. 2. Press Enter. | The products page opens. |
| TC_LOGIN_05 | Login with username "standard_user", then reload the page and stay logged in | Medium | User is logged out | 1. Login as `standard_user`. 2. Reload the page. | The products page is still shown (the user stays logged in). |
| TC_LOGIN_06 | Login with username "standard_user", then log out from the menu and check the login page opens | High | User is logged out | 1. Login as `standard_user`. 2. Open the menu and click Logout. | The login page opens. |

## C. Negative (wrong or missing details)

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC_LOGIN_07 | Login with the locked-out user "locked_out_user" and check the locked out message | High | User is logged out | 1. Type the username `locked_out_user` and the correct password. 2. Click Login. | The message "Epic sadface: Sorry, this user has been locked out." is shown and the user stays on the login page. |
| TC_LOGIN_08 | Login with username "standard_user" and the wrong password "wrong_password" | High | User is logged out | 1. Type the username `standard_user` and the password `wrong_password`. 2. Click Login. | The message "Epic sadface: Username and password do not match any user in this service" is shown and the user stays on the login page. |
| TC_LOGIN_09 | Login with the unknown username "unknown_user" and a password | Medium | User is logged out | 1. Type the username `unknown_user` and a password. 2. Click Login. | The message "Epic sadface: Username and password do not match any user in this service" is shown. |
| TC_LOGIN_10 | Click Login with empty username and empty password | High | User is logged out | 1. Leave both fields empty. 2. Click Login. | The message "Epic sadface: Username is required" is shown. |
| TC_LOGIN_11 | Click Login with username "standard_user" and empty password | Medium | User is logged out | 1. Type the username `standard_user` and leave the password empty. 2. Click Login. | The message "Epic sadface: Password is required" is shown. |
| TC_LOGIN_12 | Login with the username in capital letters "STANDARD_USER" (username is case sensitive) | Low | User is logged out | 1. Type the username `STANDARD_USER` and the correct password. 2. Click Login. | The "do not match" message is shown (the username is case sensitive). |
| TC_LOGIN_13 | Login with SQL injection text "' OR '1'='1" as the username | Medium | User is logged out | 1. Type `' OR '1'='1` as the username and the correct password. 2. Click Login. | The "do not match" message is shown and the user stays on the login page. |
| TC_LOGIN_14 | Close the error message with the X button and check the message disappears | Low | User is logged out | 1. Click Login with empty fields. 2. Click the X button of the error message. | The error message disappears. |

## D. Access control

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC_LOGIN_15 | Open /inventory.html without login and check the "must be logged in" message | High | User is logged out | 1. Open `/inventory.html` directly in the address bar. | The login page opens with the message "Epic sadface: You can only access '/inventory.html' when you are logged in." |

## Traceability

Every case is automated. Requirement IDs are listed in [TEST_STRATEGY.md](../TEST_STRATEGY.md).

| ID | Type | Test data | Automation | Spec file | Requirement |
| --- | --- | --- | --- | --- | --- |
| TC_LOGIN_01 | Functional (UI) | None | Automated | `tests/auth/login.spec.ts` | REQ-AUTH-01 |
| TC_LOGIN_02 | Functional (UI) | Any text typed in the password field | Automated | `tests/auth/login.spec.ts` | REQ-AUTH-01 |
| TC_LOGIN_03 | Functional | Username standard_user, the public demo password | Automated | `tests/auth/login.spec.ts` | REQ-AUTH-02 |
| TC_LOGIN_04 | Functional | Username standard_user, the public demo password | Automated | `tests/auth/login.spec.ts` | REQ-AUTH-02 |
| TC_LOGIN_05 | Functional | Username standard_user, the public demo password | Automated | `tests/auth/login.spec.ts` | REQ-AUTH-03 |
| TC_LOGIN_06 | Functional | Username standard_user, the public demo password | Automated | `tests/auth/login.spec.ts` | REQ-AUTH-03 |
| TC_LOGIN_07 | Negative | Username locked_out_user, the public demo password | Automated | `tests/auth/login.spec.ts` | REQ-AUTH-04 |
| TC_LOGIN_08 | Negative | Username standard_user, password wrong_password | Automated | `tests/auth/login.spec.ts` | REQ-AUTH-05 |
| TC_LOGIN_09 | Negative | Username unknown_user, any password | Automated | `tests/auth/login.spec.ts` | REQ-AUTH-05 |
| TC_LOGIN_10 | Negative / Validation | Username empty, password empty | Automated | `tests/auth/login.spec.ts` | REQ-AUTH-06 |
| TC_LOGIN_11 | Negative / Validation | Username standard_user, password empty | Automated | `tests/auth/login.spec.ts` | REQ-AUTH-06 |
| TC_LOGIN_12 | Negative / Boundary | Username STANDARD_USER (capital letters), the public demo password | Automated | `tests/auth/login.spec.ts` | REQ-AUTH-05 |
| TC_LOGIN_13 | Security | Username ' OR '1'='1, the public demo password | Automated | `tests/auth/login.spec.ts` | REQ-AUTH-05 |
| TC_LOGIN_14 | Functional (UI) | Username empty, password empty | Automated | `tests/auth/login.spec.ts` | REQ-AUTH-07 |
| TC_LOGIN_15 | Security / Access control | URL /inventory.html | Automated | `tests/auth/login.spec.ts` | REQ-AUTH-08 |

## Summary

| Cases | High priority | Automated |
| --- | --- | --- |
| 15 | 7 | 15 |
