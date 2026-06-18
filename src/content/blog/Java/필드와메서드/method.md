---
title: "자바의 필드와 메서드는 무엇일까?"
description: "자바 객체의 상태를 나타내는 필드와 행동을 나타내는 메서드의 선언, 호출, 매개변수와 반환값을 알아보자."
date: 2026-06-18
updated: 2026-06-18
category: "Java"
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

이전 글에서는 클래스가 새로운 타입을 정의하고, 클래스를 기반으로 객체가 생성된다는 내용을 살펴봤다. 클래스 내부에는 객체가 가져야 할 데이터와 객체가 수행할 기능을 선언할 수 있다. 자바에서는 객체가 가진 데이터를 **필드(Field)** 로 표현하고, 객체가 수행하는 기능을 **메서드(Method)** 로 표현한다.

회원 객체를 예로 들면 이름과 로그인 횟수는 객체가 보관해야 할 상태이며, 이름을 변경하거나 로그인 횟수를 증가시키는 것은 객체가 수행할 행동이다.

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
        String message = prefix + name + " (로그인 " + loginCount + "회)";
        return message;
    }
}
```

위 코드에서 `name`과 `loginCount`는 필드다. `changeName()`, `login()`, `createIntroduction()`은 메서드다. **필드는 객체의 상태를 보관**하고, **메서드는 필드를 읽거나 변경하면서 객체의 행동을 구현**한다.

## 2. 필드는 무엇일까?

필드는 클래스 내부에 선언되어 **객체의 상태를 저장하는 변수**다. 객체가 유지해야 하는 데이터를 필드로 표현한다.

앞의 `Member` 클래스에는 다음 두 필드가 선언되어 있다.

```java
String name;
int loginCount;
```

`name`은 회원 이름을 저장하고, `loginCount`는 로그인한 횟수를 저장한다. 같은 `Member` 클래스로 여러 객체를 생성하더라도 각 객체는 자신의 필드 값을 가진다.

필드는 일반적으로 다음 형식으로 선언한다.

```text
타입 필드명;
타입 필드명 = 초기값;
```

타입은 필드에 저장할 수 있는 값의 종류를 결정하고, 필드명은 코드에서 해당 상태를 식별하는 이름이다.

### 2.1 필드는 객체의 상태를 나타낸다

객체의 상태란 특정 시점에 객체가 가지고 있는 값들을 의미한다. 회원 객체라면 이름, 로그인 횟수, 이메일, 가입 상태 등이 상태가 될 수 있다.

모든 데이터를 필드로 선언해야 하는 것은 아니다. 객체가 작업이 끝난 뒤에도 계속 기억해야 하는 값인지 생각해야 한다. 계산 과정에서만 잠깐 사용하는 값은 필드가 아니라 지역 변수로 선언하는 것이 적절하다.

예를 들어 회원 이름과 로그인 횟수는 여러 메서드에서 계속 사용되므로 필드로 보관할 수 있다. 반면 `createIntroduction()` 안의 `message`는 소개 문장을 만드는 동안만 필요한 값이므로 [지역 변수](https://wikidocs.net/286597)로 선언한다.

### 2.2 필드와 지역 변수의 차이

필드와 지역 변수는 모두 값을 저장하는 변수지만 선언 위치와 유지되는 범위가 다르다.

| 구분    | 필드                 | 지역 변수                    |
| ----- | ------------------ | ------------------------ |
| 선언 위치 | 클래스 내부, 메서드 외부     | 메서드나 블록 내부               |
| 역할    | 객체가 유지할 상태 저장      | 메서드 실행 중 필요한 임시 값 저장     |
| 사용 범위 | 객체의 여러 메서드에서 사용 가능 | 선언된 메서드나 블록 안에서만 사용 가능   |
| 유지 기간 | 객체가 사용되는 동안 유지     | 메서드 실행이 끝나면 더 이상 사용되지 않음 |

앞의 예제에서 `name`과 `loginCount`는 필드이고, `message`는 지역 변수다.

```java
String createIntroduction(String prefix) {
    String message = prefix + name + " (로그인 " + loginCount + "회)";
    return message;
}
```

`message`는 소개 문장을 임시로 저장하기 위해 사용된다. **다른 메서드에서 다시 사용할 필요가 없으므로 필드로 만들 이유가 없다.**

필요하지 않은 값을 필드로 만들면 객체가 불필요한 상태를 가지게 된다. 여러 메서드가 같은 필드를 변경하기 시작하면 값이 언제 바뀌었는지 추적하기도 어려워진다. 따라서 **객체가 계속 유지해야 하는 값**만 필드로 선언하는 것이 좋다.

> [!note] 객체가 계속 유지해야 하는 값
> 메서드 호출이 끝난 뒤에도 사라지지 않고, 이후 동작에서 다시 사용되어야 하는 상태를 의미한다.
>
> 예를 들어 회원의 이름, 주문의 상태처럼 객체의 정체성이나 현재 상태를 나타내는 값이 이에 해당한다.

### 2.3 필드의 초기값

필드를 선언하면서 초기값을 직접 지정할 수 있다.

```java
int loginCount = 0;
```

초기값을 명시하지 않은 필드에는 타입에 따른 기본값이 들어간다. 예를 들어 정수형 필드는 `0`, 논리형 필드는 `false`, 참조형 필드는 `null`로 초기화된다.

기본값이 자동으로 들어간다고 해서 항상 기본값에 의존하는 것이 좋은 것은 아니다. 객체를 만들 때 반드시 필요한 값은 생성 과정에서 명확하게 전달하는 편이 객체의 상태를 이해하기 쉽다. 

### 2.4 필드 이름은 상태의 의미를 나타내야 한다

필드 이름은 저장되는 값의 의미를 드러내야 한다.

```java
String name;
int loginCount;
boolean active;
```

다음처럼 의미를 알기 어려운 이름은 피하는 것이 좋다.

```java
String value;
int number;
boolean flag;
```

필드 이름만 보고도 해당 값이 무엇을 나타내는지 알 수 있어야 한다. 자바에서는 일반적으로 필드 이름을 소문자로 시작하고, 여러 단어가 이어질 경우 두 번째 단어부터 첫 글자를 대문자로 작성하는 lower camel case를 사용한다.

```text
loginCount
memberName
createdDate
```

## 3. 메서드는 무엇일까?

메서드는 클래스 내부에 선언되어 특정 작업을 수행하는 코드의 묶음이다. 객체는 메서드를 통해 자신의 상태를 조회하거나 변경하고, 계산 결과를 외부에 반환할 수 있다.

앞의 `Member` 클래스에는 세 개의 메서드가 있다.

* `changeName()`은 이름을 변경한다.
* `login()`은 로그인 횟수를 증가시키고 결과를 반환한다.
* `createIntroduction()`은 회원 소개 문장을 만들어 반환한다.

메서드는 일반적으로 다음 요소로 구성된다.

```text
반환 타입 메서드명(매개변수 목록) {
    실행할 코드
}
```

접근 제한자, `static`, 예외 선언 등도 메서드 선언에 포함될 수 있지만 각각 이후 글에서 다룰 주제이므로 이번 글에서는 반환 타입, 메서드명, 매개변수, 본문에 집중한다.

### 3.1 반환 타입

반환 타입은 메서드가 실행된 뒤 호출한 곳으로 돌려줄 값의 타입을 나타낸다.

```java
int login() {
    loginCount++;
    return loginCount;
}
```

`login()`의 반환 타입은 `int`다. 따라서 메서드 실행 결과로 정수 값을 반환해야 한다.

```java
String createIntroduction(String prefix) {
    String message = prefix + name + " (로그인 " + loginCount + "회)";
    return message;
}
```

`createIntroduction()`의 반환 타입은 `String`이므로 문자열을 반환한다.

반환할 값이 없는 메서드는 반환 타입 자리에 `void`를 작성한다.

```java
void changeName(String newName) {
    name = newName;
}
```

`changeName()`은 이름을 변경하는 작업만 수행하며 별도의 결과값을 돌려주지 않는다.

### 3.2 메서드 이름

메서드 이름은 해당 메서드가 무엇을 하는지 나타내야 한다. 필드가 상태를 나타내므로 주로 명사형 이름을 사용한다면, 메서드는 행동을 나타내므로 일반적으로 동사로 시작한다.

```text
changeName
increaseViewCount
calculateTotalPrice
findMember
cancelOrder
```

메서드 이름이 구체적이면 호출하는 코드만 보고도 의도를 파악할 수 있다.

```java
member.changeName("lee");
```

위 코드는 회원의 이름을 변경한다는 의미가 분명하다.

반면 다음 이름은 무엇을 처리하는지 알기 어렵다.

```text
process
handle
execute
doSomething
```

이러한 이름이 항상 잘못된 것은 아니지만, 메서드가 수행하는 구체적인 작업을 표현할 수 있다면 더 명확한 이름을 사용하는 것이 좋다.

논리값을 반환하는 메서드는 `is`, `has`, `can` 등으로 시작하면 의미를 이해하기 쉽다.

```text
isActive
hasPermission
canCancel
```

### 3.3 매개변수 목록

메서드가 작업을 수행하는 데 외부 값이 필요하면 괄호 안에 매개변수를 선언한다.

```java
void changeName(String newName) {
    name = newName;
}
```

`newName`은 `String` 타입의 매개변수다. 메서드가 호출되면 전달된 값이 `newName`에 들어오고, 메서드 본문에서 해당 값을 사용할 수 있다.

매개변수가 필요하지 않더라도 괄호는 생략할 수 없다.

```java
int login() {
    loginCount++;
    return loginCount;
}
```

`login()`은 외부에서 전달받을 값이 없으므로 괄호 안이 비어 있다.

### 3.4 메서드 본문

중괄호 안에는 메서드가 실제로 수행할 코드를 작성한다.

```java
{
    loginCount++;
    return loginCount;
}
```

메서드 본문에는 필드 접근, 지역 변수 선언, 조건문, 반복문, 다른 메서드 호출 등을 작성할 수 있다.


## 4. 메서드는 어떻게 호출할까?

객체의 메서드는 일반적으로 객체를 나타내는 변수 뒤에 점 연산자와 메서드 이름을 작성하여 호출한다.

```java
public class MemberMain {

