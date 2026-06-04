---
title: "[Spring] 회원 삭제 시 연관 게시글/댓글 처리 정책 설계"
description: "회원 탈퇴 또는 관리자 회원 삭제 시 게시글과 댓글 같은 연관 데이터를 어떻게 처리할지 고민하고, 명시 삭제 방식을 선택한 이유를 정리합니다."
date: 2026-05-26
updated: 2026-05-26
category: Board
tags: ["Spring", "JPA"]
series: "Board 프로젝트 개선 기록"
seriesOrder: 1
draft: false
---

## 회원 탈퇴 시 연관 게시글/댓글 처리 정책 설계 고민

현재 Board 프로젝트에서 회원 삭제 기능을 구현하면서 단순히 `memberRepository.delete(member)`만 호출하면 되는 문제가 아니라는 것을 알게 되었다.

회원은 게시글을 작성할 수 있고, 댓글도 작성할 수 있다. 또한 회원이 작성한 게시글에는 다른 사용자가 작성한 댓글도 달릴 수 있다.

즉, 회원 삭제에는 다음 데이터들이 함께 연결되어 있다.

```text
회원 정보
회원이 작성한 게시글
회원이 작성한 댓글
회원이 작성한 게시글에 달린 댓글
```

현재 Board 프로젝트에서는 회원 탈퇴와 관리자 회원 삭제를 모두 **명시 삭제 방식**으로 처리하고 있다.

```java
@Transactional
private void memberRemovalPolicy(Long memberId) {

    // 회원이 작성한 댓글
    commentRepository.deleteAllByMemberId(memberId);

    // 회원이 작성한 게시글에 달린 댓글
    commentRepository.deleteAllByPostMemberId(memberId);

    // 회원이 작성한 게시글
    postRepository.deleteAllByMemberId(memberId);

    // 회원 제거
    memberRepository.deleteById(memberId);
}
```

처음에는 JPA의 `cascade`나 `orphanRemoval`을 이용하면 더 간단하게 처리할 수 있지 않을까 생각했다. 하지만 회원 삭제는 단순히 회원 row 하나를 지우는 문제가 아니었다. 게시글, 댓글, 그리고 다른 사용자가 작성한 댓글까지 영향을 줄 수 있기 때문에 삭제 정책을 먼저 정리할 필요가 있었다.

## 연관 데이터까지 물리 삭제

첫 번째 방법은 **연관 데이터까지 모두 물리 삭제**하는 방식이다.

회원이 삭제되면 그 회원이 작성한 댓글, 게시글, 그리고 그 게시글에 달린 댓글까지 모두 삭제한다.

```text
회원 삭제
 ├── 회원이 작성한 댓글 삭제
 ├── 회원이 작성한 게시글에 달린 댓글 삭제
 └── 회원이 작성한 게시글 삭제
```

이 방식의 장점은 데이터가 깔끔하게 제거된다는 점이다. 탈퇴한 회원의 데이터가 DB에 남지 않고, 외래 키 제약 조건도 명확하게 정리할 수 있다.

하지만 단점도 있다. 회원이 작성한 게시글이 삭제되면, 그 게시글에 다른 사용자가 작성한 댓글까지 함께 사라질 수 있다.


## 회원만 탈퇴 처리하고 게시글/댓글은 유지

두 번째 방법은 회원 정보를 실제로 삭제하지 않고, 탈퇴 상태만 표시하는 방식이다. 흔히 **Soft Delete**라고 부른다.

예를 들어 `Member` 엔티티에 다음 필드를 둘 수 있다.

```java
private boolean deleted;
private LocalDateTime deletedAt;
```

회원이 탈퇴하면 실제 row를 삭제하지 않고 상태만 변경한다.

```text
deleted = true
deletedAt = 2026-05-26 10:00:00
```

그리고 화면에서는 작성자를 다음처럼 표시할 수 있다.

