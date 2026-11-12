---
title: AI 에이전트에게 최신 웹을 가르치기 - Modern Web Guidance
description: 크롬 팀이 공개한 Modern Web Guidance를 소개합니다. AI가 짜주는 웹 코드가 왜 낡아 있는지, 그걸 어떻게 고치는지 다룹니다.
outline: 2
head:
  - - meta
    - name: keywords
      content: Modern Web Guidance, Baseline, AI, 코딩 에이전트, Claude Code, Chrome, 웹 표준, 레거시 현대화
comment: true
---

# AI 에이전트에게 최신 웹을 가르치기 - Modern Web Guidance

## 들어가며

[Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance?hl=ko)는

AI가 웹 코드를 짤 때 최신 방식을 쓰도록 옆에서 알려주는, 크롬 팀이 만든 도구입니다.

<br>

요즘은 코드를 AI에게 맡기는 일이 많습니다.

Claude Code, Copilot 같은 도구에게 "로그인 창 하나 만들어줘" 라고 하면 코드가 나옵니다.

그런데 그 코드를 열어보면 종종 10년 전 방식으로 쓰여 있습니다.

<br>

브라우저에는 화면에 띄우는 창, 말풍선, 날짜 선택기 같은 기능이 이미 기본으로 들어 있습니다.

그냥 꺼내 쓰면 되는데, AI는 그걸 모른 채 똑같은 걸 새로 만듭니다.

겉보기엔 같지만 코드는 길어지고 더 잘 깨집니다.

키보드나 스크린리더를 쓰는 사람에게도 불편합니다.

## 왜 낡은 코드가 나올까

AI는 인터넷에 쌓인 코드를 보고 배웠습니다.

그런데 인터넷에 있는 웹 코드는 압도적으로 **옛날에 쓰인 것**입니다.

<br>

브라우저는 해마다 새 기능을 넣습니다.

예전엔 직접 만들어야 했던 것들이 지금은 기본 기능으로 들어와 있습니다.

하지만 AI가 배운 코드 더미에는 그 기능이 없던 시절의 글이 훨씬 많습니다.

<br>

그래서 AI는 **'가장 흔한 방식'** 을 꺼내옵니다.

'가장 좋은 방식'이 아니라요.

## 어떻게 해결하나

크롬 팀의 해법은 단순합니다.

AI 옆에 **참고서를 놓아두는 것**입니다.

<br>

Modern Web Guidance를 설치하면 AI는 코드를 짜기 전에 먼저 이 참고서를 펼칩니다.

"지금 만들려는 게 로그인 창이니까, 로그인 창 항목을 찾아보자" 하는 식입니다.

그리고 거기 적힌 최신 방식대로 코드를 씁니다.

<br>

참고서에는 100개가 넘는 주제가 들어 있습니다.

모두 크롬 팀이 직접 쓰고 검증한 내용입니다.

::: tip

AI 모델 자체를 더 똑똑한 것으로 바꾸는 방식이 아닙니다.

**필요한 순간에 필요한 지식만 찾아 읽게 하는** 방식입니다.

:::

## 설치하기

여기서부터는 직접 써보려는 분을 위한 내용입니다.

터미널에 아래 한 줄을 붙여넣으면 끝납니다.

```bash
npx modern-web-guidance@latest install
```

<br>

쓰고 있는 도구에 맞춰 직접 설치할 수도 있습니다.

| 도구 | 명령어 |
| --- | --- |
| Claude Code | `claude plugin install modern-web-guidance@claude-plugins-official` |
| Codex | `codex plugin marketplace add GoogleChrome/modern-web-guidance` 후 `codex plugin add modern-web-guidance@googlechrome` |
| Copilot CLI | `/plugin marketplace add GoogleChrome/modern-web-guidance` 후 `/plugin install modern-web-guidance@googlechrome` |
| Gemini CLI | `gemini extensions install https://github.com/GoogleChrome/modern-web-guidance --auto-update` |

::: tip

Antigravity, WebStorm, Goose, Grok, Kimi Code 등도 지원합니다.

