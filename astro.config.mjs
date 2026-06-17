import { defineConfig } from "astro/config";
import { rehypeImageFlags } from "./src/plugins/rehype-image-flags.mjs";
import { rehypeTableScroll } from "./src/plugins/rehype-table-scroll.mjs";
import { remarkCallout } from "./src/plugins/remark-callout.mjs";
import { codeMetaShikiTransformer, remarkCodeMeta } from "./src/plugins/remark-code-meta.mjs";
import { remarkLinkMention } from "./src/plugins/remark-link-mention.mjs";
import { remarkTableCaptions } from "./src/plugins/remark-table-captions.mjs";

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
      remarkTableCaptions,
      remarkCallout,
      remarkCodeMeta,
      [remarkLinkMention, { site: "https://guseoh.github.io" }]
    ],
    rehypePlugins: [rehypeTableScroll, rehypeImageFlags],
    syntaxHighlight: {
      type: "shiki",
      excludeLangs: ["math"]
    },
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark"
      },
      defaultColor: false,
      transformers: [codeMetaShikiTransformer()]
    }
  }
});
