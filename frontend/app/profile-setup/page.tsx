import { ProfileSetupForm } from "@/components/profile-setup-form";

export default function ProfileSetupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10 max-md:pt-16 max-md:pb-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <ProfileSetupForm />
      </div>
    </div>
  );
}
