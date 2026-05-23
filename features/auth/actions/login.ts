"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isRateLimited } from "../utils/rate-limit";
import type { LoginFormState } from "../types";

export async function login(
  _prevState: LoginFormState | undefined,
  formData: FormData
): Promise<LoginFormState> {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";

  if (isRateLimited(ip)) {
    return { error: "Terlalu banyak percobaan login. Silakan coba lagi nanti." };
  }

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
    if (error.status === 429 || error.message.toLowerCase().includes("rate limit")) {
      return { error: "Terlalu banyak percobaan login. Silakan coba lagi nanti." };
    }
    return { error: "Kode Agent atau Password salah." };
  }

  redirect("/dashboard");
}
