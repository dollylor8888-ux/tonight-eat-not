"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// Mock: 模擬用戶登入狀態
type UserState = {
  loggedIn: boolean;
  phone: string;
  hasFamily: boolean;
  familyId: string | null;
};

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const nextParam = searchParams.get("next") || "";
  
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [seconds, setSeconds] = useState(60);
  const [error, setError] = useState("");
  
  // Mock: 模擬已登入但未有家庭既狀態
  const [user, setUser] = useState<UserState | null>(null);

  useEffect(() => {
    if (step !== "otp" || seconds <= 0) {
      return;
    }

    const timer = window.setTimeout(() => setSeconds((v) => v - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [step, seconds]);

  // 登入成功後既導航邏輯：檢查是否已有家庭
  useEffect(() => {
    if (user?.loggedIn) {
      if (user.hasFamily) {
        // ✅ 已有家庭 → 直接進 Today
        router.push("/app/today");
      } else {
        // ✅ 無家庭 → 去 Onboarding
        router.push("/onboarding");
      }
    }
  }, [user, router]);

  function sendOtp() {
    if (phone.length !== 8) {
      setError("請輸入 8 位香港手機號碼");
      return;
    }

    setError("");
    setStep("otp");
    setSeconds(60);
  }

  function verifyOtp() {
    if (otp.length !== 6) {
      setError("請輸入 6 位驗證碼");
      return;
    }

    setError("");
    
    // Mock: 模擬登入成功
    // 假設呢個電話未有家庭 (hasFamily: false)
    setUser({
      loggedIn: true,
      phone,
      hasFamily: false,
      familyId: null,
    });
  }

  const showNextHint = nextParam.startsWith("/j/");

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-[#fafafa] px-4 py-10">
      <h1 className="text-[22px] font-bold">登入</h1>
      <p className="mt-2 text-base text-[#444]">
        {showNextHint ? "登入後加入家庭" : "輸入手機號碼"}
      </p>

      {step === "phone" ? (
        <section className="mt-8 card p-5">
          <label className="text-[13px] text-[#444]">香港手機號碼</label>
          <div className="mt-2 flex h-12 items-center rounded-xl border border-[#ddd] bg-white px-4">
            <span className="mr-2 text-sm text-[#444]">+852</span>
            <input
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value.replace(/\D/g, "").slice(0, 8));
                setError("");
              }}
              inputMode="numeric"
              className="w-full border-0 bg-transparent text-base text-[#212121] outline-none"
              placeholder="91234567"
            />
          </div>
          {error && <p className="mt-2 text-[13px] text-[#e74c3c]">{error}</p>}
          <button onClick={sendOtp} className="tap-feedback mt-4 h-12 w-full rounded-[14px] bg-[#f5b041] text-base font-bold text-white">
            取得驗證碼
          </button>
          <p className="mt-3 text-[13px] text-[#444]">我哋唔會亂發訊息</p>
        </section>
      ) : (
        <section className="mt-8 card p-5">
          <h2 className="text-lg font-semibold">輸入 6 位驗證碼</h2>
          <input
            value={otp}
            onChange={(event) => {
              setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
              setError("");
            }}
            inputMode="numeric"
            className="mt-4 h-12 w-full rounded-xl border border-[#ddd] px-4 text-center text-xl text-[#212121] tracking-[0.35em] outline-none"
            placeholder="_ _ _ _ _ _"
          />
          {error && <p className="mt-2 text-[13px] text-[#e74c3c]">{error}</p>}
          <button onClick={verifyOtp} className="tap-feedback mt-4 h-12 w-full rounded-[14px] bg-[#f5b041] text-base font-bold text-white">
            確認
          </button>
          <button
            onClick={() => setSeconds(60)}
            disabled={seconds > 0}
            className="tap-feedback mt-3 text-[13px] text-[#444] disabled:text-[#999]"
          >
            {seconds > 0 ? `${seconds} 秒後可重發` : "重發驗證碼"}
          </button>
        </section>
      )}

      <Link href={nextParam || "/"} className="mt-8 block text-center text-sm text-[#444] underline">
        返回
      </Link>
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
