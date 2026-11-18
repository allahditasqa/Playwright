# Checkout Test Cases

**Module:** Checkout | **Sub-module:** Checkout | **Spec:** `tests/checkout/checkout.spec.ts`
**Report:** `reports/<module>/<Module Name> test <DD-MM-YYYY>_<HH-mm-ss>.html` (all runs: `reports/index.html`)  |  **Master CSV:** `docs/test-cases/checkout-checkout.csv`

## Overview
The checkout has three steps: your information, overview, complete. This is the end-to-end purchase flow.

## Scope and notes
- Every case starts on the "Your Information" step with "Sauce Labs Backpack" in the cart.
- No real payment happens: the demo shop is a public test site.

## A. Information step

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC_CHECKOUT_01 | Continue with first name "Ada", last name "Lovelace" and postal code "12345" and check the overview opens | High | User is logged in and "Sauce Labs Backpack" is in the cart. The checkout "Your Information" step is open | 1. Type first name `Ada`, last name `Lovelace` and postal code `12345`. 2. Click Continue. | The overview step opens. |
| TC_CHECKOUT_02 | Continue with an empty first name and check the "First Name is required" message | High | User is logged in and "Sauce Labs Backpack" is in the cart. The checkout "Your Information" step is open | 1. Leave the first name empty and fill the other fields. 2. Click Continue. | The message "Error: First Name is required" is shown. |
| TC_CHECKOUT_03 | Continue with an empty last name and check the "Last Name is required" message | Medium | User is logged in and "Sauce Labs Backpack" is in the cart. The checkout "Your Information" step is open | 1. Leave the last name empty and fill the other fields. 2. Click Continue. | The message "Error: Last Name is required" is shown. |
| TC_CHECKOUT_04 | Continue with an empty postal code and check the "Postal Code is required" message | Medium | User is logged in and "Sauce Labs Backpack" is in the cart. The checkout "Your Information" step is open | 1. Leave the postal code empty and fill the other fields. 2. Click Continue. | The message "Error: Postal Code is required" is shown. |
| TC_CHECKOUT_05 | Click Cancel on the information step and check the cart opens | Low | User is logged in and "Sauce Labs Backpack" is in the cart. The checkout "Your Information" step is open | 1. Click Cancel. | The cart opens. |

## B. Overview and completion

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC_CHECKOUT_06 | Finish an order for "Sauce Labs Backpack" and check the "Thank you for your order!" message | High | User is logged in and "Sauce Labs Backpack" is in the cart. The checkout "Your Information" step is open | 1. Fill the information and click Continue. 2. Click Finish. | The message "Thank you for your order!" is shown. |
| TC_CHECKOUT_07 | On the overview check the item total is $29.99 and the total equals item total plus tax | Medium | User is logged in and "Sauce Labs Backpack" is in the cart. The checkout "Your Information" step is open | 1. Fill the information and click Continue. | The item total is $29.99 and the total equals the item total plus the tax. |
| TC_CHECKOUT_08 | Finish an order and click "Back Home" and check the cart is empty | Medium | User is logged in and "Sauce Labs Backpack" is in the cart. The checkout "Your Information" step is open | 1. Fill the information, click Continue and Finish. 2. Click "Back Home". | The products page opens and the cart badge is not shown. |

## C. Totals with two items

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC_CHECKOUT_09 | Add "Sauce Labs Bike Light" too and check the item total is the sum of both prices | Medium | User is logged in and "Sauce Labs Backpack" is in the cart. The checkout "Your Information" step is open | 1. Go to the products page and add "Sauce Labs Bike Light". 2. Open the cart and click Checkout. 3. Fill the information and click Continue. | The item total is $39.98 (29.99 + 9.99). |

## Traceability

Every case is automated. Requirement IDs are listed in [TEST_STRATEGY.md](../TEST_STRATEGY.md).

| ID | Type | Test data | Automation | Spec file | Requirement |
| --- | --- | --- | --- | --- | --- |
| TC_CHECKOUT_01 | Functional / E2E | First name Ada, last name Lovelace, postal code 12345 | Automated | `tests/checkout/checkout.spec.ts` | REQ-CHK-01 |
| TC_CHECKOUT_02 | Negative / Validation | First name empty, last name Lovelace, postal code 12345 | Automated | `tests/checkout/checkout.spec.ts` | REQ-CHK-01 |
| TC_CHECKOUT_03 | Negative / Validation | First name Ada, last name empty, postal code 12345 | Automated | `tests/checkout/checkout.spec.ts` | REQ-CHK-01 |
| TC_CHECKOUT_04 | Negative / Validation | First name Ada, last name Lovelace, postal code empty | Automated | `tests/checkout/checkout.spec.ts` | REQ-CHK-01 |
| TC_CHECKOUT_05 | Functional (navigation) | None | Automated | `tests/checkout/checkout.spec.ts` | REQ-CHK-01 |
| TC_CHECKOUT_06 | Functional / E2E | Product "Sauce Labs Backpack", customer Ada Lovelace 12345 | Automated | `tests/checkout/checkout.spec.ts` | REQ-CHK-02 |
| TC_CHECKOUT_07 | Functional (calculation) | Product "Sauce Labs Backpack", price $29.99 | Automated | `tests/checkout/checkout.spec.ts` | REQ-CHK-03 |
| TC_CHECKOUT_08 | Functional / E2E | Product "Sauce Labs Backpack", customer Ada Lovelace 12345 | Automated | `tests/checkout/checkout.spec.ts` | REQ-CHK-02 |
| TC_CHECKOUT_09 | Functional (calculation) | Products "Sauce Labs Backpack" and "Sauce Labs Bike Light" | Automated | `tests/checkout/checkout.spec.ts` | REQ-CHK-03 |

## Summary

| Cases | High priority | Automated |
| --- | --- | --- |
| 9 | 3 | 9 |
