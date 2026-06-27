---
title: "[Java]자바의 필드와 메서드는 무엇일까?"
description: "자바 객체의 상태를 나타내는 필드와 행동을 구현하는 메서드의 선언, 호출, 매개변수와 반환값을 알아보자."
date: 2026-06-18
updated: 2026-06-27
category: "Java"
slug: "java/필드와메서드/method"
commentKey: "/blog/java/필드와메서드/method/"
tags:
    - Java
    - Field
    - Method
book: ""
chapter: 1
heroImage: "/og-image.svg"
draft: false
---

## 1. 들어가기 전

이전 글에서는 클래스가 프로그램에서 사용할 타입을 정의하고, `new` 표현식으로 해당 클래스의 객체를 생성하는 과정을 살펴봤다.

* [자바의 클래스와 객체는 무엇일까?](https://guseoh.github.io/blog/java/%ED%81%B4%EB%9E%98%EC%8A%A4%EC%99%80-%EA%B0%9D%EC%B2%B4/classandobject/)

클래스 안에는 객체가 기억해야 할 값과 객체가 수행할 작업을 선언할 수 있다. 자바에서는 객체가 보관하는 상태를 **필드(Field)** 로, 객체가 수행하는 행동을 **메서드(Method)** 로 표현한다.

```java
class Member {

    String name;
    int loginCount;

    void changeName(String newName) {
        name = newName;
    }

    int login() {
        loginCount++;
        return loginCount;
    }

    String createIntroduction(String prefix) {
        return prefix + name + " (로그인 " + loginCount + "회)";
    }
}
```

`name`과 `loginCount`는 회원 객체가 기억하는 값이다. 이름을 바꾸고 로그인 횟수를 늘리며 소개 문장을 만드는 작업은 메서드가 담당한다.

필드와 메서드를 함께 두면 객체가 어떤 상태를 가지며, 그 상태를 사용해 무엇을 할 수 있는지가 하나의 클래스 안에 드러난다.

## 2. 필드는 객체가 유지할 상태를 저장한다

필드는 클래스 내부에서 메서드 바깥에 선언하는 변수다.

```java
class Member {

    String name;
    int loginCount;
}
```

`Member` 객체는 `name`과 `loginCount`를 자신의 상태로 가진다. 같은 클래스로 객체를 여러 개 만들더라도 각 객체의 인스턴스 필드는 서로 독립적이다.

```java
Member first = new Member();
Member second = new Member();

first.name = "kim";
second.name = "lee";

System.out.println(first.name);  // kim
System.out.println(second.name); // lee
```

`first.name`을 변경해도 `second.name`은 바뀌지 않는다. 두 객체가 같은 필드 선언을 따르지만 실제 값은 객체마다 따로 보관하기 때문이다.

### 필드와 지역 변수

객체가 사용하는 모든 값을 필드로 만들 필요는 없다. 필드에는 메서드 호출이 끝난 뒤에도 객체가 계속 기억해야 할 상태를 둔다. 특정 작업을 수행하는 동안에만 필요한 값은 지역 변수로 선언한다.

```java
String createIntroduction(String prefix) {
    String message =
            prefix + name + " (로그인 " + loginCount + "회)";

    return message;
}
```

`name`과 `loginCount`는 다음 메서드 호출에서도 필요하므로 필드다. `message`는 소개 문장을 만드는 동안에만 사용되며 메서드가 끝난 뒤 다시 사용할 필요가 없다.

| 구분    | 필드             | 지역 변수            |
| ----- | -------------- | ---------------- |
| 선언 위치 | 클래스 내부, 메서드 외부 | 메서드나 블록 내부       |
| 역할    | 객체가 유지할 상태 저장  | 실행 중 잠시 필요한 값 저장 |
| 사용 범위 | 객체의 여러 메서드     | 선언된 메서드나 블록      |
| 초기화   | 타입에 맞는 기본값 제공  | 사용하기 전에 직접 초기화   |

필드를 필요 이상으로 늘리면 여러 메서드가 같은 상태를 읽고 변경하게 된다. 값이 한 번의 작업에서만 필요하다면 지역 변수로 두는 편이 변경 범위를 파악하기 쉽다.

### 필드의 초기값

필드는 선언할 때 값을 지정할 수 있다.

```java
int loginCount = 0;
```

초기값을 작성하지 않으면 타입에 맞는 기본값이 들어간다. 숫자형은 `0`, `boolean`은 `false`, 참조형은 `null`로 초기화된다.

```java
class Member {

    String name;    // null
    int loginCount; // 0
}
```

지역 변수에는 이러한 기본값이 자동으로 들어가지 않는다.

```java
void printCount() {
    int count;

    System.out.println(count); // 컴파일 오류
}
```

객체가 생성될 때 반드시 필요한 값은 기본값에 맡기기보다 생성 과정에서 명시하는 편이 낫다. 구체적인 초기화 방법은 다음 생성자 글에서 다룬다.

필드 이름은 값의 의미가 드러나도록 작성한다. `value`, `number`, `flag`처럼 문맥이 없는 이름보다 `name`, `loginCount`, `active`처럼 객체에서 맡은 역할을 보여 주는 이름이 코드를 이해하기 쉽다.

## 3. 메서드는 객체의 행동을 구현한다

메서드는 입력을 받아 작업을 수행하고, 필요하면 결과를 반환하는 코드의 묶음이다. 객체의 필드를 읽거나 변경할 수 있으며 다른 메서드를 호출할 수도 있다.

메서드 선언은 기본적으로 반환 타입, 메서드 이름, 매개변수 목록과 본문으로 구성된다.

```text
반환 타입 메서드명(매개변수 목록) {
    실행할 코드
}
```

다음 메서드는 새로운 이름을 매개변수로 받아 `name` 필드를 변경한다.

```java
void changeName(String newName) {
    name = newName;
}
```

`void`는 호출한 곳에 반환할 값이 없다는 뜻이다. `newName`은 메서드가 작업에 사용할 값을 받는 매개변수다.

로그인 횟수를 증가시킨 뒤 결과를 돌려주려면 반환 타입을 `int`로 선언한다.

```java
int login() {
    loginCount++;

    return loginCount;
}
```

반환값은 선언한 반환 타입과 호환되어야 한다. `return`이 실행되면 현재 메서드의 실행도 끝난다. `void` 메서드에서도 값을 적지 않은 `return;`을 사용해 실행을 일찍 종료할 수 있다.

### 메서드 호출과 반환값

인스턴스 메서드는 객체를 가리키는 변수 뒤에 점 연산자를 붙여 호출한다.

```java
public class MemberMain {

    public static void main(String[] args) {
        Member member = new Member();

        member.name = "kim";
        member.changeName("lee");

        int count = member.login();
        String introduction =
                member.createIntroduction("회원: ");

        System.out.println(count);        // 1
        System.out.println(introduction); // 회원: lee (로그인 1회)
    }
}
```

`member.changeName("lee")`에서 `newName`은 메서드 선언에 있는 **매개변수(Parameter)** 이고, `"lee"`는 호출할 때 전달하는 **인자(Argument)** 다.

```java
void changeName(String newName) {
    name = newName;
}

member.changeName("lee");
```

인자는 매개변수에 대입할 수 있는 타입이어야 하며, 매개변수가 여러 개라면 선언된 순서에 맞게 전달해야 한다. 조건에 맞는 메서드를 찾지 못하면 컴파일 오류가 발생한다.

반환값이 있는 메서드는 결과를 변수에 저장하거나 다른 표현식에서 바로 사용할 수 있다.

```java
int count = member.login();

System.out.println(member.login());
```

두 번째 코드는 반환값을 출력 메서드의 인자로 바로 전달한다. 다만 `login()`은 호출될 때마다 `loginCount`를 증가시키므로 두 호출은 서로 다른 결과를 만든다.

### 이름과 메서드 시그니처

메서드 이름은 수행하는 행동을 드러내는 동사로 시작하는 경우가 많다.

```text
changeName
increaseViewCount
calculateTotalPrice
findMember
cancelOrder
```

`process`, `handle`, `execute`처럼 범위가 넓은 이름도 문맥에 따라 사용할 수 있지만, 더 구체적인 행동을 표현할 수 있다면 해당 동작을 이름에 드러내는 편이 낫다. 논리값을 반환하는 메서드는 `isActive()`, `hasPermission()`, `canCancel()`처럼 결과의 의미가 읽히도록 작성할 수 있다.

자바에서 메서드 시그니처는 메서드 이름과 매개변수 타입으로 구성된다. 다음 메서드의 시그니처는 `changeName(String)`이다.

```java
void changeName(String newName) {
    name = newName;
}
```

반환 타입과 매개변수 이름은 메서드 시그니처에 포함되지 않는다. 같은 이름의 메서드를 여러 개 선언하는 오버로딩에서는 이 시그니처가 서로 달라야 한다. 오버로딩의 구체적인 규칙은 별도 글에서 다룬다.

필드는 객체가 계속 기억할 상태를 저장하고, 메서드는 그 상태를 이용해 객체의 행동을 구현한다. 어떤 값을 필드로 둘지와 어떤 변경을 메서드에 맡길지는 이후 캡슐화에서도 이어지는 주제다.

## 4. 참고 자료

### 공식 자료

* [Dev.java - Creating Variables and Naming Them](https://dev.java/learn/language-basics/variables/)

* [Dev.java - Defining Methods](https://dev.java/learn/classes-objects/defining-methods/)

* [Dev.java - Calling Methods and Constructors](https://dev.java/learn/classes-objects/calling-methods-constructors/)

### 한글 참고 링크

* [WikiDocs - 클래스와 객체](https://wikidocs.net/286593)

* [WikiDocs - 지역 변수](https://wikidocs.net/286597)

* [Inpa Dev - 자바 객체 지향 클래스 문법 총정리](https://inpa.tistory.com/entry/JAVA-%E2%98%95-%EA%B0%9D%EC%B2%B4-%EC%A7%80%ED%96%A5OOP-%ED%81%B4%EB%9E%98%EC%8A%A4-%EB%AC%B8%EB%B2%95-%F0%9F%92%AF-%EC%B4%9D%EC%A0%95%EB%A6%AC)

* [Hstory - 자바 오버로딩이란](https://hstory0208.tistory.com/entry/Java%EC%9E%90%EB%B0%94-%EC%98%A4%EB%B2%84%EB%A1%9C%EB%94%A9-overloading%EC%9D%B4%EB%9E%80)
