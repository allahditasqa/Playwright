// Inventory (products) module. Test cases: docs/test-cases/inventory-products.md (same IDs).
import { expect, test } from '../../fixtures/test-fixtures';
import { BACKPACK, BIKE_LIGHT, PRODUCTS } from '../../test-data/products';
import { ROUTE } from '../../utils/constants';

test.beforeEach(async ({ inventoryPage }) => {
  await inventoryPage.open();
});

test.describe('Products - list', () => {
  test('TC_PRODUCTS_01 - Open the products page and check 6 products are shown with the expected names and prices', async ({
    inventoryPage,
  }) => {
    await expect(inventoryPage.items).toHaveCount(PRODUCTS.length);
    expect((await inventoryPage.productNames()).sort()).toEqual(PRODUCTS.map((p) => p.name).sort());
    expect((await inventoryPage.productPrices()).sort((a, b) => a - b)).toEqual(
      PRODUCTS.map((p) => p.price).sort((a, b) => a - b),
    );
  });
});

test.describe('Products - sorting', () => {
  test('TC_PRODUCTS_02 - Sort by "Name (A to Z)" and check the names are in ascending order', async ({
    inventoryPage,
  }) => {
    await inventoryPage.sortBy('az');
    const names = await inventoryPage.productNames();
    expect(names).toEqual([...names].sort());
  });

  test('TC_PRODUCTS_03 - Sort by "Name (Z to A)" and check the names are in descending order', async ({
    inventoryPage,
  }) => {
    await inventoryPage.sortBy('za');
    const names = await inventoryPage.productNames();
    expect(names).toEqual([...names].sort().reverse());
  });

  test('TC_PRODUCTS_04 - Sort by "Price (low to high)" and check the prices are in ascending order', async ({
    inventoryPage,
  }) => {
    await inventoryPage.sortBy('lohi');
    const prices = await inventoryPage.productPrices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('TC_PRODUCTS_05 - Sort by "Price (high to low)" and check the prices are in descending order', async ({
    inventoryPage,
  }) => {
    await inventoryPage.sortBy('hilo');
    const prices = await inventoryPage.productPrices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });
});

test.describe('Products - cart badge', () => {
  test('TC_PRODUCTS_06 - Add "Sauce Labs Backpack" to the cart and check the cart badge shows 1', async ({
    inventoryPage,
  }) => {
    await inventoryPage.addToCart(BACKPACK.name);
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('TC_PRODUCTS_07 - Add "Sauce Labs Backpack" and "Sauce Labs Bike Light" and check the cart badge shows 2', async ({
    inventoryPage,
  }) => {
    await inventoryPage.addToCart(BACKPACK.name);
    await inventoryPage.addToCart(BIKE_LIGHT.name);
    await expect(inventoryPage.cartBadge).toHaveText('2');
  });

  test('TC_PRODUCTS_08 - Add "Sauce Labs Backpack" and remove it again and check the cart badge disappears', async ({
    inventoryPage,
  }) => {
    await inventoryPage.addToCart(BACKPACK.name);
    await inventoryPage.removeFromCart(BACKPACK.name);
    await expect(inventoryPage.cartBadge).toBeHidden();
  });
});

test.describe('Products - details', () => {
  test('TC_PRODUCTS_09 - Open "Sauce Labs Backpack" and check its details page shows the name and price $29.99', async ({
    page,
    inventoryPage,
    productDetailsPage,
  }) => {
    await inventoryPage.openProduct(BACKPACK.name);
    await expect(page).toHaveURL(ROUTE.inventoryItem);
    await expect(productDetailsPage.name).toHaveText(BACKPACK.name);
    await expect(productDetailsPage.price).toHaveText('$29.99');
  });

  test('TC_PRODUCTS_10 - Open a product and click "Back to products" and check the products page opens', async ({
    page,
    inventoryPage,
    productDetailsPage,
  }) => {
    await inventoryPage.openProduct(BIKE_LIGHT.name);
    await productDetailsPage.backButton.click();
    await expect(page).toHaveURL(ROUTE.inventory);
  });
});
