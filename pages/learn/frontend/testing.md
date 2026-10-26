---
title: 프론트엔드 11. 테스트와 배포
description: 주요 사용자 흐름을 검증하고 웹에 공개합니다.
outline: deep
---

# 11. 테스트와 배포

바뀌어도 깨지지 않는지 확인하는 방법과, 실제로 공개하고 나서 확인할 것들을 정리합니다.

## 데이터 처리 함수의 단위 테스트

브라우저 없이 실행되는 함수부터 테스트합니다. 빠르고 안정적입니다.

```ts
// todo.test.ts
import { describe, it, expect } from "vitest";
import { addTodo, filterTodos } from "./todo";

describe("addTodo", () => {
  it("목록 끝에 추가한다", () => {
    const list = [{ id: "1", title: "공부", done: false }];

    const result = addTodo(list, "운동");

    expect(result).toHaveLength(2);
    expect(result[1].title).toBe("운동");
  });

  it("원본을 바꾸지 않는다", () => {
    const list = [];

    addTodo(list, "운동");

    expect(list).toHaveLength(0);
  });

  it("앞뒤 공백을 제거한다", () => {
    expect(addTodo([], "  공부  ")[0].title).toBe("공부");
  });

  it("제목이 비면 오류를 낸다", () => {
    expect(() => addTodo([], "   ")).toThrow();
  });
});
```

테스트할 가치가 있는 것은 **규칙**입니다. 빈 제목을 막는지, 원본을 지키는지, 경계값에서 어떻게 되는지입니다. 단순히 값을 넣고 꺼내는 코드까지 덮을 필요는 없습니다.

## 사용자 흐름 테스트

화면을 다루는 코드는 **사용자가 보는 것**을 기준으로 씁니다. 내부 구현이 아니라 화면에 뭐가 보이고 뭘 누를 수 있는지를 봅니다.

```ts
import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";

it("입력하고 제출하면 목록에 나타난다", async () => {
  render();

  await userEvent.type(screen.getByLabelText("할 일"), "공부");
  await userEvent.click(screen.getByRole("button", { name: "추가" }));

  expect(screen.getByText("공부")).toBeInTheDocument();
});
```

요소를 찾을 때 우선순위가 있습니다.

```ts
screen.getByRole("button", { name: "추가" });   // 가장 권장
screen.getByLabelText("할 일");
screen.getByText("공부");
screen.getByTestId("submit");                    // 마지막 수단
```

역할과 이름으로 찾으면 **접근성도 함께 검증됩니다.** 레이블이 없는 입력은 `getByLabelText`로 찾히지 않으므로, 테스트가 실패하면서 문제를 알려 줍니다.

클래스 이름이나 DOM 구조로 찾으면 스타일만 고쳐도 테스트가 깨집니다.

네트워크는 실제로 부르지 않고 가로챕니다.

```ts
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  http.get("/api/todos", () =>
    HttpResponse.json([{ id: "1", title: "공부", done: false }]),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

실패 응답도 테스트합니다. 성공만 테스트한 코드는 에러 화면이 깨져 있어도 모릅니다.

```ts
it("실패하면 다시 시도 버튼을 보여 준다", async () => {
  server.use(http.get("/api/todos", () => new HttpResponse(null, { status: 500 })));

  render();

  expect(await screen.findByRole("button", { name: "다시 시도" })).toBeInTheDocument();
});
```

## 테스트 더블

외부에 의존하는 부분은 가짜로 바꿔 끼웁니다.

```ts
const storage = {
  load: vi.fn().mockReturnValue([]),
  save: vi.fn(),
};

const service = createService(storage);
service.add("공부");

expect(storage.save).toHaveBeenCalledWith([
  expect.objectContaining({ title: "공부" }),
]);
```

시간에 의존하는 코드는 시계를 고정합니다.

```ts
vi.useFakeTimers();
vi.setSystemTime(new Date("2026-01-01"));

// ...

vi.useRealTimers();
```

`Date.now()`나 `Math.random()`을 코드 안에서 직접 부르면 테스트하기 어렵습니다. 인자로 받거나 주입하면 고정할 수 있습니다.

## 브라우저에서의 종단 테스트

실제 브라우저로 주요 흐름을 한두 개만 확인합니다. 느리고 불안정하므로 많이 만들지 않습니다.

```ts
import { test, expect } from "@playwright/test";

