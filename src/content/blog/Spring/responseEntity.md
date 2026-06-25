---
title: "Spring ResponseEntity란 무엇일까?"
description: "ResponseEntity의 개념, 구조, 사용하는 이유와 주요 정적 메서드 정리"
date: 2026-06-09
updated: 2026-06-09
category: "Spring"
slug: "spring/responseentity"
commentKey: "/blog/spring/responseentity/"
tags:
  - Spring
  - REST API
heroImage: "/og-image.svg"
draft: false
---

## 1. 들어가기 전

Spring MVC로 REST API를 만들다 보면 컨트롤러에서 `ResponseEntity`를 자주 보게 된다.

```java
return ResponseEntity.ok(response);
```

처음에는 단순히 데이터를 감싸서 반환하는 객체처럼 보일 수 있다. 하지만 `ResponseEntity`는 HTTP 응답을 구성하는 **상태 코드**, **헤더**, **본문**을 함께 표현할 수 있는 Spring MVC의 응답 타입이다.

REST API에서는 응답 본문만 중요한 것이 아니다. 요청이 성공했는지, 리소스가 생성되었는지, 요청한 데이터가 없는지, 잘못된 요청인지 등을 [HTTP 상태 코드](https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Status)로 명확하게 표현해야 한다.

## 2. ResponseEntity란?

Spring 공식 문서에서 `ResponseEntity<T>`는 다음과 같은 구조를 가진다.

```java
public class ResponseEntity<T> extends HttpEntity<T>
```

`ResponseEntity`는 `HttpEntity`를 상속한다. `HttpEntity`는 HTTP 요청 또는 응답에서 사용할 수 있는 **headers**와 **body**를 표현하는 클래스다. 여기서 `ResponseEntity`는 **HTTP status code**를 추가한다.

```
HttpEntity 
 ├─ headers 
 └─ body 
 
ResponseEntity 
 ├─ headers 
 ├─ body 
 └─ status code
```

즉, `ResponseEntity`는 HTTP 응답 전체를 표현하는 객체라고 볼 수 있다.

`ResponseEntity = Status Code + Headers + Body`

```
HTTP/1.1 200 OK                           -> Status-Line
Content-Type: text/html; charset=UTF-8    -> HTTP Headers
Content-Length: 1256

<html>                                    -> HTTP Body
  <body>안녕하세요!</body>
</html>
```

## 3. ResponseEntity 예제

Spring 공식 문서에는 `ResponseEntity`를 `@Controller` 메서드의 반환값으로 사용하는 예제가 나온다.

```java
@RequestMapping("/handle")
public ResponseEntity<String> handle() {
  URI location = ...;
  HttpHeaders responseHeaders = new HttpHeaders();
  responseHeaders.setLocation(location);
  responseHeaders.set("MyResponseHeader", "MyValue");
  return new ResponseEntity<String>("Hello World", responseHeaders, HttpStatus.CREATED);
}
```

위 코드는 세 가지를 함께 반환한다.
- 본문: "Hello World"
- 헤더: Location, MyResponseHeader
- 상태 코드: 201 Created

즉, `ResponseEntity`를 사용하면 응답 본문뿐 아니라 헤더와 상태 코드까지 직접 구성할 수 있다.

[공식 문서에는 정적 메서드를 활용한 builder 방식도 함께 나온다.](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/http/ResponseEntity.html)

```java
@RequestMapping("/handle")
public ResponseEntity<String> handle() {
  URI location = ...;
  return ResponseEntity.created(location).header("MyResponseHeader", "MyValue").body("Hello World");
}
```

builder 방식은 앞의 생성자 방식과 같은 의도를 더 간결하게 표현한다.

이처럼 `ResponseEntity`는 생성자를 직접 사용할 수도 있고, 정적 메서드와 builder 방식을 사용해서 더 읽기 좋게 작성할 수도 있다.

