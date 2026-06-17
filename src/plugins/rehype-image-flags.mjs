const filterOptOutPattern = /\s*\{(?:no-dark-filter|theme-safe|data-theme-safe)\}\s*/gi;
const titleTokenPattern = /(?:^|\s)(?:no-dark-filter|theme-safe|data-theme-safe)(?=\s|$)/gi;

function visit(node) {
  if (!Array.isArray(node?.children)) return;

  for (const child of node.children) {
    if (child?.type === "element" && child.tagName === "img") {
      applyImageFlags(child);
    }

    visit(child);
  }
}

function applyImageFlags(image) {
  const properties = image.properties ?? {};
  const alt = typeof properties.alt === "string" ? properties.alt : "";
  const title = typeof properties.title === "string" ? properties.title : "";
  const hasAltMarker = filterOptOutPattern.test(alt);
  filterOptOutPattern.lastIndex = 0;
  const hasTitleMarker = filterOptOutPattern.test(title) || titleTokenPattern.test(title);
  filterOptOutPattern.lastIndex = 0;
  titleTokenPattern.lastIndex = 0;

  if (!hasAltMarker && !hasTitleMarker) return;

  const className = Array.isArray(properties.className)
    ? properties.className
    : typeof properties.className === "string"
      ? properties.className.split(/\s+/).filter(Boolean)
      : [];
  const cleanAlt = alt.replace(filterOptOutPattern, " ").replace(/\s{2,}/g, " ").trim();
  const cleanTitle = title
    .replace(filterOptOutPattern, " ")
    .replace(titleTokenPattern, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  image.properties = {
    ...properties,
    alt: cleanAlt,
    className: [...new Set([...className, "no-dark-filter"])],
    dataThemeSafe: "true"
  };

  if (cleanTitle) {
    image.properties.title = cleanTitle;
  } else {
    delete image.properties.title;
  }
}

export function rehypeImageFlags() {
  return (tree) => {
    visit(tree);
  };
}
