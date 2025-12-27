"use client";

import { useProfile } from "@/hooks/useProfile";
import { ROUTES, PUBLIC_ROUTES } from "@/lib/routes";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute =
    PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/auth");

  const { isAuthError } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (!isPublicRoute && isAuthError) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isAuthError, router, isPublicRoute]);

  if (!isPublicRoute && isAuthError) {
    return null;
  }

  return <>{children}</>;
}
