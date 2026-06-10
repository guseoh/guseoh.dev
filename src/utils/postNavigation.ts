import type { CollectionEntry } from "astro:content";
import { resolveSeriesId } from "./series";

export function getAdjacentPosts(posts: CollectionEntry<"blog">[], currentPostId: string) {
  const currentIndex = posts.findIndex((entry) => entry.id === currentPostId);

  return {
    newerPost: currentIndex > 0 ? posts[currentIndex - 1] : undefined,
    olderPost: currentIndex >= 0 && currentIndex < posts.length - 1 ? posts[currentIndex + 1] : undefined
  };
}

export function getSeriesPosts(posts: CollectionEntry<"blog">[], seriesName?: string) {
  const normalizedSeriesName = seriesName?.trim();
  if (!normalizedSeriesName) return [];
  const seriesId = resolveSeriesId(normalizedSeriesName);

  return posts
    .filter((entry) => {
      const entrySeries = entry.data.series?.trim();
      return entrySeries ? resolveSeriesId(entrySeries) === seriesId : false;
    })
    .sort((a, b) => {
      const orderA = a.data.chapter ?? a.data.seriesOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.data.chapter ?? b.data.seriesOrder ?? Number.MAX_SAFE_INTEGER;

      if (orderA !== orderB) return orderA - orderB;
      return b.data.date.valueOf() - a.data.date.valueOf();
    });
}
