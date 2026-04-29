---
title: eslint-plugin-react
description: eslint-plugin-react 규칙을 한국어로 정리합니다.
head:
  - - meta
    - name: keywords
      content: ESLint, React, eslint-plugin-react
comment: true
---

# eslint-plugin-react

::: info
이 문서는 ChatGPT 5.5를 통해 작성되었습니다.
:::

기준일: 2026-04-29  
기준 버전: `eslint-plugin-react@7.37.5`  
출처: [npm eslint-plugin-react](https://www.npmjs.com/package/eslint-plugin-react), 패키지 배포본의 `rules` 메타데이터

## 규칙 목록

| 규칙                                    | 설명                                                                                                       |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `boolean-prop-naming`                   | boolean prop 이름이 일관된 패턴을 따르도록 강제합니다.                                                     |
| `button-has-type`                       | `button` 요소에 명시적인 `type` 속성을 요구합니다.                                                         |
| `checked-requires-onchange-or-readonly` | `checked`를 쓰는 입력 요소에 `onChange` 또는 `readOnly`를 요구합니다.                                      |
| `default-props-match-prop-types`        | `defaultProps`가 필수가 아닌 `propTypes`와 대응되도록 검사합니다.                                          |
| `destructuring-assignment`              | `props`, `state`, `context` 접근 방식에 구조 분해 사용 여부를 일관되게 강제합니다.                         |
| `display-name`                          | React 컴포넌트 정의에 `displayName` 누락을 금지합니다.                                                     |
| `forbid-component-props`                | 컴포넌트에 지정한 prop 사용을 금지합니다.                                                                  |
| `forbid-dom-props`                      | DOM 노드에 지정한 prop 사용을 금지합니다.                                                                  |
| `forbid-elements`                       | 지정한 JSX 요소 사용을 금지합니다.                                                                         |
| `forbid-foreign-prop-types`             | 다른 컴포넌트의 `propTypes`를 직접 참조하는 패턴을 금지합니다.                                             |
| `forbid-prop-types`                     | `any`, `array`, `object`처럼 너무 넓은 prop type 사용을 제한합니다.                                        |
| `forward-ref-uses-ref`                  | `forwardRef` 컴포넌트가 `ref` 매개변수를 포함하도록 요구합니다.                                            |
| `function-component-definition`         | 함수 컴포넌트를 선언문, 함수 표현식, 화살표 함수 중 지정한 형태로 작성하도록 강제합니다.                   |
| `hook-use-state`                        | `useState` 반환값을 구조 분해하고 값/setter 이름이 대칭을 이루도록 검사합니다.                             |
| `iframe-missing-sandbox`                | `iframe` 요소에 `sandbox` 속성을 요구합니다.                                                               |
| `jsx-boolean-value`                     | JSX boolean 속성 표기 방식을 일관되게 강제합니다.                                                          |
| `jsx-child-element-spacing`             | JSX 자식 요소 사이의 공백 사용을 검사합니다.                                                               |
| `jsx-closing-bracket-location`          | JSX 닫는 꺾쇠괄호 위치를 일관되게 강제합니다.                                                              |
| `jsx-closing-tag-location`              | 여러 줄 JSX의 닫는 태그 위치를 일관되게 강제합니다.                                                        |
| `jsx-curly-brace-presence`              | JSX에서 불필요한 중괄호 표현식을 금지하거나 리터럴에 중괄호 사용을 강제합니다.                             |
| `jsx-curly-newline`                     | JSX 중괄호 안 줄바꿈 스타일을 일관되게 강제합니다.                                                         |
| `jsx-curly-spacing`                     | JSX 중괄호 안 공백 스타일을 일관되게 강제합니다.                                                           |
| `jsx-equals-spacing`                    | JSX 속성의 `=` 주변 공백 스타일을 강제합니다.                                                              |
| `jsx-filename-extension`                | JSX를 포함할 수 있는 파일 확장자를 제한합니다.                                                             |
| `jsx-first-prop-new-line`               | JSX 첫 번째 prop의 줄 위치를 일관되게 강제합니다.                                                          |
| `jsx-fragments`                         | Fragment를 축약 문법(`<>`) 또는 명시 문법(`React.Fragment`)으로 일관되게 쓰도록 합니다.                    |
| `jsx-handler-names`                     | JSX 이벤트 핸들러 prop과 함수 이름 규칙을 강제합니다.                                                      |
| `jsx-indent`                            | JSX 들여쓰기를 강제합니다.                                                                                 |
| `jsx-indent-props`                      | JSX prop 들여쓰기를 강제합니다.                                                                            |
| `jsx-key`                               | 반복 렌더링되는 JSX 요소에 `key` prop 누락을 금지합니다.                                                   |
| `jsx-max-depth`                         | JSX 중첩 깊이의 최대값을 제한합니다.                                                                       |
| `jsx-max-props-per-line`                | JSX 한 줄에 허용할 prop 개수를 제한합니다.                                                                 |
| `jsx-newline`                           | JSX 요소와 표현식 뒤 줄바꿈 사용 여부를 강제합니다.                                                        |
| `jsx-no-bind`                           | JSX prop에서 `.bind()`나 인라인 화살표 함수를 쓰는 패턴을 금지합니다.                                      |
| `jsx-no-comment-textnodes`              | JSX 주석이 텍스트 노드로 들어가는 실수를 방지합니다.                                                       |
| `jsx-no-constructed-context-values`     | Context Provider의 `value`에 매 렌더마다 새 객체/함수를 넣어 불필요한 리렌더를 유발하는 패턴을 금지합니다. |
| `jsx-no-duplicate-props`                | JSX에서 같은 prop을 중복 선언하지 못하게 합니다.                                                           |
| `jsx-no-leaked-render`                  | 조건부 렌더링에서 의도치 않은 값이 화면에 새는 패턴을 방지합니다.                                          |
| `jsx-no-literals`                       | JSX 안의 문자열 리터럴 사용을 금지합니다.                                                                  |
| `jsx-no-script-url`                     | JSX에서 `javascript:` URL 사용을 금지합니다.                                                               |
| `jsx-no-target-blank`                   | `target="_blank"` 사용 시 안전한 `rel` 값을 요구합니다.                                                    |
| `jsx-no-undef`                          | JSX에서 선언되지 않은 컴포넌트나 변수를 사용하는 것을 금지합니다.                                          |
| `jsx-no-useless-fragment`               | 불필요한 Fragment 사용을 금지합니다.                                                                       |
| `jsx-one-expression-per-line`           | JSX 표현식을 한 줄에 하나씩 배치하도록 강제합니다.                                                         |
| `jsx-pascal-case`                       | 사용자 정의 JSX 컴포넌트 이름에 PascalCase를 강제합니다.                                                   |
| `jsx-props-no-multi-spaces`             | 인라인 JSX prop 사이의 중복 공백을 금지합니다.                                                             |
| `jsx-props-no-spread-multi`             | 같은 식별자를 JSX spread prop으로 여러 번 펼치는 것을 금지합니다.                                          |
| `jsx-props-no-spreading`                | JSX prop spreading 사용을 금지합니다.                                                                      |
| `jsx-sort-props`                        | JSX prop을 알파벳순 등 지정한 순서로 정렬하도록 강제합니다.                                                |
| `jsx-tag-spacing`                       | JSX 태그의 여는/닫는 괄호 주변 공백을 강제합니다.                                                          |
| `jsx-uses-react`                        | JSX 사용으로 인해 `React` import가 실제 사용된 것으로 인식되게 합니다.                                     |
| `jsx-uses-vars`                         | JSX에서 사용한 변수가 미사용 변수로 잘못 보고되지 않게 합니다.                                             |
| `jsx-wrap-multilines`                   | 여러 줄 JSX를 괄호로 감싸도록 강제합니다.                                                                  |
| `no-access-state-in-setstate`           | `setState` 내부에서 `this.state`를 직접 읽는 패턴을 금지합니다.                                            |
| `no-adjacent-inline-elements`           | 공백 없이 인접한 inline 요소를 금지합니다.                                                                 |
| `no-array-index-key`                    | 배열 인덱스를 `key`로 사용하는 것을 금지합니다.                                                            |
| `no-arrow-function-lifecycle`           | 라이프사이클 메서드를 클래스 필드 화살표 함수가 아니라 prototype 메서드로 작성하도록 합니다.               |
| `no-children-prop`                      | `children`을 prop으로 직접 전달하는 것을 금지합니다.                                                       |
| `no-danger`                             | `dangerouslySetInnerHTML` 사용을 금지합니다.                                                               |
| `no-danger-with-children`               | `children`과 `dangerouslySetInnerHTML`을 동시에 사용하는 것을 금지합니다.                                  |
| `no-deprecated`                         | React의 deprecated API 사용을 금지합니다.                                                                  |
| `no-did-mount-set-state`                | `componentDidMount`에서 `setState` 호출을 금지합니다.                                                      |
| `no-did-update-set-state`               | `componentDidUpdate`에서 `setState` 호출을 금지합니다.                                                     |
| `no-direct-mutation-state`              | `this.state`를 직접 변경하는 것을 금지합니다.                                                              |
| `no-find-dom-node`                      | `findDOMNode` 사용을 금지합니다.                                                                           |
| `no-invalid-html-attribute`             | 잘못된 HTML 속성 사용을 금지합니다.                                                                        |
| `no-is-mounted`                         | `isMounted` 사용을 금지합니다.                                                                             |
| `no-multi-comp`                         | 한 파일에 여러 컴포넌트를 정의하는 것을 제한합니다.                                                        |
| `no-namespace`                          | React 요소에서 XML namespace 사용을 금지합니다.                                                            |
| `no-object-type-as-default-prop`        | 함수 컴포넌트 기본 매개변수에 객체/배열 같은 참조 타입 기본값을 직접 두는 것을 금지합니다.                 |
| `no-redundant-should-component-update`  | `React.PureComponent`에서 불필요한 `shouldComponentUpdate` 사용을 금지합니다.                              |
| `no-render-return-value`                | `ReactDOM.render` 반환값 사용을 금지합니다.                                                                |
| `no-set-state`                          | `setState` 사용을 금지합니다.                                                                              |
| `no-string-refs`                        | 문자열 ref 사용을 금지합니다.                                                                              |
| `no-this-in-sfc`                        | 함수 컴포넌트에서 `this` 사용을 금지합니다.                                                                |
| `no-typos`                              | React 컴포넌트 API 이름의 흔한 오타를 금지합니다.                                                          |
| `no-unescaped-entities`                 | JSX 마크업 안의 escape되지 않은 HTML 엔티티를 금지합니다.                                                  |
| `no-unknown-property`                   | 알 수 없는 DOM 속성 사용을 금지합니다.                                                                     |
| `no-unsafe`                             | unsafe 라이프사이클 메서드 사용을 금지합니다.                                                              |
| `no-unstable-nested-components`         | 컴포넌트 내부에서 매 렌더마다 새 컴포넌트를 만드는 패턴을 금지합니다.                                      |
| `no-unused-class-component-methods`     | 클래스 컴포넌트의 사용하지 않는 메서드 선언을 금지합니다.                                                  |
| `no-unused-prop-types`                  | 선언했지만 사용하지 않는 `propTypes`를 금지합니다.                                                         |
| `no-unused-state`                       | 사용하지 않는 state 정의를 금지합니다.                                                                     |
| `no-will-update-set-state`              | `componentWillUpdate`에서 `setState` 호출을 금지합니다.                                                    |
| `prefer-es6-class`                      | React 컴포넌트를 ES5 방식 또는 ES6 class 방식 중 지정한 스타일로 강제합니다.                               |
| `prefer-exact-props`                    | Flow의 exact prop type 정의를 선호하도록 강제합니다.                                                       |
| `prefer-read-only-props`                | prop을 읽기 전용으로 선언하도록 강제합니다.                                                                |
| `prefer-stateless-function`             | state 없는 컴포넌트를 순수 함수로 작성하도록 강제합니다.                                                   |
| `prop-types`                            | React 컴포넌트 prop 검증 누락을 금지합니다.                                                                |
| `react-in-jsx-scope`                    | JSX 사용 시 `React`가 scope 안에 있도록 요구합니다.                                                        |
| `require-default-props`                 | 필수가 아닌 prop에 기본값 정의를 요구합니다.                                                               |
| `require-optimization`                  | React 컴포넌트에 `shouldComponentUpdate` 구현을 요구합니다.                                                |
| `require-render-return`                 | class 컴포넌트의 `render` 메서드가 값을 반환하도록 강제합니다.                                             |
| `self-closing-comp`                     | 자식이 없는 컴포넌트와 요소를 self-closing 형태로 쓰도록 강제합니다.                                       |
| `sort-comp`                             | 컴포넌트 메서드 순서를 강제합니다.                                                                         |
| `sort-default-props`                    | `defaultProps` 선언을 알파벳순으로 정렬하도록 강제합니다.                                                  |
| `sort-prop-types`                       | `propTypes` 선언을 알파벳순으로 정렬하도록 강제합니다.                                                     |
| `state-in-constructor`                  | class 컴포넌트 state 초기화 위치를 강제합니다.                                                             |
| `static-property-placement`             | React 컴포넌트 static property를 어디에 둘지 강제합니다.                                                   |
| `style-prop-object`                     | `style` prop 값이 객체가 되도록 강제합니다.                                                                |
| `void-dom-elements-no-children`         | `img`, `br` 같은 void DOM 요소에 children을 전달하지 못하게 합니다.                                        |
