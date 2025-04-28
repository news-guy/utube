import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/utube/", // Set base path for GitHub Pages

  // Define environment variable handling
  build: {
    // Don't minify for development to make debugging easier
    minify: process.env.NODE_ENV === "production",

    // Don't include environment variables with 'API_KEY' in them in the final build
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Create separate chunks for better caching
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
});
