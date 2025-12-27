"use client";

import React from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import { ROUTES } from "@/lib/routes";
import { useRouter } from "next/navigation";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { useProfile } from "@/hooks/useProfile";

function JoinTeamForm() {
  const [invitationCode, setInvitationCode] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const subapase = createClient();
  const router = useRouter();
  const { refetch } = useProfile();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (invitationCode.trim()) {
      const { data, error } = await subapase.functions.invoke("team-actions", {
        body: { action: "join", payload: { inviteCode: invitationCode } },
      });

      if (error && error instanceof FunctionsHttpError) {
        const errorMsg = await error.context.json();
        toast.error(errorMsg.error);
        return;
      }

      // Оновлюємо профіль після приєднання до команди
      await refetch();

      router.push(ROUTES.TEAM(data.team.id));
      toast.success("You've joined to team ", data.team.name);
    } else {
      setErrorMessage("Invitation code field is required");
    }
  };

  return (
    <Card className="min-w-[400px] px-4 pb-10">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Join a Team</CardTitle>
        <CardDescription>
          Join an existing team using an invitation code
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="invitation-code">Invitation code</Label>
          <Input
            id="invitation-code"
            type="invitation-code"
            placeholder="agh4367hgd"
            value={invitationCode}
            onChange={(e) => {
              setErrorMessage(null);
              setInvitationCode(e.target.value);
            }}
          />
          {errorMessage && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}
        </div>
        <div className="mt-4">
          <Button className="w-full">Join team</Button>
        </div>
      </form>
    </Card>
  );
}

export default JoinTeamForm;
