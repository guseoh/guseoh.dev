---
title: "[OS] 운영체제 개요"
description: ""
date: 2026-05-20
updated: 2026-05-20
category: OS
tags: ["OS"]
series: "아주 쉬운 세가지 이야기"
seriesOrder: 1
featured: true
draft: false
---

# 운영체제 개요

운영체제를 공부할 때 가장 먼저 이해해야 하는 것은 운영체제가 왜 필요한가이다. 

**프로그램은 기본적으로 CPU가 명령어를 가져오고, 해석하고, 실행하는 과정을 반복하면서 동작**한다. 이 구조는 폰 노이만 컴퓨팅 모델의 기본 개념이다. 

하지만 실제 컴퓨터에서는 단순히 하나의 프로그램만 실행하는 것이 아니라, 여러 프로그램이 동시에 실행되고, 메모리를 공유하며, 디스크나 입출력 장치와도 상호작용한다.

이 복잡한 과정을 관리해주는 핵심 소프트웨어가 바로 **운영체제**이다.

운영체제는 CPU, 메모리, 디스크 같은 물리적 자원을 직접 사용자에게 노출하지 않는다. 대신 사용하기 쉬운 형태로 추상화하고 프로그램들이 안전하고 효율적으로 자원을 사용할 수 있도록 관리한다.

> [!note]
> 즉, 운영체제는 물리 자원을 가상의 형태로 제공하고, 프로그램은 시스템 호출을 통해 운영체제에게 필요한 기능을 요청한다.

<br>

## 운영체제의 핵심 역할

운영체제의 역할은 크게 아래와 같이 정리할 수 있다.

1. CPU 가상화
2. 메모리 가상화
3. 병행성 관리
4. 영속성 제공
5. 자원 관리
6. 보호와 안정성 제공
   
운영체제는 단순히 프로그램을 실행시켜주는 도구가 아니다.

여러 프로그램이 동시에 실행되는 환경에서 아래와 같은 문제를 해결해야 한다.

- 여러 프로그램이 CPU를 어떻게 사용할 것인가? → **CPU 스케줄링**
- 각 프로그램은 메모리를 어떻게 나누어 사용할 것인가? → **가상 메모리**
- 여러 스레드가 동시에 같은 데이터를 수정하면 어떻게 되는가? → **동기화**
- 파일은 디스크에 어떻게 안전하게 저장할 것인가? → **파일 시스템**
- 한 프로그램의 오류가 다른 프로그램에 영향을 주지 않게 하려면 어떻게 해야 하는가? → **프로세스 격리**

결국 운영체제는 **자원 관리자**이자, **하드웨어와 응용 프로그램 사이의 중재자**라고 볼 수 있다.

<br>

# CPU 가상화

CPU는 **컴퓨터에서 명령어를 실행하는 핵심 장치**이다.

프로그램이 실행된다는 것은 결국 CPU가 해당 프로그램의 명령어를 읽고 실행한다는 뜻이다.   
하지만 실제 컴퓨터에서는 하나의 프로그램만 실행되지 않는다.

예를 들어 브라우저 실행, 음악 재생, IDE 실행 등 사용자 입장에서는 이 프로그램들이 모두 동시에 실행되는 것처럼 보인다.

하지만 CPU는 한정된 자원이다. 운영체제는 CPU 시간을 매우 짧은 단위로 나누어 여러 프로그램에 번갈아 할당한다.(이러한 방식을 시분할 시스템 또는 라운드 로빈 스케줄링이라고 부른다.)

이렇게 하나 또는 제한된 개수의 CPU를 여러 프로그램이 동시에 사용하는 것처럼 보이게 만드는 것을 **CPU 가상화**라고 한다.

```java
public class CpuExample {

    public static void main(String[] args) throws InterruptedException {
        if (args.length != 1) {
            System.err.println("사용법: java CpuExample <문자열>");
            System.exit(1);
        }

        String message = args[0];

        while (true) {
            Thread.sleep(1000);
            System.out.println(message);
        }
    }
}
```

이 코드는 실행 인자로 전달받은 문자열을 1초마다 계속 출력하는 프로그램이다.
하지만 위 프로그램은 단순히 문자열을 출력하는 것이 아니다. 핵심은 **같은 프로그램을 여러 개 동시에 실행했을 때 운영체제가 각 프로그램을 번갈아 실행시킨다는 점**이다.

