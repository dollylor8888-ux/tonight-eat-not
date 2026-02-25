"use client";

import Link from "next/link";

export default function OnboardingPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-[#fafafa] px-4 py-10">
      <h1 className="text-[22px] font-bold">建立你既家庭</h1>
      <p className="mt-2 text-base text-[#444]">創建一個家庭，等屋企人加入</p>

      {/* 建立家庭 */}
      <div className="mt-8">
        <Link
          href="/onboarding/create"
          className="tap-feedback flex w-full items-center gap-4 rounded-[16px] bg-white p-6 shadow-md"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#fff3df] text-3xl">
            🏠
          </div>
          <div className="text-left">
            <p className="text-xl font-bold">建立家庭</p>
            <p className="text-sm text-[#666] mt-1">創立新家庭，分享連結俾屋企人</p>
          </div>
        </Link>
      </div>

      {/* 說明 */}
      <div className="mt-8 p-4 bg-[#f0f8ff] rounded-xl">
        <p className="text-sm text-[#444]">
          <span className="font-bold">點運作：</span>
        </p>
        <ol className="mt-2 text-sm text-[#666] list-decimal list-inside space-y-1">
          <li>建立家庭</li>
          <li>分享邀請連結俾屋企人</li>
          <li>屋企人 click 連結就會自動加入</li>
          <li>每日一鍵回覆「會」/「唔會」</li>
        </ol>
      </div>
    </main>
  );
}
