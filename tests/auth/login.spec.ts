// Login module. Test cases are documented in docs/test-cases/auth-login.md (same IDs).
// Locators live in pages/LoginPage.ts; this file only says what to do and what to expect.
import { expect, test } from '../../fixtures/test-fixtures';
import { MESSAGES, PASSWORD, USERS } from '../../test-data/users';
import { ROUTE } from '../../utils/constants';

test.beforeEach(async ({ loginPage }) => {
  await loginPage.open();
});

test.describe('Login - page', () => {
  test('TC_LOGIN_01 - Check the logo, username, password and Login button are visible on the login page', async ({
    loginPage,
  }) => {
    await expect(loginPage.logo).toBeVisible();
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeEnabled();
  });

  test('TC_LOGIN_02 - Check the password field hides the typed text', async ({ loginPage }) => {
    await loginPage.passwordInput.fill('secret');
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });
});

test.describe('Login - positive', () => {
  test('TC_LOGIN_03 - Login with username "standard_user" and the correct password by clicking Login', async ({
    page,
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.login(USERS.standard, PASSWORD);
    await expect(page).toHaveURL(ROUTE.inventory);
    await inventoryPage.expectLoaded();
  });

  test('TC_LOGIN_04 - Login with username "standard_user" and the correct password by pressing Enter', async ({
    page,
    loginPage,
  }) => {
    await loginPage.usernameInput.fill(USERS.standard);
    await loginPage.passwordInput.fill(PASSWORD);
    await loginPage.passwordInput.press('Enter');
    await expect(page).toHaveURL(ROUTE.inventory);
  });

  test('TC_LOGIN_05 - Login with username "standard_user", then reload the page and stay logged in', async ({
    page,
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.login(USERS.standard, PASSWORD);
    await expect(page).toHaveURL(ROUTE.inventory);
    await page.reload();
    await inventoryPage.expectLoaded();
  });

  test('TC_LOGIN_06 - Login with username "standard_user", then log out from the menu and check the login page opens', async ({
    page,
    loginPage,
    headerMenu,
  }) => {
    await loginPage.login(USERS.standard, PASSWORD);
    await expect(page).toHaveURL(ROUTE.inventory);
    await headerMenu.logout();
    await expect(page).toHaveURL(ROUTE.login);
    await expect(loginPage.loginButton).toBeVisible();
  });
});

test.describe('Login - negative', () => {
  test('TC_LOGIN_07 - Login with the locked-out user "locked_out_user" and check the locked out message', async ({
    page,
    loginPage,
  }) => {
    await loginPage.login(USERS.lockedOut, PASSWORD);
    await loginPage.expectError(MESSAGES.lockedOut);
    await expect(page).toHaveURL(ROUTE.login);
  });

  test('TC_LOGIN_08 - Login with username "standard_user" and the wrong password "wrong_password"', async ({
    page,
    loginPage,
  }) => {
    await loginPage.login(USERS.standard, 'wrong_password');
    await loginPage.expectError(MESSAGES.badCredentials);
    await expect(page).toHaveURL(ROUTE.login);
  });

  test('TC_LOGIN_09 - Login with the unknown username "unknown_user" and a password', async ({ loginPage }) => {
    await loginPage.login('unknown_user', PASSWORD);
    await loginPage.expectError(MESSAGES.badCredentials);
  });

  test('TC_LOGIN_10 - Click Login with empty username and empty password', async ({ loginPage }) => {
    await loginPage.loginButton.click();
    await loginPage.expectError(MESSAGES.usernameRequired);
  });

  test('TC_LOGIN_11 - Click Login with username "standard_user" and empty password', async ({ loginPage }) => {
    await loginPage.usernameInput.fill(USERS.standard);
    await loginPage.loginButton.click();
    await loginPage.expectError(MESSAGES.passwordRequired);
  });

  test('TC_LOGIN_12 - Login with the username in capital letters "STANDARD_USER" (username is case sensitive)', async ({
    loginPage,
  }) => {
    await loginPage.login(USERS.standard.toUpperCase(), PASSWORD);
    await loginPage.expectError(MESSAGES.badCredentials);
  });

  test("TC_LOGIN_13 - Login with SQL injection text \"' OR '1'='1\" as the username", async ({ page, loginPage }) => {
    await loginPage.login("' OR '1'='1", PASSWORD);
    await loginPage.expectError(MESSAGES.badCredentials);
    await expect(page).toHaveURL(ROUTE.login);
  });

  test('TC_LOGIN_14 - Close the error message with the X button and check the message disappears', async ({
    loginPage,
  }) => {
    await loginPage.loginButton.click();
    await expect(loginPage.errorMessage).toBeVisible();
    await loginPage.errorCloseButton.click();
    await expect(loginPage.errorMessage).toBeHidden();
  });
});

test.describe('Login - access control', () => {
  test('TC_LOGIN_15 - Open /inventory.html without login and check the "must be logged in" message', async ({
    page,
    loginPage,
  }) => {
    await page.goto('/inventory.html');
    await expect(page).toHaveURL(ROUTE.login);
    await loginPage.expectError(MESSAGES.notLoggedIn);
  });
});
