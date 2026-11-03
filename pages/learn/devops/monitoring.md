---
title: 데브옵스 10. 모니터링과 관측
description: 지표와 로그, 추적으로 상태를 파악하고 장애를 먼저 감지합니다.
outline: deep
---

# 10. 모니터링과 관측

사용자가 알려 주기 전에 알아야 합니다. 무엇을 보고 언제 깨울지 정하는 일입니다.

## 세 가지 신호

| | 답하는 질문 | 비용 |
| --- | --- | --- |
| 지표 | 지금 정상인가, 추세가 어떤가 | 낮음 |
| 로그 | 그때 무슨 일이 있었나 | 높음 |
| 추적 | 이 요청이 어디서 느려졌나 | 중간 |

지표로 **이상을 감지**하고, 추적으로 **구간을 좁히고**, 로그로 **원인을 확인**합니다. 순서가 반대가 되면 로그를 뒤지는 데 시간을 다 씁니다.

## 무엇을 볼 것인가

지표를 늘리기 시작하면 끝이 없습니다. 두 가지 틀이 기준을 줍니다.

**RED** — 요청을 처리하는 서비스에 씁니다.

| | 뜻 |
| --- | --- |
| Rate | 초당 요청 수 |
| Errors | 실패한 요청 수 |
| Duration | 응답 시간 분포 |

**USE** — 자원에 씁니다.

| | 뜻 |
| --- | --- |
| Utilization | 사용률 |
| Saturation | 대기열 길이 |
| Errors | 오류 수 |

CPU 사용률이 90%라도 응답이 빠르면 문제가 아닙니다. **사용자가 겪는 것**부터 보고, 자원 지표는 원인을 찾을 때 봅니다.

## 평균 대신 분위수

평균 응답 시간은 거의 쓸모가 없습니다.

```
요청 100건 중 99건이 50ms, 1건이 10초
→ 평균 149ms  (문제없어 보입니다)
→ p99  10초   (100명 중 1명이 10초를 기다립니다)
```

p50, p95, p99를 함께 봅니다. p50은 평소 경험이고, p99는 **가장 불만이 큰 사용자**의 경험입니다.

## Prometheus

애플리케이션이 지표를 내보내면 Prometheus가 주기적으로 긁어 갑니다.

```js
import client from "prom-client";

const httpDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP 요청 처리 시간",
  labelNames: ["method", "route", "status"],
  buckets: [0.01, 0.05, 0.1, 0.3, 1, 3],
});

app.use((req, res, next) => {
  const end = httpDuration.startTimer();
  res.on("finish", () => {
    end({
      method: req.method,
      route: `${req.baseUrl}${req.route?.path ?? "unknown"}`,
      status: res.statusCode,
    });
  });
  next();
});
```

라벨에 **값의 종류가 많은 것을 넣지 않습니다.** 사용자 ID나 전체 URL을 라벨로 쓰면 시계열이 폭발해 Prometheus가 먼저 죽습니다. 경로는 `/api/todos/:id` 형태로 정규화합니다.

```promql
# 5분간 오류율
sum(rate(http_requests_total{status=~"5.."}[5m]))
  / sum(rate(http_requests_total[5m]))

# p95 응답 시간
histogram_quantile(0.95,
  sum by (le, route) (rate(http_request_duration_seconds_bucket[5m])))
```

## OpenTelemetry

계측을 특정 제품에 묶지 않는 표준입니다. SDK로 지표·추적·로그를 같은 형식으로 만들고, 수집기가 받아 원하는 저장소로 보냅니다.

자동 계측을 켜면 HTTP 서버, DB 드라이버, 외부 호출에 추적이 붙습니다.

```bash
OTEL_SERVICE_NAME=api \
OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4318 \
node --require @opentelemetry/auto-instrumentations-node/register dist/main.js
```

**도구를 바꿀 때 계측을 다시 하지 않아도 된다**는 점이 가장 큰 이점입니다. 처음 고를 때 확신이 없다면 계측만이라도 이쪽으로 해 둡니다.

## 추적

요청 하나가 여러 서비스를 거칠 때, 어디서 시간을 썼는지 봅니다.

