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
  const escapeText = (value: string) =>
    value
      .replace(/\\/g, "\\\\")
      .replace(/\r\n|\r|\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  const items = event.tasks
    .map(
      (t) =>
        `BEGIN:VEVENT\nUID:${t.id.replace(/[^a-zA-Z0-9-]/g, "") || "task"}@utsav\nDTSTAMP:${new Date()
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(
            /\.\d{3}/,
            "",
          )}\nDTSTART;VALUE=DATE:${t.dueDate.replaceAll("-", "")}\nSUMMARY:${escapeText(t.title)}\nEND:VEVENT`,
    )
    .join("\n");
  return `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Utsav//Event Planner//EN\n${items}\nEND:VCALENDAR`;
}