```text
탈퇴한 사용자
```

이 방식의 장점은 게시글과 댓글의 문맥을 유지할 수 있다는 점이다. 회원이 탈퇴해도 게시글과 댓글은 유지되므로, 다른 사용자가 작성한 댓글도 사라지지 않는다.

하지만 단점도 있다. DB에 탈퇴 회원 정보가 계속 남는다. 따라서 개인정보 처리 정책을 함께 고민해야 한다. 이메일, 비밀번호, 닉네임 같은 정보를 그대로 보관해도 되는지, 마스킹하거나 제거해야 하는지 결정해야 한다.

예를 들어 다음과 같은 정책을 둘 수 있다.

```text
회원 탈퇴 즉시:
- 로그인 불가
- 닉네임을 "탈퇴한 사용자"로 변경
- 이메일 마스킹
- 비밀번호 제거 또는 임의 값으로 변경

일정 기간 이후:
- 개인정보 완전 삭제
- 통계용 데이터만 유지
```

또한 Soft Delete를 적용하면 모든 조회 로직에서 삭제된 데이터를 제외해야 한다.

```java
select m
from Member m
where m.deleted = false
```

게시글에도 Soft Delete를 적용한다면 게시글 조회에서도 삭제 여부를 고려해야 한다.

```java
select p
from Post p
where p.deleted = false
```

조건을 빠뜨리면 삭제된 회원이나 게시글이 화면에 노출될 수 있다. 즉, Soft Delete는 게시판 문맥을 유지하는 데 유리하지만, 조회 조건과 개인정보 처리 정책이 함께 설계되어야 한다.

## JPA cascade / orphanRemoval을 사용

세 번째 방법은 JPA의 `cascade`나 `orphanRemoval`을 이용해 연관 데이터를 자동으로 삭제하는 방식이다.

`cascade`는 부모 엔티티에 어떤 작업을 수행할 때, 그 작업을 자식 엔티티에도 함께 전파하는 기능이다.

예를 들어 부모 엔티티를 삭제할 때 자식 엔티티도 함께 삭제하려면 다음처럼 설정할 수 있다.

```java
@OneToMany(mappedBy = "member", cascade = CascadeType.REMOVE)
private List<Post> posts = new ArrayList<>();
```

이렇게 하면 회원을 삭제할 때 회원이 작성한 게시글도 함께 삭제될 수 있다.

```java
memberRepository.delete(member);
```

코드는 간결해진다. 하지만 이 방식은 삭제 범위가 명확하지 않으면 의도하지 않은 데이터까지 삭제될 수 있다.

`orphanRemoval`은 부모 엔티티와의 연관관계가 끊어진 자식 엔티티를 자동으로 삭제하는 기능이다.

```java
@OneToMany(mappedBy = "post", orphanRemoval = true)
private List<Comment> comments = new ArrayList<>();
```

예를 들어 게시글의 댓글 목록에서 특정 댓글을 제거하면, 해당 댓글이 DB에서도 삭제될 수 있다.

```java
post.getComments().remove(comment);
```

이 기능은 부모와 자식의 생명주기가 완전히 같을 때 유용하다. 예를 들어 주문과 주문 상품처럼 주문이 사라지면 주문 상품도 함께 사라져야 하는 구조에서는 자연스럽다.

하지만 게시판에서는 조금 더 신중해야 한다. 게시글과 댓글은 강한 관계를 가지고 있지만, 댓글 작성자는 게시글 작성자와 다를 수 있다. 즉, 게시글 삭제가 댓글 삭제로 이어지는 것은 자연스러울 수 있지만, 회원 삭제가 다른 사용자의 댓글 삭제로 이어지는 것은 별도의 정책 판단이 필요하다.

```text
회원 A 삭제
 └── A가 작성한 게시글 삭제
      └── B와 C가 작성한 댓글까지 삭제
```

