import { defineConfig } from "astro/config";
import { remarkCallout } from "./src/plugins/remark-callout.mjs";
import { remarkLinkMention } from "./src/plugins/remark-link-mention.mjs";

function remarkDemoteContentH1() {
  return (tree) => {
    const visit = (node) => {
      if (!node || typeof node !== "object") return;

      if (node.type === "heading" && node.depth === 1) {
        node.depth = 2;
      }

      if (Array.isArray(node.children)) {
        node.children.forEach(visit);
      }
    };

    visit(tree);
  };
}

export default defineConfig({
  site: "https://guseoh.github.io",
  markdown: {
    remarkPlugins: [
      remarkDemoteContentH1,
      remarkCallout,
      [remarkLinkMention, { site: "https://guseoh.github.io" }]
    ],
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
  }
});
