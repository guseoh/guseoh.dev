import type { CollectionEntry } from "astro:content";

const SERIES_CONTINUATION_MESSAGES = new Map([
  ["board-프로젝트-성능-개선", "다음 성능 개선 기록이 발행되면 이 시리즈 목록에 이어서 연결됩니다."],
  ["board-프로젝트-개선-기록", "다음 성능 개선 기록이 발행되면 이 시리즈 목록에 이어서 연결됩니다."],
  ["data-structure", "다음 자료구조 학습 기록이 발행되면 이 시리즈 목록에 이어서 연결됩니다."],
  ["아주-쉬운-세가지-이야기", "다음 운영체제 학습 기록이 발행되면 이 시리즈 목록에 이어서 연결됩니다."]
]);

export type SeriesSummary = {
  slug: string;
  name: string;
  count: number;
  latestDate: Date;
  posts: CollectionEntry<"blog">[];
};

export function normalizeSeriesName(seriesName: string) {
  return seriesName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

export function getSeriesContinuationMessage(seriesName: string) {
  const normalizedName = normalizeSeriesName(seriesName);
  const metadataMessage = SERIES_CONTINUATION_MESSAGES.get(normalizedName);

  if (metadataMessage) return metadataMessage;

  return `다음 ${seriesName} 기록이 발행되면 이 시리즈 목록에 이어서 연결됩니다.`;
}

export function buildSeriesSummary(posts: CollectionEntry<"blog">[]): SeriesSummary[] {
  const seriesMap = new Map<string, SeriesSummary>();

  for (const post of posts) {
    const name = post.data.series?.trim();
    if (!name) continue;

    const slug = normalizeSeriesName(name);
    const entry = seriesMap.get(slug);

    if (entry) {
      entry.posts.push(post);
      entry.count += 1;
      if (post.data.date > entry.latestDate) {
        entry.latestDate = post.data.date;
      }
      continue;
    }

    seriesMap.set(slug, {
      slug,
      name,
      count: 1,
      latestDate: post.data.date,
      posts: [post]
    });
  }

  return Array.from(seriesMap.values())
    .map((series) => ({
      ...series,
      posts: [...series.posts].sort((a, b) => {
        const orderA = a.data.seriesOrder ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.data.seriesOrder ?? Number.MAX_SAFE_INTEGER;

        if (orderA !== orderB) return orderA - orderB;
        return b.data.date.valueOf() - a.data.date.valueOf();
      })
    }))
    .sort((a, b) => {
      if (a.latestDate.valueOf() !== b.latestDate.valueOf()) {
        return b.latestDate.valueOf() - a.latestDate.valueOf();
      }

      return a.name.localeCompare(b.name, "ko");
    });
}
