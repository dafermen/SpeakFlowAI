import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? "/",
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    proxy: {
      "/docs": {
        target: "http://127.0.0.1:5174",
      },
    },
  },
  test: {
    environment: "jsdom",
  },
});
