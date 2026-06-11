---
title: "서블릿이란 무엇일까?"
description: "서블릿의 개념, 서블릿 컨테이너, 생명주기, MVC 구조로 발전한 이유를 정리"
date: 2026-06-11
updated: 2026-06-11
category: "Spring"
tags:
  - Spring
  - Servlet
book: ""
chapter: 1
heroImage: "/og-image.svg"
draft: true
---

## 1. 들어가기 전

웹 애플리케이션은 클라이언트와 서버가 HTTP를 통해 요청과 응답을 주고받는 구조로 동작한다. 사용자가 브라우저에서 URL을 입력하거나 버튼을 클릭하면 클라이언트는 서버로 HTTP 요청을 보낸다. 서버는 요청을 해석한 뒤 필요한 작업을 수행하고, 그 결과를 HTTP 응답으로 돌려준다.

이때 **Java에서 HTTP 요청과 응답을 처리**하기 위해 등장한 표준 기술이 **서블릿(Servlet)**이다.

서블릿은 Java로 작성하는 서버 측 웹 컴포넌트다. 즉, 클라이언트가 보낸 HTTP 요청을 Java 코드에서 다룰 수 있게 해주는 기술이다.

![request와 response](<스크린샷 2026-06-11 160337.png>)

서블릿은 HTTP 요청을 받아 username=world 이라는 요청 파라미터를 꺼내고, 응답 body에 원하는 문자열을 작성할 수 있다.

```java
@WebServlet(name = "helloServlet", urlPatterns = "/hello")
public class HelloServlet extends HttpServlet {
    
    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
    
        System.out.println("HelloServlet.service");
        System.out.println("request = " + request);
        System.out.println("response = " + response);
        
        String username = request.getParameter("username");
        System.out.println("username = " + username);

        response.setContentType("text/plain");
        response.setCharacterEncoding("utf-8");
        response.getWriter().write("hello " + username);
    }
}

// 실행 결과
HelloServlet.service
request = org.apache.catalina.connector.RequestFacade@5e4e72
response = org.apache.catalina.connector.ResponseFacade@37d112b6
username = world
```

- `HttpServletRequest`: HTTP 요청 정보를 담고 있는 객체
- `HttpServletResponse`: HTTP 응답 정보를 만들기 위한 객체

`request.getParameter("username")`으로 요청 파라미터를 읽고, `response.getWriter().write()`로 응답 body에 데이터를 쓴다. 즉, 서블릿은 HTTP 요청과 응답을 Java 객체 중심으로 다룰 수 있게 해준다.

Spring Boot에서 `@WebServlet`을 사용해 직접 서블릿을 등록하려면 `@ServletComponentScan`을 추가해야 한다.

```java
@ServletComponentScan //서블릿 자동 등록
@SpringBootApplication
public class ServletApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServletApplication.class, args);
    }
}
```
일반적인 Spring MVC 개발에서는 직접 서블릿을 만들 일이 많지는 않다. 하지만 Spring MVC의 핵심인 `DispatcherServlet`도 결국 서블릿 기반으로 동작한다. 따라서 서블릿을 이해하면 Spring MVC가 HTTP 요청을 어떻게 받아 Controller까지 전달하는지 더 쉽게 이해할 수 있다.

## 2. 서블릿 컨테이너와 생명주기

서블릿은 개발자가 직접 `new HelloServlet()`처럼 생성해서 사용하는 객체가 아니다. 서블릿은 **서블릿 컨테이너(Servlet Container)**가 생성하고 관리한다.

대표적인 서블릿 컨테이너로는 Tomcat이 있다. Tomcat 같은 WAS는 서버가 실행될 때 서블릿을 등록하고, 클라이언트 요청이 들어오면 요청 URL에 맞는 서블릿을 찾아 실행한다.

![흐름도](<스크린샷 2026-06-11 162123.png>)

위 이미지의 흐름은 다음과 같다.
```
Client
    → 요청
    → WAS /Servlet Container
    → Servlet
    → HttpServletRequest
    → HttpServletResponse
    → HTTP 응답
```

서블릿 컨테이너의 주요 역할은:
- 서블릿 객체 생성
- 서블릿 초기화
- 요청 URL에 맞는 서블릿 호출
- 요청과 응답 객체 생성
- 멀티스레드 기반 요청 처리
- 서블릿 종료 시 자원 정리

