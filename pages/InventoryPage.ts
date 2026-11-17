import { expect, Locator } from '@playwright/test';
import { slug, toMoney } from '../utils/constants';
import { BasePage } from './BasePage';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage extends BasePage {
  readonly title: Locator = this.page.getByTestId('title');
  readonly items: Locator = this.page.getByTestId('inventory-item');
  readonly sortDropdown: Locator = this.page.getByTestId('product-sort-container');
  readonly cartLink: Locator = this.page.getByTestId('shopping-cart-link');
  readonly cartBadge: Locator = this.page.getByTestId('shopping-cart-badge');

  async open(): Promise<void> {
    await this.goto('/inventory.html');
    await this.expectLoaded();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.title).toHaveText('Products');
  }

  async productNames(): Promise<string[]> {
    return this.page.getByTestId('inventory-item-name').allTextContents();
  }

  async productPrices(): Promise<number[]> {
    return (await this.page.getByTestId('inventory-item-price').allTextContents()).map(toMoney);
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async addToCart(productName: string): Promise<void> {
    await this.page.getByTestId(`add-to-cart-${slug(productName)}`).click();
  }

  async removeFromCart(productName: string): Promise<void> {
    await this.page.getByTestId(`remove-${slug(productName)}`).click();
  }

  /** Number on the cart badge (0 when the badge is not shown). */
  async cartCount(): Promise<number> {
    return (await this.cartBadge.isVisible()) ? Number(await this.cartBadge.innerText()) : 0;
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async openProduct(productName: string): Promise<void> {
    await this.page.getByTestId('inventory-item-name').filter({ hasText: productName }).click();
  }
}
