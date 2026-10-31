import { EventSchema, type EventPlan } from "@/domain/schema";
const KEY = "utsav.event.v1";
export function eventSnapshot(fallback: string) {
  if (typeof window === "undefined") return fallback;
  return localStorage.getItem(KEY) || fallback;
}
export function subscribeEvent(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) callback();
  };
  const onUpdate = () => callback();
  window.addEventListener("storage", onStorage);
  window.addEventListener("utsav:event-updated", onUpdate);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("utsav:event-updated", onUpdate);
  };
}
export function saveEvent(event: EventPlan) {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(EventSchema.parse(event)));
    window.dispatchEvent(new Event("utsav:event-updated"));
  }
}
export function deleteAllData() {
  if (typeof window !== "undefined") {
    for (const key of Object.keys(localStorage))
      if (key.startsWith("utsav.")) localStorage.removeItem(key);
  }
}
