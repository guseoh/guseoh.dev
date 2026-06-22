---
title: "자바의 접근제한자는 무엇일까?"
description: "자바의 public, protected, package-private, private 접근 범위와 캡슐화 등을 알아보자."
date: 2026-06-22
updated: 2026-06-22
category: "Java"
tags:
    - Java
    - Access Modifier
    - Spring
book: ""
chapter: 1
heroImage: "/og-image.svg"
draft: false
---

## 1. 들어가기 전

이전 글에서는 생성자를 사용해 객체가 생성되는 시점에 필요한 값을 전달하고 초기 상태를 완성하는 방법을 살펴봤다. 생성자를 통해 올바른 상태의 객체를 만들더라도 외부 코드가 객체의 필드를 자유롭게 변경할 수 있다면 생성자에서 검사한 규칙을 유지하기 어렵다.

```java
public class Member {

    public String email;
    public String nickname;

    public Member(String email, String nickname) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("이메일은 비어 있을 수 없습니다.");
        }

        this.email = email;
        this.nickname = nickname;
    }
}
```

위 클래스는 생성자에서 이메일을 검사하지만 `email` 필드가 `public`이므로 외부 코드가 검증을 거치지 않고 값을 변경할 수 있다.

```java
Member member = new Member("member@example.com", "member"); 
member.email = null;
```

이 문제를 막으러면 객체가 외부에 공개할 부분과 내부에서만 사용할 부분을 구분해야 한다. 자바는 이를 위해 **접근 제한자(access modifier)** 를 제공한다.

접근 제한자는 클래스, 생성자, 필드와 메서드에 접근할 수 있는 코드의 범위를 결정한다. 단순히 문법적인 접근을 막는 데 그치지 않고 객체의 **내부 구현을 숨기고, 외부에 필요한 기능만 공개하는 캡슐화의 기반**이 된다.

## 2. 접근 제한자의 종류와 범위

자바에서 사용하는 접근 수준은 `public`, `protected`, `package-private`, `private` 네 가지다. 접근 범위는 다음 순서로 넓어진다.

```
private < package-private < protected < public
```

여기서 `package-private`은 별도의 키워드가 아니다. 선언 앞에 접근 제한자를 작성하지 않았을 때 적용되는 접근 수준을 가리키는 용어다.

<!-- table-caption: 접근 제한자의 종류 -->
| 접근 수준             | 같은 클래스 | 같은 패키지 | 다른 패키지의 하위 클래스 | 그 밖의 외부 코드 |
| ----------------- | ------ | ------ | -------------- | ---------- |
| `public`          | O      | O      | O              | O          |
| `protected`       | O      | O      | O              | X          |
|  package-private  | O      | O      | X              | X          |
| `private`         | O      | X      | X              | X          |

`protected`는 다른 패키지의 하위 클래스에서도 접근할 수 있지만, 하위 클래스가 모든 부모 객체의 멤버에 자유롭게 접근할 수 있다는 의미는 아니다. 구체적인 조건은 뒤에서 살펴본다.

### 2.1 public

`public`으로 선언한 클래스나 멤버는 해당 선언이 속한 타입과 패키지에 접근할 수 있는 모든 코드에서 사용할 수 있다.

```java
public class Member {
    public String getNickname() {
        return "member";
    }
}
```

`Member` 클래스와 `getNickname()` 메서드는 모두 `public`이므로 다른 패키지에서도 사용할 수 있다.

[`public`은 외부에 공개하는 API를 정의할 때 사용한다.](https://github.com/peeljunKim/effective-java/discussions/86) 한 번 공개된 메서드는 여러 코드에서 의존할 수 있으므로 구현을 변경하거나 제거하기가 어려워진다. 외부에서 사용할 가능성이 있다는 이유만으로 모든 선언을 `public`으로 열기보다 실제로 공개해야 하는 기능에만 사용하는 것이 좋다.

### 2.2 protected

`protected`로 선언한 멤버는 다음 위치에서 접근할 수 있다.

- 같은 클래스
- 같은 패키지에 있는 클래스
- 다른 패키지에 있는 하위 클래스

```java
public class Account {
    protected void validateBalance() {
        // 잔액 검증
    }
}
```

같은 패키지에서는 상속 관계가 없어도 `validateBalance()`를 호출할 수 있다. 다른 패키지에서는 `Account`를 상속한 하위 클래스에서만 접근할 수 있다.

`protected`는 단순히 package-private과 `public`의 중간 단계가 아니다. **외부 전체에는 공개하지 않으면서 하위 클래스가 특정 기능을 확장하도록 허용**하는 접근 수준이다.
 