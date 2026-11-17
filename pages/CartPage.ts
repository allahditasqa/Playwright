import { expect, Locator } from '@playwright/test';
import { slug } from '../utils/constants';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly title: Locator = this.page.getByTestId('title');
  readonly items: Locator = this.page.getByTestId('inventory-item');
  readonly checkoutButton: Locator = this.page.getByTestId('checkout');
  readonly continueShoppingButton: Locator = this.page.getByTestId('continue-shopping');

  async open(): Promise<void> {
    await this.goto('/cart.html');
    await expect(this.title).toHaveText('Your Cart');
  }

  async itemNames(): Promise<string[]> {
    return this.page.getByTestId('inventory-item-name').allTextContents();
  }

  async remove(productName: string): Promise<void> {
    await this.page.getByTestId(`remove-${slug(productName)}`).click();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
