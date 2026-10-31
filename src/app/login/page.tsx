import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { supabaseConfig } from "@/lib/supabase/config";
import { currentAccount } from "@/modules/auth/server";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ confirmation?: string }>;
}) {
  if (await currentAccount()) redirect("/");
  const query = await searchParams;
  return (
    <AuthForm
      configured={!!supabaseConfig()}
      confirmationFailed={query.confirmation === "failed"}
    />
  );
}
