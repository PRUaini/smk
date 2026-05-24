import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import LoginForm from "./LoginForm";

vi.mock("../actions/login", () => ({
  login: vi.fn(),
}));

describe("LoginForm", () => {
  it("renders the required login content without extra post-button sections", () => {
    const { container } = render(<LoginForm />);

    expect(screen.queryByRole("heading", { name: "Sistem Manajemen Kegiatan" })).not.toBeInTheDocument();
    expect(
      screen.queryByText("Kelola kegiatan harian, sasaran mingguan, dan capaian Anda dengan lebih terstruktur."),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Kode Agent")).toHaveAttribute("placeholder", "Masukkan kode agent");
    expect(screen.getByLabelText("Password")).toHaveAttribute("placeholder", "Masukkan password");
    expect(screen.getByRole("button", { name: "Masuk" })).toBeInTheDocument();
    expect(screen.getByText("© 2026 PRUaini Group")).toBeInTheDocument();
    expect(container.querySelector(".banner-illustration-glass")).not.toBeInTheDocument();
    expect(container.querySelector(".login-card-header")).not.toBeInTheDocument();
  });

  it("keeps the password visibility toggle behavior", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const passwordInput = screen.getByLabelText("Password");
    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Tampilkan password" }));
    expect(passwordInput).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Sembunyikan password" }));
    expect(passwordInput).toHaveAttribute("type", "password");
  });
});
