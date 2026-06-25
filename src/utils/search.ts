import type { CollectionEntry } from "astro:content";
import { getPostDescription, getPostPath, getPostSlug, getReadingTime } from "./posts";

export type SearchIndexItem = {
  title: string;
  description: string;
  category: string;
  tags: string[];
  series: string;
  date: string;
  slug: string;
  url: string;
  readingTime: string;
  excerpt: string;
  searchText: string;
};

export type SearchMatch = {
  score: number;
  reasons: string[];
};

const MAX_EXCERPT_LENGTH = 280;

export function buildSearchIndex(posts: CollectionEntry<"blog">[]): SearchIndexItem[] {
  return posts.map((post) => {
    const description = getPostDescription(post);
    const category = post.data.category?.trim() || "Uncategorized";
    const series = post.data.series?.trim() || "";
    const contentText = stripMarkdown(post.body ?? "");
    const excerpt = truncateText(contentText || description, MAX_EXCERPT_LENGTH);
    const searchText = [
      post.data.title,
      description,
      category,
      series,
      ...post.data.tags,
      excerpt,
      contentText
    ]
      .join(" ")
      .toLowerCase();

    return {
      title: post.data.title,
      description,
      category,
      tags: post.data.tags,
      series,
      date: post.data.date.toISOString(),
      slug: getPostSlug(post),
      url: getPostPath(post),
      readingTime: getReadingTime(post),
      excerpt,
      searchText
    };
  });
}

export function normalizeSearchText(value: string) {
  return value.trim().toLowerCase();
}

export function scoreSearchItem(post: SearchIndexItem, rawQuery: string): SearchMatch {
  const query = normalizeSearchText(rawQuery);
  if (!query) return { score: 0, reasons: [] };

  const reasons: string[] = [];
  let score = 0;
  const title = normalizeSearchText(post.title);
  const description = normalizeSearchText(post.description || post.excerpt);
  const category = normalizeSearchText(post.category);
  const series = normalizeSearchText(post.series);
  const tags = post.tags.map((tag) => ({ raw: tag, value: normalizeSearchText(tag) }));

  if (title === query) {
    score += 1000;
    reasons.push("제목이 정확히 일치");
  } else if (title.includes(query)) {
    score += 650;
    reasons.push("제목에서 일치");
  }

  const matchedTags = tags.filter((tag) => tag.value.includes(query));
  if (matchedTags.length > 0) {
    score += 420 + matchedTags.length * 20;
    reasons.push(`태그 ${matchedTags.map((tag) => tag.raw).join(", ")}에서 일치`);
  }

  if (category.includes(query)) {
    score += 320;
    reasons.push(`카테고리 ${post.category}에서 일치`);
  }

  if (series && series.includes(query)) {
    score += 260;
    reasons.push("시리즈에서 일치");
  }

  if (description.includes(query)) {
    score += 160;
    reasons.push("설명에서 일치");
  }

  if (post.searchText.includes(query)) {
    score += 40;
    if (reasons.length === 0) {
      reasons.push("본문에서 일치");
    }
  }

  return { score, reasons };
}

export function sortSearchResults(posts: SearchIndexItem[], query: string) {
  const normalizedQuery = normalizeSearchText(query);
  const scored = posts
    .map((post) => ({ post, match: scoreSearchItem(post, normalizedQuery) }))
    .filter(({ match }) => !normalizedQuery || match.score > 0)
    .sort((a, b) => {
      if (b.match.score !== a.match.score) return b.match.score - a.match.score;
      return new Date(b.post.date).valueOf() - new Date(a.post.date).valueOf();
    });

  return scored;
}

function stripMarkdown(source: string) {
  return source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/^#{1,6}\s+/gm, " ")
    .replace(/^>\s?/gm, " ")
    .replace(/[*_~`>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;

  return `${value.slice(0, maxLength).trim()}...`;
}
