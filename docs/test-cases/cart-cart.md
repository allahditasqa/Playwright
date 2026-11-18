# Cart Test Cases

**Module:** Cart | **Sub-module:** Cart | **Spec:** `tests/cart/cart.spec.ts`
**Report:** `reports/<module>/<Module Name> test <DD-MM-YYYY>_<HH-mm-ss>.html` (all runs: `reports/index.html`)  |  **Master CSV:** `docs/test-cases/cart-cart.csv`

## Overview
The cart shows the chosen items. The user can remove items, go back to shopping or start the checkout.

## Scope and notes
- All cases use the saved login session and start with an empty cart.

## A. Cart

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC_CART_01 | Add "Sauce Labs Backpack" and open the cart and check the backpack is listed once | High | User is logged in | 1. Add "Sauce Labs Backpack". 2. Open the cart. | The cart page lists the backpack once. |
| TC_CART_02 | Add "Sauce Labs Backpack" and "Sauce Labs Bike Light" and check both are listed in the cart | Medium | User is logged in | 1. Add "Sauce Labs Backpack" and "Sauce Labs Bike Light". 2. Open the cart. | Both products are listed. |
| TC_CART_03 | Remove "Sauce Labs Backpack" inside the cart and check the cart is empty | Medium | User is logged in | 1. Add "Sauce Labs Backpack". 2. Open the cart. 3. Click "Remove". | The cart is empty and the cart badge disappears. |
| TC_CART_04 | Click "Continue Shopping" in the cart and check the products page opens | Low | User is logged in | 1. Open the cart. 2. Click "Continue Shopping". | The products page opens. |
| TC_CART_05 | Click "Checkout" in the cart and check the "Your Information" step opens | High | User is logged in | 1. Add "Sauce Labs Backpack". 2. Open the cart. 3. Click "Checkout". | The "Checkout: Your Information" step opens. |

## Traceability

Every case is automated. Requirement IDs are listed in [TEST_STRATEGY.md](../TEST_STRATEGY.md).

| ID | Type | Test data | Automation | Spec file | Requirement |
| --- | --- | --- | --- | --- | --- |
| TC_CART_01 | Functional | Product "Sauce Labs Backpack" | Automated | `tests/cart/cart.spec.ts` | REQ-CART-01 |
| TC_CART_02 | Functional | Products "Sauce Labs Backpack" and "Sauce Labs Bike Light" | Automated | `tests/cart/cart.spec.ts` | REQ-CART-01 |
| TC_CART_03 | Functional | Product "Sauce Labs Backpack" | Automated | `tests/cart/cart.spec.ts` | REQ-CART-02 |
| TC_CART_04 | Functional (navigation) | None | Automated | `tests/cart/cart.spec.ts` | REQ-CART-03 |
| TC_CART_05 | Functional (navigation) | Product "Sauce Labs Backpack" | Automated | `tests/cart/cart.spec.ts` | REQ-CART-03 |

## Summary

| Cases | High priority | Automated |
| --- | --- | --- |
| 5 | 2 | 5 |
