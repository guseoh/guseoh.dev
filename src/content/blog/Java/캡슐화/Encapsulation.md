---
title: "자바의 캡슐화는 무엇일까?"
description: "캡슐화의 의미와 필요한 이유를 알아보자."
date: 2026-06-24
updated: 2026-06-24
category: "Java"
tags:
  - Java
  - OOP
  - Encapsulation
book: ""
chapter: 1
heroImage: "/og-image.svg"
draft: false
---

## 1. 들어가기 전

지금까지 클래스와 객체, 필드와 메서드, 생성자, 접근 제한자를 살펴봤다. 클래스는 객체의 상태를 필드로 표현하고 행동을 메서드로 구현하며, 접근 제한자는 외부에서 클래스와 멤버를 사용할 수 있는 범위를 정한다.

하지만 필드를 `private`으로 선언하는 것만으로 객체지향적인 설계가 완성되지는 않는다.

```java
public class BankAccount {

    private long balance;

    public void setBalance(long balance) {
        this.balance = balance;
    }
}
```

`balance`는 `private`으로 선언되어 외부에서 직접 접근할 수 없지만, `Setter`를 호출하면 어떤 값이든 저장할 수 있다.

```java
BankAccount account = new BankAccount();
account.setBalance(-10_000);
```

잔액이 음수가 되어서는 안 된다는 규칙이 있더라도 객체가 스스로 이를 지키지 못한다. **객체의 상태를 보호하려면 접근을 제한하는 것뿐 아니라 상태를 변경하는 방법도 객체 내부에서 관리**해야 한다.

이러한 설계 원리를 **캡슐화(encapsulation)** 라고 한다.

## 2. 캡슐화란 무엇일까?

**캡슐화**는 객체의 상태와 그 상태를 다루는 행동을 하나로 묶고, 외부에서는 객체가 공개한 기능으로만 상호작용하도록 만드는 객체지향 원칙이다.

자바에서는 주로 다음 방법으로 캡슐화를 구현한다.

- 필드를 외부에 직접 공개하지 않는다.
- 상태를 변경하는 규칙을 메서드 안에 둔다.
- 외부에서 사용할 기능만 공개한다.
- 내부 구현에 사용하는 메서드는 숨긴다.

```java
public class BankAccount {

    private long balance;

    // 생성자로 초기 잔액을 설정한다. 
    public BankAccount(long initialBalance) {
        if (initialBalance < 0) {
            throw new IllegalArgumentException(
                    "초기 잔액은 음수일 수 없습니다."
            );
        }

        this.balance = initialBalance;
    }

    // 계좌에 금액을 입금하는 메서드
    public void deposit(long amount) {
        validatePositiveAmount(amount);
        balance += amount;
    }

    // 계좌에 금액을 출금하는 메서드
    public void withdraw(long amount) {
        validatePositiveAmount(amount);

        if (balance < amount) {
            throw new IllegalStateException("잔액이 부족합니다.");
        }

        balance -= amount;
    }

    public long getBalance() {
        return balance;
    }

    // 금액이 0보다 큰지 검사
    private static void validatePositiveAmount(long amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException(
                    "금액은 0보다 커야 합니다."
            );
        }
    }
}
```

외부 코드는 잔액을 직접 계산하거나 수정하지 않고 **객체에 행동을 요청**한다.

```java
BankAccount account = new BankAccount(10_000);

account.deposit(5_000);
account.withdraw(3_000);

System.out.println(account.getBalance());
```

`BankAccount`는 다음 규칙을 스스로 관리한다.

- 초기 잔액은 음수가 될 수 없다.
- 입금액과 출금액은 0보다 커야 한다.
- 출금 후 잔액은 음수가 될 수 없다.

객체가 항상 만족해야 하는 규칙이나 조건을 불변식(invariant)이라고 한다. **불변식은 객체의 상태가 변하지 않는다는 뜻이 아니라, 상태가 변경되더라도 계속 지켜야 하는 규칙**을 의미한다.

캡슐화를 적용하면 상태 변경 경로가 생성자, `deposit()`, `withdraw()`로 제한된다. **객체의 규칙이 여러 외부 코드에 흩어지지 않고 객체 내부에 모인다.**

## 3. 캡슐화를 적용할 때 주의할 점

캡슐화의 핵심은 필드를 무조건 숨기는 데 있지 않다. 객체가 자신의 상태와 규칙을 관리하고, 외부에서 필요한 기능만 제공하는 데 있다.

### 3.1 Setter보다 행동을 나타내는 메서드를 사용한다

```java
account.setBalance(20_000);
```

이 코드만 보면 입금인지, 출금인지, 초기화인지 알기 어렵다. 검증 규칙도 호출하는 코드에서 따로 처리해야 한다.

객체가 수행하는 행동을 메서드로 표현하면 **상태 변경의 목적과 규칙**이 함께 드러난다.

```java
account.deposit(10_000);
account.withdraw(3_000);
```

`Setter`가 항상 잘못된 것은 아니다. 단순히 데이터를 전달하는 객체에서는 사용할 수 있다. 그러나 상태와 규칙을 가진 객체에 모든 필드의 `Setter`를 제공하면 외부 코드가 객체의 내부 상태를 직접 조작하게 될 수 있다.

### 3.2 Getter로 꺼낸 값을 외부에서 처리하지 않는다

`Getter`로 상태를 조회한 뒤 외부에서 계산하고 다시 `Setter`로 저장하면 객체가 맡아야 할 **책임이 외부로 이동**한다.

```java
if (account.getBalance() >= amount) {
    account.setBalance(account.getBalance() - amount);
}
```

출금 규칙은 `BankAccount`가 관리하는 것이 자연스럽다.

