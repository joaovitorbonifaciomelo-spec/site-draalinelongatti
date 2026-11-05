import { defineConfig } from "astro/config";

// Site estático. A barra final preserva as URLs do site atual (/sobre/, /contato/…).
export default defineConfig({
  site: "https://draalinelongatti.com",
  trailingSlash: "always",
  build: { format: "directory" },
  devToolbar: { enabled: false },
  server: { host: true },
});
