import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://guseoh.github.io",
  markdown: {
    syntaxHighlight: {
      type: "shiki",
      excludeLangs: ["math"]
    },
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark"
      },
      defaultColor: false
    }
  },
  integrations: [sitemap()]
});
