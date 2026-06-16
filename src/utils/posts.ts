import type { CollectionEntry } from "astro:content";

export const SITE_TITLE = "devjune.dev";
export const SITE_DESCRIPTION = "Java/Spring 백엔드 개발자 오지훈의 학습과 프로젝트 개선 기록";
export const SITE_AUTHOR = "오지훈";
export const SITE_URL = "https://guseoh.dev";
export const SITE_OG_IMAGE = "/og-image.svg";
export const GITHUB_URL = "https://github.com/guseoh";
export const HOME_POST_LIMIT = 5;
export const POSTS_PER_PAGE = 12;
export const SIDEBAR_TAG_LIMIT = 16;
export const DETAIL_TAG_LIMIT = 8;

export const CORE_TECH_TAGS = [
  "Spring Boot",
  "JPA",
  "QueryDSL",
  "MySQL",
  "Docker",
  "GitHub Actions",
  "AWS EC2",
  "Monitoring"
];

export function sortPostsByDate(posts: CollectionEntry<"blog">[]) {
  return [...posts].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function formatPostDate(date: Date) {
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

export function getPostDescription(post: CollectionEntry<"blog">) {
  const description = post.data.description?.trim();
  return description && description.length > 0
    ? description
    : "학습 과정과 구현 맥락을 정리한 기록입니다.";
}

export function getReadingTime(post: CollectionEntry<"blog">) {
  const source = post.body ?? "";
  const codeBlocks = source.match(/```[\s\S]*?```/g) ?? [];
  const codeWeightedWords = codeBlocks.reduce((total, block) => total + block.length / 220, 0);
  const plainText = source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ");
  const latinWords = plainText.match(/[A-Za-z0-9_]+/g)?.length ?? 0;
  const koreanCharacters = plainText.match(/[\u3131-\u318E\uAC00-\uD7A3]/g)?.length ?? 0;
  const cjkCharacters = plainText.match(/[\u3040-\u30ff\u3400-\u9fff]/g)?.length ?? 0;
  const estimatedWords = latinWords + koreanCharacters / 3.1 + cjkCharacters / 2.4 + codeWeightedWords;
  const minutes = Math.max(1, Math.ceil(estimatedWords / 240));

  return `${minutes}분 읽기`;
}

