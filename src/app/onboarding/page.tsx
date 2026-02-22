"use client";

import Link from "next/link";

export default function OnboardingPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-[#fafafa] px-4 py-10">
      <h1 className="text-[22px] font-bold">你想做咩？</h1>
      <p className="mt-2 text-base text-[#444]">建立或加入一個家庭</p>

      {/* 選項卡片 */}
      <div className="mt-8 space-y-4">
        {/* 建立家庭 */}
        <Link
          href="/onboarding/create"
          className="tap-feedback flex w-full items-center gap-4 rounded-[16px] bg-white p-5 shadow-md"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff3df] text-2xl">
            🏠
          </div>
          <div className="text-left">
            <p className="text-lg font-semibold">建立家庭</p>
            <p className="text-sm text-[#666]">創立新家庭，等屋企人加入</p>
          </div>
        </Link>

        {/* 加入家庭 */}
        <Link
          href="/onboarding/join"
          className="tap-feedback flex w-full items-center gap-4 rounded-[16px] bg-white p-5 shadow-md"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f8f5] text-2xl">
            🔗
          </div>
          <div className="text-left">
            <p className="text-lg font-semibold">加入家庭</p>
            <p className="text-sm text-[#666]">用邀請碼加入屋企人既家庭</p>
          </div>
        </Link>
      </div>
    </main>
  );
}
