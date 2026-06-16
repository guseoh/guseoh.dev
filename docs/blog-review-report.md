# 블로그 및 GitHub 레포지토리 리뷰 보고서

## 1. 리뷰 개요

### 대상
- 배포 사이트: https://guseoh.dev/
- GitHub 레포지토리: https://github.com/guseoh/guseoh.dev
- 로컬 프로젝트: `C:\Users\guseo\OneDrive\문서\codex_project\codex_github_profile_page_vibe`

### 리뷰 목적
- 현재 블로그의 완성도 평가
- 포트폴리오 블로그 관점의 개선점 도출
- Astro 프로젝트 구조 평가
- UI/UX, SEO, 접근성, 성능, 유지보수성 개선 방향 정리

### 리뷰 기준
- 배포 사이트 직접 확인: 메인, 글 목록, 상세 글, 카테고리, 태그, 시리즈, 검색, RSS, sitemap
- 로컬 파일 구조 확인: `src/pages`, `src/layouts`, `src/components`, `src/content`, `src/styles`, `src/utils`, `.github/workflows`
- 검증 명령 실행: `npm run check`, `npm run build`
- 주의: 리뷰 시점의 로컬 작업 트리에는 `src/content/blog/Board/React01.md` 미커밋 변경이 있습니다. 보고서는 코드를 수정하지 않고 현재 확인 가능한 상태를 기준으로 작성했습니다.

---

## 2. 전체 평가 요약

### 강점
- 메인 페이지에서 Java/Spring 백엔드 개발자 블로그라는 정체성이 바로 드러납니다.
- Astro Content Collections, RSS, sitemap, GitHub Actions 기반 배포 구조가 갖춰져 있습니다.
- 글 목록, 카테고리, 태그, 시리즈, 검색, 상세 글 TOC까지 블로그 기본 탐색 흐름이 완성되어 있습니다.
- 상세 글 페이지는 왼쪽 탐색, 본문, 오른쪽 TOC의 3단 구조가 다시 안정적으로 작동합니다.
- frontmatter 사용이 일관적이며 현재 공개 글 9개 모두 `description`, `date`, `updated`가 있습니다.
- 모바일 390px 폭에서 주요 페이지의 가로 스크롤이 발생하지 않았습니다.

### 아쉬운 점
- 상세 글 본문 Markdown의 `#` 제목이 그대로 `h1`로 렌더링되어, 상세 글 페이지에 `h1`이 6개 존재합니다.
- `/sitemap.xml`과 `@astrojs/sitemap` 산출물이 동시에 배포되고 있으며, 수동 `/sitemap.xml`에는 `/series/`가 빠져 있습니다.
- `src/pages/blog/[...slug].astro`에 TOC active 처리와 코드블록 래핑/복사 스크립트가 길게 들어 있어 책임이 무겁습니다.
- CSS가 기능별로 나뉘어 있지만 `components.css`, `layout.css`, `post.css`가 커져 레이아웃 회귀 위험이 있습니다.
- 메인 페이지는 정체성은 좋지만, 대표 프로젝트/성과/기술 스택을 한눈에 보여주는 포트폴리오 신호는 더 강화할 수 있습니다.

### 가장 먼저 개선하면 좋은 항목 TOP 5
1. 상세 글 본문 heading 구조 정리: Markdown 본문 최상위 제목을 `h2`부터 쓰도록 가이드하거나 렌더링 단계에서 조정합니다.
2. sitemap 생성 방식을 하나로 통일하고 `/series/` 누락을 제거합니다.
3. `src/pages/blog/[...slug].astro`의 클라이언트 스크립트를 전용 컴포넌트나 스크립트 유틸로 분리합니다.
4. 상세 글/전역 레이아웃 CSS의 breakpoint와 column 규칙을 문서화하거나 토큰화합니다.
5. 메인 페이지에 대표 Board 프로젝트 성과, 기술 스택, 문제 해결 사례로 이어지는 포트폴리오 CTA를 보강합니다.

