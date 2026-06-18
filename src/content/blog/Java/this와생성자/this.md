---
title: "자바의 this와 생성자는 무엇일까?"
description: "자바 생성자의 역할과 기본 생성자, 객체 초기화, this와 this()의 사용 방법을 알아보자."
date: 2026-06-18
updated: 2026-06-18
category: "Java"
tags:
    - Java
    - Constructor
    - this
book: ""
chapter: 1
heroImage: "/og-image.svg"
draft: false
---

## 1. 들어가기 전

이전 글에서는 객체의 상태를 필드로 표현하고, 행동을 메서드로 구현하는 방법을 살펴봤다. 하지만 필드만 선언한 클래스는 객체를 생성한 뒤 필요한 값을 따로 대입해야 하며, 값을 설정하지 않으면 불완전한 상태의 객체가 만들어질 수 있다.

생성자(Constructor)는 **객체가 생성될 때 필요한 값을 전달받아 초기 상태를 완성하는 역할**을 한다. `this`는 현재 생성자나 인스턴스 메서드가 실행되고 있는 객체 자신을 가리키며, 필드와 매개변수를 구분하거나 같은 클래스의 다른 생성자를 호출할 때 사용한다.

```java
class Member {

    String email;
    String nickname;
    int loginCount;

    Member() {
        this("guest@example.com", "guest", 0);
    }

    Member(String email, String nickname) {
        this(email, nickname, 0);
    }

    Member(String email, String nickname, int loginCount) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("이메일은 비어 있을 수 없습니다.");
        }

        if (nickname == null || nickname.isBlank()) {
            throw new IllegalArgumentException("닉네임은 비어 있을 수 없습니다.");
        }

        this.email = email;
        this.nickname = nickname;
        this.loginCount = loginCount;
    }
}
```

위 클래스에는 세 개의 생성자가 있다. 매개변수가 없는 생성자는 정해진 기본값으로 객체를 만들고, 두 개의 값을 받는 생성자는 로그인 횟수를 `0`으로 설정한다. 값의 검증과 필드 초기화는 세 개의 값을 받는 생성자 한 곳에서 처리한다.

이번 글에서는 생성자의 역할과 특징, 기본 생성자, `this`, `this()`를 살펴본다. 생성자 오버로딩의 세부 규칙은 이후 오버로딩과 오버라이딩 글에서 다룬다.

## 2. 생성자는 어떤 역할을 할까?

생성자는 `new` 연산자로 객체를 만들 때 호출되어 객체의 초기 상태를 설정한다.

```java
Member member = new Member("user@example.com", "guseoh");
```

`new` 연산자가 객체 생성을 시작하면 전달한 인자의 개수와 타입에 맞는 생성자가 호출된다. 위 코드에서는 `String` 값을 두 개 받는 생성자가 호출된다.

생성자는 **클래스와 같은 이름을 사용하며 반환 타입을 작성하지 않는다.** 매개변수를 통해 초기값을 받을 수 있으며, 하나의 클래스에 매개변수 구성이 다른 생성자를 여러 개 선언할 수도 있다.

```java
Member(String email, String nickname) {
    this(email, nickname, 0);
}
```

다음처럼 반환 타입을 작성하면 생성자가 아니라 일반 메서드가 된다.

```java
void Member(String email) {
    // 일반 메서드
}
```

생성자는 객체를 만들 때 호출되어 초기화를 담당하지만, 메서드는 객체가 만들어진 이후 필요한 시점에 호출되어 특정 행동을 수행한다.

### 2.1 객체가 처음부터 필요한 상태를 갖게 한다

생성자를 사용하면 **객체 생성에 필요한 값을 반드시 전달**하도록 만들 수 있다.

```java
Member member = new Member("user@example.com", "guseoh");
```

이메일과 닉네임을 받는 생성자만 제공한다면 두 값을 전달하지 않고는 `Member` 객체를 생성할 수 없다. 객체를 만든 뒤 필드 값을 하나씩 대입하는 방식보다 어떤 값이 필수인지 코드에 명확하게 드러난다.

생성자에서는 전달받은 값을 검증할 수도 있다. 앞의 예제는 이메일이나 닉네임이 `null`이거나 빈 문자열이면 예외를 발생시킨다. 따라서 잘못된 상태로 초기화된 객체가 외부에서 사용되는 것을 방지할 수 있다.

