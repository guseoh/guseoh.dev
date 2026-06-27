---
title: "[Java] 자바의 클래스와 객체는 무엇일까?"
description: "자바에서 클래스가 타입을 정의하는 방식과 클래스를 기반으로 객체가 생성되는 과정, 객체와 인스턴스의 관계를 알아보자."
date: 2026-06-16
updated: 2026-06-27
category: "Java"
slug: "java/클래스와-객체/classandobject"
commentKey: "/blog/java/클래스와-객체/classandobject/"
tags:
  - Java
  - Class
  - Object
book: ""
chapter: 1
heroImage: "/og-image.svg"
draft: false
---

## 1. 들어가기 전

자바 프로그램에서는 클래스를 정의하고, 클래스를 기반으로 객체를 만들어 사용한다.

```java
Member member = new Member();
```

짧은 코드지만 클래스, 타입, 객체와 참조 변수라는 여러 개념이 함께 들어 있다.

`Member`는 개발자가 선언한 클래스이자 변수의 타입이다. `new Member()`가 실행되면 `Member` 클래스를 기반으로 객체가 생성되고, `member` 변수에는 생성된 객체에 접근하기 위한 참조값이 저장된다.

참조형 변수와 참조값에 관한 자세한 내용은 이전 글에서 다루었다.

