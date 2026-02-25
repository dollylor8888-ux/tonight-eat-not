"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadAppState, saveAppState } from "@/lib/store";
import { sendPhoneOtp, verifyPhoneOtp, AuthUser } from "@/lib/auth";
import AddToHomeScreen from "@/components/add-to-homescreen";

type LoginStep = "phone" | "otp";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const nextParam = searchParams.get("next") || "";
  
  // Login state
  const [step, setStep] = useState<LoginStep>("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Phone login
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSeconds, setOtpSeconds] = useState(60);

  // User state
  const [user, setUser] = useState<AuthUser | null>(null);

  // 檢查是否已經登入
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    // Skip auth check for now - go directly to login
  }

  // OTP timer
  useEffect(() => {
    if (step !== "otp" || otpSeconds <= 0) return;
    const timer = window.setTimeout(() => setOtpSeconds(v => v - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [step, otpSeconds]);

  // ==================== Phone Login ====================
  function sendOtp() {
    if (phone.length !== 8) {
      setError("請輸入 8 位香港手機號碼");
      return;
    }
    setError("");
    setLoading(true);
    
    // 使用 Supabase 發送 OTP
    sendPhoneOtp(phone).then(result => {
      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        setStep("otp");
        setOtpSeconds(60);
        setLoading(false);
      }
    });
  }

  async function verifyOtp() {
    if (otp.length !== 6) {
      setError("請輸入 6 位驗證碼");
      return;
    }
    
    setLoading(true);
    setError("");
    
    // 使用 Supabase 驗證 OTP
    const result = await verifyPhoneOtp(phone, otp);
    
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    
    if (result.user) {
      setUser(result.user);
      saveAppState({
        loggedIn: true,
        phone: result.user.phone,
        email: result.user.email,
        familyId: null,
        familyName: null,
        memberId: null,
        displayName: result.user.displayName,
        isOwner: false,
        role: null,
        userId: result.user.id,
      });
      
      setLoading(false);
      router.push("/onboarding");
    } else {
      setError("驗證失敗");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-[#fafafa] px-4 py-10">
      <h1 className="text-[22px] font-bold">登入</h1>
      <p className="mt-2 text-base text-[#444]">
        使用手機號碼登入
      </p>

      {/* Phone Input */}
      {step === "phone" && (
        <section className="mt-8 card p-5">
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
          {error && <p className="mt-2 text-[13px] text-[#e74c3c]">{error}</p>}
          <button onClick={sendOtp} disabled={loading} className="tap-feedback mt-4 h-12 w-full rounded-[14px] bg-[#f5b041] text-base font-bold text-white disabled:opacity-60">
            {loading ? "發送中..." : "取得驗證碼"}
          </button>
          <p className="mt-3 text-[13px] text-[#444]">我哋唔會亂發訊息</p>
        </section>
      )}

      {/* OTP Input */}
      {step === "otp" && (
        <section className="mt-8 card p-5">
          <h2 className="text-lg font-semibold">輸入 6 位驗證碼</h2>
          <input
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
              setError("");
            }}
            inputMode="numeric"
            className="mt-4 h-12 w-full rounded-xl border border-[#ddd] px-4 text-center text-xl tracking-[0.35em] outline-none"
            placeholder="_ _ _ _ _ _"
          />
          {error && <p className="mt-2 text-[13px] text-[#e74c3c]">{error}</p>}
          <button onClick={verifyOtp} disabled={loading} className="tap-feedback mt-4 h-12 w-full rounded-[14px] bg-[#f5b041] text-base font-bold text-white disabled:opacity-60">
            {loading ? "驗證中..." : "確認"}
          </button>
          <button
            onClick={() => setOtpSeconds(60)}
            disabled={otpSeconds > 0}
            className="tap-feedback mt-3 text-[13px] text-[#444] disabled:text-[#999]"
          >
            {otpSeconds > 0 ? `${otpSeconds} 秒後可重發` : "重發驗證碼"}
          </button>
        </section>
      )}

      <Link href={nextParam || "/"} className="mt-8 block text-center text-sm text-[#444] underline">
        返回
      </Link>

      <div className="mt-8">
        <AddToHomeScreen variant="button" />
      </div>
    </main>
  );
}

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
