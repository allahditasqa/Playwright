import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/** The details page of one product (opened by clicking a product name). */
export class ProductDetailsPage extends BasePage {
  readonly name: Locator = this.page.getByTestId('inventory-item-name');
  readonly price: Locator = this.page.getByTestId('inventory-item-price');
  readonly backButton: Locator = this.page.getByTestId('back-to-products');
}
