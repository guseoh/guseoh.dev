import type { CollectionEntry } from "astro:content";
import { normalizeTag } from "./tags";

export type CategorySummary = {
  slug: string;
  name: string;
  count: number;
};

type CategoryTreeChildConfig = {
  name: string;
  slug: string;
  matchTags?: string[];
  matchCategories?: string[];
  titleIncludes?: string[];
};

type CategoryTreeGroupConfig = {
  name: string;
  slug: string;
  children: CategoryTreeChildConfig[];
};

export type CategoryTreeChild = {
  name: string;
  slug: string;
  href: string;
  count: number;
};

export type CategoryTreeGroup = {
  name: string;
  slug: string;
  href?: string;
  count: number;
  children: CategoryTreeChild[];
};

export const RECOMMENDED_CATEGORIES = [
  "Project",
  "OS",
  "Spring",
  "JPA",
  "QueryDSL",
  "Database",
  "Docker",
  "DevOps",
  "Security",
  "Git",
  "Troubleshooting"
];

const RECOMMENDED_CATEGORY_SLUGS = RECOMMENDED_CATEGORIES.map((category) => normalizeCategory(category));

export const CATEGORY_TREE: CategoryTreeGroupConfig[] = [
  {
    name: "Project",
    slug: "project",
    children: [
      { name: "Board", slug: "board", matchTags: ["board"], titleIncludes: ["board"] },
      { name: "Blog", slug: "blog", matchTags: ["blog"], matchCategories: ["blog"], titleIncludes: ["blog"] }
    ]
  },
  {
    name: "OS",
    slug: "os",
    children: []
  },
  {
    name: "Spring",
    slug: "spring",
    children: [
      { name: "Spring Boot", slug: "spring-boot", matchTags: ["spring-boot"] },
      { name: "Spring Security", slug: "spring-security", matchTags: ["spring-security"] },
      { name: "OAuth2", slug: "oauth2", matchTags: ["oauth2"] },
      { name: "JPA", slug: "jpa", matchTags: ["jpa"] },
      { name: "QueryDSL", slug: "querydsl", matchTags: ["querydsl"] }
    ]
  },
  {
    name: "Database",
    slug: "database",
    children: [
      { name: "MySQL", slug: "mysql", matchTags: ["mysql"] },
      { name: "MariaDB", slug: "mariadb", matchTags: ["mariadb"] },
      { name: "SQL", slug: "sql", matchTags: ["sql", "database"] },
      { name: "Redis", slug: "redis", matchTags: ["redis"] }
    ]
  },
  {
    name: "DevOps",
    slug: "devops",
    children: [
      { name: "Docker", slug: "docker", matchTags: ["docker"] },
      { name: "GitHub Actions", slug: "github-actions", matchTags: ["github-actions"] },
      { name: "AWS EC2", slug: "aws-ec2", matchTags: ["aws-ec2"] },
      { name: "Monitoring", slug: "monitoring", matchTags: ["monitoring", "actuator", "p6spy"] }
    ]
  },
  {
    name: "Security",
    slug: "security",
    children: [
      { name: "Git Security", slug: "git-security", matchTags: ["git-security"] },
      { name: "Secret Management", slug: "secret-management", matchTags: ["secret-management"] },
      { name: "Supply Chain", slug: "supply-chain", matchTags: ["supply-chain"] }
    ]
  },
  {
    name: "Git",
    slug: "git",
    children: [
      { name: "Branch", slug: "branch-strategy", matchTags: ["branch-strategy"] },
      { name: "GitHub", slug: "github", matchTags: ["github", "github-actions"] },
      { name: "Troubleshooting", slug: "git-troubleshooting", matchTags: ["git-troubleshooting"] }
    ]
  },
  {
    name: "Algorithm",
    slug: "algorithm",
    children: [
      { name: "BOJ", slug: "boj", matchTags: ["boj"] },
      { name: "Programmers", slug: "programmers", matchTags: ["programmers"] }
    ]
  },
  {
    name: "Troubleshooting",
    slug: "troubleshooting",
    children: [
      { name: "Spring Error", slug: "spring-error", matchTags: ["spring-error"] },
      { name: "Docker Error", slug: "docker-error", matchTags: ["docker-error"] },
      { name: "Database Error", slug: "database-error", matchTags: ["database-error"] }
    ]
  }
];

