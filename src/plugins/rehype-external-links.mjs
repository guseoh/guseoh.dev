import { visit } from "unist-util-visit";

function isExternalHttpUrl(value, siteUrl) {
  if (typeof value !== "string") return false;

  const href = value.trim();
  if (!href || href.startsWith("#")) return false;

  const isAbsoluteHttp = /^https?:\/\//i.test(href);
  const isProtocolRelative = /^\/\//.test(href);
  if (!isAbsoluteHttp && !isProtocolRelative) return false;

  try {
    const base = new URL(siteUrl);
    const url = new URL(href, base);

    return (url.protocol === "http:" || url.protocol === "https:") && url.origin !== base.origin;
  } catch {
    return false;
  }
}

function mergeRel(value) {
  const tokens = new Set();
  const values = Array.isArray(value) ? value : typeof value === "string" ? value.split(/\s+/) : [];

  for (const token of values) {
    if (typeof token === "string" && token.trim()) {
      tokens.add(token.trim());
    }
  }

  tokens.add("noopener");
  tokens.add("noreferrer");

  return Array.from(tokens).join(" ");
}

export function rehypeExternalLinks(options = {}) {
  const siteUrl = options.site ?? "https://guseoh.github.io";

  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "a") return;

      const properties = node.properties ?? {};
      if (!isExternalHttpUrl(properties.href, siteUrl)) return;

      node.properties = {
        ...properties,
        target: "_blank",
        rel: mergeRel(properties.rel)
      };
    });
  };
}
