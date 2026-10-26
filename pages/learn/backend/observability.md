---
title: 백엔드 09. 로그와 관측
description: 운영 중인 서비스의 상태를 파악하고 장애 원인을 추적합니다.
outline: deep
---

# 09. 로그와 관측

무슨 일이 일어나고 있는지 밖에서 알 수 있게 만드는 방법을 정리합니다.

## 구조적 로깅과 로그 수준 구분

문자열로 이어 붙인 로그는 사람만 읽을 수 있습니다.

```js
console.log(`사용자 ${userId}가 할 일 ${todoId}를 삭제했습니다`);
```

검색하려면 정규식을 써야 하고, 집계는 거의 불가능합니다.

**키와 값**으로 남기면 그대로 질의할 수 있습니다.

```js
logger.info("할 일 삭제", { userId, todoId, durationMs: 12 });
```

```json
{
  "level": "info",
  "time": "2026-10-26T09:00:00.000Z",
  "msg": "할 일 삭제",
  "userId": 1,
  "todoId": 42,
  "durationMs": 12,
  "requestId": "abc-123"
}
```

`userId = 1 AND durationMs > 1000`처럼 조건으로 찾을 수 있습니다.

수준은 **대응 여부**로 나눕니다.

| 수준 | 쓰는 때 |
| --- | --- |
| `error` | 사람이 봐야 하는 실패 |
| `warn` | 지금은 괜찮지만 쌓이면 문제 |
| `info` | 중요한 상태 변화 (시작, 종료, 주요 작업) |
| `debug` | 개발 중 상세 정보 |

운영에서는 `info` 이상만 남기고, 필요할 때 수준을 올릴 수 있게 설정으로 둡니다.

```js
import pino from "pino";

export const logger = pino({
  level: config.logLevel ?? "info",
  redact: ["req.headers.authorization", "req.headers.cookie", "*.password"],
});
```

`redact`로 비밀 정보를 자동으로 가립니다. 요청 본문을 통째로 로그에 남기는 구현이 가장 흔한 유출 경로입니다.

**예상한 실패를 `error`로 남기지 않습니다.** 잘못된 입력이나 404까지 error로 찍으면 진짜 문제가 묻힙니다.

```js
// 400은 정상적인 흐름입니다
logger.info("입력값 오류", { code: "VALIDATION_ERROR", path: req.path });

// 500은 버그입니다
logger.error("처리되지 않은 오류", { err: error });
```

오류 객체는 그대로 넘깁니다. 로거가 스택 추적까지 직렬화합니다.

```js
logger.error("저장 실패", { err: error });   // 스택이 남습니다
logger.error(`저장 실패: ${error}`);          // 메시지만 남습니다
```

## 요청을 추적하는 상관관계 ID

로그가 여러 요청에서 섞여 들어오면 하나의 흐름을 따라가기 어렵습니다. 요청마다 ID를 붙입니다.

```js
import { randomUUID } from "node:crypto";

app.use((req, res, next) => {
  req.id = req.headers["x-request-id"] ?? randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
});
```

클라이언트가 보낸 ID가 있으면 이어받습니다. 프런트엔드부터 백엔드까지 하나로 연결됩니다.

모든 로그에 자동으로 포함시키려면 요청별 컨텍스트가 필요합니다.

```js
import { AsyncLocalStorage } from "node:async_hooks";

const context = new AsyncLocalStorage();

app.use((req, res, next) => {
  context.run({ requestId: req.id, userId: req.user?.id }, next);
});

export function log(level, msg, data = {}) {
  logger[level](msg, { ...context.getStore(), ...data });
}
```

함수마다 `requestId`를 인자로 넘기지 않아도 됩니다.

서비스가 여러 개로 나뉘면 ID를 **호출할 때 함께 전달**합니다.

```js
await fetch(url, { headers: { "X-Request-Id": req.id } });
```

사용자가 오류를 신고할 때 `requestId`를 함께 주면, 그 한 건의 전체 흐름을 바로 찾을 수 있습니다.

```json
{
  "code": "INTERNAL_ERROR",
  "message": "서버 오류가 발생했습니다",
  "requestId": "abc-123"
}
```

## 지표 수집: 처리량, 응답 시간과 오류율

로그는 개별 사건이고, 지표는 **집계된 숫자**입니다. 둘의 용도가 다릅니다.

핵심은 네 가지입니다.

| 지표 | 보는 이유 |
| --- | --- |
| 처리량 (RPS) | 지금 얼마나 들어오는가 |
| 응답 시간 | 느려지고 있는가 |
| 오류율 | 실패가 늘고 있는가 |
| 포화도 | 자원이 한계에 가까운가 (CPU, 커넥션 풀) |

응답 시간은 **평균이 아니라 분위수**로 봅니다. 평균은 소수의 느린 요청을 가립니다.

```
평균 120ms   — 괜찮아 보입니다
p50  80ms
p95  450ms
p99  3200ms  — 100명 중 1명은 3초를 기다립니다
```

p99가 중요한 이유는, 한 화면이 여러 API를 부르면 그중 하나만 느려도 전체가 느려지기 때문입니다.

