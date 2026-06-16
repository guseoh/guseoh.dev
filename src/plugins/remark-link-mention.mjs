import { visit } from "unist-util-visit";

const directivePattern = /^::link-mention\s*\{\s*([\s\S]*?)\s*\}$/;
const attributePattern = /([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|“([^”]*)”|‘([^’]*)’)/g;

function nodeText(node) {
  if (!node) return "";

  if (node.type === "text" || node.type === "inlineCode") {
    return node.value;
  }

  if (node.type === "break") {
    return "\n";
  }

  if (Array.isArray(node.children)) {
    return node.children.map(nodeText).join("");
  }

  return "";
}

function paragraphText(node) {
  return (node.children ?? []).map(nodeText).join("");
}

function parseAttributes(source) {
  const attributes = new Map();

  for (const match of source.matchAll(attributePattern)) {
    attributes.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? match[5] ?? "");
  }

  return attributes;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeUrl(value, baseUrl) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  try {
    const base = new URL(baseUrl);
    const url = new URL(trimmed, base);
    const isRootRelative = trimmed.startsWith("/");
    const isAbsoluteHttp = /^https?:\/\//i.test(trimmed);

    if (!isRootRelative && !isAbsoluteHttp) return undefined;

    return {
      href: isRootRelative ? `${url.pathname}${url.search}${url.hash}` : url.href,
      display: isRootRelative
        ? `${base.hostname}${url.pathname}${url.search}${url.hash}`.replace(/\/$/, "")
        : `${url.hostname}${url.pathname}${url.search}${url.hash}`.replace(/\/$/, ""),
      host: isRootRelative ? base.hostname : url.hostname,
      isInternal: isRootRelative || url.origin === base.origin
    };
  } catch {
    return undefined;
  }
}

function normalizeImageUrl(value, baseUrl) {
  if (!value) return undefined;
  return normalizeUrl(value, baseUrl)?.href;
}

function firstLetter(value) {
  return value.trim().replace(/^www\./, "").charAt(0).toUpperCase() || "L";
}

function renderLinkMention(data) {
  const description = data.description
    ? `<span class="link-mention__description">${escapeHtml(data.description)}</span>`
    : "";
  const icon = data.icon
    ? `<img class="link-mention__favicon" src="${escapeHtml(data.icon)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" />`
    : "";

  return `<a class="link-mention" href="${escapeHtml(data.href)}" data-link-mention="${data.isInternal ? "internal" : "external"}">
  <span class="link-mention__icon" aria-hidden="true">
    <span class="link-mention__icon-fallback">${escapeHtml(firstLetter(data.host))}</span>
    ${icon}
  </span>
  <span class="link-mention__content">
    <span class="link-mention__title">${escapeHtml(data.title)}</span>
    ${description}
    <span class="link-mention__url">${escapeHtml(data.display)}</span>
  </span>
</a>`;
}

function parseLinkMention(value, options) {
  const match = value.trim().match(directivePattern);
  if (!match) return undefined;

  const attributes = parseAttributes(match[1]);
  const url = normalizeUrl(attributes.get("url") ?? attributes.get("href") ?? "", options.site);
  if (!url) return undefined;

  return {
    href: url.href,
    display: attributes.get("display")?.trim() || url.display,
    host: url.host,
    icon: normalizeImageUrl(attributes.get("icon") ?? attributes.get("favicon") ?? "", options.site),
    isInternal: url.isInternal,
    title: attributes.get("title")?.trim() || url.host,
    description: attributes.get("description")?.trim() || ""
  };
}

export function remarkLinkMention(options = {}) {
  const settings = {
    site: "https://guseoh.dev",
    ...options
  };

  return (tree) => {
    visit(tree, "paragraph", (node, index, parent) => {
      if (!parent || typeof index !== "number") return;

      const mention = parseLinkMention(paragraphText(node), settings);
      if (!mention) return;

      parent.children[index] = {
        type: "html",
        value: renderLinkMention(mention)
      };
    });
  };
}
