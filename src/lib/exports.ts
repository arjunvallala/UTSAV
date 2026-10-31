import type { EventPlan } from "@/domain/schema";
export function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
export function calendar(event: EventPlan) {
  const items = event.tasks
    .map(
      (t) =>
        `BEGIN:VEVENT\nUID:${t.id}@utsav\nDTSTAMP:${new Date()
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(
            /\.\d{3}/,
            "",
          )}\nDTSTART;VALUE=DATE:${t.dueDate.replaceAll("-", "")}\nSUMMARY:${t.title.replace(/[\\,;]/g, "\\$&")}\nEND:VEVENT`,
    )
    .join("\n");
  return `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Utsav//Event Planner//EN\n${items}\nEND:VCALENDAR`;
}