### 2.2 생성자는 초기화에 집중한다

생성자에는 객체의 상태를 완성하는 데 필요한 코드만 두는 것이 좋다. 필드 초기화와 간단한 검증은 자연스럽지만 외부 API 호출, 파일 읽기, 데이터베이스 조회, 메시지 전송처럼 오래 걸리거나 실패할 수 있는 작업까지 수행하면 객체 생성 과정이 복잡해진다.

생성자를 호출했을 뿐인데 외부 시스템과 통신한다면 객체를 만드는 비용과 실패 원인을 예상하기 어렵다. 따라서 **생성자는 전달받은 값을 검증하고 필드에 저장하는 역할에 집중**하고, 다른 작업은 별도의 메서드나 객체에 맡기는 편이 좋다.

## 3. 기본 생성자와 this

클래스에 생성자를 하나도 선언하지 않으면 자바 컴파일러는 매개변수가 없는 생성자를 자동으로 제공한다. 이를 **기본 생성자(Default Constructor)**라고 한다.

```java
class Member {
}
```

위 클래스에는 다음과 같은 형태의 생성자가 자동으로 제공된다.

```java
Member() {
}
```

하지만 개발자가 생성자를 하나라도 직접 선언하면 기본 생성자는 더 이상 자동으로 제공되지 않는다. 따라서 `Member(String email)`만 선언된 클래스에서 `new Member()`를 호출하면 컴파일 오류가 발생한다.

매개변수가 없는 생성자가 필요하다면 직접 선언해야 한다. 개발자가 직접 선언한 `Member()`는 매개변수가 없는 생성자이지만, 엄밀히 말하면 컴파일러가 자동으로 만든 기본 생성자는 아니다.

### 3.1 this는 현재 객체를 가리킨다

`this`는 현재 생성자나 인스턴스 메서드가 실행되고 있는 객체 자신을 가리킨다.

```java
Member(String email, String nickname, int loginCount) {
    this.email = email;
    this.nickname = nickname;
    this.loginCount = loginCount;
}
```

`this.email`은 현재 객체의 `email` 필드이고, 오른쪽의 `email`은 생성자로 전달된 매개변수다. 따라서 다음 코드는 현재 객체의 필드에 전달받은 값을 저장한다는 의미다.

```java
this.email = email;
```

필드와 매개변수의 이름이 같을 때 `this`를 생략하면 가장 가까운 범위에 선언된 매개변수를 가리킨다.

```java
email = email;
```

위 코드는 매개변수 `email`의 값을 다시 같은 매개변수에 대입할 뿐 객체의 필드는 변경하지 않는다. 따라서 필드와 매개변수의 이름이 같다면 `this.email`과 같이 현재 객체의 필드임을 명시해야 한다.

이름이 겹치지 않는다면 `this`를 생략할 수 있다.

```java
void changeNickname(String newNickname) {
    nickname = newNickname;
}
```

다음처럼 작성해도 같은 의미다.

```java
void changeNickname(String newNickname) {
    this.nickname = newNickname;
}
```

필요한 경우 현재 객체 자체를 다른 메서드의 인자로 전달할 수도 있다.

```java
registry.add(this);
```

위 코드는 현재 객체를 `add()` 메서드의 인자로 전달한다는 의미다.

<details>
<summary>예시: JPA 연관관계 편의 메서드</summary>
<div markdown="1">

```java
@Entity
class Member {

    @ManyToOne
    private Team team;

    public void changeTeam(Team team) {
        this.team = team;
        team.getMembers().add(this);
    }
}
```

`team.getMembers().add(this)`에서 `this`는 현재 `Member` 객체를 의미한다. 현재 회원 객체를 `Team` 객체의 회원 목록에 추가하여 양쪽 객체의 연관관계를 함께 설정한다.

</div>
</details>

## 4. this()로 생성자 중복을 줄인다

`this()`는 같은 클래스에 선언된 다른 생성자를 호출한다. 여러 생성자에서 같은 필드 초기화 코드를 반복할 때 사용할 수 있다.

앞의 `Member` 클래스에서 두 개의 값을 받는 생성자는 세 개의 값을 받는 생성자를 호출한다.

