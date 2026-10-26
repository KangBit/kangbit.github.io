---
title: 백엔드 08. 테스트와 예외 처리
description: 정상 동작과 실패 상황을 자동으로 검증합니다.
outline: deep
---

# 08. 테스트와 예외 처리

무엇을 어느 수준에서 검증할지 정하고, 실패를 일관되게 다루는 방법을 정리합니다.

## 단위 테스트와 통합 테스트

| | 단위 | 통합 |
| --- | --- | --- |
| 범위 | 함수·클래스 하나 | 여러 계층 + DB |
| 속도 | 밀리초 | 수백 밀리초 |
| 깨지는 이유 | 그 로직이 바뀜 | 어디든 바뀜 |
| 잡아 주는 것 | 계산·분기 오류 | 연결·쿼리·설정 오류 |

둘 다 필요합니다. 단위 테스트는 빠르게 로직을 확인하고, 통합 테스트는 실제로 동작하는지 확인합니다.

**단위 테스트**는 외부 의존성 없이 돌아가는 순수한 로직을 봅니다.

```js
import { describe, it, expect } from "vitest";
import { canAddTodo, normalizeTitle } from "./todo-rules.js";

describe("canAddTodo", () => {
  it("100건 미만이면 추가할 수 있다", () => {
    expect(canAddTodo({ count: 99, plan: "free" })).toBe(true);
  });

  it("무료 요금제는 100건을 넘을 수 없다", () => {
    expect(canAddTodo({ count: 100, plan: "free" })).toBe(false);
  });

  it("유료 요금제는 제한이 없다", () => {
    expect(canAddTodo({ count: 100_000, plan: "pro" })).toBe(true);
  });
});
```

이런 규칙이 서비스 클래스 안에 DB 호출과 섞여 있으면 테스트하기 어렵습니다. **순수한 함수로 떼어 두면** 조건을 쉽게 늘릴 수 있습니다.

**통합 테스트**는 HTTP 요청부터 DB까지 한 번에 지나갑니다.

```js
import request from "supertest";
import { app } from "../app.js";

describe("POST /api/todos", () => {
  it("할 일을 생성한다", async () => {
    const res = await request(app)
      .post("/api/todos")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "공부" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: "공부", done: false });
    expect(res.headers.location).toMatch(/^\/api\/todos\/\d+$/);
  });

  it("제목이 비면 400을 반환한다", async () => {
    const res = await request(app)
      .post("/api/todos")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "   " });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("토큰이 없으면 401을 반환한다", async () => {
    const res = await request(app).post("/api/todos").send({ title: "공부" });

    expect(res.status).toBe(401);
  });
});
```

응답 본문뿐 아니라 **상태 코드와 헤더**도 확인합니다. API의 계약은 그 전체입니다.

## 테스트 데이터 준비와 격리

테스트끼리 영향을 주면 **순서에 따라 결과가 달라집니다.** 가장 디버깅하기 어려운 실패입니다.

DB는 실제 엔진을 쓰는 편이 낫습니다. 인메모리 대체품은 문법과 동작이 미묘하게 달라서, 통과한 쿼리가 운영에서 실패합니다.

```js
// testcontainers로 실제 PostgreSQL을 띄웁니다
import { PostgreSqlContainer } from "@testcontainers/postgresql";

let container;

beforeAll(async () => {
  container = await new PostgreSqlContainer().start();
  process.env.DATABASE_URL = container.getConnectionUri();
  await runMigrations();
}, 60_000);

afterAll(() => container.stop());
```

격리하는 방법은 두 가지입니다.

```js
// 1. 매번 비우기
beforeEach(async () => {
  await db.query("TRUNCATE todos, users RESTART IDENTITY CASCADE");
});

// 2. 트랜잭션으로 감싸고 롤백 — 더 빠릅니다
beforeEach(async () => {
  tx = await db.begin();
});

afterEach(async () => {
  await tx.rollback();
});
```

데이터는 **그 테스트에 필요한 것만** 명시적으로 만듭니다. 공용 시드 데이터에 의존하면, 시드를 고칠 때 관계없는 테스트가 깨집니다.

```js
function createTodo(overrides = {}) {
  return todoRepo.insert({
    userId: 1,
    title: "기본 제목",
    done: false,
    ...overrides,
  });
}
```

```js
it("완료된 항목만 거른다", async () => {
  await createTodo({ done: true });
  await createTodo({ done: false });

  const res = await request(app).get("/api/todos?status=done");

  expect(res.body.items).toHaveLength(1);
});
```

테스트를 읽을 때 **무엇이 중요한 값인지** 바로 보인다는 장점도 있습니다.

## 외부 의존성 다루기

결제나 메일 같은 외부 API를 테스트에서 실제로 부르지 않습니다. 느리고, 돈이 들고, 상대 서버 상태에 좌우됩니다.

인터페이스로 분리해 두면 바꿔 끼울 수 있습니다.

```js
class TodoService {
  constructor({ todoRepo, mailer }) {
    this.todoRepo = todoRepo;
    this.mailer = mailer;
  }
}
```

