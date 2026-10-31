import { cp, mkdir } from "node:fs/promises";

if (process.env.NETLIFY) {
  console.log("Skipping standalone packaging; Netlify uses its Next.js runtime.");
} else {
await mkdir(".next/standalone/.next", { recursive: true });
await cp(".next/static", ".next/standalone/.next/static", {
  recursive: true,
  force: true,
});
await cp("public", ".next/standalone/public", {
  recursive: true,
  force: true,
});
}
