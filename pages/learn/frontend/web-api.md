---
title: 프론트엔드 심화 · 데이터와 웹 API
description: GraphQL과 파일·관찰자 API, Web Worker, 국제화처럼 필요해질 때 꺼내 쓰는 주제를 정리합니다.
outline: deep
---

# 데이터와 웹 API

필요해지는 시점이 뚜렷한 주제들입니다. 언제 꺼내야 하는지와 함께 봅니다.

## GraphQL과 REST의 차이

REST는 서버가 정한 모양을 받습니다. 화면에 필요한 것이 조금씩 다르면 요청이 늘어납니다.

```
GET /todos          목록
GET /todos/1/tags   항목마다 한 번씩
GET /users/7        작성자
```

GraphQL은 필요한 모양을 요청에 적습니다. 한 번에 받습니다.

```graphql
query {
  todos {
    id
    title
    tags { name }
    author { name }
  }
}
```

| | REST | GraphQL |
| --- | --- | --- |
| 응답 모양 | 서버가 결정 | 클라이언트가 결정 |
| 과소·과다 조회 | 생기기 쉬움 | 줄어듦 |
| 캐시 | HTTP 캐시 그대로 | 클라이언트가 직접 |
| 오류 | 상태 코드 | 대개 200 + `errors` |

화면마다 필요한 데이터가 크게 다르고 클라이언트가 여럿일 때 효과가 큽니다. 화면 몇 개짜리 서비스라면 REST가 단순합니다.

상태 코드가 200이어도 실패일 수 있다는 점은 따로 기억해 둡니다.

```js
const { data, errors } = await response.json();
if (errors) throw new Error(errors[0].message);
```

## GraphQL 클라이언트: Apollo, Relay

직접 `fetch`로 쏴도 동작하지만, 캐시가 금방 필요해집니다.

- **Apollo Client** — 정규화 캐시, 낙관적 갱신, 폴링. 설정이 유연하고 널리 쓰입니다
- **Relay** — 컴포넌트가 자기 데이터 요구를 프래그먼트로 선언하고, 빌드 시점에 하나의 쿼리로 합칩니다. 규칙이 엄격한 대신 일관성이 보장됩니다

```jsx
const { data, loading, error } = useQuery(GET_TODOS);
```

정규화 캐시는 응답을 `id` 기준으로 쪼개 보관합니다. 한 화면에서 수정한 항목이 다른 화면에도 반영되는 이유입니다. 반대로 `id`를 조회하지 않으면 캐시가 항목을 식별하지 못해 갱신이 어긋납니다.

## 파일 처리

입력에서 받은 파일은 `File` 객체입니다. `Blob`을 상속하므로 조각내 읽거나 URL로 만들 수 있습니다.

```js
input.addEventListener("change", () => {
  const file = input.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showError("5MB 이하만 올릴 수 있습니다");
    return;
  }

  preview.src = URL.createObjectURL(file);
});
```

`createObjectURL`로 만든 주소는 직접 해제해야 메모리에서 사라집니다.

```js
preview.addEventListener("load", () => URL.revokeObjectURL(preview.src));
```

업로드는 `FormData`로 보냅니다.

```js
const form = new FormData();
form.append("image", file);
await fetch("/api/upload", { method: "POST", body: form });
```

`Content-Type`은 직접 지정하지 않습니다. 브라우저가 경계 문자열까지 붙여서 넣습니다.

파일 종류 검사는 브라우저에서 하는 것이 사용자 경험이고, **서버에서 다시 하는 것이 보안**입니다. 확장자와 MIME 타입은 모두 위조됩니다.

## 드래그 앤 드롭

기본 동작을 막아야 브라우저가 파일을 새 탭으로 열지 않습니다.

```js
dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();                 // 이 줄이 없으면 drop이 발생하지 않습니다
  dropZone.classList.add("is-over");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("is-over");
});

dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropZone.classList.remove("is-over");
  handleFiles([...event.dataTransfer.files]);
});
```

