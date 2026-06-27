---
title: "[Spring] 서블릿이란 무엇일까?"
description: "서블릿의 개념과 동작 방식, 서블릿 컨테이너의 역할, Spring MVC로 발전한 이유를 알아보자."
date: 2026-06-11
updated: 2026-06-27
category: "Spring"
slug: "spring/servlet"
commentKey: "/blog/spring/servlet/"
tags:
    - Java
    - Servlet
    - Spring MVC
book: ""
chapter: 1
heroImage: "/og-image.svg"
draft: false
---

## 1. 들어가기 전

웹 애플리케이션은 클라이언트가 HTTP 요청을 보내면 서버가 요청을 처리한 뒤 HTTP 응답을 반환하는 구조로 동작한다. **서블릿(Servlet)** 은 이 과정에서 Java 코드로 HTTP 요청과 응답을 처리하기 위한 표준 기술이다.

예를 들어 `/hello?username=world` 요청을 다음 서블릿이 처리한다고 가정해보자.

```java
@WebServlet(name = "helloServlet", urlPatterns = "/hello")
public class HelloServlet extends HttpServlet {

    @Override
    protected void service(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {

        String username = request.getParameter("username");

        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("hello " + username);
    }
}
```

`HttpServletRequest`는 요청 정보를 제공하고, `HttpServletResponse`는 응답 상태, 헤더와 본문을 작성할 수 있게 해준다. 위 코드에서는 요청 파라미터 `username`을 읽어 `hello world`라는 응답을 반환한다.

Spring Boot에서 `@WebServlet`으로 서블릿을 직접 등록하려면 애플리케이션에 `@ServletComponentScan`을 선언해야 한다.

```java
@ServletComponentScan
@SpringBootApplication
public class ServletApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServletApplication.class, args);
    }
}
```

일반적인 Spring MVC 애플리케이션에서는 서블릿을 직접 작성하는 경우가 많지 않다. 그러나 Spring MVC의 진입점인 `DispatcherServlet`도 서블릿으로 동작한다. 따라서 서블릿을 이해하면 HTTP 요청이 컨트롤러까지 전달되는 기반 구조를 파악할 수 있다.

## 2. 서블릿 컨테이너와 생명주기

서블릿은 개발자가 직접 생성하는 객체가 아니다. Tomcat과 같은 **서블릿 컨테이너(Servlet Container)** 가 서블릿을 생성하고 초기화하며, 요청 URL에 맞는 서블릿을 찾아 호출한다.

![서블릿 요청 처리 흐름](<스크린샷 2026-06-11 162123.png>)

서블릿 컨테이너는 클라이언트의 HTTP 요청을 받으면 요청 URL과 연결된 서블릿을 찾는다. 그다음 `HttpServletRequest`와 `HttpServletResponse` 객체를 생성해 서블릿의 `service()` 메서드에 전달한다.

```text
Client
    → HTTP 요청
    → WAS / Servlet Container
    → Servlet
    → HTTP 응답
```

서블릿 컨테이너는 요청 처리뿐 아니라 서블릿의 생명주기도 관리한다.

| 메서드         | 호출 시점         | 역할        |
| ----------- | ------------- | --------- |
| `init()`    | 서블릿이 처음 생성될 때 | 초기화 작업 수행 |
| `service()` | 요청이 들어올 때마다   | 요청과 응답 처리 |
| `destroy()` | 서블릿이 제거될 때    | 사용한 자원 정리 |

일반적으로 서블릿 컨테이너는 서블릿 객체를 하나 생성한 뒤 여러 요청에서 재사용한다. 여러 요청은 서로 다른 스레드에서 동시에 같은 서블릿 객체를 사용할 수 있다.

따라서 요청마다 달라지는 값을 인스턴스 필드에 저장하면 동시성 문제가 발생할 수 있다.

```java
@WebServlet("/hello")
public class HelloServlet extends HttpServlet {

    private String name; // 여러 요청이 공유할 수 있는 인스턴스 필드

    @Override
    protected void service(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {

        name = request.getParameter("name");
        response.getWriter().write("hello " + name);
    }
}
```

사용자 A와 사용자 B가 동시에 요청을 보내면 사용자 A의 요청을 처리하던 중 `name` 값이 사용자 B의 값으로 바뀔 수 있다.

요청마다 달라지는 데이터는 인스턴스 필드가 아니라 지역 변수에 저장해야 한다.

