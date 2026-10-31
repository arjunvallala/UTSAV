import { describe, expect, it } from "vitest";
import { sampleWedding } from "../src/templates/wedding";
import { calendar } from "../src/lib/exports";

describe("calendar export", () => {
  it("escapes untrusted text so a task cannot add calendar properties", () => {
    const event = {
      ...sampleWedding,
      tasks: [
        {
          ...sampleWedding.tasks[0],
          title: "Menu, tasting; notes\r\nLOCATION:Injected",
        },
      ],
    };
    const ics = calendar(event);
    expect(ics).toContain(
      "SUMMARY:Menu\\, tasting\\; notes\\nLOCATION:Injected",
    );
    expect(ics.split("\n").some((line) => line.startsWith("LOCATION:"))).toBe(
      false,
    );
  });
});