`dragenter`와 `dragleave`는 자식 요소를 지날 때마다 발생합니다. 강조 표시가 깜빡이면 깊이를 세거나 `pointer-events: none`을 자식에 둡니다.

드래그만으로는 키보드 사용자가 쓸 수 없습니다. 같은 일을 하는 파일 선택 버튼을 항상 함께 둡니다.

## Intersection Observer

요소가 화면에 들어왔는지를 스크롤 이벤트 없이 알려 줍니다. 계산이 메인 스레드 밖에서 일어나 훨씬 쌉니다.

```js
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) loadMore();
    }
  },
  { rootMargin: "200px" },   // 바닥에 닿기 200px 전에 미리 시작합니다
);

observer.observe(sentinel);
```

쓰임새는 무한 스크롤, 지연 로딩, 스크롤 연동 애니메이션, 노출 측정입니다. 다 쓰고 나면 해제합니다.

```js
observer.disconnect();
```

단순한 이미지 지연 로딩이라면 속성 하나로 끝납니다.

```html
<img src="photo.jpg" loading="lazy" width="800" height="600" alt="..." />
```

## Web Worker와 메인 스레드 작업 분리

JavaScript는 한 스레드에서 돕니다. 무거운 계산이 돌면 그동안 화면이 멈추고 클릭도 먹지 않습니다.

```js
// main.js
const worker = new Worker(new URL("./parse-worker.js", import.meta.url), {
  type: "module",
});

worker.postMessage(csvText);
worker.addEventListener("message", (event) => render(event.data));
```

```js
// parse-worker.js
self.addEventListener("message", (event) => {
  const rows = parseCsv(event.data);   // 오래 걸려도 화면은 멈추지 않습니다
  self.postMessage(rows);
});
```

워커에는 DOM이 없습니다. 계산만 보내고 결과를 받아 그리는 구조로 나눕니다. 주고받는 데이터는 복사되므로, 큰 배열은 전송 가능한 객체로 넘겨야 복사 비용이 사라집니다.

```js
worker.postMessage(buffer, [buffer]);   // 소유권을 넘깁니다
```

꺼낼 때는 정해져 있습니다. 대용량 파싱, 이미지 처리, 암호화, 압축. 간단한 반복문 때문에 워커를 두면 통신 비용이 더 큽니다. 먼저 개발자 도구에서 긴 작업으로 잡히는지 확인합니다.

## 국제화: 문구, 형식과 시간대

문구는 코드에서 분리합니다.

```json
{ "todo.left": "{count}개 남음" }
```

번역은 문장 단위로 둡니다. 조각을 이어 붙이면 어순이 다른 언어에서 무너집니다.

```js
`${count}` + "개 남음"            // 다른 언어에서는 순서가 다릅니다
t("todo.left", { count })         // 번역문이 어순을 가집니다
```

날짜와 숫자는 직접 포맷하지 않습니다. 브라우저에 들어 있습니다.

```js
new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(12000);
// "₩12,000"

new Intl.DateTimeFormat("ko-KR", { dateStyle: "long" }).format(date);
// "2026년 11월 3일"

new Intl.RelativeTimeFormat("ko").format(-3, "day");
// "3일 전"
```

가장 자주 틀리는 곳은 시간대입니다. 서버와는 UTC로 주고받고, 표시할 때만 사용자 시간대로 바꿉니다.

```js
new Date("2026-11-03")        // UTC 자정으로 해석됩니다
new Date("2026-11-03T00:00")  // 브라우저 시간대의 자정입니다
```

날짜만 다루는 값(생일, 마감일)을 시각으로 저장하면 시간대에 따라 하루가 밀립니다. 날짜는 날짜로 저장합니다.

화면 쪽에서는 레이아웃도 같이 봅니다. 번역된 문구는 보통 길어지므로, 고정 너비 버튼은 다른 언어에서 깨집니다.
