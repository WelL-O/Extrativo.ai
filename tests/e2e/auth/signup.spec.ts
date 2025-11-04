import { test, expect } from '@playwright/test';

/**
 * Signup E2E Tests
 * Tests user registration flow
 */

test.describe('Signup Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('should display signup form', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Sign|Cadastro|Criar|Extrativo/);

    // Check form elements exist
    await expect(page.getByLabel(/nome|name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password|senha/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /criar|cadastr|sign up/i })).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // Click signup button without filling form
    await page.getByRole('button', { name: /criar|cadastr|sign up/i }).click();

    // Should show validation errors
    const errorCount = await page.getByText(/required|obrigatório/i).count();
    expect(errorCount).toBeGreaterThan(0);
  });

  test('should show error for invalid email format', async ({ page }) => {
    // Fill form with invalid email
    await page.getByLabel(/nome|name/i).fill('Test User');
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/password|senha/i).fill('password123');

    // Submit form
    await page.getByRole('button', { name: /criar|cadastr|sign up/i }).click();

    // Should show email validation error
    await expect(page.getByText(/email.*válid|valid.*email/i)).toBeVisible();
  });

  test('should show error for weak password', async ({ page }) => {
    // Fill form with weak password
    await page.getByLabel(/nome|name/i).fill('Test User');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password|senha/i).fill('123');

    // Submit form
    await page.getByRole('button', { name: /criar|cadastr|sign up/i }).click();

    // Should show password validation error
    await expect(
      page.getByText(/password.*6|senha.*6|caracteres/i)
    ).toBeVisible();
  });

  test('should have link to login page', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /já.*conta|login|entrar|sign in/i });
    await expect(loginLink).toBeVisible();

    // Verify link points to login page
    await expect(loginLink).toHaveAttribute('href', /login/);
  });

  test('should show terms and privacy policy links', async ({ page }) => {
    // Look for terms or privacy links
    const termsCount = await page.getByText(/termos|terms|política|privacy/i).count();

    // Should have at least one reference to terms/privacy
    expect(termsCount).toBeGreaterThan(0);
  });

  test('should create account and redirect to check-email', async ({ page }) => {
    // Generate unique email for this test
    const timestamp = Date.now();
    const testEmail = `test+${timestamp}@example.com`;

    // Fill signup form
    await page.getByLabel(/nome|name/i).fill('E2E Test User');
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByLabel(/password|senha/i).fill('TestPassword123!');

    // Submit form
    await page.getByRole('button', { name: /criar|cadastr|sign up/i }).click();

    // Should redirect to check-email or success page
    await expect(page).toHaveURL(/check-email|verify|success/, { timeout: 15000 });

    // Should show success message
    await expect(
      page.getByText(/email.*envi|sent.*email|verif/i)
    ).toBeVisible();
  });

  test('should show error when email already exists', async ({ page }) => {
    // This test requires a known existing email
    // Skip if TEST_EXISTING_EMAIL is not set
    const existingEmail = process.env.TEST_EXISTING_EMAIL;

    if (!existingEmail) {
      test.skip();
      return;
    }

    // Fill form with existing email
    await page.getByLabel(/nome|name/i).fill('Test User');
    await page.getByLabel(/email/i).fill(existingEmail);
    await page.getByLabel(/password|senha/i).fill('TestPassword123!');

    // Submit form
    await page.getByRole('button', { name: /criar|cadastr|sign up/i }).click();

    // Should show error about existing email
    await expect(
      page.getByText(/já.*cadastr|already.*regist|existe/i)
    ).toBeVisible({ timeout: 10000 });
  });
});
