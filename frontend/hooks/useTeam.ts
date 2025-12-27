import { createClient } from "@/lib/supabase/client";
import { toastSupabaseError } from "@/utils/toastSupabaseError";
import useTeamStore from "@/zustand/useTeamStore";
import useProfileStore from "@/zustand/useProfileStore";
import { useCallback, useEffect } from "react";

export function useTeam(teamId?: string) {
  const { setTeam, setIsLoading, isLoading, team } = useTeamStore();
  const { profile } = useProfileStore();

  const fetchTeam = useCallback(
    async (id: string) => {
      const supabase = createClient();
      setIsLoading(true);

      const { data, error } = await supabase.functions.invoke(
        `teams?id=${id}`,
        {
          method: "GET",
        }
      );

      if (error) {
        setIsLoading(false);
        toastSupabaseError(error);
        return;
      }

      setTeam(data);
      setIsLoading(false);
    },
    [setIsLoading, setTeam]
  );

  useEffect(() => {
    // Determine which team ID to fetch
    const targetTeamId = teamId || profile?.team_id;

    if (targetTeamId) {
      fetchTeam(targetTeamId);
    } else {
      setTeam(null);
      setIsLoading(false);
    }
  }, [teamId, profile?.team_id, fetchTeam, setTeam, setIsLoading]);

  return { team, isLoading };
}
