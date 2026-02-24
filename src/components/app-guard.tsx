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
    const isJoinPage = nextParam?.startsWith("/j/");
    
    // Case 1: Not logged in
    if (!s.loggedIn) {
      // Allow join page to show (will redirect to login inside the page)
      if (isJoinPage) {
        return;
      }
      router.replace("/login");
      return;
    }
    
    // Case 2: Logged in but no family
    if (!s.familyId) {
      router.replace("/onboarding");
      return;
    }
    
    // Case 3: Logged in with family - always allow
  }, [router, mounted, searchParams]);

  return <>{children}</>;
}
