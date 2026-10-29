---
title: 백엔드 10. 배포와 운영
description: 서비스를 배포하고 안정적으로 유지합니다.
outline: deep
---

# 10. 배포와 운영

코드를 서버에 올리고, 문제가 생겨도 되돌릴 수 있게 만드는 방법을 정리합니다.

## 개발·운영 환경 설정 분리

같은 코드가 환경에 따라 다르게 동작해야 합니다. 차이는 **설정으로만** 둡니다.

```js
export const config = {
  env: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  logLevel: process.env.LOG_LEVEL ?? "info",
};
```

코드 안에 환경 분기가 흩어지면 추적하기 어려워집니다.

```js
// 흩어져 있습니다
if (process.env.NODE_ENV === "production") { ... }

// 설정으로 표현합니다
if (config.features.emailEnabled) { ... }
```

환경마다 달라야 하는 것들입니다.

| | 개발 | 운영 |
| --- | --- | --- |
| 로그 수준 | debug | info |
| 오류 응답 | 상세 | 일반 메시지 |
| 커넥션 풀 | 작게 | 부하에 맞게 |
| 외부 API | 샌드박스 | 실제 |

운영 환경 비밀은 저장소에 넣지 않습니다. 비밀 관리 서비스나 배포 플랫폼의 환경 변수로 주입합니다.

**시작할 때 한 번에 검증**합니다. 설정이 빠졌으면 서버가 뜨지 않아야 합니다.

## 빌드와 실행, 환경 변수 주입

```json
{
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "start": "node dist/main.js",
    "dev": "tsx watch src/main.ts",
    "migrate": "node dist/migrate.js"
  }
}
```

빌드 결과물과 소스를 분리하고, 운영에서는 **빌드된 것만** 실행합니다. 런타임에 컴파일하면 시작이 느리고 개발 의존성이 필요합니다.

운영 설치는 개발 의존성을 뺍니다.

```bash
npm ci --omit=dev
```

## 컨테이너로 실행 환경 통일하기

"제 컴퓨터에서는 되는데"를 없앱니다. 런타임 버전, 시스템 라이브러리, 설정까지 이미지에 담습니다.

```dockerfile
# 빌드 단계
FROM node:22-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 실행 단계
FROM node:22-slim
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

USER node
EXPOSE 3000

CMD ["node", "dist/main.js"]
```

단계를 나누면 **빌드 도구가 최종 이미지에 남지 않습니다.** 크기가 줄고 공격 표면도 줄어듭니다.

`package*.json`을 먼저 복사하는 이유는 캐시 때문입니다. 소스만 바뀌면 `npm ci` 단계를 건너뜁니다.

`USER node`로 루트가 아닌 사용자로 실행합니다. 컨테이너가 뚫려도 할 수 있는 일이 제한됩니다.

```
# .dockerignore
node_modules
.git
.env
dist
```

`.env`를 이미지에 넣지 않습니다. 비밀은 실행 시점에 주입합니다.

```bash
docker run -e DATABASE_URL=... -e JWT_SECRET=... myapp:1.0.0
```

이미지 태그에 `latest`를 쓰지 않습니다. 어느 버전이 돌고 있는지 알 수 없고 롤백도 못 합니다. 커밋 해시나 버전을 붙입니다.

## CI/CD의 기본 흐름과 배포 전 테스트

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:17
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready --health-interval 10s --health-retries 5

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
        env:
          DATABASE_URL: postgres://postgres:test@localhost:5432/postgres

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t myapp:${{ github.sha }} .
      - run: docker push myapp:${{ github.sha }}
      - run: ./deploy.sh myapp:${{ github.sha }}
```

`needs: test`가 있어 테스트가 실패하면 배포되지 않습니다. 깨진 코드가 나가는 것을 막는 가장 싼 방법입니다.

마이그레이션은 배포 **전에** 따로 돌립니다. 여러 인스턴스가 동시에 실행하면 충돌합니다.

```bash
npm run migrate && ./deploy.sh
```

새 코드와 옛 코드가 잠시 함께 도는 시간이 있으므로, 마이그레이션은 **양쪽 모두에서 동작하도록** 설계합니다. 컬럼을 바로 지우지 않고 단계를 나누는 이유입니다.

## 무중단 배포와 배포 롤백

새 버전을 띄우고, **준비됐는지 확인한 뒤** 트래픽을 옮기고, 옛 버전을 내립니다.

```
1. 새 인스턴스 시작
2. /health/ready 통과 대기
3. 로드밸런서에 추가
4. 옛 인스턴스를 로드밸런서에서 제외
5. 진행 중인 요청이 끝날 때까지 대기
6. 옛 인스턴스 종료
```

5번이 중요합니다. 바로 죽이면 처리 중이던 요청이 끊깁니다.

```js
const server = app.listen(config.port);