각 Java 프로그램은 운영체제 입장에서 하나의 프로세스이다.

운영체제는 **여러 프로세스에 CPU 시간을 나누어 제공**한다. 그래서 사용자는 여러 프로그램이 동시에 실행되는 것처럼 느낀다.

이것이 CPU 가상화의 기본 아이디어다.

> [!note]
> 프로세스(Process)는 '컴퓨터에서 현재 실행 중인 프로그램'을 의미한다.

<br>

# 메모리 가상화

메모리 가상화를 통해 운영체제는 각 프로그램이 자신만의 메모리 공간을 가지고 있는 것처럼 만든다. 실제로 모든 프로그램은 같은 물리 메모리를 공유하지만, 운영체제가 **각 프로그램에게 독립된 가상 주소 공간을 제공하여 다른 프로그램과 메모리를 공유하지 않는 것**처럼 보이게 한다.

만약 프로그램을 여러 번 동시에 실행하면, 모든 프로그램이 같은 메모리 주소에 값을 할당받는 것처럼 보인다. 그러나 실제로는 각 프로그램이 독립된 가상 메모리 공간을 사용하므로, 각 프로그램은 자신만의 메모리 공간에서 작업을 수행한다. 

이로 인해 한 프로그램의 작업이 다른 프로그램에 영향을 주지 않는다.

```java
public class MemoryExample {

    static class Box {
        int value;
    }

    public static void main(String[] args) throws InterruptedException {
        Box box = new Box();
        box.value = 0;

        long pid = ProcessHandle.current().pid();

        System.out.printf("프로세스 ID: %d%n", pid);

        while (true) {
            Thread.sleep(1000);
            box.value++;

            System.out.printf("(%d) box.value = %d%n", pid, box.value);
        }
    }
}
```

위 코드는 `Box` 객체를 생성하고, 그 안에 있는 `value` 값을 1초마다 증가시키는 프로그램이다.

첫 번째 터미널:

```
프로세스 ID: 12001
(12001) box.value = 1
(12001) box.value = 2
(12001) box.value = 3
```

두 번째 터미널:

```
프로세스 ID: 12002
(12001) box.value = 1
(12001) box.value = 2
(12001) box.value = 3
```

각 프로그램의 `box.value`는 서로 영향을 주지 않는다.

이 예제의 핵심은 여러 개의 프로그램을 동시에 실행해도 각 프로그램의 데이터가 서로 분리되어 있다는 점이다.

각 Java 프로그램은 별도의 프로세스로 실행된다. 그리고 각 프로세스는 운영체제로부터 독립적인 메모리 공간을 제공받는다.

따라서 한 프로세스에서 만든 `Box` 객체는 다른 프로세스에서 접근할 수 없다.

이것이 메모리 가상화의 핵심이다.

> [!important]
> 운영체제는 각 프로세스가 자신만의 메모리를 사용하는 것처럼 보이게 만들고, 한 프로세스의 메모리 접근이 다른 프로세스에 영향을 주지 않도록 보호한다.

<br>

# 병행성

병행성은 프로그램이 여러 작업을 동시에 수행하려고 할 때 발생하는 문제를 의미한다. 이러한 문제는 운영체제 내부에서뿐만 아니라, 멀티 쓰레드 프로그램에서도 발생한다.

> [!note]
> 운영체제는 여러 프로세스와 스레드를 관리한다. 프로세스는 실행 중인 프로그램이고, 스레드는 프로세스 안에서 실행되는 작업 단위이다.
> 
> 하나의 프로세스 안에서도 여러 스레드가 동시에 실행될 수 있다.

예를 들어 `counter` 라는 변수를 두 개의 스레드가 각각 `counter` 값을 1000번씩 증가시킨다면 최종 결과는 1000 + 1000 = 2000이 되어야 한다.

그러나 `counter++` 연산이 여러 단계로 나누어 실행되기 때문에 실제로는 2000보다 작은 값이 나올 수 있다.

이처럼 여러 스레드가 공유 자원에 동시에 접근하면서 실행 결과가 예상과 달라지는 문제를 **경쟁 상태**라고 한다.

