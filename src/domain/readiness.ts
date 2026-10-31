import type { EventPlan } from "./schema";
export function readiness(event: EventPlan) {
  const done = event.tasks.filter((t) => t.status === "done").length;
  const timeline = event.tasks.length ? done / event.tasks.length : 1;
  const booked = event.vendors.filter(
    (v) => v.status === "booked" || v.status === "paid",
  ).length;
  const vendor = event.vendors.length ? booked / event.vendors.length : 1;
  const budget = event.budget
    ? Math.max(
        0,
        Math.min(1, (event.budget - event.actualSpend) / event.budget),
      )
    : 0;
  const critical = event.tasks.filter(
    (t) => t.critical && t.status !== "done",
  ).length;
  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        (timeline * 0.4 +
          vendor * 0.25 +
          budget * 0.25 +
          (critical === 0 ? 0.1 : Math.max(0, 0.1 - critical * 0.025))) *
          100,
      ),
    ),
  );
  return {
    score,
    timeline: Math.round(timeline * 100),
    vendor: Math.round(vendor * 100),
    budget: Math.round(budget * 100),
    critical,
    explanation: `${done}/${event.tasks.length} tasks complete; ${booked}/${event.vendors.length} vendors booked; ${critical} critical tasks pending.`,
  };
}
