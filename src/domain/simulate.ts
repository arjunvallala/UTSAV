import type { EventPlan } from "./schema";
export function simulateGuests(event: EventPlan, additional: number) {
  const ratio = (event.guestCount + additional) / event.guestCount;
  const budgetEstimate = Math.round(event.budget * (0.65 + 0.35 * ratio));
  return {
    guestCount: event.guestCount + additional,
    estimatedBudget: budgetEstimate,
    delta: budgetEstimate - event.budget,
    readinessImpact: Math.round((event.budget / budgetEstimate - 1) * 20),
  };
}
export function simulateBudgetCut(event: EventPlan, percent: number) {
  const next = Math.round(event.budget * (1 - percent / 100));
  return {
    budget: next,
    remaining: next - event.actualSpend,
    overBudget: event.actualSpend > next,
  };
}
export function simulateVendorCancellation(event: EventPlan, vendorId: string) {
  const vendor = event.vendors.find((v) => v.id === vendorId);
  if (!vendor) return null;
  const affected = vendor.status === "booked" || vendor.status === "paid";
  return {
    vendor: vendor.name,
    readinessDelta: affected
      ? -Math.round(25 / Math.max(event.vendors.length, 1))
      : 0,
    allocation: vendor.budget,
    quoted: vendor.quote,
    notice: affected
      ? "This vendor is booked; cancellation would reduce booking progress and leave the allocation to reassign."
      : "This vendor is not booked yet, so there is no booking progress to lose.",
  };
}
export function simulateDateChange(event: EventPlan, date: string) {
  const delta = Math.ceil(
    (new Date(date).getTime() - new Date(event.date).getTime()) / 86400000,
  );
  return {
    newDate: date,
    shiftDays: delta,
    readinessDelta:
      delta === 0 ? 0 : -Math.min(20, Math.ceil(Math.abs(delta) / 7)),
    affectedTasks: event.tasks.filter((t) => t.status !== "done").length,
  };
}
export function rescheduleTask(
  event: EventPlan,
  taskId: string,
  newDate: string,
) {
  const task = event.tasks.find((t) => t.id === taskId);
  if (!task) return { affected: [], proposal: [] };
  const affected = new Set<string>([taskId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const item of event.tasks)
      if (
        item.dependsOn.some((id) => affected.has(id)) &&
        !affected.has(item.id)
      ) {
        affected.add(item.id);
        grew = true;
      }
  }
  const delta = new Date(newDate).getTime() - new Date(task.dueDate).getTime();
  return {
    affected: [...affected],
    proposal: event.tasks
      .filter((t) => affected.has(t.id))
      .map((t) => ({
        id: t.id,
        from: t.dueDate,
        to: new Date(new Date(t.dueDate).getTime() + delta)
          .toISOString()
          .slice(0, 10),
      })),
  };
}