```java
public class ThreadRaceExample {

    private static int counter = 0;
    private static int loops;

    public static void main(String[] args) throws InterruptedException {
        if (args.length != 1) {
            System.err.println("사용법: java ThreadRaceExample <반복횟수>");
            System.exit(1);
        }

        loops = Integer.parseInt(args[0]);

        Thread t1 = new Thread(new Worker());
        Thread t2 = new Thread(new Worker());

        System.out.println("초기 counter 값: " + counter);

        t1.start();
        t2.start();

        t1.join();  // join(): 해당 스레드가 종료될 때까지 현재 스레드가 기다리게 한다.
        t2.join();

        System.out.println("최종 counter 값: " + counter);
    }

    static class Worker implements Runnable {
        @Override
        public void run() {
            for (int i = 0; i < loops; i++) {
                counter++;
            }
        }
    }
}
```

위 코드는 두 개의 스레드가 하나의 `counter` 값을 동시에 증가시키는 예제이다.

기대하는 결과:
```
초기 counter 값: 0
최종 counter 값: 200000
```

실제 결과:
```
초기 counter 값: 0
최종 counter 값: 143827
```

위 예제가 병행성에서 발생할 수 있는 대표적인 문제를 보여준다.

여러 스레드가 동시에 실행되면 실행 순서를 개발자가 정확하게 예측하기 어렵다. 운영체제의 스케줄러는 상황에 따라 스레드 실행 순서를 바꾼다.

공유 데이터를 여러 스레드가 동시에 수정하는 경우에는 반드시 **동기화**가 필요하다.

> [!note]
> 동기화(Synchronization)는 여러 스레드가 CPU를 나누어 쓰며 동시에 달릴 때, 데이터가 꼬이지 않도록 접근 순서를 조정 해주는 것이다.
>
> OS는 크게 두 가지 방식으로 동기화를 한다.
> 
> - 락(Lock 방식): 한 스레드가 자원을 쓸 때 OS가 자물쇠를 채운다.
> - 원자적 연산 방식: OS가 개입해 스레드를 잠재우는 대신, CPU 하드웨어 기능을 이용해 데이터 Read, Write, Update 단계를 쪼갤 수 없는 '하나의 덩어리'로 묶어 처리한다.

<br>

# 영속성

DRAM과 같은 저장 장치는 전원이 꺼지면 데이터를 잃어버리기 때문에, 데이터를 영구적으로 보관할 방법이 필요하다. 이를 위해 하드 드라이브나 SSD와 같은 하드웨어, 이들을 관리하는 파일 시스템이라는 소프트웨어가 사용된다.

파일 시스템은 **사용자가 만든 파일을 디스크에 저장하고, 이를 효율적으로 관리하는 역할**을 한다. 운영체제에서는 프로그램마다 별도의 가상 디스크를 만들지 않고 파일 정보를 여러 사용자와 프로그램이 함께 공유할 수 있도록 한다.

> 데이터를 어떻게 영구적으로 저장할 수 있는가?
> 
파일 시스템은 이러한 작업을 수행하는 운영체제의 일부로, 데이터를 안전하게, 효율적으로 저장하고 접근할 수 있는 다양한 기법과 정책이 필요하다.

또한, 하드웨어나 소프트웨어에 문제가 생겨도 데이터를 안전하게 보호할 방법에 대해서도 고려해야 한다.

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;

public class FilePersistenceExample {

    public static void main(String[] args) {
        Path path = Path.of("file.txt");

        try {
            Files.writeString(
                    path,
                    "hello world\n",
                    StandardOpenOption.CREATE, //파일이 없으면 새로 생성
                    StandardOpenOption.TRUNCATE_EXISTING, // 있다면 기존 내용 지우고 새로 작성
                    StandardOpenOption.WRITE // 파일에 쓰기
            );

            System.out.println("파일 쓰기 완료: " + path.toAbsolutePath());

        } catch (IOException e) {
            System.err.println("파일 쓰기 실패: " + e.getMessage());
        }
    }
}
```

위 코드는 `file.txt` 파일을 생성하고, 그 안에 `"hello world"` 문자열을 저장하는 코드이다.

Java 코드에서는 `Files.writeString()`을 호출하지만, 실제 파일 생성과 쓰기 작업은 운영체제의 파일 시스템을 통해 처리된다.

운영체제가 디스크에 데이터를 쓰기 위해 수행하는 작업은 상당히 복잡하다. 파일 시스템은 새 데이터를 디스크 어디에 저장할지 결정해야 하고, 다양한 자료 구조를 통해 데이터 상태를 추적해야 한다.

# 참고 자료

https://os2024.jeju.ai/week01/index.html