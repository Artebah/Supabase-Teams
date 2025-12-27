import GoogleIcon from "@/assets/google.svg?react";
import { Button } from "../ui/button";
import { createClient } from "@/lib/supabase/client";

function SignInWithGoogle() {
  const onClick = async () => {
    const supabase = createClient();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  };
  return (
    <Button onClick={onClick} className="w-full">
      <GoogleIcon /> Continue with Google
    </Button>
  );
}

export default SignInWithGoogle;
