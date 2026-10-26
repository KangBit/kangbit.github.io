---
title: JavaScript 02. 함수와 데이터 처리
description: 함수를 정의하는 방법과 배열·객체를 다루는 문법을 익힙니다.
outline: deep
---

# 02. 함수와 데이터 처리

로직을 함수로 묶고, 배열과 객체에 담긴 데이터를 변환하는 방법을 정리합니다.

## 함수 선언

정의하는 방법이 세 가지입니다.

```js
function add(a, b) {
  return a + b;
} // 선언식

const sub = function (a, b) {
  return a - b;
}; // 표현식

const mul = (a, b) => a * b; // 화살표
```

선언식은 정의보다 먼저 호출할 수 있지만, 표현식과 화살표는 그렇지 않습니다.

```js
add(1, 2); // 3
sub(1, 2); // ReferenceError: Cannot access 'sub' before initialization

function add(a, b) {
  return a + b;
}
const sub = (a, b) => a - b;
```

화살표 함수는 `this`와 `arguments`를 자기 것으로 갖지 않습니다. 이 차이는 [03. 스코프와 객체 모델](/learn/languages/javascript/scope)에서 다룹니다.

## 매개변수와 반환값

기본값은 인자가 `undefined`일 때만 적용됩니다. `null`은 값으로 취급합니다.

```js
function greet(name, greeting = "안녕") {
  return `${greeting}, ${name}`;
}

greet("bit"); // "안녕, bit"
greet("bit", undefined); // "안녕, bit"
greet("bit", null); // "null, bit"
```

인자를 몇 개를 받을지 모를 때는 나머지 매개변수를 씁니다.

```js
function sum(...numbers) {
  return numbers.reduce((acc, n) => acc + n, 0);
}

sum(1, 2, 3); // 6
```

값을 여러 개 돌려줘야 하면 객체로 묶습니다. 이름이 붙어서 호출하는 쪽이 순서를 외우지 않아도 됩니다.

```js
function parse(text) {
  return { value: Number(text), isValid: !Number.isNaN(Number(text)) };
}

const { value, isValid } = parse("5");
```

## 배열과 객체

```js
const todo = { id: 1, title: "공부", done: false };

todo.title; // 점 표기
todo["title"]; // 대괄호 표기 — 키가 변수일 때

const key = "done";
todo[key]; // false
```

키 이름을 동적으로 만들 수도 있습니다.

```js
const field = "title";
const patch = { [field]: "운동" }; // { title: "운동" }
```

## 구조 분해, 스프레드와 나머지

필요한 값만 꺼내 쓸 때 구조 분해를 씁니다.

```js
const { title, done = false } = todo;
const [first, ...rest] = ["a", "b", "c"]; // first: "a", rest: ["b", "c"]
```

매개변수 자리에서도 바로 풀 수 있습니다.

```js
function render({ title, done }) {
  return `${done ? "[x]" : "[ ]"} ${title}`;
}
```

기존 값을 유지한 채 일부만 바꾼 새 값을 만들 때는 스프레드를 씁니다.

```js
const next = { ...todo, done: true }; // todo는 그대로
const merged = [...listA, ...listB];
```

다만 **한 겹만 복사**합니다. 중첩된 객체는 여전히 같은 것을 가리킵니다.

```js
const origin = { nested: { count: 1 } };
const copy = { ...origin };

copy.nested.count = 2;
origin.nested.count; // 2
```

## 배열 메서드

원본을 바꾸는 메서드와 새 배열을 돌려주는 메서드를 구분해야 합니다.

| 원본을 바꿈 | 새 배열을 반환 |
| --- | --- |
| `push` `pop` `splice` `sort` `reverse` | `map` `filter` `slice` `concat` `toSorted` `toReversed` |

```js
const list = [3, 1, 2];

list.sort(); // list 자체가 바뀝니다
list.toSorted(); // list는 그대로, 정렬된 새 배열을 반환
```

자주 쓰는 변환은 다음과 같습니다.

```js
const todos = [
  { id: 1, title: "공부", done: true },
  { id: 2, title: "운동", done: false },
];

todos.map((t) => t.title); // ["공부", "운동"]
todos.filter((t) => !t.done); // 미완료만
todos.find((t) => t.id === 2); // 첫 번째로 맞는 하나
todos.some((t) => t.done); // true
todos.every((t) => t.done); // false
```

`reduce`는 배열을 하나의 값으로 접습니다. 두 번째 인자가 초기값입니다.

```js
const countByDone = todos.reduce((acc, todo) => {
  const key = todo.done ? "done" : "todo";
  acc[key] = (acc[key] ?? 0) + 1;
  return acc;
}, {});
// { done: 1, todo: 1 }
```

`sort`는 기본적으로 **값을 문자열로 바꿔** 비교합니다. 숫자 정렬에는 비교 함수를 넘겨야 합니다.

```js
[10, 9, 1].sort(); // [1, 10, 9]
[10, 9, 1].sort((a, b) => a - b); // [1, 9, 10]
```

## Map과 Set

객체의 키는 문자열과 심볼만 될 수 있습니다. 어떤 값이든 키로 쓰려면 `Map`을 씁니다.

```js
const memo = new Map();
const todo = { id: 1 };

memo.set(todo, "객체 자체를 키로");
memo.get(todo); // "객체 자체를 키로"
memo.size; // 1
```

`Set`은 중복을 허용하지 않습니다. 중복 제거에 자주 쓰입니다.

```js
const unique = [...new Set([1, 1, 2, 3])]; // [1, 2, 3]

const seen = new Set();
seen.add("a");
seen.has("a"); // true
```

삽입 순서를 유지하고 크기를 `size`로 바로 알 수 있다는 점도 객체와 다릅니다.

## 옵셔널 체이닝과 널 병합

중간 값이 없을 때 오류 대신 `undefined`를 받습니다.

```js
user?.profile?.name; // user나 profile이 없으면 undefined
list?.[0];
callback?.(); // 함수가 있을 때만 호출
```

`??`는 `null`과 `undefined`일 때만 오른쪽 값을 씁니다. `||`와 달리 `0`과 `""`를 값으로 인정합니다.

```js
const count = 0;

count || 10; // 10
count ?? 10; // 0
```

## 정규식으로 문자열 다루기

```js
const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

pattern.test("a@b.com"); // true
pattern.test("a@b"); // false
```

치환에서는 괄호로 묶은 그룹을 `$1`부터 순서대로 참조합니다.

```js
"2026-10-26".replace(/(\d{4})-(\d{2})-(\d{2})/, "$1년 $2월 $3일");
// "2026년 10월 26일"
```

그룹에 이름을 붙이면 읽기 쉬워집니다.

```js
const matched = "2026-10-26".match(
  /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/,
);

matched.groups.year; // "2026"
```

`g` 플래그를 붙인 정규식은 마지막 검색 위치를 기억하므로, 같은 객체를 여러 번 `test`에 쓰면 결과가 달라집니다. 반복 사용할 때는 매번 새로 만들거나 `matchAll`을 씁니다.
