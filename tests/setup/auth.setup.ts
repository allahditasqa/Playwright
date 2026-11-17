// Setup project: log in once through the UI and save the session to .auth/user.json.
// Every other UI module reuses it, so only the login tests pay the cost of a real login.
import { expect, test as setup } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { PASSWORD, USERS } from '../../test-data/users';
import { ROUTE } from '../../utils/constants';

export const authFile = '.auth/user.json';

setup('log in as the standard user and save the session', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login(USERS.standard, PASSWORD);
  await expect(page).toHaveURL(ROUTE.inventory);
  await page.context().storageState({ path: authFile });
});