```java
Member(String email, String nickname) {
    this(email, nickname, 0);
}
```

로그인 횟수를 전달하지 않으면 기본값으로 `0`을 사용하고, 실제 검증과 필드 대입은 세 개의 값을 받는 생성자에서 처리한다.

```java
Member(String email, String nickname, int loginCount) {
    if (email == null || email.isBlank()) {
        throw new IllegalArgumentException("이메일은 비어 있을 수 없습니다.");
    }

    if (nickname == null || nickname.isBlank()) {
        throw new IllegalArgumentException("닉네임은 비어 있을 수 없습니다.");
    }

    this.email = email;
    this.nickname = nickname;
    this.loginCount = loginCount;
}
```

이렇게 하면 검증과 필드 초기화 코드가 한 생성자에만 존재하므로 초기화 규칙이 변경되더라도 한 곳만 수정하면 된다.

`this`와 `this()`는 목적이 다르다.

<!-- table-caption: `this`와 `this()`의 차이 -->

| 표현              | 의미                |
| --------------- | ----------------- |
| `this`          | 현재 객체 자신          |
| `this.email`    | 현재 객체의 필드         |
| `this.method()` | 현재 객체의 메서드 호출     |
| `this(...)`     | 같은 클래스의 다른 생성자 호출 |

이 글에서는 `this()`를 생성자 본문의 첫 부분에 작성하는 일반적인 형태를 사용한다. 생성자들이 서로를 반복해서 호출하는 순환 구조는 허용되지 않는다.

```java
Member() {
    this("guest");
}

Member(String nickname) {
    this();
}
```

위 코드는 두 생성자가 서로를 계속 호출하므로 컴파일 오류가 발생한다. 생성자 호출은 결국 실제 필드 초기화를 수행하는 생성자에서 끝나야 한다.

하나의 클래스에 매개변수 구성이 다른 생성자를 여러 개 선언하는 것은 **생성자 오버로딩**에 해당한다.

## 5. Spring에서 생성자는 어떻게 활용할까?

Spring에서는 생성자가 객체의 초기 상태를 설정하는 용도뿐 아니라 객체가 작업에 필요한 다른 객체를 전달받는 통로로도 사용된다.

회원 서비스를 처리하는 객체가 회원 저장소를 사용한다고 생각해보자.

```java
class MemberService {

    private final MemberRepository memberRepository;

    MemberService(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }
}
```

`MemberService`가 동작하려면 `MemberRepository`가 필요하다. 이를 생성자의 매개변수로 선언하면 `MemberService` 객체를 만들 때 저장소 객체를 함께 전달해야 한다.

```java
MemberRepository repository = new MemoryMemberRepository();
MemberService memberService = new MemberService(repository);
```

필요한 객체를 생성자를 통해 전달하는 방식을 [생성자 주입(Constructor Injection)](https://mangkyu.tistory.com/150)이라고 한다. Spring 컨테이너는 `MemberService` 객체를 생성할 때 자신이 관리하는 `MemberRepository` 타입의 객체를 찾아 생성자의 인자로 전달할 수 있다.

생성자 주입을 사용하면 클래스가 어떤 객체를 필요로 하는지가 생성자 선언에 드러난다. 또한 필요한 의존 객체가 없는 불완전한 서비스 객체를 생성하기 어렵다.

## 6. 참고 자료


* https://docs.oracle.com/javase/specs/jls/se26/html/jls-8.html#jls-8.8
* https://docs.oracle.com/javase/specs/jls/se26/html/jls-15.html#jls-15.9
* https://dev.java/learn/providing-constructors-for-your-classes/
* https://dev.java/learn/classes-objects/more-on-classes/
* https://dev.java/learn/classes-objects/creating-objects/
* https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html


* https://tecoble.techcourse.co.kr/post/2021-05-17-constructor/
* https://tecoble.techcourse.co.kr/post/2020-07-18-di-constuctor-injection/
* https://tecoble.techcourse.co.kr/post/2020-09-17-spring-bean-initialization/
* https://tecoble.techcourse.co.kr/post/2020-05-26-static-factory-method/
* https://mangkyu.tistory.com/125
* https://mangkyu.tistory.com/150
* https://mangkyu.tistory.com/155