---

## 3. 화면별 리뷰

### 3-1. 메인 페이지

#### 현재 상태
- URL: https://guseoh.dev/
- h1: `Java/Spring 백엔드 개발자 오지훈입니다.`
- 최근 글 5개, Blog Activity, GitHub Activity, Topic Index가 표시됩니다.
- 메인 페이지는 `minimalHome` 레이아웃을 사용해 왼쪽 사이드바 없이 콘텐츠 중심으로 구성됩니다.

#### 강점
- 방문자가 블로그의 주제와 작성자 포지션을 빠르게 이해할 수 있습니다.
- 블로그 활동 잔디와 GitHub 잔디가 함께 있어 학습/개발 활동의 지속성이 드러납니다.
- 최근 글과 카테고리 탐색이 같은 화면에 있어 다음 행동이 명확합니다.

#### 문제점
- 대표 프로젝트나 성과 요약이 히어로 근처에 부족해 포트폴리오 관점의 설득력이 더 커질 여지가 있습니다.
- GitHub Activity는 `public/data/github-contributions.json`의 정적 JSON에 의존합니다. 현재 `generatedAt`은 `2026-06-04T09:33:16.106Z`, `source`는 `public-html`입니다.

#### 개선 제안
| 우선순위 | 구분 | 개선사항 | 기대 효과 |
|---|---|---|---|
| 중간 | UI/UX | 히어로 아래에 대표 프로젝트 카드 또는 “Board 개선 기록 보기” CTA 추가 | 채용 담당자가 핵심 사례로 빠르게 이동 |
| 중간 | 콘텐츠 구조 | Java/Spring, JPA, 성능 개선, 운영체제 학습 등 핵심 주제 요약 강화 | 블로그의 전문 영역이 더 명확해짐 |
| 낮음 | 성능 | GitHub 잔디 JSON 생성 실패 시 표시되는 빈 상태 문구를 UI에서 더 명확히 설계 | 외부 데이터 실패 시 신뢰감 유지 |

---

### 3-2. 블로그 목록 페이지

#### 현재 상태
- URL: https://guseoh.dev/blog/
- h1: `All Posts (9)`
- 공개 글 9개가 표시됩니다.
- Grid/List 보기 전환이 있고 `localStorage`로 선호 뷰를 저장합니다.
- 왼쪽 사이드바에서 전체 글, 카테고리, 태그 탐색이 가능합니다.

#### 강점
- 글 목록 카드에 제목, 설명, 작성일, 읽는 시간, 카테고리/태그가 함께 제공됩니다.
- 12개 단위 페이지네이션 구조가 준비되어 있어 글이 늘어나도 확장 가능합니다.
- 보기 전환 버튼에 `aria-label`, `aria-pressed`가 적용되어 있습니다.

#### 문제점
- 현재 글 수가 9개라 페이지네이션은 당장 문제가 없지만, 글이 많아질수록 검색/필터 페이지와 목록 페이지의 역할 구분이 더 중요해집니다.
- 카드 메타 정보는 좋지만 대표 기술/문제 유형이 더 눈에 띄게 구분되면 포트폴리오 탐색성이 좋아집니다.

#### 개선 제안
| 우선순위 | 구분 | 개선사항 | 기대 효과 |
|---|---|---|---|
| 중간 | UI/UX | Board, Java, OS 등 상단 빠른 필터 또는 추천 카테고리 진입점 추가 | 사용자가 관심 주제로 더 빠르게 이동 |
| 낮음 | 콘텐츠 구조 | 글 카드에 “프로젝트 개선”, “학습 정리”, “문제 해결” 같은 유형 태그 도입 검토 | 포트폴리오 평가자가 글의 성격을 빨리 파악 |

---

### 3-3. 상세 글 페이지

