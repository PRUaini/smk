import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TargetsSidebar from "./TargetsSidebar";

describe("TargetsSidebar", () => {
  it("uses scoped classes for action buttons", () => {
    render(
      <TargetsSidebar
        initialTargets={null}
        onSave={vi.fn()}
        isPending={false}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Batal" })).toHaveClass(
      "target-sidebar-btn-secondary",
      "flex-1"
    );
    expect(screen.getByRole("button", { name: "Simpan Target" })).toHaveClass(
      "target-sidebar-btn-primary",
      "flex-1"
    );
  });
});
