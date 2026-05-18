import type { CollectionEntry } from "astro:content";

export function normalizeTag(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

const TAG_LABELS: Record<string, string> = {
  actuator: "Actuator",
  "aws-ec2": "AWS EC2",
  "branch-strategy": "Branch Strategy",
  "ci-cd": "CI/CD",
  database: "Database",
  docker: "Docker",
  git: "Git",
  "github-actions": "GitHub Actions",
  java: "Java",
  jpa: "JPA",
  learning: "Learning",
  monitoring: "Monitoring",
  mysql: "MySQL",
  oauth2: "OAuth2",
  p6spy: "P6Spy",
  performance: "Performance",
  querydsl: "QueryDSL",
  security: "Security",
  "spring-boot": "Spring Boot",
  sql: "SQL",
  troubleshooting: "Troubleshooting"
};

export type TagSummary = {
  tag: string;
  slug: string;
  name: string;
  count: number;
};

export function formatTagName(tag: string): string {
  const trimmed = tag.trim();
  const slug = normalizeTag(trimmed);

  if (TAG_LABELS[slug]) return TAG_LABELS[slug];
  if (trimmed.length > 0 && trimmed !== slug) return trimmed;

  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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
        count: 1
      });
    }
  }

  return Array.from(counts.values()).sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