이 흐름이 서비스 정책과 정확히 일치한다면 문제가 없다. 하지만 현재 프로젝트에서는 회원 삭제 정책이 아직 완전히 고정되지 않았다. 따라서 자동 삭제에 의존하기보다 삭제 범위를 직접 명시하는 방식이 더 안전하다고 판단했다.

## 명시 삭제를 선택한 이유

현재 Board 프로젝트에서는 회원 삭제 시 명시 삭제 방식을 선택했다.

```java
@Transactional
private void memberRemovalPolicy(Long memberId) {

    // 1. 회원이 작성한 댓글 삭제
    commentRepository.deleteAllByMemberId(memberId);

    // 2. 회원이 작성한 게시글에 달린 댓글 삭제
    commentRepository.deleteAllByPostMemberId(memberId);

    // 3. 회원이 작성한 게시글 삭제
    postRepository.deleteAllByMemberId(memberId);

    // 4. 회원 삭제
    memberRepository.deleteById(memberId);
}
```

이 방식의 핵심은 **삭제 범위를 코드에 명시적으로 드러내는 것**이다.

`cascade`나 `orphanRemoval`을 사용하면 코드가 간결해질 수 있다. 하지만 현재 프로젝트에서는 회원 삭제 정책이 아직 확정된 상태가 아니다.

회원이 삭제될 때 게시글도 삭제할지, 댓글도 삭제할지, 다른 사용자가 작성한 댓글까지 삭제할지에 대한 정책은 서비스 성격에 따라 달라질 수 있다.

따라서 자동 삭제에 의존하기보다, 현재 단계에서는 어떤 데이터를 어떤 순서로 삭제하는지 코드에서 직접 확인할 수 있는 명시 삭제 방식이 더 안전하다고 판단했다.

## 삭제 순서가 중요한 이유

회원 삭제 로직에서 가장 중요한 부분은 삭제 순서다.

회원은 게시글과 댓글의 부모 데이터 역할을 한다. 게시글 역시 댓글의 부모 데이터 역할을 한다.

관계를 단순화하면 다음과 같다.

```text
Member
 ├── Post
 │    └── Comment
 └── Comment
```

이 상태에서 회원을 먼저 삭제하면 문제가 발생할 수 있다.

```java
memberRepository.deleteById(memberId);
```

회원이 작성한 게시글이나 댓글이 아직 남아 있다면, 해당 데이터는 삭제된 회원을 참조하게 된다. DB에 외래 키 제약 조건이 걸려 있다면 회원 삭제 시점에 오류가 발생한다.

따라서 부모 데이터를 삭제하기 전에 자식 데이터를 먼저 삭제해야 한다.

현재 삭제 순서는 다음과 같다.

```text
1. 회원이 작성한 댓글 삭제
2. 회원이 작성한 게시글에 달린 댓글 삭제
3. 회원이 작성한 게시글 삭제
4. 회원 삭제
```

먼저 회원이 직접 작성한 댓글을 삭제한다. 그다음 회원이 작성한 게시글에 달린 댓글을 삭제한다. 그리고 댓글이 제거된 게시글을 삭제한 뒤, 마지막으로 회원을 삭제한다.

이 순서를 지키면 외래 키 제약 조건을 위반하지 않고 안전하게 데이터를 제거할 수 있다.

## 명시 삭제 방식의 장점

명시 삭제 방식의 가장 큰 장점은 **삭제 정책이 코드에 명확하게 드러난다**는 점이다.

```java
commentRepository.deleteAllByMemberId(memberId);
commentRepository.deleteAllByPostMemberId(memberId);
postRepository.deleteAllByMemberId(memberId);
memberRepository.deleteById(memberId);
```

위 코드를 보면 회원 삭제 시 어떤 데이터가 함께 삭제되는지 바로 알 수 있다.

