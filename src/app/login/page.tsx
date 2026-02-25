"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadAppState, saveAppState } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import AddToHomeScreen from "@/components/add-to-homescreen";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="mx-auto min-h-screen w-full max-w-md bg-[#fafafa] px-4 py-10">
        <p className="text-center text-[#666]">載入中...</p>
      </main>
    }>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next");
  
  // Helper function to redirect after login
  function getRedirectUrl() {
    if (nextUrl) return nextUrl;
    const state = loadAppState();
    if (state.familyId) return "/app/today";
    return "/onboarding";
  }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLogin, setIsLogin] = useState(false);

  // Check if already logged in (only on mount)
  useEffect(() => {
    const state = loadAppState();
    // Only redirect if localStorage shows logged in with family
    if (state.loggedIn && state.familyId) {
      router.push("/app/today");
    }
    // Don't auto-redirect to onboarding, let user stay on login
  }, []);

  // Handle email + password login/signup with Supabase Auth
  async function handleSubmit() {
    if (!email.trim()) {
      setError("請輸入 email");
      return;
    }
    if (!password || password.length < 6) {
      setError("密碼至少 6 位");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // Login existing user
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (signInError || !data.user) {
          // Surface clearer message for common case：未驗證 email
          const message = signInError?.message?.toLowerCase().includes("confirm")
            ? "請先到電郵完成驗證，再嘗試登入"
            : (signInError?.message || "登入失敗");
          setError(message);
          setLoading(false);
          return;
        }

        // Prefer the fresh session from signIn 回應，fallback 再取一次
        const session = data.session || (await supabase.auth.getSession()).data.session;

        if (!session?.user) {
          setError("登入狀態建立失敗，請再試一次");
          setLoading(false);
          return;
        }

        saveAppState({
          loggedIn: true,
          phone: null,
          email: session.user.email || email.trim(),
          userId: session.user.id,
          familyId: null,
          familyName: null,
          memberId: null,
          displayName: session.user.user_metadata?.display_name || email.split('@')[0],
          isOwner: false,
          role: null,
        });

        router.push(getRedirectUrl());
      } else {
        // Sign up new user (auto-register if not exists)
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              display_name: displayName.trim() || email.split('@')[0],
            },
          },
        });

        if (signUpError) {
          // 如果已經註冊，嘗試登入
          if (signUpError.message.includes("already been registered")) {
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
              email: email.trim().toLowerCase(),
              password,
            });
            
            if (loginError || !loginData.user) {
              setError("帳戶已存在，請登入");
              setLoading(false);
              return;
            }
            
            const { data: { session } } = await supabase.auth.getSession();
            saveAppState({
              loggedIn: true,
              phone: null,
              email: session?.user?.email,
              userId: session?.user?.id,
              familyId: null,
              familyName: null,
              memberId: null,
              displayName: session?.user?.user_metadata?.display_name || email.split('@')[0],
              isOwner: false,
              role: null,
            });
            router.push(getRedirectUrl());
            setLoading(false);
            return;
          }

          const message = signUpError.message.toLowerCase().includes("confirm")
            ? "請先到電郵完成驗證，再嘗試登入"
            : signUpError.message;
          setError(message);
          setLoading(false);
          return;
        }

        // 自動登入：有些 project 開啟 email confirm 時 signUp 不會返回 session
        // 先用 signUp 回傳的 session，若沒有則立即用密碼再登入一次以建立 session
        let session = data.session;
        if (!session) {
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          });

          if (loginError) {
            const message = loginError.message.toLowerCase().includes("confirm")
              ? "請到電郵完成驗證後再登入"
              : loginError.message;
            setError(message);
            setLoading(false);
            return;
          }

          session = loginData.session;
        }

        const authedUser = session?.user || data.user;
        if (!authedUser) {
          setError("註冊完成但登入狀態建立失敗，請再試一次");
          setLoading(false);
          return;
        }

        saveAppState({
          loggedIn: true,
          phone: null,
          email: authedUser.email || email.trim(),
          userId: authedUser.id,
          familyId: null,
          familyName: null,
          memberId: null,
          displayName: displayName.trim() || authedUser.user_metadata?.display_name || email.split('@')[0],
          isOwner: false,
          role: null,
        });

        router.push(getRedirectUrl());
      }
    } catch (err: any) {
      setError(err.message || "發生錯誤");
    }

    setLoading(false);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-[#fafafa] px-4 py-10">
      <h1 className="text-[22px] font-bold">{isLogin ? "登入" : "註冊"}</h1>
      <p className="mt-2 text-base text-[#444]">
        用 email + 密碼
      </p>

      <section className="mt-8 card p-5 space-y-4">
        {/* Email */}
        <div>
          <label className="text-[13px] text-[#444]">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            className="mt-2 h-12 w-full rounded-xl border border-[#ddd] bg-white px-4 text-base"
            placeholder="your@email.com"
            autoComplete="email"
          />
        </div>

        {/* Display Name (signup only) */}
        {!isLogin && (
          <div>
            <label className="text-[13px] text-[#444]">顯示名稱</label>
            <input
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setError("");
              }}
              className="mt-2 h-12 w-full rounded-xl border border-[#ddd] bg-white px-4 text-base"
              placeholder="你想其他人點稱呼你？"
            />
          </div>
        )}

        {/* Password */}
        <div>
          <label className="text-[13px] text-[#444]">密碼</label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            className="mt-2 h-12 w-full rounded-xl border border-[#ddd] bg-white px-4 text-base"
            placeholder="至少 6 位"
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
        </div>

        {error && <p className="text-[13px] text-[#e74c3c]">{error}</p>}

        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="tap-feedback h-12 w-full rounded-[14px] bg-[#f5b041] text-base font-bold text-white disabled:opacity-60"
        >
          {loading ? "處理中..." : (isLogin ? "登入" : "註冊")}
        </button>

        {/* Toggle login/signup */}
        <p className="text-center text-sm text-[#666]">
          {isLogin ? "未有帳戶？" : "已經有帳戶？"}
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            className="ml-1 text-[#f5b041] underline"
          >
            {isLogin ? "註冊" : "登入"}
          </button>
        </p>
      </section>

      <Link href="/" className="mt-8 block text-center text-sm text-[#444] underline">
        返回
      </Link>

      <div className="mt-8">
        <AddToHomeScreen variant="button" />
      </div>
    </main>
  );
}
