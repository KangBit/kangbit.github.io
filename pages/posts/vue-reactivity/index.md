---
title: ref vs reactive
description: ref와 reactive 중 어떤 것을 선택할 것인가
comment: true
---

# Ref vs Reactive ( 작성중 )

## 들어가며

Vue3의 Composition Api에서 반응형 상태를 선언하는 방법은 `ref`와 `reactive` 두가지가 있습니다.

두 방법이 존재하다 보니 어떤 방법을 사용할지 헷갈려 하는 경우가 많습니다.

어떤 상황에 어떤 방법을 쓰면 좋을지 알아보겠습니다.

## 공식 문서의 제안

공식 문서에서는 반응형 기초를 설명하는 첫 줄에서 `ref`를 사용할 것을 권장하고 있습니다.

<img src="/assets/images/vue-reactivity/vue-reactivity-1.jpeg" width="100%" alt="vue3 공식 문서의 반응형 기초">

`reactive`의 제한사항을 설명하면서도 `ref`를 기본으로 사용하기를 권장합니다.

<img src="/assets/images/vue-reactivity/vue-reactivity-2.jpeg" width="100%" alt="vue3 공식 문서의 reactive 제한사항">

그렇다면 `reactive`는 필요 없는 것 아닐까요?

`ref`와 `reactive의` 특징에 대해 살펴보면서 더 자세히 알아보겠습니다.

## ref

### 1. value 속성

`ref` 객체는 `.value` 속성을 갖습니다.

``` js
const count = ref(0)

console.log(count) // { value: 0 }
console.log(count.value) // 0
```

이 때문에 반응성 값임을 쉽게 확인할 수 있어서 선호한다는 의견이 있는 반면,

`.value`에 접근하는 것이 번거로워 `ref`를 선호하지 않는다는 의견도 있습니다.


### 2. 깊은 반응성

`ref` 는 깊게 반응합니다.

중첩된 객체나 배열이 변경되어도 적절하게 변경을 감지합니다.

다음과 같이 `isReactive`를 통해 확인해 보면, 

객체 내부의 속성중 객체 유형은 `reactive`를 통해 Proxy 객체로 반환되는 것을 확인할 수 있습니다.

``` js
const obj = ref({property: [1,2,3], property2: 4});

console.log(isReactive(obj)); // false
console.log(isReactive(obj.value)); // true
console.log(isReactive(obj.value.property)); // true
console.log(isReactive(obj.value.property2)); // false
```

## reactive

### 1. 객체 유형만 가능

이 내용을 보고 객체 유형에는 reactive를 사용해야 한다는 오해를 하시는 분도 있는 것 같습니다.

