---
title: 데브옵스 06. 컨테이너
description: 실행 환경을 이미지로 고정하고, 어디서든 같은 방식으로 띄웁니다.
outline: deep
---

# 06. 컨테이너

"제 컴퓨터에서는 되는데"를 없애는 도구입니다. 런타임 버전, 시스템 라이브러리, 설정까지 이미지에 담습니다.

## 가상 머신과의 차이

| | 가상 머신 | 컨테이너 |
| --- | --- | --- |
| 격리 수준 | 하드웨어 가상화 | 커널 공유, 네임스페이스로 분리 |
| 시작 시간 | 수십 초 | 수백 밀리초 |
| 크기 | 수 GB | 수십~수백 MB |
| 커널 | 각자 | 호스트와 공유 |

커널을 공유하므로 **리눅스 컨테이너는 리눅스 커널 위에서만** 돕니다. macOS나 Windows의 Docker Desktop은 안쪽에 리눅스 VM을 하나 띄워 두고 그 위에서 돌립니다.

## 이미지와 레이어

Dockerfile의 명령 하나가 레이어 하나입니다. 레이어는 캐시되고, **바뀐 레이어부터 아래가 전부 다시 빌드**됩니다.

```dockerfile
# 느립니다 — 소스가 한 줄만 바뀌어도 의존성을 다시 설치합니다
COPY . .
RUN npm ci
```

```dockerfile
# 빠릅니다 — 의존성 목록이 바뀔 때만 다시 설치합니다
COPY package*.json ./
RUN npm ci
COPY . .
```

**자주 바뀌는 것을 뒤에** 둡니다. 이 순서 하나로 빌드 시간이 분 단위에서 초 단위로 줄어듭니다.

## 멀티 스테이지 빌드

빌드 도구를 최종 이미지에 남기지 않습니다.

```dockerfile
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

컴파일러와 개발 의존성이 빠져 이미지가 작아지고, **공격 표면도 함께 줄어듭니다.** 최종 이미지에 셸과 패키지 관리자가 없으면 침입한 쪽이 할 수 있는 일이 적어집니다.

`USER node`를 빼면 컨테이너 안에서 root로 돕니다. 기본값이 root라 명시하지 않으면 그대로입니다.

## .dockerignore

빌드 컨텍스트가 전부 데몬으로 전송됩니다. `node_modules`가 들어가면 전송만 수십 초 걸립니다.

```
node_modules
.git
.env
dist
*.log
```

`.env`를 빼는 것이 중요합니다. 이미지에 들어간 비밀 값은 `docker history`로 들여다볼 수 있습니다.

## 태그

`latest`는 운영에서 쓰지 않습니다. 어느 버전이 돌고 있는지 알 수 없고, 롤백할 대상도 정할 수 없습니다.

```bash
docker build -t registry.example.com/api:v1.4.0 \
             -t registry.example.com/api:$(git rev-parse --short HEAD) .
```

커밋 해시를 태그로 두면 돌고 있는 이미지에서 소스를 바로 찾아갈 수 있습니다.

## 실행과 설정 주입

설정은 이미지에 굽지 않고 실행할 때 넣습니다. 같은 이미지가 개발과 운영에서 그대로 돌아야 합니다.

```bash
docker run -d \
  --name api \
  --env-file /etc/app/env \
  -p 3000:3000 \
  --restart unless-stopped \
  --memory 512m --cpus 1 \
  registry.example.com/api:v1.4.0
```

메모리 제한을 걸지 않으면 컨테이너 하나가 호스트 전체의 메모리를 먹고 다른 프로세스를 죽입니다.

## 로그와 데이터

컨테이너는 언제든 사라진다고 전제합니다.

**로그는 파일이 아니라 `stdout`으로** 내보냅니다. 컨테이너 안의 파일에 쓰면 컨테이너가 사라질 때 함께 사라지고, 로그 수집기가 가져가지도 못합니다.

```js
logger.info("서버 시작", { port: 3000 });   // stdout으로 나갑니다
```

남아야 하는 데이터는 볼륨에 둡니다.

```bash
docker volume create pgdata
docker run -v pgdata:/var/lib/postgresql/data postgres:17
```

| | 쓰는 곳 |
| --- | --- |
| 볼륨 | 운영 데이터 (Docker가 관리) |
| 바인드 마운트 | 개발 중 소스 반영 |
| tmpfs | 디스크에 남기면 안 되는 임시 데이터 |

## Docker Compose

여러 서비스를 함께 띄웁니다. 개발 환경을 맞추는 용도로 가장 많이 씁니다.

```yaml
services:
  api:
    build: .
    ports: ["3000:3000"]
    env_file: .env
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:17
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD:?}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      retries: 10

volumes:
  pgdata:
```

`depends_on`만 쓰면 **컨테이너가 떴을 뿐** DB가 접속을 받을 준비가 됐다는 뜻은 아닙니다. `condition: service_healthy`와 헬스 체크를 함께 걸어야 순서가 보장됩니다.

`${DB_PASSWORD:?}`는 값이 없으면 실행을 멈춥니다. 빈 비밀번호로 뜨는 것보다 낫습니다.

## 런타임 생태계

Docker가 전부는 아닙니다. 표준이 분리되어 있습니다.

| | 하는 일 |
| --- | --- |
| OCI | 이미지와 런타임 규격 |
| containerd | 실제로 컨테이너를 돌리는 런타임 |
| Docker | containerd를 감싼 개발자 도구 |
| Podman | 데몬 없이 도는 대안, 명령이 거의 같음 |

쿠버네티스는 containerd를 직접 씁니다. Docker로 만든 이미지가 그대로 도는 이유는 **OCI 규격을 따르기 때문**입니다. 빌드 도구를 바꿔도 결과물은 호환됩니다.
