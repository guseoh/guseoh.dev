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

## 3. 생성자와 메서드는 어떻게 연결될까?

하위 클래스는 상위 클래스가 제공하는 멤버를 바탕으로 동작하지만, 모든 선언이 같은 방식으로 이어지는 것은 아니다. 생성자는 하위 클래스에 상속되지 않으며, 하위 클래스의 생성자가 `super(...)`를 사용해 상위 클래스의 초기화 과정과 연결된다. 인스턴스 메서드는 상속 조건을 만족하면 하위 클래스에서 다시 정의할 수 있다.

상속 관계에서 멤버에 접근할 수 있는 범위는 접근 제한자에 따라 달라진다.

> 관련 글: [자바의 접근 제한자는 무엇일까?](https://guseoh.github.io/blog/java/접근제한자/accessmodifier/)

### 3.1 생성자는 상속되지 않는다

생성자는 해당 클래스로 만들어지는 인스턴스를 초기화하기 위한 코드다. 상위 클래스와 하위 클래스는 각각 초기화해야 할 상태가 다르므로 상위 클래스의 생성자가 하위 클래스에 상속되지는 않는다.

```java
class Document {

    protected Document(String title) {
    }
}

class TextDocument extends Document {

    public TextDocument(String title) {
        super(title);
    }
}
```

`TextDocument`가 `Document`를 상속하더라도 `Document(String title)` 생성자를 자신의 생성자처럼 사용할 수는 없다. 대신 하위 클래스의 생성자에서 `super(title)`를 호출해 직접 상위 클래스의 생성자와 연결한다.

`super(...)`는 메서드 호출이 아니라 **직접 상위 클래스의 생성자를 호출하는 문법**이다.

```java
class Document {

    private final String title;

    protected Document(String title) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException(
                    "제목은 비어 있을 수 없습니다."
            );
        }

        this.title = title;
    }
}

class TextDocument extends Document {

    private final String content;

    public TextDocument(String title, String content) {
        super(title);

        if (content == null) {
            throw new IllegalArgumentException(
                    "내용은 null일 수 없습니다."
            );
        }

        this.content = content;
    }
}
```

`TextDocument` 생성자의 `super(title)`는 `Document(String title)` 생성자를 호출한다. 상위 클래스 생성자는 자신이 선언한 `title`을 검증하고 초기화하며, 이후 하위 클래스 생성자가 `content`를 초기화한다.

이는 상위 클래스 객체와 하위 클래스 객체가 별도로 생성된다는 의미가 아니다. 하나의 `TextDocument` 인스턴스를 생성하는 과정에서 상위 클래스가 담당하는 부분부터 초기화한 다음 하위 클래스가 추가한 부분을 초기화한다.

생성자에서 다른 생성자를 명시적으로 호출하지 않으면 컴파일러는 매개변수가 없는 상위 클래스 생성자를 호출하는 `super()`를 암묵적으로 추가한다.

```java
class Parent {

    Parent() {
    }
}

class Child extends Parent {

    Child() {
        // super()가 암묵적으로 추가된다.
    }
}
```

**상위 클래스에 접근 가능한 매개변수 없는 생성자가 없다면 하위 클래스에서 호출할 생성자를 직접 지정**해야 한다.

```java
class Parent {

    Parent(String name) {
    }
}

class Child extends Parent {

    // 컴파일 오류:
    // Parent()가 없으므로 암묵적인 super()를 호출할 수 없다.
    Child() {
    }
}
```

상위 클래스에 존재하는 생성자를 명시적으로 호출하면 오류를 해결할 수 있다.

```java
class Child extends Parent {

    Child(String name) {
        super(name);
    }
}
```

`super`는 사용 형태에 따라 역할이 다르다.

| 표현               | 의미                 |
| ---------------- | ------------------ |
| `super.field`    | 상위 클래스에 선언된 필드 선택  |
| `super.method()` | 상위 클래스에 선언된 메서드 호출 |
| `super(...)`     | 직접 상위 클래스의 생성자 호출  |

`super`는 별도의 상위 클래스 객체를 가리키는 참조 변수가 아니다. 현재 객체에서 상위 클래스에 선언된 멤버나 생성자를 명시적으로 선택할 때 사용하는 키워드다.

> [!note] Java 25의 유연한 생성자 본문
>
> Java 25부터는 제한된 문장을 `super(...)`나 `this(...)`보다 앞에 작성할 수 있다.
>
> ```java
> class Child extends Parent {
>
>     Child(int age) {
>         if (age < 0) {
>             throw new IllegalArgumentException(
>                     "나이는 음수일 수 없습니다."
>             );
>         }
>
>         super(age);
>     }
> }
> ```
>
> `super(age)` 앞부분은 생성자 프롤로그(Prologue)라고 한다. 프롤로그에서는 생성자 인자를 검증하거나 계산할 수 있지만, 초기화 중인 객체를 자유롭게 참조할 수는 없다.
>
> Java 17이나 Java 21처럼 이전 버전에서는 이 문법을 사용할 수 없다.

### 3.2 메서드 오버라이딩

**오버라이딩(Overriding)**은 상위 클래스에서 상속받은 인스턴스 메서드를 하위 클래스에서 다시 정의하는 기능이다. 하위 클래스가 상위 클래스의 기본 동작을 자신의 목적에 맞게 구체화할 때 사용한다.

```java
class Document {

    public String describe() {
        return "문서";
    }
}

class TextDocument extends Document {

    @Override
    public String describe() {
        return "텍스트 문서";
    }
}
```

`TextDocument`의 `describe()`는 상위 클래스에 선언된 메서드를 재정의한다. `TextDocument` 인스턴스에서 `describe()`를 호출하면 하위 클래스가 재정의한 동작이 실행된다.

`@Override`는 해당 메서드가 상위 타입의 메서드를 재정의하려는 것임을 컴파일러에 알린다. 메서드 이름이나 매개변수 타입을 잘못 작성해 실제로 오버라이딩되지 않으면 컴파일 오류가 발생하므로 오버라이딩하는 메서드에는 `@Override`를 작성하는 것이 좋다.

하위 클래스에서 상위 클래스의 기존 구현도 사용하려면 `super.method()`를 호출할 수 있다.

```java
@Override
public String describe() {
    return super.describe()
            + ", 글자 수: "
            + content.length();
}
```

이 메서드는 먼저 `Document`의 `describe()`를 호출한 뒤 텍스트 문서에 필요한 정보를 추가한다. 공통 동작을 상위 클래스에서 제공하고 하위 클래스가 필요한 동작만 덧붙이는 구조다.

`final` 메서드와 클래스가 상속 및 오버라이딩을 제한하는 방식과 `static` 메서드의 동작은 이전 글에서 다뤘으므로 여기서는 반복하지 않는다.

> 관련 글: [자바의 static과 final은 무엇일까?](https://guseoh.github.io/blog/java/static과final/staticandfinal/)

## 4. 상속을 사용하 때 확인할 점

상속 문법을 적용하는 일은 어렵지 않지만, 두 클래스를 상속 관계로 설계하는 일은 별개의 문제다. 상속은 하위 클래스가 상위 클래스의 구현과 규칙에 의존하도록 만들기 때문에 단순한 코드 중복보다 **두 클래스의 의미와 변경 가능성**을 먼저 확인해야 한다.

### 4.1 하위 클래스는 상위 클래스의 한 종류여야 한다

상속 관계는 일반적으로 is-a 관계라고 표현한다. `TextDocument`가 `Document`를 상속한다면 텍스트 문서는 한 종류여야 한다.

```text
TextDocument is a Document.
```

예를 들어 상위 클래스가 모든 문서는 제목을 가진다고 보장한다면 하위 클래스도 제목이 없는 상태를 허용해서는 안 된다. 상위 클래스의 메서드가 특정 조건에서 정상적인 결과를 반환한다고 약속한다면 하위 클래스가 오버라이딩하면서 그 조건을 임의로 깨뜨리지 않아야 한다.

공통 필드나 비슷한 코드가 있다는 이유만으로 상속 관계를 만들면 두 클래스의 의미가 맞지 않을 수 있다. 중복 코드를 줄이는 일은 상속의 결과가 될 수 있지만, 상속 관계를 결정하는 유일한 기준이 되어서는 안 된다.

### 4.2 상속은 상위 클래스와 하위 클래스를 강하게 결합한다

하위 클래스는 상위 클래스가 제공하는 생성자와 메서드, 상태 규칙에 의존한다. 상위 클래스의 생성자 매개변수나 메서드의 동작이 바뀌면 그 클래스를 상속한 하위 클래스에도 변경의 영향이 전달될 수 있다.

상속 계층이 깊어지면 하위 클래스의 동작을 이해하기 위해 여러 상위 클래스의 구현을 차례로 확인해야 할 수도 있다. 메서드가 어느 클래스에서 선언되었고 어느 단계에서 재정의되었는지 추적하기도 어려워진다.

상속을 고려할 때는 다음 내용을 확인해야 한다.

* 두 클래스 사이에 명확한 타입 관계가 있는가?
* 하위 클래스가 상위 클래스의 상태와 동작 규칙을 유지할 수 있는가?
* 상위 클래스가 하위 클래스에서 확장할 수 있도록 설계되었는가?
* 상위 클래스의 변경이 하위 클래스에 전파돼도 괜찮은가?
* 단순히 코드를 재사용하려고 상속을 선택한 것은 아닌가?

상위 클래스의 내부 상태를 하위 클래스에 과도하게 노출하면 캡슐화가 약해질 수 있다.

> 관련 글
>
> * [자바의 접근 제한자는 무엇일까?](https://guseoh.github.io/blog/java/접근제한자/accessmodifier/)
> * [자바의 캡슐화는 무엇일까?](https://guseoh.github.io/blog/java/캡슐화/encapsulation/)
> * [상속보다는 조합(Composition)을 사용하자 - 테코블](https://tecoble.techcourse.co.kr/post/2020-05-18-inheritance-vs-composition/)  


상속 관계가 분명하지 않다면 기존 객체를 필드로 포함하고 필요한 기능을 호출하는 조합(Composition)이 더 적합할 수 있다. 상속과 조합을 선택하는 구체적인 기준은 이후 `상속보다 조합` 글에서 살펴본다.

### 4.3 생성자에서 오버라이딩 가능한 메서드를 호출하지 않는다

상위 클래스의 생성자에서 오버라이딩 가능한 메서드를 호출하면 하위 클래스의 초기화가 끝나기 전에 하위 클래스 메서드가 실행될 수 있다.

```java
class Parent {

    Parent() {
        printState();
    }

    void printState() {
        System.out.println("parent");
    }
}

class Child extends Parent {

    private String state = "ready";

    @Override
    void printState() {
        System.out.println(state.length());
    }
}
```

다음과 같이 `Child` 인스턴스를 생성하면 `NullPointerException`이 발생한다.

```java
new Child();
```

`Child` 생성자는 먼저 상위 클래스 생성자인 `Parent()`와 연결된다. `Parent()`가 `printState()`를 호출하면 실제로는 `Child`에서 오버라이딩한 메서드가 실행된다. 그러나 일반적인 초기화 과정에서는 `Child`의 필드 초기화식이 아직 실행되지 않았으므로 `state`에는 기본값인 `null`이 들어 있다. 이 상태에서 `state.length()`를 호출해 예외가 발생한다.

상위 클래스의 생성자에서는 가능하면 `private`, `final` 또는 `static` 메서드처럼 하위 클래스가 오버라이딩할 수 없는 메서드만 사용해야 한다.

## 5. 참고 자료

- [오라클, 자바 25 출시](https://www.oracle.com/kr/news/announcement/oracle-releases-java-25-2025-09-16/)
- [코드의 재사용, 상속보다 합성을 사용해야 하는 이유](https://mangkyu.tistory.com/199)