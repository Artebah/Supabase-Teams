import { createClient } from "@/lib/supabase/client";
import useProfileStore from "@/zustand/useProfileStore";
import { useRouter } from "next/navigation";
import React from "react";

export function useLogout() {
  const router = useRouter();
  const setProfile = useProfileStore((store) => store.setProfile);

  const logout = React.useCallback(async () => {
    const supabase = createClient();

    await supabase.auth.signOut();
    setProfile(null);
    router.push("/auth/login");
  }, [router, setProfile]);

  return logout;
}
