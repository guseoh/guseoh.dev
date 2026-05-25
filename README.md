# devjune.dev

Java/Spring 백엔드 개발자 오지훈의 GitHub Pages 포트폴리오 블로그입니다. Board 프로젝트를 중심으로 Spring Boot, JPA, QueryDSL, Docker, CI/CD, 성능 개선, OS/CS 학습 기록을 정리합니다.

## 사용 기술

- Astro 6
- Astro Content Collections + Markdown
- TypeScript
- @astrojs/rss, @astrojs/sitemap
- GitHub Actions
- GitHub Pages

## 주요 기능

- 홈: 소개 히어로, 최근 글, 주요 학습/프로젝트 카테고리
- 글 목록: 페이지네이션, 그리드/리스트 보기 전환
- 글 상세: 메타데이터, 태그, TOC, 코드블록 언어 라벨, Copy 버튼, 이전/다음 글
- 탐색: 카테고리, 태그, 사이드바 검색
- SEO: canonical, Open Graph, Twitter Card, RSS, sitemap
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

## 글 작성 방법

새 글은 `src/content/blog` 아래에 Markdown 파일로 추가합니다. 파일명은 URL slug가 되므로 소문자, 숫자, 하이픈 또는 기존 규칙에 맞춘 이름을 권장합니다.

```yaml
---
title: "[Board 프로젝트] 게시글 상세 조회 성능 개선"
description: "측정 결과를 바탕으로 N+1 조회를 줄이고 응답 시간을 개선한 기록"
date: 2026-05-25
updated: 2026-05-25
category: Project
tags: ["Board", "Spring Boot", "JPA", "QueryDSL", "Performance"]
series: "Board 프로젝트 성능 개선"
seriesOrder: 2
heroImage: "/og-image.svg"
draft: true
---
```

`draft: true`인 글은 목록, RSS, sitemap, 상세 페이지 생성에서 제외됩니다.

## 권장 글 구조

Board 프로젝트 글은 평가자가 문제 해결 과정을 따라갈 수 있도록 아래 흐름을 권장합니다.

1. 문제 상황
2. 기존 코드 또는 구조
3. 원인 분석
4. 해결 방법
5. 개선 전/후 비교
6. 배운 점
7. 다음 개선 방향

## 배포 방식

`main` 브랜치에 push되면 `.github/workflows/deploy.yml`이 실행됩니다.

1. Node 22 설정
2. `npm ci`
3. `npm run build`
4. `dist`를 GitHub Pages artifact로 업로드
5. GitHub Pages 배포

배포 사이트: https://guseoh.github.io/

## 폴더 구조

```text
src/
  components/
    home/       홈 화면 섹션
    layout/     Header, Sidebar, ThemeToggle, client scripts
  content/blog/ Markdown 글 데이터
  layouts/      BaseLayout
  pages/        Astro 라우트
  styles/       base, theme, layout, components, home, post CSS
  utils/        posts, categories, tags 유틸
public/
  og-image.svg
  robots.txt
.github/workflows/
  deploy.yml
```

## 향후 개선 예정

- Board 프로젝트 성능 개선 시리즈 확장
- 검색 인덱스 품질 개선
- 글별 OG 이미지 자동 생성
- 태그/카테고리 설명 페이지 보강
- Lighthouse 접근성/성능 점검 자동화
