---
title: Java 06. 동시성, 빌드와 테스트
description: 여러 작업을 동시에 다루고 빌드 도구와 테스트로 마무리합니다.
outline: deep
---

# 06. 동시성, 빌드와 테스트

여러 스레드가 같은 데이터를 건드릴 때 생기는 문제와, 프로젝트를 빌드하고 검증하는 방법을 정리합니다.

## 스레드와 공유 자원

스레드는 같은 메모리를 공유합니다. 그래서 빠르게 주고받을 수 있고, 동시에 같은 값을 건드리면 깨집니다.

```java
Thread thread = new Thread(() -> System.out.println("다른 스레드"));
thread.start();     // 새 스레드에서 실행
thread.join();      // 끝날 때까지 기다립니다
```

`run()`을 직접 부르면 그냥 메서드 호출일 뿐 새 스레드가 생기지 않습니다.

겹쳐 쓰면 결과가 어긋납니다.

```java
class Counter {
    private int count = 0;

    void increase() {
        count++;   // 읽고, 더하고, 쓰는 세 단계입니다
    }
}
```

두 스레드가 같은 시점에 읽으면 둘 다 같은 값을 보고 같은 값을 씁니다. 한 번의 증가가 사라집니다.

```java
var counter = new Counter();
var pool = Executors.newFixedThreadPool(2);

for (int i = 0; i < 10_000; i++) {
    pool.submit(counter::increase);
}
// 기대는 10000이지만 그보다 작게 나옵니다
```

## 동기화와 스레드 안전

같은 시점에 하나만 들어가도록 막습니다.

```java
class Counter {
    private int count = 0;

    synchronized void increase() {
        count++;
    }
}
```

필요한 구간만 좁게 잠그는 편이 낫습니다. 메서드 전체를 잠그면 관계없는 작업까지 기다립니다.

```java
private final Object lock = new Object();

void increase() {
    prepare();                 // 잠글 필요 없는 부분
    synchronized (lock) {
        count++;
    }
}
```

단순한 숫자라면 원자적 연산을 제공하는 클래스가 더 빠릅니다.

```java
private final AtomicInteger count = new AtomicInteger();

count.incrementAndGet();
```

`volatile`은 **변경이 다른 스레드에 보이도록** 보장할 뿐 원자성은 주지 않습니다. 플래그 같은 단순 값에만 씁니다.

```java
private volatile boolean running = true;   // 종료 신호용으로는 적절합니다
```

컬렉션도 동시 접근에 안전한 것을 따로 씁니다.

```java
Map<Long, Todo> shared = new ConcurrentHashMap<>();
List<Todo> list = new CopyOnWriteArrayList<>();
```

가장 안전한 방법은 **공유하지 않는 것**입니다. 불변 객체를 쓰거나 각 스레드가 자기 데이터만 다루게 하면 동기화 자체가 필요 없습니다. `record`로 만든 값 객체가 여기에 맞습니다.

서로 다른 순서로 두 개의 잠금을 잡으면 교착 상태가 됩니다. 잠금 순서를 정해 두고 지키는 것이 예방책입니다.

## Executor로 작업 분리하기

스레드를 직접 만들면 개수를 통제할 수 없습니다. 풀에 작업을 맡깁니다.

```java
try (var pool = Executors.newFixedThreadPool(4)) {
    Future<List<Todo>> future = pool.submit(() -> storage.load());
    List<Todo> todos = future.get();   // 끝날 때까지 기다립니다
}
```

`ExecutorService`는 `AutoCloseable`이라 try-with-resources로 닫을 수 있습니다(Java 19+). 그 이전에는 `shutdown()`을 직접 불러야 합니다.

여러 작업을 이어 붙일 때는 `CompletableFuture`가 편합니다.

```java
CompletableFuture<List<Todo>> todos =
    CompletableFuture.supplyAsync(() -> storage.load())
        .thenApply(this::filterUndone)
        .exceptionally(error -> List.of());

CompletableFuture.allOf(a, b).join();   // 둘 다 끝날 때까지
```

