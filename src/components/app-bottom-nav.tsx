"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/app/today", label: "今日", icon: "📍" },
  { href: "/app/history", label: "記錄", icon: "🗓️" },
  { href: "/app/members", label: "成員", icon: "👨‍👩‍👧‍👦" },
];

export default function AppBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#ececec] bg-white px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-2">
      <div className="mx-auto grid w-full max-w-md grid-cols-3 gap-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`tap-feedback flex flex-col items-center justify-center rounded-xl px-2 py-2 text-xs ${
                active ? "bg-[#fff3df] text-[#b66d00]" : "text-[#555]"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
