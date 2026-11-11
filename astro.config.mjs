import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

const site = process.env.SITE_URL ?? "https://boraemon2000.github.io";
const base = process.env.BASE_PATH ?? "/kagoshima-portal";

export default defineConfig({
  site,
  base,
  trailingSlash: "always",
  integrations: [
    sitemap({
      changefreq: "daily",
      lastmod: new Date(),
    }),
  ],
  build: {
    inlineStylesheets: "always",
  },
  vite: {
    json: {
      stringify: false,
    },
  },
});
