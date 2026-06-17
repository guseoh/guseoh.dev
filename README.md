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
- Books: 사용자가 지정한 Book id 기준의 책장형 목록과 chapter 상세
- Series: metadata의 표시 제목을 사용하는 연재 목록과 읽기 순서
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
npm run content:check
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
lastVerified: 2026-05-25
category: Board
tags: ["Board", "Spring Boot", "JPA", "QueryDSL", "Performance"]
book: ""
series: "board-프로젝트-성능-개선"
chapter: 2
heroImage: "/og-image.svg"
draft: true
---
```

- `title`은 상세 글 페이지의 유일한 `h1`로 렌더링합니다.
- 본문 heading은 SEO와 접근성을 위해 `##`부터 시작합니다.
- `description`은 목록, RSS, 검색 인덱스, SEO 설명에 사용하므로 문제와 개선 결과가 드러나게 작성합니다.
- `date`는 최초 작성일, `updated`는 마지막 수정일입니다.
- `lastVerified`는 내용과 링크를 실제로 다시 확인한 날짜입니다. 확인하지 않았다면 생략합니다.
- `category`는 글 분류, `tags`는 검색과 필터용 키워드입니다.
- `book`은 `src/data/books.json`에 사용자가 직접 등록한 Book `id`입니다. Book에 포함하지 않으면 생략하거나 빈 값으로 둡니다.
- `series`는 `src/data/series.json`에 등록된 Series `id`입니다.
- `chapter`는 Book 또는 Series 내부 읽기 순서입니다.
- `draft: true`인 글은 목록, RSS, sitemap, 검색 인덱스, 상세 페이지 생성에서 제외됩니다.

### 새 글 작성 순서

1. `src/content/blog/_template.md`를 복사해 글 성격에 맞는 폴더와 파일명으로 저장합니다.
2. `category`는 글의 큰 소속 하나만 선택합니다.
3. `tags`는 기술, 주제, 글 성격을 나타내는 값 3~7개 정도를 작성합니다.
4. Book에 포함할 글이면 `book`, 연재 글이면 `series`를 metadata의 `id`로 작성합니다.
5. Book 또는 Series 내 순서가 필요하면 `chapter`를 작성합니다.
6. 본문에서는 `#`을 사용하지 않고 `##`부터 heading을 시작합니다.
7. 작성 중에는 `draft: true`를 유지하고 발행 전에 false로 변경하거나 필드를 삭제합니다.
8. 발행 전 `npm run content:check`, `npm run check`, `npm run build`를 실행합니다.

## Book 등록 가이드

### Book과 Category의 차이

- Category: 게시글의 주제 분류입니다. 글 하나에 하나의 category를 사용합니다.
- Book: 사용자가 직접 만드는 연속된 학습 묶음입니다. category와 독립적입니다.
- Series: 순서대로 이어 읽는 연재 묶음입니다. Book 포함 여부와 독립적입니다.
- 같은 category의 글을 서로 다른 Book에 넣을 수 있고, 서로 다른 category의 글을 하나의 Book으로 묶을 수도 있습니다.
- `book`이 없는 글은 `/books/`에서 제외하며 별도의 미분류 Book을 만들지 않습니다.
- Category, tags, navigation 주제를 기준으로 Book을 자동 생성하지 않습니다.

### Book 등록 방법

1. `src/data/books.json`을 엽니다.
2. 배열에 새 Book metadata를 추가합니다.
3. Book에 포함할 게시글 frontmatter의 `book`에 metadata의 `id`를 작성합니다.
4. 필요한 경우 `chapter`에 Book 내부 읽기 순서를 작성합니다.
5. `npm run check`와 `npm run build`를 실행한 뒤 `/books/`에서 결과를 확인합니다.

```json
[
  {
    "id": "spring-mvc-note",
    "title": "Spring MVC 학습 노트",
    "description": "Spring MVC와 REST API 응답 설계를 정리한 글 묶음",
    "topics": ["Spring MVC", "REST API"],
    "coverLabel": "SPRING MVC",
    "tone": "navy",
    "order": 10
  }
]
```

- `id`: 게시글과 연결되는 고유값입니다. 연결 후에는 가급적 변경하지 않습니다.
- `title`: `/books/`와 Book 상세 화면에 표시되는 제목입니다.
- `description`: Book 카드와 상세 화면에 표시되는 설명입니다.
- `topics`: Book 카드에 표시되는 주제 목록입니다.
- `coverLabel`: 표지 영역에 표시되는 짧은 문구입니다.
- `tone`: `navy`, `charcoal`, `blue`, `burgundy`, `forest` 중 하나를 사용합니다.
- `order`: `/books/`에서 Book이 표시되는 순서입니다.

