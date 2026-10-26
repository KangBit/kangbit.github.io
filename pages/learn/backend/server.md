---
title: 백엔드 02. 언어와 서버 기초
description: 서버를 실행하고 요청을 받아 처리하는 기본 구조를 익힙니다.
outline: deep
---

# 02. 언어와 서버 기초

요청을 받아 라우팅하고 응답하기까지의 구조와, 서버가 동시에 여러 요청을 처리하는 방식을 정리합니다.

## 한 가지 서버 언어 선택

무엇을 고르든 배우는 것은 비슷합니다. 익숙한 것으로 시작해 구조를 익히는 편이 빠릅니다.

| 언어 | 특징 |
| --- | --- |
| Node.js | 프런트엔드와 언어가 같습니다. 생태계가 큽니다 |
| Python | 문법이 단순하고 데이터·AI 쪽과 붙이기 좋습니다 |
| Java / Kotlin | 타입이 엄격하고 대규모 시스템에 많이 쓰입니다 |
| Go | 단일 실행 파일로 배포되고 동시성이 간단합니다 |

각 언어의 문법은 [언어별 로드맵](/learn/languages/javascript/)에서 다룹니다. 여기서는 언어와 무관한 서버의 공통 구조를 봅니다.

## 패키지 관리, 모듈, 환경 변수

의존성은 선언해 두고 락 파일로 버전을 고정합니다. 락 파일이 없으면 환경마다 다른 버전이 깔립니다.

설정은 **코드에 넣지 않고 환경 변수로** 받습니다. 같은 코드가 개발·운영에서 다르게 동작해야 하기 때문입니다.

```bash
# .env — 저장소에 올리지 않습니다
DATABASE_URL=postgres://localhost:5432/todo
JWT_SECRET=...
PORT=3000
```

```js
// config.js — 한 곳에서 읽고 검증합니다
function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`환경 변수 ${name}이 필요합니다`);
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
};
```

**시작할 때 한 번에 검증**하는 것이 중요합니다. 필요한 설정이 없으면 서버가 뜨지 않아야 합니다. 요청이 들어온 뒤에야 알게 되면 이미 늦습니다.

`.env.example`을 저장소에 두어 어떤 값이 필요한지 알려 줍니다. 실제 값이 담긴 `.env`는 `.gitignore`에 넣습니다.

## 동시성 모델의 차이

서버는 여러 요청을 동시에 처리해야 합니다. 방식이 언어마다 다릅니다.

| 모델 | 대표 | 특징 |
| --- | --- | --- |
| 프로세스 | 전통적인 CGI | 격리는 좋지만 무겁습니다 |
| 스레드 | Java, 예전 Python | 요청마다 스레드. 수천 개는 부담 |
| 이벤트 루프 | Node.js | 단일 스레드가 번갈아 처리 |
| 경량 스레드 | Go, Java 21+ | 수만 개를 띄워도 가볍습니다 |

Node.js는 **한 스레드**가 전부 처리합니다. 기다리는 동안 다른 요청을 보기 때문에 I/O가 많은 작업에 효율적입니다.

대신 CPU를 오래 쓰는 작업이 들어오면 **모든 요청이 멈춥니다.**

```js
// 이 동안 다른 요청은 전혀 처리되지 않습니다
app.get("/report", (req, res) => {
  const result = heavyCalculation();   // 3초
  res.json(result);
});
```

무거운 계산은 워커 스레드나 별도 프로세스로 보냅니다.

스레드 모델에서는 반대로 **공유 자원 보호**가 문제가 됩니다. 여러 스레드가 같은 변수를 건드리면 값이 어긋납니다.

어느 모델이든, **요청 사이에 상태를 공유하지 않는 것**이 가장 안전합니다. 전역 변수에 사용자 정보를 담아 두면 동시 요청에서 섞입니다.

```js
// 위험합니다
let currentUser;

app.use((req, res, next) => {
  currentUser = req.user;   // 다른 요청이 덮어씁니다
  next();
});
```

