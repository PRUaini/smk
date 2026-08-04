import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DashboardWidgetBoundary from "./DashboardWidgetBoundary";

function BrokenWidget(): React.ReactNode {
  throw new Error("Widget failed");
}

describe("DashboardWidgetBoundary", () => {
  it("renders a fallback when a widget throws", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <DashboardWidgetBoundary label="Kalender mingguan">
        <BrokenWidget />
      </DashboardWidgetBoundary>
    );

    expect(screen.getByText("Kalender mingguan tidak dapat ditampilkan")).toBeInTheDocument();
    expect(screen.getByText("Muat ulang widget")).toBeInTheDocument();
  });
});
