import type { CollectionEntry } from "astro:content";
import { getPostDescription, getReadingTime } from "./posts";

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
      slug: post.id,
      url: `/blog/${post.id}/`,
      readingTime: getReadingTime(post),
      excerpt,
      searchText
    };
  });
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
