import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `base: "./"` makes the built assets use relative paths, so the app works
// whether it's served from a GitHub Pages project site (https://user.github.io/repo/)
// or a custom domain / root site — no need to hardcode the repo name here.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
