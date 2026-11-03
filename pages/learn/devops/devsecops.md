---
title: 데브옵스 보너스. 데브섹옵스
description: 보안 점검을 파이프라인 안으로 옮기고, 비밀과 의존성을 관리합니다.
outline: deep
---

# 보너스. 데브섹옵스

배포 직전에 보안 검토를 받으면 고치는 비용이 가장 비쌉니다. 점검을 앞으로 당겨 파이프라인 안에 넣습니다.

## 왜 앞으로 당기는가

```
설계에서 발견  →  고치는 비용 작음
개발 중 발견   →  보통
배포 직전 발견 →  일정이 밀림
운영 중 발견   →  장애 또는 유출
```

출시 직전의 보안 검토는 대체로 "통과시켜 달라"는 협상이 됩니다. 매 PR에서 자동으로 걸리면 그냥 고치고 넘어갑니다.

전부를 자동화할 수는 없습니다. 기계가 잘 잡는 것과 사람이 봐야 하는 것을 나눕니다.

| 자동화 | 사람 |
| --- | --- |
| 알려진 취약점, 비밀 값 노출 | 권한 설계, 업무 로직의 허점 |
| 설정 오류, 이미지 취약점 | 위협 모델링 |

## 코드 분석

| | 보는 것 | 도는 시점 |
| --- | --- | --- |
| SAST | 소스 코드의 위험 패턴 | PR |
| DAST | 돌고 있는 서비스를 밖에서 공격해 봄 | 스테이징 배포 후 |
| SCA | 의존성의 알려진 취약점 | PR, 정기 |

```yaml
      - uses: github/codeql-action/analyze@v3     # SAST
      - run: npm audit --audit-level=high         # SCA
```

SAST는 오탐이 많습니다. 전부 막으면 아무도 결과를 보지 않게 되므로, **심각도 높음 이상만** 빌드를 세우고 나머지는 리포트로 둡니다.

## 의존성

직접 쓰는 패키지보다 그 패키지가 끌어오는 것들이 더 많습니다.

```bash
npm audit --audit-level=high
npm audit fix
```

자동 갱신을 걸어 둡니다. Dependabot이나 Renovate가 PR을 만들어 주면, 테스트가 통과한 것부터 병합합니다.

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule: { interval: weekly }
    groups:
      minor-and-patch:
        update-types: [minor, patch]
```

묶지 않으면 매주 PR이 수십 개 열려 아무도 보지 않게 됩니다.

**SBOM**은 무엇이 들어갔는지의 목록입니다. 새 취약점이 공개됐을 때 "우리가 쓰고 있나"를 몇 분 안에 답할 수 있습니다.

```bash
syft dir:. -o cyclonedx-json > sbom.json
```

## 이미지 스캔

베이스 이미지에 들어 있는 OS 패키지 취약점이 대부분입니다.

```bash
trivy image --severity HIGH,CRITICAL --exit-code 1 registry.example.com/api:v1.4.0
```

`--exit-code 1`로 파이프라인을 세웁니다. 줄이는 방법은 스캔보다 **베이스 이미지 선택**에 있습니다.

| 베이스 | 들어 있는 것 |
| --- | --- |
| `node:22` | 전체 배포판, 빌드 도구 포함 |
| `node:22-slim` | 최소 패키지 |
| `distroless` | 런타임만, 셸도 없음 |

`distroless`는 셸이 없어 침입해도 할 수 있는 일이 적습니다. 대신 디버깅이 불편하니, 임시 디버그용 이미지를 따로 둡니다.

## 비밀 관리

가장 흔한 사고가 저장소에 올라간 토큰입니다.

```yaml
      - uses: gitleaks/gitleaks-action@v2
```

커밋 전 단계에서도 막습니다.

```bash
# .git/hooks/pre-commit
gitleaks protect --staged --redact
```

이미 올라갔다면 **이력을 고치기 전에 그 값부터 폐기**합니다. 공개 저장소는 수 분 안에 자동 수집기가 가져갑니다. 이력 정리는 그다음 문제입니다.

운영에서는 값을 코드 바깥에 둡니다.

| 방식 | 특징 |
| --- | --- |
| 클라우드 시크릿 서비스 | 제공자에 묶이지만 설정이 간단 |
| HashiCorp Vault | 동적 자격 증명, 자동 폐기 |
| Sealed Secrets / External Secrets | 쿠버네티스에서 Git에 안전하게 올리기 |

Vault의 장점은 **수명이 짧은 자격 증명**입니다. DB 비밀번호를 요청할 때마다 새로 만들고 한 시간 뒤 폐기하면, 유출돼도 창이 좁습니다.

쿠버네티스 Secret은 base64일 뿐 암호화가 아닙니다([07. 컨테이너 오케스트레이션](/learn/devops/kubernetes)). etcd 암호화를 켜고 RBAC로 읽을 수 있는 대상을 좁힙니다.

## 런타임 탐지

빌드 때 못 잡은 것은 돌고 있는 동안 봅니다. Falco가 커널 수준에서 수상한 동작을 감지합니다.

```yaml
- rule: 컨테이너에서 셸 실행
  condition: container and proc.name in (bash, sh)
  output: 컨테이너 셸 (user=%user.name container=%container.name)
  priority: WARNING
```

운영 컨테이너에서 셸이 뜨는 것은 정상적인 상황이 아닙니다. 사람이 긴급 조치로 들어갔거나, 들어오면 안 되는 쪽이 들어왔거나 둘 중 하나입니다.

## 설정 점검

코드형 인프라도 스캔 대상입니다. 적용되기 전에 잡는 편이 훨씬 쌉니다.

```bash
tfsec .
checkov -d .
```

자주 걸리는 항목입니다.

- 보안 그룹이 `0.0.0.0/0`으로 열림
- 저장소 암호화가 꺼짐
- 로깅이 비활성
- IAM 정책이 `*`

## 공급망

내 코드가 아니라 **빌드 과정**을 노리는 공격입니다. 라이브러리 하나가 탈취되면 그것을 쓰는 모두가 영향을 받습니다.

- 액션과 이미지를 태그가 아니라 **해시로 고정**합니다. 태그는 다시 올릴 수 있습니다
- 빌드가 어디서 무엇으로 만들어졌는지 증명을 남깁니다(SLSA)
- 서명하고 배포 전에 검증합니다

```yaml
      - uses: actions/checkout@692973e3d937129bcbf40652eb9f2f61becf3332   # v4.1.7
```

```bash
cosign sign --key cosign.key registry.example.com/api:v1.4.0
cosign verify --key cosign.pub registry.example.com/api:v1.4.0
```

## 어디서부터 할까

전부를 한 번에 넣으면 파이프라인이 느려지고 알림만 쌓입니다. 비용 대비 효과가 큰 순서입니다.

1. **비밀 값 탐지** — 사고 규모가 가장 크고 도입이 가장 쉽습니다
2. **의존성 자동 갱신** — 알려진 취약점 대부분이 여기서 들어옵니다
3. **이미지 스캔** — 베이스 이미지를 바꾸는 것만으로 크게 줄어듭니다
4. **인프라 설정 점검** — 열려 있는 포트와 꺼진 암호화
5. **SAST와 DAST** — 오탐 정리에 시간이 드니 마지막에

[OWASP DevSecOps Guideline](https://owasp.org/www-project-devsecops-guideline/)에 단계별 정리가 있습니다. 애플리케이션 쪽 취약점은 [백엔드 07. 서버 보안](/learn/backend/security)에서 다룹니다.
