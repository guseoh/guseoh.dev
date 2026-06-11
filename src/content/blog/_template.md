---
title: "글 제목"
description: "검색 결과와 OG 메타에 사용될 한두 문장 요약"
date: 2026-06-05
updated: 2026-06-05
category: "Board"
tags:
  - Spring
  - JPA
  - Performance
book: "backend-engineering"
series: "board-프로젝트-개선-기록"
chapter: 1
heroImage: "/og-image.svg"
draft: true
---

<!--
작성 규칙
- title: 상세 페이지의 유일한 h1입니다.
- description: 검색 결과와 OG 메타에 사용할 문제/결과 중심 요약을 작성합니다.
- category: 글의 큰 소속 하나만 선택합니다. Board, OS, Java, Git 등이 현재 사용 중입니다.
- tags: 기술, 주제, 글 성격을 나타내는 태그를 3~7개 정도 작성합니다.
- book: src/data/books.json에 등록된 Book id입니다. Book에 포함하지 않을 글이면 삭제합니다.
- series: src/data/series.json에 등록된 Series id입니다. 연재 글이 아니면 삭제합니다.
- chapter: Book 또는 Series 내부 읽기 순서입니다. 둘 다 없으면 삭제합니다.
- Book 제목은 src/data/books.json의 title, Series 제목은 src/data/series.json의 title을 수정합니다.
- category, book, series는 서로 독립적이며 서로 다른 category의 글도 같은 Book에 넣을 수 있습니다.
- 등록되지 않은 book id를 작성하면 content schema 검증에서 오류가 발생합니다.
- heroImage: public 기준 절대 경로를 사용합니다. 전용 이미지가 없으면 /og-image.svg를 사용합니다.
- draft: 작성 중에는 true, 발행할 때 false로 변경하거나 필드를 삭제합니다.
- 본문에서 # heading을 사용하지 않습니다. 본문 heading은 반드시 ##부터 시작합니다.
- Markdown 이미지는 ![이미지의 의미를 설명하는 alt](./image.png) 형식으로 작성합니다.
- 본문 이미지는 데스크톱에서 최대 760px, 모바일에서 화면 너비에 맞춰 자동 축소됩니다.
- 장식 목적이 아니라면 alt를 비워 두지 않습니다.
-->

> 페이지의 `h1`은 글 제목이 담당하므로 본문은 `##`부터 시작합니다.

## 들어가기 전

이 글을 작성하게 된 배경과 목표를 적습니다.

## 문제 상황

어떤 문제가 있었고 사용자나 시스템에 어떤 영향을 주었는지 설명합니다.

## 원인 분석

로그, 코드, 실행 결과, 설계 관점에서 원인을 분석합니다.

## 해결 방법

적용한 해결 방법과 선택 이유를 단계적으로 정리합니다.

## 코드 변경

핵심 코드, 설정, 구조 변경을 설명합니다.

## 검증 결과

실행한 명령, 테스트, 화면 확인 결과를 정리합니다.

## 이미지 예시

아래처럼 이미지의 내용이나 목적을 설명하는 alt 텍스트를 작성합니다.

```md
![게시글 조회 요청과 응답 흐름](./images/request-flow.png)
```

## 배운 점

이번 작업에서 배운 점과 다음 개선 방향을 정리합니다.
