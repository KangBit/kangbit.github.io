---
title: typescript-eslint
description: typescript-eslint 규칙을 한국어로 정리합니다.
head:
  - - meta
    - name: keywords
      content: "ESLint, TypeScript, typescript-eslint, @typescript-eslint/eslint-plugin"
comment: true
---

# typescript-eslint

::: info
이 문서는 ChatGPT 5.5를 통해 작성되었습니다.
:::

기준일: 2026-04-29  
기준 버전: `typescript-eslint@8.59.1`  
출처: [typescript-eslint Rules](https://typescript-eslint.io/rules/), [typescript-eslint package](https://typescript-eslint.io/packages/typescript-eslint/)

## 규칙 목록

| 규칙                                           | 설명                                                                                   |
| ---------------------------------------------- | -------------------------------------------------------------------------------------- |
| `adjacent-overload-signatures`                 | 함수 overload 시그니처가 서로 붙어 있도록 강제합니다.                                  |
| `array-type`                                   | 배열 타입을 `T[]` 또는 `Array<T>` 중 하나로 일관되게 쓰도록 합니다.                    |
| `await-thenable`                               | thenable이 아닌 값에 `await`를 사용하는 실수를 금지합니다.                             |
| `ban-ts-comment`                               | `@ts-ignore` 같은 TypeScript 지시 주석 사용을 제한하거나 설명을 요구합니다.            |
| `ban-tslint-comment`                           | 더 이상 사용하지 않는 `tslint` 제어 주석을 금지합니다.                                 |
| `class-literal-property-style`                 | 클래스의 리터럴 속성을 readonly field 또는 getter 중 지정한 방식으로 통일합니다.       |
| `class-methods-use-this`                       | 클래스 메서드가 `this`를 사용하도록 요구합니다.                                        |
| `consistent-generic-constructors`              | 생성자 호출의 generic 인자 표기 위치를 일관되게 합니다.                                |
| `consistent-indexed-object-style`              | index signature와 `Record` 타입 중 하나의 스타일을 강제합니다.                         |
| `consistent-return`                            | 함수의 반환값 존재 여부가 모든 경로에서 일관되도록 합니다.                             |
| `consistent-type-assertions`                   | 타입 단언을 `as` 또는 angle bracket 방식 중 하나로 통일합니다.                         |
| `consistent-type-definitions`                  | 객체 타입 정의를 `interface` 또는 `type` 중 하나로 통일합니다.                         |
| `consistent-type-exports`                      | type export 표기 방식을 일관되게 합니다.                                               |
| `consistent-type-imports`                      | type import를 일반 import와 분리하거나 inline으로 일관되게 작성하도록 합니다.          |
| `default-param-last`                           | 기본값이 있는 매개변수를 매개변수 목록 뒤쪽에 두도록 합니다.                           |
| `dot-notation`                                 | 가능한 경우 대괄호 접근 대신 점 표기법을 사용하도록 합니다.                            |
| `explicit-function-return-type`                | 함수와 클래스 메서드에 명시적인 반환 타입을 요구합니다.                                |
| `explicit-member-accessibility`                | 클래스 멤버에 `public`, `private`, `protected` 접근 제한자를 명시하도록 합니다.        |
| `explicit-module-boundary-types`               | 모듈 경계의 함수와 클래스 public 메서드에 타입 명시를 요구합니다.                      |
| `init-declarations`                            | 변수 선언 시 초기화 여부를 강제합니다.                                                 |
| `max-params`                                   | 함수 매개변수 개수의 최대값을 제한합니다.                                              |
| `member-ordering`                              | 클래스, 인터페이스, 타입 멤버의 선언 순서를 강제합니다.                                |
| `method-signature-style`                       | 인터페이스와 타입의 메서드 시그니처 표기 방식을 통일합니다.                            |
| `naming-convention`                            | 변수, 타입, 클래스 등 식별자 이름 규칙을 세밀하게 강제합니다.                          |
| `no-array-constructor`                         | 제네릭 `Array` 생성자 사용을 금지합니다.                                               |
| `no-array-delete`                              | 배열 요소에 `delete` 연산자를 사용하는 실수를 금지합니다.                              |
| `no-base-to-string`                            | 의미 없는 문자열화를 만드는 `.toString()` 호출을 제한합니다.                           |
| `no-confusing-non-null-assertion`              | 헷갈리기 쉬운 위치의 non-null assertion을 금지합니다.                                  |
| `no-confusing-void-expression`                 | `void` 타입 표현식이 값처럼 사용되는 패턴을 제한합니다.                                |
| `no-deprecated`                                | `@deprecated`로 표시된 API 사용을 금지합니다.                                          |
| `no-dupe-class-members`                        | 클래스 멤버 이름 중복을 금지합니다.                                                    |
| `no-duplicate-enum-values`                     | enum 멤버 값 중복을 금지합니다.                                                        |
| `no-duplicate-type-constituents`               | union 또는 intersection 타입의 중복 구성 요소를 금지합니다.                            |
| `no-dynamic-delete`                            | computed key에 `delete` 연산자를 사용하는 패턴을 제한합니다.                           |
| `no-empty-function`                            | 빈 함수를 금지합니다.                                                                  |
| `no-empty-interface`                           | 빈 interface 선언을 금지합니다.                                                        |
| `no-empty-object-type`                         | 의도와 다르게 너무 넓은 빈 객체 타입을 사용하는 것을 방지합니다.                       |
| `no-explicit-any`                              | 명시적인 `any` 타입 사용을 금지합니다.                                                 |
| `no-extra-non-null-assertion`                  | 중복된 non-null assertion을 금지합니다.                                                |
| `no-extraneous-class`                          | namespace처럼만 쓰이는 불필요한 클래스를 금지합니다.                                   |
| `no-floating-promises`                         | 처리되지 않은 Promise를 금지합니다.                                                    |
| `no-for-in-array`                              | 배열에 `for-in` 루프를 사용하는 실수를 금지합니다.                                     |
| `no-implied-eval`                              | `eval()`처럼 동작할 수 있는 함수 사용을 금지합니다.                                    |
| `no-import-type-side-effects`                  | 타입 전용 import가 런타임 side effect import로 남는 패턴을 방지합니다.                 |
| `no-inferrable-types`                          | 쉽게 추론 가능한 원시 타입 명시를 금지합니다.                                          |
| `no-invalid-this`                              | 유효하지 않은 문맥에서 `this`를 사용하는 것을 금지합니다.                              |
| `no-invalid-void-type`                         | generic 또는 반환 타입 외 위치에서 `void` 타입 사용을 제한합니다.                      |
| `no-loop-func`                                 | 루프 안에서 안전하지 않은 참조를 캡처하는 함수 선언을 금지합니다.                      |
| `no-loss-of-precision`                         | 정밀도를 잃는 숫자 리터럴을 금지합니다.                                                |
| `no-magic-numbers`                             | 의미를 알기 어려운 숫자 리터럴 사용을 제한합니다.                                      |
| `no-meaningless-void-operator`                 | 의미 없는 `void` 연산자 사용을 금지합니다.                                             |
| `no-misused-new`                               | `new`와 `constructor` 시그니처의 잘못된 선언을 금지합니다.                             |
| `no-misused-promises`                          | Promise를 처리할 수 없는 위치에 Promise를 넘기는 실수를 금지합니다.                    |
| `no-misused-spread`                            | 예상과 다르게 동작할 수 있는 spread 사용을 금지합니다.                                 |
| `no-mixed-enums`                               | enum 안에서 문자열 멤버와 숫자 멤버를 섞는 것을 금지합니다.                            |
| `no-namespace`                                 | TypeScript namespace 사용을 금지합니다.                                                |
| `no-non-null-asserted-nullish-coalescing`      | nullish coalescing 왼쪽에 non-null assertion을 붙이는 무의미한 패턴을 금지합니다.      |
| `no-non-null-asserted-optional-chain`          | optional chain 뒤의 non-null assertion을 금지합니다.                                   |
| `no-non-null-assertion`                        | postfix `!` non-null assertion 사용을 금지합니다.                                      |
| `no-redeclare`                                 | 같은 스코프의 재선언을 금지합니다.                                                     |
| `no-redundant-type-constituents`               | 타입 정보를 덮어쓰거나 의미 없는 union/intersection 구성 요소를 금지합니다.            |
| `no-require-imports`                           | `require()` 호출을 금지하고 ESM import를 사용하도록 합니다.                            |
| `no-restricted-imports`                        | 지정한 모듈 import를 금지합니다.                                                       |
| `no-restricted-types`                          | 지정한 타입 사용을 금지합니다.                                                         |
| `no-shadow`                                    | 바깥 스코프 변수와 같은 이름의 선언을 금지합니다.                                      |
| `no-this-alias`                                | `this`를 다른 변수에 할당해 별칭을 만드는 패턴을 금지합니다.                           |
| `no-type-alias`                                | type alias 사용을 제한합니다.                                                          |
| `no-unnecessary-boolean-literal-compare`       | boolean 리터럴과의 불필요한 비교를 금지합니다.                                         |
| `no-unnecessary-condition`                     | 타입상 항상 참 또는 거짓인 조건문을 금지합니다.                                        |
| `no-unnecessary-parameter-property-assignment` | 생성자 parameter property에 다시 같은 값을 할당하는 코드를 금지합니다.                 |
| `no-unnecessary-qualifier`                     | 불필요한 namespace 또는 enum qualifier를 금지합니다.                                   |
| `no-unnecessary-template-expression`           | 단순 값 하나만 감싸는 불필요한 template expression을 금지합니다.                       |
| `no-unnecessary-type-arguments`                | 기본값과 같은 불필요한 generic 타입 인자를 금지합니다.                                 |
| `no-unnecessary-type-assertion`                | 타입을 바꾸지 않는 불필요한 타입 단언을 금지합니다.                                    |
| `no-unnecessary-type-constraint`               | 의미 없는 generic 제약을 금지합니다.                                                   |
| `no-unnecessary-type-conversion`               | 타입이나 값이 바뀌지 않는 변환 표현을 금지합니다.                                      |
| `no-unnecessary-type-parameters`               | 여러 위치에서 관계를 만들지 않는 불필요한 type parameter를 금지합니다.                 |
| `no-unsafe-argument`                           | `any` 값을 함수 인자로 넘기는 것을 금지합니다.                                         |
| `no-unsafe-assignment`                         | `any` 값을 변수나 속성에 할당하는 것을 금지합니다.                                     |
| `no-unsafe-call`                               | `any` 타입 값을 함수처럼 호출하는 것을 금지합니다.                                     |
| `no-unsafe-declaration-merging`                | class와 interface의 위험한 선언 병합을 금지합니다.                                     |
| `no-unsafe-enum-comparison`                    | enum 값과 enum이 아닌 값을 비교하는 것을 금지합니다.                                   |
| `no-unsafe-function-type`                      | 너무 넓은 내장 `Function` 타입 사용을 금지합니다.                                      |
| `no-unsafe-member-access`                      | `any` 값의 멤버 접근을 금지합니다.                                                     |
| `no-unsafe-return`                             | 함수에서 `any` 값을 반환하는 것을 금지합니다.                                          |
| `no-unsafe-type-assertion`                     | 타입을 더 좁히는 위험한 타입 단언을 금지합니다.                                        |
| `no-unsafe-unary-minus`                        | 숫자가 아닌 값에 unary minus를 적용하는 것을 금지합니다.                               |
| `no-unused-expressions`                        | 사용되지 않는 표현식을 금지합니다.                                                     |
| `no-unused-private-class-members`              | 사용하지 않는 private 클래스 멤버를 금지합니다.                                        |
| `no-unused-vars`                               | 사용하지 않는 변수와 매개변수를 금지합니다.                                            |
| `no-use-before-define`                         | 선언 전에 변수, 함수, 클래스를 사용하는 것을 제한합니다.                               |
| `no-useless-constructor`                       | 불필요한 생성자를 금지합니다.                                                          |
| `no-useless-default-assignment`                | 실제로 사용될 수 없는 기본값 할당을 금지합니다.                                        |
| `no-useless-empty-export`                      | 모듈 표식 외 의미가 없는 빈 export를 금지합니다.                                       |
| `no-var-requires`                              | import 문 대신 `require` 변수를 사용하는 패턴을 금지합니다.                            |
| `no-wrapper-object-types`                      | `String`, `Number`, `Boolean` 같은 wrapper object 타입 사용을 금지합니다.              |
| `non-nullable-type-assertion-style`            | nullable 제거에는 타입 단언보다 non-null assertion을 쓰도록 합니다.                    |
| `only-throw-error`                             | `throw`에는 `Error` 객체만 사용하도록 강제합니다.                                      |
| `parameter-properties`                         | 생성자 parameter property 사용 여부를 강제합니다.                                      |
| `prefer-as-const`                              | 리터럴 타입 단언보다 `as const` 사용을 선호합니다.                                     |
| `prefer-destructuring`                         | 배열 또는 객체에서 구조 분해 할당 사용을 요구합니다.                                   |
| `prefer-enum-initializers`                     | enum 멤버 값을 명시적으로 초기화하도록 요구합니다.                                     |
| `prefer-find`                                  | 단일 요소를 찾을 때 `filter()[0]`보다 `find()`를 사용하도록 합니다.                    |
| `prefer-for-of`                                | index가 필요 없는 표준 `for` 루프 대신 `for-of` 사용을 권장합니다.                     |
| `prefer-function-type`                         | call signature만 있는 interface보다 function type을 사용하도록 합니다.                 |
| `prefer-includes`                              | `indexOf` 비교 대신 `includes()` 사용을 권장합니다.                                    |
| `prefer-literal-enum-member`                   | enum 멤버가 리터럴 값이 되도록 요구합니다.                                             |
| `prefer-namespace-keyword`                     | 커스텀 TypeScript 모듈 선언에 `module` 대신 `namespace`를 사용하도록 합니다.           |
| `prefer-nullish-coalescing`                    | `\|\| ` 등보다 nullish coalescing을 사용하도록 권장합니다.                             |
| `prefer-optional-chain`                        | 연쇄 논리식 대신 optional chaining을 사용하도록 합니다.                                |
| `prefer-promise-reject-errors`                 | Promise reject 이유로 `Error` 객체를 사용하도록 합니다.                                |
| `prefer-readonly`                              | 생성자 밖에서 변경되지 않는 private 멤버에 `readonly`를 붙이도록 합니다.               |
| `prefer-readonly-parameter-types`              | 함수 매개변수를 `readonly` 타입으로 받도록 요구합니다.                                 |
| `prefer-reduce-type-parameter`                 | `reduce` 결과 타입을 타입 단언보다 generic 인자로 지정하도록 합니다.                   |
| `prefer-regexp-exec`                           | global flag가 없는 정규식 검사에 `String#match`보다 `RegExp#exec`를 사용하도록 합니다. |
| `prefer-return-this-type`                      | 반환 타입이 현재 인스턴스라면 클래스명보다 `this` 타입을 사용하도록 합니다.            |
| `prefer-string-starts-ends-with`               | 문자열 접두사/접미사 확인에 `startsWith()`와 `endsWith()`를 사용하도록 합니다.         |
| `prefer-ts-expect-error`                       | `@ts-ignore`보다 검증 가능한 `@ts-expect-error` 사용을 권장합니다.                     |
| `promise-function-async`                       | Promise를 반환하는 함수에 `async` 표시를 요구합니다.                                   |
| `related-getter-setter-pairs`                  | getter 반환 타입과 setter 입력 타입이 서로 호환되도록 합니다.                          |
| `require-array-sort-compare`                   | `sort()`와 `toSorted()` 호출에 비교 함수를 요구합니다.                                 |
| `require-await`                                | `await`가 없고 Promise도 반환하지 않는 `async` 함수를 금지합니다.                      |
| `restrict-plus-operands`                       | `+` 연산자의 양쪽 피연산자 타입을 안전하게 제한합니다.                                 |
| `restrict-template-expressions`                | template literal에 문자열로 안전하게 변환되는 값만 넣도록 제한합니다.                  |
| `return-await`                                 | Promise 반환 시 `await` 사용 방식을 일관되게 합니다.                                   |
| `sort-type-constituents`                       | union과 intersection 구성 요소를 정렬하도록 합니다.                                    |
| `strict-boolean-expressions`                   | 조건식에 boolean으로 안전하게 판단되는 값만 사용하도록 제한합니다.                     |
| `strict-void-return`                           | 값을 반환하는 함수를 `void` 반환 위치에 넘기는 것을 금지합니다.                        |
| `switch-exhaustiveness-check`                  | union 또는 enum에 대한 `switch`가 모든 경우를 처리하도록 검사합니다.                   |
| `triple-slash-reference`                       | triple-slash directive 사용을 제한하고 import 사용을 권장합니다.                       |
| `typedef`                                      | 지정한 위치에 타입 어노테이션을 요구합니다.                                            |
| `unbound-method`                               | 메서드를 `this` 바인딩 없이 분리해 호출하는 실수를 금지합니다.                         |
| `unified-signatures`                           | 하나로 합칠 수 있는 overload 시그니처를 금지합니다.                                    |
| `use-unknown-in-catch-callback-variable`       | Promise rejection callback 인자를 `unknown`으로 다루도록 합니다.                       |
