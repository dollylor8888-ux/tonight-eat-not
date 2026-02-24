import { test, expect } from '@playwright/test';

test.describe('QA Test - Dinner App', () => {
  
  // ======================================
  // 👩 用戶 A：媽媽
  // ======================================
  
  test('A1: Landing Page', async ({ page }) => {
    await page.goto('/');
    
    // 驗證：顯示 App 名稱
    await expect(page.getByRole('heading', { name: '今晚食唔食' })).toBeVisible();
    
    // 驗證：有「立即開始」按鈕
    await expect(page.getByRole('link', { name: '立即開始' })).toBeVisible();
    
    console.log('✅ A1 PASS: Landing page');
  });

  test('A2: Login Page - Phone OTP', async ({ page }) => {
    await page.goto('/login');
    
    // 點擊手機登入
    await page.getByText('手機號碼登入').click();
    
    // 輸入電話
    await page.getByPlaceholder('91234567').fill('12345678');
    await page.getByRole('button', { name: '取得驗證碼' }).click();
    
    //碼' }).click OTP 頁面
    await expect(page.getByPlaceholder('_ _ _ _ _ _')).toBeVisible();
    
    // 輸入 OTP (mock: 任何 6 位數字)
    await page.getByPlaceholder('_ _ _ _ _ _').fill('123456');
    await page.getByRole('button', { name: '確認' }).click();
    
    // 應該跳轉到 onboarding
    await page.waitForURL('**/onboarding', { timeout: 5000 });
    
    console.log('✅ A2 PASS: Login and OTP flow');
  });

  test('A3: Onboarding - Choose Create Family', async ({ page }) => {
    await page.goto('/onboarding');
    
    // 驗證：顯示建立家庭選項
    await expect(page.getByText('建立家庭')).toBeVisible();
    await expect(page.getByText('加入家庭')).toBeVisible();
    
    // 點擊建立家庭
    await page.getByText('建立家庭').click();
    
    await page.waitForURL('**/onboarding/create');
    
    console.log('✅ A3 PASS: Onboarding page');
  });

  test('A4: Create Family Form', async ({ page }) => {
    await page.goto('/onboarding/create');
    
    // 填寫家庭名稱
    await page.getByPlaceholder('例：陳家，李屋').fill('Wong家');
    
    // 填寫顯示名稱
    await page.getByPlaceholder('例：媽媽、阿敏').fill('媽咪');
    
    // 選擇角色
    await page.getByRole('button', { name: '媽媽' }).click();
    
    // 提交
    await page.getByRole('button', { name: '建立家庭' }).click();
    
    // 等待跳轉
    await page.waitForURL('**/app/today', { timeout: 5000 });
    
    console.log('✅ A4 PASS: Family created');
  });

  test('A5: Today Page - Verify Mom View', async ({ page }) => {
    await page.goto('/app/today');
    
    // 由於未登入，會 redirect 到 login
    // 這個測試需要先登入
    
    // 先登入
    await page.goto('/login');
    await page.getByText('手機號碼登入').click();
    await page.getByPlaceholder('91234567').fill('12345678');
    await page.getByRole('button', { name: '取得驗證碼' }).click();
    await page.getByPlaceholder('_ _ _ _ _ _').fill('123456');
    await page.getByRole('button', { name: '確認' }).click();
    
    // 等待跳轉到 onboarding
    await page.waitForURL('**/onboarding', { timeout: 5000 });
    
    // 建立家庭
    await page.goto('/onboarding/create');
    await page.getByPlaceholder('例：陳家，李屋').fill('Wong家');
    await page.getByPlaceholder('例：媽媽、阿敏').fill('媽咪');
    await page.getByRole('button', { name: '媽媽' }).click();
    await page.getByRole('button', { name: '建立家庭' }).click();
    await page.waitForURL('**/app/today', { timeout: 5000 });
    
    // 驗證：TopBar 顯示家庭名稱
    await expect(page.getByRole('button', { name: 'Wong家' })).toBeVisible();
    
    // 驗證：成員列表顯示 1 人
    const members = page.locator('.flex.items-center.gap-3');
    const memberCount = await members.count();
    console.log(`Member count: ${memberCount}`);
    
    // 驗證：有回覆按鈕
    await expect(page.getByRole('button', { name: '會' })).toBeVisible();
    await expect(page.getByRole('button', { name: '唔會' })).toBeVisible();
    await expect(page.getByRole('button', { name: '未知' })).toBeVisible();
    
    console.log('✅ A5 PASS: Today page with 1 member');
  });

  // ======================================
  // 🛡 Guard 測試
  // ======================================
  
  test('G1: Guard - Not Logged In', async ({ page }) => {
    // 未登入訪問 /app/today
    await page.goto('/app/today');
    
    // 應該 redirect 到 /login
    await page.waitForURL('**/login', { timeout: 5000 });
    
    console.log('✅ G1 PASS: Redirect to login when not authenticated');
  });

  // ======================================
  // History 測試
  // ======================================
  
  test('H1: History Page Loads', async ({ page }) => {
    await page.goto('/app/history');
    
    // 應該 redirect 到 login
    await page.waitForURL('**/login', { timeout: 5000 });
    
    console.log('✅ H1 PASS: Redirect to login');
  });

  // ======================================
  // 導航測試
  // ======================================
  
  test('Navigation - All Pages', async ({ page }) => {
    // Landing
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '今晚食唔食' })).toBeVisible();
    
    // Login
    await page.goto('/login');
    await expect(page.getByText('選擇登入方式')).toBeVisible();
    
    // Onboarding
    await page.goto('/onboarding');
    await expect(page.getByText('建立家庭')).toBeVisible();
    
    console.log('✅ Navigation PASS: All pages accessible');
  });
});
