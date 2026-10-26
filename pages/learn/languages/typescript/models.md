---
title: TypeScript 02. 데이터 모델과 함수
description: 객체와 함수의 모양을 타입으로 표현하는 방법을 익힙니다.
outline: deep
---

# 02. 데이터 모델과 함수

다루는 데이터의 모양과 함수의 입출력을 타입으로 적는 방법을 정리합니다.

## 객체 타입

필요한 속성과 타입을 그대로 적습니다.

```ts
function render(todo: { id: number; title: string }) {
  return todo.title;
}
```

같은 모양을 여러 곳에서 쓰면 이름을 붙입니다.

```ts
interface Todo {
  id: number;
  title: string;
  done: boolean;
}
```

객체 리터럴을 바로 넘기면 선언에 없는 속성은 거부됩니다. 오타를 잡아 주는 검사입니다.

```ts
const todo: Todo = {
  id: 1,
  title: "공부",
  done: false,
  titel: "오타", // 오류: 'titel'은 Todo에 없습니다
};
```

다만 변수를 거치면 이 검사가 적용되지 않습니다. 속성이 더 많아도 필요한 것이 다 있으면 통과합니다.

```ts
const input = { id: 1, title: "공부", done: false, extra: 1 };
const todo: Todo = input; // 통과합니다
```

## type과 interface

객체 모양을 적는 데는 둘 다 쓸 수 있습니다.

```ts
interface Todo {
  id: number;
}

type TodoType = {
  id: number;
};
```

차이는 확장 방식과 다룰 수 있는 범위입니다.

```ts
// interface는 선언을 합칩니다
interface Window {
  myApp: string;
}

// type은 합칠 수 없습니다
type A = { a: string };
type A = { b: string }; // 오류: 중복 식별자
```

```ts
// type만 할 수 있는 것
type Status = "todo" | "done"; // 유니온
type Pair = [number, number]; // 튜플
type Keys = keyof Todo; // 연산 결과
```

객체 모양에는 `interface`, 유니온이나 연산이 필요하면 `type`을 쓰는 기준이면 충분합니다. 외부에 공개하는 라이브러리라면 사용자가 속성을 덧붙일 수 있는 `interface`가 유리합니다.

확장은 양쪽 다 됩니다.

```ts
interface Base {
  id: number;
}
interface Extended extends Base {
  title: string;
}

type BaseType = { id: number };
type ExtendedType = BaseType & { title: string };
```

## 선택 속성

있을 수도, 없을 수도 있는 속성에는 `?`를 붙입니다. 타입에 `undefined`가 더해집니다.

```ts
interface Todo {
  id: number;
  title: string;
  memo?: string; // string | undefined
}

const todo: Todo = { id: 1, title: "공부" }; // memo가 없어도 됩니다
todo.memo.length; // 오류: undefined일 수 있습니다
todo.memo?.length; // number | undefined
```

`memo?: string`과 `memo: string | undefined`는 다릅니다. 후자는 **속성을 반드시 적어야** 합니다.

```ts
interface A {
  memo?: string;
}
interface B {
  memo: string | undefined;
}

const a: A = {}; // 통과
const b: B = {}; // 오류: memo가 없습니다
const b2: B = { memo: undefined }; // 통과
```

값을 빠뜨린 것과 비워 둔 것을 구분하고 싶을 때 이 차이가 쓸모 있습니다.

## 읽기 전용 속성

만든 뒤 바꾸지 않을 값에 표시합니다.

```ts
interface Todo {
  readonly id: number;
  title: string;
}

const todo: Todo = { id: 1, title: "공부" };
todo.id = 2; // 오류
todo.title = "운동"; // 가능
```

배열에도 쓸 수 있습니다. 원본을 바꾸는 메서드가 사라집니다.

```ts
function print(list: readonly string[]) {
  list.push("a"); // 오류: push는 readonly 배열에 없습니다
  return [...list, "a"]; // 새 배열을 만드는 것은 됩니다
}
```

이 표시는 **컴파일 시점에만 유효합니다.** 실행 중에 값이 바뀌는 것을 막지는 않습니다. 함수가 인자를 건드리지 않겠다는 약속을 드러내는 용도입니다.

## 함수 입출력 타입

```ts
function addTodo(list: Todo[], title: string): Todo[] {
  return [...list, { id: Date.now(), title, done: false }];
}

const filter = (list: Todo[], done: boolean): Todo[] =>
  list.filter((todo) => todo.done === done);
```

콜백을 받을 때는 함수 타입을 적습니다.

```ts
type Comparator = (a: Todo, b: Todo) => number;

function sort(list: Todo[], compare: Comparator): Todo[] {
  return [...list].sort(compare);
}
```

함수를 인자로 넘기는 자리에서는 매개변수 타입을 다시 쓰지 않아도 됩니다. 기대되는 타입에서 추론됩니다.

```ts
sort(todos, (a, b) => a.id - b.id); // a와 b는 Todo로 추론됩니다
```

선택적 매개변수와 기본값도 같은 방식입니다.

```ts
function format(todo: Todo, prefix = "- "): string {
  return `${prefix}${todo.title}`;
}

function find(list: Todo[], id?: number): Todo | undefined {
  return id === undefined ? list[0] : list.find((todo) => todo.id === id);
}
```

## satisfies

타입에 맞는지 **검사하되 추론은 그대로 두고** 싶을 때 씁니다.

타입을 직접 붙이면 값이 가진 구체적인 정보가 넓혀집니다.

```ts
type Config = Record<string, string | string[]>;

const config: Config = {
  name: "todo",
  tags: ["a", "b"],
};

config.tags.map((t) => t); // 오류: string | string[]에는 map이 없습니다
```

`satisfies`로 바꾸면 검사는 받으면서 각 속성의 실제 타입이 유지됩니다.

```ts
const config = {
  name: "todo",
  tags: ["a", "b"],
} satisfies Config;

config.tags.map((t) => t); // 가능: tags는 string[]입니다
config.port = 3000; // 오류: Config에 맞지 않습니다
```

상수 묶음을 정의할 때 특히 유용합니다.

```ts
const STATUS = {
  todo: "할 일",
  done: "완료",
} satisfies Record<string, string>;

type Status = keyof typeof STATUS; // "todo" | "done"
```
