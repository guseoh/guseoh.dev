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

자바는 클래스 기반의 객체지향 프로그래밍 언어다. 자바로 프로그램을 작성할 때는 클래스를 정의하고, 클래스를 기반으로 객체를 생성하여 사용한다. Spring Boot에서 사용하는 `Controller`, `Service`, `Repository`, `DTO`, `Entity`도 대부분 자바 클래스로 정의되며, 애플리케이션이 실행되면 이러한 클래스를 기반으로 객체가 생성되어 각자의 역할을 수행한다.

```java
Member member = new Member();
```

`Member`는 개발자가 정의한 클래스이자 타입이고, `new Member()`가 실행되면 `Member` 클래스를 기반으로 새로운 객체가 생성된다. 생성된 객체는 `Member` 클래스의 인스턴스라고 표현할 수 있다.

이번 글에서는 클래스와 객체, 인스턴스의 차이와 관계를 중심으로 알아본다. 참조형 변수에 저장되는 값, 참조값 복사, `null`, `==`와 `equals()`는 이전 글에서 다루었다.

* https://guseoh.github.io/blog/java/%EA%B8%B0%EB%B3%B8%ED%98%95%EA%B3%BC%EC%B0%B8%EC%A1%B0%ED%98%95/java_type/

필드와 메서드, 생성자와 `this`, 접근 제한자, `static`과 `final`은 이후 글에서 각각 자세히 다룬다.

## 2. 클래스는 무엇일까?

클래스는 자바 프로그램에서 사용할 새로운 타입을 정의한다. 또한 같은 종류의 객체들이 따라야 할 공통된 구조와 특성을 나타낸다.

```java
class Member { ... }
```

`class` 키워드를 사용해 `Member`라는 이름의 클래스를 선언했다. 클래스 내부에 아무 내용이 없더라도 이 선언을 통해 자바 프로그램에서 `Member`라는 타입을 사용할 수 있다.

```java
Member member;
```

위 코드에서 `Member`는 타입이고 `member`는 변수 이름이다. `int`, `long`, `boolean`은 자바에서 기본으로 제공하는 타입이지만, `Member`는 개발자가 클래스를 선언하여 직접 정의한 타입이다.

게시판 프로그램에서는 회원, 게시글, 댓글과 같은 개념이 필요하다. 이러한 개념을 각각 클래스로 정의할 수 있다.

```java
class Member {
}

class Post {
}

class Comment {
}
```

선언한 클래스는 프로그램에서 각각 독립된 타입으로 사용된다.

```java
Member member;
Post post;
Comment comment;
```

`Member`는 회원을 나타내고, `Post`는 게시글을 나타내며, `Comment`는 댓글을 나타낸다. 이처럼 클래스를 선언한다는 것은 단순히 여러 코드를 하나로 묶는 것이 아니라 프로그램에서 다룰 개념을 **하나의 타입으로 정의**하는 일이다.

### 2.1 클래스는 객체들의 공통 정의다

게시판 서비스에는 여러 회원이 존재할 수 있다. 각 회원은 서로 다른 대상이지만 모두 회원이라는 공통된 개념에 속한다. 자바에서는 `Member` 클래스가 여러 회원 객체에 대한 공통된 정의가 된다.

`Post` 클래스는 여러 게시글 객체의 공통된 정의가 되고, `Comment` 클래스는 여러 댓글 객체의 공통된 정의가 된다. 클래스 하나를 정의한 뒤 해당 클래스를 기반으로 같은 종류의 객체를 여러 개 생성할 수 있다.

클래스 내부에는 객체가 가질 상태와 행동을 정의할 수 있다. 상태와 행동을 실제 코드로 표현하는 필드와 메서드는 다음 글에서 자세히 다룬다.

### 2.2 클래스는 설계도일까?

클래스는 흔히 객체를 만들기 위한 설계도에 비유한다. 자동차 설계도가 실제 자동차들이 따라야 할 공통된 구조를 정의하듯이, `Member` 클래스는 회원 객체들이 따라야 할 공통된 구조와 특성을 정의한다.

설계도라는 비유는 클래스와 객체의 차이를 이해하는 데 유용하지만 클래스는 단순한 객체 생성 틀보다 더 넓은 의미를 가진다. 클래스는 자바 프로그램에서 사용할 새로운 타입을 만들고, 회원이나 게시글처럼 프로그램에서 다루는 개념을 구분하는 역할도 한다.

따라서 **클래스는 객체들의 공통된 정의이면서 개발자가 프로그램에 필요한 타입을 직접 선언하는 수단**이라고 이해할 수 있다.

## 3. 객체는 무엇일까?

객체는 클래스를 기반으로 프로그램 실행 중 실제로 생성된 실체다.

```java
class Member { ... }
```

클래스를 선언했다고 해서 실행 중인 `Member` 객체가 자동으로 만들어지는 것은 아니다. 클래스 선언은 `Member`라는 타입과 객체들이 따를 공통된 정의를 제공한다.

실제 객체는 다음과 같은 객체 생성 표현식이 실행될 때 만들어진다.

```java
new Member();
```

