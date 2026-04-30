import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("@react-google-maps")) return "maps";
          if (id.includes("@tanstack") || id.includes("@trpc") || id.includes("superjson")) return "query";
          if (id.includes("react-dom") || id.includes("react-router") || id.includes("scheduler")) return "react";
          return "vendor";
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:3000",
      "/trpc": "http://localhost:3000",
    },
  },
});
