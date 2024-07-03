import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "/src/main.jsx": "/src/Front_end/main.jsx",
    },
  },
});