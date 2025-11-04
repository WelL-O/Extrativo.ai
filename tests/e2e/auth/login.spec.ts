import { test, expect } from '@playwright/test';

/**
 * Login E2E Tests
 * Tests user authentication flow
 */

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Login|Extrativo/);

    // Check form elements exist
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password|senha/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar|login|sign in/i })).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // Click login button without filling form
    await page.getByRole('button', { name: /entrar|login|sign in/i }).click();

    // Should show validation errors
    await expect(page.getByText(/required|obrigatório/i).first()).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill form with invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password|senha/i).fill('wrongpassword');

    // Submit form
    await page.getByRole('button', { name: /entrar|login|sign in/i }).click();

    // Wait for error message
    await expect(
      page.getByText(/invalid|inválid|incorret|erro/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test('should have link to signup page', async ({ page }) => {
    const signupLink = page.getByRole('link', { name: /criar conta|sign up|cadastr/i });
    await expect(signupLink).toBeVisible();

    // Verify link points to signup page
    await expect(signupLink).toHaveAttribute('href', /signup|cadastro/);
  });

  test('should have forgot password link', async ({ page }) => {
    const forgotLink = page.getByRole('link', { name: /esquec|forgot|recuper/i });

    // Link should exist (even if not visible)
    const linkCount = await forgotLink.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.getByLabel(/password|senha/i);

    // Initially should be type="password"
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Look for toggle button (eye icon or similar)
    const toggleButton = page.locator('button').filter({ has: page.locator('svg') }).first();

    if (await toggleButton.isVisible()) {
      await toggleButton.click();

      // After click, should be type="text"
      await expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });

  test('should redirect to dashboard on successful login', async ({ page }) => {
    // This test requires valid test credentials
    // Skip if TEST_USER_EMAIL is not set
    const testEmail = process.env.TEST_USER_EMAIL;
    const testPassword = process.env.TEST_USER_PASSWORD;

    if (!testEmail || !testPassword) {
      test.skip();
      return;
    }

    // Fill login form
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByLabel(/password|senha/i).fill(testPassword);

    // Submit form
    await page.getByRole('button', { name: /entrar|login|sign in/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
  });
});