필요한 값은 요청 객체에 담아 넘깁니다.

## 비동기 처리와 오류 처리

I/O는 기다리는 시간이 대부분입니다. 기다리는 동안 다른 일을 하도록 비동기로 씁니다.

```js
app.get("/api/todos", async (req, res) => {
  const todos = await db.query("SELECT * FROM todos");
  res.json(todos);
});
```

관계없는 작업은 동시에 보냅니다.

```js
// 순차 — 합계가 더해집니다
const user = await findUser(id);
const todos = await findTodos(id);

// 병렬
const [user, todos] = await Promise.all([findUser(id), findTodos(id)]);
```

비동기 핸들러의 오류는 **잡지 않으면 응답이 영영 가지 않습니다.** 클라이언트는 타임아웃까지 기다립니다.

```js
// Express 4에서는 이 오류가 에러 핸들러로 가지 않습니다
app.get("/api/todos", async (req, res) => {
  throw new Error("실패");
});
```

감싸는 함수를 두거나, 프레임워크가 지원하는 방식을 씁니다.

```js
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

app.get("/api/todos", asyncHandler(async (req, res) => {
  const todos = await findTodos();
  res.json(todos);
}));
```

마지막 안전망도 둡니다. 여기까지 온 오류는 버그이므로 로그를 남기고 500으로 응답합니다.

```js
app.use((error, req, res, next) => {
  logger.error("처리되지 않은 오류", { error, path: req.path });
  res.status(500).json({ message: "서버 오류가 발생했습니다" });
});
```

**오류 내용을 그대로 클라이언트에 보내지 않습니다.** 스택 추적과 쿼리문이 노출됩니다.

## 서버 실행과 라우팅, 요청 데이터 읽기

```js
import express from "express";

const app = express();

app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(config.port, () => {
  logger.info(`서버 시작`, { port: config.port });
});
```

본문 크기 제한을 두지 않으면 큰 요청 하나로 메모리가 터질 수 있습니다.

요청 데이터는 네 곳에서 옵니다.

```js
app.get("/api/todos/:id", (req, res) => {
  req.params.id;        // 경로: /api/todos/1
  req.query.status;     // 쿼리: ?status=done
  req.body;             // 본문: POST/PUT
  req.headers;          // 헤더
});
```

**전부 문자열이고 전부 사용자가 조작할 수 있습니다.** 쓰기 전에 변환하고 검증합니다.

```js
const id = Number(req.params.id);
if (!Number.isInteger(id) || id <= 0) {
  return res.status(400).json({ message: "잘못된 id입니다" });
}
```

종료 신호도 처리해 둡니다. 배포할 때 진행 중인 요청이 끊기지 않습니다.

```js
const server = app.listen(config.port);

process.on("SIGTERM", () => {
  server.close(async () => {
    await db.end();
    process.exit(0);
  });
});
```

## 미들웨어로 공통 처리 분리하기

모든 요청에 공통으로 필요한 일은 따로 떼어 둡니다. 순서대로 실행되고, `next()`를 불러야 다음으로 넘어갑니다.

```js
app.use(requestId);      // 요청마다 추적 ID 부여
app.use(requestLogger);  // 로그
app.use(express.json()); // 본문 파싱
app.use(authenticate);   // 인증

app.use("/api/todos", todoRouter);

app.use(notFound);       // 매칭되지 않은 경로
app.use(errorHandler);   // 오류 — 인자가 4개여야 합니다
```

```js
function requestLogger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    logger.info("요청 완료", {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Date.now() - start,
    });
  });

  next();
}
```

인증이나 권한 확인도 미들웨어로 두면, 각 핸들러에서 반복하지 않아도 됩니다.

```js
router.delete("/:id", authenticate, requireRole("admin"), deleteHandler);
```

순서가 중요합니다. 본문 파싱 전에 인증하면 본문을 읽을 수 없고, 오류 핸들러를 먼저 등록하면 호출되지 않습니다.
