import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  base: process.env.VITE_APP_BASE || "./",
  tanstackStart: {
    spa: { enabled: true },
    server: { entry: "server" },
  },
});