```
POST /api/orders                      820ms
├─ auth.verify                         12ms
├─ db.query (SELECT user)              18ms
├─ inventory.check                    640ms   ← 여기
│  └─ db.query (SELECT stock) ×47     610ms   ← N+1
└─ db.insert (orders)                  35ms
```

서비스가 하나뿐이어도 쓸모가 있습니다. 같은 질의가 47번 나가는 것을 로그로 찾으려면 한참 걸립니다.

## 로그 수집

서버가 두 대를 넘는 순간 접속해서 `grep`하는 방식이 무너집니다.

컨테이너는 `stdout`으로 내보내고 수집기가 가져갑니다([06. 컨테이너](/learn/devops/container)). 구조적 로깅과 상관관계 ID는 [백엔드 09. 로그와 관측](/learn/backend/observability)에서 다룹니다.

보존 기간을 정해 둡니다. 전부 영구 보관하면 비용이 지표의 몇 배가 됩니다.

| 종류 | 보존 |
| --- | --- |
| 오류 로그 | 길게 (90일) |
| 접근 로그 | 중간 (30일) |
| 디버그 로그 | 짧게, 운영에서는 끔 |

## 도구 고르기

| | 특징 |
| --- | --- |
| Prometheus + Grafana | 오픈소스, 서버 값만 듦. 보존과 디스크는 직접 관리 |
| Grafana Cloud | 같은 구성의 관리형 |
| Datadog | 로그·지표·추적을 한 제품에서. 비용이 사용량을 빠르게 따라감 |
| Sentry | 오류 하나를 스택 추적·요청·사용자와 묶어 보여 줌 |

사람이 적으면 **관리형이 대체로 싸게 먹힙니다.** 직접 세운 Prometheus에도 업그레이드, 디스크, 장애 대응이 따라붙습니다.

Datadog류는 호스트 수, 로그 양, 시계열 개수가 각각 과금 대상입니다. 운영에서 `debug` 로그를 그대로 올리는 것이 청구서가 튀는 가장 흔한 원인입니다.

## 알림

알림은 **사람이 지금 행동해야 할 때만** 울려야 합니다.

```yaml
groups:
  - name: api
    rules:
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m]))
            / sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels: { severity: page }
        annotations:
          summary: "API 오류율 5% 초과"
          runbook: "https://wiki.example.com/runbook/api-errors"
```

`for: 5m`이 순간적인 튐을 걸러 냅니다. 이것이 없으면 배포할 때마다 알림이 옵니다.

- **증상에 걸고 원인에 걸지 않습니다.** "CPU 80%"가 아니라 "응답이 느리다"에 겁니다. CPU가 높아도 사용자가 멀쩡하면 깨울 이유가 없습니다
- **런북 링크를 붙입니다.** 새벽 3시에 받은 알림에서 가장 필요한 것은 다음에 무엇을 할지입니다
- **울렸는데 할 일이 없는 알림은 지웁니다.** 무시하는 알림이 쌓이면 진짜 알림도 무시됩니다

## SLI, SLO와 오류 예산

지표에 기준선을 두는 방법입니다.

```
SLI:  성공한 요청 / 전체 요청
SLO:  30일 동안 99.9%
오류 예산: 0.1% → 30일 기준 약 43분
```

예산이 남아 있으면 배포 속도를 유지하고, 다 쓰면 **기능보다 안정화를 먼저** 합니다. "얼마나 안정적이어야 하는가"를 느낌이 아니라 숫자로 이야기하게 됩니다.

100%를 목표로 두지 않습니다. 마지막 0.1%를 메우는 비용이 그 앞 전체보다 큽니다.

## 장애 이후

끝나고 나면 기록을 남깁니다. 사람을 탓하는 자리가 아니라 **그 조건에서 누구라도 같은 선택을 했을 것**이라는 전제로 씁니다.

- 시각별 경과
- 사용자가 겪은 영향
- 감지가 늦었다면 왜 늦었는지
- 다음에 같은 일이 생겼을 때 빨리 끝낼 방법

개선 항목은 담당자와 기한을 붙여 이슈로 만듭니다. 문서로만 남으면 같은 장애가 반복됩니다.
