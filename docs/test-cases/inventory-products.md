# Inventory - Products Test Cases

**Automation:** `tests/inventory/products.spec.ts`  |  **Report:** `reports/inventory/products test <DD-MM-YYYY>_<HH-mm>.html` (all reports: `reports/index.html`)

## Overview
The products page lists the shop items. The user can sort them, add or remove them from the cart and open their details.

## Scope and notes
- All cases use the saved login session and start with an empty cart.
- The expected names and prices are kept in test-data/products.ts.

## A. List

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC_PRODUCTS_01 | Open the products page and check 6 products are shown with the expected names and prices | High | User is logged in | 1. Open the products page. | Six products are shown and their names and prices are the expected ones. |

## B. Sorting

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC_PRODUCTS_02 | Sort by "Name (A to Z)" and check the names are in ascending order | High | User is logged in | 1. Choose "Name (A to Z)" in the sort menu. | The product names are in ascending order. |
| TC_PRODUCTS_03 | Sort by "Name (Z to A)" and check the names are in descending order | Medium | User is logged in | 1. Choose "Name (Z to A)" in the sort menu. | The product names are in descending order. |
| TC_PRODUCTS_04 | Sort by "Price (low to high)" and check the prices are in ascending order | High | User is logged in | 1. Choose "Price (low to high)" in the sort menu. | The prices are in ascending order. |
| TC_PRODUCTS_05 | Sort by "Price (high to low)" and check the prices are in descending order | Medium | User is logged in | 1. Choose "Price (high to low)" in the sort menu. | The prices are in descending order. |

## C. Cart badge

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC_PRODUCTS_06 | Add "Sauce Labs Backpack" to the cart and check the cart badge shows 1 | High | User is logged in | 1. Click "Add to cart" on "Sauce Labs Backpack". | The cart badge shows 1. |
| TC_PRODUCTS_07 | Add "Sauce Labs Backpack" and "Sauce Labs Bike Light" and check the cart badge shows 2 | Medium | User is logged in | 1. Click "Add to cart" on "Sauce Labs Backpack". 2. Click "Add to cart" on "Sauce Labs Bike Light". | The cart badge shows 2. |
| TC_PRODUCTS_08 | Add "Sauce Labs Backpack" and remove it again and check the cart badge disappears | Medium | User is logged in | 1. Add "Sauce Labs Backpack". 2. Click "Remove" on the same product. | The cart badge disappears. |

## D. Product details

| ID | Title | Priority | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- | --- |
| TC_PRODUCTS_09 | Open "Sauce Labs Backpack" and check its details page shows the name and price $29.99 | Medium | User is logged in | 1. Click the product name "Sauce Labs Backpack". | The details page opens and shows the name and the price $29.99. |
| TC_PRODUCTS_10 | Open a product and click "Back to products" and check the products page opens | Low | User is logged in | 1. Open a product. 2. Click "Back to products". | The products page opens. |

## Summary

| Cases | High priority | Automated |
| --- | --- | --- |
| 10 | 4 | 10 |
