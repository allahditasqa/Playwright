# Cart Test Cases

**Automation:** `tests/cart/cart.spec.ts`  |  **Report:** `reports/cart/cart test <DD-MM-YYYY>_<HH-mm>.html` (all reports: `reports/index.html`)

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

## Summary

| Cases | High priority | Automated |
| --- | --- | --- |
| 5 | 2 | 5 |
