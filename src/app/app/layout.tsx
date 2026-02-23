import type { ReactNode } from "react";
import { Suspense } from "react";
import AppBottomNav from "@/components/app-bottom-nav";
import AppTopBar from "@/components/app-top-bar";
import AppGuard from "@/components/app-guard";

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <AppTopBar />
      <main className="mx-auto w-full max-w-md px-4 pb-28 pt-4">
        <Suspense fallback={<div className="text-center py-10">載入中...</div>}>
          <AppGuard>
            {children}
          </AppGuard>
        </Suspense>
      </main>
      <AppBottomNav />
    </div>
  );
}
