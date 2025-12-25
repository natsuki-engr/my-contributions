import ssg from "@hono/vite-ssg";
import devServer from "@hono/vite-dev-server";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  if (mode === "ssg") {
    return {
      plugins: [
        ssg({
          entry: "src/app.tsx",
        }),
      ],
      publicDir: "data",
    };
  }

  return {
    plugins: [
      devServer({
        entry: "src/app.tsx",
      }),
    ],
  };
});
