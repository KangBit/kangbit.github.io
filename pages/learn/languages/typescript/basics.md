---
title: TypeScript 01. 준비와 기본 타입
description: 타입 검사와 실행의 차이를 확인하고 기본 타입과 추론을 익힙니다.
outline: deep
---

# 01. 준비와 기본 타입

TypeScript가 언제 무엇을 검사하는지 확인하고, 기본 타입을 정리합니다.

## JavaScript 기초 복습

TypeScript는 JavaScript에 타입 표기를 더한 언어입니다. 문법과 런타임 동작은 그대로이므로, [JavaScript 로드맵](/learn/languages/javascript/)의 내용이 모두 유효합니다.

타입은 `0`이 falsy인 것도, `0.1 + 0.2`가 딱 떨어지지 않는 것도 바꾸지 않습니다. 타입이 막아 주는 것은 **잘못된 값을 넣는 실수**뿐입니다.

## 컴파일과 실행의 차이

타입은 **검사가 끝나면 사라집니다.** 컴파일 결과에는 타입 표기가 남지 않습니다.

```ts
interface Todo {
  id: number;
  title: string;
}

function render(todo: Todo): string {
  return todo.title;
}
```

위 코드가 컴파일되면 다음이 됩니다.

```js
function render(todo) {
  return todo.title;
}
```

그래서 **런타임에는 타입으로 분기할 수 없습니다.**

```ts
function handle(value: string | number) {
  if (value instanceof string) {} // 오류: 'string'은 값이 아닙니다
  if (typeof value === "string") {} // 가능: typeof는 런타임 연산자입니다
}
```

타입 오류가 있어도 JavaScript는 생성됩니다. 검사와 실행이 별개이기 때문입니다.

```bash
tsc --noEmit   # 검사만 하고 파일을 만들지 않습니다
```

외부에서 들어온 데이터가 선언한 타입과 다르면 타입 검사는 통과하고 런타임에서 깨집니다. 이 문제는 [05. 프로젝트 적용과 경계 검증](/learn/languages/typescript/boundaries)에서 다룹니다.

## tsconfig의 주요 옵션

프로젝트의 검사 강도와 출력 방식을 정합니다.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

| 옵션 | 역할 |
| --- | --- |
| `target` | 어떤 문법 수준으로 변환할지 |
| `strict` | 아래 엄격 검사들을 한 번에 켭니다 |
| `noUncheckedIndexedAccess` | 배열·객체 인덱스 접근 결과에 `undefined`를 포함시킵니다 |
| `noEmit` | 검사만 하고 출력하지 않습니다 |
| `skipLibCheck` | 의존성의 타입 선언 검사를 건너뜁니다 |

`strict`는 처음부터 켜는 편이 낫습니다. 나중에 켜면 쌓인 오류를 한꺼번에 마주하게 됩니다.

`noUncheckedIndexedAccess`는 기본으로 꺼져 있지만 실수를 많이 잡아 줍니다.

```ts
const list = ["a", "b"];

const item = list[10]; // 옵션이 꺼져 있으면 string, 켜져 있으면 string | undefined
item.toUpperCase(); // 켜져 있으면 여기서 오류를 잡습니다
```

## 타입 추론

대부분은 직접 쓰지 않아도 됩니다. TypeScript가 값에서 타입을 읽어 냅니다.

```ts
const title = "공부"; // "공부"  — const는 리터럴 타입으로 좁혀집니다
let name = "bit"; // string  — let은 넓혀집니다

const list = [1, 2, 3]; // number[]
const mixed = [1, "a"]; // (string | number)[]
```

반환 타입도 추론됩니다.

```ts
function add(a: number, b: number) {
  return a + b; // number로 추론됩니다
}
```

**매개변수는 추론되지 않으므로** 직접 써야 합니다. 그 외에는 추론에 맡기고, 공개 API처럼 계약을 고정하고 싶은 곳에만 반환 타입을 명시합니다.

```ts
export function parse(text: string): number | null {
  const value = Number(text);
  return Number.isNaN(value) ? null : value;
}
```

반환 타입을 적어 두면 구현을 고치다 실수로 다른 것을 반환할 때 그 함수 안에서 오류가 납니다. 적지 않으면 그 함수를 쓰는 먼 곳에서 오류가 터집니다.

## 기본 타입과 배열

```ts
const title: string = "공부";
const count: number = 1;
const done: boolean = false;

const list: string[] = ["a", "b"];
const pairs: Array<number> = [1, 2]; // 같은 뜻입니다

const point: [number, number] = [0, 0]; // 튜플 — 길이와 자리별 타입이 고정
```

`any`는 모든 검사를 끕니다. 쓰는 순간 그 값이 거쳐 가는 모든 곳에서 타입이 사라지므로, 모르는 값에는 `unknown`을 씁니다.

```ts
const a: any = JSON.parse(text);
a.whatever.deeply.nested; // 오류가 나지 않습니다

const u: unknown = JSON.parse(text);
u.title; // 오류 — 먼저 확인해야 합니다
```

`unknown`을 쓰는 방법은 [03. 유니온과 타입 좁히기](/learn/languages/typescript/narrowing)에서 이어집니다.

값이 없음을 나타내는 타입도 구분됩니다.

```ts
function log(message: string): void {} // 반환값을 쓰지 않음
function fail(message: string): never {
  throw new Error(message);
} // 정상적으로 끝나지 않음
```
