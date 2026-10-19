import { describe, it, expect } from "vitest";
import { ExemptionStatus } from "@/types/database";

describe("Exemption Lifecycle & Workflow State Machine", () => {
  function canCancelExemption(status: ExemptionStatus): boolean {
    // Only pending requests may be cancelled by the student
    return status === "pending";
  }

  function canReviewExemption(status: ExemptionStatus): boolean {
    // Only pending or under_review requests can receive a decision
    return status === "pending" || status === "under_review";
  }

  it("permits student cancellation strictly when status is pending", () => {
    expect(canCancelExemption("pending")).toBe(true);
    expect(canCancelExemption("under_review")).toBe(false);
    expect(canCancelExemption("approved")).toBe(false);
    expect(canCancelExemption("rejected")).toBe(false);
    expect(canCancelExemption("cancelled")).toBe(false);
  });

  it("permits faculty review only on active unfinalized requests", () => {
    expect(canReviewExemption("pending")).toBe(true);
    expect(canReviewExemption("under_review")).toBe(true);
    expect(canReviewExemption("approved")).toBe(false);
    expect(canReviewExemption("rejected")).toBe(false);
    expect(canReviewExemption("cancelled")).toBe(false);
  });
});
