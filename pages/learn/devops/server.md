---
title: 데브옵스 05. 서버와 트래픽 처리
description: 웹 서버와 역방향 프록시, 로드 밸런서로 요청을 받아 나눠 보냅니다.
outline: deep
---

# 05. 서버와 트래픽 처리

애플리케이션 앞에 한 겹을 두면 TLS, 정적 파일, 부하 분산을 애플리케이션이 직접 하지 않아도 됩니다.

## 앞단에 두는 이유

애플리케이션 프로세스가 직접 하면 손해인 일들이 있습니다.

| 하는 일 | 앞단에 두는 이유 |
| --- | --- |
| TLS 종료 | 인증서 갱신을 한 곳에서 처리 |
| 정적 파일 전달 | 애플리케이션 스레드를 쓰지 않음 |
| 응답 압축 | 최적화된 구현을 그대로 사용 |
| 연결 수 제한 | 느린 클라이언트가 애플리케이션을 붙잡지 못하게 |
| 부하 분산 | 애플리케이션을 여러 개 띄울 수 있게 |

## 정방향 프록시와 역방향 프록시

이름이 비슷하지만 서 있는 자리가 반대입니다.

| | 위치 | 숨기는 것 | 쓰는 곳 |
| --- | --- | --- | --- |
| 정방향 프록시 | 클라이언트 쪽 | 클라이언트 | 사내망에서 외부 접속 통제 |
| 역방향 프록시 | 서버 쪽 | 서버 | 웹 서비스 앞단 |

운영에서 "프록시"라고 하면 대부분 역방향 프록시입니다.

## Nginx 기본 설정

```nginx
upstream app {
  server 127.0.0.1:3000;
  server 127.0.0.1:3001;
  keepalive 32;
}

server {
  listen 443 ssl;
  http2 on;
  server_name api.example.com;

  ssl_certificate     /etc/letsencrypt/live/api.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

  location /static/ {
    root /srv/app/public;
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  location / {
    proxy_pass http://app;
    proxy_http_version 1.1;
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 30s;
  }
}
```

`X-Forwarded-*` 헤더를 빼면 애플리케이션이 보는 클라이언트 IP가 전부 프록시의 IP가 됩니다. 속도 제한과 접근 로그가 한꺼번에 망가집니다. 애플리케이션 쪽에서도 **프록시를 신뢰하도록** 설정해야 합니다.

```js
app.set("trust proxy", 1);   // Express
```

`http2 on;`은 1.25.1부터의 문법입니다. 예전 자료의 `listen 443 ssl http2;`는 폐기됐습니다.

## Caddy라는 선택지

같은 일을 훨씬 짧게 적습니다. 인증서 발급과 갱신이 기본으로 들어 있습니다.

```caddyfile
api.example.com {
  encode gzip
  handle_path /static/* {
    root * /srv/app/public
    file_server
  }
  reverse_proxy localhost:3000 localhost:3001
}
```

세밀한 제어가 필요하면 Nginx, 설정을 줄이고 싶으면 Caddy 쪽이 편합니다.

## 로드 밸런싱

여러 인스턴스에 요청을 나눠 보냅니다.

| 방식 | 기준 |
| --- | --- |
| 라운드 로빈 | 순서대로 |
| 최소 연결 | 처리 중인 연결이 가장 적은 쪽 |
| IP 해시 | 같은 클라이언트는 같은 서버로 |

요청 처리 시간이 들쭉날쭉하면 라운드 로빈이 한쪽에 몰립니다. **최소 연결**이 대체로 무난합니다.

IP 해시로 세션을 특정 서버에 묶는 방식(스티키 세션)은 되도록 피합니다. 그 서버가 죽으면 세션도 사라지고, 인스턴스를 늘려도 부하가 고르게 퍼지지 않습니다. 세션은 Redis 같은 **공유 저장소**로 빼는 편이 낫습니다.

## 헬스 체크

죽은 인스턴스로 요청이 가지 않게 하는 장치입니다.

```nginx
upstream app {
  server 127.0.0.1:3000 max_fails=3 fail_timeout=10s;
  server 127.0.0.1:3001 max_fails=3 fail_timeout=10s;
}
```

애플리케이션 쪽에는 두 종류를 둡니다.

| 엔드포인트 | 확인하는 것 | 실패하면 |
| --- | --- | --- |
| `/health/live` | 프로세스가 살아 있는지 | 재시작 |
| `/health/ready` | 요청을 받을 준비가 됐는지 | 트래픽에서 제외 |

`ready`에서 DB 연결까지 확인하는 경우가 많은데, 주의할 점이 있습니다. DB가 잠깐 흔들리면 **모든 인스턴스가 동시에 빠져** 서비스 전체가 멈춥니다. 의존성 확인은 신중하게 넣습니다.

## 캐시와 CDN

같은 응답을 반복해서 만들지 않습니다.

```nginx
location /api/public/ {
  proxy_cache api_cache;
  proxy_cache_valid 200 60s;
  proxy_cache_use_stale error timeout updating;
  add_header X-Cache-Status $upstream_cache_status;
}
```

`proxy_cache_use_stale`이 유용합니다. 원본이 실패하는 동안 **만료된 응답이라도 내보내** 장애를 덮습니다.

정적 파일은 CDN에 맡깁니다. 파일 이름에 해시가 들어가면 캐시 기간을 길게 잡아도 됩니다.

```
app.4f2a91c3.js    →  Cache-Control: public, max-age=31536000, immutable
index.html         →  Cache-Control: no-cache
```

HTML만 매번 확인하고 나머지는 1년을 캐시합니다. 배포하면 파일 이름이 바뀌므로 무효화가 필요 없습니다.

## 로그 읽기

접근 로그에 응답 시간을 넣어 둡니다. 기본 형식에는 없습니다.

```nginx
log_format timed '$remote_addr "$request" $status '
                 '$body_bytes_sent ${request_time}s '
                 'upstream=${upstream_response_time}s';
```

`request_time`과 `upstream_response_time`의 차이가 크면 애플리케이션이 아니라 **네트워크나 클라이언트 쪽**이 느린 것입니다. 느린 응답을 쫓을 때 이 두 값을 먼저 봅니다.
