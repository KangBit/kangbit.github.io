---
title: Java 04. 예외와 null 처리
description: 실패를 표현하고 자원을 정리하며 null을 다루는 방법을 익힙니다.
outline: deep
---

# 04. 예외와 null 처리

실패했을 때 어떻게 알리고 어디서 처리할지, 값이 없을 수 있는 경우를 어떻게 표현할지 정리합니다.

## 검사 예외와 비검사 예외

Java는 예외를 두 갈래로 나눕니다.

```
Throwable
├── Error                  — JVM 수준의 문제. 잡지 않습니다
└── Exception
    ├── RuntimeException   — 비검사 예외
    └── 그 외              — 검사 예외
```

**검사 예외**는 반드시 처리하거나 던진다고 선언해야 컴파일됩니다.

```java
public List<Todo> load(Path path) throws IOException {
    return Files.readAllLines(path).stream().map(this::parse).toList();
}
```

**비검사 예외**는 선언하지 않아도 됩니다. 프로그래밍 실수에 해당하는 것들입니다.

```java
NullPointerException
IllegalArgumentException
IndexOutOfBoundsException
IllegalStateException
```

기준은 "호출하는 쪽이 복구할 수 있는가"입니다. 파일이 없으면 기본값을 쓰거나 다시 물어볼 수 있으니 검사 예외가 어울립니다. 인자가 `null`인 것은 코드를 고쳐야 할 문제이므로 비검사 예외입니다.

검사 예외를 그냥 삼키는 것이 가장 나쁜 처리입니다.

```java
try {
    load(path);
} catch (IOException e) {
    // 아무것도 하지 않습니다 — 문제가 조용히 사라집니다
}
```

처리할 수 없다면 올려보냅니다.

```java
try {
    return load(path);
} catch (IOException e) {
    throw new TodoLoadException(path + " 를 읽을 수 없습니다", e);
}
```

원인 예외를 두 번째 인자로 넘기면 스택 추적에 함께 남아 원인을 찾을 수 있습니다.

## 사용자 정의 예외

도메인의 실패에는 이름을 붙입니다. 무엇이 잘못됐는지 타입으로 드러납니다.

```java
public class TodoException extends RuntimeException {
    public TodoException(String message) {
        super(message);
    }

    public TodoException(String message, Throwable cause) {
        super(message, cause);
    }
}


public class EmptyTitleException extends TodoException {
    public EmptyTitleException() {
        super("제목이 비어 있습니다");
    }
}
```

```java
try {
    service.add("  ");
} catch (TodoException e) {   // 하위 예외도 함께 잡힙니다
    log.warn(e.getMessage());
}
```

여러 예외를 같은 방식으로 처리할 때는 묶어 적습니다.

```java
try {
    process();
} catch (IOException | ParseException e) {
    throw new TodoException("처리 실패", e);
}
```

`catch` 순서는 **구체적인 것이 먼저**여야 합니다. 상위 타입을 먼저 적으면 뒤쪽이 닿지 않아 컴파일 오류가 납니다.

## try-with-resources와 자원 관리

파일이나 연결은 다 쓰면 닫아야 합니다. 예전에는 `finally`에서 직접 닫았습니다.

```java
BufferedReader reader = null;
try {
    reader = Files.newBufferedReader(path);
    ...
} finally {
    if (reader != null) {
        reader.close();   // 여기서도 예외가 날 수 있습니다
    }
}
```

괄호 안에서 연 자원은 블록을 벗어날 때 자동으로 닫힙니다.

```java
try (var reader = Files.newBufferedReader(path)) {
    return reader.lines().toList();
} catch (IOException e) {
    throw new TodoException("읽기 실패", e);
}
```

여러 개를 열면 **선언의 역순으로** 닫힙니다.

```java
try (var input = Files.newInputStream(source);
     var output = Files.newOutputStream(target)) {
    input.transferTo(output);
}
```

`AutoCloseable`을 구현하면 직접 만든 클래스도 쓸 수 있습니다.

```java
public class Timer implements AutoCloseable {
    private final long start = System.nanoTime();

    @Override
    public void close() {
        System.out.printf("%.3f초%n", (System.nanoTime() - start) / 1e9);
    }
}


try (var timer = new Timer()) {
    load();
}
```

## Optional과 null 다루기

`null`을 돌려주면 호출하는 쪽이 확인을 잊기 쉽습니다. 없을 수 있다는 사실을 **타입에 적습니다.**

```java
public Optional<Todo> findById(long id) {
    return todos.stream().filter(todo -> todo.id() == id).findFirst();
}
```

받는 쪽은 꺼내기 전에 처리를 정합니다.

```java
Optional<Todo> found = findById(1);

found.map(Todo::title).orElse("없음");

found.ifPresent(todo -> print(todo));

found.ifPresentOrElse(
    todo -> print(todo),
    () -> print("없습니다")
);

Todo todo = found.orElseThrow(() -> new TodoException("찾을 수 없습니다"));
```

`get()`은 쓰지 않습니다. 비어 있으면 그대로 터지므로 `null` 확인을 빠뜨린 것과 다를 바가 없습니다.

```java
found.get();          // 권장하지 않습니다
found.isPresent() ? found.get() : fallback;   // 이것도 Optional을 쓰는 의미가 없습니다
```

연결해서 쓸 수 있다는 점이 가장 큰 이점입니다.

```java
findById(1)
    .filter(todo -> !todo.done())
    .map(Todo::title)
    .map(String::toUpperCase)
    .orElse("해당 없음");
```

쓰지 않는 자리도 있습니다.

- **필드**: 직렬화되지 않고 메모리만 더 씁니다. 필드는 `null`이나 빈 값으로 둡니다
- **매개변수**: 호출하는 쪽이 `Optional.of(...)`로 감싸야 해서 번거롭습니다. 메서드를 둘로 나누는 편이 낫습니다
- **컬렉션 반환**: 비어 있음은 빈 리스트로 표현합니다

```java
public List<Todo> findAll() {
    return List.of();   // Optional<List<Todo>>가 아니라 빈 리스트
}
```

`Optional`은 **반환 타입에 쓰라고 만들어진 것**입니다. "결과가 없을 수도 있다"를 알리는 용도입니다.

## NullPointerException 읽기

최근 JVM은 어떤 값이 `null`이었는지 알려 줍니다.

```
Cannot invoke "String.length()" because the return value of
"Todo.memo()" is null
```

예전처럼 줄 번호만 보고 추측하지 않아도 됩니다.

인자를 미리 막아 두면 터지는 위치가 원인에 가까워집니다.

```java
public TodoService(TodoStorage storage) {
    this.storage = Objects.requireNonNull(storage, "storage는 필수입니다");
}
```

나중에 엉뚱한 곳에서 `NullPointerException`이 나는 대신, 생성하는 시점에 바로 알 수 있습니다.