```java
account.withdraw(amount);
```

`Getter`를 사용해서는 안 된다는 뜻은 아니다. 화면 출력이나 결과 전달처럼 상태 조회가 필요한 상황도 있다. 다만 **`Getter`로 값을 꺼낸 외부 코드가 객체 대신 판단하고 상태를 변경하고 있지는 않은지 확인**해야 한다.

<details>
    <summary>더보기: 책임이 외부로 이동</summary>
<div markdown="1">

객체지향 설계에서는 **데이터와 그 데이터를 처리하는 행동을 하나의 객체 안에 모으는 것**이 중요하다.

데이터를 가진 객체가 스스로 합격 여부나 출금 가능 여부를 판단하도록 하면 객체의 자율성이 높아진다. 반대로 `Getter`로 값을 꺼낸 뒤 외부에서 판단하고 처리하면, 객체가 담당해야 할 책임이 서비스나 호출 코드로 흩어지게 된다.

#### 문제점: 책임이 외부로 이동한 경우

```java
class Student {

    private int score;

    public int getScore() {
        return score;
    }
}

int score = student.getScore();

if (score >= 60) {
    System.out.println("합격!");
}
```
이 코드에서 `Student`는 점수 데이터만 보관하고, 합격 여부에 대한 판단은 외부 코드가 담당한다.

외부 코드는 `score`를 조회하고, 합격 기준을 알고 있으며, 직접 결과를 판단한다. 따라서 **합격 판단이라는 책임이 `Student` 객체 밖으로 이동한 상태**다.

이러한 구조는 객체를 단순한 데이터 저장소로 만들고, 관련 규칙이 여러 외부 코드에 중복될 가능성을 높인다.

#### 해결책: 객체 내부로 책임 되돌리기

```java
class Student {

    private int score;

    public boolean isPass() {
        return score >= 60;
    }
}

if (student.isPass()) {
    System.out.println("합격!");
}
```

`Student`가 자신이 가진 점수를 기준으로 합격 여부를 직접 판단하도록 변경했다.

외부 코드는 합격 기준이나 판단 과정을 알 필요 없이 `isPass()`라는 메시지를 객체에 전달한다. 합격 기준이 변경되더라도 `Student` 내부의 로직만 수정하면 된다.

#### 기대 효과

- **응집도 향상**: 데이터와 관련된 판단 로직이 하나의 객체에 모인다.
- **결합도 감소**: 외부 코드는 객체의 내부 데이터와 처리 방식을 알 필요가 없다.
- **중복 방지**: 같은 판단 로직이 여러 서비스나 컨트롤러에 반복되는 것을 줄일 수 있다.
- **객체의 자율성 향상**: 객체가 자신의 상태를 바탕으로 스스로 판단하고 행동한다.
- **유지보수성 향상**: 규칙이 변경되어도 해당 객체 내부만 수정하면 된다.

즉, 객체지향 설계에서는 데이터를 외부로 꺼내 처리하기보다, 데이터를 가진 객체에 관련 행동을 요청하는 방식이 좋다. 

</div>
</details>

### 3.3 가변 객체를 그대로 반환하지 않는다

필드가 `private`이어도 내부에서 관리하는 가변 객체를 그대로 반환하면 외부에서 내부 상태를 변경할 수 있다.

```java
public class BankAccount {

    private final List<String> histories = new ArrayList<>();

    public List<String> getHistories() {
        return histories;
    }
}
```

외부 코드는 반환받은 리스트를 직접 변경할 수 있다.

```java
account.getHistories().clear();
```

수정할 수 없는 복사본을 반환하면 외부에서 리스트의 원소를 추가하거나 삭제하지 못하므로 내부 리스트를 보호할 수 있다.

단, `List.copyOf()`는 리스트 내부의 객체까지 깊게 복사하지 않는다. 원소가 가변 객체라면 해당 객체의 상태는 여전히 변경될 수 있다.


::link-mention{url="https://innovation123.tistory.com/217" title="깊은 복사(Deep Copy) vs 얕은 복사(Shallow Copy)" description="출처: https://innovation123.tistory.com/217 [HS_dev_log:티스토리]"}


```java
public List<String> getHistories() {
    return List.copyOf(histories);
}
```

외부에서 가변 객체를 전달받을 때도 같은 문제가 생길 수 있다. 필요한 경우 **생성자나 메서드에서 복사본을 저장**해야 한다.

```java
public BankAccount(List<String> histories) {
    this.histories = List.copyOf(histories);
}
```

외부에서 전달받거나 외부로 반환하는 가변 객체를 복사해 내부 상태를 보호하는 방식을 **방어적 복사(defensive copy)** 라고 한다.

::link-mention{url="https://github.com/peeljunKim/effective-java/discussions/121" title="적시에 방어적 복사본을 만들라" description="이펙티브 자바 아이템 50. 적시에 방어적 복사본을 만들라}


## 4. 참고 자료

- [Getter를 사용하는 대신 객체에 메시지를 보내자](https://tecoble.techcourse.co.kr/post/2020-04-28-ask-instead-of-getter/)
- [디미터 법칙(Law of Demeter)](https://tecoble.techcourse.co.kr/post/2020-06-02-law-of-demeter/)
- [Oracle Java Tutorials: What Is an Object?](https://docs.oracle.com/javase/tutorial/java/concepts/object.html)
- [[Java] 깊은 복사(Deep Copy) vs 얕은 복사(Shallow Copy)](https://innovation123.tistory.com/217)
- [이펙티브 자바 아이템 50: 적시에 방어적 복사본을 만들라](https://github.com/peeljunKim/effective-java/discussions/121)