![서블릿 생명주기](image.png)

서블릿 컨테이너는 서블릿의 생명주기도 관리한다. 대표적인 생명주기 메서드는 `init()`, `service()`, `destroy()`다.


```java
@WebServlet(name = "lifeCycleServlet", urlPatterns = "/lifecycle")
public class LifeCycleServlet extends HttpServlet {

    @Override
    public void init() throws ServletException {
        System.out.println("서블릿 초기화");
    }

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        System.out.println("요청 처리");
        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("ok");
    }

    @Override
    public void destroy() {
        System.out.println("서블릿 종료");
    }
}
```

| **메서드** | **호출 시점** | **역할** |
| :--- | :--- | :--- |
| `init()` | 서블릿이 처음 생성될 때 | 초기화 작업 |
| `service()` | 요청이 들어올 때마다 | 실제 요청 처리 |
| `destroy()` | 서블릿이 종료될 때 | 종료 전 자원 정리 |

여기서 중요한 점은 서블릿 객체가 요청마다 매번 새로 생성되는 것이 아니라는 점이다. 일반적으로 서블릿 컨테이너는 **서블릿 객체를 하나 생성해두고 여러 요청에서 재사용**한다.

그래서 서블릿 인스턴스 필드에 요청별 데이터를 저장하면 [동시성 문제가 발생](https://docs.oracle.com/javaee/7/tutorial/servlets003.htm)할 수 있다.

```java
@WebServlet("/hello")
public class HelloServlet extends HttpServlet {

    private String name; // 인스턴스 필드

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        name = request.getParameter("name");

        response.getWriter().write("hello " + name);
    }
}
```

위 코드는 위험하다. 여러 사용자가 동시에 요청을 보내면 하나의 서블릿 객체를 여러 스레드가 함께 사용할 수 있다. 이때 인스턴스 필드 `username` 값이 다른 요청에 의해 덮어써질 수 있다.

따라서 요청마다 달라지는 데이터는 인스턴스 필드가 아니라 지역 변수를 사용해야 한다.

<details>
    <summary>멀티 스레드 환경</summary>
<div markdown="1">

예를 들어 사용자가 동시에 3명 접속했다고 가정하면:

```text
사용자 A 요청 ── Thread-1 ┐
사용자 B 요청 ── Thread-2 ├── 하나의 HelloServlet 객체 사용
사용자 C 요청 ── Thread-3 ┘
```

서블릿 객체는 하나인데 요청 처리는 여러 스레드가 동시에 한다.

```java
@WebServlet("/hello")
public class HelloServlet extends HttpServlet {

    private String name1; // 여러 스레드가 공유할 수 있는 필드

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) {

        String name2 = request.getParameter("name");
        // 요청마다 다른 스레드가 이 메서드를 실행할 수 있음
    }
}
```
`service()` 메서드 자체가 여러 스레드에서 동시에 실행될 수 있고, `name2`는 지역 변수라서 각 요청 스레드마다 따로 가진다.

하지만 `name1`은 서블릿 객체의 필드라서 여러 스레드가 공유한다. 그러므로 위험하다.

</div>
</details>

정리하면:
- 서블릿 객체는 보통 하나만 생성되어 재사용된다.
- 여러 요청은 여러 스레드에섣 동시에 처리될 수 있다.
- 인스턴스 필드는 여러 요청이 공유할 수 있으므로 주의해야 한다.
- 요청별 데이터는 지역 변수로 처리하는 것이 안전하다.

## 3. 요청과 응답 처리

서블릿에서 가장 자주 사용하는 객체는 `HttpServletRequest`와 `HttpServletResponse`다.

[HttpServletRequest](https://tomcat.apache.org/tomcat-11.0-doc/servletapi/jakarta/servlet/http/HttpServletRequest.html)는 클라이언트가 보낸 요청 정보를 조회하는 객체이고, [HttpServletResponse](https://tomcat.apache.org/tomcat-11.0-doc/servletapi/jakarta/servlet/http/HttpServletResponse.html)는 서버가 클라이언트에게 보낼 HTTP 응답을 작성하는 객체다.