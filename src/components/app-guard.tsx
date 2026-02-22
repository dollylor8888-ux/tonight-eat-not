"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadAppState } from "@/lib/store";

export default function AppGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const s = loadAppState();
    
    if (!s.loggedIn) {
      router.replace("/login");
    } else if (!s.familyId) {
      router.replace("/onboarding");
    }
  }, [router]);

  return <>{children}</>;
}
