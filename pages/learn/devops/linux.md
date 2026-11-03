---
title: 데브옵스 03. 리눅스와 셸 스크립트
description: 서버에 접속해 파일과 프로세스를 다루고, 반복 작업을 셸로 묶습니다.
outline: deep
---

# 03. 리눅스와 셸 스크립트

컨테이너 안도, 클라우드의 가상 서버도 리눅스입니다. 어디서 무엇이 돌고 있는지 직접 확인할 수 있어야 합니다.

## 배포판의 차이

| 계열 | 패키지 관리 | 자주 보는 곳 |
| --- | --- | --- |
| Debian·Ubuntu | `apt` | 컨테이너 베이스 이미지, 클라우드 기본 이미지 |
| RHEL·Rocky·Amazon Linux | `dnf`(`yum`) | 기업 환경, AWS |
| Alpine | `apk` | 작은 컨테이너 이미지 |

명령 이름과 경로가 조금씩 다를 뿐 구조는 같습니다. Alpine은 glibc 대신 musl을 써서, 일부 바이너리가 그대로 돌지 않는 점만 기억해 둡니다.

## 파일과 텍스트 다루기

로그를 뒤지는 일이 가장 많습니다. 파이프로 이어 붙이는 감각을 먼저 익힙니다.

```bash
# 오늘 로그에서 500 응답만 세기
grep ' 500 ' /var/log/nginx/access.log | wc -l

# 요청이 많은 IP 상위 10개
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -10

# 최근 로그를 따라가며 오류만 보기
tail -f app.log | grep --line-buffered -i error
```

`tail -f | grep`에는 **`--line-buffered`** 가 필요합니다. 없으면 버퍼가 찰 때까지 출력이 나오지 않아 멈춘 것처럼 보입니다.

파일을 찾을 때는 조건을 붙입니다.

```bash
find /var/log -name '*.log' -size +100M -mtime +7
```

## 권한과 소유자

권한 문제로 막히는 일이 반복됩니다. 숫자의 의미만 알면 대부분 풀립니다.

```bash
chmod 600 id_rsa        # 소유자만 읽기·쓰기
chmod 755 deploy.sh     # 소유자는 전부, 나머지는 읽기·실행
chown -R app:app /srv/app
```

| 숫자 | 권한 |
| --- | --- |
| 4 | 읽기 |
| 2 | 쓰기 |
| 1 | 실행 |

SSH 키는 `600`이 아니면 클라이언트가 사용을 거부합니다. 권한이 느슨하면 같은 서버의 다른 사용자가 읽을 수 있기 때문입니다.

서비스는 **전용 사용자**로 돌립니다. root로 돌리는 프로세스가 뚫리면 서버 전체를 내줍니다.

## 프로세스와 자원

"서버가 느리다"는 신고를 받았을 때 보는 순서입니다.

```bash
top                     # CPU와 메모리를 쓰는 프로세스
df -h                   # 디스크 여유 공간
free -h                 # 메모리와 스왑
ss -tlnp                # 열려 있는 포트와 프로세스
journalctl -u app -n 100 --no-pager   # 서비스 로그
```

디스크가 찬 경우가 생각보다 잦습니다. 로그 회전이 걸려 있지 않으면 몇 달 뒤에 서비스가 멈춥니다.

```bash
du -sh /var/log/* | sort -rh | head
```

## systemd로 서비스 등록

프로세스를 띄워 두는 일을 셸에 맡기지 않습니다. 재시작과 로그를 systemd가 맡습니다.

```ini
# /etc/systemd/system/app.service
[Unit]
Description=Todo API
After=network.target

[Service]
User=app
WorkingDirectory=/srv/app
EnvironmentFile=/etc/app/env
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now app
systemctl status app
```

`Restart=always`가 프로세스가 죽었을 때 다시 띄웁니다. 다만 **즉시 죽는 오류**라면 무한히 재시작하므로, 로그를 보고 원인을 찾습니다.

## SSH 접속과 파일 전송

비밀번호 대신 키를 씁니다.

```bash
ssh-keygen -t ed25519 -C "deploy@ci"
ssh-copy-id -i ~/.ssh/id_ed25519.pub app@server
```

자주 쓰는 서버는 설정에 적어 둡니다.

```
# ~/.ssh/config
Host prod-api
  HostName 10.0.1.20
  User app
  IdentityFile ~/.ssh/id_ed25519
  ProxyJump bastion
```

`ProxyJump`로 **배스천을 거쳐** 사설망 안의 서버에 붙습니다. 서버마다 공인 IP를 열어 두는 것보다 안전합니다.

```bash
rsync -avz --delete dist/ prod-api:/srv/app/dist/
```

## 셸 스크립트의 기본 틀

스크립트는 첫 줄로 안전장치를 겁니다.

```bash
#!/usr/bin/env bash
set -euo pipefail
```

| 옵션 | 하는 일 |
| --- | --- |
| `-e` | 명령이 실패하면 즉시 종료 |
| `-u` | 정의되지 않은 변수를 쓰면 오류 |
| `-o pipefail` | 파이프 중간이 실패해도 실패로 처리 |

이 세 줄이 없으면 중간 단계가 실패해도 스크립트가 계속 돌아, 빈 디렉터리를 배포하는 일이 생깁니다.

```bash
#!/usr/bin/env bash
set -euo pipefail

readonly TARGET="${1:?배포 대상을 지정하세요}"
readonly RELEASE="/srv/app/releases/$(date +%Y%m%d%H%M%S)"

cleanup() {
  [[ -d "$RELEASE" ]] && rm -rf "$RELEASE"
}
trap cleanup ERR

mkdir -p "$RELEASE"
rsync -a dist/ "$RELEASE/"
ln -sfn "$RELEASE" /srv/app/current
systemctl restart app
```

변수는 **반드시 따옴표로 감쌉니다.** 경로에 공백이 있으면 따옴표 없는 `$VAR`는 두 개의 인자로 쪼개집니다.

`trap`으로 실패 시 뒷정리를 겁니다. 중간에 끊긴 릴리스 디렉터리가 쌓이면 디스크를 먹습니다.

## 주기 작업

```bash
# crontab -e
0 4 * * * /srv/app/bin/backup.sh >> /var/log/backup.log 2>&1
```

`2>&1`을 빼면 오류 메시지가 사라집니다. cron은 실패해도 조용하므로, **실패를 알리는 경로**를 따로 둡니다. systemd timer를 쓰면 `journalctl`로 이력이 남아 추적이 쉽습니다.
