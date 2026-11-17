// Checkout module: the end-to-end purchase. Test cases: docs/test-cases/checkout-checkout.md (same IDs).
import { expect, test } from '../../fixtures/test-fixtures';
import { BACKPACK, BIKE_LIGHT } from '../../test-data/products';
import { MESSAGES } from '../../test-data/users';
import { ROUTE } from '../../utils/constants';

test.beforeEach(async ({ inventoryPage, cartPage }) => {
  await inventoryPage.open();
  await inventoryPage.addToCart(BACKPACK.name);
  await inventoryPage.openCart();
  await cartPage.checkout();
});

test.describe('Checkout - information step', () => {
  test('TC_CHECKOUT_01 - Continue with first name "Ada", last name "Lovelace" and postal code "12345" and check the overview opens', async ({
    page,
    checkoutPage,
  }) => {
    await checkoutPage.fillInformation('Ada', 'Lovelace', '12345');
    await checkoutPage.continueButton.click();
    await expect(page).toHaveURL(ROUTE.checkoutOverview);
  });

  test('TC_CHECKOUT_02 - Continue with an empty first name and check the "First Name is required" message', async ({
    checkoutPage,
  }) => {
    await checkoutPage.fillInformation('', 'Lovelace', '12345');
    await checkoutPage.continueButton.click();
    await checkoutPage.expectError(MESSAGES.firstNameRequired);
  });

  test('TC_CHECKOUT_03 - Continue with an empty last name and check the "Last Name is required" message', async ({
    checkoutPage,
  }) => {
    await checkoutPage.fillInformation('Ada', '', '12345');
    await checkoutPage.continueButton.click();
    await checkoutPage.expectError(MESSAGES.lastNameRequired);
  });

  test('TC_CHECKOUT_04 - Continue with an empty postal code and check the "Postal Code is required" message', async ({
    checkoutPage,
  }) => {
    await checkoutPage.fillInformation('Ada', 'Lovelace', '');
    await checkoutPage.continueButton.click();
    await checkoutPage.expectError(MESSAGES.postalCodeRequired);
  });

  test('TC_CHECKOUT_05 - Click Cancel on the information step and check the cart opens', async ({
    page,
    checkoutPage,
  }) => {
    await checkoutPage.cancelButton.click();
    await expect(page).toHaveURL(ROUTE.cart);
  });
});

test.describe('Checkout - overview and completion', () => {
  test('TC_CHECKOUT_06 - Finish an order for "Sauce Labs Backpack" and check the "Thank you for your order!" message', async ({
    page,
    checkoutPage,
  }) => {
    await checkoutPage.fillInformation('Ada', 'Lovelace', '12345');
    await checkoutPage.continueButton.click();
    await checkoutPage.finishButton.click();
    await expect(page).toHaveURL(ROUTE.checkoutComplete);
    await expect(checkoutPage.completeHeader).toHaveText(MESSAGES.orderComplete);
  });

  test('TC_CHECKOUT_07 - On the overview check the item total is $29.99 and the total equals item total plus tax', async ({
    checkoutPage,
  }) => {
    await checkoutPage.fillInformation('Ada', 'Lovelace', '12345');
    await checkoutPage.continueButton.click();
    expect(await checkoutPage.subtotal()).toBe(BACKPACK.price);
    expect(await checkoutPage.total()).toBeCloseTo((await checkoutPage.subtotal()) + (await checkoutPage.tax()), 2);
  });

  test('TC_CHECKOUT_08 - Finish an order and click "Back Home" and check the cart is empty', async ({
    page,
    checkoutPage,
    inventoryPage,
  }) => {
    await checkoutPage.fillInformation('Ada', 'Lovelace', '12345');
    await checkoutPage.continueButton.click();
    await checkoutPage.finishButton.click();
    await checkoutPage.backHomeButton.click();
    await expect(page).toHaveURL(ROUTE.inventory);
    await expect(inventoryPage.cartBadge).toBeHidden();
  });
});

test.describe('Checkout - totals with two items', () => {
  test('TC_CHECKOUT_09 - Add "Sauce Labs Bike Light" too and check the item total is the sum of both prices', async ({
    page,
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    await page.goto('/inventory.html');
    await inventoryPage.addToCart(BIKE_LIGHT.name);
    await inventoryPage.openCart();
    await cartPage.checkout();
    await checkoutPage.fillInformation('Ada', 'Lovelace', '12345');
    await checkoutPage.continueButton.click();
    expect(await checkoutPage.subtotal()).toBeCloseTo(BACKPACK.price + BIKE_LIGHT.price, 2);
  });
});
