# devjune.dev

Java/Spring 백엔드 개발자 오지훈의 GitHub Pages 포트폴리오 블로그입니다. Board 프로젝트를 중심으로 Spring Boot, JPA, QueryDSL, Docker, CI/CD, 성능 개선, OS/CS 학습 기록을 정리합니다.

## 사용 기술

- Astro 6
- Astro Content Collections + Markdown
- TypeScript
- `@astrojs/rss`
- GitHub Actions
- GitHub Pages

## 주요 기능

- 홈: 블로그 활동 잔디, GitHub contributions, 대표 프로젝트 CTA, 최근 글, 주요 카테고리
- 글 목록: 페이지네이션, 그리드/리스트 보기 전환
- 글 상세: 메타데이터, 태그, TOC, 코드블록 언어 라벨, Copy 버튼, 이전/다음 글
- 검색: `/search-index.json` 기반 검색, 카테고리/태그 필터, 결과 수 표시
- SEO: canonical, Open Graph, Twitter Card, RSS, 수동 sitemap
- UX: 라이트/다크 모드, 사이드바 접힘 상태 저장, 모바일 대응

## 로컬 실행

```bash
npm ci
npm run dev
```

빌드와 preview:

```bash
npm run check
npm run build
npm run preview
```

배포 URL 또는 로컬 preview smoke test:

```bash
npm run smoke
SMOKE_BASE_URL=https://guseoh.github.io npm run smoke
```

## 새 글 작성 규칙

새 글은 `src/content/blog` 아래에 Markdown 파일로 추가합니다. 파일명은 URL slug가 되므로 소문자, 숫자, 하이픈 또는 기존 분류 규칙에 맞춘 이름을 권장합니다.

```yaml
---
title: "[Board 프로젝트] 게시글 상세 조회 성능 개선"
description: "측정 결과를 바탕으로 N+1 조회를 줄이고 응답 시간을 개선한 기록"
date: 2026-05-25
updated: 2026-05-25
category: Board
tags: ["Board", "Spring Boot", "JPA", "QueryDSL", "Performance"]
series: "Board 프로젝트 성능 개선"
seriesOrder: 2
heroImage: "/og-image.svg"
draft: true
---
```

- `title`은 상세 글 페이지의 유일한 `h1`로 렌더링합니다.
- 본문 heading은 SEO와 접근성을 위해 `##`부터 시작합니다.
- `description`은 목록, RSS, 검색 인덱스, SEO 설명에 사용하므로 문제와 개선 결과가 드러나게 작성합니다.
- `draft: true`인 글은 목록, RSS, sitemap, 검색 인덱스, 상세 페이지 생성에서 제외됩니다.

### 새 글 작성 순서

1. `src/content/blog/_template.md`를 복사해 글 성격에 맞는 폴더와 파일명으로 저장합니다.
2. `category`는 글의 큰 소속 하나만 선택합니다.
3. `tags`는 기술, 주제, 글 성격을 나타내는 값 3~7개 정도를 작성합니다.
4. 연재 글이면 `series`, `seriesOrder`를 작성하고 단독 글이면 해당 필드를 삭제합니다.
5. 본문에서는 `#`을 사용하지 않고 `##`부터 heading을 시작합니다.
6. 작성 중에는 `draft: true`를 유지하고 발행 전에 false로 변경하거나 필드를 삭제합니다.
7. 발행 전 `npm run check`와 `npm run build`를 실행합니다.

## 분류 운영 규칙

- `Board`: Board 프로젝트 전용 카테고리입니다. Board 구현, 성능, 화면 전환, 운영 기록은 이 카테고리를 우선 사용합니다.
- `Project`: 여러 프로젝트를 묶는 상위 운영 개념입니다. 현재는 Board를 포트폴리오 중심 프로젝트로 우선 노출합니다.
- 기술 태그: Java, Spring, Spring Boot, JPA, SQL, Actuator처럼 구현 기술을 나타냅니다.
- 주제 태그: Performance, Monitoring, Refactoring, Deployment처럼 개선 주제를 나타냅니다.
- 글 성격 태그: Project, Troubleshooting, Review처럼 글의 성격을 나타냅니다.
- 태그 표시명과 타입은 `src/data/tags.json`에서 관리합니다.
- 왼쪽 사이드바의 대분류/중분류 탐색은 `src/data/navigation.json`에서 관리합니다.
- 메인 Topic Index와 왼쪽 사이드바는 동일한 `src/data/navigation.json`을 사용합니다.
- 대분류는 Project, Backend, CS, DevOps 같은 탐색 묶음이고, 클릭 시 `/search/?group=...`로 해당 묶음의 글 목록을 보여줍니다.
- 중분류의 `type`은 `category`, `tag`, `series`, `search`, `url`을 지원합니다. 실제 글이 아직 없는 항목은 `planned: true`로 표시하고 링크를 만들지 않습니다.
- 중분류는 실제 category, tag, series URL로 연결합니다. 예를 들어 Board는 `/categories/board/`, JPA는 `/tags/jpa/`로 이동합니다.
- Board 글에는 `category: Board`를 쓰고, Spring/JPA/Performance/P6Spy 같은 세부 기술과 주제는 `tags`에 작성합니다.

## 시리즈 운영 규칙

- 글 frontmatter의 `series`와 `seriesOrder`는 글 연결 순서를 담당합니다.
- 시리즈 제목, 설명, 노출 순서, 상태, featured 여부는 `src/data/series.json`에서 관리합니다.
- 상태 값은 `planned`, `ongoing`, `completed` 중 하나를 사용합니다.
- `/series/`는 전체 시리즈 탐색, `/series/[series]/`는 개별 시리즈 글 목록 역할을 합니다.

