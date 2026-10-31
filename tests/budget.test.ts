import { describe, it, expect } from "vitest";
import {
  allocateBudget,
  budgetHealth,
  costPerGuest,
} from "../src/domain/budget";
describe("budget calculations", () => {
  it.each(["Economical", "Balanced", "Premium"] as const)(
    "preserves every rupee in %s",
    (scenario) => {
      const result = allocateBudget(2400000, scenario);
      expect(result.reduce((sum, row) => sum + row.amount, 0)).toBe(2400000);
      expect(
        result.find((x) => x.category === "contingency")!.amount,
      ).toBeGreaterThan(0);
    },
  );
  it("handles the spent and reserve calculations", () => {
    expect(budgetHealth(1000, 500, 100)).toBe(56);
    expect(budgetHealth(1000, 1200, 100)).toBe(0);
    expect(budgetHealth(0, 0, 0)).toBe(0);
    expect(costPerGuest(2400, 12)).toBe(200);
    expect(costPerGuest(100, 0)).toBe(0);
  });
});
