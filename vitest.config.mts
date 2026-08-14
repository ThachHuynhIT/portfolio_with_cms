import { defineConfig } from "vitest/config";
import path from "node:path";

const root = import.meta.dirname;

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@/": path.resolve(root, "./src/") + "/",
      "@components/": path.resolve(root, "./src/components/") + "/",
      "@lib/": path.resolve(root, "./src/lib/") + "/",
      "@styles/": path.resolve(root, "./src/styles/") + "/",
    },
  },
});
