import { createClient } from "@/lib/supabase/client";
import { toastSupabaseError } from "@/utils/toastSupabaseError";
import useTeamMembersStore from "@/zustand/useTeamMembersStore";
import { useEffect } from "react";

export function useTeamMembers() {
  const { setTeamMembers, setIsLoading, isLoading, teamMembers } =
    useTeamMembersStore();

  useEffect(() => {
    async function fetchTeamMembers() {
      setIsLoading(true);

      const supabase = createClient();

      const { data, error } = await supabase.functions.invoke(
        "profiles?list=true",
        {
          method: "GET",
        }
      );

      if (error) {
        setIsLoading(false);
        toastSupabaseError(error);
        return;
      }

      setTeamMembers(data);
      setIsLoading(false);
    }

    fetchTeamMembers();
  }, [setIsLoading, setTeamMembers]);

  return { isLoading, teamMembers };
}