```js
const mailer = { send: vi.fn() };
const service = new TodoService({ todoRepo, mailer });

await service.complete(todoId);

expect(mailer.send).toHaveBeenCalledWith(
  expect.objectContaining({ template: "todo-completed" }),
);
```

HTTP 호출을 가로채는 방법도 있습니다.

```js
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  http.post("https://api.payment.com/charge", () =>
    HttpResponse.json({ status: "succeeded" }),
  ),
);
```

시간에 의존하는 로직은 시계를 고정합니다.

```js
vi.useFakeTimers();
vi.setSystemTime(new Date("2026-10-26T00:00:00Z"));
```

`Date.now()`를 코드 곳곳에서 직접 부르면 고정하기 어렵습니다. 주입하거나 한 곳에 모아 둡니다.

## 정상 요청, 잘못된 입력, 권한 없는 접근 검증

엔드포인트마다 최소한 네 가지를 확인합니다.

```js
describe("DELETE /api/todos/:id", () => {
  it("자기 할 일을 삭제한다", async () => {
    const todo = await createTodo({ userId: user.id });

    const res = await request(app)
      .delete(`/api/todos/${todo.id}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(204);
    expect(await todoRepo.findById(todo.id)).toBeNull();
  });

  it("토큰이 없으면 401", async () => {
    const res = await request(app).delete("/api/todos/1");
    expect(res.status).toBe(401);
  });

  it("남의 할 일은 404", async () => {
    const todo = await createTodo({ userId: otherUser.id });

    const res = await request(app)
      .delete(`/api/todos/${todo.id}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(404);
    expect(await todoRepo.findById(todo.id)).not.toBeNull();   // 지워지지 않았는지
  });

  it("없는 id는 404", async () => {
    const res = await request(app)
      .delete("/api/todos/999999")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(404);
  });
});
```

**남의 리소스에 접근하는 테스트**가 가장 중요합니다. 실무에서 가장 자주 나오는 취약점이고, 테스트가 없으면 리팩터링하다 조건이 빠져도 모릅니다.

응답 상태만 보지 말고 **실제로 바뀌었는지(혹은 안 바뀌었는지)** 함께 확인합니다.

## 일관된 오류 응답

실패를 던지는 쪽은 의미만 말하고, 변환은 한 곳에서 합니다.

```js
export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(resource) {
    super(404, "NOT_FOUND", `${resource}을(를) 찾을 수 없습니다`);
  }
}

export class ForbiddenError extends AppError {
  constructor() {
    super(403, "FORBIDDEN", "권한이 없습니다");
  }
}
```

```js
// 서비스는 HTTP를 모릅니다
async function remove(id, userId) {
  const todo = await todoRepo.findByIdAndUser(id, userId);
  if (!todo) throw new NotFoundError("할 일");

  await todoRepo.remove(id);
}
```

```js
// 변환은 미들웨어에서
app.use((error, req, res, next) => {
  if (error instanceof AppError) {
    return res.status(error.status).json({
      code: error.code,
      message: error.message,
      details: error.details,
    });
  }

  if (error instanceof z.ZodError) {
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "입력값을 확인해 주세요",
      details: error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      })),
    });
  }

  logger.error("처리되지 않은 오류", {
    err: error,
    requestId: req.id,
    path: req.path,
  });

  res.status(500).json({
    code: "INTERNAL_ERROR",
    message: "서버 오류가 발생했습니다",
    requestId: req.id,
  });
});
```

서비스 계층이 `res.status()`를 부르기 시작하면, 그 코드는 HTTP 밖에서 재사용할 수 없고 테스트도 어려워집니다. **예외를 던지고 변환은 경계에서** 하는 구조를 유지합니다.

비동기 핸들러의 오류가 이 미들웨어까지 오는지 확인해야 합니다. 프레임워크에 따라 감싸는 함수가 필요합니다.

```js
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
```

## 무엇을 테스트할지 고르기

전부 테스트하려 하면 유지가 안 됩니다. 우선순위가 있습니다.

1. **권한 검사** — 뚫리면 피해가 가장 큽니다
2. **돈·결제와 관련된 계산**
3. **복잡한 분기를 가진 비즈니스 규칙**
4. **버그가 났던 곳** — 재발 방지 테스트를 남깁니다
5. 자주 바뀌는 API의 계약

반대로 테스트 가치가 낮은 것들입니다.

- getter·setter, 단순 위임
- 프레임워크가 보장하는 동작
- 구현 세부사항 — 내부 함수가 몇 번 불렸는지 같은 것

내부 호출 횟수를 검증하면 **리팩터링할 때마다 테스트가 깨집니다.** 동작은 그대로인데 테스트를 고쳐야 한다면, 그 테스트는 구현에 묶여 있는 것입니다. 입력과 출력, 그리고 외부에서 관찰 가능한 결과를 봅니다.

커버리지 숫자를 목표로 삼지 않습니다. 90%를 채우려고 의미 없는 테스트를 쓰는 것보다, 중요한 흐름 열 개를 제대로 덮는 편이 낫습니다. 다만 커버리지 리포트에서 **아예 비어 있는 파일**을 찾는 용도로는 유용합니다.