#### 현재 상태
- URL: https://guseoh.dev/blog/board/react01/
- 왼쪽 사이드바, 본문, 오른쪽 `ON THIS PAGE` 목차가 렌더링됩니다.
- 1440px 기준 본문 폭은 약 860px, TOC는 sticky 상태로 오른쪽에 배치됩니다.
- 390px 모바일에서는 TOC가 숨겨지고 본문 카드가 약 359px 폭을 사용합니다.
- 코드블록은 `.code-block`으로 감싸지고 복사 버튼이 추가됩니다.

#### 강점
- 상세 글 페이지의 3단 구조가 안정적으로 복구되어 본문 집중도가 좋아졌습니다.
- 왼쪽 사이드바 접기/펼치기 버튼에 `aria-label`, `aria-expanded`가 있습니다.
- 오른쪽 TOC는 sticky와 내부 스크롤이 유지됩니다.
- 코드블록에 언어 라벨과 Copy 버튼이 있어 개발 글에 적합합니다.

#### 문제점
- 상세 글 페이지에서 `h1`이 6개 확인되었습니다. 페이지 제목 외 본문 Markdown의 `#` heading이 모두 `h1`로 렌더링됩니다.
- `src/pages/blog/[...slug].astro`에 TOC active 스크립트와 코드블록 래핑/복사 스크립트가 함께 있어 페이지 파일 책임이 큽니다.
- JavaScript 비활성화 시 코드블록 Copy 버튼과 코드블록 헤더 래핑은 동작하지 않습니다. 기본 코드 표시 자체는 유지되지만 기능 차이가 있습니다.

#### 개선 제안
| 우선순위 | 구분 | 개선사항 | 기대 효과 |
|---|---|---|---|
| 높음 | 접근성/SEO | 글 본문은 `##`부터 시작하도록 작성 규칙을 정하고 기존 글 heading을 정리 | h1 하나 원칙, 문서 구조 개선 |
| 높음 | SEO | Markdown 렌더링 단계에서 본문 `h1`을 `h2`로 낮추는 remark plugin 또는 작성 lint 도입 검토 | 새 글 작성 시 구조 회귀 방지 |
| 중간 | 유지보수 | TOC active 처리와 code block enhancement를 별도 컴포넌트/스크립트로 분리 | 상세 페이지 파일 복잡도 감소 |
| 중간 | UI/UX | TOC가 없는 글에서도 상세 페이지 폭 정책이 일관적인지 별도 샘플로 확인 | 글 유형별 레이아웃 안정성 향상 |

---

## 4. 코드 및 파일 구조 리뷰

### 4-1. 프로젝트 구조

#### 현재 구조 요약
```text
src/
  pages/        Astro 라우트
  layouts/      BaseLayout
  components/   공통, 레이아웃, 홈 컴포넌트
  content/      Markdown 블로그 글
  styles/       base, theme, layout, components, home, post CSS
  utils/        posts, categories, tags, series, blogStats, githubStats
public/
  data/github-contributions.json
  og-image.svg
  robots.txt
.github/workflows/
  deploy.yml
```

#### 강점
- Astro의 기본 책임 분리가 잘 살아 있습니다.
- `utils`에 날짜, 태그, 카테고리, 시리즈, 잔디 통계 로직이 분리되어 있습니다.
- 레이아웃 컴포넌트는 `Header`, `Sidebar`, `Footer`, `ThemeToggle`, `LayoutScripts`로 나뉘어 있습니다.

#### 문제점
- `src/content/blog/Java/JavaTest.java`는 content collection 대상이 아니며, 현재 블로그 라우트에서 직접 사용되는 흔적이 없습니다.
- `dist/`가 로컬에 존재합니다. 현재 Git 상태에는 잡히지 않았지만, 빌드 산출물은 계속 커밋 대상에서 제외되는지 유지 확인이 필요합니다.

