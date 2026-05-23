---
title: "[JPA] 10장_객체지향 쿼리 언어"
description: "자바 ORM 표준 JPA 프로그래밍 10장 - 객체지향 쿼리 언어"
date: 2026-05-23
updated: 2026-05-23
category: JPA
tags: ["JPA"]
series: "자바 ORM 표준 JPA 프로그래밍"
seriesOrder: 1
draft: false
---



## 0. 들어가기 전

- JPA는 복잡한 검색 조건을 사용해서 엔티티 객체를 조회할 수 있는 다양한 쿼리 지원 기술을 지원한다.
    - ex) JPQL, Criteira, QueryDSL과 같은 다양한 쿼리 기술
- JPQL은 가장 중요한 객체지향 쿼리 언어다.
- Criteira나 QueryDSL은 결국 JPQL을 편리하게 사용하도록 도와주는 기술이다.

---

## 10.1 객체지향 쿼리 소개

- 데이터를 데이터베이스에 있으므로 **SQL로 필요한 내용을 최대한 걸러서 조회**해야 한다.
    - **ORM**을 사용하면 테이블이 아닌 엔티티 객체를 대상으로 개발하므로 **검색도 테이블이 아닌 엔티티 객체를 대상으로 하는 방법**이 필요하다.
- JPQL은 위 문제를 해결하기 위해 만들어졌다.
    - 테이블이 아닌 객체를 대상으로 검색하는 객체지향 쿼리다.
    - SQL을 추상화해서 특정 데이터베이스 SQL에 의존하지 않는다.
    - 즉, 객체지향 SQL이다.

---

### 10.1.1 JPQL 소개

- **JPQL(Java Persistence Query Language)은 엔티티 객체를 조회하는 객체지향 쿼리다.**
- JPQL은 SQL을 추상화해서 특정 데이터베이스에 의존하지 않는다.
- JPQL은 엔티티 직접 조회, 묵시적 조인, 다형성 지원으로 SQL보다 코드가 간결하다.

```java
String jpql = "select m from Member as m where m.username = 'kim'";
List<Member> resultList = 
            em.createQuery(jpal, Member.class).getResultList();
```

---

### 10.1.2 Criteria 쿼리 소개

- Criteria은 **JPQL을 생성하는 빌더 클래스**다.
- 문자가 아닌 `query.select(m).where(…)`  처럼 프로그래밍 코드로 JPQL을 작성할 수 있다는 점이다.
- JPQL에서 `select m from Memberbee m` 처럼 오타가 있다고 가정해도 컴파일은 성공해서 애플리케이션을 서버에 배포할 수 있다.
    - 문제는 해당 쿼리가 실행되는 **런타임 시점에 오류가 발생**한다는 점이다.
- Criteria의 장점
    - 컴파일 시점에 오류를 발견할 수 있다.
    - IDE를 사용하면 코드 자동완성을 지원한다.
    - 동적 쿼리를 작성하기 편하다.

```java
//Criteria 사용준비
CriteriaBuilder cb = em.getCriteriaBuilder();
CriteriaQuery<Member> query = cb.createQuery(Member.class);

//루트 클래스 (조회를 시작할 클래스)
Root<Member> m = query.from(Member.class);

//쿼리 생성
CriteriaQuery<Member> cq =
  query.select(m).where(cb.equal(m.get("usernamen), "kim"));
List<Meinber> resultList = em.createQuery(cq).getResultList();
```

- 자바가 제공하는 **어노테이션 프로세서** 기능을 사용하면 어노테이션을 분석해서 클래스를 생성할 수 있다.
    - JPA는 이 기능을 사용하여 Member 엔티티 클래스로부터 Member_라는 Criteria 전용 클래스를 생성하는데 이를 **메타 모델**이라고 한다.
    
    ```java
    // 메타 모델 사용 전 -> 사용 후
    m.get("username") -> m.get(Member_.useraname);
    ```
    
- **Criteria가 가진 장점이 많지만 모든 장점을 상쇄할 정도로 복잡하고 장황한다.**
    - Criteria로 작성한 코드가 한 눈에 들어오지 않는다는 단점이 있다.

<aside>
🎯

 **어노테이션 프로세서**

