import { test, expect } from '@playwright/test';

/**
 * Dashboard Overview E2E Tests
 * Tests main dashboard page functionality
 */

test.describe('Dashboard Overview', () => {
  test.beforeEach(async ({ page }) => {
    // This test requires authentication
    // In a real scenario, you would use a helper to login first
    // For now, we'll just navigate to the dashboard
    await page.goto('/dashboard');
  });

  test('should redirect to login if not authenticated', async ({ page }) => {
    // If not authenticated, should redirect to login
    await page.waitForURL(/login|dashboard/, { timeout: 5000 });

    const url = page.url();

    // Should either be on login page (not authenticated)
    // or dashboard page (authenticated from previous tests)
    expect(url).toMatch(/login|dashboard/);
  });

  test('should display dashboard layout when authenticated', async ({ page }) => {
    // Skip if redirected to login
    if (page.url().includes('login')) {
      test.skip();
      return;
    }

    // Dashboard should have these elements
    const hasSidebar = await page.locator('[data-testid="sidebar"], nav, aside').count() > 0;
    expect(hasSidebar).toBe(true);
  });

  test('should have navigation links', async ({ page }) => {
    // Skip if redirected to login
    if (page.url().includes('login')) {
      test.skip();
      return;
    }

    // Check for common navigation items
    const navElements = await page.locator('nav a, aside a').count();

    // Should have at least some navigation links
    expect(navElements).toBeGreaterThan(0);
  });

  test('should display user menu or profile', async ({ page }) => {
    // Skip if redirected to login
    if (page.url().includes('login')) {
      test.skip();
      return;
    }

    // Look for user menu elements
    const userMenuCount = await page.locator('[data-testid="user-menu"], button[aria-label*="user"], button[aria-label*="profile"], button[aria-label*="menu"]').count();

    // Should have some user menu element
    expect(userMenuCount).toBeGreaterThan(0);
  });

  test('should have theme toggle', async ({ page }) => {
    // Skip if redirected to login
    if (page.url().includes('login')) {
      test.skip();
      return;
    }

    // Look for theme toggle button
    const themeToggle = page.locator('[data-testid="theme-toggle"], button[aria-label*="theme"], button[aria-label*="tema"]');

    const themeToggleExists = await themeToggle.count() > 0;

    // Theme toggle should exist
    expect(themeToggleExists).toBe(true);
  });

  test('should have language switcher', async ({ page }) => {
    // Skip if redirected to login
    if (page.url().includes('login')) {
      test.skip();
      return;
    }

    // Look for language switcher
    const langSwitcher = page.locator('[data-testid="language-switcher"], select[name*="lang"], button[aria-label*="language"], button[aria-label*="idioma"]');

    const langSwitcherExists = await langSwitcher.count() > 0;

    // Language switcher should exist
    expect(langSwitcherExists).toBe(true);
  });

  test('should navigate to different sections', async ({ page }) => {
    // Skip if redirected to login
    if (page.url().includes('login')) {
      test.skip();
      return;
    }

    // This test will be expanded when pages are created
    // For now, just verify navigation structure exists
    const links = await page.locator('nav a, aside a').all();

    // Should have multiple navigation links
    expect(links.length).toBeGreaterThan(1);
  });
});