```java
@WebServlet("/hello")
public class HelloServlet extends HttpServlet {

    @Override
    protected void service(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {

        String name = request.getParameter("name");
        response.getWriter().write("hello " + name);
    }
}
```

지역 변수는 메서드를 실행하는 스레드마다 별도로 생성된다. 반면 인스턴스 필드는 같은 서블릿 객체를 사용하는 여러 스레드가 공유할 수 있다.

따라서 서블릿은 요청별 상태를 가지지 않도록 작성하는 것이 안전하다.

자세한 내용은 [Oracle Java EE 튜토리얼 - 동시 요청 처리](https://docs.oracle.com/javaee/7/tutorial/servlets003.htm)에서 확인할 수 있다.

## 3. 요청과 응답 처리

서블릿은 `HttpServletRequest`와 `HttpServletResponse`를 통해 HTTP 메시지를 Java 객체로 다룬다.

| 객체 또는 메서드                                                                                                                   | 역할                                     |
| --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| [`HttpServletRequest`](https://tomcat.apache.org/tomcat-11.0-doc/servletapi/jakarta/servlet/http/HttpServletRequest.html)   | HTTP 메서드, URI, 헤더, 파라미터와 본문 등 요청 정보 조회 |
| [`HttpServletResponse`](https://tomcat.apache.org/tomcat-11.0-doc/servletapi/jakarta/servlet/http/HttpServletResponse.html) | 상태 코드, 헤더, 콘텐츠 형식과 응답 본문 작성            |
| `getParameter()`                                                                                                            | 쿼리 파라미터와 Form 데이터 조회                   |
| `getInputStream()`                                                                                                          | 요청 본문 직접 읽기                            |
| `getWriter()`                                                                                                               | 문자 기반 응답 본문 작성                         |

### 3.1 요청 정보 조회

다음과 같은 요청이 들어왔다고 가정해보자.

```text
GET /request?username=hello HTTP/1.1
Host: localhost:8080
User-Agent: Mozilla/5.0
```

`HttpServletRequest`에서 HTTP 메서드, URI, 헤더와 요청 파라미터를 조회할 수 있다.

```java
String method = request.getMethod();
String requestUri = request.getRequestURI();
String userAgent = request.getHeader("User-Agent");
String username = request.getParameter("username");
```

`getParameter()`는 다음과 같은 데이터를 조회할 때 사용한다.

* URL의 쿼리 파라미터
* `application/x-www-form-urlencoded` 형식으로 전달된 Form 데이터

JSON처럼 HTTP 요청 본문에 직접 담긴 데이터는 `getParameter()`로 조회할 수 없다. 이때는 `getInputStream()`을 사용해 요청 본문을 읽어야 한다.

```java
ServletInputStream inputStream = request.getInputStream();

String messageBody = StreamUtils.copyToString(
        inputStream,
        StandardCharsets.UTF_8
);
```

서블릿에서는 요청 본문을 문자열로 읽은 뒤 JSON 변환까지 직접 처리해야 한다. Spring MVC에서는 이러한 과정을 메시지 컨버터가 대신 처리한다.

### 3.2 응답 작성

`HttpServletResponse`를 사용하면 HTTP 상태 코드와 헤더를 설정하고 응답 본문을 작성할 수 있다.

```java
response.setStatus(HttpServletResponse.SC_OK);
response.setHeader("Cache-Control", "no-cache");
response.setContentType("application/json");
response.setCharacterEncoding("UTF-8");

response.getWriter().write("""
        {
            "message": "hello servlet"
        }
        """);
```

이 코드는 다음과 같은 HTTP 응답을 만든다.

```text
HTTP/1.1 200 OK
Cache-Control: no-cache
Content-Type: application/json;charset=UTF-8

{
    "message": "hello servlet"
}
```

서블릿은 HTTP 요청과 응답을 세밀하게 제어할 수 있다. 하지만 요청 파라미터 변환과 검증, JSON 처리, 비즈니스 로직 호출과 화면 이동을 직접 구현하면 코드가 복잡해진다.

## 4. 서블릿의 한계와 MVC 구조

애플리케이션의 기능이 늘어나면 하나의 서블릿에 여러 책임이 섞이기 쉽다.

```java
@WebServlet(
        name = "memberSaveServlet",
        urlPatterns = "/members/save"
)
public class MemberSaveServlet extends HttpServlet {

    private final MemberRepository memberRepository =
            MemberRepository.getInstance();

    @Override
    protected void service(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws ServletException, IOException {

        String username = request.getParameter("username");
        int age = Integer.parseInt(request.getParameter("age"));

        Member member = new Member(username, age);
        memberRepository.save(member);

        request.setAttribute("member", member);
        request.getRequestDispatcher("/WEB-INF/views/save-result.jsp")
                .forward(request, response);
    }
}
```

이 서블릿은 다음 작업을 모두 담당한다.

* 요청 파라미터 조회
* 문자열을 숫자로 변환
* 비즈니스 로직 호출
* View에 전달할 데이터 저장
* View로 요청 전달

비슷한 서블릿이 늘어나면 요청 처리와 화면 이동 코드가 반복된다. MVC 패턴은 이러한 책임을 `Controller`, `Model`, `View`로 분리한다.

| 구성 요소      | 역할                          |
| ---------- | --------------------------- |
| Controller | 요청을 해석하고 필요한 비즈니스 로직을 호출한다. |
| Model      | View에 전달할 데이터를 보관한다.        |
| View       | Model의 데이터를 사용해 화면을 렌더링한다.  |

MVC 구조를 적용하더라도 각 Controller가 공통 처리를 직접 수행하면 중복이 남는다. 이를 해결하기 위해 모든 요청을 먼저 받는 **프론트 컨트롤러(Front Controller)** 패턴을 사용한다.

![프론트 컨트롤러](<스크린샷 2026-06-12 170103.png>)

프론트 컨트롤러는 요청을 가장 먼저 받아 공통 작업을 처리한 뒤, 요청에 맞는 Controller를 찾아 호출한다.

Spring MVC의 `DispatcherServlet`이 이 역할을 담당한다.

```text
Client
    → DispatcherServlet
    → Controller
    → Service
    → View 또는 HTTP 응답
```

따라서 Spring MVC는 서블릿을 대체하는 별개의 기술이라기보다, 서블릿 기반의 요청 처리를 더 구조적으로 사용할 수 있게 만든 프레임워크라고 볼 수 있다.

## 5. 참고 자료

* [Jakarta Servlet 사양](https://jakarta.ee/specifications/servlet/)
* [Jakarta EE 튜토리얼 - Servlet](https://jakarta.ee/learn/docs/jakartaee-tutorial/current/web/servlets/servlets.html)
* [Oracle Java EE 튜토리얼 - Servlet](https://docs.oracle.com/javaee/7/tutorial/servlets.htm)
* [Oracle Java EE 튜토리얼 - 동시 요청 처리](https://docs.oracle.com/javaee/7/tutorial/servlets003.htm)
* [Tomcat Servlet API - HttpServlet](https://tomcat.apache.org/tomcat-11.0-doc/servletapi/jakarta/servlet/http/HttpServlet.html)
* [Tomcat Servlet API - HttpServletRequest](https://tomcat.apache.org/tomcat-11.0-doc/servletapi/jakarta/servlet/http/HttpServletRequest.html)
* [Tomcat Servlet API - HttpServletResponse](https://tomcat.apache.org/tomcat-11.0-doc/servletapi/jakarta/servlet/http/HttpServletResponse.html)
* [Tomcat Servlet API - RequestDispatcher](https://tomcat.apache.org/tomcat-11.0-doc/servletapi/jakarta/servlet/RequestDispatcher.html)
* [Spring Framework 공식 문서 - DispatcherServlet](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html)
* [Spring Boot API - ServletComponentScan](https://docs.spring.io/spring-boot/api/java/org/springframework/boot/web/server/servlet/context/ServletComponentScan.html)
* [OpenMaru - WAS와 Java Servlet 동작 방식](https://www.openmaru.io/was-java-servlet%EC%84%9C%EB%B8%94%EB%A6%BF-%EB%8F%99%EC%9E%91-%EB%B0%A9%EC%8B%9D-%ED%95%9C%EB%88%88%EC%97%90-%EC%95%8C%EC%95%84%EB%B3%B4%EA%B8%B0/)
* [망나니개발자 - 서블릿과 서블릿 컨테이너](https://mangkyu.tistory.com/14)
* [인프런 - 스프링 MVC 1편: 백엔드 웹 개발 핵심 기술](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81-mvc-1/dashboard?cid=326674)
