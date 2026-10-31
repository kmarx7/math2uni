import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { supabaseConfig } from "@/lib/supabase/config";
import { currentAccount } from "@/modules/auth/server";
export default async function Signup() {
  if (await currentAccount()) redirect("/");
  return <AuthForm signup configured={!!supabaseConfig()} />;
}
