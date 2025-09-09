import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: true,            // escucha en 0.0.0.0 → accesible desde 127.0.0.1 e IP LAN
    port: 5173,            // puerto fijo
    strictPort: true,      // no cambia de puerto si está ocupado
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 5173,
    },
  },
});
