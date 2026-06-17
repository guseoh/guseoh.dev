const filterOptOutPattern = /\s*\{(?:no-dark-filter|theme-safe|data-theme-safe)\}\s*/gi;
const lightboxOptOutPattern = /\s*\{(?:no-lightbox|lightbox-false)\}\s*/gi;
const titleTokenPattern = /(?:^|\s)(?:no-dark-filter|theme-safe|data-theme-safe)(?=\s|$)/gi;
const lightboxTitleTokenPattern = /(?:^|\s)(?:no-lightbox|lightbox-false)(?=\s|$)/gi;

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
    visit(tree);
  };
}
