import { Page } from '@playwright/test';

/**
 * Authentication helper functions for E2E tests
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Login as user using the UI
 */
export async function loginAsUser(
  page: Page,
  credentials?: LoginCredentials
): Promise<void> {
  const email = credentials?.email || process.env.TEST_USER_EMAIL || 'test@example.com';
  const password = credentials?.password || process.env.TEST_USER_PASSWORD || 'password123';

  // Navigate to login page
  await page.goto('/login');

  // Fill login form
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password|senha/i).fill(password);

  // Submit form
  await page.getByRole('button', { name: /entrar|login|sign in/i }).click();

  // Wait for redirect to dashboard
  await page.waitForURL(/dashboard/, { timeout: 10000 });
}

/**
 * Logout user using the UI
 */
export async function logout(page: Page): Promise<void> {
  // Look for user menu or profile button
  const userMenuButton = page.locator('[data-testid="user-menu"], button[aria-label*="user"]').first();

  if (await userMenuButton.isVisible()) {
    await userMenuButton.click();
  }

  // Click logout button
  const logoutButton = page.getByRole('button', { name: /sair|logout|sign out/i }).or(
    page.getByRole('menuitem', { name: /sair|logout|sign out/i })
  );

  await logoutButton.click();

  // Wait for redirect to login
  await page.waitForURL(/login/, { timeout: 5000 });
}

/**
 * Sign up new user using the UI
 */
export async function signupAsUser(
  page: Page,
  credentials: LoginCredentials & { name: string }
): Promise<void> {
  // Navigate to signup page
  await page.goto('/signup');

  // Fill signup form
  await page.getByLabel(/nome|name/i).fill(credentials.name);
  await page.getByLabel(/email/i).fill(credentials.email);
  await page.getByLabel(/password|senha/i).fill(credentials.password);

  // Submit form
  await page.getByRole('button', { name: /criar|cadastr|sign up/i }).click();

  // Wait for redirect (check-email or dashboard)
  await page.waitForURL(/check-email|verify|dashboard/, { timeout: 15000 });
}

/**
 * Generate unique test credentials
 */
export function generateTestCredentials(): LoginCredentials & { name: string } {
  const timestamp = Date.now();
  return {
    name: `E2E Test User ${timestamp}`,
    email: `test+${timestamp}@example.com`,
    password: `TestPassword${timestamp}!`,
  };
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  // Navigate to dashboard
  await page.goto('/dashboard');

  // Wait a bit for redirect
  await page.waitForTimeout(2000);

  // Check if we're still on dashboard (authenticated) or redirected to login
  const url = page.url();
  return url.includes('/dashboard');
}
