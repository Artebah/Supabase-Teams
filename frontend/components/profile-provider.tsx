"use client";

import { useProfile } from "@/hooks/useProfile";
import { ROUTES, PUBLIC_ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/client";
import { usePresenceStore } from "@/zustand/usePresenceStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute =
    PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/auth");

  const { isAuthError, profile } = useProfile();
  const router = useRouter();
  const { setOnlineUsers } = usePresenceStore();

  useEffect(() => {
    if (!isPublicRoute && isAuthError) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isAuthError, router, isPublicRoute]);

  useEffect(() => {
    if (!isAuthError && profile?.id && profile.team_id) {
      const supabase = createClient();

      const teamChannel = supabase.channel(profile.team_id, {
        config: { presence: { key: profile.id } },
      });

      teamChannel
        .on("presence", { event: "sync" }, () => {
          const state = teamChannel.presenceState();
          const onlineUserIds = Object.keys(state);

          setOnlineUsers(onlineUserIds);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await teamChannel.track({ online_at: new Date().toISOString() });
          }
        });

      return () => {
        teamChannel.unsubscribe();
      };
    }
  }, [profile, isAuthError, setOnlineUsers]);

  if (!isPublicRoute && isAuthError) {
    return null;
  }

  return <>{children}</>;
}