export function normalizeCategory(category: string): string {
  return category
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

export function getCategoryName(post: CollectionEntry<"blog">): string {
  const raw = post.data.category?.trim();
  return raw && raw.length > 0 ? raw : "미분류";
}

export function getCategorySlug(post: CollectionEntry<"blog">): string {
  return normalizeCategory(getCategoryName(post));
}

export function buildCategorySummary(posts: CollectionEntry<"blog">[]): CategorySummary[] {
  const counts = new Map<string, CategorySummary>();

  for (const post of posts) {
    const name = getCategoryName(post);
    const slug = normalizeCategory(name);
    const entry = counts.get(slug);

    if (entry) {
      entry.count += 1;
      continue;
    }

    counts.set(slug, { slug, name, count: 1 });
  }

  return Array.from(counts.values()).sort((a, b) => {
    const orderA = RECOMMENDED_CATEGORY_SLUGS.indexOf(a.slug);
    const orderB = RECOMMENDED_CATEGORY_SLUGS.indexOf(b.slug);
    const rankA = orderA === -1 ? Number.MAX_SAFE_INTEGER : orderA;
    const rankB = orderB === -1 ? Number.MAX_SAFE_INTEGER : orderB;

    if (rankA !== rankB) return rankA - rankB;
    return a.name.localeCompare(b.name, "ko");
  });
}

export function filterPostsByCategory(posts: CollectionEntry<"blog">[], categorySlug: string) {
  return posts.filter((post) => getCategorySlug(post) === categorySlug);
}

function postMatchesChild(post: CollectionEntry<"blog">, child: CategoryTreeChildConfig) {
  const categorySlug = getCategorySlug(post);
  const tagSlugs = post.data.tags.map((tag) => normalizeTag(tag));
  const lowerTitle = post.data.title.toLowerCase();

  return (
    child.matchCategories?.some((slug) => categorySlug === slug) ||
    child.matchTags?.some((slug) => tagSlugs.includes(slug)) ||
    child.titleIncludes?.some((keyword) => lowerTitle.includes(keyword.toLowerCase())) ||
    false
  );
}

export function buildCategoryHierarchy(posts: CollectionEntry<"blog">[]): CategoryTreeGroup[] {
  const categorySummary = buildCategorySummary(posts);
  const configuredGroupSlugs = new Set(CATEGORY_TREE.map((group) => group.slug));

  const configuredGroups = CATEGORY_TREE.map((group) => {
    const groupPostIds = new Set<string>();
    const directCategoryCount = posts.filter((post) => getCategorySlug(post) === group.slug).length;

    const children = group.children
      .map((child) => {
        const matchingPosts = posts.filter((post) => postMatchesChild(post, child));

        for (const post of matchingPosts) {
          groupPostIds.add(post.id);
        }

        return {
          name: child.name,
          slug: child.slug,
          href: `/tags/${child.slug}/`,
          count: matchingPosts.length
        };
      })
      .filter((child) => child.count > 0);

    for (const post of posts) {
      if (getCategorySlug(post) === group.slug) {
        groupPostIds.add(post.id);
      }
    }

    return {
      name: group.name,
      slug: group.slug,
      href: directCategoryCount > 0 ? `/categories/${group.slug}/` : undefined,
      count: groupPostIds.size,
      children
    };
  }).filter((group) => group.count > 0 || group.children.length > 0);

  const dynamicCategoryGroups = categorySummary
    .filter(({ slug }) => !configuredGroupSlugs.has(slug))
    .map(({ slug, name, count }) => ({
      name,
      slug,
      href: `/categories/${slug}/`,
      count,
      children: []
    }));

  return [...configuredGroups, ...dynamicCategoryGroups];
}

