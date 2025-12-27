import { corsHeaders } from "../_shared/cors.ts";
import {
  createSupabaseClient,
  createSupabaseAdmin,
} from "../_shared/supabaseClient.ts";
import { ProfilesService } from "./profiles.service.ts";

Deno.serve(async (req) => {
  switch (req.method) {
    case "OPTIONS": {
      return new Response("ok", { headers: corsHeaders });
    }

    case "GET": {
      try {
        const supabase = createSupabaseClient(req);
        const supabaseAdmin = createSupabaseAdmin();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const profilesService = new ProfilesService(supabase, supabaseAdmin);

        const url = new URL(req.url);
        const queryId = url.searchParams.get("id");
        const isList = url.searchParams.get("list") === "true";

        let responseData;

        if (isList) {
          const currentUserProfile = await profilesService.getProfile(user.id);
          const teamId = currentUserProfile.team_id;

          if (teamId) {
            responseData = await profilesService.getAllProfilesInTeam(teamId);
          } else {
            responseData = [];
          }
        } else {
          const targetId = queryId ?? user.id;

          responseData = await profilesService.getProfile(targetId);
        }

        return new Response(JSON.stringify(responseData), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }
    }

    case "PATCH": {
      try {
        const supabase = createSupabaseClient(req);
        const supabaseAdmin = createSupabaseAdmin();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("Unauthorized");
        }

        const profilesService = new ProfilesService(supabase, supabaseAdmin);
        const profileRes = await profilesService.updateProfile(req, user.id);

        return new Response(JSON.stringify(profileRes), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }
    }

    default: {
      return new Response(
        JSON.stringify({ error: `Method ${req.method} Not Allowed` }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 405, // 405 Method Not Allowed
        }
      );
    }
  }
});
