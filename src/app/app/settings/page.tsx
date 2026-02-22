"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [time, setTime] = useState("16:00");
  const [language, setLanguage] = useState("粵語（繁中）");

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-[22px] font-bold">設定</h1>

      <section className="card p-4">
        <h2 className="text-base font-semibold">通知時間</h2>
        <select
          value={time}
          onChange={(event) => setTime(event.target.value)}
          className="mt-3 h-12 w-full rounded-xl border border-[#ddd] bg-white px-4 text-base"
        >
          <option>16:00</option>
          <option>17:00</option>
          <option>18:00</option>
        </select>
        <button className="tap-feedback mt-3 h-12 w-full rounded-xl border border-[#f5b041] text-base font-semibold text-[#b66d00]">
          啟用 Web 通知
        </button>
        <p className="mt-2 text-[13px] text-[#444]">iPhone 需先「加入主畫面」。</p>
      </section>

      <section className="card p-4">
        <h2 className="text-base font-semibold">語言</h2>
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="mt-3 h-12 w-full rounded-xl border border-[#ddd] bg-white px-4 text-base"
        >
          <option>粵語（繁中）</option>
          <option>繁體中文</option>
          <option>English</option>
        </select>
      </section>

      <section className="card p-4">
        <h2 className="text-base font-semibold">私隱</h2>
        <p className="mt-2 text-sm text-[#444]">你嘅資料只用於家庭晚餐回覆同通知。</p>
      </section>

      <button className="tap-feedback h-12 w-full rounded-[14px] bg-[#212121] text-base font-bold text-white">登出</button>
    </div>
  );
}