* [자바의 기본형과 참조형은 무엇일까?](https://guseoh.github.io/blog/java/%EA%B8%B0%EB%B3%B8%ED%98%95%EA%B3%BC%EC%B0%B8%EC%A1%B0%ED%98%95/java_type/)

이번 글에서는 클래스가 무엇을 정의하고, 객체가 언제 만들어지며, 객체와 인스턴스라는 용어를 어떤 관점에서 사용하는지 살펴본다.

## 2. 클래스는 새로운 타입을 정의한다

자바에서는 `class` 키워드로 클래스를 선언한다.

```java
class Member {
}
```

이 선언으로 자바 프로그램 안에 `Member`라는 새로운 클래스 타입이 생긴다. 이제 `Member`를 변수의 타입으로 사용할 수 있다.

```java
Member member;
```

`Member`는 타입이고 `member`는 변수 이름이다.

`int`, `long`, `boolean`은 자바가 미리 제공하는 기본형 타입이다. `Member`는 개발자가 클래스 선언으로 직접 만든 참조형 타입이다.

프로그램에서 회원, 게시글, 댓글을 서로 다른 개념으로 다루고 싶다면 각각의 클래스로 표현할 수 있다.

```java
class Member {
}

class Post {
}

class Comment {
}
```

선언한 클래스는 서로 다른 타입이 된다.

```java
Member member;
Post post;
Comment comment;
```

변수의 타입만 보더라도 어떤 종류의 대상을 다루는지 알 수 있다. `Member` 변수에는 `Member` 타입의 객체를, `Post` 변수에는 `Post` 타입의 객체를 연결한다.

클래스 내부에는 같은 종류의 객체가 가져야 할 상태와 행동도 정의할 수 있다.

```java
class Member {

    String name;

    void changeName(String newName) {
        name = newName;
    }
}
```

`Member` 클래스를 기반으로 생성되는 객체는 `name`이라는 상태와 `changeName()`이라는 행동을 가질 수 있다.

필드와 메서드의 구체적인 선언 방법은 다음 글에서 자세히 다룬다. 여기서는 클래스가 같은 종류의 객체들이 따를 공통된 정의를 제공한다는 점만 확인하면 된다.

### 클래스와 설계도 비유

클래스는 객체를 만들기 위한 설계도에 자주 비유된다. 하나의 설계도를 바탕으로 여러 제품을 만들 수 있듯이, 하나의 클래스를 바탕으로 여러 객체를 생성할 수 있기 때문이다.

이 비유는 클래스와 객체를 처음 구분할 때 도움이 된다. 다만 클래스의 역할은 객체 생성에만 머물지 않는다. 클래스 선언은 자바 프로그램에서 사용할 타입을 만들고, 프로그램에서 다루는 개념을 서로 구분한다.

따라서 클래스는 **객체들의 공통된 정의이면서 자바 프로그램에서 사용할 타입을 선언하는 문법**으로 이해하는 편이 정확하다.

## 3. 객체는 실행 중에 생성된다

클래스를 선언했다고 해서 해당 클래스의 객체가 바로 만들어지는 것은 아니다.

```java
class Member {
}
```

이 코드는 `Member` 타입과 객체들이 따를 공통된 정의를 만든다. 실제 객체는 클래스 인스턴스 생성 표현식이 실행될 때 생성된다.

```java
new Member();
```

`new Member()`는 새로운 `Member` 객체를 생성한다. 생성된 객체를 이후 코드에서 사용하려면 참조 변수를 연결해야 한다.

```java
Member member = new Member();
```

이 코드는 다음 과정으로 이해할 수 있다.

```text
Member          member          =          new Member();
타입            변수 이름                  객체 생성
```

오른쪽의 `new Member()`가 객체를 생성하고, 생성된 객체를 가리키는 참조값이 왼쪽의 `member` 변수에 저장된다.

참조 변수와 객체는 같은 대상이 아니다. `member`는 객체에 접근하기 위해 사용하는 변수이고, 실제 객체는 `new Member()`에 의해 생성된 실행 중의 실체다.

### 하나의 클래스로 여러 객체를 만든다

같은 클래스를 기반으로 객체를 여러 개 생성할 수 있다.

```java
Member firstMember = new Member();
Member secondMember = new Member();
Member thirdMember = new Member();
```

`Member` 클래스는 하나지만 `new Member()`가 세 번 실행되었으므로 객체도 세 개 만들어진다.

각 객체는 같은 클래스에 정의된 구조와 행동을 따르지만 실행 중에는 서로 독립된 대상이다.

```java
firstMember.name = "kim";
secondMember.name = "lee";
thirdMember.name = "park";

System.out.println(firstMember.name);  // kim
System.out.println(secondMember.name); // lee
System.out.println(thirdMember.name);  // park
```

세 객체는 모두 `name` 필드를 가지지만 각 객체가 보관하는 값은 서로 다르다. `firstMember`의 이름을 변경해도 `secondMember`와 `thirdMember`의 이름은 바뀌지 않는다.

클래스가 같은 종류의 객체에 적용되는 공통 정의를 제공한다면, 객체는 그 정의를 바탕으로 실행 중에 만들어진 개별 대상을 표현한다.

게시판 프로그램이라면 `Member` 객체 하나는 회원 한 명을, `Post` 객체 하나는 게시글 하나를 나타낼 수 있다.

```java
Member member = new Member();
Post post = new Post();
Comment comment = new Comment();
```

프로그램은 이렇게 생성된 객체들이 메서드를 호출하고 필요한 값을 주고받으며 동작한다.

## 4. 객체와 인스턴스는 어떤 차이가 있을까?

다음 코드로 생성된 대상을 객체라고 부를 수도 있고 인스턴스라고 부를 수도 있다.

```java
Member member = new Member();
```

**객체(Object)** 는 프로그램 실행 중 생성된 대상을 일반적으로 가리키는 표현이다.

**인스턴스(Instance)** 는 해당 객체가 어떤 클래스나 타입을 기반으로 만들어졌는지에 초점을 맞춘 표현이다. 위 코드에서 생성된 객체는 `Member` 클래스의 인스턴스다.

| 구분  | 객체               | 인스턴스                |
| --- | ---------------- | ------------------- |
| 의미  | 프로그램 실행 중 생성된 실체 | 특정 클래스를 기반으로 생성된 객체 |
| 강조점 | 실행 중 존재하는 대상     | 클래스와 객체 사이의 관계      |
| 표현  | `Member` 객체      | `Member` 클래스의 인스턴스  |

실제 코드나 대화에서는 두 용어를 엄격하게 구분하지 않고 비슷한 뜻으로 사용하기도 한다.

다만 인스턴스라는 표현은 보통 기준이 되는 클래스를 함께 말한다.

```text
Member 클래스의 인스턴스
Post 클래스의 인스턴스
Comment 클래스의 인스턴스
```

클래스를 기반으로 객체를 생성하는 과정은 **인스턴스화(Instantiation)** 라고 한다.

```java
Member member = new Member();
```

이 코드에 대해서는 다음 표현을 모두 사용할 수 있다.

* `Member` 객체를 생성했다.
* `Member` 클래스의 인스턴스를 생성했다.
* `Member` 클래스를 인스턴스화했다.

표현이 가리키는 과정은 같지만 관점이 다르다. 객체라는 표현은 생성된 대상을, 인스턴스라는 표현은 그 대상과 클래스의 관계를 강조한다.

클래스와 객체의 관계를 하나로 정리하면 다음과 같다.

```text
클래스 선언
    ↓
프로그램에서 사용할 타입과 공통 정의 생성
    ↓
new 표현식 실행
    ↓
객체 생성
    ↓
특정 클래스와의 관계에서 인스턴스라고 표현
```

클래스는 회원이나 게시글처럼 프로그램에서 다룰 개념을 타입으로 구분한다. 객체는 해당 타입을 바탕으로 실행 중에 만들어진 개별 대상을 나타낸다.

## 5. 참고 자료

### 공식 자료

* [Java Language Specification 26 - Chapter 8. Classes](https://docs.oracle.com/javase/specs/jls/se26/html/jls-8.html)

* [Java Language Specification 26 - Class Instance Creation Expressions](https://docs.oracle.com/javase/specs/jls/se26/html/jls-15.html#jls-15.9)

* [Dev.java - Creating Classes](https://dev.java/learn/classes-objects/creating-classes/)

* [Dev.java - Creating and Using Objects](https://dev.java/learn/classes-objects/creating-objects/)

### 한글 참고 링크

* [우아한형제들 기술블로그 - 생각하라, 객체지향처럼](https://techblog.woowahan.com/2502/)

* [Inpa Dev - 자바 객체 지향 클래스 문법 총정리](https://inpa.tistory.com/entry/JAVA-%E2%98%95-%EA%B0%9D%EC%B2%B4-%EC%A7%80%ED%96%A5OOP-%ED%81%B4%EB%9E%98%EC%8A%A4-%EB%AC%B8%EB%B2%95-%F0%9F%92%AF-%EC%B4%9D%EC%A0%95%EB%A6%AC)

* [MangKyu's Diary - 객체에게 역할과 책임을 부여하는 객체 지향 프로그래밍](https://mangkyu.tistory.com/400)
