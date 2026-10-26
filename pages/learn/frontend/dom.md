---
title: 프론트엔드 05. DOM과 이벤트
description: 사용자 입력에 반응하고 데이터 상태를 기준으로 화면을 갱신합니다.
outline: deep
---

# 05. DOM과 이벤트

화면을 읽고 고치는 방법, 그리고 상태가 바뀔 때 화면을 다시 그리는 구조를 정리합니다.

## 요소 선택, 생성, 수정과 삭제

```js
document.querySelector(".todo");       // 첫 번째 하나
document.querySelectorAll(".todo");    // NodeList — 전부
list.querySelector(".title");          // 특정 요소 안에서만
```

`querySelectorAll`의 결과는 배열이 아닙니다. `map`이나 `filter`를 쓰려면 변환합니다.

```js
[...document.querySelectorAll(".todo")].map((el) => el.dataset.id);
```

만들고 붙이는 방법입니다.

```js
const item = document.createElement("li");
item.className = "todo";
item.textContent = todo.title;
item.dataset.id = todo.id;          // data-id 속성이 됩니다

list.append(item);                   // 끝에
list.prepend(item);                  // 앞에
item.remove();                       // 자기 자신 제거
```

여러 개를 하나씩 붙이면 그때마다 레이아웃이 다시 계산됩니다. 조각에 모아서 한 번에 넣습니다.

```js
const fragment = document.createDocumentFragment();
for (const todo of todos) {
  fragment.append(createItem(todo));
}
list.append(fragment);   // 여기서 한 번만
```

클래스와 속성을 다루는 방법입니다.

```js
item.classList.add("done");
item.classList.toggle("done", todo.done);   // 두 번째 인자로 조건 지정
item.classList.contains("done");

item.setAttribute("aria-pressed", "true");
item.dataset.status = "done";   // data-status
```

## textContent와 innerHTML의 차이

둘 다 내용을 바꾸지만 성격이 다릅니다.

```js
item.textContent = userInput;   // 문자열 그대로 — 태그도 글자로 보입니다
item.innerHTML = userInput;     // HTML로 해석합니다
```

사용자가 넣은 값을 `innerHTML`에 넣으면 그 안의 스크립트가 실행될 수 있습니다. 기본은 `textContent`이고, HTML을 넣어야만 하는 경우를 예외로 취급합니다. 자세한 내용은 [07. 웹 보안](/learn/frontend/security)에서 다룹니다.

`textContent`는 CSS를 고려하지 않아 `innerText`보다 빠릅니다. 숨겨진 텍스트까지 그대로 읽습니다.

## 이벤트 전파와 이벤트 위임

이벤트는 위에서 내려왔다가(캡처) 다시 올라갑니다(버블).

```js
element.addEventListener("click", handler);          // 버블 단계 (기본)
element.addEventListener("click", handler, true);    // 캡처 단계
```

올라간다는 성질을 이용하면, 항목마다 리스너를 붙이지 않고 **부모 하나에만** 붙일 수 있습니다.

```js
list.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const id = button.closest("li").dataset.id;

  if (button.dataset.action === "delete") remove(id);
  if (button.dataset.action === "toggle") toggle(id);
});
```

`event.target`은 실제로 클릭된 가장 안쪽 요소, `event.currentTarget`은 리스너가 붙은 요소입니다. `closest`로 올라가며 원하는 요소를 찾습니다.

항목이 나중에 추가돼도 리스너를 다시 붙일 필요가 없습니다. 목록이 자주 바뀌는 화면에서 특히 유리합니다.

전파를 멈추는 것은 신중하게 씁니다.

```js
event.stopPropagation();   // 위로 올라가지 않게 — 위임을 깨뜨립니다
event.preventDefault();    // 기본 동작만 막기
```

## 폼 제출과 기본 동작 제어

```js
form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!form.reportValidity()) return;   // 브라우저 검증 메시지를 띄웁니다

  const data = new FormData(form);
  todos = addTodo(todos, data.get("title"));

  form.reset();
  render();
});
```

