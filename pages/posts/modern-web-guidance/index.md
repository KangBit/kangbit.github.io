---
title: Modern Web Guidance - AI 에이전트에게 최신 웹 가르치기
description: 크롬 팀이 공개한 Modern Web Guidance를 소개합니다. AI가 짜주는 웹 코드가 왜 낡아 있는지, 그걸 어떻게 고치는지 다룹니다.
outline: 2
head:
  - - meta
    - name: keywords
      content: Modern Web Guidance, Baseline, AI, 코딩 에이전트, Claude Code, Chrome, 웹 표준, 레거시 현대화
comment: true
---

# Modern Web Guidance - AI 에이전트에게 최신 웹 가르치기

## 들어가며

[Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance?hl=ko)는 웹 플랫폼 전문 지식, 권장사항, 브라우저 호환성 데이터를 코딩 에이전트에 직접 삽입하는 기술 모음입니다.

크롬 팀이 만든 도구로, 웹사이트를 만들 때 AI가 최신 방식을 쓰고 권장사항을 따르도록 합니다.

## 왜 낡은 코드가 나올까

요즘은 AI에게 "이런 페이지 하나 만들어줘" 라고 하면 뚝딱 코드를 만들어 줍니다.

그런데 그 코드를 보면 오래된 방식으로 쓰여 있는 경우가 많습니다.

AI는 인터넷에 쌓인 코드를 보고 배웠습니다.

그런데 인터넷에는 옛날에 쓰인 코드가 많습니다.

<br>

브라우저는 해마다 새 기능을 넣습니다.

하지만 AI가 배운 코드에는 그 기능이 없던 시절의 글이 훨씬 많습니다.

그래서 AI는 '흔한 방식' 으로 작성합니다.

## 어떻게 해결하나

AI에게 기술 모음을 삽입합니다.

Modern Web Guidance를 설치하면 AI는 코드를 짜기 전에 먼저 이 기술 모음을 펼칩니다.

그리고 거기 적힌 방식대로 코드를 씁니다.

<br>

기술 모음에는 100개가 넘는 주제가 들어 있습니다.

모두 크롬 팀이 직접 쓰고 검증한 내용입니다.

## 설치하기

터미널에 아래 한 줄을 붙여넣으면 끝납니다.

```bash
npx modern-web-guidance@latest install
```

<br>

쓰고 있는 도구에 맞춰 직접 설치할 수도 있습니다.

| 도구        | 명령어                                                                                                                 |
| ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| Claude Code | `claude plugin install modern-web-guidance@claude-plugins-official`                                                    |
| Codex       | `codex plugin marketplace add GoogleChrome/modern-web-guidance` 후 `codex plugin add modern-web-guidance@googlechrome` |
| Copilot CLI | `/plugin marketplace add GoogleChrome/modern-web-guidance` 후 `/plugin install modern-web-guidance@googlechrome`       |
| Gemini CLI  | `gemini extensions install https://github.com/GoogleChrome/modern-web-guidance --auto-update`                          |

## 어디까지 최신 기능을 쓸까

하지만 최신 기능이 항상 좋은 건 아닙니다.

크롬에서는 작동하지만 사파리에서는 작동하지 않는 기능이 있습니다.

그래서 웹에는 `Baseline` 이라는 기준이 있습니다.

주요 브라우저에서 똑같이 동작하는지 세 단계로 나눈 것입니다.

| 단계                 | 뜻                                                         |
| -------------------- | ---------------------------------------------------------- |
| Limited availability | 아직 일부 브라우저에서만 됩니다                            |
| Newly available      | 모든 주요 브라우저에서 되기 시작한 지 30개월이 안 됐습니다 |
| Widely available     | 모든 주요 브라우저에서 된 지 30개월이 넘었습니다           |

<br>

어디까지 받아들일지는 `AGENTS.md`나 `CLAUDE.md`에 적어두면 됩니다.

적지 않으면 가장 안전한 `Widely available`이 기본값입니다.

```md
This project's Baseline target is Baseline 2024.
```

<br>

일부 브라우저에서만 동작하는 기능을 써야 한다면 대비책도 함께 알려줍니다.

안 되는 브라우저에서는 다르게 보여주거나 ( 폴백 ),

부족한 기능을 채우는 코드를 그 브라우저에서만 불러옵니다 ( 폴리필 ).

## 어떤 주제를 다루나

기술 모음에 들어 있는 주제들입니다.

괄호 안은 해당 분야의 기술 이름입니다.

- 화면에 겹쳐 뜨는 것들 : 대화상자, 말풍선, 툴팁 (`<dialog>`, Popover API, CSS Anchor Positioning)
- 디자인 : 화면 크기에 따라 모양이 바뀌는 배치, 색 표현, 줄바꿈 (컨테이너 쿼리, `oklch`, subgrid, `text-wrap`)
- 움직임 : 페이지가 넘어갈 때의 전환 효과, 나타나고 사라지는 애니메이션 (View Transitions)
- 속도 : 눌렀을 때 반응이 굼뜬 문제, 이미지를 불러오는 순서 (INP, `scheduler.yield`)
- 입력 양식 : 글자에 맞춰 늘어나는 입력칸, 잘못 입력했을 때의 표시 (`field-sizing`, `:user-invalid`)
- 접근성 : 키보드만으로 쓰는 사람, 스크린리더를 쓰는 사람을 위한 처리
- 기기 안의 AI : 서버에 보내지 않고 기기에서 바로 번역하거나 요약하는 기능
- 패스키 : 비밀번호 없이 지문이나 얼굴로 로그인하는 방식

<br>

설치하기 전에 기술 모음을 먼저 들춰볼 수도 있습니다.

```bash
npx modern-web-guidance@latest search "animate a dialog modal backdrop"
```

검색어에 맞는 항목 목록이 나오고,

그중 하나를 골라 내용을 통째로 볼 수 있습니다.

```bash
npx modern-web-guidance@latest retrieve "animate-to-from-top-layer"
```

## 이미 있는 낡은 코드 손보기

이미 만들어둔 코드를 현대화 할 수도 있습니다.

```bash
npx modern-web-guidance legacy-scan <path> --json
```

프롬프트는 이렇게 작성하면 됩니다.

```
Modernize this repository using Modern Web Guidance.
Scan our frontend files for legacy patterns, verify the findings,
and propose a modernization plan before making any code edits.
```

---

- [Modern Web Guidance 문서](https://developer.chrome.com/docs/modern-web-guidance?hl=ko)
- [GitHub 저장소](https://github.com/GoogleChrome/modern-web-guidance)