```js
import { Counter, Histogram, register } from "prom-client";

const requests = new Counter({
  name: "http_requests_total",
  help: "요청 수",
  labelNames: ["method", "route", "status"],
});

const duration = new Histogram({
  name: "http_request_duration_seconds",
  help: "응답 시간",
  labelNames: ["method", "route", "status"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 3],
});

app.use((req, res, next) => {
  const end = duration.startTimer();

  res.on("finish", () => {
    const labels = {
      method: req.method,
      route: req.route?.path ?? "unknown",
      status: res.statusCode,
    };
    requests.inc(labels);
    end(labels);
  });

  next();
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});
```

라벨에 **경로 패턴**(`/api/todos/:id`)을 쓰고, 실제 값(`/api/todos/42`)을 쓰지 않습니다. 값마다 시계열이 생겨 저장소가 터집니다. `userId`를 라벨로 쓰는 것도 같은 이유로 안 됩니다.

애플리케이션 지표도 함께 봅니다. 기술 지표는 정상인데 서비스가 망가진 경우를 잡아 줍니다.

```js
signups.inc();
paymentsFailed.inc({ reason: "card_declined" });
queueDepth.set(await queue.size());
```

## 알림 기준과 임계치 설정

**사람이 지금 행동해야 하는 것만** 알립니다. 울려도 아무도 안 보는 알림이 쌓이면 진짜 장애도 무시하게 됩니다.

좋은 기준은 사용자가 겪는 증상입니다.

```
오류율이 5분 동안 1%를 넘음
p99 응답 시간이 10분 동안 3초를 넘음
헬스 체크가 2분 이상 실패
큐가 10분 넘게 줄지 않음
```

나쁜 기준은 원인 지표입니다.

```
CPU가 80%를 넘음   — 넘어도 서비스가 멀쩡하면 문제가 아닙니다
오류가 1건 발생     — 일시적인 실패마다 깨웁니다
```

지속 시간 조건을 함께 둡니다. 순간적인 튐으로 깨우지 않기 위해서입니다.

```yaml
- alert: HighErrorRate
  expr: |
    sum(rate(http_requests_total{status=~"5.."}[5m]))
      / sum(rate(http_requests_total[5m])) > 0.01
  for: 5m
  annotations:
    summary: "5xx 비율이 1%를 넘었습니다"
    runbook: "https://wiki/runbooks/high-error-rate"
```

알림에는 **무엇을 확인해야 하는지** 링크를 겁니다. 새벽에 깨어난 사람이 처음부터 추적하지 않아도 되게 합니다.

## 장애 상황에서 원인을 찾아가는 순서

순서를 정해 두면 당황하지 않습니다.

**1. 범위를 좁힙니다**

```
전체인가 일부인가 — 특정 엔드포인트? 특정 사용자? 특정 지역?
언제부터인가 — 배포 직후? 특정 시각?
```

지표 대시보드에서 꺾인 지점을 찾습니다. 시작 시각이 배포 시각과 겹치면 범인이 거의 정해집니다.

**2. 최근 변경을 확인합니다**

배포, 설정 변경, 기능 플래그, 의존 서비스의 변경. 대부분의 장애는 무언가 바뀐 직후에 생깁니다.

**3. 되돌립니다**

원인을 다 밝히기 전에 **먼저 복구합니다.** 롤백이 수정보다 빠르고 안전합니다. 분석은 서비스가 정상으로 돌아온 뒤에 합니다.

**4. 로그를 따라갑니다**

```
오류율이 오른 시간대 → 해당 엔드포인트의 error 로그
→ requestId 하나를 골라 전체 흐름 추적
→ 어느 단계에서 실패하는지 확인
```

**5. 기록을 남깁니다**

무엇이 일어났고, 왜 그랬고, 어떻게 알았고, 다음에 더 빨리 알려면 무엇이 필요한지 적습니다. 사람을 탓하는 대신 **구조를 고칩니다.** 같은 실수가 가능한 구조라면 다시 일어납니다.

## 미리 준비해 둘 것들

장애가 나고 나서 만들면 늦습니다.

**헬스 체크** — 단순히 프로세스가 살아 있는지와, 실제로 요청을 처리할 수 있는지를 나눕니다.

```js
app.get("/health/live", (req, res) => res.json({ status: "ok" }));

app.get("/health/ready", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "unavailable" });
  }
});
```

`ready`가 실패하면 로드밸런서가 트래픽을 보내지 않습니다. `live`가 실패하면 컨테이너가 재시작됩니다. 둘을 같은 것으로 두면, DB가 잠깐 끊겼을 때 모든 인스턴스가 재시작되는 사태가 납니다.

**버전 정보** — 지금 돌고 있는 것이 어느 커밋인지 바로 알 수 있어야 합니다.

```js
app.get("/version", (req, res) =>
  res.json({ version: process.env.GIT_SHA, builtAt: process.env.BUILD_TIME }),
);
```

**대시보드** — 오류율, 응답 시간, 처리량을 한 화면에서 봅니다. 장애 중에 쿼리를 새로 짜고 있을 시간이 없습니다.
