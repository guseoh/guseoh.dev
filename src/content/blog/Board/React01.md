---
title: "[Board] Thymeleaf 게시판을 React로 전환하려는 이유"
description: "Thymeleaf 게시판을 React로 전환에 대한 과정"
date: 2026-06-04
updated: 2026-06-04
category: Board
tags: ["Spring", "Project"]
series: "Thymeleaf 게시판을 React로 전환"
seriesOrder: 1
draft: false
---


# 들어가기 전

현재 진행중인 Board 프로젝트는 Spring Boot와 Thymeleaf를 기반으로 한 서버 사이드 렌더링(SSR) 방식의 게시판이다.

처음 이 프로젝트를 시작했을 때는 단순 '백엔드 프레임워크 학습' 이었다. Spring Boot 환경 안에서 `Controller - Service - Repository - Entity - DTO`로 이어지는 데이터의 흐름을 익히고, 이를 직접 눈으로 확인하기 위해서는
화면까지 구성할 수 있는 Thymeleaf가 최적의 선택이었다. ~~(김영한님 강의가 가장 컸다.)~~

별도의 프론트엔드 프로젝트를 세팅할 필요 없이, 서버에서 데이터를 조회해 Model에 담고 HTML을 만들어 브라우저에 내려주는 방식은 게시판의 필수 기능(목록, 상세, 작성, 수정, 삭제)을 빠르게 구현하는 데 큰 도움이 되었다. 그 결과 회원가입/로그인, OAuth2, 게시글/댓글 CRUD, 페이징, 검색, 관리자 페이지까지 꽤 규모 있는 기능을 갖추게 되었다. ~~(기능은 계속 추가될 것이다.)~~

하지만 점점 프로젝트가 고도화가 되고, 새로운 기능을 적용시키다보니 자연스럽게 아키텍처에 대한 본질적인 물음표가 생겼다. 그래서 Thymeleaf 기반의 프로젝트를 React와 REST API 기반 구조로 전환하려는 첫 출발점이 되었다.

> [!note] SSR 방식
> SSR(Server Side Rendering)은 화면에 보여줄 **HTML을 서버에서 미리 만들어서 브라우저에 전달**하는 방식이다.
>
> 즉, 사용자가 어떤 페이지에 접속하면 서버가 DB 조회, 비즈니스 로직 처리, HTML 생성까지 한 뒤 완성된 HTML을 클라이언트에게 보내준다.

# 현재 구조의 한계

![MVC 패턴](<스크린샷 2026-06-04 232329.png>)

현재 Board 프로젝트의 흐름은 전형적인 **Spring MVC**의 형태를 띄고 있다.

```
1. 브라우저 요청
2. Spring Controller
3. Service & Repository(DB 조회)
4. Model에 데이터 추가
5. Thymeleaf HTML 렌더링
6. 완성된 HTML 응답
```

이 방식은 `@ModelAttribute`, `BindingResult`, `redirect` 등 Spring MVC의 핵심 개념을 화면과 연결해 이해하기에 좋았다.

그러나 백엔드와 프론트엔드의 '책임'이라는 관점에서 보면 아쉬움이 남았다. Spring Boot가 데이터베이스와 통신하는 비즈니스 로직뿐만 아니라, 회면을 그리는(렌더링) 역할까지 모두 떠안고 있기 때문이다.

만약 이 상태에서 화면만 React로 바꾸려고 한다면 벽에 부딪히게 된다. 현재 서버는 클라이언트가 필요로 하는 순수한 '데이터(JSON)'를 제공하는 것이 아니라, 완성된 '화면(HTML)'을 반환하고 있기 때문이다.

> [!note] 책임
> Spring Boot
> -> API 제공, 인증/인가, 비즈니스 로직, DB 처리
>
> React
> -> 화면 렌더링, 사용자 인터랙션, 상태 관리

# 전환의 핵심

이번 React 전환의 목적은 단순 "프론트엔드 기술을 적용해보고 싶다"가 아니라 프로젝트를 **HTML 렌더링 중심 구조에서 REST API 중심 구조로 탈바꿈**하는 것이 핵심이다. 
- 프론트 엔드(React): 화면 구성, 라우팅 등
- 백엔드(Spring Boot): 데이터 제공(JSON 응답), 비즈니스 로직 등

### 1. Controller의 분리 (View -> API)

기존에는 `/post/1` 요청이 들어오면 게시글 데이터를 조회한 뒤 post/detail이라는 Thymeleaf 화면을 반환했다. 이제는 @RestController를 활용해 `/api/posts/1` 요청을 받고, 화면이 아닌 게시글 상세 데이터를 JSON 형태로 반환하는 API Controller를 별도로 분리해야 한다.

### 2. 데이터 전송 방식의 변화 (Form Submit ➔ JSON Payload)

Thymeleaf에서는 폼(Form)을 Submit 하면 서버가 데이터를 받고 성공 시 Redirect 처리를 했다. 하지만 React 환경에서는 사용자의 입력을 State로 관리하다가 `fetch`나 `axios`를 통해 JSON 형태로 서버에 요청을 보낸다. 백엔드는 이를 @RequestBody로 받아 처리하게 된다. 화면 이동의 주도권이 서버(Redirect)에서 클라이언트(React Router 등)로 넘어가는 것이다.

### 3. 검증(Validation)과 공통 응답 처리

기존에는 입력값 검증 실패 시 서버가 다시 폼 화면을 그려서 반환했지만, 이제는 에러의 원인을 JSON으로 명확하게 내려준다. 이를 위해 성공 시에는 ApiResponse, 실패 시에는 ErrorResponse와 같이 일관된 형태의 공통 응답 객체를 설계하여 프론트엔드 개발자가 예측 가능하게 API를 사용할 수 있도록 구성할 예정이다.

# 점진적 전환을 택한 이유

React와 API 구조로 넘어간다고 해서, 하루아침에 기존 Thymeleaf 코드를 다 지우고 새로 작성할 생각은 없다. 작동 중인 시스템을 한 번에 뒤엎는 것은 기존 기능(특히 로그인, OAuth2, 권한 관리 등)을 망가뜨릴 위험이 크기 때문이다.

그래서 기존 화면은 그대로 살려둔 채, 새로운 API를 하나씩 덧붙이는 방식을 선택했다.

인증 방식 또한 당분간은 기존의 Spring Security '세션(Session)' 방식을 유지할 계획이다.

# 마무리

결론적으로 이번 작업은 단순한 '프론트엔드 스택 교체'가 아니다. Spring Boot + Thymeleaf 기반의 모놀리식(Monolithic) SSR 게시판을, 클라이언트와 서버가 완벽히 분리된 REST API 아키텍처로 진화시키는 과정이다.

이 전환 과정을 시리즈로 작성할 것이다. 