회원 삭제는 단순히 회원 테이블의 row 하나를 삭제하는 작업이 아니다. 게시글, 댓글, 추후 추가될 첨부파일, 좋아요, 알림 같은 데이터까지 영향을 줄 수 있는 작업이다.

명시 삭제 방식은 이런 영향을 숨기지 않는다. 삭제 대상이 늘어나면 코드도 함께 늘어나지만, 그만큼 어떤 데이터를 삭제하는지 분명하게 확인할 수 있다.

또한 도메인 정책이 바뀌었을 때 수정하기도 쉽다.

예를 들어 나중에 정책이 다음과 같이 바뀔 수 있다.

```text
회원이 탈퇴해도 게시글은 유지한다.
작성자 이름만 "탈퇴한 사용자"로 표시한다.
댓글도 삭제하지 않고 유지한다.
```

이 경우 `postRepository.deleteAllByMemberId(memberId)`를 제거하고, 회원 정보를 익명화하는 방식으로 변경하면 된다.

반면 cascade를 사용하고 있었다면 어떤 연관관계에서 삭제가 전파되는지 다시 확인해야 한다. 도메인 정책이 자주 바뀌는 단계에서는 명시 삭제 방식이 더 예측 가능하다.

## 명시 삭제 방식의 단점

명시 삭제 방식에도 단점은 있다.

첫 번째 단점은 코드가 길어진다는 점이다. 연관 데이터가 많아질수록 삭제 로직도 함께 복잡해진다.

현재는 게시글과 댓글만 고려하면 된다.

```text
Member
 ├── Post
 └── Comment
```

하지만 나중에 기능이 추가되면 삭제 대상이 더 많아질 수 있다.

```text
Member
 ├── Post
 │    ├── Comment
 │    ├── Attachment
 │    └── Like
 ├── Comment
 ├── Notification
 └── Report
```

이 경우 회원 삭제 시 첨부파일, 좋아요, 알림, 신고 데이터까지 함께 고려해야 한다.

두 번째 단점은 삭제 대상 누락 위험이다. 새로운 도메인이 추가되었는데 회원 삭제 로직에 반영하지 않으면 외래 키 오류가 발생하거나, 의미 없는 데이터가 DB에 남을 수 있다.

예를 들어 게시글 첨부파일 기능이 추가되었는데 회원 삭제 시 첨부파일을 삭제하지 않는다면 다음 문제가 생길 수 있다.

```text
게시글은 삭제되었는데 첨부파일 데이터가 남아 있음
DB 데이터는 삭제되었는데 실제 파일은 저장소에 남아 있음
```

특히 파일 업로드 기능이 추가되면 DB row 삭제만으로 끝나지 않는다. 실제 파일이 로컬 디스크나 S3 같은 외부 저장소에 있다면 파일 삭제 정책도 함께 설계해야 한다.

세 번째 단점은 서비스 계층이 여러 도메인을 알게 된다는 점이다.

회원 삭제 로직 안에서 댓글, 게시글, 첨부파일, 좋아요까지 모두 처리하게 되면 `MemberService`가 너무 많은 책임을 가지게 될 수 있다.

현재 프로젝트 규모에서는 문제가 크지 않지만, 기능이 더 많아진다면 별도의 삭제 정책 클래스로 분리하는 것도 고려할 수 있다.

```java
@Service
@RequiredArgsConstructor
public class MemberDeletionService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final MemberRepository memberRepository;

    @Transactional
    public void deleteMember(Long memberId) {
        commentRepository.deleteAllByMemberId(memberId);
        commentRepository.deleteAllByPostMemberId(memberId);
        postRepository.deleteAllByMemberId(memberId);
        memberRepository.deleteById(memberId);
    }
}
```

이렇게 분리하면 회원 삭제 정책을 한 곳에서 관리할 수 있다.

## cascade를 바로 적용하지 않은 이유

JPA의 `cascade = CascadeType.REMOVE`를 사용하면 부모 엔티티 삭제 시 자식 엔티티도 함께 삭제할 수 있다.

