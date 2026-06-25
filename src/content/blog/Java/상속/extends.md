---
title: "[Java]자바의 상속은 무엇일까?"
description: "자바 상속의 의미와 extends, 멤버의 상속 범위, super를 이용한 생성자 연결, 메서드 재정의와 설계 시 주의점을 알아보자."
date: 2026-06-25
updated: 2026-06-25
category: "Java"
slug: "java/상속/extends"
commentKey: "/blog/java/상속/extends/"
tags:
  - Java
  - OOP
  - Inheritance
  - extend
  - super
book: ""
chapter: 1
heroImage: "/og-image.svg"
draft: true
---

## 1. 들어가기 전

이전 글에서는 캡슐화를 통해 객체의 상태와 구현을 내부에 감추고, 외부에는 객체가 제공하려는 기능만 공개하는 방법을 살펴봤다. 객체가 자신의 상태를 스스로 관리하도록 만들면 잘못된 변경을 막고 변경의 영향을 객체 내부로 제한할 수 있다.

이번에 살펴볼 **상속(Inheritance)**은 **서로 관련된 클래스 사이에 상위 클래스와 하위 클래스의 관계를 만드는 기능**이다. 하위 클래스는 상위 클래스가 제공하는 상태와 행동을 바탕으로 새로운 상태나 행동을 추가할 수 있으며, 필요한 경우 상속받은 행동을 자신의 목적에 맞게 재정의할 수도 있다.

상속은 공통 코드를 재사용하는 데 도움이 되지만, 단순히 코드 중복을 줄이기 위한 문법은 아니다. 하위 클래스가 상위 클래스의 한 종류라는 타입 관계를 만들고 **두 클래스를 강하게 결합**하므로, 관계가 적절한지 확인하지 않고 사용하면 오히려 변경하기 어려운 구조가 만들어 질 수 있다.

## 2. 상속은 무엇일까?

**상속**은 기존 클래스를 기반으로 새로운 클래스를 정의하는 기능이다. 기존 클래스는 **상위 클래스(Superclass)**, 상위 클래스를 기반으로 정의한 클래스는 **하위 클래스(Subclass)**라고 한다. 부모 클래스와 자식 클래스라는 표현도 사용하지만, Java 언어 명세에서는 상위 클래스와 하위 클래스라는 용어를 사용한다.

하위 클래스는 클래스 선언부에서 `extends` 뒤에 직접 상속할 상위 클래스를 지정한다.

```java
class TextDocument extends Document { ... }
```

이 선언은 `TextDocument`가 `Document`를 직접 상속한다는 의미다. `Document`는 `TextDocument`의 직접 상위 클래스이고, `TextDocument`는 `Document`의 직접 하위 클래스가 된다.

자바 클래스는 **하나의 클래스만 직접 상속**할 수 있다.

```java
// 컴파일 오류: 클래스 두 개를 직접 상속할 수 없다. 
class TextDocument extends Document, Content { ... }
```

일반 클래스에서 `extends`를 생략하면 직접 상위 클래스는 `Object`가 된다.

```java
class Document { ... }

class Document extends Object { ... }
```

다만 `enum`과 `record`는 각각 언어에서 정해진 별도의 직접 상위 클래스를 가지므로 일반 클래스와 규칙이 다르다.

<details>
    <summary>`enum`과 `record`</summary>
<div markdown="1">

### `enum`은 Object를 직접 상속하지 않는다

열거형은 일반 클래스와 달리 직접 상위 클래스가 자동으로 `Enum<E>`가 된다.

```java
// 컴파일 오류
enum DocumentStatus extends Enum<DocumentStatus> {
    DRAFT,
    PUBLISHED
}
```

열거형 선언 문법에는 `extends`절이 없으며, 자바 언어가 직접 상위 클래스를 Enum<E>로 정한다. 또한 일반 클래스가 직접 `Enum`을 상속하는 것도 허용되지 않는다.

### `record`도 `Object`를 직접 상속하지 않는다

레코드 클래스의 직접 상위 클래스느 `java.lang.Record`다.

```java
// 컴파일 오류
record Document(Long id, String title) extends Record {
}
```

레코드 역시 선언 문법에 `extends` 절이 없으므로 다른 클래스를 상속하거나 `Record`를 명시적으로 상속할 수 없다.

| 선언 종류      | 직접 상위 클래스 | 최상위 상위 클래스  |
| ---------- | --------- | ----------- |
| 일반 클래스     | `Object`  | `Object`    |
| `enum E`   | `Enum<E>` | `Object`    |
| `record R` | `Record`  | `Object`    |
| `Object`   | 없음        | `Object` 자신 |

::link-mention{url="https://breakcoding.tistory.com/409" title="enum 타입에 대한 모든 것" description="enum의 내부 구조와 java.lang.Enum의 관계를 비교적 깊게 설명"}

::link-mention{url="https://ynzu-dev.tistory.com/entry/JAVA-14-Record-Class" title="JAVA 14 - Record Class" description="레드의 등장 배경, 메서드 등에 관한 설명"}

</div>
</details>

## 3. 상속 관계에서 멤버와 생성자는 어떻게 동작할까?

상속 관계를 이해하려면 하위 클래스가 어떤 멤버를 물려받는지와 하위 클래스 인스턴스가 어떻게 초기화되는지를 구분해야 한다.