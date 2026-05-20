import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { remarkAlert } from "remark-github-blockquote-alert";

export default defineConfig({
  site: "https://guseoh.github.io",
  markdown: {
    remarkPlugins: [remarkAlert],
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