test("할 일을 추가하고 완료한다", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("할 일").fill("공부");
  await page.getByRole("button", { name: "추가" }).click();

  await expect(page.getByText("공부")).toBeVisible();

  await page.getByRole("checkbox", { name: "공부 완료" }).check();
  await expect(page.getByText("0건 남음")).toBeVisible();
});
```

## 키보드 조작과 모바일 화면 확인

자동 테스트로 잡히지 않는 것은 직접 확인합니다.

```ts
await page.keyboard.press("Tab");
await page.keyboard.press("Enter");
```

```ts
test.use({ viewport: { width: 375, height: 812 } });
```

수동으로 볼 것들입니다.

- Tab만으로 주요 흐름을 끝까지 할 수 있는가
- 실제 휴대폰에서 터치 대상이 충분히 큰가
- 가로 스크롤이 생기지 않는가
- 모바일 키보드가 입력창을 가리지 않는가

개발자 도구의 모바일 에뮬레이션은 크기만 흉내 냅니다. 실제 기기에서 한 번은 열어 봐야 합니다.

## 정적 파일 배포, 경로 설정과 HTTPS

빌드 결과는 정적 파일이므로 어디에나 올릴 수 있습니다.

```bash
npm run build   # dist/ 생성
```

하위 경로에 배포한다면 기준 경로를 알려 줘야 합니다. 이것을 빠뜨리면 CSS와 JS가 404가 납니다.

```js
// vite.config.js
export default {
  base: "/my-project/",
};
```

클라이언트 라우팅을 쓴다면, **모든 경로를 `index.html`로** 보내야 합니다. 그렇지 않으면 `/todos/1`에서 새로고침할 때 404가 납니다.

```
/*    /index.html   200
```

정적 호스팅마다 설정 방법이 다릅니다. GitHub Pages는 `404.html`을 두는 우회 방법을 씁니다.

HTTPS는 선택이 아닙니다. Service Worker, 위치 정보, 클립보드 API가 HTTP에서는 동작하지 않습니다. 대부분의 호스팅이 기본으로 제공합니다.

## 배포 전 자동 검사

사람이 기억해서 돌리는 것은 언젠가 빠뜨립니다. CI에 걸어 둡니다.

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm test
      - run: npm run build
```

`npm ci`는 락 파일 그대로 설치합니다. `npm install`과 달리 버전이 바뀌지 않습니다.

하나라도 실패하면 배포가 멈춥니다. 깨진 코드가 나가는 것을 막는 가장 싼 방법입니다.

## 배포 후 오류 확인

배포는 끝이 아니라 시작입니다. 내 브라우저에서 되는 것과 모든 사용자에게 되는 것은 다릅니다.

처리되지 않은 오류를 수집합니다.

```js
window.addEventListener("error", (event) => {
  report({ message: event.message, source: event.filename, line: event.lineno });
});

window.addEventListener("unhandledrejection", (event) => {
  report({ message: String(event.reason) });
});
```

실제로는 Sentry 같은 서비스를 붙이는 경우가 많습니다. 소스맵을 올려 두면 압축된 코드가 아니라 원본 위치로 보여 줍니다.

배포 직후에 확인할 것들입니다.

- 첫 화면이 제대로 뜨는가
- 하위 경로에서 **새로고침**이 되는가
- 캐시가 남아 예전 버전이 보이지 않는가
- 모바일에서 열리는가
- 콘솔에 오류가 없는가

캐시 문제는 특히 자주 겪습니다. HTML은 `no-cache`, 해시가 붙은 에셋은 긴 캐시로 두면 대부분 해결됩니다.

실제 사용자 지표도 함께 봅니다. 내 기기에서 빠른 것이 3G 환경에서도 빠르지는 않습니다.

```js
import { onLCP, onINP, onCLS } from "web-vitals";

onLCP(send);
onINP(send);
onCLS(send);
```

문제가 생겼을 때 **되돌릴 수 있는 수단**을 미리 준비해 둡니다. 대부분의 호스팅이 이전 배포로 되돌리는 기능을 제공합니다. 고치는 것보다 되돌리는 것이 빠를 때가 많습니다.