예를 들어 회원이 삭제될 때 회원의 게시글을 함께 삭제하도록 만들 수 있다.

```java
@OneToMany(mappedBy = "member", cascade = CascadeType.REMOVE)
private List<Post> posts = new ArrayList<>();
```

이 방식은 코드가 간결하다.

```java
memberRepository.delete(member);
```

하지만 간결한 만큼 삭제 범위가 연관관계 설정에 숨어버릴 수 있다.

게시판 도메인에서는 삭제 정책이 단순하지 않다.

```text
회원이 탈퇴하면 게시글도 삭제할 것인가?
회원이 탈퇴하면 댓글도 삭제할 것인가?
회원의 게시글에 달린 다른 사용자의 댓글도 삭제할 것인가?
게시글은 유지하고 작성자만 익명화할 것인가?
```

이 질문에 대한 답이 명확하지 않은 상태에서 cascade를 적용하면 의도하지 않은 데이터 삭제가 발생할 수 있다.

특히 회원 삭제는 다른 사용자의 데이터에도 영향을 줄 수 있다. 회원 A가 작성한 게시글에 회원 B와 C가 댓글을 작성한 경우, A의 탈퇴로 인해 B와 C의 댓글까지 삭제되는 것이 맞는지 고민해야 한다.

```text
A 회원의 게시글
 ├── B 회원의 댓글
 └── C 회원의 댓글
```

현재 프로젝트에서는 이 정책이 아직 확정되지 않았다. 그래서 cascade를 통해 자동으로 삭제하기보다, 명시적으로 삭제 범위를 관리하는 방식을 선택했다.

## orphanRemoval을 신중하게 봐야 하는 이유

`orphanRemoval = true`는 부모 컬렉션에서 제거된 자식 엔티티를 자동으로 삭제하는 기능이다.

```java
@OneToMany(mappedBy = "post", orphanRemoval = true)
private List<Comment> comments = new ArrayList<>();
```

예를 들어 게시글의 댓글 목록에서 특정 댓글을 제거하면, 해당 댓글이 DB에서도 삭제될 수 있다.

```java
post.getComments().remove(comment);
```

이 기능은 부모와 자식의 생명주기가 완전히 같을 때 유용하다. 예를 들어 주문과 주문 상품처럼 주문이 사라지면 주문 상품도 함께 사라지는 구조에서는 자연스럽다.

하지만 게시판에서는 조금 더 조심해야 한다.

게시글과 댓글은 강한 생명주기를 가지는 것처럼 보이지만, 댓글 작성자는 게시글 작성자와 다를 수 있다. 즉, 게시글 삭제가 댓글 삭제로 이어지는 것은 자연스러울 수 있지만, 회원 삭제가 다른 사용자의 댓글 삭제로 이어지는 것은 별도의 정책 판단이 필요하다.

따라서 `orphanRemoval` 역시 단순히 편리하다는 이유만으로 적용하기보다는, 부모와 자식의 생명주기가 정말 같은지 확인한 뒤 적용해야 한다.

## Soft Delete를 도입한다면

현재는 물리 삭제 방식을 사용하고 있지만, 실제 서비스에 가까워질수록 Soft Delete도 고려할 수 있다.

Soft Delete는 데이터를 실제로 삭제하지 않고 삭제 상태만 표시하는 방식이다.

```java
private boolean deleted;
private LocalDateTime deletedAt;
```

회원 탈퇴 시 실제 회원 row를 삭제하지 않고 다음처럼 상태만 변경한다.

```text
deleted = true
deletedAt = 현재 시간
```

그리고 화면에서는 작성자를 다음처럼 표시할 수 있다.

```text
탈퇴한 사용자
```

이 방식의 장점은 게시판의 문맥을 유지할 수 있다는 점이다.

