import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

const SITE_URL = "https://felp011.pages.dev";

export default defineConfig({
  site: SITE_URL,
  trailingSlash: "ignore",
  build: {
    format: "directory",
  },
  i18n: {
    locales: ["en", "pt", "fr"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: false,
      fallback: {
        pt: "en",
        fr: "en",
      },
    },
  },
  integrations: [sitemap()],
  image: {
    responsiveStyles: true,
  },
  vite: {
    build: {
      assetsInlineLimit: 2048,
    },
  },
});
