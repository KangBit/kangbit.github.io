---
title: JavaScript 01. 실행 환경과 기본 문법
description: JavaScript가 실행되는 환경을 확인하고 값과 타입을 다루는 문법을 익힙니다.
outline: deep
---

# 01. 실행 환경과 기본 문법

JavaScript가 어디서 실행되는지 확인하고, 값과 타입을 다루는 문법을 정리합니다.

## 브라우저 콘솔과 런타임

JavaScript는 혼자 실행되지 않고 **런타임** 위에서 동작합니다. 브라우저와 Node.js가 대표적입니다.

문법은 같지만 쓸 수 있는 기능이 다릅니다.

```js
// 브라우저에만 있는 것
document.title;
window.location.href;

// Node.js에만 있는 것
process.version;
```

브라우저 개발자 도구의 Console 탭에서 바로 실행해 볼 수 있습니다.

```js
console.table([
  { id: 1, done: false },
  { id: 2, done: true },
]);

console.time("작업");
// ...
console.timeEnd("작업"); // 작업: 1.23ms
```

## 변수 선언

`var`, `let`, `const` 세 가지가 있습니다. `const`를 기본으로 두고, 재할당이 필요할 때만 `let`을 씁니다.

```js
const name = "bit";
name = "chan"; // TypeError: Assignment to constant variable.

let count = 0;
count += 1; // 가능
```

`const`가 막는 것은 **재할당**이지 값의 변경이 아닙니다.

```js
const todo = { title: "공부", done: false };

todo.done = true; // 가능
todo = {}; // TypeError
```

`var`를 쓰지 않는 이유는 블록을 무시하기 때문입니다.

```js
if (true) {
  var a = 1;
  let b = 2;
}

console.log(a); // 1
console.log(b); // ReferenceError: b is not defined
```

선언 전에 접근할 때도 다르게 동작합니다. `var`는 `undefined`로 초기화된 채 올라가고, `let`과 `const`는 선언 전까지 접근할 수 없습니다.

```js
console.log(x); // undefined
var x = 1;

console.log(y); // ReferenceError: Cannot access 'y' before initialization
let y = 1;
```

## 원시 타입

원시 타입은 일곱 가지이고, 그 밖의 모든 것은 객체입니다.

```js
typeof "bit"; // "string"
typeof 1; // "number"
typeof true; // "boolean"
typeof undefined; // "undefined"
typeof Symbol(); // "symbol"
typeof 10n; // "bigint"

typeof null; // "object"   언어 초기의 설계 실수입니다
typeof []; // "object"
typeof function () {}; // "function"
```

`typeof null`이 `"object"`라서, null 검사는 `typeof`로 하지 않고 값을 직접 비교합니다.

### 숫자는 모두 실수입니다

정수 타입이 따로 없고 전부 64비트 부동소수점입니다.

```js
0.1 + 0.2; // 0.30000000000000004
0.1 + 0.2 === 0.3; // false

Number.MAX_SAFE_INTEGER; // 9007199254740991
```

금액을 다룰 때는 원 단위 정수로 바꿔 계산하거나 전용 라이브러리를 씁니다.

### NaN

숫자로 바꿀 수 없는 값을 숫자로 다루면 `NaN`이 됩니다. 자기 자신과도 같지 않습니다.

```js
Number("abc"); // NaN
NaN === NaN; // false
Number.isNaN(NaN); // true
```

### undefined와 null

`undefined`는 "아직 값이 없다"에 가깝고 주로 런타임이 넣습니다. `null`은 "비어 있다"를 개발자가 명시한 값입니다.

```js
let value;
value; // undefined

const empty = null; // 의도적으로 비움
```

## 형변환

연산자에 따라 값이 자동으로 변환됩니다.

```js
"5" + 1; // "51"   문자열 연결
"5" - 1; // 4      숫자로 변환
+"5"; // 5

Number(""); // 0
Number("  "); // 0
Number("5a"); // NaN
parseInt("5a"); // 5
```

`+`만 문자열 연결을 겸하기 때문에 다른 연산자와 결과가 갈립니다. 변환이 필요하면 `Number()`나 `String()`으로 의도를 드러내는 편이 낫습니다.

## truthy와 falsy

조건문에서 거짓으로 취급되는 값은 여덟 개뿐이고, 나머지는 전부 참입니다.

```
false, 0, -0, 0n, "", null, undefined, NaN
```

```js
if ([]) console.log("빈 배열도 truthy");
if ({}) console.log("빈 객체도 truthy");

Boolean("0"); // true   문자열 "0"은 truthy
```

`0`과 빈 문자열이 falsy라서 기본값 처리에서 문제가 생깁니다.

```js
const count = 0;

count || 10; // 10   0을 값으로 인정하지 않습니다
count ?? 10; // 0    null과 undefined일 때만 기본값
```

## ==와 ===

`==`는 타입을 맞춘 뒤 비교하고, `===`는 타입이 다르면 바로 거짓입니다.

```js
1 == "1"; // true
1 === "1"; // false

0 == false; // true
"" == 0; // true
[] == false; // true
[] == ""; // true

null == undefined; // true
null === undefined; // false
```

변환 규칙이 복잡해서 결과를 예측하기 어렵습니다. **`===`를 기본으로 쓰고**, null과 undefined를 한 번에 거르고 싶을 때만 `== null`을 의도적으로 사용합니다.

```js
if (value == null) {
  // value가 null이거나 undefined
}
```

## 연산자

논리 연산자는 불리언이 아니라 **피연산자 중 하나를 그대로 반환**합니다.

```js
"a" || "b"; // "a"
"" || "b"; // "b"

"a" && "b"; // "b"
"" && "b"; // ""
```

왼쪽에서 결과가 정해지면 오른쪽은 실행하지 않습니다. 이 성질을 이용해 조건부 실행을 짧게 쓰기도 합니다.

```js
isReady && start(); // isReady가 참일 때만 start 실행
```

## 조건문과 반복문

`switch`는 `===`로 비교합니다.

```js
switch (status) {
  case "done":
    break;
  default:
    break;
}
```

배열을 도는 방법은 여러 가지입니다.

```js
const list = ["a", "b", "c"];

for (let i = 0; i < list.length; i += 1) {} // 인덱스가 필요할 때
for (const item of list) {} // 값을 순회
for (const key in list) {} // 키를 순회 — 배열에는 권장하지 않습니다

list.forEach((item, index) => {}); // break로 중간에 멈출 수 없습니다
```

`for...in`은 객체의 키를 도는 문법이고 프로토타입의 속성까지 올라갑니다. 배열에는 `for...of`를 씁니다.