회원이 탈퇴해도 기존 게시글과 댓글은 유지된다. 다른 사용자가 작성한 댓글도 사라지지 않는다.

하지만 Soft Delete도 단순한 해결책은 아니다.

모든 조회 로직에서 삭제된 데이터를 제외해야 한다.

```java
select m
from Member m
where m.deleted = false
```

게시글에도 Soft Delete를 적용한다면 게시글 목록 조회에서도 삭제 여부를 확인해야 한다.

```java
select p
from Post p
where p.deleted = false
```

조건을 빠뜨리면 삭제된 회원이나 게시글이 화면에 노출될 수 있다.

또한 개인정보 처리도 고려해야 한다. 회원 row를 남겨두는 경우 이메일, 닉네임, 비밀번호 같은 정보를 어떻게 처리할지 정해야 한다.

예를 들어 다음과 같은 정책이 필요할 수 있다.

```text
회원 탈퇴 즉시:
- 로그인 불가
- 닉네임 "탈퇴한 사용자"로 변경
- 이메일 마스킹
- 비밀번호 제거 또는 임의 값으로 변경

일정 기간 이후:
- 개인정보 완전 삭제
- 통계용 데이터만 유지
```

즉, Soft Delete는 게시판의 문맥을 유지하는 데 유리하지만, 조회 조건과 개인정보 처리 정책이 함께 설계되어야 한다.

## 현재 단계에서의 결론

현재 Board 프로젝트에서는 회원 삭제 시 연관 데이터를 명시적으로 삭제하는 방식을 선택했다.

이유는 다음과 같다.

```text
1. 도메인 정책이 아직 확장 중이다.
2. 회원 삭제 시 어떤 데이터를 삭제할지 아직 바뀔 가능성이 있다.
3. cascade나 orphanRemoval을 적용하면 삭제 범위가 연관관계 설정에 숨어버릴 수 있다.
4. 명시 삭제는 삭제 대상과 순서가 코드에 직접 드러난다.
5. FK 제약 조건을 고려한 삭제 순서를 직접 제어할 수 있다.
```

현재 방식이 가장 세련된 구조라고 보기는 어렵다. 하지만 현재 프로젝트 단계에서는 가장 안전하고 예측 가능한 방식이라고 판단했다.

회원 삭제는 단순한 CRUD가 아니라 서비스 정책과 데이터 무결성이 함께 걸린 기능이다. 따라서 처음부터 자동 삭제에 의존하기보다, 삭제 범위를 코드에 명확히 드러내고 정책이 안정화된 뒤에 cascade, orphanRemoval, Soft Delete 등을 검토하는 방향이 더 적절하다고 생각한다.

## 앞으로 개선할 방향

앞으로 기능이 확장되면 회원 삭제 정책도 다시 정리해야 한다.

먼저 회원 탈퇴와 관리자 회원 삭제를 서로 다른 정책으로 분리할 수 있다.

```text
회원 탈퇴:
- 회원 정보는 Soft Delete
- 게시글과 댓글은 유지
- 작성자는 "탈퇴한 사용자"로 표시

관리자 강제 삭제:
- 정책에 따라 연관 데이터까지 물리 삭제
```

또한 도메인이 추가될 경우에도 회원 삭제에 대해 


좋아요, 알림, 신고 기능이 추가될 경우에도 회원 삭제 시 함께 정리해야 할지 결정해야 한다.

결국 회원 삭제 정책은 프로젝트가 커질수록 계속 수정될 수 있다. 그래서 현재는 명시 삭제 방식으로 안전하게 처리하고, 도메인 정책이 안정화되면 더 적절한 구조로 리팩터링하는 방향이 좋다고 판단했다.

이번 회원 삭제 기능은 단순한 CRUD처럼 보였지만, 실제로는 연관 데이터 처리 정책을 결정해야 하는 문제였다. 연관 데이터 처리 정책을 더 확실하게 정해야 겠다는 계기가 되었다.