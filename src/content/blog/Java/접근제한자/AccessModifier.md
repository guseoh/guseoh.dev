---
title: "자바의 접근 제한자는 무엇일까?"
description: "자바의 public, protected, package-private, private 접근 범위와 캡슐화를 알아보자."
date: 2026-06-22
updated: 2026-06-23
category: "Java"
slug: "java/접근제한자/accessmodifier"
commentKey: "/blog/java/접근제한자/accessmodifier/"
tags:
- Java
- Access Modifier
- JPA
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

이 문제를 막으려면 객체가 외부에 공개할 부분과 내부에서만 사용할 부분을 구분해야 한다. 자바는 이를 위해 **접근 제한자(access modifier)**를 제공한다.

접근 제한자는 클래스, 생성자, 필드, 메서드에 접근할 수 있는 코드의 범위를 결정한다. 단순히 문법적인 접근을 막는 데 그치지 않고 객체의 **내부 구현을 숨기고 외부에 필요한 기능만 공개하는 캡슐화의 기반**이 된다.

## 2. 접근 제한자의 종류와 범위

자바에서 사용하는 접근 수준은 `public`, `protected`, `package-private`, `private` 네 가지다. 접근 범위는 다음 순서로 넓어진다.

```text
private < package-private < protected < public
```

여기서 `package-private`은 별도의 키워드가 아니다. 선언 앞에 접근 제한자를 작성하지 않았을 때 적용되는 접근 수준을 가리키는 용어다.

<!-- table-caption: 접근 제한자의 종류 -->

| 접근 수준             | 같은 클래스 | 같은 패키지 | 다른 패키지의 하위 클래스 | 그 밖의 외부 코드 |
| ----------------- | ------ | ------ | -------------- | ---------- |
| `public`          | O      | O      | O              | O          |
| `protected`       | O      | O      | O              | X          |
| `package-private` | O      | O      | X              | X          |
| `private`         | O      | X      | X              | X          |

`protected`는 다른 패키지의 하위 클래스에서도 접근할 수 있지만, 하위 클래스가 모든 부모 객체의 멤버에 자유롭게 접근할 수 있다는 의미는 아니다. 구체적인 조건은 뒤에서 살펴본다.

### 2.1 public

`public`으로 선언한 최상위 클래스는 다른 패키지에서도 사용할 수 있다. `public` 멤버는 해당 멤버를 선언한 클래스에 접근할 수 있는 모든 코드에서 사용할 수 있다.

```java
public class Member {

    public String getNickname() {
        return "member";
    }
}
```

`Member` 클래스와 `getNickname()` 메서드는 모두 `public`이므로 다른 패키지에서도 사용할 수 있다.