    public static void main(String[] args) {
        Member member = new Member();

        member.name = "kim";
        member.changeName("lee");

        int count = member.login();
        String introduction = member.createIntroduction("회원: ");

        System.out.println(count);
        System.out.println(introduction);
    }
}
```

`member.changeName("lee")`는 `member` 객체의 `changeName()` 메서드를 호출한다. `"lee"`는 메서드에 전달되는 인자다.

`member.login()`은 정수 값을 반환하므로 결과를 `int` 변수에 저장할 수 있다. `member.createIntroduction("회원: ")`은 문자열을 반환하므로 결과를 `String` 변수에 저장한다.

### 4.1 매개변수와 인자

**매개변수:** 메서드를 선언할 때 값을 받기 위해 정의한 변수 

**인자**: 메서드를 호출할 때 실제로 전달하는 값

`changeName()` 선언에서 `newName`은 매개변수다.

```java
void changeName(String newName)
```

메서드를 호출할 때 전달하는 `"lee"`는 인자다.

```java
member.changeName("lee");
```

> [!note] 인자의 타입과 순서는 메서드에 선언된 매개변수와 맞아야 한다
> 메서드를 호출하면 자바는 전달된 인자의 타입과 순서를 기준으로 어떤 메서드를 실행할지 결정한다. 
> 
> 따라서 인자의 타입이나 순서가 매개변수 선언과 맞지 않으면 값을 올바르게 전달할 수 없거나, 호출할 메서드를 결정하지 못해 [컴파일 오류](https://wikidocs.net/276056)가 발생한다.

### 4.2 return

`return`은 메서드 실행 결과를 호출한 곳으로 돌려준다.

```java
return loginCount;
```

반환하는 값은 메서드에 선언된 반환 타입과 호환되어야 한다. 반환 타입이 `int`라면 정수 값을 반환해야 하고, 반환 타입이 `String`이라면 문자열 값을 반환해야 한다.

`return`이 실행되면 해당 메서드의 실행은 종료된다. 따라서 `return` 뒤에 같은 흐름으로 작성된 코드는 실행될 수 없다.

`void` 메서드는 반환값을 가지지 않는다. 필요한 경우 값 없이 `return;`을 사용하여 메서드 실행을 일찍 종료할 수 있다.

### 4.3 메서드 시그니처

자바에서 메서드 시그니처는 메서드 이름과 매개변수 타입의 조합으로 구성된다.

예를 들어 다음 메서드의 시그니처는 `changeName(String)`이다.

```java
void changeName(String newName)
```

**반환 타입과 매개변수 이름은 메서드 시그니처에 포함되지 않는다.** 메서드 시그니처는 같은 이름의 메서드를 구분하는 [오버로딩](https://hstory0208.tistory.com/entry/Java%EC%9E%90%EB%B0%94-%EC%98%A4%EB%B2%84%EB%A1%9C%EB%94%A9-overloading%EC%9D%B4%EB%9E%80?utm_source=chatgpt.com)과 관련이 있다. 

## 5. 참고 자료

* https://dev.java/learn/language-basics/variables/
* https://dev.java/learn/classes-objects/creating-classes/
* https://dev.java/learn/classes-objects/defining-methods/
* https://dev.java/learn/classes-objects/calling-methods-constructors/
* https://dev.java/learn/classes-objects/creating-objects/

- https://www.baeldung.com/java-methods
- https://www.baeldung.com/java-method-signature-return-type
- https://www.baeldung.com/java-classes-objects
- https://www.baeldung.com/java-initialization
- https://www.geeksforgeeks.org/java/dot-operator-in-java/
