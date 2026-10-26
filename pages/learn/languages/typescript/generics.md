---
title: TypeScript 04. 재사용 가능한 타입
description: 제네릭과 타입 연산으로 여러 모델에 쓸 수 있는 타입을 만듭니다.
outline: deep
---

# 04. 재사용 가능한 타입

같은 구조를 여러 데이터 모델에 적용할 수 있도록 타입을 일반화하는 방법을 정리합니다.

## 제네릭

타입을 값처럼 받아서 쓰는 방법입니다. 모델마다 같은 함수를 복사하지 않아도 됩니다.

```ts
function first(list: Todo[]): Todo | undefined {
  return list[0];
}
// User에도 같은 함수가 필요하면 복사해야 합니다

function first<T>(list: T[]): T | undefined {
  return list[0];
}

first(todos); // Todo | undefined
first(users); // User | undefined
```

`T`는 호출할 때 인자에서 추론되므로 보통 직접 적지 않습니다.

`any`와의 차이는 **연결이 유지된다**는 점입니다.

```ts
function firstAny(list: any[]): any {
  return list[0];
}

const todo = firstAny(todos); // any — 이후 모든 검사가 사라집니다
const todo2 = first(todos); // Todo | undefined
```

타입이 둘 이상 필요하면 늘립니다.

```ts
function toMap<T, K extends string | number>(
  list: T[],
  getKey: (item: T) => K,
): Map<K, T> {
  return new Map(list.map((item) => [getKey(item), item]));
}

const byId = toMap(todos, (todo) => todo.id); // Map<number, Todo>
```

## 제약 조건

`extends`로 "최소한 이건 갖고 있어야 한다"를 적습니다.

```ts
function getLength<T>(value: T): number {
  return value.length; // 오류: T에 length가 있는지 모릅니다
}

function getLength<T extends { length: number }>(value: T): number {
  return value.length; // 통과
}

getLength("abc"); // 3
getLength([1, 2]); // 2
getLength(1); // 오류: number에는 length가 없습니다
```

제약을 두면 반환 타입도 구체적으로 유지됩니다.

```ts
function withId<T extends { id: number }>(item: T): T {
  return item;
}

withId(todo).title; // Todo의 속성이 그대로 남아 있습니다
```

## keyof

객체 타입의 키들을 유니온으로 꺼냅니다.

```ts
interface Todo {
  id: number;
  title: string;
  done: boolean;
}

type TodoKey = keyof Todo; // "id" | "title" | "done"
```

속성 이름을 받는 함수에서 오타를 막는 데 씁니다.

```ts
function pluck<T, K extends keyof T>(list: T[], key: K): T[K][] {
  return list.map((item) => item[key]);
}

pluck(todos, "title"); // string[]
pluck(todos, "id"); // number[]
pluck(todos, "titel"); // 오류: Todo에 없는 키입니다
```

## 인덱스 접근 타입

속성 하나의 타입을 꺼냅니다.

```ts
type Title = Todo["title"]; // string
type Value = Todo[keyof Todo]; // number | string | boolean
```

배열에서 요소 타입을 꺼낼 때도 씁니다.

```ts
const STATUS = ["todo", "done"] as const;

type Status = (typeof STATUS)[number]; // "todo" | "done"
```

값으로 정의한 목록에서 타입을 뽑아내면, 목록을 고칠 때 타입이 따라옵니다. 둘을 따로 관리하다 어긋나는 일이 없어집니다.

## 매핑된 타입과 조건부 타입

매핑된 타입은 기존 타입의 키를 돌면서 새 타입을 만듭니다.

```ts
type Optional<T> = {
  [K in keyof T]?: T[K];
};

type Flags<T> = {
  [K in keyof T]: boolean;
};

type TodoFlags = Flags<Todo>; // { id: boolean; title: boolean; done: boolean }
```

수식어를 붙이거나 떼어 낼 수 있습니다.

```ts
type Mutable<T> = {
  -readonly [K in keyof T]: T[K]; // readonly 제거
};

type Required<T> = {
  [K in keyof T]-?: T[K]; // 선택 속성 제거
};
```

조건부 타입은 타입 수준의 삼항 연산자입니다.

```ts
type ElementOf<T> = T extends (infer U)[] ? U : T;

type A = ElementOf<string[]>; // string
type B = ElementOf<number>; // number
```

`infer`는 조건이 맞을 때 그 자리의 타입에 이름을 붙여 꺼내는 문법입니다.

```ts
type Unwrap<T> = T extends Promise<infer U> ? U : T;

type C = Unwrap<Promise<Todo>>; // Todo
```

처음부터 이것들을 직접 쓸 일은 많지 않습니다. 다만 아래 유틸리티 타입들이 이 문법으로 만들어져 있어서, 동작을 이해하는 데 도움이 됩니다.

## 유틸리티 타입

자주 쓰는 변환은 기본으로 제공됩니다.

```ts
Partial<Todo>; // 모든 속성을 선택적으로
Required<Todo>; // 모든 속성을 필수로
Readonly<Todo>; // 모든 속성을 읽기 전용으로

Pick<Todo, "id" | "title">; // 고른 속성만
Omit<Todo, "id">; // 뺀 나머지

Record<string, Todo>; // 키와 값 타입으로 객체 만들기

ReturnType<typeof parse>; // 함수의 반환 타입
Parameters<typeof parse>; // 함수의 매개변수 타입들
Awaited<ReturnType<typeof load>>; // Promise를 벗긴 결과
```

실제로 쓰이는 자리는 이런 곳입니다.

```ts
// 수정 요청은 일부만 보냅니다
function update(id: number, patch: Partial<Omit<Todo, "id">>) {}

update(1, { done: true }); // 통과
update(1, { id: 2 }); // 오류: id는 바꿀 수 없습니다
```

```ts
// 서버로 보낼 때는 아직 id가 없습니다
type NewTodo = Omit<Todo, "id">;

function create(todo: NewTodo): Promise<Todo> {}
```

기존 타입에서 파생시켜 두면 원본이 바뀔 때 함께 따라옵니다. `Todo`에 속성을 하나 더하면 `NewTodo`에도 자동으로 들어갑니다. 두 타입을 각각 손으로 적어 두면 한쪽만 고치고 지나가기 쉽습니다.