생성한 객체를 프로그램에서 계속 사용하려면 다음과 같이 변수와 연결할 수 있다.

```java
Member member = new Member();
```

위 코드는 객체를 생성하고 `member`를 통해 해당 객체를 사용할 수 있게 한다.

### 3.1 하나의 클래스로 여러 객체를 생성할 수 있다

하나의 클래스를 기반으로 여러 객체를 생성할 수 있다.

```java
Member firstMember = new Member();
Member secondMember = new Member();
Member thirdMember = new Member();
```

`Member` 클래스는 하나지만 `new Member()`가 세 번 실행되었으므로 `Member` 객체도 세 개 생성된다. 세 객체는 모두 같은 클래스에서 만들어진 같은 종류의 객체지만, 프로그램 실행 중에는 각각 별개의 대상을 나타낸다.

예를 들어 첫 번째 객체는 `kim` 회원을, 두 번째 객체는 `lee` 회원을, 세 번째 객체는 `park` 회원을 나타낼 수 있다. 세 회원이 모두 `Member`라는 공통된 타입에 속하지만 실제로는 서로 다른 회원인 것과 같다.

**같은 클래스를 기반으로 생성되었다는 것은 객체들이 공통된 구조와 특성을 따른다는 의미다. 여러 객체가 하나의 동일한 대상이라는 의미는 아니다.**

### 3.2 객체는 구체적인 대상을 표현한다

클래스가 프로그램에서 다룰 공통된 개념을 정의한다면 객체는 실행 중인 구체적인 대상을 표현한다.

`Member` 클래스는 회원이라는 공통된 개념을 정의하고, `Member` 객체 하나는 실제 회원 한 명을 나타낸다. `Post` 클래스는 게시글이라는 공통된 개념을 정의하고, `Post` 객체 하나는 실제 게시글 하나를 나타낸다.

```java
Member member = new Member();
Post post = new Post();
Comment comment = new Comment();
```

위 코드에서 만들어진 객체들은 각각 회원, 게시글, 댓글이라는 구체적인 대상을 나타낸다. 프로그램은 이렇게 생성된 여러 객체가 자신의 역할을 수행하고 서로 협력하는 방식으로 동작한다.

## 4. 객체와 인스턴스는 무엇이 다를까?

```java
Member member = new Member();
```

`new Member()`로 만들어진 대상을 프로그램 실행 중 실제로 존재하는 대상이라는 관점에서 부르면 객체라고 할 수 있다. 이 객체가 `Member` 클래스를 기반으로 만들어졌다는 관계를 표현할 때는 `Member` 클래스의 인스턴스라고 할 수 있다.

따라서 “Member 객체를 생성했다”와 “Member 클래스의 인스턴스를 생성했다”는 모두 자연스러운 표현이다. **객체는 실행 중인 대상을 일반적으로 가리키는 표현**이고, **인스턴스는 해당 객체가 어떤 클래스에서 만들어졌는지**를 함께 나타내는 표현이다.

실무에서는 두 용어를 엄격하게 나누지 않고 비슷한 의미로 사용하기도 한다. 다만 인스턴스라는 표현을 사용할 때는 `Member 클래스의 인스턴스`, `Post 클래스의 인스턴스`처럼 어떤 클래스와의 관계를 말하는지 함께 드러내는 것이 자연스럽다.

<!-- table-caption: 객체와 인스턴스 차이 -->

| 구분  | 객체                     | 인스턴스                |
| --- | ---------------------- | ------------------- |
| 의미  | 프로그램 실행 중 실제로 생성된 실체   | 특정 클래스를 기반으로 생성된 객체 |
| 강조점 | 실제로 존재하는 대상            | 클래스와 객체 사이의 관계      |
| 예시  | `new Member()`로 생성된 객체 | `Member` 클래스의 인스턴스  |


### 4.1 인스턴스화

클래스를 기반으로 실제 객체를 생성하는 과정을 **인스턴스화**라고 한다.

```java
Member member = new Member();
```

위 코드에 대해서는 `Member 객체를 생성했다`, `Member 클래스의 인스턴스를 생성했다`, `Member 클래스를 인스턴스화했다`라고 표현할 수 있다. 세 표현은 같은 객체 생성 과정을 서로 다른 관점에서 설명한다.

## 5. 클래스와 객체를 사용하는 이유

클래스와 객체를 사용하면 프로그램에서 다루는 개념을 코드에 명확하게 표현할 수 있다.

게시판 프로그램에는 회원, 게시글, 댓글, 게시판과 같은 개념이 존재한다. 각 개념을 클래스로 정의하면 타입만 확인해도 코드가 어떤 대상을 다루는지 파악할 수 있다.

```java
class Member { ...}

class Post { ... }

class Comment { ... }

class Board { ... }
```

```java
Member member;
Post post;
Comment comment;
Board board;
```

단순히 `String value`라고 선언하면 문자열이라는 사실만 알 수 있지만, `Member member`라고 선언하면 회원을 다루고 있다는 의미가 타입에 직접 드러난다.

```java
String value;
Member member;
```

