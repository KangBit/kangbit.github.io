---
title: JavaScript 03. 스코프와 객체 모델
description: 변수가 살아 있는 범위와 this, 프로토타입, 참조의 동작을 익힙니다.
outline: deep
---

# 03. 스코프와 객체 모델

변수가 어디까지 보이는지, 객체가 어떻게 연결되고 복사되는지 정리합니다.

## 스코프

변수를 찾을 때는 안쪽에서 바깥쪽으로 올라갑니다. 이 연결을 스코프 체인이라고 합니다.

```js
const global = "전역";

function outer() {
  const outerValue = "바깥";

  function inner() {
    const innerValue = "안쪽";
    console.log(global, outerValue, innerValue); // 전부 접근 가능
  }

  inner();
  console.log(innerValue); // ReferenceError
}
```

안쪽에서 같은 이름을 다시 선언하면 바깥 변수를 가립니다.

```js
const name = "바깥";

function print() {
  const name = "안쪽";
  console.log(name); // "안쪽"
}
```

## 클로저

함수는 **선언된 위치의 스코프를 기억**합니다. 바깥 함수가 끝나도 그 변수는 사라지지 않습니다.

```js
function createCounter() {
  let count = 0;

  return {
    increase: () => (count += 1),
    get: () => count,
  };
}

const counter = createCounter();
counter.increase();
counter.increase();
counter.get(); // 2
```

`count`는 밖에서 직접 건드릴 수 없고 `increase`와 `get`을 통해서만 접근됩니다. 이렇게 상태를 감추는 데 자주 쓰입니다.

반복문에서 `var`를 쓰면 클로저가 **하나의 변수**를 공유하게 됩니다.

```js
for (var i = 0; i < 3; i += 1) {
  setTimeout(() => console.log(i)); // 3 3 3
}

for (let i = 0; i < 3; i += 1) {
  setTimeout(() => console.log(i)); // 0 1 2
}
```

`let`은 반복마다 새 바인딩을 만들기 때문에 각 함수가 다른 `i`를 기억합니다.

## this

`this`는 선언 위치가 아니라 **호출 방식**으로 정해집니다.

```js
function show() {
  console.log(this);
}

show(); // 일반 호출 — 엄격 모드에서 undefined
obj.show(); // 메서드 호출 — obj
new Show(); // 생성자 호출 — 새로 만들어진 객체
show.call(target); // 명시적으로 지정 — target
```

콜백으로 넘기는 순간 호출 방식이 바뀌어 `this`를 잃는 것이 흔한 함정입니다.

```js
const counter = {
  count: 0,

  brokenStart() {
    setTimeout(function () {
      this.count += 1; // this가 counter가 아닙니다
    }, 0);
  },

  start() {
    setTimeout(() => {
      this.count += 1; // 화살표는 바깥의 this를 그대로 씁니다
    }, 0);
  },
};
```

화살표 함수는 자신의 `this`를 만들지 않고 선언된 위치의 것을 사용합니다. 그래서 콜백에는 화살표가, 객체의 메서드에는 일반 함수가 어울립니다.

## 프로토타입과 클래스

객체는 다른 객체를 **원형으로 연결**해 두고, 자신에게 없는 속성은 연결된 쪽에서 찾습니다.

```js
const animal = {
  speak() {
    return "소리";
  },
};

const dog = Object.create(animal);
dog.speak(); // "소리" — dog에는 없지만 animal에서 찾습니다
```

`class`는 이 연결을 읽기 쉽게 쓰는 문법입니다.

```js
class Animal {
  #name; // 외부에서 접근할 수 없는 필드

  constructor(name) {
    this.#name = name;
  }

  speak() {
    return `${this.#name}: 소리`;
  }
}

class Dog extends Animal {
  speak() {
    return `${super.speak()} 멍멍`;
  }
}

new Dog("바둑이").speak(); // "바둑이: 소리 멍멍"
```

메서드는 인스턴스마다 복사되지 않고 프로토타입에 한 번만 존재합니다.

```js
const a = new Dog("a");
const b = new Dog("b");

a.speak === b.speak; // true
```

## 참조와 복사

원시 값은 값이 복사되고, 객체는 **가리키는 주소가 복사**됩니다.

```js
let x = 1;
let y = x;
y = 2;
x; // 1

const a = { count: 1 };
const b = a;
b.count = 2;
a.count; // 2 — 같은 객체입니다
```

그래서 비교도 내용이 아니라 같은 객체인지를 봅니다.

```js
{ count: 1 } === { count: 1 }; // false
```

스프레드와 `Object.assign`은 한 겹만 복사합니다. 중첩까지 끊으려면 `structuredClone`을 씁니다.

```js
const origin = { nested: { count: 1 } };

const shallow = { ...origin };
shallow.nested.count = 2;
origin.nested.count; // 2

const deep = structuredClone(origin);
deep.nested.count = 3;
origin.nested.count; // 2 — 영향 없음
```

`structuredClone`은 함수나 DOM 요소를 담은 객체는 복사하지 못하고 오류를 냅니다.

## 반복 가능한 객체와 제너레이터

`for...of`와 스프레드는 객체가 `Symbol.iterator`를 가지고 있을 때 동작합니다. 배열, 문자열, `Map`, `Set`이 여기 해당합니다.

```js
const range = {
  from: 1,
  to: 3,

  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;

    return {
      next: () => ({ value: current, done: current++ > last }),
    };
  },
};

[...range]; // [1, 2, 3]
```

제너레이터를 쓰면 같은 것을 훨씬 짧게 쓸 수 있습니다. `yield`에서 멈췄다가 다음 요청에 이어서 실행됩니다.

```js
function* createRange(from, to) {
  for (let i = from; i <= to; i += 1) {
    yield i;
  }
}

[...createRange(1, 3)]; // [1, 2, 3]
```

필요한 만큼만 값을 만들어 내기 때문에, 끝이 없는 수열이나 큰 데이터를 조금씩 다룰 때 쓸 수 있습니다.
