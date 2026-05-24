import { NextResponse } from "next/server";
import { signUpAgent } from "@/features/auth/data/auth.repository";

export async function GET() {
  try {
    const data = await signUpAgent("agent001", "password123");
    return NextResponse.json({ success: true, user: data.user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create agent";
    const status = message === "Missing env variables" ? 500 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
