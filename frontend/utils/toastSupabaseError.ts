import { FunctionsHttpError } from "@supabase/supabase-js";
import { toast } from "react-toastify";

export async function toastSupabaseError(error: unknown) {
  if (error && error instanceof FunctionsHttpError) {
    const errorMessage = await error.context.text();

    try {
      const jsonError = JSON.parse(errorMessage);
      toast.error(jsonError.error || errorMessage);
    } catch {
      toast.error(errorMessage);
    }
  }
}
