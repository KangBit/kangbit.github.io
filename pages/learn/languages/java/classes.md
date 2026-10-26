---
title: Java 02. 클래스와 객체
description: 데이터와 동작을 클래스로 묶고 상속과 합성으로 구조를 만듭니다.
outline: deep
---

# 02. 클래스와 객체

책임을 나누어 클래스를 설계하고, 타입을 확장하는 방법을 정리합니다.

## 필드와 메서드

```java
public class Todo {
    private final long id;
    private String title;
    private boolean done;

    public String getTitle() {
        return title;
    }

    public void complete() {
        this.done = true;
    }
}
```

`final` 필드는 한 번 정해지면 바뀌지 않습니다. 바뀔 이유가 없는 값에는 기본으로 붙여 둡니다.

`static`은 인스턴스가 아니라 클래스에 속합니다.

```java
public class Todo {
    private static final int MAX_TITLE = 100;   // 상수
    private static long sequence = 0;           // 모든 인스턴스가 공유

    public static Todo of(String title) {       // 정적 팩토리 메서드
        return new Todo(++sequence, title);
    }
}
```

`Todo.of("공부")`처럼 이름이 붙은 생성 방법을 두면, 생성자가 여러 개일 때 무엇을 만드는지 드러납니다.

## 생성자

필드를 초기화합니다. 적지 않으면 비어 있는 기본 생성자가 생깁니다.

```java
public class Todo {
    private final long id;
    private final String title;

    public Todo(long id, String title) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("제목이 비어 있습니다");
        }
        this.id = id;
        this.title = title;
    }

    public Todo(String title) {
        this(0, title);   // 다른 생성자 호출은 첫 줄이어야 합니다
    }
}
```

생성자에서 검증하면 **잘못된 상태의 객체가 아예 만들어지지 않습니다.** 이후 코드에서 매번 확인할 필요가 없어집니다.

## 접근 제어

| 제어자 | 접근 범위 |
| --- | --- |
| `private` | 같은 클래스 |
| (없음) | 같은 패키지 |
| `protected` | 같은 패키지 + 하위 클래스 |
| `public` | 전부 |

필드는 `private`, 공개할 동작만 `public`이 기본입니다. 좁게 시작해서 필요할 때 넓히는 편이 되돌리기 쉽습니다.

## 캡슐화

내부 표현을 감추고 동작으로만 쓰게 합니다. getter와 setter를 기계적으로 다는 것과는 다릅니다.

```java
// 캡슐화되지 않은 모양
public class TodoList {
    public List<Todo> todos = new ArrayList<>();
}

list.todos.clear();   // 밖에서 마음대로 바꿉니다
```

```java
public class TodoList {
    private final List<Todo> todos = new ArrayList<>();

    public void add(Todo todo) {
        if (todos.size() >= 100) {
            throw new IllegalStateException("100건을 넘을 수 없습니다");
        }
        todos.add(todo);
    }

    public List<Todo> getTodos() {
        return List.copyOf(todos);   // 수정할 수 없는 복사본
    }
}
```

컬렉션을 그대로 반환하면 밖에서 원본을 바꿀 수 있습니다. 읽기 전용 사본을 주면 규칙이 지켜집니다.

## 상속과 다형성

`extends`로 상위 클래스의 필드와 메서드를 물려받습니다.

```java
public abstract class Task {
    protected final String title;

    protected Task(String title) {
        this.title = title;
    }

    public abstract int priority();

    public String describe() {
        return "%s (우선순위 %d)".formatted(title, priority());
    }
}


public class Todo extends Task {
    public Todo(String title) {
        super(title);
    }

    @Override
    public int priority() {
        return 2;
    }
}
```

다형성은 **같은 타입으로 다루되 실제 동작은 각자의 것**이 실행되는 성질입니다.

```java
List<Task> tasks = List.of(new Todo("공부"), new Urgent("제출"));

for (Task task : tasks) {
    System.out.println(task.describe());   // 각자의 priority()가 불립니다
}
```

`@Override`는 붙이는 편이 안전합니다. 이름이나 인자를 잘못 적어 재정의가 아니라 새 메서드를 만든 경우를 컴파일러가 잡아 줍니다.

상속은 상위 클래스의 구현에 묶이는 선택입니다. 상위가 바뀌면 하위가 함께 깨집니다. 바꾸지 않을 것은 `final`로 막아 둡니다.

```java
public final class Todo { }          // 상속 금지
public final String getTitle() { }   // 재정의 금지
```

## 인터페이스와 합성

인터페이스는 "무엇을 할 수 있는가"만 정합니다. 구현은 각자 합니다.

```java
public interface TodoStorage {
    List<Todo> load();
    void save(List<Todo> todos);
}


public class JsonStorage implements TodoStorage { }
public class MemoryStorage implements TodoStorage { }
```

쓰는 쪽은 구현이 아니라 인터페이스를 받습니다. 저장 방식을 바꿔도 이 클래스는 손대지 않습니다.

```java
public class TodoService {
    private final TodoStorage storage;

    public TodoService(TodoStorage storage) {   // 밖에서 넣어 줍니다
        this.storage = storage;
    }
}


new TodoService(new JsonStorage());
new TodoService(new MemoryStorage());   // 테스트에서는 이쪽
```

필요한 것을 **물려받는 대신 가지고 있는** 이 방식을 합성이라고 합니다. 여러 개를 조합할 수 있고, 실행 중에 바꿀 수도 있어서 상속보다 유연합니다.

인터페이스에는 기본 구현을 둘 수도 있습니다. 이미 배포된 인터페이스에 메서드를 추가할 때 씁니다.

```java
public interface TodoStorage {
    List<Todo> load();

    default boolean isEmpty() {
        return load().isEmpty();
    }
}
```

하나의 추상 메서드만 가진 인터페이스는 람다로 넘길 수 있습니다. [05. 람다, 스트림과 입출력](/learn/languages/java/streams)에서 다룹니다.

## record로 데이터 표현하기

값을 담기만 하는 클래스는 `record`로 짧게 씁니다.

```java
public record Todo(long id, String title, boolean done) { }
```

이 한 줄로 생성자, 접근자, `equals`, `hashCode`, `toString`이 만들어집니다.

```java
var todo = new Todo(1, "공부", false);

todo.title();                              // "공부"  — get이 붙지 않습니다
todo.equals(new Todo(1, "공부", false));    // true — 값으로 비교합니다
todo;                                      // Todo[id=1, title=공부, done=false]
```

모든 필드가 `final`이라 만들어진 뒤 바뀌지 않습니다. 일부만 바꾼 값은 새로 만듭니다.

```java
var completed = new Todo(todo.id(), todo.title(), true);
```

검증은 간결한 생성자에 적습니다.

```java
public record Todo(long id, String title, boolean done) {
    public Todo {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("제목이 비어 있습니다");
        }
    }

    public String label() {
        return done ? "[x] " + title : "[ ] " + title;
    }
}
```

상태가 바뀌어야 하거나 상속이 필요하면 일반 클래스를 씁니다. `record`는 상속할 수 없습니다.
