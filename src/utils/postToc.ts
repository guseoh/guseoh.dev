export type RenderedHeading = {
  depth: number;
  slug: string;
  text: string;
};

export function buildPostTocHeadings(headings: RenderedHeading[], postTitle: string) {
  return headings
    .filter((heading) => heading.depth >= 1 && heading.depth <= 3)
    .filter((heading) => !(heading.depth === 1 && heading.text.trim() === postTitle.trim()))
    .map((heading) => ({
      ...heading,
      depth: heading.depth === 1 ? 2 : heading.depth
    }));
}
