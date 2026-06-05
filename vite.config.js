import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite + React (automatic JSX runtime).
// On garde les .jsx en JS simple — pas de TypeScript — pour rester proche du
// prototype d'origine et lisible pour un apprentissage du code.
export default defineConfig({
  // Servi sous un sous-chemin sur GitHub Pages : https://<user>.github.io/shareid-studio/
  // En dev, Vite ignore `base` (sert depuis /). Tous les assets en tiennent compte
  // via %BASE_URL% (index.html) et import.meta.env.BASE_URL (JSX).
  base: "/shareid-studio/",
  plugins: [react()],
  server: { port: 5173, open: true },
});
