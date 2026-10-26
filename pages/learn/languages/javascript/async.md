---
title: JavaScript 04. 비동기 처리
description: 호출 스택과 이벤트 루프를 이해하고 Promise와 async/await로 순서와 실패를 다룹니다.
outline: deep
---

# 04. 비동기 처리

실행 순서가 왜 그렇게 정해지는지 확인하고, 여러 작업의 순서와 실패를 다루는 방법을 정리합니다.

## 호출 스택

JavaScript는 한 번에 하나씩 실행합니다. 함수를 호출하면 스택에 쌓이고 끝나면 빠집니다.

```js
function third() {
  throw new Error("실패");
}
function second() {
  third();
}
function first() {
  second();
}

first();
// Error: 실패
//     at third
//     at second
//     at first
```

오류 메시지의 스택 추적은 이 쌓인 순서를 아래에서 위로 보여 줍니다.

스택이 비지 않으면 다른 일을 할 수 없습니다. 무거운 계산이 화면을 멈추게 하는 이유입니다.

```js
function block() {
  const end = Date.now() + 3000;
  while (Date.now() < end) {} // 3초 동안 클릭도 스크롤도 반응하지 않습니다
}
```

## 이벤트 루프

스택이 비면 대기열에서 다음 작업을 가져옵니다. 이때 대기열이 **두 종류**라는 점이 중요합니다.

- 마이크로태스크: Promise의 `then`, `queueMicrotask`
- 태스크: `setTimeout`, 이벤트 핸들러

마이크로태스크가 먼저이고, 비워질 때까지 태스크로 넘어가지 않습니다.

```js
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => console.log("3"));

console.log("4");

// 1 4 3 2
```

`setTimeout(fn, 0)`은 "즉시"가 아니라 "스택이 비고 마이크로태스크까지 다 끝난 뒤"입니다.

## Promise

Promise는 아직 끝나지 않은 작업의 결과를 담는 객체입니다. 상태는 셋 중 하나이고 한 번 정해지면 바뀌지 않습니다.

```
pending → fulfilled   또는   pending → rejected
```

```js
const promise = new Promise((resolve, reject) => {
  if (ok) resolve(결과);
  else reject(new Error("실패"));
});

promise
  .then((value) => value * 2) // 반환값이 다음 then으로 전달됩니다
  .catch((error) => console.error(error))
  .finally(() => console.log("성공이든 실패든 실행"));
```

체인 중간에서 오류가 나면 뒤따르는 `then`을 건너뛰고 가장 가까운 `catch`로 갑니다.

```js
fetchTodos()
  .then(() => {
    throw new Error("중간 실패");
  })
  .then(() => console.log("실행되지 않습니다"))
  .catch((error) => console.error(error.message)); // "중간 실패"
```

## async/await

`async` 함수는 항상 Promise를 반환하고, `await`는 그 결과가 나올 때까지 함수 실행을 멈춥니다.

```js
async function load() {
  const response = await fetch("/api/todos");
  const todos = await response.json();
  return todos;
}
```

오류는 `try/catch`로 받습니다.

```js
async function load() {
  try {
    const response = await fetch("/api/todos");

    if (!response.ok) {
      throw new Error(`요청 실패: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}
```

`fetch`는 404나 500에도 거부되지 않습니다. 네트워크 자체가 실패했을 때만 거부되므로, 상태 코드는 `response.ok`로 직접 확인해야 합니다.

### 순차와 병렬

서로 관계없는 작업을 `await`로 줄줄이 쓰면 불필요하게 기다립니다.

```js
// 순차 — 합계 2초
const todos = await fetchTodos(); // 1초
const users = await fetchUsers(); // 1초

// 병렬 — 합계 1초
const [todos, users] = await Promise.all([fetchTodos(), fetchUsers()]);
```

뒤 작업이 앞 결과를 필요로 할 때만 순차로 둡니다.

## all, race와 allSettled

| 메서드 | 끝나는 시점 | 하나가 실패하면 |
| --- | --- | --- |
| `all` | 전부 성공했을 때 | 즉시 거부 |
| `allSettled` | 전부 끝났을 때 | 결과에 기록만 |
| `race` | 가장 먼저 끝났을 때 | 그것이 먼저면 거부 |
| `any` | 가장 먼저 성공했을 때 | 전부 실패해야 거부 |

```js
const results = await Promise.allSettled([fetchA(), fetchB()]);

results.forEach((result) => {
  if (result.status === "fulfilled") console.log(result.value);
  else console.error(result.reason);
});
```

일부가 실패해도 나머지는 보여 줘야 하는 화면에는 `allSettled`가 맞습니다.

`race`는 제한 시간을 둘 때 쓸 수 있습니다.

```js
function timeout(ms) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error("시간 초과")), ms),
  );
}

await Promise.race([fetchTodos(), timeout(3000)]);
```

## 예외 처리

`await`하지 않은 Promise의 오류는 `try/catch`로 잡히지 않습니다.

```js
try {
  fetchTodos(); // await가 없습니다
} catch (error) {
  // 여기로 오지 않습니다
}
```

이렇게 처리되지 않은 거부는 브라우저의 `unhandledrejection`으로 흘러갑니다. 마지막 안전망으로 기록해 두면 놓친 오류를 발견할 수 있습니다.

```js
window.addEventListener("unhandledrejection", (event) => {
  console.error("처리되지 않은 거부", event.reason);
});
```

일시적인 실패는 다시 시도해 볼 수 있습니다.

```js
async function withRetry(task, times = 3) {
  for (let i = 0; i < times; i += 1) {
    try {
      return await task();
    } catch (error) {
      if (i === times - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2 ** i * 100));
    }
  }
}
```

다만 재시도는 같은 요청을 여러 번 보내도 안전할 때만 써야 합니다. 조회는 괜찮지만 결제나 생성 요청은 그렇지 않습니다.
