"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadAppState, saveAppState } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import AddToHomeScreen from "@/components/add-to-homescreen";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLogin, setIsLogin] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const state = loadAppState();
    if (state.loggedIn && state.familyId) {
      router.push("/app/today");
    } else if (state.loggedIn) {
      router.push("/onboarding");
    }
  }, [router]);

  // Handle phone + password login/signup with Supabase Auth
  async function handleSubmit() {
    if (phone.length !== 8) {
      setError("請輸入 8 位香港手機號碼");
      return;
    }
    if (!password || password.length < 6) {
      setError("密碼至少 6 位");
      return;
    }

    setLoading(true);
    setError("");

    const formattedPhone = `+852${phone}`;

    try {
      if (isLogin) {
        // Login existing user
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: formattedPhone,
          password,
        });

        if (signInError || !data.user) {
          setError(signInError?.message || "登入失敗");
          setLoading(false);
          return;
        }

        // Get session to verify
        const { data: { session } } = await supabase.auth.getSession();
        
        saveAppState({
          loggedIn: true,
          phone: formattedPhone,
          email: null,
          userId: session?.user?.id,
          familyId: null,
          familyName: null,
          memberId: null,
          displayName: session?.user?.user_metadata?.display_name || displayName,
          isOwner: false,
          role: null,
        });

        router.push("/onboarding");
      } else {
        // Sign up new user
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formattedPhone,
          password,
          options: {
            data: {
              display_name: displayName,
              phone: formattedPhone,
            },
          },
        });

        if (signUpError || !data.user) {
          setError(signUpError?.message || "註冊失敗");
          setLoading(false);
          return;
        }

        // Auto login after signup
        const { data: { session } } = await supabase.auth.getSession();
        
        saveAppState({
          loggedIn: true,
          phone: formattedPhone,
          email: null,
          userId: session?.user?.id,
          familyId: null,
          familyName: null,
          memberId: null,
          displayName: displayName.trim(),
          isOwner: false,
          role: null,
        });

        router.push("/onboarding");
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
        用手機號碼 + 密碼
      </p>

      <section className="mt-8 card p-5 space-y-4">
        {/* Phone */}
        <div>
          <label className="text-[13px] text-[#444]">香港手機號碼</label>
          <div className="mt-2 flex h-12 items-center rounded-xl border border-[#ddd] bg-white px-4">
            <span className="mr-2 text-sm text-[#444]">+852</span>
            <input
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 8));
                setError("");
              }}
              inputMode="numeric"
              className="w-full border-0 bg-transparent text-base outline-none"
              placeholder="91234567"
            />
          </div>
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
          />
        </div>

        {/* Confirm Password (signup only) */}
        {!isLogin && (
          <div>
            <label className="text-[13px] text-[#444]">確認密碼</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
              className="mt-2 h-12 w-full rounded-xl border border-[#ddd] bg-white px-4 text-base"
              placeholder="再次輸入密碼"
            />
          </div>
        )}

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
