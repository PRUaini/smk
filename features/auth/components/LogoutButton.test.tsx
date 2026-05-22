import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LogoutButton from "./LogoutButton";

vi.mock("@/features/auth/actions/logout", () => ({
  logout: vi.fn(),
}));

describe("LogoutButton", () => {
  it("renders Keluar with the shared logout button class", () => {
    render(<LogoutButton />);

    expect(screen.getByRole("button", { name: /Keluar/i })).toHaveClass(
      "header-logout-btn"
    );
  });
});