전체 목록은 [시작하기 문서](https://developer.chrome.com/docs/modern-web-guidance/get-started?hl=ko)에서 확인할 수 있습니다.

:::

## 어디까지 최신 기능을 쓸까

여기서 한 가지 문제가 생깁니다.

**최신 기능이 항상 좋은 건 아니라는 점**입니다.

<br>

크롬에서는 되는데 사파리에서는 안 되는 기능이 있습니다.

새 기능일수록 이런 일이 잦습니다.

아이폰 사용자가 화면이 깨진 걸 보게 되면 곤란하겠죠.

<br>

그래서 웹에는 **Baseline**이라는 기준이 있습니다.

크롬, 사파리, 파이어폭스 등 주요 브라우저에서 **똑같이 동작하는지**를 세 단계로 나눈 것입니다.

| 단계 | 뜻 |
| --- | --- |
| Limited availability | 아직 일부 브라우저에서만 됩니다 |
| Newly available | 모든 주요 브라우저에서 되기 시작한 지 30개월이 안 됐습니다 |
| Widely available | 모든 주요 브라우저에서 된 지 30개월이 넘었습니다 |

<br>

30개월이라는 긴 기간을 두는 이유가 있습니다.

브라우저가 업데이트돼도 사람들이 바로 따라오지는 않기 때문입니다.

오래된 휴대폰을 쓰는 사람까지 대부분 따라올 시간을 기다리는 셈입니다.

<br>

우리 서비스가 어디까지 받아들일지는 프로젝트 폴더의 `AGENTS.md`나 `CLAUDE.md` 파일에 한 줄 적어두면 됩니다.

AI가 읽는 메모장 같은 파일입니다.

```md
This project's Baseline target is Baseline 2024.
```

<br>

적지 않으면 기본값은 `Widely available`입니다.

가장 안전한 쪽이니 그냥 쓰기 시작해도 괜찮습니다.

<br>

기준을 넘는 기능을 꼭 써야 한다면, 참고서가 **대비책까지 같이 알려줍니다.**

안 되는 브라우저에서는 다른 방식으로 보여주거나(폴백),

부족한 기능을 채워주는 보조 코드를 그 브라우저에서만 불러오는(폴리필) 식입니다.

## 어떤 주제를 다루나

참고서에 들어 있는 주제들입니다.

괄호 안은 해당 분야의 기술 이름입니다.

- **화면에 겹쳐 뜨는 것들** : 대화상자, 말풍선, 툴팁 (`<dialog>`, Popover API, CSS Anchor Positioning)
- **디자인** : 화면 크기에 따라 모양이 바뀌는 배치, 색 표현, 줄바꿈 (컨테이너 쿼리, `oklch`, subgrid, `text-wrap`)
- **움직임** : 페이지가 넘어갈 때의 전환 효과, 나타나고 사라지는 애니메이션 (View Transitions)
- **속도** : 눌렀을 때 반응이 굼뜬 문제, 이미지를 불러오는 순서 (INP, `scheduler.yield`)
- **입력 양식** : 글자에 맞춰 늘어나는 입력칸, 잘못 입력했을 때의 표시 (`field-sizing`, `:user-invalid`)
- **접근성** : 키보드만으로 쓰는 사람, 스크린리더를 쓰는 사람을 위한 처리
- **기기 안의 AI** : 서버에 보내지 않고 기기에서 바로 번역하거나 요약하는 기능
- **패스키** : 비밀번호 없이 지문이나 얼굴로 로그인하는 방식

<br>

설치하기 전에 참고서를 먼저 들춰볼 수도 있습니다.

```bash
npx modern-web-guidance@latest search "animate a dialog modal backdrop"
```

검색어에 맞는 항목 목록이 나오고,

그중 하나를 골라 내용을 통째로 볼 수 있습니다.

```bash
npx modern-web-guidance@latest retrieve "animate-to-from-top-layer"
```

AI가 실제로 무엇을 읽고 코드를 짜는지 확인할 수 있어서,

도입 전에 한 번쯤 돌려보기를 권합니다.

## 이미 있는 낡은 코드 손보기

새로 짜는 코드만 챙겨주는 게 아닙니다.

**이미 만들어둔 서비스에서 낡은 부분을 찾아내는 기능**도 있습니다.

```bash
npx modern-web-guidance legacy-scan <path> --json
```

<br>

이 명령을 돌리면 이런 순서로 진행됩니다.

1. **훑어보기** : 코드를 기계적으로 읽어 낡은 부분을 찾아냅니다. AI를 쓰지 않아서 비용이 들지 않습니다.
2. **걸러내기** : 찾아낸 것 중 **일부러 그렇게 짜둔 부분**을 뺍니다. 옛 브라우저를 위한 대비책이었다면 그대로 두는 게 맞으니까요.
3. **보고** : 남은 항목을 정리해 보여줍니다. 원하면 고치기 전에 계획부터 보여달라고 할 수 있습니다.
4. **고치고 다시 확인** : 참고서대로 고친 뒤, 다시 훑어보고 테스트를 돌려 확인합니다.

<br>

AI에게는 이렇게 말하면 됩니다.

```
Modernize this repository using Modern Web Guidance.
스캔하고 검증한 다음, 편집 전에 계획을 먼저 보여줘.
```

::: warning

"legacy patterns"나 "modernize" 같은 표현을 꼭 넣어야 합니다.

그냥 파일 이름만 말하면 낡은 코드를 찾는 게 아니라 일반적인 참고서 조회가 돌아갑니다.

:::

::: tip

**한 번에 자동으로 고쳐주는 기능은 없습니다.**

한 줄짜리 수정처럼 보여도 실제로는 여러 파일이 얽혀 있는 경우가 많기 때문입니다.

단계마다 사람이 확인하도록 만들어져 있습니다.

:::

## 마치며

이런 참고서는 **내용이 틀리면 안 쓰느니만 못합니다.**

그래서 크롬 팀은 항목마다 자동 검사를 돌립니다.

제대로 짠 코드는 전부 통과하고, 일부러 틀리게 짠 코드는 전부 걸러내야 참고서에 실립니다.

<br>

덕분에 권장 방식을 따르는 비율이 평균 37%p 올랐다고 합니다.

다만 이건 만든 쪽에서 밝힌 수치이고 상황에 따라 달라질 테니, 참고만 하면 되겠습니다.

<br>

개인적으로는 숫자보다 **접근 방식**이 더 인상적이었습니다.

AI가 최신 웹을 알아서 익히기를 기다리는 대신,

브라우저를 만드는 쪽에서 직접 지식을 떠먹여 주는 그림이니까요.

<br>

AI가 짜준 코드를 손보느라 시간을 쓰고 계셨다면,

한 번 설치해 볼 만합니다.

---

- [Modern Web Guidance 문서](https://developer.chrome.com/docs/modern-web-guidance?hl=ko)
- [GitHub 저장소](https://github.com/GoogleChrome/modern-web-guidance)
