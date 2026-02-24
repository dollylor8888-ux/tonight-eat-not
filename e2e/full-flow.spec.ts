import { test, expect } from '@playwright/test';

test.describe('Full User Flow - Dinner App', () => {
  
  test('complete user journey: landing -> login -> signup form', async ({ page }) => {
    // Step 1: Landing page
    console.log('Step 1: Landing page...');
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '今晚食唔食' })).toBeVisible();
    console.log('✅ Landing page loads');

    // Step 2: Navigate to login
    console.log('Step 2: Navigate to login...');
    await page.getByRole('link', { name: '立即開始' }).click();
    await expect(page.getByText('選擇登入方式')).toBeVisible();
    console.log('✅ Login page loads');

    // Step 3: Email login form
    console.log('Step 3: Email login form...');
    await page.getByText('Email 登入').click();
    await expect(page.getByPlaceholder('your@email.com')).toBeVisible();
    console.log('✅ Email login form shows');

    // Step 4: Switch to signup
    console.log('Step 4: Signup...');
    await page.getByText('註冊').click();
    await expect(page.getByPlaceholder('你想其他人點稱呼你？')).toBeVisible();
    console.log('✅ Signup form shows');

    // Step 5: Fill signup form - validation test
    console.log('Step 5: Fill signup details...');
    await page.getByPlaceholder('你想其他人點稱呼你？').fill('Test User');
    await page.getByPlaceholder('your@email.com').fill('test@example.com');
    await page.getByPlaceholder('至少 6 位').fill('123'); // Too short
    await page.getByPlaceholder('再次輸入密碼').fill('123');
    await page.getByRole('button', { name: '創建帳戶' }).click();
    
    // Should show password error
    await expect(page.getByText('密碼至少 6 位')).toBeVisible();
    console.log('✅ Password validation works');

    // Step 6: Fix password and try again
    console.log('Step 6: Fix password...');
    await page.getByPlaceholder('至少 6 位').fill('password123');
    await page.getByPlaceholder('再次輸入密碼').fill('different'); // Mismatch
    await page.getByRole('button', { name: '創建帳戶' }).click();
    
    // Should show mismatch error
    await expect(page.getByText('兩次密碼不一致')).toBeVisible();
    console.log('✅ Password mismatch validation works');

    // Step 7: Navigate to onboarding
    console.log('Step 7: Navigate to onboarding...');
    await page.goto('/onboarding');
    await expect(page.getByText('建立家庭')).toBeVisible();
    await expect(page.getByText('加入家庭')).toBeVisible();
    console.log('✅ Onboarding page loads');

    // Step 8: Create family page
    console.log('Step 8: Create family page...');
    await page.goto('/onboarding/create');
    await expect(page.getByPlaceholder('例：陳家，李屋')).toBeVisible();
    console.log('✅ Create family page loads');

    // Step 9: Fill family form
    console.log('Step 9: Fill family form...');
    await page.getByPlaceholder('例：陳家，李屋').fill('陳家');
    await page.getByPlaceholder('例：媽媽、阿敏').fill('爸爸');
    await page.getByRole('button', { name: '爸爸' }).click();
    console.log('✅ Family form filled');

    // Step 10: Submit form (localStorage fallback - works in test)
    console.log('Step 10: Submit...');
    await page.getByRole('button', { name: '建立家庭' }).click();
    
    // Wait for navigation or error
    await page.waitForTimeout(1000);
    console.log('✅ Form submission attempted');

    // Summary
    console.log('\n=== USER FLOW TEST PASSED ===');
  });

  test('check all pages load correctly', async ({ page }) => {
    const pages = [
      { url: '/', name: 'Landing', heading: '今晚食唔食' },
      { url: '/login', name: 'Login', text: '選擇登入方式' },
      { url: '/onboarding', name: 'Onboarding', text: '建立家庭' },
      { url: '/onboarding/create', name: 'Create Family', placeholder: '例：陳家，李屋' },
      { url: '/onboarding/join', name: 'Join Family', placeholder: 'ABCD' },
    ];

    for (const p of pages) {
      await page.goto(p.url);
      if (p.heading) {
        await expect(page.getByRole('heading', { name: p.heading })).toBeVisible();
      }
      if (p.text) {
        await expect(page.getByText(p.text)).toBeVisible();
      }
      if (p.placeholder) {
        await expect(page.getByPlaceholder(p.placeholder)).toBeVisible();
      }
      console.log(`✅ ${p.name} page loads`);
    }
  });

  test('UI elements and navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check all main UI elements
    await expect(page.getByText('1 秒回覆')).toBeVisible();
    await expect(page.getByText('點運作')).toBeVisible();
    await expect(page.getByText('建家庭')).toBeVisible();
    await expect(page.getByText('常見問題')).toBeVisible();
    await expect(page.getByText('私隱政策')).toBeVisible();
    await expect(page.getByRole('link', { name: '登入' })).toBeVisible();
    
    console.log('✅ All UI elements present');
  });
});
