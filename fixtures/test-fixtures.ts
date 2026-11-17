// Fixtures hand every test ready-made page objects, so a test never writes `new LoginPage(page)`.
import { test as base } from '@playwright/test';
import { PostsApi } from '../api/PostsApi';
import { HeaderMenu } from '../components/HeaderMenu';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { InventoryPage } from '../pages/InventoryPage';
import { LoginPage } from '../pages/LoginPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';

type Fixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  productDetailsPage: ProductDetailsPage;
  headerMenu: HeaderMenu;
  postsApi: PostsApi;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  productDetailsPage: async ({ page }, use) => use(new ProductDetailsPage(page)),
  headerMenu: async ({ page }, use) => use(new HeaderMenu(page)),
  postsApi: async ({ request }, use) => use(new PostsApi(request)),
});

export { expect } from '@playwright/test';
