import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // three.js (fundo do hero) é carregado sob demanda, num pedaço separado.
    chunkSizeWarningLimit: 800,
  },
});