> [!note]
> Static Method(정적 메서드)는 객체를 생성하지 않고 클래스 이름으로 호출할 수 있다. 인스턴스를 통해서도 호출은 가능하지만 권장되지 않는다.
## 4. @ResponseBody와 ResponseEntity의 차이

Spring MVC에서 객체를 응답 본문으로 반환할 때는 `@ResponseBody`를 사용할 수 있다.

```java
@GetMapping("/accounts/{id}")
@ResponseBody
public Account handle() {
	// ...
}
```

`@ResponseBody`는 **메서드의 반환값을 HTTP 응답 본문에 작성**한다. 예를 들어 Java 객체를 반환하면 `HttpMessageConverter`를 통해 JSON 같은 형식으로 변환되어 응답 본문에 작성된다.

반면 `ResponseEntity`는 **응답 본문뿐 아니라 HTTP 상태 코드와 헤더**까지 함께 제어할 수 있다.

| 구분 | 설명 |
|---|---|
| `@ResponseBody` | 반환 객체를 HTTP 응답 본문으로 변환하는 데 초점 |
| `ResponseEntity` | HTTP 상태 코드, 헤더, 본문을 함께 표현 |
| `@ResponseBody` 사용 상황 | 단순히 본문만 반환하면 되는 경우 |
| `ResponseEntity` 사용 상황 | 상태 코드나 헤더를 명확하게 지정해야 하는 경우 |

[@RestController](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/RestController.html)는 `@Controller`와 `@ResponseBody`가 합쳐진 형태다.
따라서 `@RestController`에서는 메서드 반환값이 View 이름으로 해석되지 않고 **HTTP 응답 본문으로 반환**된다.

하지만 `@RestController`를 사용하더라도 상태 코드나 헤더를 명확하게 제어하고 싶다면 `ResponseEntity`를 반환하면 된다.

## 5. ResponseEntity를 사용하는 이유

`ResponseEntity`를 사용하는 이유는 HTTP 응답을 더 명확하게 표현하기 위해서다.

- 상태 코드를 명확하게 표현할 수 있다.
- 응답 헤더를 직접 설정할 수 있다.
- 응답 구조를 코드로 읽기 쉽게 표현할 수 있다.

### 5.1 상태 코드를 명확하게 표현할 수 있다

단순히 객체만 반환하면 보통 `200 OK` 응답이 내려간다. 하지만 모든 성공 응답이 `200 OK`인 것은 아니다.

리소스 생성에 성공했다면 `201 Created`, 요청은 성공했지만 응답 본문이 없다면 `204 No Content`가 더 적절할 수 있다.

