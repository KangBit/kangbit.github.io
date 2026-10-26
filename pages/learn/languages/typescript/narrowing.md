---
title: TypeScript 03. 유니온과 타입 좁히기
description: 여러 형태를 가질 수 있는 값을 표현하고 안전하게 다루는 방법을 익힙니다.
outline: deep
---

# 03. 유니온과 타입 좁히기

값이 여러 형태 중 하나일 때, 그것을 표현하고 확인한 뒤 쓰는 방법을 정리합니다.

## 리터럴 타입

값 자체를 타입으로 쓸 수 있습니다.

```ts
type Status = "todo" | "done";

let status: Status = "todo";
status = "doing"; // 오류: "doing"은 Status가 아닙니다
```

문자열을 그대로 쓰는 것보다 오타를 잡아 주고, 자동 완성이 가능한 값을 보여 줍니다.

객체 안에서는 `as const`가 있어야 리터럴로 유지됩니다.

```ts
const a = { status: "todo" }; // { status: string }
const b = { status: "todo" } as const; // { readonly status: "todo" }

function setStatus(status: Status) {}
setStatus(a.status); // 오류: string은 Status가 아닙니다
setStatus(b.status); // 통과
```

## 유니온

여러 타입 중 하나라는 뜻입니다.

```ts
type Id = string | number;

function print(id: Id) {
  id.toUpperCase(); // 오류: number에는 없습니다
}
```

유니온에 대해서는 **모든 구성원이 공통으로 가진 것만** 바로 쓸 수 있습니다. 나머지는 어느 쪽인지 확인한 뒤에 써야 합니다.

## 타입 가드

확인하는 방법은 JavaScript의 평범한 조건문입니다. TypeScript가 그 결과를 읽어 타입을 좁힙니다.

```ts
function print(id: string | number) {
  if (typeof id === "string") {
    id.toUpperCase(); // 여기서 id는 string
  } else {
    id.toFixed(); // 여기서 id는 number
  }
}
```

상황에 따라 쓰는 검사가 다릅니다.

```ts
typeof value === "string"; // 원시 타입
value instanceof Date; // 클래스 인스턴스
Array.isArray(value); // 배열
"title" in value; // 속성 존재 여부
```

직접 만든 검사를 타입 가드로 쓰려면 반환 타입을 `값 is 타입`으로 적습니다.

```ts
function isTodo(value: unknown): value is Todo {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "title" in value
  );
}

if (isTodo(data)) {
  data.title; // Todo로 좁혀집니다
}
```

이 표기는 **약속일 뿐 검증되지 않습니다.** 함수가 거짓말을 해도 컴파일러는 그대로 믿습니다. 조건을 실제 타입과 맞게 쓰는 것은 작성자의 몫입니다.

## 판별 유니온

여러 형태를 다룰 때 가장 자주 쓰는 모양입니다. 공통된 자리에 서로 다른 리터럴을 두고, 그것으로 구분합니다.

```ts
type Result =
  | { status: "loading" }
  | { status: "success"; todos: Todo[] }
  | { status: "error"; message: string };

function render(result: Result) {
  switch (result.status) {
    case "loading":
      return "불러오는 중";
    case "success":
      return result.todos.length; // todos가 여기에만 있습니다
    case "error":
      return result.message;
  }
}
```

성공했을 때만 데이터가 있고 실패했을 때만 메시지가 있다는 규칙이 **타입에 적혀** 있습니다. 로딩 중에 `todos`를 읽는 코드는 컴파일되지 않습니다.

속성을 전부 선택적으로 두면 이 보호가 사라집니다.

```ts
// 권장하지 않는 모양
interface BadResult {
  loading?: boolean;
  todos?: Todo[];
  message?: string;
}
```

위 타입은 로딩 중이면서 에러이고 데이터도 있는 상태를 허용합니다. 실제로는 불가능한 조합인데 타입이 막지 않습니다.

## unknown과 never

`unknown`은 "무엇이든 올 수 있다"입니다. 확인하기 전에는 아무것도 할 수 없어서 `any`보다 안전합니다.

```ts
function handle(value: unknown) {
  value.length; // 오류

  if (typeof value === "string") {
    value.length; // 통과
  }
}
```

`catch`로 잡은 값도 `unknown`입니다. 던져진 것이 `Error`라는 보장이 없기 때문입니다.

```ts
try {
  await load();
} catch (error) {
  console.error(error.message); // 오류: unknown입니다

  if (error instanceof Error) {
    console.error(error.message); // 통과
  }
}
```

`never`는 "값이 있을 수 없다"입니다. 모든 경우를 다뤘는지 확인하는 데 씁니다.

```ts
function render(result: Result): string {
  switch (result.status) {
    case "loading":
      return "불러오는 중";
    case "success":
      return `${result.todos.length}건`;
    case "error":
      return result.message;
    default: {
      const unreachable: never = result;
      throw new Error(`처리하지 않은 상태: ${unreachable}`);
    }
  }
}
```

나중에 `Result`에 새 형태를 추가하면 `default`에서 **컴파일 오류가 납니다.** 빠뜨린 분기를 바로 찾을 수 있습니다.

## null 처리

`strictNullChecks`가 켜져 있으면 `null`과 `undefined`는 따로 허용해야 합니다.

```ts
function find(id: number): Todo | undefined {
  return todos.find((todo) => todo.id === id);
}

const todo = find(1);
todo.title; // 오류
```

처리하는 방법은 세 가지입니다.

```ts
// 1. 먼저 확인하고 빠져나가기
if (!todo) return;
todo.title;

// 2. 기본값 두기
const title = todo?.title ?? "제목 없음";

// 3. 없을 수 없다고 단언하기 — 권장하지 않습니다
todo!.title;
```

`!`는 검사를 끄는 것이지 안전을 보장하지 않습니다. 가정이 깨지면 그대로 런타임 오류가 됩니다. 가능하면 조건문으로 좁히고, 꼭 써야 한다면 왜 없을 수 없는지 주석으로 남깁니다.

좁혀진 타입은 **중간에 풀릴 수 있습니다.** 함수 호출을 거치면 컴파일러는 값이 그대로인지 알 수 없습니다.

```ts
if (todo.memo) {
  update(); // 이 안에서 memo를 비웠을지 알 수 없습니다
  todo.memo.length; // 오류
}

const memo = todo.memo; // 지역 변수에 담으면 유지됩니다
if (memo) {
  update();
  memo.length; // 통과
}
```
