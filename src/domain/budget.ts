export type Scenario = "Economical" | "Balanced" | "Premium";
const shares: Record<Scenario, Record<string, number>> = {
  Economical: {
    venue: 0.22,
    catering: 0.32,
    decor: 0.12,
    photo: 0.1,
    attire: 0.08,
    entertainment: 0.06,
    logistics: 0.04,
    contingency: 0.06,
  },
  Balanced: {
    venue: 0.26,
    catering: 0.3,
    decor: 0.14,
    photo: 0.1,
    attire: 0.07,
    entertainment: 0.06,
    logistics: 0.03,
    contingency: 0.04,
  },
  Premium: {
    venue: 0.3,
    catering: 0.27,
    decor: 0.17,
    photo: 0.11,
    attire: 0.06,
    entertainment: 0.06,
    logistics: 0.02,
    contingency: 0.01,
  },
};
export function allocateBudget(total: number, scenario: Scenario) {
  const weights = shares[scenario];
  let assigned = 0;
  const entries = Object.entries(weights).map(([category, ratio], i, arr) => {
    const amount =
      i === arr.length - 1 ? total - assigned : Math.round(total * ratio);
    assigned += amount;
    return { category, amount, ratio };
  });
  return entries;
}
export function budgetHealth(total: number, spent: number, reserve: number) {
  if (total <= 0) return 0;
  const headroom = total - spent;
  return Math.max(
    0,
    Math.min(100, Math.round((headroom / Math.max(1, total - reserve)) * 100)),
  );
}
export function costPerGuest(total: number, guests: number) {
  return guests > 0 ? Math.round(total / guests) : 0;
}
