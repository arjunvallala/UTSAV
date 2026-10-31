import { describe, it, expect } from "vitest";
import { readiness } from "../src/domain/readiness";
import {
  rescheduleTask,
  simulateBudgetCut,
  simulateDateChange,
  simulateGuests,
  simulateVendorCancellation,
} from "../src/domain/simulate";
import { sampleWedding } from "../src/templates/wedding";
import { EventSchema } from "../src/domain/schema";
describe("event planning domain", () => {
  it("accepts a valid event and rejects malformed counts", () => {
    expect(EventSchema.parse(sampleWedding).schemaVersion).toBe(1);
    expect(() =>
      EventSchema.parse({ ...sampleWedding, guestCount: 0 }),
    ).toThrow();
  });
  it("reports explainable readiness", () => {
    const result = readiness(sampleWedding);
    expect(result.score).toBeGreaterThan(0);
    expect(result.explanation).toContain("tasks complete");
  });
  it("simulates changes without mutating the plan", () => {
    const before = sampleWedding.budget;
    expect(simulateGuests(sampleWedding, 50).guestCount).toBe(230);
    expect(simulateBudgetCut(sampleWedding, 15).budget).toBe(2040000);
    expect(sampleWedding.budget).toBe(before);
    expect(simulateBudgetCut(sampleWedding, 100).overBudget).toBe(true);
  });
  it("simulates date and vendor changes without altering the plan", () => {
    expect(simulateDateChange(sampleWedding, "2026-10-31").affectedTasks).toBe(
      7,
    );
    expect(
      simulateVendorCancellation(sampleWedding, "v1")?.readinessDelta,
    ).toBe(0);
    expect(simulateVendorCancellation(sampleWedding, "missing")).toBeNull();
    expect(
      simulateVendorCancellation(
        {
          ...sampleWedding,
          vendors: [{ ...sampleWedding.vendors[0], status: "booked" as const }],
        },
        "v1",
      )?.readinessDelta,
    ).toBe(-25);
    expect(
      simulateDateChange(sampleWedding, sampleWedding.date).readinessDelta,
    ).toBe(0);
    const later = new Date(
      new Date(sampleWedding.date + "T00:00:00Z").getTime() + 14 * 86400000,
    )
      .toISOString()
      .slice(0, 10);
    expect(simulateDateChange(sampleWedding, later).shiftDays).toBe(14);
    expect(sampleWedding.date).not.toBe("2026-10-31");
  });
  it("proposes shifts for dependent tasks and handles missing tasks", () => {
    const result = rescheduleTask(sampleWedding, "venue", "2026-11-10");
    expect(result.affected).toContain("caterer");
    expect(result.affected).toContain("rehearsal");
    expect(result.affected).not.toContain("invite");
    expect(
      rescheduleTask(sampleWedding, "missing", "2026-11-10").affected,
    ).toEqual([]);
  });
  it("handles empty plans and completed work", () => {
    const empty = { ...sampleWedding, tasks: [], vendors: [], actualSpend: 0 };
    expect(readiness(empty).score).toBe(100);
    const complete = {
      ...empty,
      tasks: sampleWedding.tasks.map((t) => ({
        ...t,
        status: "done" as const,
      })),
      vendors: sampleWedding.vendors.map((v) => ({
        ...v,
        status: "paid" as const,
      })),
    };
    expect(readiness(complete).score).toBe(100);
    expect(readiness({ ...empty, budget: 0 }).budget).toBe(0);
    expect(
      readiness({
        ...empty,
        tasks: [{ ...sampleWedding.tasks[1], critical: true }],
      }).critical,
    ).toBe(1);
  });
});
