export const SITE = {
  title: "devjune.dev",
  description: "Java/Spring 백엔드 개발자 오지훈의 학습과 프로젝트 개선 기록",
  author: "오지훈",
  siteUrl: "https://guseoh.github.io",
  githubUrl: "https://github.com/guseoh",
  repositoryUrl: "https://github.com/guseoh/guseoh.github.io",
  repositoryName: "guseoh/guseoh.github.io",
  defaultOgImage: "/og-image.svg",
  commentRepository: "guseoh/guseoh.github.io",
  locale: "ko_KR",
  language: "ko",
  githubActivityUsername: "guseoh"
} as const;

export const BLOG_LIMITS = {
  homePostLimit: 8,
  postsPerPage: 12,
  sidebarTagLimit: 16,
  detailTagLimit: 8,
  postStaleMonths: 12
} as const;

export const CORE_TECH_TAGS = [
  "Spring Boot",
  "JPA",
  "QueryDSL",
  "MySQL",
  "Docker",
  "GitHub Actions",
  "AWS EC2",
  "Monitoring"
] as const;
