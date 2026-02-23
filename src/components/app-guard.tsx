"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadAppState } from "@/lib/store";

export default function AppGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const s = loadAppState();
    const nextParam = searchParams.get("next");
    
    // 如果緊係去緊 join 頁面，唔好 guard 走
    if (nextParam?.startsWith("/j/")) {
      return;
    }
    
    if (!s.loggedIn) {
      router.replace("/login");
    } else if (!s.familyId) {
      router.replace("/onboarding");
    }
  }, [router, mounted, searchParams]);

  return <>{children}</>;
}
