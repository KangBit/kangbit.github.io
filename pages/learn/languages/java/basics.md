---
title: Java 01. 실행 환경과 기본 문법
description: JDK와 JVM의 역할을 확인하고 타입과 최신 문법을 익힙니다.
outline: deep
---

# 01. 실행 환경과 기본 문법

코드가 어떤 단계를 거쳐 실행되는지 확인하고, 값을 다루는 문법을 정리합니다.

## JDK와 JVM

세 가지 이름이 섞여 쓰입니다.

| 이름 | 역할 |
| --- | --- |
| JVM | 바이트코드를 읽어 실행하는 가상 머신 |
| JRE | JVM과 표준 라이브러리 — 실행에 필요한 최소 |
| JDK | JRE에 컴파일러와 개발 도구를 더한 것 |

개발할 때는 JDK를 설치합니다. 소스는 운영체제가 아니라 **JVM을 대상으로** 컴파일되고, 각 플랫폼의 JVM이 그것을 실행합니다.

```bash
java -version
javac -version
```

버전은 LTS를 기준으로 고르는 것이 보통입니다. 17과 21이 널리 쓰입니다.

## 컴파일과 실행

```bash
javac Main.java     # Main.class 생성
java Main           # 클래스 이름으로 실행
```

한 파일짜리는 바로 실행할 수도 있습니다.

```bash
java Main.java
```

진입점은 정해진 형태의 메서드입니다.

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("실행");
    }
}
```

공개 클래스의 이름은 파일 이름과 같아야 합니다. `Main.java` 안의 `public class`는 `Main`이어야 합니다.

## 기본 타입과 참조 타입

기본 타입은 값을 직접 담고, 참조 타입은 객체가 있는 위치를 담습니다.

```java
int count = 1;          // 기본 타입
String title = "공부";   // 참조 타입

int[] numbers = {1, 2, 3};
```

기본 타입은 여덟 가지입니다.

```java
byte  short  int  long
float double
char  boolean
```

정수 기본은 `int`, 실수 기본은 `double`입니다. 범위를 넘기면 조용히 뒤집힙니다.

```java
int max = Integer.MAX_VALUE;   // 2147483647
max + 1;                       // -2147483648

long big = 2147483648L;        // L을 붙여야 long 리터럴입니다
```

실수 계산의 오차도 다른 언어와 같습니다. 금액에는 `BigDecimal`을 씁니다.

```java
0.1 + 0.2;   // 0.30000000000000004

new BigDecimal("0.1").add(new BigDecimal("0.2"));   // 0.3
```

문자열 비교는 `==`가 아니라 `equals`입니다. `==`는 같은 객체인지를 봅니다.

```java
String a = new String("공부");
String b = new String("공부");

a == b;        // false
a.equals(b);   // true
```

기본 타입에는 대응하는 래퍼 클래스가 있습니다. 컬렉션에는 래퍼만 넣을 수 있습니다.

```java
int  → Integer
long → Long
boolean → Boolean

List<Integer> list = new ArrayList<>();
list.add(1);   // 자동으로 Integer로 박싱됩니다
```

래퍼는 `null`이 될 수 있습니다. 언박싱되는 순간 터집니다.

```java
Integer value = null;
int unboxed = value;   // NullPointerException
```

## var와 지역 변수 타입 추론

메서드 안의 지역 변수는 타입을 생략할 수 있습니다. 오른쪽에서 추론합니다.

```java
var todos = new ArrayList<String>();
var count = 1;                       // int
var entry = Map.entry("id", 1);      // 긴 타입을 적지 않아도 됩니다
```

동적 타입이 되는 것이 아닙니다. 타입은 컴파일 시점에 정해지고 바뀌지 않습니다.

```java
var count = 1;
count = "공부";   // 컴파일 오류
```

쓸 수 없는 자리가 있습니다.

```java
var value;              // 오류: 초기값이 없습니다
var nothing = null;     // 오류: 추론할 수 없습니다

class A {
    var field = 1;      // 오류: 필드에는 쓸 수 없습니다
}
```

오른쪽만 보고 타입을 알 수 있을 때 씁니다. `var result = process();`처럼 무엇이 나오는지 알 수 없으면 적어 주는 편이 낫습니다.

## switch 표현식과 텍스트 블록

예전 `switch`는 `break`를 빠뜨리면 다음 분기로 흘러갔습니다. 화살표를 쓰면 그 문제가 사라지고 값을 돌려줄 수 있습니다.

```java
String label = switch (status) {
    case "todo" -> "할 일";
    case "done" -> "완료";
    default -> "알 수 없음";
};
```

여러 값을 묶거나 블록을 쓸 수 있습니다. 블록에서는 `yield`로 값을 냅니다.

```java
int priority = switch (status) {
    case "urgent", "today" -> 1;
    case "done" -> {
        log("완료 항목");
        yield 3;
    }
    default -> 2;
};
```

표현식 형태는 **모든 경우를 다뤄야** 컴파일됩니다. enum에 값을 추가하면 빠뜨린 분기를 바로 알려 줍니다.

여러 줄 문자열은 따옴표 세 개로 씁니다.

```java
String query = """
        SELECT id, title
        FROM todos
        WHERE done = false
        """;
```

가장 왼쪽 줄을 기준으로 공통 들여쓰기가 제거됩니다. 이스케이프를 쓰지 않아도 되어 JSON이나 SQL을 적을 때 편합니다.

## 조건문과 반복문

조건에는 `boolean`만 올 수 있습니다. `if (count)`처럼 숫자를 넣으면 컴파일되지 않습니다.

```java
if (count > 0) {
    ...
} else if (count == 0) {
    ...
} else {
    ...
}
```

반복은 목적에 따라 고릅니다.

```java
for (int i = 0; i < list.size(); i++) { }   // 인덱스가 필요할 때

for (String item : list) { }                 // 값만 순회

list.forEach(item -> { });                   // 람다
```

`instanceof`로 확인한 뒤 형변환하던 코드는 한 줄로 줄일 수 있습니다.

```java
// 예전
if (value instanceof String) {
    String text = (String) value;
    text.length();
}

// 패턴 변수
if (value instanceof String text) {
    text.length();
}
```