## 검색 페이지 역할

- `/blog/`: 전체 글 목록과 페이지네이션
- `/search/`: 키워드 검색과 카테고리/태그 필터
- `/categories/`: 큰 주제별 탐색
- `/tags/`: 기술/주제/글 성격 태그별 탐색
- `/series/`: 연재 흐름 중심 탐색

검색 데이터는 `src/pages/search-index.json.ts`가 생성하는 `/search-index.json`을 사용합니다. 초기 `/search/` HTML에는 모든 글 카드를 렌더링하지 않고, 클라이언트에서 인덱스를 가져와 결과만 렌더링합니다.

## Sitemap 전략

공식 sitemap은 수동으로 생성하는 `/sitemap.xml`입니다. `src/pages/sitemap.xml.ts`에서 정적 페이지, 개별 글, 카테고리, 태그, 시리즈 페이지를 한 번에 생성합니다.

- `public/robots.txt`는 `https://guseoh.github.io/sitemap.xml`을 가리킵니다.
- `@astrojs/sitemap`은 사용하지 않으므로 `/sitemap-index.xml`, `/sitemap-0.xml`은 공식 sitemap이 아닙니다.
- 배포 후 검색 엔진 제출과 robots 확인은 `/sitemap.xml` 기준으로 진행합니다.

## 메타데이터와 공유 이미지

- 글별 `heroImage`가 있으면 상세 글의 OG/Twitter 이미지로 우선 사용합니다.
- `heroImage`가 없으면 `public/og-image.svg`를 fallback으로 사용합니다.
- 읽는 시간은 한국어/영문/CJK 텍스트와 코드블록 가중치를 함께 반영해 추정합니다.

## GitHub Contributions Fallback

GitHub Activity 잔디의 갱신 방식, 자동화 범위, fallback 정책은 `docs/github-activity-report.md`에 정리되어 있습니다.

`npm run github:contributions`는 GitHub GraphQL API 또는 공개 contribution HTML을 기반으로 `public/data/github-contributions.json`을 갱신합니다.

- `.github/workflows/update-github-activity.yml`은 매일 15:10 UTC, 즉 다음 날 00:10 KST에 자동 실행됩니다.
- Actions 탭의 `Update GitHub Activity` workflow에서 `Run workflow`를 선택하면 수동 갱신할 수 있습니다.
- `GH_CONTRIBUTIONS_TOKEN` secret이 있으면 GraphQL API를 우선 사용하며, secret이 없어도 공개 contribution HTML fallback으로 동작합니다.
- 같은 날짜와 contribution 데이터가 이미 저장되어 있으면 JSON을 다시 쓰지 않고 자동 커밋도 생성하지 않습니다.
- JSON이 변경되면 bot 커밋을 push한 뒤 기존 `deploy.yml`을 수동 dispatch해 배포 사이트에도 반영합니다.
- API와 공개 HTML fetch가 모두 실패하면 기존 JSON이 있을 때 기존 데이터를 유지합니다.
- 기존 JSON도 없으면 빈 contribution 데이터를 생성해 빌드를 계속 진행합니다.
- UI는 `empty` 데이터 출처일 때 fallback 안내 문구를 표시합니다.
- `DISCORD_WEBHOOK_URL` repository secret을 설정하면 변경, 무변경, fallback, 갱신 장애, 배포 dispatch 실패 상태를 Discord로 알립니다.
- Discord secret이 없거나 webhook 전송이 실패해도 workflow는 계속 진행하지만, 실제 데이터 갱신 장애와 배포 dispatch 실패는 workflow 실패로 표시합니다.
- 갱신 결과의 데이터 출처와 상태는 매 실행마다 GitHub Actions Summary에 기록됩니다.

## 배포와 Smoke Test

`main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 실행됩니다.

1. Node 22 설정
2. `npm ci`
3. `npm run github:contributions`
4. `npm run build`
5. `dist`를 GitHub Pages artifact로 업로드
6. GitHub Pages 배포
7. 배포 URL 기준 `npm run smoke` 실행

Smoke test 기본 확인 URL:

- `/`
- `/blog/`
- `/categories/`
- `/tags/`
- `/series/`
- `/search/`
- `/rss.xml`
- `/sitemap.xml`

배포 사이트: https://guseoh.github.io/

## 배포 후 확인 체크리스트

- `/`
- `/blog/`
- `/blog/board/react01/`
- `/rss.xml`
- `/sitemap.xml`
- `/search/`
- `/search/?q=Board`
- `/categories/`
- `/tags/`
- `/series/`
- 개별 카테고리, 태그, 시리즈 페이지

## 폴더 구조

```text
src/
  components/
    home/       홈 화면 섹션
    layout/     Header, Sidebar, ThemeToggle, client scripts
    post/       상세 글 TOC와 코드블록 enhancement
  content/blog/ Markdown 글 데이터
  data/         navigation, series, tags 운영 메타데이터
  layouts/      BaseLayout
  pages/        Astro 라우트
  styles/       base, theme, layout, components, home, post CSS
  utils/        posts, categories, tags, series, search 유틸
public/
  data/github-contributions.json
  og-image.svg
  robots.txt
scripts/
  fetch-github-contributions.mjs
  notify-discord.mjs
  smoke-test.mjs
.github/workflows/
  deploy.yml
  update-github-activity.yml
```
