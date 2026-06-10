import type { CollectionEntry } from "astro:content";
import seriesMetadata from "../data/series.json";
import { getCategoryName } from "./categories";

export type SeriesStatus = "planned" | "ongoing" | "completed";

export type SeriesMetadata = {
  slug: string;
  title: string;
  description: string;
  order: number;
  status: SeriesStatus;
  featured: boolean;
};

export type SeriesSummary = {
  slug: string;
  name: string;
  description: string;
  order: number;
  status: SeriesStatus;
  featured: boolean;
  count: number;
  latestDate: Date;
  category: string;
  posts: CollectionEntry<"blog">[];
};

const SERIES_METADATA = new Map((seriesMetadata as SeriesMetadata[]).map((metadata) => [metadata.slug, metadata]));

function getPostActivityDate(post: CollectionEntry<"blog">) {
  return post.data.updated ?? post.data.date;
}

function getRepresentativeCategory(posts: CollectionEntry<"blog">[]) {
  const counts = new Map<string, number>();

  for (const post of posts) {
    const category = getCategoryName(post);
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko"))[0]?.[0] ?? "Uncategorized";
}

export function normalizeSeriesName(seriesName: string) {
  return seriesName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

export function getSeriesContinuationMessage(seriesName: string) {
  const normalizedName = normalizeSeriesName(seriesName);
  const metadata = SERIES_METADATA.get(normalizedName);

  if (metadata) {
    return `${metadata.description} 다음 글이 발행되면 이 시리즈에 이어서 연결됩니다.`;
  }

  return `다음 ${seriesName} 기록이 발행되면 이 시리즈 목록에 이어서 연결됩니다.`;
}

export function getSeriesMetadata(seriesName: string): SeriesMetadata | undefined {
  return SERIES_METADATA.get(normalizeSeriesName(seriesName));
}

export function buildSeriesSummary(posts: CollectionEntry<"blog">[]): SeriesSummary[] {
  const seriesMap = new Map<string, SeriesSummary>();

  for (const post of posts) {
    const name = post.data.series?.trim();
    if (!name) continue;

    const slug = normalizeSeriesName(name);
    const metadata = SERIES_METADATA.get(slug);
    const entry = seriesMap.get(slug);

    if (entry) {
      entry.posts.push(post);
      entry.count += 1;
      if (getPostActivityDate(post) > entry.latestDate) {
        entry.latestDate = getPostActivityDate(post);
      }
      continue;
    }

    seriesMap.set(slug, {
      slug,
      name: metadata?.title ?? name,
      description: metadata?.description ?? `${name} 시리즈 글을 모아둔 목록입니다.`,
      order: metadata?.order ?? Number.MAX_SAFE_INTEGER,
      status: metadata?.status ?? "ongoing",
      featured: metadata?.featured ?? false,
      count: 1,
      latestDate: getPostActivityDate(post),
      category: getCategoryName(post),
      posts: [post]
    });
  }

  return Array.from(seriesMap.values())
    .map((series) => ({
      ...series,
      category: getRepresentativeCategory(series.posts),
      posts: [...series.posts].sort((a, b) => {
        const orderA = a.data.seriesOrder ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.data.seriesOrder ?? Number.MAX_SAFE_INTEGER;

        if (orderA !== orderB) return orderA - orderB;
        return b.data.date.valueOf() - a.data.date.valueOf();
      })
    }))
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      if (a.latestDate.valueOf() !== b.latestDate.valueOf()) {
        return b.latestDate.valueOf() - a.latestDate.valueOf();
      }

      return a.name.localeCompare(b.name, "ko");
    });
}