#### 개선 제안
- 콘텐츠 보조 파일과 사용하지 않는 실험 파일의 위치를 정리합니다.
- README의 폴더 구조 설명을 현재 상세 글 레이아웃/사이드바 저장 상태까지 반영해 업데이트합니다.

### 4-2. 컴포넌트 구조

#### 강점
- `PostCard`, `PostMetaBadges`, `CategoryMenu`, `PostViewSwitch`처럼 반복 UI가 컴포넌트화되어 있습니다.
- 홈 전용 섹션이 `src/components/home` 아래에 모여 있습니다.
- 사이드바와 헤더는 `src/components/layout` 아래에 모여 있어 탐색하기 쉽습니다.

#### 문제점
- `src/pages/blog/[...slug].astro`가 렌더링, 시리즈 계산, 이전/다음 글 계산, TOC, 코드블록 enhancement까지 모두 담당합니다.
- `LayoutScripts.astro`는 전역 테마, 사이드바, 검색 입력 동기화가 함께 있어 커질 가능성이 있습니다.

#### 개선 제안
- `PostToc.astro`, `PostCodeEnhancer.astro` 또는 `src/scripts/post-enhancements.ts` 같은 분리 후보를 검토합니다.
- 상세 글 이전/다음/시리즈 계산을 `src/utils/posts.ts` 또는 별도 `postNavigation.ts`로 분리하면 테스트와 재사용이 쉬워집니다.

### 4-3. 스타일 구조

#### 현재 상태
- `components.css`: 약 682라인
- `post.css`: 약 647라인
- `layout.css`: 약 554라인
- `home.css`: 약 346라인
- `theme.css`, `base.css`는 비교적 작고 역할이 명확합니다.

#### 강점
- 테마 변수와 base 스타일이 별도로 분리되어 있습니다.
- 상세 글 스타일이 `post.css`로 모여 있어 문제 영역을 찾기 쉽습니다.
- 라이트/다크 모드 색상 토큰이 같은 변수명으로 관리됩니다.

#### 문제점
- `layout.css`와 `post.css`가 상세 글 3단 레이아웃에 함께 관여해 breakpoint 회귀 가능성이 있습니다.
- `components.css`가 여러 페이지의 카드, 검색, 배지, 목록 UI를 많이 포함해 커지고 있습니다.

#### 개선 제안
- 상세 글 레이아웃 관련 토큰을 주석 또는 변수로 명확히 문서화합니다.
- `components.css`를 카드/목록/검색/시리즈 등으로 한 단계 더 쪼개는 것을 검토합니다.

### 4-4. 유틸 함수 구조

#### 강점
- `src/utils/blogStats.ts`와 `src/utils/githubStats.ts`가 잔디 통계 계산을 담당해 컴포넌트 책임이 적절합니다.
- `src/utils/categories.ts`, `src/utils/tags.ts`, `src/utils/series.ts`가 slug/summary 로직을 분리합니다.
- `getPostDescription`, `getReadingTime`, `sortPostsByDate`가 `src/utils/posts.ts`에 모여 있습니다.

#### 문제점
- `getReadingTime`은 정규식 기반 추정이라 한국어/영어 혼합 글에서 오차가 있을 수 있습니다.
- 시리즈 continuation 메시지는 특정 시리즈 slug와 문구가 코드에 하드코딩되어 있어 글이 늘어나면 관리 부담이 생깁니다.

#### 개선 제안
- 시리즈 메타데이터를 content collection 또는 별도 JSON/YAML로 분리하는 방식을 검토합니다.
- 읽는 시간 계산은 현재 수준으로 충분하지만, 기준값과 계산 방식을 README에 짧게 기록하면 좋습니다.

---

## 5. 블로그 콘텐츠 구조 리뷰

### 5-1. 카테고리 구조

#### 현재 상태
- 공개 Markdown 글: 9개
- draft 글: 0개
- 카테고리 분포:
  - OS: 4
  - Board: 2
  - Project: 1
  - Git: 1
  - Java: 1

