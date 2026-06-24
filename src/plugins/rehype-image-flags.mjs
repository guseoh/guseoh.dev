const filterOptOutPattern = /\s*\{(?:no-dark-filter|theme-safe|data-theme-safe)\}\s*/gi;
const lightboxOptOutPattern = /\s*\{(?:no-lightbox|lightbox-false)\}\s*/gi;
const titleTokenPattern = /(?:^|\s)(?:no-dark-filter|theme-safe|data-theme-safe)(?=\s|$)/gi;
const lightboxTitleTokenPattern = /(?:^|\s)(?:no-lightbox|lightbox-false)(?=\s|$)/gi;
const captionTitlePattern = /^caption:\s*(.+)$/i;

function getOnlyImage(node) {
  if (node?.type !== "element") return undefined;
  if (node.tagName === "img") return node;

  if (
    node.tagName === "a" &&
    Array.isArray(node.children) &&
    node.children.length === 1 &&
    node.children[0]?.type === "element" &&
    node.children[0].tagName === "img"
  ) {
    return node.children[0];
  }

  return undefined;
}

function applyCaption(paragraph, state) {
  if (
    paragraph?.type !== "element" ||
    paragraph.tagName !== "p" ||
    !Array.isArray(paragraph.children) ||
    paragraph.children.length !== 1
  ) {
    return;
  }

  const image = getOnlyImage(paragraph.children[0]);
  if (!image) return;

  const properties = image.properties ?? {};
  const title = typeof properties.title === "string" ? properties.title.trim() : "";
  const match = title.match(captionTitlePattern);
  const caption = match?.[1]?.trim();
  if (!caption) return;

  state.captionIndex += 1;
  const captionId = `post-image-caption-${state.captionIndex}`;

  image.properties = {
    ...properties,
    "data-caption-id": captionId
  };
  delete image.properties.title;

  paragraph.tagName = "figure";
  paragraph.properties = { className: ["post-figure", "post-figure--captioned"] };
  paragraph.children = [
    paragraph.children[0],
    {
      type: "element",
      tagName: "figcaption",
      properties: { id: captionId },
      children: [{ type: "text", value: caption }]
    }
  ];
}

function visit(node, state) {
  if (!Array.isArray(node?.children)) return;

  for (const child of node.children) {
    if (child?.type === "element" && child.tagName === "img") {
      applyImageFlags(child);
    }

    visit(child, state);
  }

  applyCaption(node, state);
}

function applyImageFlags(image) {
  const properties = image.properties ?? {};
  const alt = typeof properties.alt === "string" ? properties.alt : "";
  const title = typeof properties.title === "string" ? properties.title : "";
  const hasAltMarker = filterOptOutPattern.test(alt);
  filterOptOutPattern.lastIndex = 0;
  const hasLightboxAltMarker = lightboxOptOutPattern.test(alt);
  lightboxOptOutPattern.lastIndex = 0;
  const hasTitleMarker = filterOptOutPattern.test(title) || titleTokenPattern.test(title);
  filterOptOutPattern.lastIndex = 0;
  titleTokenPattern.lastIndex = 0;
  const hasLightboxTitleMarker = lightboxOptOutPattern.test(title) || lightboxTitleTokenPattern.test(title);
  lightboxOptOutPattern.lastIndex = 0;
  lightboxTitleTokenPattern.lastIndex = 0;

  if (!hasAltMarker && !hasTitleMarker && !hasLightboxAltMarker && !hasLightboxTitleMarker) return;

  const className = Array.isArray(properties.className)
    ? properties.className
    : typeof properties.className === "string"
      ? properties.className.split(/\s+/).filter(Boolean)
      : [];
  const classNames = new Set(className);
  const cleanAlt = alt
    .replace(filterOptOutPattern, " ")
    .replace(lightboxOptOutPattern, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  const cleanTitle = title
    .replace(filterOptOutPattern, " ")
    .replace(lightboxOptOutPattern, " ")
    .replace(titleTokenPattern, " ")
    .replace(lightboxTitleTokenPattern, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  image.properties = {
    ...properties,
    alt: cleanAlt
  };

  if (hasAltMarker || hasTitleMarker) {
    classNames.add("no-dark-filter");
    image.properties.dataThemeSafe = "true";
  }

  if (hasLightboxAltMarker || hasLightboxTitleMarker) {
    classNames.add("no-lightbox");
    image.properties["data-lightbox"] = "false";
    image.properties.dataLightbox = "false";
  }

  if (classNames.size > 0) {
    image.properties.className = [...classNames];
  }

  if (cleanTitle) {
    image.properties.title = cleanTitle;
  } else {
    delete image.properties.title;
  }
}

export function rehypeImageFlags() {
  return (tree) => {
    visit(tree, { captionIndex: 0 });
  };
}
