---
title: 데브옵스 09. CI/CD
description: 빌드, 테스트, 배포를 자동화하고 되돌릴 수 있는 경로를 만듭니다.
outline: deep
---

# 09. CI/CD

손으로 배포하면 사람마다 순서가 다르고, 바쁠 때 단계를 건너뜁니다. 파이프라인은 그 순서를 코드로 고정합니다.

## CI와 CD

| | 하는 일 |
| --- | --- |
| CI (지속적 통합) | 변경마다 빌드·테스트해서 **합칠 수 있는 상태**인지 확인 |
| CD (지속적 전달) | 언제든 배포 가능한 아티팩트를 준비 |
| CD (지속적 배포) | 검증을 통과하면 **자동으로** 운영까지 |

같은 약자지만 마지막 단계에 사람의 승인이 있는지로 갈립니다. 처음에는 전달까지만 자동화하고, 신뢰가 쌓이면 배포로 넘어갑니다.

## 파이프라인 단계

```
푸시 → 린트·타입 검사 → 테스트 → 빌드 → 이미지 푸시 → 스테이징 배포 → 운영 배포
```

**빠른 것을 앞에** 둡니다. 린트에서 걸릴 변경을 10분짜리 테스트 뒤에 발견할 이유가 없습니다.

## GitHub Actions

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test --reporter=junit --outputFile=report.xml
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-report
          path: report.xml
```

`concurrency`가 중요합니다. 같은 브랜치에 연달아 푸시하면 **앞의 실행을 취소**해서 자원을 아낍니다.

`--frozen-lockfile`은 락 파일과 다르면 실패시킵니다. CI가 로컬과 다른 버전을 설치하는 상황을 막습니다.

`if: always()`를 붙여야 테스트가 실패해도 리포트가 올라갑니다.

## 캐시

의존성 설치가 파이프라인 시간의 절반을 차지하는 경우가 많습니다.

```yaml
      - uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: playwright-${{ hashFiles('pnpm-lock.yaml') }}
```

키에 **락 파일 해시**를 넣습니다. 의존성이 바뀌면 키가 달라져 새로 받고, 그대로면 캐시를 씁니다.

Docker 빌드에도 같은 원리를 적용합니다.

```yaml
      - uses: docker/build-push-action@v6
        with:
          push: true
          tags: ${{ env.IMAGE }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

## 비밀 값과 권한

비밀 값은 저장소 설정에 두고 참조만 합니다.

```yaml
    env:
      DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

로그에 찍히면 마스킹되지만, 가공한 값(base64로 인코딩하는 등)은 걸러지지 않습니다. **비밀 값을 변형해서 출력하지 않습니다.**

장기 토큰 대신 OIDC로 단기 자격 증명을 받는 쪽이 안전합니다.

```yaml
    permissions:
      id-token: write
      contents: read
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-deploy
          aws-region: ap-northeast-2
```

저장소에 영구 액세스 키를 두지 않아도 되고, 유출돼도 수명이 짧습니다.

`permissions`는 최소로 둡니다. 기본값이 넓게 잡힌 조직이 많아, 워크플로가 저장소를 고칠 수 있는 상태로 도는 경우가 있습니다.

## 배포 전략

| 전략 | 방식 | 되돌리기 |
| --- | --- | --- |
| 롤링 | 조금씩 교체 | 이전 버전으로 다시 롤링 |
| 블루-그린 | 새 환경을 띄우고 트래픽을 한 번에 전환 | 트래픽을 되돌림 (빠름) |
| 카나리 | 일부 트래픽만 새 버전으로 | 비율을 0으로 |

쿠버네티스의 기본은 롤링입니다.

```yaml
spec:
  strategy:
    rollingUpdate:
      maxUnavailable: 0     # 줄어들지 않게
      maxSurge: 1           # 하나씩 더 띄우고 교체
```

`maxUnavailable: 0`이면 용량이 줄지 않지만 배포가 느려집니다. 트래픽이 많은 시간대에는 이쪽이 안전합니다.

카나리는 **지표와 함께** 써야 의미가 있습니다. 5%로 내보내고 오류율을 보지 않으면 그냥 느린 배포입니다([10. 모니터링과 관측](/learn/devops/monitoring)).

## 데이터베이스 마이그레이션

배포에서 가장 되돌리기 어려운 부분입니다. 코드는 이전 이미지로 돌아가면 되지만 스키마는 그렇지 않습니다.

**앞뒤 호환되게** 나눠서 적용합니다.

```
1차 배포: 컬럼 추가 (NULL 허용) — 옛 코드도 새 코드도 동작
2차 배포: 새 컬럼을 쓰는 코드
3차 배포: 옛 컬럼 제거
```

한 번에 컬럼을 바꾸면, 롤링 중에 옛 코드와 새 코드가 동시에 도는 구간에서 한쪽이 깨집니다.

## 롤백

배포 자동화보다 **롤백 자동화**가 먼저입니다.

```bash
kubectl rollout undo deploy/api -n prod
helm rollback api -n prod
```

롤백이 한 명령으로 끝나지 않으면, 장애 상황에서 원인을 찾느라 시간을 씁니다. 되돌려 놓고 천천히 보는 쪽이 낫습니다.

조건을 미리 정해 둡니다.

- 오류율이 평소의 몇 배를 넘으면 롤백
- 헬스 체크가 N분간 실패하면 롤백
- 판단이 서지 않으면 롤백

## 파이프라인을 신뢰할 수 있게

가끔 실패하는 테스트를 방치하면 아무도 결과를 보지 않게 됩니다. 그때부터 파이프라인은 통과 의례가 됩니다.

- 불안정한 테스트는 고치거나 떼어 냅니다. 재실행으로 넘기지 않습니다
- 10분을 넘기면 사람이 기다리지 않습니다. 병렬로 쪼갭니다
- 실패 메시지에 **무엇을 해야 하는지**가 보여야 합니다
- 메인 브랜치가 깨지면 다른 작업보다 먼저 고칩니다