process.on("SIGTERM", () => {
  logger.info("종료 신호 수신");

  server.close(async () => {
    await db.end();
    process.exit(0);
  });

  setTimeout(() => {
    logger.warn("강제 종료");
    process.exit(1);
  }, 30_000);
});
```

`server.close`는 **새 연결만 막고** 진행 중인 요청은 끝까지 처리합니다. 타임아웃을 두어 영원히 안 끝나는 경우를 대비합니다.

롤백은 **가장 먼저 꺼내는 카드**입니다. 원인을 밝히기 전에 복구합니다.

```bash
./deploy.sh myapp:<이전-커밋-해시>
```

이게 가능하려면 몇 가지가 필요합니다.

- 이미지에 버전 태그가 있고 이전 것이 남아 있어야 합니다
- 마이그레이션이 **되돌릴 수 있거나, 옛 코드와도 호환**되어야 합니다
- 설정이 코드와 분리되어 있어야 합니다

컬럼을 지우는 마이그레이션을 배포와 함께 돌리면 롤백할 수 없습니다. 옛 코드가 그 컬럼을 찾기 때문입니다.

## 헬스 체크와 HTTPS 설정

살아 있음과 처리 가능함을 나눕니다.

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

`live`가 실패하면 재시작, `ready`가 실패하면 트래픽 차단입니다. 둘을 하나로 두면 DB가 잠깐 끊겼을 때 전체 인스턴스가 재시작되는 사태가 납니다.

헬스 체크는 **가볍게** 유지합니다. 외부 API까지 확인하면 그쪽이 느릴 때 전부 죽습니다.

TLS는 보통 로드밸런서나 리버스 프록시에서 끝냅니다.

```nginx
server {
    listen 443 ssl;
    http2 on;
    server_name api.example.com;

    ssl_certificate     /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    add_header Strict-Transport-Security "max-age=31536000" always;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

`listen` 줄의 `http2` 인자는 nginx 1.25.1부터 폐기됐습니다. 별도 지시어인 `http2 on;`을 씁니다.

프록시 뒤에 있으면 애플리케이션에 알려 줘야 클라이언트 IP와 프로토콜을 제대로 인식합니다.

```js
app.set("trust proxy", 1);   // 신뢰할 프록시 단계 수
```

`true`로 두면 아무나 `X-Forwarded-For`를 위조할 수 있습니다. 속도 제한이 IP 기준이면 그대로 우회됩니다.

## 데이터 백업과 복구

백업은 **복구해 본 것만** 백업입니다. 돌려 본 적 없는 백업은 있다고 말할 수 없습니다.

정해 둘 것은 두 가지입니다.

- **얼마나 잃어도 되는가** — 백업 주기를 정합니다
- **얼마나 빨리 돌아와야 하는가** — 복구 방식을 정합니다

```bash
# 정기 덤프
pg_dump "$DATABASE_URL" | gzip > backup-$(date +%F).sql.gz

# 복구
gunzip -c backup-2026-10-26.sql.gz | psql "$RESTORE_URL"
```

관리형 DB라면 시점 복구를 제공하는 경우가 많습니다. 특정 시각 상태로 되돌릴 수 있어 "실수로 DELETE를 돌린" 상황에 유용합니다.

확인할 것들입니다.

- 백업이 **다른 곳**에 저장되는가 (같은 서버에 두면 의미가 없습니다)
- 복구 절차를 **실제로 해 봤는가**, 몇 분 걸리는가
- 보존 기간이 적절한가
- 복원본에 개인정보가 있다면 접근이 제한되는가

위험한 작업 전에는 백업을 한 번 더 찍습니다. 큰 마이그레이션이나 대량 삭제 직전입니다.

## 운영 중에 꾸준히 할 일

배포는 끝이 아닙니다.

- **대시보드를 주기적으로 봅니다.** 알림이 울리기 전에 추세가 보입니다
- **의존성을 갱신합니다.** 미루면 한 번에 올리기 어려워집니다
- **로그 보존 기간과 비용을 확인합니다.** 방치하면 저장소가 터지거나 비용이 샙니다
- **장애가 났으면 기록을 남깁니다.** 원인과 재발 방지책을 적어 둡니다
- **설정과 비밀을 정기적으로 교체합니다**

가장 중요한 것은 **되돌릴 수 있는 상태를 유지하는 것**입니다. 롤백할 수 있고, 백업이 있고, 어느 버전이 돌고 있는지 알 수 있으면 대부분의 사고는 복구할 수 있습니다.
