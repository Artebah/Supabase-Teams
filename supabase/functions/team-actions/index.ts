import { corsHeaders } from "../_shared/cors.ts";
import {
  createSupabaseClient,
  createSupabaseAdmin,
} from "../_shared/supabaseClient.ts";
import { toSlug } from "../_shared/utils.ts";

interface RequestBody {
  action: "create" | "join";
  payload: {
    name?: string;
    slug?: string;
    inviteCode?: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createSupabaseClient(req);
    const supabaseAdmin = createSupabaseAdmin();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("team_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("Profile not found");
    }

    if (profile.team_id) {
      return new Response(
        JSON.stringify({ error: "User is already in a team" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const { action, payload }: RequestBody = await req.json();

    let result;

    if (action === "create") {
      if (!payload.name) throw new Error("Team name is required");

      const teamName = payload.name;
      const slug = payload.slug ? toSlug(payload.slug) : toSlug(teamName);

      const { data: existingName } = await supabaseAdmin
        .from("teams")
        .select("id")
        .eq("name", teamName)
        .maybeSingle();

      if (existingName) {
        return new Response(
          JSON.stringify({ error: "Team with this name already exists" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }

      const { data: existingSlug } = await supabaseAdmin
        .from("teams")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (existingSlug) {
        return new Response(
          JSON.stringify({ error: "Team with this slug already exists" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }

      const inviteCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      const { data: team, error: createError } = await supabaseAdmin
        .from("teams")
        .insert({
          name: teamName,
          slug: slug,
          invite_code: inviteCode,
        })
        .select()
        .single();

      if (createError) throw createError;

      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ team_id: team.id })
        .eq("id", user.id);

      if (updateError) throw updateError;

      result = { message: "Team created successfully", team };
    } else if (action === "join") {
      if (!payload.inviteCode || payload.inviteCode == "")
        throw new Error("Invite code is required");

      const { data: team, error: findError } = await supabaseAdmin
        .from("teams")
        .select("id, name")
        .eq("invite_code", payload.inviteCode)
        .single();

      if (findError || !team) {
        return new Response(JSON.stringify({ error: "Invalid invite code" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        });
      }

      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ team_id: team.id })
        .eq("id", user.id);

      if (updateError) throw updateError;

      result = { message: "Joined team successfully", team };
    } else {
      throw new Error("Invalid action");
    }

    return new Response(JSON.stringify(result), {
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
});