#### 개선 제안
- Board와 Project의 관계를 더 명확히 정리합니다. 예를 들어 Board 프로젝트 글은 `Project` 하위의 `Board` 태그로 둘지, `Board` 카테고리를 유지할지 기준을 정하면 좋습니다.
- 카테고리 페이지에 “이 카테고리에서 무엇을 다루는지” 설명을 추가하면 탐색성이 좋아집니다.

### 5-2. 태그 구조

#### 현재 상태
- Spring, JPA, OS, Board, Project, Database, SQL, Performance, Monitoring 등 기술/주제 태그가 혼합되어 있습니다.
- 태그 페이지와 사이드바 태그 탐색이 정상 생성됩니다.

#### 개선 제안
- 태그를 기술 태그와 글 성격 태그로 나누는 규칙을 문서화합니다.
- `java`처럼 소문자로 들어간 태그는 `formatTagName`으로 Java로 표시되지만, frontmatter 작성 규칙은 대문자 표기로 통일하는 편이 좋습니다.

### 5-3. 시리즈 구조

#### 현재 상태
- 시리즈 글은 8개입니다.
- OS 시리즈는 1~4 순서가 있고, Board/Java 관련 시리즈는 대부분 1편만 있습니다.
- `/series/` 페이지는 정상 렌더링되며 h1은 1개입니다.

#### 개선 제안
- 단일 글만 있는 시리즈는 “예정된 연재”인지 “단발 글”인지 기준을 정합니다.
- `/series/`가 수동 sitemap에 빠져 있으므로 sitemap 구조를 정리합니다.

### 5-4. frontmatter 구조

#### 현재 사용 필드
```yaml
title:
description:
date:
updated:
category:
tags:
series:
seriesOrder:
heroImage:
draft:
```

#### 현재 상태
- 모든 공개 글에 `description`과 `updated`가 있습니다.
- `draft: true`는 현재 없습니다.
- Content Collection schema에서 `description`, `updated`, `category`, `series`, `heroImage`, `draft`는 optional입니다.

#### 개선 제안
- `description`은 현재 잘 채워져 있으므로 optional을 유지하더라도 README에서 필수 작성 권장으로 명확히 둡니다.
- `category`도 실제 블로그 운영에서는 사실상 필수에 가까우므로 schema 필수화 또는 lint 도입을 검토합니다.
- 새 글 템플릿에 “본문 heading은 `##`부터 시작” 규칙을 추가합니다.

---

## 6. 성능 리뷰

### 현재 상태
- `npm run build` 성공, 37 pages built.
- Astro 정적 사이트 구조라 기본 로딩 비용은 낮습니다.
- 이미지 11개가 Astro 빌드에서 WebP로 최적화됩니다.
- GitHub 잔디는 빌드 시 생성된 JSON을 렌더링하므로 런타임 API 호출이 없습니다.

### 문제점
- 검색 페이지는 현재 글 9개 전체를 DOM에 렌더링한 뒤 클라이언트에서 숨깁니다. 지금은 문제 없지만 글이 많아지면 비용이 늘어납니다.
- 상세 글 코드블록 enhancement는 클라이언트에서 DOM을 다시 감싸는 방식이라 글이 길어질수록 초기 상호작용 비용이 생길 수 있습니다.

### 개선 제안
| 우선순위 | 개선사항 | 설명 |
|---|---|---|
| 중간 | 검색 인덱스 JSON 분리 | 글 수가 늘어나면 검색 페이지 전체 카드 사전 렌더링 대신 가벼운 JSON 인덱스 사용 |
| 중간 | 코드블록 래핑 빌드타임화 | remark/rehype 단계에서 코드블록 헤더를 생성하면 클라이언트 DOM 조작 감소 |
| 낮음 | GitHub JSON 생성 실패 UI 보강 | contribution fetch 실패 시 사용자에게 자연스러운 빈 상태 제공 |

