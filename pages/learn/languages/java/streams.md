---
title: Java 05. 람다, 스트림과 입출력
description: 람다와 스트림으로 데이터를 변환하고 파일과 시간을 다룹니다.
outline: deep
---

# 05. 람다, 스트림과 입출력

동작을 값처럼 넘기는 방법과, 목록·파일·시간을 다루는 표준 도구를 정리합니다.

## 람다와 함수형 인터페이스

추상 메서드가 하나뿐인 인터페이스는 람다로 구현할 수 있습니다.

```java
// 예전
todos.sort(new Comparator<Todo>() {
    @Override
    public int compare(Todo a, Todo b) {
        return a.title().compareTo(b.title());
    }
});

// 람다
todos.sort((a, b) -> a.title().compareTo(b.title()));

// 메서드 참조
todos.sort(Comparator.comparing(Todo::title));
```

표준으로 제공되는 것들이 있어서 대부분 직접 선언하지 않습니다.

| 인터페이스 | 모양 | 쓰임 |
| --- | --- | --- |
| `Function<T,R>` | `T → R` | 변환 |
| `Predicate<T>` | `T → boolean` | 조건 |
| `Consumer<T>` | `T → void` | 소비 |
| `Supplier<T>` | `() → T` | 생성 |
| `BiFunction<T,U,R>` | `(T,U) → R` | 두 값 변환 |

```java
Predicate<Todo> isDone = Todo::done;
Function<Todo, String> toTitle = Todo::title;
Supplier<List<Todo>> empty = List::of;
```

메서드 참조는 네 가지 형태가 있습니다.

```java
Todo::title            // 인스턴스 메서드
String::toUpperCase    // 임의 객체의 인스턴스 메서드
Integer::parseInt      // 정적 메서드
Todo::new              // 생성자
```

람다가 바깥 변수를 쓰려면 그 변수가 **바뀌지 않아야** 합니다.

```java
int count = 0;
todos.forEach(todo -> count++);   // 컴파일 오류
```

## Stream

목록을 변환하는 과정을 단계로 적습니다.

```java
List<String> titles = todos.stream()
    .filter(todo -> !todo.done())
    .sorted(Comparator.comparing(Todo::title))
    .map(Todo::title)
    .toList();
```

중간 연산은 쌓아 두기만 하고, **최종 연산이 올 때 한 번에 실행됩니다.**

```java
todos.stream().filter(this::isTarget);   // 아무 일도 일어나지 않습니다
```

자주 쓰는 최종 연산입니다.

```java
.toList()                       // 수정할 수 없는 리스트
.collect(Collectors.toList())   // 수정 가능한 리스트
.count()
.findFirst()                    // Optional
.anyMatch(Todo::done)
.allMatch(Todo::done)
.forEach(this::print)
```

묶고 세는 일은 `Collectors`에 있습니다.

```java
Map<Boolean, List<Todo>> byDone =
    todos.stream().collect(Collectors.groupingBy(Todo::done));

Map<Boolean, Long> counts =
    todos.stream().collect(Collectors.groupingBy(Todo::done, Collectors.counting()));

String joined =
    todos.stream().map(Todo::title).collect(Collectors.joining(", "));

Map<Long, Todo> byId =
    todos.stream().collect(Collectors.toMap(Todo::id, todo -> todo));
```

`toMap`은 키가 겹치면 예외를 냅니다. 겹칠 수 있다면 병합 방법을 넘깁니다.

```java
Collectors.toMap(Todo::title, todo -> todo, (a, b) -> a);
```

숫자는 전용 스트림이 박싱을 피합니다.

```java
int total = todos.stream().mapToInt(Todo::minutes).sum();

IntSummaryStatistics stats = todos.stream().mapToInt(Todo::minutes).summaryStatistics();
stats.getMax();
stats.getAverage();
```

스트림은 **한 번만 쓸 수 있습니다.**

```java
var stream = todos.stream();
stream.count();
stream.count();   // IllegalStateException
```

단순한 순회라면 `for`가 더 읽기 쉽습니다. 거르고 바꾸고 모으는 단계가 이어질 때 스트림이 유리합니다.

## 파일 입출력

`java.nio.file`의 `Path`와 `Files`를 씁니다.

```java
Path path = Path.of("data", "todos.json");

Files.exists(path);
Files.createDirectories(path.getParent());

String text = Files.readString(path);
Files.writeString(path, text);

List<String> lines = Files.readAllLines(path);
Files.write(path, lines);
```

인코딩은 기본이 UTF-8입니다(Java 18부터). 그 이전 버전을 쓴다면 명시합니다.

```java
Files.readString(path, StandardCharsets.UTF_8);
```

큰 파일은 전부 읽지 않고 흘려보냅니다. 스트림은 닫아야 하므로 try-with-resources와 함께 씁니다.

```java
try (var lines = Files.lines(path)) {
    long count = lines.filter(line -> line.contains("done")).count();
}
```

디렉터리를 훑을 때도 같습니다.

```java
try (var paths = Files.walk(Path.of("data"))) {
    paths.filter(p -> p.toString().endsWith(".json")).forEach(System.out::println);
}
```

쓰기 모드는 옵션으로 정합니다.

```java
Files.writeString(path, text, StandardOpenOption.APPEND);
Files.writeString(path, text, StandardOpenOption.CREATE_NEW);
```

## 날짜와 시간 API

`Date`와 `Calendar`는 쓰지 않습니다. 가변이고 월이 0부터 시작하는 등 함정이 많습니다. `java.time`을 씁니다.

```java
LocalDate date = LocalDate.now();            // 날짜만
LocalTime time = LocalTime.of(9, 30);        // 시간만
LocalDateTime dt = LocalDateTime.now();      // 시간대 없음
ZonedDateTime zoned = ZonedDateTime.now();   // 시간대 포함
Instant instant = Instant.now();             // UTC 기준 한 시점
```

모두 **불변입니다.** 계산하면 새 객체가 나옵니다.

```java
LocalDate due = date.plusDays(7).withDayOfMonth(1);
date;   // 그대로입니다
```

비교와 기간 계산입니다.

```java
date.isBefore(due);
date.isAfter(due);

Period period = Period.between(date, due);   // 년·월·일
period.getDays();

Duration duration = Duration.between(start, end);   // 시·분·초
duration.toMinutes();

ChronoUnit.DAYS.between(date, due);   // 단위를 직접 지정
```

문자열과의 변환입니다.

```java
LocalDate.parse("2026-10-26");

var formatter = DateTimeFormatter.ofPattern("yyyy년 M월 d일");
date.format(formatter);   // "2026년 10월 26일"
```

저장하고 전달할 때는 `Instant`나 UTC 기준을 쓰고, 보여 줄 때만 시간대를 적용하는 것이 기본입니다.

```java
Instant saved = Instant.now();

saved.atZone(ZoneId.of("Asia/Seoul")).toLocalDateTime();
```

`LocalDateTime`에는 시간대 정보가 없습니다. 서로 다른 지역의 사용자를 다룬다면 이것만으로 저장하지 않습니다.