자바 **컴파일 과정**에서 특정 어노테이션을 읽고, 그 정보를 기반으로 **새로운 Java 코드를 생성하거나 컴파일 검사를 수행하는 도구**

대표적으로 Lombok, Querydsl, MapStruct 등이 있다.

Spring의 `@Service`, `@Controller`, `@Transactional` 같은 어노테이션은 보통 런타임에 처리되지만, Lombok이나 Querydsl의 어노테이션은 컴파일 타임에 처리된다는 점이 중요하다.

</aside>

---

### 10.1.3 QueryDSL 소개

- QueryDSL도 Criteria처럼 JPQL 빌더 역할을 한다.
- QueryDSL은 코드 기반이면서 단순하고 사용하기 쉽다.

```java
// 준비
JPAQuery query = new JPAQUery(em);
QMember member = QMember.member;

// 쿼리, 결과조회
List<Member> members = 
        query.from(member)
        .where(member.username.eq("kim"))
        .list(member);
```

---

### 10.1.4 네이티브 SQL 소개

- JPQL은 **SQL을 직접 사용할 수 있는 기능을 지원**하는데 이것을 네이티브 SQL이라한다.
- JPQL을 사용해도 특정 데이터베이스에 의존하는 기능을 사용해야 할 때가 있다.
    - 오라클에서 사용하는 CONNECT BY 기능이나 특정 DB에서만 동작하는 SQL 힌트 같은 것
    - 이러한 기능들은 표준화되어 있지 않으므로 JPQL에서 사용할 수 없다.
- 네이티브 SQL의 단점은 **특정 데이터베이스에 의존하는 SQL을 작성**해야 한다는 것이다.

```java
String sql = "SELECT ID, AGE, TEAM_ID, NAME FROM MEMBER WHERE NAME = 'kim'";

List<Member> resultList =
  em.createNativeQuery(sql, Member.class).getResultList();
```

---

### 10.1.5 JDBC 직접 사용, 마이바티스 같은 SQL 매퍼 프레임워크 사용

- JDBC 커넥션에 직접 접근하고 싶으면 JPA는 JDBC 커넥션을 획득하는 API를 제공하지 않으므로 JPA 구현체가 제공하는 방법을 사용해야 한다.

```java
Session session = em.unwrap(Session.class);
session.doWork(new Wordk() {
        @override
        public void execute(Connection connection) throws SQLException { 
                //work..
        }
};
```

- **JDBC나 마이바티스를 JPA와 함께 사용하면 영속성 컨텍스트를 적절한 시점에 강제로 플러시해야 한다.**

---

## 10.2 JPQL

![스크린샷 2026-05-01 135715.png](%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7_2026-05-01_135715.png)

![스크린샷 2026-05-01 135722.png](%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7_2026-05-01_135722.png)

- 회원이 상품을 주문하는 다대다 관계.
- Address는 임베디드 타입인데 이것은 값 타입이므로 UML에서 스테레오 타입을 사용해 <<Value>>로 정의했다.

---

### 10.2.1 기본 문법과 쿼리 API

```java
select_문 :: =  
    select_절 
    from_절 
    [where_절] 
    [groupby_절] 
    [having_절] 
    [orderby_절] 
    
update_문 :: = update_절 [where_절] 
delete_문 :: = delete_절 [where_절
```

- JPQL도 SQL과 비슷하게 SELECT, UPDATE, DELETE 문을 사용할 수 있다.
- 엔티티를 저장할 때는 EntityManager.persist() 매소드를 사용하면 되므로 INSERT 문은 없다.

#### SELECT 문

```sql
SELECT m FROM Member AS m where m.username = "Hello"
```

- 대소문자 구분
    - 엔티티와 속성은 대소문자를 구분한다. 예를 들어 Member, username은 대소문자를 구분한다.
    - 반면 SELECT, FROM, AS 같은 JPQL 키워드는 대소문자를 구분하지 않는다.
- 엔티티 이름
    - JPQL에서 사용한 Member는 클래스 명이 아니라 엔티티 명이다.
- 별칭은 필수
    - Member AS m을 보면 Member에 m 이라는 별칭을 주었다.
    - AS는 생략할 수 있다. 따라서 Member m 처럼 사용해도 된다.

#### TypeQuery, Query

작성한 JPQL을 실행하려면 쿼리 객체를 만들어야 한다.