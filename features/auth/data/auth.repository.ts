import { createClient as createRouteClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export interface AuthUser {
  id: string;
  email?: string;
}

export function getKodeAgentFromEmail(email?: string | null): string {
  return email?.replace("@smk.internal", "") ?? "Agent";
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  return {
    id: user.id,
    email: user.email,
  };
}

export async function getRequiredCurrentUser(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized access");
  }

  return user;
}

export async function signUpAgent(kodeAgent: string, password: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing env variables");
  }

  const supabase = createRouteClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase.auth.signUp({
    email: `${kodeAgent}@smk.internal`,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}