`submit` 이벤트를 쓰면 Enter 키와 버튼 클릭이 한 번에 처리됩니다. 버튼의 `click`만 듣는 구현은 Enter로 제출하는 사용자를 놓칩니다.

기본 동작을 막아야 하는 경우들입니다.

```js
link.addEventListener("click", (e) => e.preventDefault());    // 이동 막기
area.addEventListener("dragover", (e) => e.preventDefault()); // 드롭 허용
```

`passive: true`로 등록한 리스너에서는 `preventDefault`가 동작하지 않습니다. 스크롤 성능을 위해 붙이는 옵션이므로 터치와 휠 이벤트에서 주의합니다.

## 커스텀 이벤트로 동작 알리기

컴포넌트가 바깥에 무언가를 알릴 때 콜백 대신 이벤트를 쓸 수 있습니다.

```js
item.dispatchEvent(
  new CustomEvent("todo:toggle", {
    detail: { id: todo.id },
    bubbles: true,
  }),
);
```

```js
list.addEventListener("todo:toggle", (event) => {
  toggle(event.detail.id);
});
```

`bubbles: true`가 없으면 위로 올라가지 않아 부모에서 받을 수 없습니다. 실제 데이터는 `detail`에 담습니다.

## AbortController로 리스너 한 번에 해제하기

리스너를 떼려면 같은 함수 참조가 필요했습니다.

```js
function handler() {}
element.addEventListener("click", handler);
element.removeEventListener("click", handler);   // 같은 참조여야 합니다
```

`AbortController`를 쓰면 여러 개를 한 번에 정리할 수 있습니다.

```js
const controller = new AbortController();
const { signal } = controller;

window.addEventListener("resize", onResize, { signal });
document.addEventListener("keydown", onKeyDown, { signal });
element.addEventListener("click", onClick, { signal });

controller.abort();   // 셋 다 해제됩니다
```

화면을 떠날 때 정리하지 않으면 리스너가 쌓여 메모리 누수가 됩니다. 같은 `signal`을 `fetch`에도 넘길 수 있어서, 요청 취소까지 한 번에 묶을 수 있습니다.

한 번만 실행할 리스너에는 `once`가 있습니다.

```js
dialog.addEventListener("close", handler, { once: true });
```

## 데이터 상태를 기준으로 화면 갱신하기

DOM을 직접 고치다 보면 **화면과 데이터가 어긋납니다.** 체크박스는 체크됐는데 배열의 값은 그대로인 상황입니다.

상태를 하나로 두고, 바뀌면 화면을 다시 그리는 방향으로 씁니다.

```js
let state = { todos: [], filter: "all" };

function setState(patch) {
  state = { ...state, ...patch };
  render();
}

function render() {
  const visible = filterTodos(state.todos, state.filter);

  list.replaceChildren(...visible.map(createItem));
  counter.textContent = `${countUndone(state.todos)}건 남음`;
}
```

```js
list.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action='toggle']");
  if (!button) return;

  const id = button.closest("li").dataset.id;

  setState({
    todos: state.todos.map((todo) =>
      todo.id === id ? { ...todo, done: !todo.done } : todo,
    ),
  });
});
```

이벤트 핸들러는 **상태만 바꾸고**, 화면 갱신은 `render`가 책임집니다. 화면을 어떻게 그릴지가 한 곳에 모이므로 어긋날 여지가 줄어듭니다.

`replaceChildren`은 기존 자식을 모두 지우고 새로 넣습니다. `innerHTML = ""`보다 안전하고 빠릅니다.

전부 다시 그리는 것이 비싸지는 시점이 오면 바뀐 부분만 갱신하게 됩니다. 그것을 대신해 주는 것이 프레임워크가 하는 일 중 하나입니다.

입력 중인 포커스가 날아가는 문제도 이때 만납니다. 전체를 다시 그리면 입력창이 새 요소로 바뀌기 때문입니다.

```js
const activeId = document.activeElement?.dataset.id;
render();
if (activeId) list.querySelector(`[data-id="${activeId}"]`)?.focus();
```
