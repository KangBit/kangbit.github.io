---
title: AI 에이전트에게 최신 웹을 가르치기 - Modern Web Guidance
description: 크롬 팀이 공개한 Modern Web Guidance를 소개합니다. AI 코딩 에이전트에 웹 플랫폼 모범 사례와 브라우저 호환성 데이터를 주입하는 스킬 모음입니다.
outline: 2
head:
  - - meta
    - name: keywords
      content: Modern Web Guidance, Baseline, AI, 코딩 에이전트, Claude Code, Chrome, 웹 표준, 레거시 현대화
comment: true
---

# AI 에이전트에게 최신 웹을 가르치기 - Modern Web Guidance

## 들어가며

AI 에이전트에게 모달을 만들어 달라고 하면 어떤 코드가 나올까요?

높은 확률로 `div`에 `position: fixed`를 주고,

포커스 트랩과 `Esc` 키 처리를 직접 구현한 코드를 받게 됩니다.

툴팁을 요청하면 `getBoundingClientRect()`로 좌표를 계산하는 코드가 나오고요.

이미 브라우저에는 `<dialog>`와 Popover API, CSS Anchor Positioning이 들어와 있는데도 말이죠.

<br>

이유는 단순합니다.

모델이 학습한 대부분의 웹 코드가 그 기능들이 없던 시절에 쓰인 코드이기 때문입니다.

에이전트는 '가장 흔한 코드'를 쓰지, '가장 최신인 코드'를 쓰지 않습니다.

<br>

[Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance?hl=ko)는

크롬 팀이 이 간극을 메우기 위해 공개한 도구입니다.

## Modern Web Guidance란?

> 웹 플랫폼 전문 지식, 권장사항, 브라우저 호환성 데이터를 코딩 에이전트에 직접 삽입하는 기술 모음

문서는 스스로를 이렇게 소개합니다.

<br>

모델을 바꾸거나 프롬프트를 길게 쓰는 방식이 아니라,

**필요한 순간에 필요한 지식만 꺼내 읽게 하는 방식**입니다.

## 설치하기

CLI로 설치하는 방법이 권장됩니다. 자동 업데이트를 받을 수 있습니다.

```bash
npx modern-web-guidance@latest install
```

에이전트별로 직접 설치할 수도 있습니다.

| 에이전트 | 명령어 |
| --- | --- |
| Claude Code | `claude plugin install modern-web-guidance@claude-plugins-official` |
| Codex | `codex plugin marketplace add GoogleChrome/modern-web-guidance` 후 `codex plugin add modern-web-guidance@googlechrome` |
| Copilot CLI | `/plugin marketplace add GoogleChrome/modern-web-guidance` 후 `/plugin install modern-web-guidance@googlechrome` |
| Gemini CLI | `gemini extensions install https://github.com/GoogleChrome/modern-web-guidance --auto-update` |
| npx skills | `npx skills add GoogleChrome/modern-web-guidance` |

::: tip

Antigravity, WebStorm, Goose, Grok, Kimi Code 등도 지원합니다.

