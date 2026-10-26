---
title: JavaScript 05. 모듈과 검증
description: 코드를 모듈로 나누고 패키지와 도구로 품질을 확인하는 방법을 익힙니다.
outline: deep
---

# 05. 모듈과 검증

코드를 파일 단위로 나누고, 바뀌어도 깨지지 않는지 확인하는 방법을 정리합니다.

## import와 export

이름을 붙여 내보내는 방식과 기본으로 내보내는 방식이 있습니다.

```js
// todo.js
export const STATUS = ["todo", "done"];

export function addTodo(list, title) {
  return [...list, { id: Date.now(), title, done: false }];
}

export default function createStore() {}
```

```js
// main.js
import createStore, { addTodo, STATUS } from "./todo.js";
import { addTodo as append } from "./todo.js"; // 이름 바꾸기
import * as todo from "./todo.js"; // 전부 묶어서
```

이름을 붙여 내보내면 가져오는 쪽에서 이름을 바꿀 수 없어, 어디서 왔는지 찾기 쉽고 오타를 바로 잡아 줍니다. 기본 내보내기는 가져오는 쪽이 마음대로 이름을 정하므로 같은 함수가 파일마다 다른 이름으로 불릴 수 있습니다.

모듈은 처음 평가될 때 한 번만 실행되고 결과가 공유됩니다.

```js
// config.js
console.log("평가");
export const config = { debug: true };
```

```js
import { config } from "./config.js";
import { config as again } from "./config.js";

// "평가"는 한 번만 출력되고, config와 again은 같은 객체입니다
```

필요한 시점에 불러오려면 동적 `import`를 씁니다. Promise를 반환합니다.

```js
button.addEventListener("click", async () => {
  const { openEditor } = await import("./editor.js");
  openEditor();
});
```

## 모듈별 책임 분리

한 파일이 데이터 가공과 화면 조작을 같이 하면 테스트하기 어려워집니다. 화면을 모르는 순수한 로직을 따로 떼어 둡니다.

```js
// todo.js — 화면을 모릅니다. 입력과 출력만 있습니다.
export function addTodo(list, title) {
  const trimmed = title.trim();
  if (!trimmed) throw new Error("제목이 비어 있습니다");

  return [...list, { id: Date.now(), title: trimmed, done: false }];
}

export function filterTodos(list, filter) {
  if (filter === "done") return list.filter((todo) => todo.done);
  if (filter === "todo") return list.filter((todo) => !todo.done);
  return list;
}
```

```js
// view.js — 화면만 담당합니다
import { addTodo, filterTodos } from "./todo.js";

let todos = [];

form.addEventListener("submit", (event) => {
  event.preventDefault();
  todos = addTodo(todos, input.value);
  render(filterTodos(todos, currentFilter));
});
```

`todo.js`는 브라우저 없이도 호출할 수 있으므로 그대로 테스트할 수 있습니다.

## 패키지 관리

`package.json`이 프로젝트의 이름과 실행 명령, 의존성을 담습니다.

```json
{
  "name": "todo",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "test": "vitest"
  },
  "dependencies": {
    "dayjs": "^1.11.20"
  },
  "devDependencies": {
    "vitest": "^2.1.0"
  }
}
```

`dependencies`는 실행에 필요한 것, `devDependencies`는 개발할 때만 쓰는 것입니다. 배포 결과물에 테스트 도구가 섞이지 않도록 구분합니다.

버전 앞의 기호가 올려 받을 범위를 정합니다.

| 표기 | 허용 범위 |
| --- | --- |
| `^1.11.20` | `1.x.x` 안에서 최신 |
| `~1.11.20` | `1.11.x` 안에서 최신 |
| `1.11.20` | 정확히 그 버전 |

범위가 있으면 설치 시점에 따라 다른 버전이 깔릴 수 있습니다. `package-lock.json`이나 `pnpm-lock.yaml`이 실제로 설치된 버전을 고정하므로, 이 파일은 반드시 저장소에 함께 둡니다.

## 코드 포맷과 정적 분석

둘은 역할이 다릅니다.

- **포맷터**(Prettier): 줄바꿈, 따옴표, 들여쓰기 같은 **모양**을 통일합니다. 동작은 바꾸지 않습니다.
- **정적 분석기**(ESLint): 실행하지 않고 코드를 읽어 **문제가 될 패턴**을 찾습니다. 쓰지 않는 변수, 빠뜨린 `await`, 잘못된 비교 같은 것들입니다.

```bash
npx eslint .
npx prettier --write .
```

명령으로 정리해 두면 리뷰에서 모양을 두고 이야기할 일이 줄어듭니다.

## 단위 테스트

화면 없이 호출할 수 있는 함수부터 테스트합니다. 준비하고, 실행하고, 확인하는 세 단계로 씁니다.

```js
// todo.test.js
import { describe, it, expect } from "vitest";
import { addTodo, filterTodos } from "./todo.js";

describe("addTodo", () => {
  it("목록 끝에 새 항목을 추가한다", () => {
    const list = [{ id: 1, title: "공부", done: false }];

    const result = addTodo(list, "운동");

    expect(result).toHaveLength(2);
    expect(result[1].title).toBe("운동");
  });

  it("원본 목록을 바꾸지 않는다", () => {
    const list = [];

    addTodo(list, "운동");

    expect(list).toHaveLength(0);
  });

  it("제목이 비어 있으면 오류를 던진다", () => {
    expect(() => addTodo([], "   ")).toThrow();
  });
});
```

테스트할 가치가 있는 것은 **규칙**입니다. 빈 제목을 막는지, 원본을 바꾸지 않는지, 필터가 맞는 항목만 남기는지 같은 것들입니다. 단순히 값을 넣고 꺼내는 코드까지 전부 덮을 필요는 없습니다.

성공뿐 아니라 실패하는 경우도 함께 씁니다. 잘못된 입력에서 어떻게 동작하기로 했는지가 테스트에 적혀 있으면, 나중에 그 부분을 고칠 때 의도를 다시 읽을 수 있습니다.
