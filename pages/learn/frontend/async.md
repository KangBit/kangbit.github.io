---
title: 프론트엔드 06. 비동기 처리와 데이터
description: API를 연결하고 로딩과 실패 상태를 화면에 반영합니다.
outline: deep
---

# 06. 비동기 처리와 데이터

서버에서 데이터를 가져오고, 기다리는 동안과 실패했을 때 무엇을 보여 줄지 정리합니다.

## Promise와 async/await

```js
async function loadTodos() {
  const response = await fetch("/api/todos");
  const todos = await response.json();
  return todos;
}
```

`async` 함수는 항상 Promise를 반환합니다. 호출하는 쪽도 기다려야 합니다.

```js
const todos = loadTodos();        // Promise 객체입니다
const todos = await loadTodos();  // 실제 값
```

오류는 `try/catch`로 받습니다.

```js
try {
  const todos = await loadTodos();
} catch (error) {
  showError(error.message);
}
```

`await` 없이 호출한 Promise의 오류는 `try/catch`에 잡히지 않습니다. 처리되지 않은 거부로 콘솔에만 남습니다.

## fetch와 HTTP 오류 처리

**`fetch`는 404나 500에도 거부되지 않습니다.** 서버가 응답을 주기만 하면 성공으로 봅니다.

```js
const response = await fetch("/api/todos");
// 404여도 여기까지 옵니다
```

상태 코드를 직접 확인해야 합니다.

```js
async function request(url, options) {
  const response = await fetch(url, options);

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`${response.status} ${response.statusText} ${message}`);
  }

  return response.json();
}
```

거부되는 경우는 네트워크 자체가 끊겼거나, CORS에 막혔거나, 요청이 취소됐을 때입니다.

POST는 본문과 헤더를 함께 보냅니다.

```js
await request("/api/todos", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title }),
});
```

`Content-Type`을 빠뜨리면 서버가 본문을 해석하지 못하는 경우가 많습니다. `FormData`를 보낼 때는 반대로 **직접 지정하면 안 됩니다.** 브라우저가 경계 문자열을 포함해 붙여야 합니다.

```js
await fetch("/api/upload", { method: "POST", body: formData });   // 헤더 없이
```

응답 본문은 한 번만 읽을 수 있습니다.

```js
await response.json();
await response.text();   // TypeError: body stream already read
```

## 로딩, 빈 결과, 성공과 실패 상태

화면이 가질 수 있는 상태는 넷입니다. 전부 다루지 않으면 사용자는 멈춘 화면을 보게 됩니다.

```js
let state = { status: "idle", todos: [], error: null };

async function load() {
  setState({ status: "loading", error: null });

  try {
    const todos = await request("/api/todos");
    setState({ status: "success", todos });
  } catch (error) {
    setState({ status: "error", error: error.message });
  }
}
```

```js
function render() {
  if (state.status === "loading") return renderSkeleton();
  if (state.status === "error") return renderError(state.error);
  if (state.todos.length === 0) return renderEmpty();
  return renderList(state.todos);
}
```

**성공했는데 비어 있는 상태**를 빠뜨리기 쉽습니다. 목록이 0건일 때 빈 화면만 나오면 로딩이 안 끝난 것처럼 보입니다.

실패 화면에는 다시 시도할 방법을 둡니다. 새로고침만이 답인 화면은 불친절합니다.

```html
<p>목록을 불러오지 못했습니다.</p>
<button type="button" data-action="retry">다시 시도</button>
```

로딩 표시는 너무 빨리 띄우면 깜빡임이 됩니다. 200~300ms 이상 걸릴 때만 보여 주는 방법이 있습니다.

```js
const timer = setTimeout(() => showSpinner(), 300);
try {
  await load();
} finally {
  clearTimeout(timer);
  hideSpinner();
}
```

## 요청 취소와 응답 순서로 인한 화면 오류

검색어를 입력할 때마다 요청을 보내면, **늦게 보낸 요청이 먼저 도착할 수 있습니다.** 그러면 이전 검색어의 결과가 화면에 남습니다.

```js
// 문제가 생기는 코드
input.addEventListener("input", async (event) => {
  const todos = await search(event.target.value);
  render(todos);   // 어떤 요청의 결과인지 알 수 없습니다
});
```

이전 요청을 취소하면 해결됩니다.

```js
let controller;

input.addEventListener("input", async (event) => {
  controller?.abort();
  controller = new AbortController();

  try {
    const todos = await search(event.target.value, {
      signal: controller.signal,
    });
    render(todos);
  } catch (error) {
    if (error.name === "AbortError") return;   // 취소는 오류가 아닙니다
    showError(error.message);
  }
});
```

취소 오류를 걸러내지 않으면 타이핑할 때마다 에러 메시지가 뜹니다.

입력마다 보내지 않도록 디바운스도 함께 씁니다.

```js
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

input.addEventListener("input", debounce(onSearch, 300));
```

## 여러 요청 다루기

서로 관계없는 요청을 `await`로 줄줄이 쓰면 불필요하게 기다립니다.

```js
// 순차 — 합계 2초
const todos = await loadTodos();
const user = await loadUser();

// 병렬 — 합계 1초
const [todos, user] = await Promise.all([loadTodos(), loadUser()]);
```

`Promise.all`은 하나라도 실패하면 전체가 거부됩니다. 일부가 실패해도 나머지를 보여 줘야 하면 `allSettled`를 씁니다.

```js
const results = await Promise.allSettled([loadTodos(), loadStats()]);

const todos = results[0].status === "fulfilled" ? results[0].value : [];
```

## localStorage의 활용과 한계

```js
localStorage.setItem("todos", JSON.stringify(todos));

const saved = JSON.parse(localStorage.getItem("todos") ?? "[]");
```

쓸 때 주의할 점들입니다.

- **문자열만** 저장됩니다. 객체는 직렬화해야 합니다
- **동기**로 동작해서 큰 데이터를 다루면 화면이 멈춥니다
- 용량이 보통 5MB 정도입니다
- 시크릿 모드나 저장소 차단 설정에서 **예외가 납니다**

읽고 쓰는 것을 감싸 두는 편이 안전합니다.

```js
function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;   // 차단됐거나 형식이 깨졌습니다
  }
}
```

저장된 형식이 나중에 바뀔 수 있다는 점도 고려합니다. 예전 버전이 남아 있으면 앱이 깨집니다.

```js
const saved = readStorage("todos", []);
const valid = Array.isArray(saved) ? saved.filter((t) => t?.id && t?.title) : [];
```

큰 데이터나 비동기 저장이 필요하면 IndexedDB를 봅니다. 탭 간 동기화가 필요하면 `storage` 이벤트를 쓸 수 있습니다.

```js
window.addEventListener("storage", (event) => {
  if (event.key === "todos") reload();
});
```
