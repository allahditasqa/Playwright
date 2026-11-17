import { Page } from '@playwright/test';

/** Common behaviour for every page object. Page objects hold locators and actions; tests hold the checks. */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }
}
