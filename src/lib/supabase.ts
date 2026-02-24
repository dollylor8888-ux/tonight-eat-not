import { createClient } from '@supabase/supabase-js';

// 從環境變數獲取 Supabase 配置
// 支援本地開發的 fallback 值，但會顯示警告
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mdymyphxlqvbagdzdwrs.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1keW15cGh4bHF2YmFnZHpkd3JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NDUzODUsImV4cCI6MjA4NzQyMTM4NX0.vOdAnTB5OVK0d-Ig89Z_0nNdG-jXqNGa8XOyca84XKc';

// 警告：如果使用 fallback 值，生產環境應該設置環境變數
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn('⚠️ WARNING: Using fallback Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL in production.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