전체 목록은 [시작하기 문서](https://developer.chrome.com/docs/modern-web-guidance/get-started?hl=ko)에서 확인할 수 있습니다.

:::

## Baseline 목표 설정하기

이 도구의 핵심은 **Baseline**입니다.

주요 브라우저 엔진에서 상호 운용이 가능한지를 기준으로 웹 기능을 세 단계로 나눕니다.

| 단계 | 의미 |
| --- | --- |
| Limited availability | 아직 상호 운용되지 않음 |
| Newly available | 최근 30개월 이내에 상호 운용 가능해짐 |
| Widely available | 30개월 이상 상호 운용 가능 |

<br>

프로젝트가 어디까지 받아들일지는 `AGENTS.md`나 `CLAUDE.md`에 적어두면 됩니다.

```md
This project's Baseline target is Baseline 2024.
```

지정하지 않으면 기본값은 `Widely available`입니다.

가장 보수적인 선택이니, 안 적어두고 쓰기 시작해도 큰 문제는 없습니다.

<br>

목표를 벗어나는 기능은 가이드가 점진적 향상과 폴백을 함께 제시하고,

폴리필이 필요하면 해당 브라우저에서만 조건부로 불러오도록 안내합니다.

<br>

한 엔진에서만 구현된 실험적 기능이나 오리진 트라이얼 기능까지 받아보고 싶다면

프로젝트 루트에서 아래 명령을 실행하면 됩니다.

```bash
npx modern-web-guidance@latest set-allow-volatile-features
```

```bash
npx modern-web-guidance@latest set-allow-origin-trials
```

## 어떤 가이드가 들어있나

100개가 넘는 사용 사례를 다루고 있습니다.

- **내장 UI** : `<dialog>`, Popover API, CSS Anchor Positioning
- **CSS** : 컨테이너 쿼리, `oklch`, subgrid, `text-wrap`, line-height trimming
- **UX** : View Transitions, 진입/퇴장 애니메이션, `scrollbar-color`
- **성능** : INP 진단, `scheduler.yield`, 백그라운드 작업 스케줄링, 이미지 로딩 우선순위
- **폼** : `field-sizing: content`, `:user-invalid`
- **접근성** : 오류 알림, 키보드 포커스 관리
- **내장 AI** : 온디바이스 Language Detection, Summarization, Translation API
- **패스키** : 등록, 인증, 관리

<br>

설치하지 않고 CLI로 먼저 들여다볼 수도 있습니다.

```bash
npx modern-web-guidance@latest search "animate a dialog modal backdrop"
```

```bash
npx modern-web-guidance@latest retrieve "animate-to-from-top-layer"
```

`search`는 가이드 ID와 설명을 JSON으로 주고, `retrieve`는 해당 가이드 본문을 그대로 출력합니다.

에이전트가 실제로 무엇을 읽는지 확인해 볼 수 있어서,

도입 전에 한 번쯤 돌려보기를 권합니다.

## 레거시 현대화 워크플로

새로 만드는 코드보다 더 반가운 기능입니다.

기존 코드에서 낡은 패턴을 찾아 바꾸는 흐름을 따로 제공합니다. (버전 1.0 이상 필요)

```bash
npx modern-web-guidance legacy-scan <path> --json
```

<br>

진행 단계는 다음과 같습니다.

1. **스캔** : 문자열로 후보 파일을 거른 뒤 AST, CSS, HTML 파서로 분석합니다. LLM 호출이 없어서 토큰 비용이 들지 않습니다.
2. **문맥 검증** : 규칙마다 정의된 `keepWhen` / `dropWhen` 기준으로 주변 코드를 확인합니다. 의도된 폴백이나 `@supports` 가드는 결과에서 빠집니다.
3. **보고** : 검증된 항목을 정리하고, 요청하면 편집 전에 수정 계획을 먼저 보여줍니다.
4. **리팩터링과 재검증** : `retrieve`로 가이드를 가져와 고친 뒤, `legacy-scan`을 다시 돌리고 테스트를 실행합니다.

<br>

에이전트에게는 이렇게 요청하면 됩니다.

```
Modernize this repository using Modern Web Guidance.
스캔하고 검증한 다음, 편집 전에 계획을 먼저 보여줘.
```

```
Check src/components/forms for legacy web patterns.
```

::: warning

컴포넌트 이름만 지정하면 현대화 스캔이 아니라 일반 가이드 조회가 실행됩니다.

"legacy patterns"나 "modernize" 같은 표현을 함께 써야 합니다.

:::

::: tip

자동 수정 플래그(`--fix`)는 없습니다.

단순해 보이는 변경도 JS 리스너나 npm 패키지를 HTML/CSS로 옮기는 교차 계층 작업일 수 있기 때문입니다.

CI/CD 연동은 아직 개발 중이라고 합니다.

:::

## 마치며

문서에 따르면 각 사용 사례는 Playwright 기반 QA 하네스로 평가됩니다.

정답 구현은 100%, 일부러 결함을 넣은 구현은 0%를 통과해야 가이드로 채택된다고 합니다.

모범 사례 준수율이 평균 37%p 올랐다는 수치도 함께 소개하고 있는데,

이건 제작사가 밝힌 값이고 모델과 프로젝트에 따라 달라질 수 있으니 참고만 하면 되겠습니다.

<br>

개인적으로는 숫자보다 **접근 방식**이 더 인상적이었습니다.

AI에게 최신 웹을 쓰게 하려고 모델을 기다리는 대신,

브라우저를 만드는 쪽에서 직접 지식을 떠먹여 주는 그림이니까요.

<br>

에이전트가 짜준 코드에서 `<dialog>` 대신 `div` 모달을 몇 번 걷어내 보셨다면,

한 번 설치해 볼 만합니다.

---

- [Modern Web Guidance 문서](https://developer.chrome.com/docs/modern-web-guidance?hl=ko)
- [GitHub 저장소](https://github.com/GoogleChrome/modern-web-guidance)