[`public`은 외부에 공개하는 API를 정의할 때 사용한다.](https://github.com/peeljunKim/effective-java/discussions/86) 한 번 공개된 메서드는 여러 코드에서 의존할 수 있으므로 메서드의 시그니처나 공개된 동작을 변경하거나 메서드를 제거하기가 어려워진다.

외부에서 사용할 가능성이 있다는 이유만으로 모든 선언을 `public`으로 열기보다 실제로 외부에 공개해야 하는 기능에만 사용하는 것이 좋다.

### 2.2 protected

`protected`로 선언한 멤버는 다음 위치에서 접근할 수 있다.

* 같은 클래스
* 같은 패키지에 있는 클래스
* 다른 패키지에 있는 하위 클래스

```java
public class Account {

    protected void validateBalance() {
        // 잔액 검증
    }
}
```

같은 패키지에서는 상속 관계가 없어도 `validateBalance()`를 호출할 수 있다. 다른 패키지에서는 `Account`를 상속한 하위 클래스에서만 접근할 수 있다.

`protected`는 단순히 `package-private`과 `public`의 중간 단계가 아니다. **외부 전체에는 공개하지 않으면서 하위 클래스가 특정 기능을 확장하도록 허용**하는 접근 수준이다.

다만 상속을 위해 필드 자체를 `protected`로 공개하면 하위 클래스가 자신이 상속받은 상태를 부모 클래스의 검증 없이 직접 변경할 수 있다.

상태를 직접 노출하기보다 필요한 동작을 `protected` 메서드로 제공하는 편이 부모 클래스의 규칙을 유지하기 쉽다. 즉, **필드는 감추고 동작을 제공하는 것**이다.

```java
public class Account {

    private int balance;

    protected void decreaseBalance(int amount) {
        if (amount <= 0 || balance < amount) {
            throw new IllegalArgumentException("출금할 수 없는 금액입니다.");
        }

        balance -= amount;
    }
}
```

`balance` 필드는 `private`이므로 하위 클래스가 직접 값을 변경할 수 없다. 하위 클래스가 잔액을 감소시키려면 부모 클래스가 제공한 `decreaseBalance()`를 호출해야 하며, 이 과정에서 금액 검증도 함께 수행된다.

### 2.3 package-private

접근 제한자를 생략하면 `package-private` 접근 수준이 적용된다.

```java
class EmailValidator {

    boolean isValid(String email) {
        return email != null && email.contains("@");
    }
}
```

`EmailValidator` 클래스와 `isValid()` 메서드는 **같은 패키지 안에서만 사용**할 수 있다. 다른 패키지에서는 클래스가 존재하더라도 직접 참조할 수 없다.

`package-private`은 하나의 패키지 안에서만 사용하는 구현 클래스나 보조 기능을 숨길 때 유용하다. 외부에는 공개 인터페이스만 제공하고 내부 구현은 `package-private`으로 제한하면 패키지 자체를 하나의 캡슐화 단위로 사용할 수 있다.

```java
// EmailSender.java
public interface EmailSender {

    void send(String email);
}
```

```java
// SmtpEmailSender.java
class SmtpEmailSender implements EmailSender {

    @Override
    public void send(String email) {
        // SMTP 전송
    }
}
```

`EmailSender`와 `SmtpEmailSender`가 `example.email` 패키지에 있고, 이를 사용하는 코드가 `example.notification` 패키지에 있다고 가정해 보자.

외부 패키지인 `example.notification`에서는 `public`으로 선언된 `EmailSender` 인터페이스를 사용할 수 있지만, `package-private`인 `SmtpEmailSender` 구현 클래스에는 직접 접근할 수 없다.

외부 코드는 구체적인 전송 방식보다 이메일을 전송할 수 있다는 추상화에 의존한다. 따라서 내부 구현을 다른 클래스로 교체하더라도 외부 코드에 미치는 영향을 줄일 수 있다.

> [!note] `default`는 접근 제한자 키워드가 아니다.
>
> 접근 제한자를 생략한 상태를 흔히 `default` 접근 제한자라고 부르지만, 자바 문법에는 `default`라는 접근 제한자가 존재하지 않는다.
>
> `default`는 인터페이스의 기본 메서드나 `switch` 문 등 다른 문법에서 사용하는 키워드다. 접근 수준을 표현할 때는 `package-private` 또는 `package access`라는 용어가 더 정확하다.

### 2.4 private

`private`으로 선언한 멤버는 해당 클래스의 구현 내부에서만 사용할 수 있다.

```java
public class Member {

    private String email;

    private void validateEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("이메일은 비어 있을 수 없습니다.");
        }
    }
}
```

다른 클래스는 같은 패키지에 있거나 `Member`를 상속하더라도 `email` 필드와 `validateEmail()` 메서드에 접근할 수 없다.

`private`은 **외부 코드가 객체의 내부 상태와 구현 세부 사항에 의존하지 못하게 한다.** 외부 코드가 내부 구현을 직접 사용하지 않으므로 클래스가 제공하는 공개 동작을 유지하면서 필드 구조나 내부 알고리즘을 변경하기도 쉬워진다.

자바에서는 하나의 최상위 클래스와 그 안에 선언된 중첩 클래스가 서로의 `private` 멤버에 접근할 수 있다.

```java
public class Member {

    private String email;

    static class MemberPrinter {

        void print(Member member) {
            System.out.println(member.email);
        }
    }
}
```

`MemberPrinter`는 `Member` 안에 선언된 중첩 클래스이므로 `Member`의 `private` 필드인 `email`에 접근할 수 있다.

## 3. 선언 위치와 상속에서의 동작

네 가지 접근 수준을 모든 선언에 자유롭게 적용할 수 있는 것은 아니다. **최상위 클래스와 클래스 내부의 멤버는 선언되는 위치가 다르므로 사용할 수 있는 접근 제한자도 달라진다.**

상속 관계에서는 `protected`의 접근 조건과 오버라이딩 규칙도 함께 고려해야 한다.

### 3.1 최상위 클래스와 클래스 멤버

다른 클래스나 인터페이스 내부가 아니라 소스 파일의 최상위 영역에 직접 선언된 클래스를 **최상위 클래스(top-level class)**라고 한다.

최상위 클래스에는 `public` 또는 `package-private`만 적용할 수 있다.

```java
public class Member {
}

class MemberValidator {
}
```

최상위 클래스를 `private`이나 `protected`로 선언하면 컴파일 오류가 발생한다.

```java
// 컴파일 오류: 최상위 클래스에는 private을 사용할 수 없다.
private class Member {
}
```

```java
// 컴파일 오류: 최상위 클래스에는 protected를 사용할 수 없다.
protected class MemberValidator {
}
```

반면 클래스 내부에 선언하는 생성자, 필드, 메서드와 중첩 클래스에는 네 가지 접근 수준을 모두 적용할 수 있다.

```java
public class Member {

    private String email;

    protected Member() {
    }

    public String getEmail() {
        return email;
    }

    class Validator {
    }
}
```

**지역 변수와 메서드 매개변수에는 접근 제한자를 사용할 수 없다.** 지역 변수와 매개변수는 선언된 메서드나 블록에 따라 사용할 수 있는 범위가 이미 정해지기 때문이다.

> [!note] 지역 변수와 메서드 매개변수에 접근 제한자를 사용할 수 없는 이유
>
> 접근 제한자는 클래스나 필드, 메서드처럼 다른 코드에서 접근할 수 있는 **선언의 범위**를 결정한다. 반면 지역 변수와 메서드 매개변수는 선언된 메서드나 블록 내부에서만 사용할 수 있도록 유효 범위가 이미 정해져 있다.
>
> ```java
> public void printMessage(String message) {
>     int count = 1;
>
>     if (count > 0) {
>         String prefix = "[INFO]";
>         System.out.println(prefix + message);
>     }
>
>     // prefix는 if 블록 밖에서 사용할 수 없다.
> }
> ```
>
> 위 코드에서 매개변수인 `message`와 지역 변수인 `count`는 `printMessage()` 메서드 안에서만 사용할 수 있다. `prefix`는 더 좁게 `if` 블록 안에서만 사용할 수 있다.
>
> 이처럼 지역 변수와 매개변수의 유효 범위는 선언된 위치에 따라 자동으로 결정되므로 `public`, `protected`, `private` 같은 접근 제한자를 사용할 수 없다.
>
> ```java
> public void printMessage(private String message) { // 컴파일 오류
>     public int count = 1;                           // 컴파일 오류
> }
> ```
>
> 단, `final`은 접근 제한자가 아니라 변수에 값을 다시 대입하지 못하게 하는 제어자이므로 지역 변수와 매개변수에도 사용할 수 있다.
>
> ```java
> public void printMessage(final String message) {
>     final int count = 1;
> }
> ```

### 3.2 다른 패키지에서의 protected 접근

`protected` 멤버는 다른 패키지의 하위 클래스에서도 접근할 수 있지만, 인스턴스 멤버에 접근할 때는 추가적인 조건이 적용된다.

```java
package example.parent;

public class Parent {

    protected int value = 10;
}
```

다른 패키지에 선언된 하위 클래스에서는 다음과 같이 접근할 수 있다.

```java
package example.child;

import example.parent.Parent;

public class Child extends Parent {

    void print(Parent parent, Child child) {
        System.out.println(this.value);  // 접근 가능
        System.out.println(child.value); // 접근 가능

        // 컴파일 오류
        // System.out.println(parent.value);
    }
}
```

`this.value`는 현재 `Child` 객체가 부모 클래스로부터 상속받은 멤버에 접근하므로 허용된다.

`child.value`도 접근에 사용하는 참조의 타입이 현재 하위 클래스인 `Child`이므로 허용된다.

반면 `parent.value`는 참조의 타입이 부모 클래스인 `Parent`이므로 허용되지 않는다. 다른 패키지의 하위 클래스에 부여되는 `protected` 접근 권한은 **하위 클래스 자신의 구현을 위해 상속받은 멤버를 사용하는 권한**이지, 임의의 부모 객체 내부에 접근할 수 있는 권한이 아니기 때문이다.

```text
현재 Child 객체
└── 상속받은 value에 접근 가능

다른 Child 객체
└── Child 타입을 통해 value에 접근 가능

임의의 Parent 객체
└── Parent 타입을 통해 value에 접근 불가
```

같은 패키지에서는 이러한 하위 클래스 조건이 적용되지 않는다. 같은 패키지 안의 코드는 상속 관계와 관계없이 `protected` 멤버에 접근할 수 있다.

```java
package example.parent;

public class ParentInspector {

    void print(Parent parent) {
        System.out.println(parent.value); // 접근 가능
    }
}
```

즉, `protected`는 다음 두 가지 접근 규칙을 함께 가진다.

```text
같은 패키지
→ 상속 여부와 관계없이 접근 가능

다른 패키지
→ 하위 클래스에서 상속 구현을 위해 제한적으로 접근 가능
```

### 3.3 오버라이딩과 접근 범위

[하위 클래스가 부모 클래스의 메서드를 오버라이딩할 때는 기존 메서드보다 접근 범위를 좁힐 수 없다.](https://www.tcpschool.com/java/java_inheritance_overriding)

```java
// MessageSender.java
public class MessageSender {

    protected void send() {
        System.out.println("메시지를 전송합니다.");
    }
}
```

```java
// EmailSender.java
public class EmailSender extends MessageSender {

    @Override
    public void send() {
        System.out.println("이메일을 전송합니다.");
    }
}
```

부모 클래스의 `send()`는 `protected`이고 하위 클래스의 `send()`는 더 넓은 `public`이므로 올바른 오버라이딩이다.

반면 다음 코드는 부모 메서드보다 접근 범위를 좁히므로 컴파일되지 않는다.

```java
// MessageSender.java
public class MessageSender {

    public void send() {
        System.out.println("메시지를 전송합니다.");
    }
}
```

```java
// EmailSender.java
public class EmailSender extends MessageSender {

    // 컴파일 오류: public 메서드를 protected로 좁힐 수 없다.
    @Override
    protected void send() {
        System.out.println("이메일을 전송합니다.");
    }
}
```

부모 타입을 사용하는 코드는 `public`인 `send()`를 호출할 수 있다고 기대한다.

```java
MessageSender sender = new EmailSender();
sender.send();
```

그런데 하위 클래스가 `send()`를 `protected`나 `private`으로 제한할 수 있다면 부모 타입에서 허용되던 호출이 실제 하위 객체에서는 허용되지 않는 문제가 생긴다.

자바는 이러한 문제를 막기 위해 **오버라이딩한 메서드의 접근 범위를 유지하거나 넓히는 것만 허용**한다.

`private` 메서드는 하위 클래스에서 접근할 수 없으며 상속되지도 않는다. 따라서 하위 클래스에 부모의 `private` 메서드와 같은 이름과 매개변수를 가진 메서드를 선언하더라도 오버라이딩이 아니라 별개의 메서드를 새로 선언한 것이다.

```java
public class Parent {

    private void print() {
        System.out.println("Parent");
    }
}
```

```java
public class Child extends Parent {

    // Parent.print()를 오버라이딩하는 것이 아니다.
    private void print() {
        System.out.println("Child");
    }
}
```

`@Override`를 붙이면 부모 클래스에서 오버라이딩할 수 있는 메서드를 찾지 못하므로 컴파일 오류가 발생한다.

## 4. 캡슐화와 접근 제한자 설계

접근 제한자는 객체의 내부 상태와 구현을 외부에서 숨기는 **정보 은닉(information hiding)**을 지원한다.

객체가 자신의 상태를 직접 관리하도록 만들면 잘못된 값이 저장되는 것을 막고 상태 변경 규칙을 한곳에서 관리할 수 있다.

필드를 `public`으로 공개하면 외부 코드가 객체의 규칙과 관계없이 값을 변경할 수 있다.

```java
public class Member {

    public String email;
    public String nickname;
    public int loginCount;
}
```

```java
Member member = new Member();

member.email = null;
member.nickname = "";
member.loginCount = -100;
```

외부 코드가 어떤 값이 유효한지 알고 직접 검사해야 하므로 객체가 스스로 상태를 보호하지 못한다. 검증 규칙이 여러 코드로 흩어지면 규칙을 변경하거나 값이 변경된 위치를 추적하기도 어려워진다.

필드를 `private`으로 제한하고 상태를 변경하는 메서드를 제공하면 객체가 자신의 규칙을 검사할 수 있다.

```java
public class Member {

    private final String email;
    private String nickname;
    private int loginCount;

    public Member(String email, String nickname) {
        validateEmail(email);
        validateNickname(nickname);

        this.email = email;
        this.nickname = nickname;
        this.loginCount = 0;
    }

    public String getEmail() {
        return email;
    }

    public String getNickname() {
        return nickname;
    }

    public int getLoginCount() {
        return loginCount;
    }

    public void changeNickname(String nickname) {
        validateNickname(nickname);
        this.nickname = nickname;
    }

    public void recordLogin() {
        loginCount++;
    }

    private static void validateEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("이메일은 비어 있을 수 없습니다.");
        }
    }

    private static void validateNickname(String nickname) {
        if (nickname == null || nickname.isBlank()) {
            throw new IllegalArgumentException("닉네임은 비어 있을 수 없습니다.");
        }
    }
}
```

외부에서는 이메일을 조회할 수 있지만 직접 변경할 수 없다. 닉네임은 `changeNickname()`을 거쳐야 하므로 객체가 유효성을 검사한 뒤 값을 변경한다.

로그인 횟수도 외부에서 임의의 숫자를 대입하는 대신 `recordLogin()`이라는 동작을 통해서만 증가한다.

`Getter`를 제공한다고 해서 반드시 `Setter`도 제공해야 하는 것은 아니다. 읽기는 허용하되 변경은 제한할 수 있다.

상태 변경이 필요하다면 `setNickname()`처럼 단순히 값을 대입하는 메서드보다 `changeNickname()`처럼 변경의 목적과 의도가 드러나는 메서드를 제공하는 편이 좋다.

접근 제한자를 선택할 때는 가능한 한 좁은 범위에서 시작하는 것이 좋다.

* 클래스 내부에서만 사용한다면 `private`으로 선언한다.
* 같은 패키지의 협력 객체에서만 사용한다면 `package-private`을 검토한다.
* 하위 클래스의 확장을 의도적으로 허용한다면 `protected`를 사용한다.
* 외부 코드가 사용해야 하는 계약이라면 `public`으로 공개한다.

처음부터 모든 멤버를 `public`으로 선언한 뒤 필요할 때 접근 범위를 제한하려고 하면 이미 해당 멤버에 의존하는 코드가 생겼을 수 있다.

반대로 좁게 선언한 멤버는 실제로 외부 공개가 필요해졌을 때 접근 범위를 넓힐 수 있다.

접근 제한자는 애플리케이션의 인증이나 권한 검사를 대신하는 보안 기능은 아니다. 외부 사용자의 요청을 제한하려면 인증, 인가, 입력 검증과 같은 별도의 보안 처리가 필요하다.

접근 제한자의 주된 목적은 **프로그램 내부에서 허용되지 않은 의존과 상태 변경을 줄이는 것**이다.

## 5. Spring과 JPA에서의 활용

Spring Framework는 빈의 메타데이터를 분석하고 객체를 생성하거나 의존성을 주입하는 과정에서 리플렉션을 활용한다. 또한 AOP나 선언적 트랜잭션처럼 메서드 호출 전후에 부가 기능을 적용할 때 프록시를 사용한다.

Hibernate와 같은 JPA 구현체도 엔티티를 생성하고 영속 상태에 접근하는 과정에서 리플렉션이나 바이트코드 기술을 활용하며, 지연 로딩 등을 구현할 때 프록시를 사용할 수 있다.

그렇다고 접근 제한자를 무시해도 되는 것은 아니다. 프레임워크가 요구하는 최소한의 접근 범위는 허용하되 애플리케이션 코드에는 불필요한 객체 생성과 상태 변경을 제한해야 한다.

### 5.1 JPA 엔티티의 필드와 생성자

[Jakarta Persistence 명세](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2)에 따르면 엔티티 클래스에는 매개변수가 없는 `public` 또는 `protected` 생성자가 있어야 한다.

Hibernate와 같은 영속성 제공자는 데이터베이스 조회 결과를 엔티티로 만들 때 기본 생성자를 이용해 객체를 생성한다.

기본 생성자를 `public`으로 선언하면 애플리케이션 코드에서도 필수 값 없이 엔티티를 생성할 수 있다.

```java
Member member = new Member();
```

이와 같은 생성을 줄이기 위해 기본 생성자를 `protected`로 제한할 수 있다.

```java
@Entity
public class Member {

    @Id
    @GeneratedValue
    private Long id;

    private String email;

    private String nickname;

    protected Member() {
    }

    public Member(String email, String nickname) {
        this.email = email;
        this.nickname = nickname;
    }
}
```

`protected` 생성자는 같은 패키지에서 호출할 수 있고, 다른 패키지에서는 하위 클래스의 생성 과정에서 사용할 수 있다. 일반적인 외부 애플리케이션 코드는 다음과 같이 직접 호출할 수 없다.

```java
Member member = new Member(); // 다른 패키지라면 컴파일 오류
```

JPA가 요구하는 생성자는 제공하면서도 외부에서 불완전한 객체를 만드는 경로를 줄일 수 있다.

Lombok을 사용한다면 같은 생성자를 다음과 같이 만들 수 있다.

```java
@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member {

    @Id
    @GeneratedValue
    private Long id;

    private String email;

    private String nickname;

    public Member(String email, String nickname) {
        this.email = email;
        this.nickname = nickname;
    }
}
```

`@NoArgsConstructor(access = AccessLevel.PROTECTED)`는 매개변수가 없는 `protected` 생성자를 생성한다.

예제처럼 `@Id`를 필드에 선언하면 JPA는 기본적으로 **필드 접근 방식(field access)**을 사용한다.

필드 접근 방식에서는 영속성 제공자가 `Getter`나 `Setter`를 거치지 않고 엔티티의 필드에 직접 접근하여 값을 읽고 쓴다. 필드가 `private`이어도 영속성 제공자가 접근할 수 있으므로 JPA의 영속성 처리를 위해 모든 필드에 `Setter`를 만들 필요가 없다.

```java
@Entity
public class Member {

    @Id
    @GeneratedValue
    private Long id;

    private String email;

    private String nickname;

    protected Member() {
    }

    public void changeNickname(String nickname) {
        this.nickname = nickname;
    }
}
```

엔티티 필드는 일반적으로 `private`으로 제한하고 필요한 `Getter`와 상태 변경 메서드만 공개한다.

모든 필드에 `Setter`를 제공하면 어느 코드에서 어떤 목적으로 상태를 변경했는지 파악하기 어려워지고 엔티티가 자신의 상태 변경 규칙을 관리하기도 어려워진다.

### 5.2 Spring 프록시와 접근 제한자

Spring은 AOP와 선언적 트랜잭션 같은 기능을 적용할 때 원본 객체를 감싸는 프록시 객체를 사용할 수 있다.

```text
호출 코드
    ↓
프록시 객체
    ↓
트랜잭션 시작
    ↓
실제 객체의 메서드 호출
    ↓
트랜잭션 종료
```

프록시 기반 기능은 메서드 호출이 프록시를 통과할 때 적용된다. 특히 `private` 메서드는 하위 클래스에서 오버라이딩할 수 없으므로 클래스 기반 프록시가 해당 메서드를 재정의하여 호출을 가로챌 수 없다.

따라서 `@Transactional`과 같이 프록시를 통해 적용되는 기능은 일반적으로 외부에서 호출되는 공개 메서드에 선언하는 것이 좋다.

```java
@Service
public class MemberService {

    @Transactional
    public void registerMember() {
        // 회원 등록
    }
}
```

같은 클래스 내부에서 다음처럼 메서드를 직접 호출하면 호출이 프록시를 거치지 않을 수 있다.

```java
@Service
public class MemberService {

    public void register() {
        saveMember();
    }

    @Transactional
    public void saveMember() {
        // 회원 저장
    }
}
```

위 코드에서 `register()`가 `saveMember()`를 직접 호출하면 현재 객체 내부의 호출이므로 프록시 기반 트랜잭션이 기대한 방식으로 적용되지 않을 수 있다.

이처럼 프레임워크가 리플렉션이나 프록시를 사용하더라도 접근 제한자의 의미가 사라지는 것은 아니다. 접근 범위는 애플리케이션 코드의 의존 관계를 표현하고 객체의 상태와 구현을 보호하는 기준으로 계속 사용된다.

## 6. 정리

접근 제한자는 단순히 다른 코드의 접근을 막는 문법이 아니다. 객체가 외부에 공개할 기능과 내부에서 관리할 구현을 구분하고, 잘못된 상태 변경과 불필요한 의존을 줄이는 설계 도구다.

* `private`은 클래스 내부에서만 사용하는 상태와 구현을 감춘다.
* `package-private`은 같은 패키지 안에서만 사용하는 구현을 숨긴다.
* `protected`는 같은 패키지의 코드와 다른 패키지의 하위 클래스에 제한적인 접근을 허용한다.
* `public`은 외부 코드가 사용할 수 있는 공개 API를 정의한다.

접근 범위는 처음부터 넓게 열기보다 필요한 최소 범위에서 시작하는 것이 좋다. 필드는 가능한 한 감추고 객체가 허용하는 동작을 메서드로 제공하면 객체가 자신의 상태와 규칙을 스스로 관리할 수 있다.

## 참고 자료

### 공식 문서

* [The Java Language Specification, Java SE 26 Edition - Access Control](https://docs.oracle.com/en/java/javase/26/docs/specs/jls/jls-6.html)
* [Oracle Java Tutorials - Controlling Access to Members of a Class](https://docs.oracle.com/javase/tutorial/java/javaOO/accesscontrol.html)
* [Jakarta Persistence 3.2 Specification](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2)
* [Hibernate ORM User Guide](https://docs.hibernate.org/orm/current/userguide/html_single/Hibernate_User_Guide.html)
* [Lombok - Constructor Annotations](https://projectlombok.org/features/constructor)
* [Spring Framework - Proxying Mechanisms](https://docs.spring.io/spring-framework/reference/core/aop/proxying.html)
* [Spring Framework - Using @Transactional](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html)


* [자바의 접근 제어자와 protected와 private는 왜 사용되는가?](https://inkyu-yoon.github.io/docs/Language/Java/AccessModifier)
* [부모 클래스의 메소드 오버라이딩이 더 큰 범위의 접근 제어자만 가능한 이유](https://mangkyu.tistory.com/228)
* [JUnit의 진화 과정과 public 접근 제어자](https://mangkyu.tistory.com/280)
* [메소드 오버라이딩](https://www.tcpschool.com/java/java_inheritance_overriding)
* [Spring 동적 프록시 기술 1 - 리플렉션](https://junior-datalist.tistory.com/278)
* [SpringBoot & JPA로 간단 API 만들기](https://jojoldu.tistory.com/251)
* [DDD 리포지터리: 엔티티와 JPA 매핑 구현](https://assu10.github.io/dev/2024/04/07/ddd-repository-1/)
* [Spring Boot 버전업 중 알게 된 Java 버전별 캡슐화 정책 강화](https://helloworld.kurly.com/blog/75-java-module-with-gson-serialization/)
