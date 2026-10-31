import { useCallback, useMemo, useSyncExternalStore } from "react";
import { EventSchema, type EventPlan } from "@/domain/schema";
import { eventSnapshot, saveEvent, subscribeEvent } from "./storage";

export function useEventPlan(fallback: EventPlan) {
  const fallbackJSON = JSON.stringify(fallback);
  const snapshot = useCallback(
    () => eventSnapshot(fallbackJSON),
    [fallbackJSON],
  );
  const serverSnapshot = useCallback(() => fallbackJSON, [fallbackJSON]);
  const serialized = useSyncExternalStore(
    subscribeEvent,
    snapshot,
    serverSnapshot,
  );
  const event = useMemo(() => {
    try {
      return EventSchema.parse(JSON.parse(serialized));
    } catch {
      return fallback;
    }
  }, [fallback, serialized]);
  const update = useCallback(
    (change: EventPlan | ((current: EventPlan) => EventPlan)) => {
      let current: EventPlan;
      try {
        current = EventSchema.parse(JSON.parse(eventSnapshot(fallbackJSON)));
      } catch {
        current = fallback;
      }
      saveEvent(typeof change === "function" ? change(current) : change);
    },
    [fallback, fallbackJSON],
  );
  return [event, update] as const;
}

function todaySnapshot() {
  return new Date().toISOString().slice(0, 10);
}
function subscribeToday(callback: () => void) {
  const timer = window.setInterval(callback, 60_000);
  return () => window.clearInterval(timer);
}
export function useToday() {
  return useSyncExternalStore(subscribeToday, todaySnapshot, todaySnapshot);
}