클래스는 서로 다른 개념을 타입으로 구분하는 역할도 한다. 회원과 게시글을 `Member`와 `Post`라는 별도의 클래스로 정의하면 자바는 두 대상을 서로 다른 타입으로 구분한다.

```java
Member member = new Member();
Post post = new Post();
```

또한 새로운 회원이 추가될 때마다 `KimMember`, `LeeMember`, `ParkMember`처럼 별도의 클래스를 정의할 필요가 없다. 공통된 `Member` 클래스를 하나 정의하고 필요한 수만큼 객체를 생성하면 된다.

```java
Member kim = new Member();
Member lee = new Member();
Member park = new Member();
```

클래스는 같은 종류의 대상들이 공유할 정의를 제공하고, 각 객체는 프로그램 실행 중 존재하는 개별 대상을 표현한다.

## 6. Spring Boot에서의 클래스와 객체

Spring Boot 애플리케이션도 자바의 클래스와 객체를 기반으로 동작한다.

다음은 회원 서비스를 나타내는 클래스다.

```java
@Service
class MemberService {
}
```

`MemberService`는 회원 서비스라는 역할을 정의한 클래스다. Spring은 애플리케이션을 실행하면서 필요한 객체를 생성하고 관리한다. Spring이 생성하고 관리하는 객체를  이라고 한다.

따라서 `MemberService`는 클래스 또는 타입이고, Spring이 해당 클래스를 기반으로 생성한 대상은 `MemberService` 객체이자 인스턴스다. 이 객체가 Spring 컨테이너에 의해 관리될 때 Spring Bean이라고 부른다.

Controller와 Service도 각각 클래스로 정의된다.

```java
@RestController
class MemberController {
}
```

```java
@Service
class MemberService {
}
```

`MemberController` 클래스는 회원 관련 요청을 처리하는 역할을 나타내고, `MemberService` 클래스는 회원 관련 애플리케이션 로직을 처리하는 역할을 나타낸다. 애플리케이션이 실행되면 각 클래스를 기반으로 객체가 생성되고, 실제 요청은 실행 중인 객체들의 협력을 통해 처리된다.

JPA Entity도 클래스로 정의한다.

```java
@Entity
class Member {
}
```

`Member`는 회원 Entity의 공통된 구조를 정의하는 클래스이고, 애플리케이션 실행 중 만들어진 `Member` 객체는 구체적인 회원 데이터를 표현한다.

DTO도 같은 방식이다.

```java
class MemberResponse {
}
```

`MemberResponse` 클래스는 회원 응답의 형식을 정의하고, 실제로 생성된 `MemberResponse` 객체는 특정 회원의 응답 데이터를 나타낸다.

Controller, Service, Repository, Entity, DTO는 담당하는 역할은 다르지만 모두 클래스로 정의되고 실행 중에는 객체로 사용된다는 공통점이 있다.

## 7. 정리

클래스는 자바 프로그램에서 사용할 새로운 타입을 정의하고, 같은 종류의 객체들이 따를 공통된 구조와 특성을 나타낸다.

```java
class Member {
}
```

클래스를 선언하면 해당 클래스를 타입으로 사용할 수 있다.

```java
Member member;
```

객체는 클래스를 기반으로 프로그램 실행 중 실제로 생성된 실체다.

```java
Member member = new Member();
```

하나의 클래스를 기반으로 여러 객체를 생성할 수 있다.

```java
Member firstMember = new Member();
Member secondMember = new Member();
Member thirdMember = new Member();
```

세 객체는 모두 `Member` 클래스에서 만들어진 같은 종류의 객체지만 각각 별개의 대상을 나타낸다. 객체가 특정 클래스를 기반으로 생성되었다는 관계를 표현할 때 해당 클래스의 인스턴스라고 하며, 클래스를 기반으로 객체를 생성하는 과정은 인스턴스화라고 한다.

클래스와 객체를 사용하면 회원, 게시글, 댓글처럼 프로그램에서 다루는 개념을 각각 타입과 실행 중인 실제 대상으로 표현할 수 있다. Spring Boot에서도 Controller, Service, Repository, Entity, DTO를 클래스로 정의하고, 애플리케이션 실행 중에는 해당 클래스의 객체가 생성되어 각자의 역할을 수행한다.

참조 변수에 저장되는 값, 참조값 복사, `null`, `==`와 `equals()`는 이전 글에서 확인할 수 있다.


## 8. 참고 자료

* https://docs.oracle.com/javase/specs/jls/se26/html/jls-8.html
* https://docs.oracle.com/javase/specs/jls/se26/html/jls-15.html#jls-15.9
* https://dev.java/learn/oop/
* https://dev.java/learn/classes-objects/
* https://dev.java/learn/classes-objects/creating-classes/
* https://dev.java/learn/classes-objects/creating-objects/
* https://techblog.woowahan.com/2502/
* https://techblog.woowahan.com/2555/
* https://tech.kakao.com/posts/431
* https://engineering.linecorp.com/ko/blog/templete-method-pattern/
* https://engineering.linecorp.com/ko/blog/code-readability-vol2
* https://tech.kakaopay.com/post/jvm-warm-up/
