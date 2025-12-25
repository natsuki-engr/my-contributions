import { copyFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

// Create static directory
mkdirSync("dist/static", { recursive: true });

// Copy client.js to dist/static
if (existsSync(".client-build/client.js")) {
  copyFileSync(".client-build/client.js", "dist/static/client.js");
  console.log("✅ Copied client.js to dist/static/client.js");
} else {
  console.log("⚠️ client.js not found");
}

// Copy prs.json to dist if it exists
if (existsSync("data/prs.json")) {
  copyFileSync("data/prs.json", "dist/prs.json");
  console.log("✅ Copied data/prs.json to dist/prs.json");
} else {
  console.log("⚠️ data/prs.json not found, skipping copy");
}

