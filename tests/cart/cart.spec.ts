// Cart module. Test cases: docs/test-cases/cart-cart.md (same IDs).
import { expect, test } from '../../fixtures/test-fixtures';
import { BACKPACK, BIKE_LIGHT } from '../../test-data/products';
import { ROUTE } from '../../utils/constants';

test.beforeEach(async ({ inventoryPage }) => {
  await inventoryPage.open();
});

test.describe('Cart', () => {
  test('TC_CART_01 - Add "Sauce Labs Backpack" and open the cart and check the backpack is listed once', async ({
    page,
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.addToCart(BACKPACK.name);
    await inventoryPage.openCart();
    await expect(page).toHaveURL(ROUTE.cart);
    expect(await cartPage.itemNames()).toEqual([BACKPACK.name]);
  });

  test('TC_CART_02 - Add "Sauce Labs Backpack" and "Sauce Labs Bike Light" and check both are listed in the cart', async ({
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.addToCart(BACKPACK.name);
    await inventoryPage.addToCart(BIKE_LIGHT.name);
    await inventoryPage.openCart();
    expect((await cartPage.itemNames()).sort()).toEqual([BACKPACK.name, BIKE_LIGHT.name].sort());
  });

  test('TC_CART_03 - Remove "Sauce Labs Backpack" inside the cart and check the cart is empty', async ({
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.addToCart(BACKPACK.name);
    await inventoryPage.openCart();
    await cartPage.remove(BACKPACK.name);
    await expect(cartPage.items).toHaveCount(0);
    await expect(inventoryPage.cartBadge).toBeHidden();
  });

  test('TC_CART_04 - Click "Continue Shopping" in the cart and check the products page opens', async ({
    page,
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.openCart();
    await cartPage.continueShoppingButton.click();
    await expect(page).toHaveURL(ROUTE.inventory);
  });

  test('TC_CART_05 - Click "Checkout" in the cart and check the "Your Information" step opens', async ({
    page,
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.addToCart(BACKPACK.name);
    await inventoryPage.openCart();
    await cartPage.checkout();
    await expect(page).toHaveURL(ROUTE.checkoutInfo);
  });
});
