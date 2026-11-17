// Shared constants used by tests and the config.

// A browser with no cookies or storage: use it for tests that must start logged out.
export const LOGGED_OUT = { cookies: [], origins: [] };

// URL patterns for toHaveURL()
export const ROUTE = {
  login: /\/$/,
  inventory: /\/inventory\.html/,
  inventoryItem: /\/inventory-item\.html\?id=\d+/,
  cart: /\/cart\.html/,
  checkoutInfo: /\/checkout-step-one\.html/,
  checkoutOverview: /\/checkout-step-two\.html/,
  checkoutComplete: /\/checkout-complete\.html/,
};

// "$29.99" -> 29.99
export const toMoney = (text: string): number => Number(text.replace(/[^0-9.]/g, ''));

// "Sauce Labs Backpack" -> "sauce-labs-backpack" (the demo app builds its data-test ids this way)
export const slug = (name: string): string => name.toLowerCase().replace(/\s+/g, '-');
