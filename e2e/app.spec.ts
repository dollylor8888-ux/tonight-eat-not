import { test, expect } from '@playwright/test';

test.describe('Dinner App', () => {
  test('should load landing page', async ({ page }) => {
    await page.goto('/');
    
    // Should show landing page heading
    await expect(page.getByRole('heading', { name: '今晚食唔食' })).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    
    // Click "立即開始" button to go to login
    await page.getByRole('link', { name: '立即開始' }).click();
    
    // Should show login page
    await expect(page.getByText('選擇登入方式')).toBeVisible();
  });

  test('should show email login option', async ({ page }) => {
    await page.goto('/login');
    
    // Should show email login option
    await expect(page.getByText('Email 登入')).toBeVisible();
  });

  test('should navigate to onboarding', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Should show onboarding options
    await expect(page.getByText('建立家庭')).toBeVisible();
    await expect(page.getByText('加入家庭')).toBeVisible();
  });
});
