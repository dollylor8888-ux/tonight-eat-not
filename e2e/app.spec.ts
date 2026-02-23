import { test, expect } from '@playwright/test';

test.describe('Dinner App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // Landing page tests
  test('should load landing page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '今晚食唔食' })).toBeVisible();
  });

  test('should show hero section', async ({ page }) => {
    await expect(page.getByText('1 秒回覆')).toBeVisible();
  });

  test('should show how it works section', async ({ page }) => {
    await expect(page.getByText('點運作')).toBeVisible();
    await expect(page.getByText('建家庭')).toBeVisible();
  });

  // Navigation tests
  test('should navigate to login page via 立即開始 button', async ({ page }) => {
    await page.getByRole('link', { name: '立即開始' }).click();
    await expect(page.getByText('選擇登入方式')).toBeVisible();
  });

  test('should navigate to login page via 登入 button', async ({ page }) => {
    await page.getByRole('link', { name: '登入' }).click();
    await expect(page.getByText('選擇登入方式')).toBeVisible();
  });

  // Login page tests
  test('should show email login option', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Email 登入')).toBeVisible();
    await expect(page.getByText('手機號碼登入')).toBeVisible();
  });

  test('should show email login form', async ({ page }) => {
    await page.goto('/login');
    await page.getByText('Email 登入').click();
    await expect(page.getByPlaceholder('your@email.com')).toBeVisible();
  });

  test('should show signup option', async ({ page }) => {
    await page.goto('/login');
    await page.getByText('Email 登入').click();
    await expect(page.getByText('未有帳戶？')).toBeVisible();
  });

  // Onboarding tests
  test('should navigate to onboarding', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.getByText('建立家庭')).toBeVisible();
    await expect(page.getByText('加入家庭')).toBeVisible();
  });

  test('should navigate to create family page', async ({ page }) => {
    await page.goto('/onboarding/create');
    await expect(page.getByPlaceholder('例：陳家，李屋')).toBeVisible();
  });

  test('should show role selection', async ({ page }) => {
    await page.goto('/onboarding/create');
    await expect(page.getByRole('button', { name: '媽媽' })).toBeVisible();
    await expect(page.getByRole('button', { name: '爸爸' })).toBeVisible();
    await expect(page.getByRole('button', { name: '子女' })).toBeVisible();
  });

  // Invite page tests
  test('should handle invalid invite code', async ({ page }) => {
    await page.goto('/j/INVALID');
    // Wait for either invalid message or login redirect
    await Promise.race([
      expect(page.getByText('邀請已失效', { exact: false })).toBeVisible({ timeout: 10000 }),
      expect(page.getByText('選擇登入方式')).toBeVisible({ timeout: 10000 }),
      expect(page.getByText('登入')).toBeVisible({ timeout: 10000 }),
    ]);
  });

  // Accessibility tests
  test('should have proper heading structure', async ({ page }) => {
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();
  });

  test('should have login link on landing', async ({ page }) => {
    await expect(page.getByRole('link', { name: '登入' })).toBeVisible();
  });
});
