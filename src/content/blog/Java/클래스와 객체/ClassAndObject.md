---
title: "자바의 클래스와 객체는 무엇일까?"
description: "자바의 클래스와 객체 차이부터 인스턴스, 객체 생성, 참조 변수와 객체의 관계까지 알아보자."
date: 2026-06-16
updated: 2026-06-16
category: "Java"
tags:
  - Java
  - Class
  - Object
book: ""
chapter: 1
heroImage: "/og-image.svg"
draft: true
---

## 1. 들어가기 전

자바는 클래스 기반의 [객체지향 프로그래밍 언어](https://developer.mozilla.org/ko/docs/Learn_web_development/Extensions/Advanced_JavaScript_objects/Object-oriented_programming)다. 자바로 프로그램을 작성하다 보면 수많은 클래스를 선언하고, 클래스를 기반으로 객체를 생성해서 사용한다.  

Spring Boot에서 사용하는 Controller, Service, Repository, DTO, Entity도 모두 자바 클래스로 정의된다. Spring은 이러한 클래스를 확인하여 필요한 객체를 생성하고, 객체들이 서로 협력할 수 있도록 관리한다.

```java
Member member = new Member();
```

- `Member`는 클래스이자 타입이다.
- `member`는 참조 변수다.
- `new Member()`는 새로운 객체를 생성한다.
- 생성된 객체는 `Member` 클래스의 인스턴스다.
- 객체를 가리키는 참조값이 `member` 변수에 저장된다.

클래스와 객체를 이해하려면 다음 용어들의 차이를 구분할 수 있어야 한다.

| 용어 | 의미 |
|---|---|
| 클래스 | 객체의 구조와 특성을 정의한 타입 |
| 객체 | 프로그램 실행 중 실제로 생성된 실체 |
| 인스턴스 | 특정 클래스를 기반으로 생성된 객체 |
| 참조 변수 | 객체를 가리키는 참조값을 저장하는 변수 |

## 2. 클래스는 무엇일까?

클래스는 **객체가 어떤 상태와 행동**을 가질 수 있는지 정의한 것이다.

```java
public class Member {...}
```

Member라는 이름의 클래스를 선언했다. 현재 클래스 내부에는 별도의 내용이 없지만, 이 선언만으로 자바 프로그램에서 Member라는 새로운 타입을 사용할 수 있다.

```java
Member member;
```

위 코드는 `Member` 타입의 변수 `member`를 선언한다. 아직 객체를 생성한 것은 아니며 `Member` 타입의 **객체를 가리킬 수 있는 변수만 준비**한 상태다.

### 2.1 클래스는 개발자가 정의하는 타입이다

개발자가 클래스를 선언하면 직접 만든 클래스도 하나의 타입으로 사용할 수 있다.

```java
public class Member { ... }

Member member;
```

`Member`는 개발자가 정의한 참조형 타입이다. `Member` 타입의 변수에는 `Member` 객체를 가리키는 참조값을 저장할 수 있다.

::link-mention{
  url="https://guseoh.github.io/blog/java/%EA%B8%B0%EB%B3%B8%ED%98%95%EA%B3%BC%EC%B0%B8%EC%A1%B0%ED%98%95/java_type/#4-%EC%B0%B8%EC%A1%B0%ED%98%95%EC%9D%80-%EA%B0%9D%EC%B2%B4%EB%A5%BC-%EA%B0%80%EB%A6%AC%ED%82%A4%EB%8A%94-%EC%B0%B8%EC%A1%B0%EA%B0%92%EC%9D%84-%EC%82%AC%EC%9A%A9%ED%95%9C%EB%8B%A4/"
  title="참조형 타입"
  description="기본형과 참조형 타입"
}

클래스를 선언한다는 것은 단순히 코드를 묶는 것이 아니라 **프로그램에서 사용할 새로운 개념과 타입을 정의**하는 일이다.

### 2.2 클래스에는 무엇을 정의할 수 있을까?

클래스에는 객체가 가질 상태와 행동을 정의할 수 있다.