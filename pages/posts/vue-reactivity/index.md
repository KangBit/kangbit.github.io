---
title: ref vs reactive
description: ref와 reactive 중 어떤 것을 선택할 것인가
comment: true
---

# Ref vs Reactive

## 들어가며

Vue3의 Composition Api에서 반응형 상태를 선언하는 방법은 `ref`와 `reactive` 두가지가 있습니다.

두 방법이 존재하다 보니 어떤 방법을 사용할지 헷갈려 하는 경우가 많습니다.

이 글이 생각을 정리하는 데 도움이 되었으면 좋겠습니다.

결론만 보고 싶은 분은 [그래서 뭐 쓰라고](#그래서-뭐-쓰라고) 로 이동해주세요

## 공식 문서의 제안

공식 문서에서는 반응형 기초를 설명하는 첫 줄에서 `ref`를 사용할 것을 권장하고 있습니다.

<img src="/assets/images/vue-reactivity/vue-reactivity-1.jpeg" width="100%" alt="vue3 공식 문서의 반응형 기초">

`reactive`의 제한사항을 설명하면서도 `ref`를 기본으로 사용하기를 권장합니다.

<img src="/assets/images/vue-reactivity/vue-reactivity-2.jpeg" width="100%" alt="vue3 공식 문서의 reactive 제한사항">

그렇다면 `reactive`는 필요 없는 것 아닐까요?

`ref`와 `reactive`의 특징에 대해 살펴보면서 더 알아보겠습니다.

## ref

### 1. value 속성

`ref` 객체는 `value` 속성을 갖습니다.

``` js
const count = ref(0)

console.log(count) // { value: 0 }
console.log(count.value) // 0
```

이 때문에 반응성 값임을 쉽게 확인할 수 있어서 선호한다는 의견이 있는 반면,

`.value`로 접근하는 것이 번거로워 `ref`를 선호하지 않는다는 의견도 있습니다.

확실히 다음과 같은 코드는 상당히 부자연스러워 보일 수 있습니다.

``` js
const arr = ref([1,2,3]);
arr.value.push(4)
```

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

`reactive`는 객체 유형에만 작동합니다.

간혹 이 내용을 보고 객체 유형에는 `reactive`를 사용해야 한다는 오해를 하시는 분도 있는 것 같습니다.

### 2. 깊은 반응성

`ref`와 마찬가지로 깊은 반응성을 제공합니다.

### 3. 전체 객체를 대체할 수 없음

다음과 같이 객체 전체를 대체하려고 하면 `reactive` 객체에 대한 반응성이 끊기게 됩니다.

``` js
let user = reactive({ name: 'Kim', age: 30 });
user = reactive({ name: 'Kim', age: 30 });
```

따라서, 전체 객체를 대체해야 할 필요가 있는 경우에 다음과 같이 사용하게 되는데,

``` js
const data = reactive({ user: { name: 'Kim', age: 30 } });
data.user = { name: 'Kim', age: 30 } ;
```

`ref`를 사용하는 게 더 나아 보입니다.

``` js
const user = ref({ name: 'Kim', age: 30 });
user.value = { name: 'Kim', age: 30 };
```

### 4. 분해 할당에 친화적이지 않음

공식문서의 `reactive`의 제한 사항에서는 분해 할당에 친화적이지 않다는 내용이 있습니다.

그렇다면 과연 `reactive`만 분해 할당에 친화적이지 않을지

다음 예제를 통해 살펴보겠습니다.

``` vue
<script setup>
import { ref, reactive } from "vue";

// Vue에서 ref와 reactive 사용 예제
const refData = ref({ number: 1 });
const reactiveData = reactive({ number: 1 });

// 객체 속성을 개별 변수로 추출하며 반응성 유지
let { number: refNumber } = refData.value; // ref에서 값 추출
let { number: reactiveNumber } = reactiveData; // reactive에서 값 추출

const incrementValues = () => {
  refData.value.number++;
  reactiveData.number++;
};
</script>

<template>
<div class="example">
  <div>
    <button @click="incrementValues">Increment Values</button>
  </div>
  <p>ref: {{ refData }}, refNumber: {{ refNumber }}</p>
  <p>reactive: {{ reactiveData }}, reactiveNumber: {{ reactiveNumber }}</p>
</div>
</template>
```

<style >
  .example {
    padding: 1rem;
    border: 1px solid;

    
    button {
      background-color: #007bff;
      color: #ffffff;
      padding: 8px 16px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    button:hover {
      background-color: #0056b3;
    }

    button:active {
      background-color: #004494;
    }
  }
</style>

<div class="example">
  <div>
    <button @click="incrementValues">Increment Values</button>
  </div>
  <p>ref: {{ refData }}, refNumber: {{ refNumber }}</p>
  <p>reactive: {{ reactiveData }}, reactiveNumber: {{ reactiveNumber }}</p>
</div>

<script setup>
import { ref, reactive } from "vue";

// Vue에서 ref와 reactive 사용 예제
const refData = ref({ number: 1 });
const reactiveData = reactive({ number: 1 });

// 객체 속성을 개별 변수로 추출하며 반응성 유지
let { number: refNumber } = refData.value; // ref에서 값 추출
let { number: reactiveNumber } = reactiveData; // reactive에서 값 추출

const incrementValues = () => {
  refData.value.number++;
  reactiveData.number++;
};
</script>

`ref` 또한 분해할당에 친화적이지 않은 것을 볼 수 있습니다.

다만, `ref`와 `reactive` 모두 `toRefs`를 통해 반응성을 유지할 수 있습니다.

``` js
// const refNumber = toRef(refData.value, "number"); // 반응성 유지
const { number: refNumber } = toRefs(refData.value); // 반응성 유지
const { number: reactiveNumber } = toRefs(reactiveData); // 반응성 유지
```

## 그래서 뭐 쓰라고 {#그래서-뭐-쓰라고}

사실 무엇을 사용해도 크게 문제되지 않습니다.

나만의 규칙을 만들어 보세요.

- 공식문서에서 제안하고 있으니 `ref`를 기본으로 사용하고  특수한 상황에서만 `reactive`를 사용한다.

- 원시 타입에만 `ref`를 사용하고 객체 유형은 `reactive`를 사용한다.

- 헷갈리지 않게 `ref`만 사용한다.

- 헷갈리지 않게 `reactive`만 사용한다.

- `.value` 가 보기 싫으니 `reactive`를 사용한다.

프로젝트에 합류했다면 규칙을 따르고, 확신이 있다면 규칙을 수정할 것을 제안해 보세요.

## 확실한 기준을 세우기

어떤 기준으로 직면한 문제를 해결할지 고민하는 순간이 많이 찾아옵니다.

프로젝트 큐모에 맞는 폴더 구조를 선택하는 것부터,

새로운 기술 도입이 우리 조직과 프로젝트에 적합한지를 판단하는 기준까지 깊이 있는 고민이 필요합니다.

코드의 중복을 어느 선까지 허용할지, 

낮은 결합도를 위해 의도적으로 중복을 허용하는 때는 언제일지 고민해야 합니다.

이런 기준들을 세우고 제시할 수 있게 되는 것이 개발자로서 성장하는 길 중 하나가 아닐까 합니다.

