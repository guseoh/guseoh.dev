# GitHub Pages Personal Blog (Astro)

Personal blog project powered by Astro and deployed via GitHub Pages.

## Stack

- Astro
- Content Collections (Markdown)
- GitHub Actions + GitHub Pages
- RSS / Sitemap

## Routes

- `/`: home
- `/about`: developer profile
- `/blog`: blog list (page 1)
- `/blog/page/<page>`: paginated blog list
- `/blog/<slug>`: post detail
- `/categories`: category list
- `/categories/<category>`: posts by category
- `/tags`: tag list
- `/tags/<tag>`: posts by tag
- `/search`: search page
- `/rss.xml`: RSS feed

## Frontmatter

```yaml
---
title: "Post title"
description: "Post summary"
date: 2026-03-06
category: "Category name"        # optional, default: "미분류"
tags: ["Spring Boot", "JPA"]      # optional, default: []
updated: 2026-03-06               # optional
series: "Board 프로젝트 성능 개선" # optional
seriesOrder: 1                    # optional
draft: false                      # optional, default: false
heroImage: "/path/image"         # optional
---
```

## Board 프로젝트 글 작성 템플릿

Board 프로젝트 글은 문제를 먼저 작게 정의하고, 측정/원인/해결/비교가 이어지도록 작성합니다.

1. 문제 상황
2. 기존 코드 또는 구조
3. 원인 분석
4. 해결 방법
5. 개선 전/후 비교
6. 배운 점
7. 다음 개선 방향

권장 frontmatter:

```yaml
---
title: "[Board 프로젝트] 글 제목"
description: "문제와 개선 내용을 한 문장으로 요약"
date: 2026-05-18
updated: 2026-05-18
category: Project
tags: ["Spring Boot", "JPA", "QueryDSL"]
series: "Board 프로젝트 성능 개선"
seriesOrder: 1
featured: false
draft: true
---
```

## Local Development

```bash
npm ci
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Comments

- Public comments are handled by `utterances` and require GitHub sign-in.
