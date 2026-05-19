import type { Metadata } from "next";
import LoginForm from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Masuk — SMK Portal",
  description: "Masuk ke SMK Portal dengan kode agent Anda.",
};

export default function LoginPage() {
  return <LoginForm />;
}
