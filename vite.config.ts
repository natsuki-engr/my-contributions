import build from "@hono/vite-build";
import devServer from "@hono/vite-dev-server";
import ssg from "@hono/vite-ssg";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  if (mode === "ssg") {
    return {
      plugins: [
        ssg({
          entry: "src/app.tsx",
        }),
      ],
    };
  }

  return {
    plugins: [
      build({
        entry: "src/app.tsx",
      }),
      devServer({
        entry: "src/app.tsx",
      }),
    ],
  };
});
