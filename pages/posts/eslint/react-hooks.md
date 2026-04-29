---
title: eslint-plugin-react-hooks
description: eslint-plugin-react-hooks 규칙을 한국어로 정리합니다.
head:
  - - meta
    - name: keywords
      content: ESLint, React Hooks, eslint-plugin-react-hooks
comment: true
---

# eslint-plugin-react-hooks

::: info
이 문서는 ChatGPT 5.5를 통해 작성되었습니다.
:::

기준일: 2026-04-29  
기준 버전: `eslint-plugin-react-hooks@7.1.1`  
출처: [npm eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks), 패키지 배포본의 `rules` 메타데이터

## 규칙 목록

| 규칙                             | 설명                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------ |
| `capitalized-calls`              | 대문자로 시작하는 함수나 메서드를 일반 함수처럼 호출하지 않고 JSX로 사용하도록 검사합니다. |
| `config`                         | React Compiler 설정 옵션이 유효한지 검사합니다.                                            |
| `error-boundaries`               | 자식 컴포넌트 오류 처리를 `try/catch`가 아니라 Error Boundary로 하도록 검사합니다.         |
| `exhaustive-deps`                | `useEffect` 등 Hooks의 의존성 배열이 실제 사용값을 빠짐없이 포함하는지 검사합니다.         |
| `exhaustive-effect-dependencies` | effect 의존성이 빠짐없고 불필요한 값이 없는지 더 엄격하게 검사합니다.                      |
| `fbt`                            | `fbt` 사용 방식이 유효한지 검사합니다.                                                     |
| `gating`                         | React Compiler gating mode 설정이 유효한지 검사합니다.                                     |
| `globals`                        | 렌더 중 전역 값에 할당하거나 전역 값을 변경하는 부작용을 금지합니다.                       |
| `hooks`                          | Hooks 사용 규칙을 검사하는 React Compiler 계열 규칙입니다.                                 |
| `immutability`                   | props, state 등 불변이어야 하는 값을 직접 변경하지 못하게 합니다.                          |
| `incompatible-library`           | memoization과 호환되지 않는 라이브러리 사용을 경고합니다.                                  |
| `invariant`                      | React Compiler 내부 불변 조건을 검사합니다.                                                |
| `memo-dependencies`              | `useMemo()`와 `useCallback()` 의존성이 충분하고 불필요한 값이 없는지 검사합니다.           |
| `memoized-effect-dependencies`   | effect 의존성으로 쓰는 값이 memoized되어 있는지 검사합니다.                                |
| `no-deriving-state-in-effects`   | effect 안에서 state로부터 다시 파생 state를 만드는 패턴을 금지합니다.                      |
| `preserve-manual-memoization`    | React Compiler가 기존 수동 memoization 의도를 깨지 않도록 검사합니다.                      |
| `purity`                         | 컴포넌트와 Hook이 순수해야 하며, 렌더 중 알려진 impure 함수를 호출하지 않도록 검사합니다.  |
| `refs`                           | 렌더 중 ref를 읽거나 쓰는 등 잘못된 ref 사용을 금지합니다.                                 |
| `rule-suppression`               | 다른 규칙을 억제하는 주석 사용을 검사합니다.                                               |
| `rules-of-hooks`                 | Hook을 조건문, 반복문, 중첩 함수 등 잘못된 위치에서 호출하지 못하게 합니다.                |
| `set-state-in-effect`            | effect 안에서 동기적으로 `setState`를 호출하는 패턴을 금지합니다.                          |
| `set-state-in-render`            | 렌더 중 state를 설정해 추가 렌더나 무한 렌더를 유발하는 패턴을 금지합니다.                 |
| `static-components`              | 렌더마다 새로 생성되는 동적 컴포넌트를 금지합니다.                                         |
| `syntax`                         | React Compiler가 처리할 수 없는 잘못된 구문을 검사합니다.                                  |
| `todo`                           | React Compiler의 아직 구현되지 않은 기능 관련 상태를 검사합니다.                           |
| `unsupported-syntax`             | React Compiler가 지원할 계획이 없는 구문 사용을 경고합니다.                                |
| `use-memo`                       | `useMemo()` 사용에서 흔한 실수를 검사합니다.                                               |
| `void-use-memo`                  | `useMemo`가 값을 반환하고 그 결과가 실제로 사용되도록 검사합니다.                          |
