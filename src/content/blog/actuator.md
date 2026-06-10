---
title: "[Board 프로젝트] 게시글 상세 조회 성능 측정 - 개선 전 분석"
description: "Actuator와 P6Spy를 사용해 게시글 상세 조회 API의 응답 시간과 SQL 실행 흐름을 분석한 기록"
date: 2026-04-27
updated: 2026-04-27
category: Board
tags: ["Board", "Spring Boot", "JPA", "Database", "SQL", "Performance", "Monitoring", "P6Spy", "Actuator"]
book: "backend-engineering"
series: "board-프로젝트-성능-개선"
chapter: 4
draft: false
---

## 1. 측정 대상

게시판 프로젝트를 개발하면서 기능 구현이 어느 정도 완료된 후,
게시글 상세 조회(`/post/{id}`) 요청이 실제로 어떻게 동작하는지 확인해보고 싶었다.

"느리다"는 감각적인 접근보다는 Actuator와 P6Spy를 이용해 **응답 시간**과 **실행 SQL**을 먼저 측정한 뒤 개선 포인트를 찾는 방식으로 진행하였다.

요청 URL은 다음과 같다.

```text
/post/{id}
```

확인하고 싶었던 내용은 다음과 같다.

- 상세 조회 요청의 응답 시간은 어느 정도인가
- 상세 조회 1회당 SQL이 몇 번 실행되나
- 불필요한 중복 조회가 존재하나

## 2. 측정 환경

- Java 17
- Spring Boot 4.0.1
- Spring Data JPA
- Thymeleaf
- MySQL
- P6Spy
- Spring Boot Actuator

로컬 환경에서 측정했다.

### 측정 방법

1. 서버를 재시작한다.
2. `http://localhost:8080/post/13` 페이지에 1회 접속한다.
3. 상세 조회 SQL이 몇 번 실행되는지 확인한다.
4. `http://localhost:8080/post/13` 페이지에 10회 접속한다.
5. Postman으로 Actuator 메트릭을 확인한다.
6. 같은 시점에 P6Spy SQL 로그를 함께 확인한다.

Actuator 메트릭 확인 URL은 다음과 같다.

```text
http://localhost:8080/actuator/metrics/http.server.requests?tag=uri:/post/%7Bid%7D
```

## 3. 개선 전 응답 시간

```json
{
  "availableTags": [
    {
      "tag": "exception",
      "values": ["none"]
    },
    {
      "tag": "method",
      "values": ["GET"]
    },
    {
      "tag": "error",
      "values": ["none"]
    },
    {
      "tag": "outcome",
      "values": ["SUCCESS"]
    },
    {
      "tag": "status",
      "values": ["200"]
    }
  ],
  "baseUnit": "seconds",
  "measurements": [
    {
      "statistic": "COUNT",
      "value": 10.0
    },
    {
      "statistic": "TOTAL_TIME",
      "value": 1.3060162
    },
    {
      "statistic": "MAX",
      "value": 0.9738692
    }
  ],
  "name": "http.server.requests"
}
```

위의 Actuator 메트릭을 표로 정리하면 다음과 같다.

| 지표 | 값 | 의미 |
|---|---:|---|
| COUNT | 10 | `/post/13` 페이지에 접속한 총 요청 횟수 |
| TOTAL_TIME | 1.306s | 전체 요청 처리 시간의 합 |
| MAX | 0.974s | 가장 오래 걸린 단일 요청 시간 |
| AVG | 약 0.131s(130ms) | `TOTAL_TIME / COUNT`로 계산한 평균 응답 시간 |

평균 응답 시간은 약 130ms이며, 가장 느린 요청은 약 974ms가 걸렸다.

즉, 전체 평균으로 보면 나쁘지 않지만, 일부 요청에서 지연이 발생했을 가능성이 있다.

## 4. 실행 SQL 분석

상세 조회 SQL이 몇 번 실행되는지 확인했다.

### 4.1 게시글 조회

```text
[SQL] 6ms
[PARAMS] [13]
```

```sql
select
    p1_0.id,
    p1_0.content,
    p1_0.created_at,
    p1_0.created_by,
    p1_0.member_id,
    p1_0.title,
    p1_0.updated_at,
    p1_0.updated_by,
    p1_0.view_count
from post p1_0
where p1_0.id=13
```

