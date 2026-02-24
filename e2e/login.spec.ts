import { test, expect } from '@playwright/test';

test.describe('Login & Signup Flow', () => {
  
  test('should show login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('選擇登入方式')).toBeVisible();
  });

  test('should show email login form', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Email 登入' }).click();
    await expect(page.getByPlaceholder('your@email.com')).toBeVisible();
  });

  test('should show email signup option', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Email 登入' }).click();
    // Click on "註冊" text - it might be a link or button
    await page.getByText('註冊').click();
    // Should show signup form fields
    await expect(page.getByPlaceholder('你想其他人點稱呼你？')).toBeVisible({ timeout: 5000 });
  });

  test('should validate password mismatch', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Email 登入' }).click();
    await page.getByText('註冊').click();
    
    await page.getByPlaceholder('你想其他人點稱呼你？').fill('Test User');
    await page.getByPlaceholder('your@email.com').fill('test@example.com');
    await page.getByPlaceholder('至少 6 位').fill('password123');
    await page.getByPlaceholder('再次輸入密碼').fill('differentpassword');
    
    await page.getByRole('button', { name: '創建帳戶' }).click();
    
    await expect(page.getByText('兩次密碼不一致')).toBeVisible({ timeout: 5000 });
  });

  test('should validate short password', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Email 登入' }).click();
    await page.getByText('註冊').click();
    
    await page.getByPlaceholder('你想其他人點稱呼你？').fill('Test User');
    await page.getByPlaceholder('your@email.com').fill('test@example.com');
    await page.getByPlaceholder('至少 6 位').fill('123');
    await page.getByPlaceholder('再次輸入密碼').fill('123');
    
    await page.getByRole('button', { name: '創建帳戶' }).click();
    
    await expect(page.getByText('密碼至少 6 位')).toBeVisible({ timeout: 5000 });
  });

  test('should show phone login form', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: '手機號碼登入' }).click();
    await expect(page.getByPlaceholder('91234567')).toBeVisible();
  });

  test('should validate phone number', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: '手機號碼登入' }).click();
    
    await page.getByRole('button', { name: '取得驗證碼' }).click();
    
    await expect(page.getByText('請輸入 8 位香港手機號碼')).toBeVisible();
  });

  test('should navigate back from email login', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Email 登入' }).click();
    // Click back button
    await page.getByText('← 返回').click();
    await expect(page.getByText('選擇登入方式')).toBeVisible({ timeout: 5000 });
  });
});
