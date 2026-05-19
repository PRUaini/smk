"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { LoginFormState } from "../types";

export async function login(
  _prevState: LoginFormState | undefined,
  formData: FormData
): Promise<LoginFormState> {
  const kodeAgent = formData.get("kode_agent") as string;
  const password = formData.get("password") as string;

  if (!kodeAgent || !password) {
    return { error: "Kode Agent dan Password harus diisi." };
  }

  const supabase = await createClient();

  // Supabase Auth uses email-based login.
  // We map kode_agent to a synthetic email: {kode_agent}@smk.internal
  const email = `${kodeAgent.trim().toLowerCase()}@smk.internal`;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Kode Agent atau Password salah." };
  }

  redirect("/dashboard");
}
