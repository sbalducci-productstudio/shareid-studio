import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite + React (automatic JSX runtime).
// On garde les .jsx en JS simple — pas de TypeScript — pour rester proche du
// prototype d'origine et lisible pour un apprentissage du code.
export default defineConfig({
  // Servi sous un sous-chemin sur GitHub Pages : https://<user>.github.io/shareid-studio/
  // `base` s'applique EN DEV AUSSI : le serveur sert sous /shareid-studio/ et Vite
  // préfixe `base` aux chemins root-absolus (`/studio.css`, `/src/main.jsx`) une seule
  // fois. Dans le JSX, utiliser import.meta.env.BASE_URL pour les assets de public/.
  base: "/shareid-studio/",
  plugins: [react()],
  server: { port: 5173, open: true },
});
