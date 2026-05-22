import type { Metadata } from "next";
import LoginForm from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Masuk — Sistem Management Kegiatan",
  description: "Masuk ke Sistem Management Kegiatan dengan kode agent Anda.",
};

export default function LoginPage() {
  return <LoginForm />;
}
