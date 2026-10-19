import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Alert } from "@/components/ui/alert";

describe("Accessible UI Component Atoms", () => {
  it("renders Button with proper loading state and disabled attribute", () => {
    const handleClick = vi.fn();
    const { rerender } = render(
      <Button onClick={handleClick} isLoading={false}>
        Submit Evaluation
      </Button>
    );

    const btn = screen.getByRole("button", { name: /Submit Evaluation/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);

    // When loading, must be disabled
    rerender(
      <Button onClick={handleClick} isLoading={true}>
        Submit Evaluation
      </Button>
    );
    expect(btn).toBeDisabled();
  });

  it("renders semantic Status Badges with correct CSS classes", () => {
    const { rerender } = render(<Badge variant="success">Approved</Badge>);
    expect(screen.getByText("Approved")).toHaveClass("text-status-successText");

    rerender(<Badge variant="danger">Rejected</Badge>);
    expect(screen.getByText("Rejected")).toHaveClass("text-status-dangerText");

    rerender(<Badge variant="warning">Under Review</Badge>);
    expect(screen.getByText("Under Review")).toHaveClass("text-status-warningText");
  });

  it("renders accessible Dialog modal and handles close triggers", () => {
    const handleClose = vi.fn();
    const { rerender } = render(
      <Dialog
        isOpen={true}
        onClose={handleClose}
        title="Confirm Grade Publication"
        description="Are you sure you want to release grades?"
      >
        <p>Test Content</p>
      </Dialog>
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Confirm Grade Publication" })).toBeInTheDocument();

    // Close button click
    const closeBtn = screen.getByRole("button", { name: /Close dialog/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    // When closed, nothing should be in document
    rerender(
      <Dialog isOpen={false} onClose={handleClose} title="Hidden Modal">
        <p>Hidden</p>
      </Dialog>
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders semantic Alert notifications with proper alert role", () => {
    render(
      <Alert variant="warning" title="Attendance Caution">
        Attendance is below 75% threshold.
      </Alert>
    );

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(screen.getByText("Attendance Caution")).toBeInTheDocument();
    expect(screen.getByText("Attendance is below 75% threshold.")).toBeInTheDocument();
  });
});