---

## 7. 접근성 리뷰

### 현재 상태
- 테마 토글은 `aria-label`, `aria-pressed`가 동기화됩니다.
- 사이드바 접기/펼치기 버튼은 `aria-label`, `aria-expanded`, `aria-controls`가 있습니다.
- 코드 복사 버튼은 `aria-label="Copy code block"`이 있습니다.
- 상세 글 페이지의 이미지 alt 누락은 확인되지 않았습니다.
- 모바일에서 가로 스크롤은 확인되지 않았습니다.

### 문제점
- 상세 글 본문 heading 구조상 `h1`이 여러 개라 스크린리더의 문서 구조 탐색이 어색할 수 있습니다.
- 카테고리 토글 버튼은 visible text가 있어 접근 가능하지만, “펼치기/접기” 상태 목적을 더 명확히 하는 `aria-label`을 추가하면 더 친절합니다.

### 개선 제안
| 우선순위 | 개선사항 | 설명 |
|---|---|---|
| 높음 | 상세 글 h1 다중 사용 제거 | 페이지 h1은 글 제목 하나만 유지 |
| 중간 | 카테고리 토글 aria-label 보강 | 예: `Board 하위 태그 펼치기` |
| 낮음 | 색상 대비 정기 점검 | 다크모드/라이트모드 모두 토큰 기반 contrast 점검 |

---

## 8. SEO 리뷰

### 현재 상태
- 각 페이지에 title, description, canonical, Open Graph, Twitter Card가 있습니다.
- RSS는 `/rss.xml`에서 200 응답, item 9개, React01 글 포함 확인.
- `/sitemap.xml`은 200 응답, URL 36개, React01 글 포함 확인.
- `/sitemap-index.xml`과 `/sitemap-0.xml`도 함께 생성되며, `sitemap-0.xml`은 URL 37개입니다.
- robots.txt는 `Sitemap: https://guseoh.dev/sitemap.xml`을 가리킵니다.

### 문제점
- 수동 `/sitemap.xml`에는 `/series/`가 빠져 있습니다.
- `@astrojs/sitemap` 통합 산출물과 수동 sitemap이 동시에 존재해 관리 기준이 불명확합니다.
- 상세 글 페이지에 `h1`이 6개 있어 검색엔진이 문서 구조를 해석하기에 덜 명확합니다.

### 개선 제안
| 우선순위 | 개선사항 | 설명 |
|---|---|---|
| 높음 | sitemap 생성 방식 통일 | 수동 `src/pages/sitemap.xml.ts` 또는 `@astrojs/sitemap` 중 하나로 정리 |
| 높음 | `/series/` sitemap 누락 해결 | robots가 가리키는 sitemap에도 `/series/` 포함 |
| 높음 | 상세 글 h1 구조 정리 | SEO와 접근성 모두에 영향 |
| 중간 | 글별 OG 이미지 전략 | 현재 공통 `/og-image.svg` 중심이므로 대표 글/프로젝트별 OG 확장 검토 |

---

## 9. 배포 및 GitHub Actions 리뷰

### 현재 상태
- `.github/workflows/deploy.yml`은 `main` push와 `workflow_dispatch`에서 실행됩니다.
- Node 22, `npm ci`, `npm run github:contributions`, `npm run build`, Pages artifact 업로드, deploy 순서입니다.
- Pages 권한은 `contents: read`, `pages: write`, `id-token: write`로 적절합니다.
- 최신 배포 워크플로는 성공 상태로 확인되었습니다.

### 문제점
- `npm run github:contributions`가 secrets에 의존합니다. 토큰이 없거나 public HTML fallback이 깨질 때의 결과 품질을 주기적으로 봐야 합니다.
- README에는 배포 흐름이 설명되어 있지만, sitemap 중복 구조와 상세 글 레이아웃 규칙은 아직 문서화되어 있지 않습니다.

