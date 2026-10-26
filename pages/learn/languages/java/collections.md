---
title: Java 03. 컬렉션과 제네릭
description: 용도에 맞는 컬렉션을 고르고 타입 안전하게 다룹니다.
outline: deep
---

# 03. 컬렉션과 제네릭

데이터를 담는 자료구조의 차이를 확인하고, 비교와 정렬의 기준을 정리합니다.

## List

순서가 있고 중복을 허용합니다. 대부분 `ArrayList`로 충분합니다.

```java
List<Todo> todos = new ArrayList<>();

todos.add(todo);
todos.get(0);
todos.remove(0);
todos.size();
todos.contains(todo);   // equals로 비교합니다
```

구현에 따라 잘하는 일이 다릅니다.

| 구현 | 빠른 것 | 느린 것 |
| --- | --- | --- |
| `ArrayList` | 인덱스 접근 | 중간 삽입·삭제 |
| `LinkedList` | 양 끝 삽입·삭제 | 인덱스 접근 |

실제로는 `ArrayList`를 기본으로 두고, 큐처럼 쓸 일이 있으면 `ArrayDeque`를 고르는 경우가 많습니다.

고정된 목록은 `List.of`로 만듭니다. 바꿀 수 없습니다.

```java
List<String> fixed = List.of("todo", "done");
fixed.add("x");   // UnsupportedOperationException
```

순회 중에 원소를 지우면 오류가 납니다.

```java
for (Todo todo : todos) {
    todos.remove(todo);   // ConcurrentModificationException
}

todos.removeIf(Todo::done);   // 이렇게 지웁니다
```

## Set

중복을 허용하지 않습니다. 포함 여부 확인이 빠릅니다.

```java
Set<String> tags = new HashSet<>();

tags.add("공부");
tags.add("공부");   // 두 번째는 무시됩니다
tags.size();        // 1
```

순서 보장이 다릅니다.

| 구현 | 순서 |
| --- | --- |
| `HashSet` | 없음 — 가장 빠릅니다 |
| `LinkedHashSet` | 넣은 순서 |
| `TreeSet` | 정렬된 순서 |

중복 판정은 `hashCode`와 `equals`로 합니다. 직접 만든 클래스를 넣으려면 이 둘을 구현해야 합니다.

## Map

키와 값을 짝지어 담습니다.

```java
Map<Long, Todo> byId = new HashMap<>();

byId.put(1L, todo);
byId.get(1L);
byId.get(999L);                    // null
byId.getOrDefault(999L, EMPTY);    // 기본값
byId.containsKey(1L);
```

없을 때만 넣거나, 기존 값을 기준으로 고칠 수 있습니다.

```java
byId.putIfAbsent(1L, todo);

Map<Boolean, List<Todo>> grouped = new HashMap<>();
grouped.computeIfAbsent(todo.done(), key -> new ArrayList<>()).add(todo);

Map<String, Integer> counts = new HashMap<>();
counts.merge(tag, 1, Integer::sum);   // 없으면 1, 있으면 더하기
```

순회는 `entrySet`이 가장 효율적입니다. 키로 돌면서 `get`을 또 부르면 두 번 찾습니다.

```java
for (Map.Entry<Long, Todo> entry : byId.entrySet()) {
    entry.getKey();
    entry.getValue();
}

byId.forEach((id, todo) -> System.out.println(id + ": " + todo.title()));
```

`HashMap`은 순서를 보장하지 않습니다. 넣은 순서가 필요하면 `LinkedHashMap`, 정렬이 필요하면 `TreeMap`을 씁니다.

## 제네릭

컬렉션에 무엇이 들어 있는지 타입으로 적습니다. 꺼낼 때 형변환하지 않아도 됩니다.

```java
List raw = new ArrayList();           // 쓰지 않습니다
raw.add("공부");
String title = (String) raw.get(0);   // 형변환이 필요하고 런타임에 터질 수 있습니다

List<String> typed = new ArrayList<>();
typed.add("공부");
String t = typed.get(0);              // 그대로 꺼냅니다
typed.add(1);                         // 컴파일 오류
```

메서드와 클래스에도 쓸 수 있습니다.

```java
public static <T> Optional<T> first(List<T> list) {
    return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
}
```

제약을 걸면 그 타입이 가진 동작을 쓸 수 있습니다.

```java
public static <T extends Comparable<T>> T max(List<T> list) {
    T result = list.get(0);
    for (T item : list) {
        if (item.compareTo(result) > 0) {
            result = item;
        }
    }
    return result;
}
```

`List<Object>`와 `List<String>`은 **상속 관계가 아닙니다.** 읽기만 할 목적이라면 와일드카드를 씁니다.

```java
void print(List<Object> list) { }
print(new ArrayList<String>());   // 컴파일 오류

void print(List<?> list) { }       // 어떤 타입이든 받습니다
void sum(List<? extends Number> list) { }   // Number 하위면 됩니다
```

제네릭 정보는 컴파일 후 지워집니다. 그래서 실행 중에 타입을 확인할 수 없습니다.

```java
if (list instanceof List<String>) { }   // 컴파일 오류
new T[10];                              // 만들 수 없습니다
```

## equals와 hashCode

둘은 짝입니다. **`equals`를 재정의하면 `hashCode`도 함께** 해야 합니다. 하지 않으면 `HashMap`과 `HashSet`에서 찾지 못합니다.

```java
public class Todo {
    private final long id;

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof Todo todo)) return false;
        return id == todo.id;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
```

규칙은 "같은 객체면 해시도 같아야 한다"입니다. 해시로 통을 먼저 찾고 그 안에서 `equals`로 비교하기 때문에, 해시가 다르면 같은 값이어도 영영 만나지 못합니다.

```java
// hashCode를 재정의하지 않았다면
Set<Todo> set = new HashSet<>();
set.add(new Todo(1));
set.contains(new Todo(1));   // false
```

`record`는 이 둘을 자동으로 만들어 줍니다. 값을 담는 클래스라면 `record`가 가장 간단합니다.

해시에 쓰는 필드는 **바뀌지 않아야 합니다.** 컬렉션에 넣은 뒤 값을 바꾸면 해당 원소를 찾을 수 없게 됩니다.

## 정렬과 Comparator

클래스 자체의 기본 순서는 `Comparable`로 정합니다.

```java
public record Todo(long id, String title) implements Comparable<Todo> {
    @Override
    public int compareTo(Todo other) {
        return Long.compare(id, other.id);
    }
}

Collections.sort(todos);
```

상황마다 다른 기준은 `Comparator`로 넘깁니다.

```java
todos.sort(Comparator.comparing(Todo::title));

todos.sort(Comparator.comparing(Todo::title).reversed());

todos.sort(
    Comparator.comparing(Todo::done)
        .thenComparing(Todo::title)
);

todos.sort(Comparator.comparing(Todo::memo, Comparator.nullsLast(Comparator.naturalOrder())));
```

`sort`는 원본을 바꿉니다. 새 리스트가 필요하면 복사한 뒤 정렬하거나 스트림을 씁니다.

```java
var sorted = todos.stream().sorted(Comparator.comparing(Todo::title)).toList();
```

비교 결과는 음수·0·양수여야 합니다. 뺄셈으로 만들면 큰 수에서 넘칠 수 있으므로 `Integer.compare`나 `Long.compare`를 씁니다.

```java
(a, b) -> a.id() - b.id();              // 오버플로 위험
(a, b) -> Long.compare(a.id(), b.id()); // 안전합니다
```
