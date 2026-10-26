---
title: TypeScript 05. 프로젝트 적용과 경계 검증
description: 엄격한 검사를 켜고 외부에서 들어오는 데이터를 안전하게 받아들입니다.
outline: deep
---

# 05. 프로젝트 적용과 경계 검증

실제 코드베이스에 적용할 때 정해야 하는 것들과, 타입이 보장해 주지 못하는 지점을 정리합니다.

## 엄격한 타입 검사

`strict`는 여러 검사를 한 번에 켭니다. 그중 체감이 큰 것들입니다.

| 옵션 | 잡아 주는 것 |
| --- | --- |
| `strictNullChecks` | `null`·`undefined`를 구분하지 않고 쓰는 코드 |
| `noImplicitAny` | 타입을 적지 않아 `any`가 되어 버린 자리 |
| `strictFunctionTypes` | 콜백 매개변수 타입이 어긋나는 대입 |
| `strictPropertyInitialization` | 생성자에서 초기화하지 않은 클래스 필드 |

이미 큰 JavaScript 프로젝트를 옮기는 중이라면 한 번에 켜기 어렵습니다. 파일 단위로 미뤄 두는 방법이 있습니다.

```ts
// @ts-nocheck  — 이 파일 전체를 검사하지 않습니다
```

```ts
// @ts-expect-error 나중에 타입을 정리할 것
const value = legacy.doSomething();
```

`@ts-expect-error`는 `@ts-ignore`보다 낫습니다. **오류가 사라지면 그 주석 자체가 오류**가 되어, 남아 있는 억제 주석을 치울 수 있습니다.

## 모듈과 모듈 해석 방식

`moduleResolution`은 `import` 경로를 실제 파일로 찾아가는 규칙을 정합니다. 어떤 환경에서 도는지에 따라 달라집니다.

| 값 | 쓰는 곳 |
| --- | --- |
| `bundler` | Vite·웹팩 등 번들러를 쓰는 프로젝트 |
| `node16` / `nodenext` | Node.js에서 직접 실행 |

Node.js에서 ESM으로 실행할 때는 **확장자를 적어야** 합니다. 번들러를 쓸 때는 생략해도 됩니다.

```ts
import { addTodo } from "./todo.js"; // nodenext
import { addTodo } from "./todo"; // bundler
```

경로가 길어지면 별칭을 둡니다. TypeScript와 번들러 양쪽에 같은 설정이 필요합니다.

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

타입만 가져올 때는 `import type`을 쓰면 컴파일 결과에서 완전히 사라집니다.

```ts
import type { Todo } from "./todo";
import { addTodo, type Todo } from "./todo"; // 섞어 쓰기
```

## 타입 선언과 선언 병합

타입 정의가 없는 패키지는 별도 선언을 설치하거나 직접 만듭니다.

```bash
npm i -D @types/some-package
```

```ts
// types/some-package.d.ts
declare module "some-package" {
  export function doSomething(input: string): number;
}
```

전역에 무언가를 얹었다면 선언을 추가합니다. `interface`는 같은 이름의 선언이 합쳐지는 성질이 있습니다.

```ts
// types/global.d.ts
declare global {
  interface Window {
    myApp: { version: string };
  }
}

export {};
```

```ts
window.myApp.version; // 타입이 잡힙니다
```

선언 파일은 **실행되는 코드가 아니라 설명서**입니다. 실제로 그 값이 있는지는 검사하지 않습니다. 설명이 틀리면 타입은 통과하고 런타임에서 깨집니다.

## 외부 데이터의 런타임 검증

여기가 TypeScript의 한계가 드러나는 지점입니다. 타입은 컴파일 후 사라지므로, **밖에서 들어온 값은 아무도 확인하지 않습니다.**

```ts
async function load(): Promise<Todo[]> {
  const response = await fetch("/api/todos");
  return response.json(); // any를 Todo[]라고 선언했을 뿐입니다
}
```

서버가 `title` 대신 `name`을 보내도 컴파일은 통과합니다. 오류는 한참 뒤 화면을 그리는 곳에서 터지고, 원인을 찾기 어렵습니다.

타입 단언은 상황을 더 나쁘게 만듭니다.

```ts
const todos = (await response.json()) as Todo[]; // 확인 없이 믿겠다는 선언
```

경계에서 한 번 확인하고 내부 모델로 바꿔서 넘겨야 합니다.

```ts
function parseTodo(value: unknown): Todo {
  if (typeof value !== "object" || value === null) {
    throw new Error("객체가 아닙니다");
  }

  const { id, title, done } = value as Record<string, unknown>;

  if (typeof id !== "number") throw new Error("id가 숫자가 아닙니다");
  if (typeof title !== "string") throw new Error("title이 문자열이 아닙니다");

  return { id, title, done: Boolean(done) };
}

async function load(): Promise<Todo[]> {
  const response = await fetch("/api/todos");

  if (!response.ok) throw new Error(`요청 실패: ${response.status}`);

  const data: unknown = await response.json();

  if (!Array.isArray(data)) throw new Error("배열이 아닙니다");

  return data.map(parseTodo);
}
```

손으로 쓰면 길어지므로 보통 스키마 라이브러리를 씁니다. 스키마 하나로 검증과 타입을 함께 얻습니다.

```ts
import { z } from "zod";

const TodoSchema = z.object({
  id: z.number(),
  title: z.string(),
  done: z.boolean(),
});

type Todo = z.infer<typeof TodoSchema>; // 스키마에서 타입을 뽑습니다

const todos = z.array(TodoSchema).parse(await response.json());
```

검증이 필요한 곳은 API 응답만이 아닙니다.

- `localStorage`에서 읽은 JSON — 예전 버전이 남아 있을 수 있습니다
- URL 쿼리 파라미터와 라우트 파라미터 — 사용자가 직접 고칠 수 있습니다
- 폼 입력값과 환경 변수 — `process.env`는 전부 `string | undefined`입니다
- 파일에서 읽은 설정

바깥에서 안으로 들어오는 모든 자리에 한 번씩 관문을 두고, 그 안쪽에서는 타입을 믿고 쓰는 것이 기준입니다.