### 개선 제안
- GitHub contributions 생성 실패 시에도 빌드가 성공하는 정책과 표시 정책을 README에 적습니다.
- Pages 배포 후 확인할 URL 체크리스트를 README 또는 docs에 추가합니다.

---

## 10. 우선순위별 개선 로드맵

### 1단계: 바로 수정하면 좋은 항목
| 우선순위 | 구분 | 작업 | 기대 효과 |
|---|---|---|---|
| 높음 | 접근성/SEO | 상세 글 Markdown heading을 `##`부터 쓰도록 기존 글 정리 | h1 다중 문제 해결 |
| 높음 | SEO | sitemap 중복 구조 정리 및 `/series/` 누락 해결 | 검색엔진 크롤링 명확화 |
| 높음 | 유지보수 | 새 글 템플릿에 heading/frontmatter 작성 규칙 추가 | 새 글 품질 회귀 방지 |

### 2단계: 구조 개선 항목
| 우선순위 | 구분 | 작업 | 기대 효과 |
|---|---|---|---|
| 중간 | 유지보수 | `src/pages/blog/[...slug].astro`의 TOC/코드블록 스크립트 분리 | 상세 페이지 복잡도 감소 |
| 중간 | 유지보수 | `components.css` 세분화 검토 | 스타일 회귀 위험 감소 |
| 중간 | UI/UX | 메인 페이지에 대표 프로젝트/성과 CTA 추가 | 포트폴리오 설득력 강화 |
| 중간 | 콘텐츠 구조 | 카테고리와 태그 작성 규칙 문서화 | 글이 늘어날수록 탐색 품질 유지 |

### 3단계: 향후 고도화 항목
| 우선순위 | 구분 | 작업 | 기대 효과 |
|---|---|---|---|
| 낮음 | 성능 | 검색 인덱스 JSON 방식 검토 | 글 수 증가 대비 |
| 낮음 | SEO | 글별 OG 이미지 자동 생성 | 공유 시 시각적 완성도 향상 |
| 낮음 | 배포 | 배포 후 smoke test 자동화 | Pages 반영 회귀 조기 발견 |

---

## 11. 구체적인 수정 후보 파일

| 파일 | 문제 | 개선 방향 | 우선순위 |
|---|---|---|---|
| `src/content/blog/**/*.md` | 상세 글 본문에 `#` heading 사용 가능 | 본문 heading을 `##`부터 시작하도록 정리 | 높음 |
| `src/content/blog/_template.md` | 새 글 작성 규칙을 더 강하게 안내할 수 있음 | heading 규칙, description/category 필수 작성 안내 추가 | 높음 |
| `src/pages/sitemap.xml.ts` | 수동 sitemap이 `/series/`를 누락하고 통합 sitemap과 중복 | `/series/` 추가 또는 `@astrojs/sitemap`으로 통일 | 높음 |
| `astro.config.mjs` | `@astrojs/sitemap`과 수동 sitemap이 함께 존재 | sitemap 전략 결정 후 한쪽 제거/유지 | 높음 |
| `public/robots.txt` | 현재 `/sitemap.xml`만 안내 | 최종 sitemap 전략에 맞춰 URL 유지 또는 변경 | 중간 |
| `src/pages/blog/[...slug].astro` | 상세 글 렌더링과 클라이언트 enhancement 책임이 큼 | TOC, 코드블록, navigation 계산 분리 | 중간 |
| `src/styles/post.css` | 상세 글 레이아웃 breakpoint가 중요하고 복잡함 | 레이아웃 토큰/주석/테스트 기준 추가 | 중간 |
| `src/styles/layout.css` | 사이드바 접힘과 전역 grid가 함께 관리됨 | sidebar 상태 규칙 문서화 | 중간 |
| `src/styles/components.css` | 600라인 이상으로 여러 UI 책임 포함 | card/search/badge/list 등 분리 검토 | 중간 |
| `src/components/home/ArchiveHero.astro` | 포트폴리오 CTA가 약함 | 대표 프로젝트/기술 스택 진입점 보강 | 중간 |
| `src/components/home/GitHubGrass.astro` | 정적 JSON 의존성과 fallback 상태가 중요함 | 데이터 생성 실패/빈 상태 UX 보강 | 낮음 |
| `src/content/blog/Java/JavaTest.java` | 현재 content collection 대상이 아니며 사용 흔적이 약함 | 필요한 첨부인지 확인 후 위치 정리 | 낮음 |
| `README.md` | 현재 구조 설명은 좋지만 운영 규칙 일부 부족 | sitemap, heading, 배포 후 확인 절차 추가 | 중간 |

