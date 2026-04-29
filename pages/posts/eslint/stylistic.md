---
title: "@stylistic/eslint-plugin"
description: "@stylistic/eslint-plugin 규칙을 한국어로 정리합니다."
head:
  - - meta
    - name: keywords
      content: "ESLint, Stylistic, @stylistic/eslint-plugin"
comment: true
---

# @stylistic/eslint-plugin

::: info
이 문서는 ChatGPT 5.5를 통해 작성되었습니다.
:::

기준일: 2026-04-29  
기준 버전: `@stylistic/eslint-plugin@5.10.0`  
출처: [npm @stylistic/eslint-plugin](https://www.npmjs.com/package/@stylistic/eslint-plugin), 패키지 배포본의 `rules` 메타데이터

## 규칙 목록

| 규칙                               | 설명                                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| `array-bracket-newline`            | 배열 대괄호를 열고 닫는 위치의 줄바꿈 스타일을 강제합니다.                     |
| `array-bracket-spacing`            | 배열 대괄호 안쪽 공백 스타일을 강제합니다.                                     |
| `array-element-newline`            | 배열 요소 사이 줄바꿈 스타일을 강제합니다.                                     |
| `arrow-parens`                     | 화살표 함수 매개변수 괄호 사용 여부를 강제합니다.                              |
| `arrow-spacing`                    | 화살표 함수의 `=>` 앞뒤 공백을 강제합니다.                                     |
| `block-spacing`                    | 한 줄 블록의 중괄호 안쪽 공백을 강제합니다.                                    |
| `brace-style`                      | 블록 중괄호 위치 스타일을 강제합니다.                                          |
| `comma-dangle`                     | trailing comma 사용 여부를 강제합니다.                                         |
| `comma-spacing`                    | 쉼표 앞뒤 공백을 강제합니다.                                                   |
| `comma-style`                      | 쉼표를 줄 끝에 둘지 줄 앞에 둘지 강제합니다.                                   |
| `computed-property-spacing`        | computed property 대괄호 안쪽 공백을 강제합니다.                               |
| `curly-newline`                    | 중괄호를 열고 닫는 위치의 줄바꿈 스타일을 강제합니다.                          |
| `dot-location`                     | 체이닝의 점(`.`)을 줄 앞 또는 줄 끝에 둘지 강제합니다.                         |
| `eol-last`                         | 파일 끝 개행 사용 여부를 강제합니다.                                           |
| `exp-jsx-props-style`              | JSX prop 줄바꿈 스타일을 일관되게 강제합니다.                                  |
| `exp-list-style`                   | 괄호 내부 목록의 공백과 줄바꿈 스타일을 강제합니다.                            |
| `function-call-argument-newline`   | 함수 호출 인자 사이 줄바꿈 스타일을 강제합니다.                                |
| `function-call-spacing`            | 함수 이름과 호출 괄호 사이 공백 사용 여부를 강제합니다.                        |
| `function-paren-newline`           | 함수 괄호 내부 줄바꿈 스타일을 강제합니다.                                     |
| `generator-star-spacing`           | generator 함수의 `*` 주변 공백을 강제합니다.                                   |
| `implicit-arrow-linebreak`         | 화살표 함수 본문 줄바꿈 위치를 강제합니다.                                     |
| `indent`                           | 코드 들여쓰기를 강제합니다.                                                    |
| `indent-binary-ops`                | 이항 연산자가 여러 줄에 걸칠 때 들여쓰기를 강제합니다.                         |
| `jsx-child-element-spacing`        | JSX 자식 요소 사이 공백 사용을 검사합니다.                                     |
| `jsx-closing-bracket-location`     | JSX 닫는 꺾쇠괄호 위치를 강제합니다.                                           |
| `jsx-closing-tag-location`         | 여러 줄 JSX 닫는 태그 위치를 강제합니다.                                       |
| `jsx-curly-brace-presence`         | JSX에서 불필요한 중괄호 표현식을 금지하거나 리터럴 중괄호 사용을 강제합니다.   |
| `jsx-curly-newline`                | JSX 중괄호 안 줄바꿈 스타일을 강제합니다.                                      |
| `jsx-curly-spacing`                | JSX 중괄호 안쪽 공백 스타일을 강제합니다.                                      |
| `jsx-equals-spacing`               | JSX 속성의 `=` 주변 공백을 강제합니다.                                         |
| `jsx-first-prop-new-line`          | JSX 첫 번째 prop의 줄 위치를 강제합니다.                                       |
| `jsx-function-call-newline`        | JSX 요소가 함수 인자로 쓰일 때 앞뒤 줄바꿈을 강제합니다.                       |
| `jsx-indent-props`                 | JSX prop 들여쓰기를 강제합니다.                                                |
| `jsx-max-props-per-line`           | JSX 한 줄에 허용할 prop 개수를 제한합니다.                                     |
| `jsx-newline`                      | JSX 요소와 표현식 뒤 줄바꿈 사용 여부를 강제합니다.                            |
| `jsx-one-expression-per-line`      | JSX 표현식을 한 줄에 하나씩 두도록 강제합니다.                                 |
| `jsx-pascal-case`                  | 사용자 정의 JSX 컴포넌트 이름에 PascalCase를 강제합니다.                       |
| `jsx-quotes`                       | JSX 속성 문자열에 작은따옴표 또는 큰따옴표 사용을 강제합니다.                  |
| `jsx-self-closing-comp`            | 자식이 없는 JSX 요소를 self-closing 형태로 쓰도록 강제합니다.                  |
| `jsx-tag-spacing`                  | JSX 태그 괄호 주변 공백을 강제합니다.                                          |
| `jsx-wrap-multilines`              | 여러 줄 JSX를 괄호로 감싸도록 강제합니다.                                      |
| `key-spacing`                      | 객체 속성, 타입, 인터페이스 멤버의 키와 값 사이 공백을 강제합니다.             |
| `keyword-spacing`                  | 키워드 앞뒤 공백을 강제합니다.                                                 |
| `line-comment-position`            | 한 줄 주석 위치를 강제합니다.                                                  |
| `linebreak-style`                  | 줄바꿈 문자를 LF 또는 CRLF로 강제합니다.                                       |
| `lines-around-comment`             | 주석 주변 빈 줄 사용을 강제합니다.                                             |
| `lines-between-class-members`      | 클래스 멤버 사이 빈 줄 사용 여부를 강제합니다.                                 |
| `max-len`                          | 한 줄 최대 길이를 제한합니다.                                                  |
| `max-statements-per-line`          | 한 줄에 허용할 문장 수를 제한합니다.                                           |
| `member-delimiter-style`           | TypeScript 인터페이스와 타입 리터럴 멤버 구분자 스타일을 강제합니다.           |
| `multiline-comment-style`          | 여러 줄 주석 스타일을 강제합니다.                                              |
| `multiline-ternary`                | 삼항 연산자 피연산자 사이 줄바꿈을 강제합니다.                                 |
| `new-parens`                       | 인자 없는 생성자 호출에서 괄호 사용 여부를 강제합니다.                         |
| `newline-per-chained-call`         | 메서드 체이닝에서 각 호출을 새 줄에 둘지 강제합니다.                           |
| `no-confusing-arrow`               | 비교 연산처럼 보일 수 있는 화살표 함수를 금지합니다.                           |
| `no-extra-parens`                  | 불필요한 괄호를 금지합니다.                                                    |
| `no-extra-semi`                    | 불필요한 세미콜론을 금지합니다.                                                |
| `no-floating-decimal`              | 앞이나 뒤가 생략된 소수점 숫자 표기를 금지합니다.                              |
| `no-mixed-operators`               | 여러 종류의 이항 연산자를 괄호 없이 섞어 쓰는 것을 금지합니다.                 |
| `no-mixed-spaces-and-tabs`         | 들여쓰기에 공백과 탭을 섞어 쓰는 것을 금지합니다.                              |
| `no-multi-spaces`                  | 불필요한 연속 공백을 금지합니다.                                               |
| `no-multiple-empty-lines`          | 연속 빈 줄 개수를 제한합니다.                                                  |
| `no-tabs`                          | 탭 문자 사용을 금지합니다.                                                     |
| `no-trailing-spaces`               | 줄 끝 공백을 금지합니다.                                                       |
| `no-whitespace-before-property`    | 속성 접근 앞의 불필요한 공백을 금지합니다.                                     |
| `nonblock-statement-body-position` | 중괄호 없는 단일 문장 위치를 강제합니다.                                       |
| `object-curly-newline`             | 객체 중괄호를 열고 닫는 위치의 줄바꿈 스타일을 강제합니다.                     |
| `object-curly-spacing`             | 객체 중괄호 안쪽 공백을 강제합니다.                                            |
| `object-property-newline`          | 객체 속성을 줄마다 배치할지 강제합니다.                                        |
| `one-var-declaration-per-line`     | 변수 선언 주변 줄바꿈 스타일을 강제합니다.                                     |
| `operator-linebreak`               | 연산자의 줄바꿈 위치를 강제합니다.                                             |
| `padded-blocks`                    | 블록 내부 빈 줄 사용 여부를 강제합니다.                                        |
| `padding-line-between-statements`  | 문장 사이 빈 줄 사용 규칙을 강제합니다.                                        |
| `quote-props`                      | 객체, 타입 리터럴, 인터페이스, enum 속성 이름의 따옴표 사용 여부를 강제합니다. |
| `quotes`                           | 문자열에 백틱, 작은따옴표, 큰따옴표 중 지정한 스타일을 강제합니다.             |
| `rest-spread-spacing`              | rest/spread 연산자와 대상 사이 공백을 강제합니다.                              |
| `semi`                             | 세미콜론 사용 여부를 강제합니다.                                               |
| `semi-spacing`                     | 세미콜론 앞뒤 공백을 강제합니다.                                               |
| `semi-style`                       | 세미콜론 위치를 강제합니다.                                                    |
| `space-before-blocks`              | 블록 앞 공백을 강제합니다.                                                     |
| `space-before-function-paren`      | 함수 괄호 앞 공백을 강제합니다.                                                |
| `space-in-parens`                  | 괄호 안쪽 공백을 강제합니다.                                                   |
| `space-infix-ops`                  | 중위 연산자 주변 공백을 강제합니다.                                            |
| `space-unary-ops`                  | 단항 연산자 앞뒤 공백을 강제합니다.                                            |
| `spaced-comment`                   | `//` 또는 `/*` 뒤 주석 공백을 강제합니다.                                      |
| `switch-colon-spacing`             | `switch`문의 콜론 주변 공백을 강제합니다.                                      |
| `template-curly-spacing`           | 템플릿 문자열 `${...}` 안쪽 공백을 강제합니다.                                 |
| `template-tag-spacing`             | 태그드 템플릿의 태그와 템플릿 사이 공백을 강제합니다.                          |
| `type-annotation-spacing`          | TypeScript 타입 어노테이션 주변 공백을 강제합니다.                             |
| `type-generic-spacing`             | TypeScript generic 타입 내부 공백을 강제합니다.                                |
| `type-named-tuple-spacing`         | TypeScript named tuple의 타입 선언 앞 공백을 강제합니다.                       |
| `wrap-iife`                        | 즉시 실행 함수 표현식을 괄호로 감싸도록 강제합니다.                            |
| `wrap-regex`                       | 정규식 리터럴을 괄호로 감싸도록 요구합니다.                                    |
| `yield-star-spacing`               | `yield*`의 `*` 주변 공백을 강제합니다.                                         |
