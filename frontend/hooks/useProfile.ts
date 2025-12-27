import { createClient } from "@/lib/supabase/client";
import { toastSupabaseError } from "@/utils/toastSupabaseError";
import useProfileStore from "@/zustand/useProfileStore";
import React, { useEffect, useCallback } from "react";

export function useProfile() {
  const { setProfile, setIsLoading, isLoading } = useProfileStore();
  const [errorStatus, setErrorStatus] = React.useState<number | null>(null);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase.functions.invoke("profiles", {
      method: "GET",
    });

    if (error) {
      setIsLoading(false);

      const status = error?.context?.status || error?.status;
      setErrorStatus(status);

      // Only show toast for non-auth errors
      if (status !== 401 && status !== 403) {
        toastSupabaseError(error);
      }
      return;
    }

    setProfile(data);
    setIsLoading(false);
  }, [setIsLoading, setProfile]);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      if (mounted) {
        await fetchUser();
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [fetchUser]);

  const isAuthError = errorStatus === 401 || errorStatus === 403;
  const isError = errorStatus !== null;

  return { isLoading, isError, isAuthError, errorStatus, refetch: fetchUser };
}