### 게시글을 Book에 연결하는 방법

```yaml
---
title: "ResponseEntity란 무엇일까?"
description: "ResponseEntity의 개념과 사용 이유 정리"
date: 2026-06-11
updated: 2026-06-11
category: "Spring"
tags:
  - Spring
  - REST API
book: "spring-mvc-note"
series: "rest-api-design"
chapter: 2
heroImage: "/og-image.svg"
draft: false
---
```

게시글의 `book`에는 화면 제목이 아니라 `src/data/books.json`에 등록한 `id`를 작성합니다. Book 글 수와 최근 업데이트 날짜는 같은 `book` id를 가진 글의 `updated ?? date`를 기준으로 자동 계산합니다.

### Book 제목과 설명 수정 방법

화면에 보이는 이름만 바꾸려면 `src/data/books.json`의 `title`만 수정합니다. 설명은 `description`을 수정합니다. `id`는 게시글 frontmatter와 연결되는 값이므로 제목 변경만을 위해 바꾸지 않습니다.

등록되지 않은 `book` id는 content schema 검증에서 오류로 처리됩니다. `src/data/books.json`이 빈 배열이면 `/books/`에는 Book 카드 대신 등록 방법과 Posts/Series 이동 링크가 포함된 빈 상태 안내가 표시됩니다.

### 이미지 작성 규칙

Markdown 이미지는 게시글 파일을 기준으로 상대 경로를 사용하고, 이미지의 의미를 설명하는 alt 텍스트를 작성합니다.

```md
![게시글 조회 요청과 응답 흐름](./images/request-flow.png)
![다크 모드에서도 원본 색을 유지할 ERD {no-dark-filter}](./images/erd.png)
```

- 일반 Markdown 이미지는 데스크톱에서 최대 760px로 렌더링합니다.
- 모바일에서는 화면 너비에 맞춰 자동으로 축소하며 원본 비율을 유지합니다.
- `figure`를 사용하는 경우 컨테이너는 최대 820px로 제한합니다.
- 다크 모드에서 원본 색을 유지해야 하는 캡처, 다이어그램, 로고는 alt나 title에 `{no-dark-filter}`를 붙입니다. 렌더링 시 표시는 제거됩니다.
- Astro가 로컬 Markdown 이미지에 원본 `width`/`height`, `loading="lazy"`, `decoding="async"`를 자동으로 추가합니다.
- 원본 파일은 임의로 확대하지 않으며, 특별한 이유가 없다면 HTML의 고정 `width` 값보다 공통 Markdown 이미지 스타일을 사용합니다.
- 정보 전달용 이미지의 alt는 비워 두지 않습니다. 주변 문장을 반복하기보다 이미지가 전달하는 핵심 내용을 짧게 작성합니다.

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

- 글 frontmatter의 `series`에는 `src/data/series.json`의 `id`를 작성합니다.
- 시리즈 제목, 설명, 노출 순서, 상태, featured 여부는 `src/data/series.json`에서 관리합니다.
- 화면 제목을 바꾸려면 해당 항목의 `title`을 수정합니다. 카드와 상세 페이지는 제목을 자동 축약하지 않습니다.
- 시리즈 읽기 순서는 `chapter`를 우선 사용합니다. 기존 `seriesOrder`도 호환을 위해 schema에서 허용하지만 새 글에는 사용하지 않습니다.
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
- `/books/`
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
- `/books/`
- `/rss.xml`
- `/sitemap.xml`
- `/search/`
- `/search/?q=Board`
- `/categories/`
- `/tags/`
- `/series/`
- 개별 Book 페이지
- 개별 카테고리, 태그, 시리즈 페이지

## 폴더 구조

```text
src/
  components/
    home/       홈 화면 섹션
    layout/     Header, Sidebar, ThemeToggle, client scripts
    post/       상세 글 TOC와 코드블록 enhancement
  content/blog/ Markdown 글 데이터
  data/         books, navigation, series, tags 운영 메타데이터
  layouts/      BaseLayout
  pages/        Astro 라우트
  styles/       base, theme, layout, components, home, post CSS
  utils/        posts, books, categories, tags, series, search 유틸
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
