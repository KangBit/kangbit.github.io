---
title: 프론트엔드 04. JavaScript 기초
description: 화면과 분리된 데이터와 로직을 다루는 언어 기본기를 익힙니다.
outline: deep
---

# 04. JavaScript 기초

화면을 건드리기 전에, 데이터를 다루는 코드를 따로 쓸 수 있어야 합니다. 그 기본기를 정리합니다.

::: tip
이 단계의 내용은 [JavaScript 로드맵](/learn/languages/javascript/)에서 더 깊게 다룹니다. 여기서는 프론트엔드 작업에서 특히 자주 부딪히는 것들을 모았습니다.
:::

## 값과 타입, 변수

`const`를 기본으로 두고 재할당이 필요할 때만 `let`을 씁니다. `var`는 블록을 무시해서 쓰지 않습니다.

```js
const title = "공부";
let count = 0;
```

`const`가 막는 것은 재할당이지 내용 변경이 아닙니다.

```js
const todo = { done: false };
todo.done = true;   // 가능합니다
```

조건문에서 거짓으로 취급되는 값은 여덟 개뿐입니다.

```
false, 0, -0, 0n, "", null, undefined, NaN
```

`0`과 빈 문자열이 여기 들어가서, 기본값 처리에서 자주 사고가 납니다.

```js
const count = 0;

count || 10;   // 10  ← 0을 값으로 인정하지 않습니다
count ?? 10;   // 0   ← null과 undefined일 때만
```

API 응답의 개수가 0일 때, 입력창이 비었을 때가 실제로 문제가 되는 지점입니다.

비교는 `===`를 씁니다. `==`의 변환 규칙은 예측하기 어렵습니다.

```js
"" == 0;          // true
[] == false;      // true
null == undefined; // true  ← 이것만 의도적으로 쓰기도 합니다
```

## 배열과 객체, 데이터 변환과 불변성

화면을 그리는 코드와 데이터를 바꾸는 코드를 나누려면, **원본을 바꾸지 않고 새 값을 만드는** 방식이 편합니다.

```js
// 추가
const next = [...todos, newTodo];

// 삭제
const next = todos.filter((todo) => todo.id !== id);

// 수정
const next = todos.map((todo) =>
  todo.id === id ? { ...todo, done: true } : todo,
);
```

원본을 바꾸는 메서드와 새 값을 주는 메서드를 구분해야 합니다.

| 원본을 바꿈 | 새 배열을 반환 |
| --- | --- |
| `push` `splice` `sort` `reverse` | `map` `filter` `slice` `concat` `toSorted` |

```js
const sorted = todos.sort();        // todos 자체가 바뀝니다
const sorted = todos.toSorted();    // todos는 그대로
```

스프레드는 **한 겹만** 복사합니다.

```js
const copy = { ...state };
copy.filter.status = "done";   // 원본의 filter도 바뀝니다
```

중첩된 상태를 다룰 때 "분명 복사했는데 원본이 바뀐다"의 원인이 대부분 이것입니다. 깊게 끊으려면 `structuredClone`을 쓰거나 상태 구조를 얕게 설계합니다.

자주 쓰는 변환입니다.

```js
todos.find((todo) => todo.id === id);
todos.some((todo) => !todo.done);
todos.every((todo) => todo.done);

const byId = Object.fromEntries(todos.map((todo) => [todo.id, todo]));
const unique = [...new Set(tags)];
```

## 스코프, 클로저와 this

클로저는 함수가 **선언된 위치의 변수를 기억하는** 성질입니다. 이벤트 핸들러가 바깥 변수를 계속 볼 수 있는 이유입니다.

```js
function createCounter() {
  let count = 0;
  return () => (count += 1);
}

const increase = createCounter();
increase();   // 1
increase();   // 2
```

`this`는 선언 위치가 아니라 **호출 방식**으로 정해집니다. 콜백으로 넘기면 잃어버립니다.

```js
const app = {
  count: 0,

  broken() {
    button.addEventListener("click", function () {
      this.count += 1;   // this가 button입니다
    });
  },

  works() {
    button.addEventListener("click", () => {
      this.count += 1;   // 화살표는 바깥 this를 씁니다
    });
  },
};
```

이벤트 핸들러에는 화살표 함수를 쓰는 것이 기본입니다. 다만 일반 함수로 쓰면 `this`가 이벤트가 걸린 요소가 되므로, 그것이 필요할 때는 일반 함수가 편합니다.

## 모듈의 import와 export

파일을 나누고 필요한 것만 가져옵니다.

```js
// todo.js
export function addTodo(list, title) {
  const trimmed = title.trim();
  if (!trimmed) throw new Error("제목이 비어 있습니다");
  return [...list, { id: crypto.randomUUID(), title: trimmed, done: false }];
}

export function filterTodos(list, status) {
  if (status === "all") return list;
  return list.filter((todo) => todo.done === (status === "done"));
}
```

```js
// main.js
import { addTodo, filterTodos } from "./todo.js";
```

브라우저에서 모듈을 쓰려면 타입을 지정합니다.

```html
<script type="module" src="/main.js"></script>
```

모듈은 자동으로 엄격 모드이고 `defer`처럼 동작합니다. 최상위에서 `await`도 쓸 수 있습니다.

필요한 시점에 받아 오려면 동적 `import`를 씁니다. 초기 로딩에서 무거운 코드를 떼어 내는 방법입니다.

```js
editButton.addEventListener("click", async () => {
  const { openEditor } = await import("./editor.js");
  openEditor();
});
```

## 화면과 로직 분리하기

이 단계의 목표는 **DOM을 모르는 함수**를 쓸 수 있게 되는 것입니다.

```js
// todo.js — 브라우저가 없어도 실행됩니다
export function addTodo(list, title) { }
export function filterTodos(list, status) { }
export function countUndone(list) { }
```

```js
// view.js — 화면만 담당합니다
import { addTodo, filterTodos } from "./todo.js";

let todos = [];
let filter = "all";

function render() {
  list.innerHTML = "";
  for (const todo of filterTodos(todos, filter)) {
    list.append(createItem(todo));
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  todos = addTodo(todos, input.value);
  render();
});
```

로직이 분리되어 있으면 브라우저를 띄우지 않고 테스트할 수 있고, 나중에 프레임워크로 옮길 때도 그대로 가져갑니다.

## 오류 처리와 디버거 사용

예상 가능한 실패와 예상 못 한 버그를 구분합니다.

```js
try {
  todos = addTodo(todos, input.value);
} catch (error) {
  showMessage(error.message);   // 사용자에게 보여 줄 수 있는 실패
}
```

`catch`로 잡고 아무것도 하지 않는 것이 가장 나쁩니다. 문제가 조용히 사라지고 나중에 엉뚱한 곳에서 터집니다.

`console.log`보다 디버거가 빠를 때가 많습니다. Sources 탭에서 줄 번호를 클릭해 중단점을 걸면 그 시점의 모든 변수를 볼 수 있습니다.

```js
debugger;   // 코드에서 직접 멈출 수도 있습니다
```

조건부 중단점(중단점 우클릭 → Edit breakpoint)을 쓰면 특정 상황에서만 멈출 수 있습니다. 반복문 안을 들여다볼 때 유용합니다.

로그를 쓸 때도 쓸모 있는 형태가 있습니다.

```js
console.log({ todos, filter });   // 변수 이름이 함께 찍힙니다
console.table(todos);
console.trace();                  // 여기까지 어떻게 왔는지
```
