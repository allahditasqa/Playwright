import { expect, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator = this.page.getByTestId('username');
  readonly passwordInput: Locator = this.page.getByTestId('password');
  readonly loginButton: Locator = this.page.getByTestId('login-button');
  readonly errorMessage: Locator = this.page.getByTestId('error');
  readonly errorCloseButton: Locator = this.page.getByTestId('error-button');
  readonly logo: Locator = this.page.locator('.login_logo');

  async open(): Promise<void> {
    await this.goto('/');
    await expect(this.loginButton).toBeVisible();
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectError(message: string): Promise<void> {
    await expect(this.errorMessage).toHaveText(message);
  }
}