Java 21부터는 가벼운 가상 스레드를 쓸 수 있습니다. 수만 개를 만들어도 부담이 적어, 기다리는 시간이 많은 작업에 적합합니다.

```java
try (var pool = Executors.newVirtualThreadPerTaskExecutor()) {
    for (var url : urls) {
        pool.submit(() -> fetch(url));
    }
}
```

## 빌드 도구의 역할

소스를 컴파일하고, 의존성을 내려받고, 테스트를 돌리고, 배포할 파일을 만드는 일을 한 번에 합니다. Gradle과 Maven이 널리 쓰입니다.

```bash
./gradlew build    # 컴파일 + 테스트 + 패키징
./gradlew test
./gradlew run
```

래퍼(`gradlew`)를 저장소에 포함하면, 받는 사람이 Gradle을 따로 깔지 않아도 같은 버전으로 빌드됩니다.

## 의존성 관리

필요한 라이브러리를 선언하면 내려받아 연결해 줍니다.

```kotlin
// build.gradle.kts
plugins {
    java
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

dependencies {
    implementation("com.fasterxml.jackson.core:jackson-databind:2.18.0")
    testImplementation("org.junit.jupiter:junit-jupiter:5.11.0")
}

tasks.test {
    useJUnitPlatform()
}
```

`implementation`은 실행에 필요한 것, `testImplementation`은 테스트에서만 쓰는 것입니다. 구분해 두면 배포물에 테스트 도구가 섞이지 않습니다.

`toolchain`으로 Java 버전을 고정하면 개발자마다 다른 JDK를 깔고 있어도 같은 결과가 나옵니다.

## 패키지 구성

패키지는 폴더 구조와 일치해야 합니다.

```
src/main/java/com/bitpage/todo/
├── Main.java
├── domain/
│   ├── Todo.java
│   └── TodoService.java
└── storage/
    ├── TodoStorage.java
    └── JsonStorage.java
```

```java
package com.bitpage.todo.domain;

import com.bitpage.todo.storage.TodoStorage;
```

기술 종류(`controller`, `service`, `repository`)로 나누는 방식과 기능 단위(`todo`, `user`)로 나누는 방식이 있습니다. 프로젝트가 커질수록 기능 단위가 찾기 쉽습니다. 하나의 기능을 고칠 때 여러 폴더를 오가지 않아도 되기 때문입니다.

## 단위 테스트

JUnit 5를 씁니다. 테스트는 `src/test/java`에 같은 패키지 구조로 둡니다.

```java
package com.bitpage.todo.domain;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class TodoServiceTest {

    @Nested
    @DisplayName("할 일을 추가할 때")
    class Add {

        @Test
        @DisplayName("목록 끝에 추가된다")
        void addsToEnd() {
            var service = new TodoService(new MemoryStorage());

            service.add("공부");
            service.add("운동");

            assertEquals(2, service.findAll().size());
            assertEquals("운동", service.findAll().get(1).title());
        }

        @Test
        @DisplayName("제목이 비면 예외를 던진다")
        void rejectsEmptyTitle() {
            var service = new TodoService(new MemoryStorage());

            assertThrows(EmptyTitleException.class, () -> service.add("  "));
        }
    }
}
```

입력만 다른 테스트는 묶어서 씁니다.

```java
@ParameterizedTest
@ValueSource(strings = {"", "  ", "\t"})
void rejectsBlankTitle(String title) {
    assertThrows(EmptyTitleException.class, () -> service.add(title));
}
```

외부에 의존하는 부분은 인터페이스로 분리해 두면 테스트에서 간단한 구현으로 바꿔 끼울 수 있습니다. [02. 클래스와 객체](/learn/languages/java/classes)의 `TodoStorage`가 그 예입니다. 파일을 실제로 쓰는 대신 메모리 구현을 넘기면 테스트가 빠르고 서로 간섭하지 않습니다.

테스트할 가치가 있는 것은 **규칙**입니다. 빈 제목을 막는지, 정렬 기준이 맞는지, 경계값에서 어떻게 되는지 같은 것들입니다. getter와 setter까지 덮을 필요는 없습니다.
