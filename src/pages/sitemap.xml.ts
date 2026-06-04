import { getCollection } from "astro:content";
import { buildCategorySummary } from "../utils/categories";
import { buildSeriesSummary } from "../utils/series";
import { buildTagSummary } from "../utils/tags";
import { POSTS_PER_PAGE, SITE_URL, sortPostsByDate } from "../utils/posts";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export async function GET() {
  const posts = sortPostsByDate(await getCollection("blog", ({ data }) => !data.draft));
  const categories = buildCategorySummary(posts);
  const series = buildSeriesSummary(posts);
  const tags = buildTagSummary(posts);
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

  const staticPaths = ["/", "/about/", "/blog/", "/categories/", "/tags/", "/series/", "/search/"];
  const pagePaths = totalPages > 1
    ? Array.from({ length: totalPages - 1 }, (_, index) => `/blog/page/${index + 2}/`)
    : [];
  const postPaths = posts.map((post) => `/blog/${post.id}/`);
  const categoryPaths = categories.map((category) => `/categories/${category.slug}/`);
  const tagPaths = tags.map((tag) => `/tags/${tag.tag}/`);
  const seriesPaths = series.map((entry) => `/series/${entry.slug}/`);
  const today = new Date().toISOString().slice(0, 10);

  const urls = [...staticPaths, ...pagePaths, ...postPaths, ...categoryPaths, ...tagPaths, ...seriesPaths]
    .map((path) => {
      const post = posts.find((entry) => path === `/blog/${entry.id}/`);
      const lastmod = post ? (post.data.updated ?? post.data.date).toISOString().slice(0, 10) : today;

      return [
        "  <url>",
        `    <loc>${escapeXml(buildUrl(path))}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        "  </url>"
      ].join("\n");
    })
    .join("\n");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
}

