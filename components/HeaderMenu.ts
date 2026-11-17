import { Locator, Page } from '@playwright/test';

/** The burger menu in the page header. It is a reusable component: the same on every logged-in page. */
export class HeaderMenu {
  readonly menuButton: Locator;
  readonly logoutLink: Locator;
  readonly allItemsLink: Locator;
  readonly resetLink: Locator;

  constructor(private readonly page: Page) {
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
    this.logoutLink = page.getByTestId('logout-sidebar-link');
    this.allItemsLink = page.getByTestId('inventory-sidebar-link');
    this.resetLink = page.getByTestId('reset-sidebar-link');
  }

  async open(): Promise<void> {
    await this.menuButton.click();
  }

  async logout(): Promise<void> {
    await this.open();
    await this.logoutLink.click();
  }

  /** Resets the app state (empties the cart). */
  async resetAppState(): Promise<void> {
    await this.open();
    await this.resetLink.click();
  }
}
