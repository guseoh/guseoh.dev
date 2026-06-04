import type { CollectionEntry } from "astro:content";
import tagMetadata from "../data/tags.json";

export type TagType = "tech" | "topic" | "post" | "project";

export type TagMetadata = {
  slug: string;
  name: string;
  type: TagType;
};

export function normalizeTag(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

const TAG_METADATA = new Map((tagMetadata as TagMetadata[]).map((metadata) => [metadata.slug, metadata]));

export type TagSummary = {
  tag: string;
  slug: string;
  name: string;
  type: TagType;
  count: number;
};

export function formatTagName(tag: string): string {
  const trimmed = tag.trim();
  const slug = normalizeTag(trimmed);
  const metadata = TAG_METADATA.get(slug);

  if (metadata) return metadata.name;
  if (trimmed.length > 0 && trimmed !== slug) return trimmed;

  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getTagType(tag: string): TagType {
  return TAG_METADATA.get(normalizeTag(tag))?.type ?? "topic";
}

export function buildTagSummary(posts: CollectionEntry<"blog">[]) {
  const counts = new Map<string, TagSummary>();

  for (const post of posts) {
    for (const rawTag of post.data.tags) {
      const tag = normalizeTag(rawTag);
      const entry = counts.get(tag);

      if (entry) {
        entry.count += 1;
        continue;
      }

      counts.set(tag, {
        tag,
        slug: tag,
        name: formatTagName(rawTag),
        type: getTagType(rawTag),
        count: 1
      });
    }
  }

  return Array.from(counts.values()).sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

