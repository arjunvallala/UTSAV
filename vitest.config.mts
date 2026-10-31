import { defineConfig } from "vitest/config";
const config = defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/domain/**/*.ts"],
      thresholds: { lines: 90, branches: 90 },
    },
  },
});
export default config;