### 4.2 댓글 조회

```text
[SQL] 6ms
[PARAMS] [13]
```

```sql
select
    c1_0.post_id,
    c1_0.id,
    c1_0.content,
    c1_0.created_at,
    c1_0.created_by,
    c1_0.member_id,
    c1_0.updated_at,
    c1_0.updated_by
from comment c1_0
where c1_0.post_id=13
```

### 4.3 회원 조회

```text
[SQL] 2ms
[PARAMS] [15]
```

```sql
select
    m1_0.id,
    m1_0.created_at,
    m1_0.created_by,
    m1_0.email,
    m1_0.nickname,
    m1_0.password,
    m1_0.provider,
    m1_0.provider_id,
    m1_0.role,
    m1_0.updated_at,
    m1_0.updated_by
from member m1_0
where m1_0.id=15
```

### 4.4 게시글 count 조회

```text
[SQL] 6ms
[PARAMS] [13]
```

```sql
select
    count(*)
from post p1_0
where p1_0.id=13
```

### 4.5 댓글 재조회

```text
2026-03-26 16:08:05.074 [http-nio-8080-exec-1] INFO  p6spy -
[SQL] 0ms
[PARAMS] [0]
```

```sql
select
    c1_0.id,
    c1_0.content,
    c1_0.created_at,
    c1_0.created_by,
    c1_0.member_id,
    c1_0.post_id,
    c1_0.updated_at,
    c1_0.updated_by
from comment c1_0
where c1_0.post_id=13
order by c1_0.id
```

## 5. 발견한 문제

이번 측정에서 바로 확인된 현상은 다음과 같다.

| 확인된 현상 | 관찰 내용 | 다음 글에서 확인할 분석 포인트 |
|---|---|---|
| 댓글 조회 중복 | 댓글 조회 후 댓글 목록을 다시 조회한다. | View 렌더링 과정에서 댓글 목록을 중복 접근하는지 확인한다. |
| 게시글 count 조회 | 게시글 단건 조회와 별도로 `count(*)` 조회가 발생한다. | 댓글 수 조회 또는 존재 여부 확인 로직이 분리되어 있는지 확인한다. |
| 최대 응답 시간 증가 | 평균은 약 130ms지만, 가장 느린 요청은 약 974ms가 걸렸다. | 첫 요청 초기화 비용, 캐시 미적용 구간, Repository 호출 중복 여부를 확인한다. |

아직 원인을 단정할 단계는 아니다. 우선 P6Spy 로그에서 보이는 쿼리 흐름을 기준으로 Controller, Service, View 렌더링 과정에서 같은 데이터에 다시 접근하는 지점을 좁혀볼 필요가 있다.

## 6. 다음 개선 방향

1. 댓글 조회가 두 번 발생하는 지점을 Controller, Service, View 렌더링 관점에서 확인한다.
2. 게시글 count 조회가 어떤 코드 경로에서 발생하는지 확인한다.
3. 개선 후 Actuator / P6Spy 결과를 다시 측정해 개선 전후 차이를 비교한다.

이번 측정으로 성능 문제에 대해 막연히 추측하기보다는 먼저 측정하고 기록하는 과정이 중요하다는 것을 알게 되었다.

다음 글에서는 "[Board 프로젝트] 댓글 중복 조회 원인 분석"을 통해 댓글 조회가 두 번 발생한 원인을 Controller, Service, View 렌더링 관점에서 추적해볼 예정이다.

Actuator로 요청 시간을 확인했으니, 이후에는 Grafana를 적용해 요청 시간과 SQL 흐름을 시각화하는 방향도 함께 검토해보고 싶다.

## 7. 시리즈 확장 계획

이 글은 Board 프로젝트 성능 개선 시리즈의 첫 번째 기록이다.
이후 글은 아래 흐름으로 이어갈 예정이다.

1. [Board 프로젝트] 댓글 중복 조회 원인 분석
2. [Board 프로젝트] DTO 조회로 상세 페이지 쿼리 최적화
3. [Board 프로젝트] QueryDSL 도입 이유와 적용 과정
4. [Board 프로젝트] Docker + MySQL 로컬 환경 삽질 정리