---

## 12. 최종 의견

현재 블로그는 “Java/Spring 백엔드 개발자가 학습과 프로젝트 개선 과정을 꾸준히 기록하는 공간”이라는 인상이 분명합니다. 특히 Board 프로젝트, Spring/JPA, 성능 측정, OS/CS 학습이 함께 있어 신입 또는 주니어 백엔드 포트폴리오로서 방향성이 좋습니다.

백엔드 개발자 포트폴리오 관점의 강점은 단순한 기술 나열보다 “왜 전환했는지”, “어떤 한계를 발견했는지”, “어떤 기준으로 개선했는지”를 글로 남기고 있다는 점입니다. 상세 글과 시리즈 구조가 더 쌓이면 문제 해결 과정을 보여주는 좋은 증거가 됩니다.

학습 기록 블로그 관점에서는 카테고리/태그/시리즈/RSS가 이미 갖춰져 있어 지속 운영에 적합합니다. 다만 글이 늘어날수록 카테고리와 태그 규칙을 문서화하지 않으면 탐색 품질이 흐려질 수 있습니다.

채용 담당자나 면접관 관점에서는 메인 페이지에서 대표 프로젝트와 핵심 성과로 바로 진입할 수 있는 신호가 조금 더 있으면 좋습니다. 예를 들어 “Board 프로젝트 성능 개선”, “Thymeleaf에서 React 전환”, “JPA 연관관계 삭제 정책 설계” 같은 대표 사례를 메인에서 바로 연결하면 평가자가 강점을 더 빨리 파악할 수 있습니다.

기능적으로 가장 먼저 손볼 부분은 상세 글의 heading 구조와 sitemap 통일입니다. 둘 다 사용자 눈에는 크게 드러나지 않을 수 있지만, SEO, 접근성, 유지보수에 직접 영향을 줍니다. 이 두 가지를 정리하면 현재 UI 개선 작업의 완성도가 더 단단해질 것입니다.

---

## 13. 검증 결과

### 명령어 검증
- `npm run check`: 성공
  - Result: 41 files
  - 0 errors
  - 0 warnings
  - 0 hints
- `npm run build`: 성공
  - 37 pages built
  - `/blog/board/react01/index.html` 생성 확인
  - `@astrojs/sitemap`이 `sitemap-index.xml` 생성

### 배포 사이트 확인
- 메인 페이지: 200 응답, h1 1개, 최근 글 5개 표시
- 블로그 목록: 200 응답, 공개 글 9개 표시
- 상세 글: 200 응답, 좌측 사이드바/본문/오른쪽 TOC 렌더링
- 카테고리/태그/시리즈/검색 페이지: 200 응답 확인
- 검색 페이지: `?q=Spring`에서 9개 중 3개 표시
- RSS: `/rss.xml` 200 응답, item 9개
- sitemap:
  - `/sitemap.xml` 200 응답, URL 36개
  - `/sitemap-index.xml` 200 응답
  - `/sitemap-0.xml` URL 37개
  - 수동 `/sitemap.xml`에는 `/series/` 누락
