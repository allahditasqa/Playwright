import { expect, Locator } from '@playwright/test';
import { toMoney } from '../utils/constants';
import { BasePage } from './BasePage';

/** The three checkout screens: your information, overview, complete. */
export class CheckoutPage extends BasePage {
  readonly firstName: Locator = this.page.getByTestId('firstName');
  readonly lastName: Locator = this.page.getByTestId('lastName');
  readonly postalCode: Locator = this.page.getByTestId('postalCode');
  readonly continueButton: Locator = this.page.getByTestId('continue');
  readonly cancelButton: Locator = this.page.getByTestId('cancel');
  readonly errorMessage: Locator = this.page.getByTestId('error');
  readonly finishButton: Locator = this.page.getByTestId('finish');
  readonly completeHeader: Locator = this.page.getByTestId('complete-header');
  readonly backHomeButton: Locator = this.page.getByTestId('back-to-products');

  async fillInformation(first: string, last: string, zip: string): Promise<void> {
    if (first) await this.firstName.fill(first);
    if (last) await this.lastName.fill(last);
    if (zip) await this.postalCode.fill(zip);
  }

  async subtotal(): Promise<number> {
    return toMoney(await this.page.getByTestId('subtotal-label').innerText());
  }

  async tax(): Promise<number> {
    return toMoney(await this.page.getByTestId('tax-label').innerText());
  }

  async total(): Promise<number> {
    return toMoney(await this.page.getByTestId('total-label').innerText());
  }

  async expectError(message: string): Promise<void> {
    await expect(this.errorMessage).toHaveText(message);
  }
}
