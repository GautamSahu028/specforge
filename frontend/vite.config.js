import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        // In Docker, BACKEND_URL is set to http://backend:3000 via docker-compose.
        // Outside Docker (local dev), it falls back to localhost:3000.
        target: process.env.BACKEND_URL || "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
