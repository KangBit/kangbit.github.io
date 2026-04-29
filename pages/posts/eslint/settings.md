---
title: eslint
description: ESLint 코어 규칙을 한국어로 정리합니다.
head:
  - - meta
    - name: keywords
      content: ESLint, ESLint Rules, JavaScript, Lint
comment: true
---

# eslint

::: info
이 문서는 ChatGPT 5.5를 통해 작성되었습니다.
:::

기준일: 2026-04-29  
기준 버전: `eslint@10.2.1`  
출처: [ESLint Rules Reference](https://eslint.org/docs/latest/rules/), [npm eslint package](https://www.npmjs.com/package/eslint)

## Possible Problems

| 규칙                              | 설명                                                                                    |
| --------------------------------- | --------------------------------------------------------------------------------------- |
| `array-callback-return`           | 배열 메서드의 콜백에서 값을 반환해야 하는 경우 `return` 누락을 방지합니다.              |
| `constructor-super`               | 상속 클래스의 생성자에서 `super()` 호출을 강제합니다.                                   |
| `for-direction`                   | `for` 루프의 증감식이 종료 조건과 반대 방향으로 움직이는 실수를 방지합니다.             |
| `getter-return`                   | getter에서 값을 반환하도록 강제합니다.                                                  |
| `no-async-promise-executor`       | `Promise` 생성자의 executor 함수를 `async`로 선언하지 못하게 합니다.                    |
| `no-await-in-loop`                | 반복문 안의 `await` 사용을 금지해 불필요한 순차 실행을 방지합니다.                      |
| `no-class-assign`                 | 클래스 식별자에 다시 값을 할당하지 못하게 합니다.                                       |
| `no-compare-neg-zero`             | `-0`과 직접 비교하는 코드를 금지합니다.                                                 |
| `no-cond-assign`                  | 조건식 안에서 대입 연산자를 사용하는 실수를 방지합니다.                                 |
| `no-const-assign`                 | `const`, `using`, `await using` 변수의 재할당을 금지합니다.                             |
| `no-constant-binary-expression`   | 연산 결과가 항상 같아지는 무의미한 이항 표현식을 금지합니다.                            |
| `no-constant-condition`           | 조건문에 항상 참 또는 거짓인 상수 조건을 쓰지 못하게 합니다.                            |
| `no-constructor-return`           | 클래스 생성자에서 값을 반환하지 못하게 합니다.                                          |
| `no-control-regex`                | 정규식 안의 제어 문자를 금지합니다.                                                     |
| `no-debugger`                     | `debugger` 문 사용을 금지합니다.                                                        |
| `no-dupe-args`                    | 함수 매개변수 이름 중복을 금지합니다.                                                   |
| `no-dupe-class-members`           | 클래스 멤버 이름 중복을 금지합니다.                                                     |
| `no-dupe-else-if`                 | `if-else-if` 체인에서 같은 조건을 반복하지 못하게 합니다.                               |
| `no-dupe-keys`                    | 객체 리터럴의 키 중복을 금지합니다.                                                     |
| `no-duplicate-case`               | `switch`문의 중복 `case` 라벨을 금지합니다.                                             |
| `no-duplicate-imports`            | 같은 모듈을 여러 번 `import`하지 못하게 합니다.                                         |
| `no-empty-character-class`        | 정규식의 빈 문자 클래스를 금지합니다.                                                   |
| `no-empty-pattern`                | 빈 구조 분해 패턴을 금지합니다.                                                         |
| `no-ex-assign`                    | `catch` 절의 예외 변수 재할당을 금지합니다.                                             |
| `no-fallthrough`                  | `switch`문의 의도치 않은 fallthrough를 방지합니다.                                      |
| `no-func-assign`                  | 함수 선언 이름에 다시 값을 할당하지 못하게 합니다.                                      |
| `no-import-assign`                | `import`로 가져온 바인딩에 값을 할당하지 못하게 합니다.                                 |
| `no-inner-declarations`           | 중첩 블록 안의 변수 또는 함수 선언을 제한합니다.                                        |
| `no-invalid-regexp`               | `RegExp` 생성자에 잘못된 정규식 문자열을 넘기지 못하게 합니다.                          |
| `no-irregular-whitespace`         | 눈에 잘 보이지 않는 비정상 공백 문자를 금지합니다.                                      |
| `no-loss-of-precision`            | 정밀도를 잃는 숫자 리터럴을 금지합니다.                                                 |
| `no-misleading-character-class`   | 여러 코드 포인트로 구성된 문자를 정규식 문자 클래스에서 오해되게 쓰는 것을 방지합니다.  |
| `no-new-native-nonconstructor`    | 생성자가 아닌 전역 함수에 `new`를 붙이지 못하게 합니다.                                 |
| `no-obj-calls`                    | 함수가 아닌 전역 객체 속성을 함수처럼 호출하지 못하게 합니다.                           |
| `no-promise-executor-return`      | `Promise` executor 함수에서 값을 반환하지 못하게 합니다.                                |
| `no-prototype-builtins`           | 객체에서 `Object.prototype` 메서드를 직접 호출하지 못하게 합니다.                       |
| `no-self-assign`                  | 좌우가 같은 자기 자신 대입을 금지합니다.                                                |
| `no-self-compare`                 | 같은 값을 서로 비교하는 코드를 금지합니다.                                              |
| `no-setter-return`                | setter에서 값을 반환하지 못하게 합니다.                                                 |
| `no-sparse-arrays`                | 구멍이 있는 배열 리터럴을 금지합니다.                                                   |
| `no-template-curly-in-string`     | 일반 문자열 안에 템플릿 리터럴처럼 보이는 `${...}` 문법을 쓰는 실수를 잡습니다.         |
| `no-this-before-super`            | 파생 클래스 생성자에서 `super()` 호출 전 `this` 또는 `super` 사용을 금지합니다.         |
| `no-unassigned-vars`              | 읽히지만 한 번도 값이 할당되지 않은 `let` 또는 `var` 변수를 금지합니다.                 |
| `no-undef`                        | 선언되지 않은 변수 사용을 금지합니다.                                                   |
| `no-unexpected-multiline`         | 자동 세미콜론 삽입으로 헷갈릴 수 있는 여러 줄 표현식을 방지합니다.                      |
| `no-unmodified-loop-condition`    | 반복 중 바뀌지 않는 루프 조건을 금지합니다.                                             |
| `no-unreachable`                  | `return`, `throw`, `continue`, `break` 뒤의 도달 불가능한 코드를 금지합니다.            |
| `no-unreachable-loop`             | 본문이 한 번만 실행될 수 있는 루프를 금지합니다.                                        |
| `no-unsafe-finally`               | `finally` 블록에서 흐름 제어문을 사용해 예외나 반환값을 덮어쓰는 것을 방지합니다.       |
| `no-unsafe-negation`              | 관계 연산자의 왼쪽 피연산자를 부정하는 위험한 표현을 금지합니다.                        |
| `no-unsafe-optional-chaining`     | `undefined`가 허용되지 않는 위치에서 optional chaining 결과를 사용하는 것을 금지합니다. |
| `no-unused-private-class-members` | 사용하지 않는 private 클래스 멤버를 금지합니다.                                         |
| `no-unused-vars`                  | 사용하지 않는 변수를 금지합니다.                                                        |
| `no-use-before-define`            | 선언 전에 변수, 함수, 클래스를 사용하는 것을 제한합니다.                                |
| `no-useless-assignment`           | 할당한 값이 사용되지 않는 변수 대입을 금지합니다.                                       |
| `no-useless-backreference`        | 정규식에서 의미 없는 역참조를 금지합니다.                                               |
| `require-atomic-updates`          | `await` 또는 `yield` 때문에 경쟁 상태가 생길 수 있는 대입을 방지합니다.                 |
| `use-isnan`                       | `NaN` 검사는 직접 비교 대신 `isNaN()` 계열 호출을 사용하도록 강제합니다.                |
| `valid-typeof`                    | `typeof` 비교 문자열이 유효한 값인지 검사합니다.                                        |

## Suggestions

| 규칙                             | 설명                                                                               |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| `accessor-pairs`                 | 객체와 클래스에서 getter와 setter 쌍을 맞추도록 강제합니다.                        |
| `arrow-body-style`               | 화살표 함수 본문에 중괄호 사용 여부를 일관되게 합니다.                             |
| `block-scoped-var`               | 변수가 선언된 스코프 안에서만 사용되도록 강제합니다.                               |
| `camelcase`                      | 식별자에 camelCase 이름 규칙을 강제합니다.                                         |
| `capitalized-comments`           | 주석 첫 글자의 대문자 사용 여부를 강제하거나 금지합니다.                           |
| `class-methods-use-this`         | 클래스 메서드가 `this`를 사용하도록 요구합니다.                                    |
| `complexity`                     | 순환 복잡도의 최대값을 제한합니다.                                                 |
| `consistent-return`              | 함수의 `return`이 항상 값을 반환하거나 항상 반환하지 않도록 일관성을 강제합니다.   |
| `consistent-this`                | 현재 실행 컨텍스트를 저장할 때 사용하는 별칭 이름을 일관되게 합니다.               |
| `curly`                          | 모든 제어문에서 중괄호 스타일을 일관되게 강제합니다.                               |
| `default-case`                   | `switch`문에 `default` 절을 요구합니다.                                            |
| `default-case-last`              | `switch`문의 `default` 절이 마지막에 오도록 강제합니다.                            |
| `default-param-last`             | 기본값이 있는 매개변수를 매개변수 목록 뒤쪽에 두도록 강제합니다.                   |
| `dot-notation`                   | 가능한 경우 대괄호 접근 대신 점 표기법을 사용하도록 합니다.                        |
| `eqeqeq`                         | `==`, `!=` 대신 `===`, `!==` 사용을 강제합니다.                                    |
| `func-name-matching`             | 함수 이름이 할당되는 변수나 속성 이름과 일치하도록 요구합니다.                     |
| `func-names`                     | 함수 표현식 이름 사용 여부를 강제합니다.                                           |
| `func-style`                     | 함수 선언식과 함수 표현식 중 하나의 스타일을 일관되게 강제합니다.                  |
| `grouped-accessor-pairs`         | 객체 리터럴과 클래스에서 getter/setter 쌍을 붙여 쓰도록 요구합니다.                |
| `guard-for-in`                   | `for-in` 루프에 필터링용 `if` 문을 포함하도록 요구합니다.                          |
| `id-denylist`                    | 지정한 식별자 이름 사용을 금지합니다.                                              |
| `id-length`                      | 식별자 길이의 최소값과 최대값을 제한합니다.                                        |
| `id-match`                       | 식별자가 지정한 정규식 패턴을 따르도록 강제합니다.                                 |
| `init-declarations`              | 변수 선언 시 초기화 여부를 요구하거나 금지합니다.                                  |
| `logical-assignment-operators`   | 논리 할당 연산자 축약형 사용 여부를 강제합니다.                                    |
| `max-classes-per-file`           | 파일 하나에 선언할 수 있는 클래스 수를 제한합니다.                                 |
| `max-depth`                      | 중첩 블록 깊이를 제한합니다.                                                       |
| `max-lines`                      | 파일의 최대 줄 수를 제한합니다.                                                    |
| `max-lines-per-function`         | 함수 하나의 최대 줄 수를 제한합니다.                                               |
| `max-nested-callbacks`           | 콜백 중첩 깊이를 제한합니다.                                                       |
| `max-params`                     | 함수 매개변수 개수를 제한합니다.                                                   |
| `max-statements`                 | 함수 블록 안의 문장 수를 제한합니다.                                               |
| `new-cap`                        | 생성자 이름이 대문자로 시작하도록 요구합니다.                                      |
| `no-alert`                       | `alert`, `confirm`, `prompt` 사용을 금지합니다.                                    |
| `no-array-constructor`           | `Array` 생성자 사용을 금지합니다.                                                  |
| `no-bitwise`                     | 비트 연산자 사용을 금지합니다.                                                     |
| `no-caller`                      | `arguments.caller`, `arguments.callee` 사용을 금지합니다.                          |
| `no-case-declarations`           | `case` 절에서 블록 없는 lexical 선언을 금지합니다.                                 |
| `no-console`                     | `console` 사용을 금지합니다.                                                       |
| `no-continue`                    | `continue` 문 사용을 금지합니다.                                                   |
| `no-delete-var`                  | 변수 삭제를 금지합니다.                                                            |
| `no-div-regex`                   | 정규식 시작 부분의 `/=` 혼동을 피하도록 제한합니다.                                |
| `no-else-return`                 | `if`에서 `return` 후 불필요한 `else` 블록을 금지합니다.                            |
| `no-empty`                       | 빈 블록 문을 금지합니다.                                                           |
| `no-empty-function`              | 빈 함수를 금지합니다.                                                              |
| `no-empty-static-block`          | 빈 static 블록을 금지합니다.                                                       |
| `no-eq-null`                     | `null` 비교에 타입 체크 없는 동등 연산자를 쓰지 못하게 합니다.                     |
| `no-eval`                        | `eval()` 사용을 금지합니다.                                                        |
| `no-extend-native`               | 네이티브 객체 확장을 금지합니다.                                                   |
| `no-extra-bind`                  | 불필요한 `.bind()` 호출을 금지합니다.                                              |
| `no-extra-boolean-cast`          | 불필요한 boolean 변환을 금지합니다.                                                |
| `no-extra-label`                 | 불필요한 라벨을 금지합니다.                                                        |
| `no-global-assign`               | 네이티브 객체나 읽기 전용 전역 변수에 값을 할당하지 못하게 합니다.                 |
| `no-implicit-coercion`           | 짧은 형태의 암묵적 타입 변환을 금지합니다.                                         |
| `no-implicit-globals`            | 전역 스코프 선언을 금지합니다.                                                     |
| `no-implied-eval`                | `eval()`처럼 동작하는 메서드 사용을 금지합니다.                                    |
| `no-inline-comments`             | 코드 뒤에 붙는 인라인 주석을 금지합니다.                                           |
| `no-invalid-this`                | `this`가 `undefined`가 되는 문맥에서 `this` 사용을 금지합니다.                     |
| `no-iterator`                    | `__iterator__` 속성 사용을 금지합니다.                                             |
| `no-label-var`                   | 변수와 같은 이름의 라벨을 금지합니다.                                              |
| `no-labels`                      | 라벨 문 사용을 금지합니다.                                                         |
| `no-lone-blocks`                 | 불필요한 중첩 블록을 금지합니다.                                                   |
| `no-lonely-if`                   | `else` 블록 안에 단독 `if`만 있는 패턴을 금지합니다.                               |
| `no-loop-func`                   | 루프 안에서 안전하지 않은 참조를 캡처하는 함수 선언을 금지합니다.                  |
| `no-magic-numbers`               | 의미를 알기 어려운 숫자 리터럴 사용을 금지합니다.                                  |
| `no-multi-assign`                | 연쇄 대입 표현식 사용을 금지합니다.                                                |
| `no-multi-str`                   | 백슬래시로 이어지는 여러 줄 문자열을 금지합니다.                                   |
| `no-negated-condition`           | 부정 조건문 사용을 금지합니다.                                                     |
| `no-nested-ternary`              | 중첩 삼항 연산자를 금지합니다.                                                     |
| `no-new`                         | 결과를 사용하지 않는 `new` 호출을 금지합니다.                                      |
| `no-new-func`                    | `Function` 생성자와 함께 `new`를 사용하지 못하게 합니다.                           |
| `no-new-wrappers`                | `String`, `Number`, `Boolean` 래퍼 객체 생성자를 `new`로 호출하지 못하게 합니다.   |
| `no-nonoctal-decimal-escape`     | 문자열 리터럴에서 `\8`, `\9` escape 시퀀스를 금지합니다.                           |
| `no-object-constructor`          | 인자 없는 `Object` 생성자 호출을 금지합니다.                                       |
| `no-octal`                       | 8진수 리터럴을 금지합니다.                                                         |
| `no-octal-escape`                | 문자열 리터럴의 8진 escape 시퀀스를 금지합니다.                                    |
| `no-param-reassign`              | 함수 매개변수 재할당을 금지합니다.                                                 |
| `no-plusplus`                    | `++`, `--` 단항 연산자를 금지합니다.                                               |
| `no-proto`                       | `__proto__` 속성 사용을 금지합니다.                                                |
| `no-redeclare`                   | 변수 재선언을 금지합니다.                                                          |
| `no-regex-spaces`                | 정규식 안의 연속 공백을 금지합니다.                                                |
| `no-restricted-exports`          | 지정한 이름의 export를 금지합니다.                                                 |
| `no-restricted-globals`          | 지정한 전역 변수 사용을 금지합니다.                                                |
| `no-restricted-imports`          | 지정한 모듈 import를 금지합니다.                                                   |
| `no-restricted-properties`       | 지정한 객체의 지정한 속성 사용을 금지합니다.                                       |
| `no-restricted-syntax`           | 지정한 AST 구문 사용을 금지합니다.                                                 |
| `no-return-assign`               | `return` 문 안의 대입 연산자를 금지합니다.                                         |
| `no-script-url`                  | `javascript:` URL 사용을 금지합니다.                                               |
| `no-sequences`                   | 쉼표 연산자 사용을 금지합니다.                                                     |
| `no-shadow`                      | 바깥 스코프 변수와 같은 이름의 변수를 선언하지 못하게 합니다.                      |
| `no-shadow-restricted-names`     | 제한된 이름을 가리는 식별자 선언을 금지합니다.                                     |
| `no-ternary`                     | 삼항 연산자 사용을 금지합니다.                                                     |
| `no-throw-literal`               | 예외로 리터럴을 던지는 것을 금지합니다.                                            |
| `no-undef-init`                  | 변수를 `undefined`로 명시 초기화하는 것을 금지합니다.                              |
| `no-undefined`                   | `undefined`를 식별자로 사용하는 것을 금지합니다.                                   |
| `no-underscore-dangle`           | 식별자 앞뒤의 밑줄 사용을 금지합니다.                                              |
| `no-unneeded-ternary`            | 더 단순하게 표현할 수 있는 삼항 연산자를 금지합니다.                               |
| `no-unused-expressions`          | 결과가 사용되지 않는 표현식을 금지합니다.                                          |
| `no-unused-labels`               | 사용하지 않는 라벨을 금지합니다.                                                   |
| `no-useless-call`                | 불필요한 `.call()`, `.apply()` 호출을 금지합니다.                                  |
| `no-useless-catch`               | 다시 던지기만 하는 불필요한 `catch` 절을 금지합니다.                               |
| `no-useless-computed-key`        | 객체와 클래스에서 불필요한 computed key를 금지합니다.                              |
| `no-useless-concat`              | 리터럴이나 템플릿 리터럴의 불필요한 연결을 금지합니다.                             |
| `no-useless-constructor`         | 불필요한 생성자를 금지합니다.                                                      |
| `no-useless-escape`              | 불필요한 escape 문자를 금지합니다.                                                 |
| `no-useless-rename`              | import, export, 구조 분해에서 같은 이름으로 다시 이름 붙이는 것을 금지합니다.      |
| `no-useless-return`              | 불필요한 `return` 문을 금지합니다.                                                 |
| `no-var`                         | `var` 대신 `let` 또는 `const` 사용을 요구합니다.                                   |
| `no-void`                        | `void` 연산자 사용을 금지합니다.                                                   |
| `no-warning-comments`            | 주석 안의 지정된 경고 용어 사용을 금지합니다.                                      |
| `no-with`                        | `with` 문 사용을 금지합니다.                                                       |
| `object-shorthand`               | 객체 리터럴의 메서드와 속성 축약 문법 사용 여부를 강제합니다.                      |
| `one-var`                        | 변수 선언을 하나로 모으거나 분리하는 스타일을 강제합니다.                          |
| `operator-assignment`            | 가능한 경우 축약 대입 연산자 사용 여부를 강제합니다.                               |
| `prefer-arrow-callback`          | 콜백에 화살표 함수 사용을 요구합니다.                                              |
| `prefer-const`                   | 재할당되지 않는 변수에 `const` 사용을 요구합니다.                                  |
| `prefer-destructuring`           | 배열 또는 객체에서 구조 분해 사용을 요구합니다.                                    |
| `prefer-exponentiation-operator` | `Math.pow` 대신 `**` 연산자 사용을 요구합니다.                                     |
| `prefer-named-capture-group`     | 정규식에서 이름 있는 캡처 그룹 사용을 요구합니다.                                  |
| `prefer-numeric-literals`        | `parseInt()` 대신 2진수, 8진수, 16진수 리터럴 사용을 요구합니다.                   |
| `prefer-object-has-own`          | `Object.prototype.hasOwnProperty.call()` 대신 `Object.hasOwn()` 사용을 요구합니다. |
| `prefer-object-spread`           | `Object.assign()` 대신 객체 spread 사용을 권장합니다.                              |
| `prefer-promise-reject-errors`   | Promise reject 이유로 `Error` 객체 사용을 요구합니다.                              |
| `prefer-regex-literals`          | `RegExp` 생성자 대신 정규식 리터럴 사용을 요구합니다.                              |
| `prefer-rest-params`             | `arguments` 대신 rest parameter 사용을 요구합니다.                                 |
| `prefer-spread`                  | `.apply()` 대신 spread 연산자 사용을 요구합니다.                                   |
| `prefer-template`                | 문자열 연결 대신 템플릿 리터럴 사용을 요구합니다.                                  |
| `preserve-caught-error`          | 커스텀 에러를 다시 던질 때 원래 잡힌 에러를 잃지 않도록 합니다.                    |
| `radix`                          | `parseInt()` 사용 시 진법 인자를 명시하도록 강제합니다.                            |
| `require-await`                  | `await`가 없는 `async` 함수를 금지합니다.                                          |
| `require-unicode-regexp`         | 정규식에 `u` 또는 `v` 플래그 사용을 요구합니다.                                    |
| `require-yield`                  | generator 함수에 `yield`가 포함되도록 요구합니다.                                  |
| `sort-imports`                   | 모듈 import 선언 정렬을 강제합니다.                                                |
| `sort-keys`                      | 객체 키 정렬을 요구합니다.                                                         |
| `sort-vars`                      | 같은 선언 블록의 변수 정렬을 요구합니다.                                           |
| `strict`                         | strict mode 지시문 사용 여부를 강제합니다.                                         |
| `symbol-description`             | `Symbol` 생성 시 설명을 요구합니다.                                                |
| `vars-on-top`                    | `var` 선언을 해당 스코프 맨 위에 두도록 요구합니다.                                |
| `yoda`                           | Yoda 조건 사용 여부를 강제합니다.                                                  |

## Layout & Formatting

| 규칙          | 설명                                       |
| ------------- | ------------------------------------------ |
| `unicode-bom` | 파일의 Unicode BOM 사용 여부를 강제합니다. |
