"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadAppState, saveAppState } from "@/lib/store";
import AddToHomeScreen from "@/components/add-to-homescreen";

type LoginStep = "phone-input" | "password-set";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<LoginStep>("phone-input");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  // Handle phone + password login/signup
  async function handleSubmit() {
    if (phone.length !== 8) {
      setError("請輸入 8 位香港手機號碼");
      return;
    }
    if (!password || password.length < 6) {
      setError("密碼至少 6 位");
      return;
    }
    if (password !== confirmPassword) {
      setError("兩次密碼不一致");
      return;
    }
    if (!displayName.trim()) {
      setError("請輸入顯示名稱");
      return;
    }

    setLoading(true);
    setError("");

    // Mock user creation (in real app would call Supabase)
    const userId = `user_${phone}_${Date.now()}`;
    
    // Save to localStorage
    saveAppState({
      loggedIn: true,
      phone: "+852" + phone,
      email: null,
      userId,
      familyId: null,
      familyName: null,
      memberId: null,
      displayName: displayName.trim(),
      isOwner: false,
      role: null,
    });

    setLoading(false);
    router.push("/onboarding");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-[#fafafa] px-4 py-10">
      <h1 className="text-[22px] font-bold">登入 / 註冊</h1>
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

        {/* Display Name */}
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

        {/* Confirm Password */}
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

        {error && <p className="text-[13px] text-[#e74c3c]">{error}</p>}

        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="tap-feedback h-12 w-full rounded-[14px] bg-[#f5b041] text-base font-bold text-white disabled:opacity-60"
        >
          {loading ? "處理中..." : "開始使用"}
        </button>
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