`ResponseEntity`를 사용하면 이런 [상태 코드](https://ko.wikipedia.org/wiki/HTTP_%EC%83%81%ED%83%9C_%EC%BD%94%EB%93%9C)를 코드에서 명확하게 표현할 수 있다.

```java
return ResponseEntity.created(location) 
        .header("MyResponseHeader", "MyValue") 
        .body("Hello World");
```

공식 문서 예제에서는 `201 Created` 상태 코드와 헤더, 본문을 함께 반환한다.

### 5.2 응답 헤더를 직접 설정할 수 있다

HTTP 응답에서는 본문만큼 헤더도 중요하다. 예를 들어 새 리소스를 생성한 뒤에는 `Location` 헤더를 통해 생성된 리소스의 위치를 알려줄 수 있다.

```java
HttpHeaders responseHeaders = new HttpHeaders();
  responseHeaders.setLocation(location);
  responseHeaders.set("MyResponseHeader", "MyValue");
  return new ResponseEntity<String>("Hello World", responseHeaders, HttpStatus.CREATED);
```

공식 문서 예제에서도 `Location` 헤더와 사용자 정의 헤더를 함께 설정한다. 그리고 이 헤더를 `ResponseEntity`에 담아 반환한다.

### 5.3 응답 구조를 코드로 읽기 쉽게 표현할 수 있다

`ResponseEntity`의 builder 방식을 사용하면 응답 구성이 더 명확해진다.

```java
return ResponseEntity.created(location) 
        .header("MyResponseHeader", "MyValue") 
        .body("Hello World");
```

## 6. ResponseEntity의 주요 정적 메서드

![정적 메서드](<스크린샷 2026-06-10 133538.png>)

`ResponseEntity`는 자주 사용하는 응답을 쉽게 만들 수 있도록 여러 정적 메서드를 제공한다.

- `ok()`: HTTP 200 (OK) 성공 응답을 반환한다. 주로 ok(body) 형태로 데이터를 담아 보낼 때 사용된다.
- `created(URI location)`: HTTP 201 (Created) 응답을 반환한다. 새로운 리소스가 생성되었을 때 생성된 리소스의 위치를 `Location` 헤더를 전달할 때 사용한다.
- `badRequest()`: HTTP 400 (Bad Request) 응답을 반환한다. 클라이언트의 요청이 유효하지 않을 때 사용한다.
- `notFound()`: HTTP 404 (Not Found) 응답을 반환한다. 요청한 리소스를 찾을 수 없을 때 사용한다.
- `noContent()`: HTTP 204 (No Content) 응답을 반환한다. 요청은 성공적으로 처리했으나 반환할 데이터(본문)가 없을 때 사용한다.
- `accepted()`: HTTP 202 (Accepted) 응답을 반환한다. 요청이 접수되어 처리 중임을 알릴 때 사용한다.
- `status(HttpStatus status)`: 제공된 열거형(Enum) 값을 통해 개발자가 원하는 임의의 HTTP 상태 코드를 직접 지정할 수 있다.

## 7. ResponseEntity를 사용할 때 주의할 점

### 7.1 무조건 ResponseEntity를 써야 하는 것은 아니다

모든 컨트롤러 메서드가 반드시 `ResponseEntity`를 반환해야 하는 것은 아니다.

단순히 `200 OK`와 응답 본문만 반환하면 되는 경우에는 객체를 바로 반환해도 된다.

`@RestController`에서는 반환 객체가 HTTP 응답 본문으로 변환된다.

아래와 같은 경우에는 ResponseEntity를 사용하는 것이 좋다.

1. HTTP 상태 코드를 명시적으로 지정하고 싶을 때
2. 응답 헤더를 직접 설정해야 할 때
3. 201 Created, 204 No Content, 404 Not Found 등을 명확히 표현하고 싶을 때
4. 응답의 의미를 코드에서 분명하게 드러내고 싶을 때

### 7.2 응답 본문 타입을 명확하게 작성하는 것이 좋다

```java
public ResponseEntity getUser() { ... }
```
위와 같이 작성하면 `ResponseEntity`의 타입을 작성하지 않은 것이라 응답 본문 타입이 명확하지 않아 [타입 안정성](https://ko.wikipedia.org/wiki/%EC%9E%90%EB%A3%8C%ED%98%95_%EC%95%88%EC%A0%84)이 떨어진다.

`ResponseEntity`는 제네릭 타입을 사용한다. `ResponseEntity<String>`은 응답 본문이 `String`이라는 의미다.

### 7.3 상태 코드와 응답 본문의 의미를 맞춰야 한다

`ResponseEntity`를 사용할 때는 상태 코드와 응답 본문의 의미가 자연스럽게 맞아야 한다.

예를 들어 `204 No Content`는 응답 본문이 없다는 의미다.
따라서 `204 No Content`를 반환하면서 body를 함께 내려주는 것은 적절하지 않다.

반대로 `201 Created`는 리소스가 생성되었음을 의미하므로, 생성된 리소스의 위치를 `Location` 헤더로 함께 제공하면 더 명확한 응답이 된다.


## 참고 자료
- https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/responsebody.html
- https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/http/ResponseEntity.html
- https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/RestController.html
- https://ko.wikipedia.org/wiki/HTTP_%EC%83%81%ED%83%9C_%EC%BD%94%EB%93%9C
- https://stir.tistory.com/343
