"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadAppState, saveAppState } from "@/lib/store";
import { 
  signInWithEmail, 
  signUpWithEmail, 
  getCurrentUser,
  createFamily,
  joinFamilyByCode,
  getUserFamily,
  sendPhoneOtp,
  verifyPhoneOtp,
  AuthUser,
  Family,
  FamilyMember
} from "@/lib/auth";
import AddToHomeScreen from "@/components/add-to-homescreen";

type LoginStep = "choice" | "phone" | "otp" | "email-login" | "email-signup";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const nextParam = searchParams.get("next") || "";
  
  // Login state
  const [step, setStep] = useState<LoginStep>("choice");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Phone login
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSeconds, setOtpSeconds] = useState(60);
  
  // Email login/signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  // User state
  const [user, setUser] = useState<AuthUser | null>(null);

  // 檢查是否已經登入
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const currentUser = await getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      await checkUserFamily(currentUser);
    }
  }

  async function checkUserFamily(authUser: AuthUser) {
    const { family, member } = await getUserFamily(authUser.id);
    
    if (family && member) {
      // 已有所屬家庭 → 進入 app
      saveAppState({
        loggedIn: true,
        phone: authUser.phone,
        email: authUser.email,
        familyId: family.id,
        familyName: family.name,
        memberId: member.id,
        displayName: member.displayName,
        isOwner: member.isOwner,
        role: member.role,
        userId: authUser.id,
      });
      router.push("/app/today");
    } else {
      // 未有家庭 → 去 onboarding
      saveAppState({
        loggedIn: true,
        phone: authUser.phone,
        email: authUser.email,
        familyId: null,
        familyName: null,
        memberId: null,
        displayName: authUser.displayName || null,
        isOwner: false,
        role: null,
        userId: authUser.id,
      });
      router.push("/onboarding");
    }
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

  // ==================== Email Login ====================
  async function handleEmailSubmit() {
    if (!email || !password) {
      setError("請輸入 email 和密碼");
      return;
    }

    if (isSignup) {
      // 註冊
      if (password !== confirmPassword) {
        setError("兩次密碼不一致");
        return;
      }
      if (password.length < 6) {
        setError("密碼至少 6 位");
        return;
      }
      
      setLoading(true);
      setError("");
      
      const { user: newUser, error: signupError } = await signUpWithEmail(email, password, displayName);
      
      if (signupError) {
        setError(signupError);
        setLoading(false);
        return;
      }
      
      if (newUser) {
        setUser(newUser);
        saveAppState({
          loggedIn: true,
          email: newUser.email,
          familyId: null,
          familyName: null,
          memberId: null,
          displayName: newUser.displayName,
          isOwner: false,
          role: null,
          userId: newUser.id,
        });
        setLoading(false);
        router.push("/onboarding");
      }
    } else {
      // 登入
      setLoading(true);
      setError("");
      
      const { user: loginUser, error: loginError } = await signInWithEmail(email, password);
      
      if (loginError) {
        setError(loginError);
        setLoading(false);
        return;
      }
      
      if (loginUser) {
        await checkUserFamily(loginUser);
        setLoading(false);
      }
    }
  }

  // 處理從邀請連結進入的情況
  useEffect(() => {
    if (nextParam.startsWith("/j/") && user) {
      // 用戶已登入但未有所屬家庭，應該去加入家庭
      router.push(nextParam);
    }
  }, [nextParam, user, router]);

  const showNextHint = nextParam.startsWith("/j/");

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-[#fafafa] px-4 py-10">
      <h1 className="text-[22px] font-bold">登入</h1>
      <p className="mt-2 text-base text-[#444]">
        {showNextHint ? "登入後加入家庭" : "選擇登入方式"}
      </p>

      {/* Step: Choice */}
      {step === "choice" && (
        <section className="mt-8 space-y-4">
          {/* Email 登入 */}
          <button
            onClick={() => setStep("email-login")}
            className="tap-feedback card flex w-full items-center gap-4 p-4 text-left"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f8f5] text-xl">✉️</div>
            <div>
              <p className="font-semibold">Email 登入</p>
              <p className="text-sm text-[#666]">使用 email 和密碼</p>
            </div>
          </button>

          {/* Phone 登入 */}
          <button
            onClick={() => setStep("phone")}
            className="tap-feedback card flex w-full items-center gap-4 p-4 text-left"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff3df] text-xl">📱</div>
            <div>
              <p className="font-semibold">手機號碼登入</p>
              <p className="text-sm text-[#666]">使用香港手機號碼</p>
            </div>
          </button>

          <p className="mt-6 text-center text-sm text-[#888]">
            首次登入會自動創建帳戶
          </p>
        </section>
      )}

      {/* Step: Email Login */}
      {step === "email-login" && (
        <section className="mt-8 card p-5">
          <button 
            onClick={() => { setStep("choice"); setError(""); }}
            className="mb-4 text-sm text-[#666]"
          >
            ← 返回
          </button>
          
          <h2 className="text-lg font-semibold">Email 登入</h2>
          
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-[13px] text-[#444]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className="mt-1 h-12 w-full rounded-xl border border-[#ddd] bg-white px-4 text-base"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="text-[13px] text-[#444]">密碼</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className="mt-1 h-12 w-full rounded-xl border border-[#ddd] bg-white px-4 text-base"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-[13px] text-[#e74c3c]">{error}</p>}

            <button 
              onClick={handleEmailSubmit}
              disabled={loading}
              className="tap-feedback h-12 w-full rounded-[14px] bg-[#f5b041] text-base font-bold text-white disabled:opacity-60"
            >
              {loading ? "登入中..." : "登入"}
            </button>

            <p className="text-center text-sm text-[#666]">
              未有帳戶？{" "}
              <button 
                onClick={() => { setIsSignup(true); setStep("email-signup"); }}
                className="text-[#f5b041] font-semibold"
              >
                註冊
              </button>
            </p>
          </div>
        </section>
      )}

      {/* Step: Email Signup */}
      {step === "email-signup" && (
        <section className="mt-8 card p-5">
          <button 
            onClick={() => { setStep("email-login"); setError(""); }}
            className="mb-4 text-sm text-[#666]"
          >
            ← 返回
          </button>
          
          <h2 className="text-lg font-semibold">創建帳戶</h2>
          
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-[13px] text-[#444]">顯示名稱</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 h-12 w-full rounded-xl border border-[#ddd] bg-white px-4 text-base"
                placeholder="你想其他人點稱呼你？"
              />
            </div>
            
            <div>
              <label className="text-[13px] text-[#444]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className="mt-1 h-12 w-full rounded-xl border border-[#ddd] bg-white px-4 text-base"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="text-[13px] text-[#444]">密碼</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className="mt-1 h-12 w-full rounded-xl border border-[#ddd] bg-white px-4 text-base"
                placeholder="至少 6 位"
              />
            </div>

            <div>
              <label className="text-[13px] text-[#444]">確認密碼</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                className="mt-1 h-12 w-full rounded-xl border border-[#ddd] bg-white px-4 text-base"
                placeholder="再次輸入密碼"
              />
            </div>

            {error && <p className="text-[13px] text-[#e74c3c]">{error}</p>}

            <button 
              onClick={handleEmailSubmit}
              disabled={loading}
              className="tap-feedback h-12 w-full rounded-[14px] bg-[#f5b041] text-base font-bold text-white disabled:opacity-60"
            >
              {loading ? "創建中..." : "創建帳戶"}
            </button>
          </div>
        </section>
      )}

      {/* Step: Phone */}
      {step === "phone" && (
        <section className="mt-8 card p-5">
          <button 
            onClick={() => { setStep("choice"); setError(""); }}
            className="mb-4 text-sm text-[#666]"
          >
            ← 返回
          </button>
          
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
          <button onClick={sendOtp} className="tap-feedback mt-4 h-12 w-full rounded-[14px] bg-[#f5b041] text-base font-bold text-white">
            取得驗證碼
          </button>
          <p className="mt-3 text-[13px] text-[#444]">我哋唔會亂發訊息</p>
        </section>
      )}

      {/* Step: OTP */}
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
          <button onClick={verifyOtp} className="tap-feedback mt-4 h-12 w-full rounded-[14px] bg-[#f5b041] text-base font-bold text-white">
            確認
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
