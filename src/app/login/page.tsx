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
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otpSeconds, setOtpSeconds] = useState(60);
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

  // OTP timer
  useEffect(() => {
    if (step !== "otp" || otpSeconds <= 0) return;
    const timer = window.setTimeout(() => setOtpSeconds(v => v - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [step, otpSeconds]);

  // Handle phone + OTP login/signup with Supabase Auth
  async function sendOtp() {
    if (phone.length !== 8) {
      setError("請輸入 8 位香港手機號碼");
      return;
    }

    setLoading(true);
    setError("");

    const formattedPhone = `+852${phone}`;

    try {
      // 使用 phone OTP 登入/註冊
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (otpError) {
        setError(otpError.message);
        setLoading(false);
        return;
      }

      // 成功，顯示 OTP 輸入
      setStep("otp");
      setOtpSeconds(60);
    } catch (err: any) {
      setError(err.message || "發生錯誤");
    }

    setLoading(false);
  }

  async function verifyOtp() {
    if (otp.length !== 6) {
      setError("請輸入 6 位驗證碼");
      return;
    }

    setLoading(true);
    setError("");

    const formattedPhone = `+852${phone}`;

    try {
      // 驗證 OTP
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: "sms",
      });

      if (verifyError || !data.user) {
        setError(verifyError?.message || "驗證失敗");
        setLoading(false);
        return;
      }

      // 成功登入
      const { data: { session } } = await supabase.auth.getSession();
      
      saveAppState({
        loggedIn: true,
        phone: formattedPhone,
        email: null,
        userId: session?.user?.id,
        familyId: null,
        familyName: null,
        memberId: null,
        displayName: session?.user?.user_metadata?.display_name || phone,
        isOwner: false,
        role: null,
      });

      router.push("/onboarding");
    } catch (err: any) {
      setError(err.message || "發生錯誤");
    }

    setLoading(false);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-[#fafafa] px-4 py-10">
      <h1 className="text-[22px] font-bold">登入</h1>
      <p className="mt-2 text-base text-[#444]">
        用手機號碼 + 驗證碼
      </p>

      <section className="mt-8 card p-5 space-y-4">
        {/* Phone Input */}
        {step === "phone" && (
          <>
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

            {error && <p className="text-[13px] text-[#e74c3c]">{error}</p>}

            <button 
              onClick={sendOtp}
              disabled={loading}
              className="tap-feedback h-12 w-full rounded-[14px] bg-[#f5b041] text-base font-bold text-white disabled:opacity-60"
            >
              {loading ? "發送中..." : "取得驗證碼"}
            </button>
          </>
        )}

        {/* OTP Input */}
        {step === "otp" && (
          <>
            <div className="text-center mb-4">
              <p className="text-sm text-[#666]">驗證碼已發送到 +852{phone}</p>
            </div>

            <div>
              <label className="text-[13px] text-[#444]">驗證碼</label>
              <input
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setError("");
                }}
                inputMode="numeric"
                className="mt-2 h-12 w-full rounded-xl border border-[#ddd] px-4 text-center text-xl tracking-[0.35em]"
                placeholder="_ _ _ _ _ _"
              />
            </div>

            {error && <p className="text-[13px] text-[#e74c3c]">{error}</p>}

            <button 
              onClick={verifyOtp}
              disabled={loading}
              className="tap-feedback h-12 w-full rounded-[14px] bg-[#f5b041] text-base font-bold text-white disabled:opacity-60"
            >
              {loading ? "驗證中..." : "確認"}
            </button>

            <button
              onClick={() => { setOtpSeconds(60); setStep("phone"); }}
              disabled={otpSeconds > 0}
              className="tap-feedback text-center text-sm text-[#444] disabled:text-[#999]"
            >
              {otpSeconds > 0 ? `${otpSeconds} 秒後可重發` : "改變手機號碼"}
            </button>
          </>
        )}

        <p className="text-center text-sm text-[#666]">
          首次登入會自動創建帳戶
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
