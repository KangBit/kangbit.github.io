---
title: Marquee
# titleTemplate:
# description:
# outline: false
---

<style module>
.marquee {
  display: flex;
  width: 100%;
  overflow: hidden;
}

.marquee_list {
  display: flex;
  padding: 0 !important;
}

.marquee_list.active {
  animation: roll 10s linear infinite;
}

.marquee_items {
  display: flex;
  padding: 0 !important;
}

.marquee_text {
  white-space: nowrap;
}

.marquee_image {
  display: flex;
  align-items: center;
  justify-content: center;
  color: grey;

  list-style: none;
  width: 180px;
  height: 100px;
  background-color: lightblue;
  margin-top: 0 !important;
  margin-right: 10px;
}

.marquee_image.copy {
  background-color: lightsalmon;
}

@keyframes roll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}
</style>

<script setup>
import BaseMarquee from '@/components/BaseMarquee.vue'
</script>

# Marquee

## Marquee란

marqee는 텐트나 천막을 뜻하는 옛 프랑스어인 marquise에서 유래했습니다.

<img src="/assets/images/marquee/marquise.jpeg" width="70%" class="mb-0"></img>
(출처: [Google Search](https://www.google.com/search?q=marquise+meaning))

marquee는 영어로 차용된 이후 공연장이나 극장 앞에 설치된 큰 천막이나 간판을 의미하게 되었습니다.

marquee중 일부는 사람들의 주의를 끌기 위해 수동 또는 자동으로 움직이는 텍스트를 포함했는데,

이러한 이유로 marquee라는 단어가 HTML 태그 이름으로 채택되었습니다.

## Marquee Tag

HTML 태그 `<marquee>`는 텍스트나 이미지를 수평 또는 수직으로 움직이게 하는 데 사용되었습니다.

현재는 HTML 표준에서 제외되었기 때문에 직접 구현해야 합니다.

<BaseMarquee>
  <div :class="$style.marquee_items">
    <span :class="$style.marquee_text">
    HTML 태그 'marquee'는 텍스트나 이미지를 수평 또는 수직으로 움직이게 하는 데 사용되었습니다. 현재는 HTML 표준에서 제외되었기 때문에 직접 구현해야 합니다.
    </span>
  </div>
</BaseMarquee>

<br>

<BaseMarquee>
  <div :class="$style.marquee_items">
    <div :class="$style.marquee_image"></div>
    <div :class="$style.marquee_image"></div>
    <div :class="$style.marquee_image"></div>
    <div :class="$style.marquee_image"></div>
    <div :class="$style.marquee_image"></div>
  </div>
</BaseMarquee>

## 구현

marquee는 다양한 방법으로 구현할 수 있고, 그 중 한 가지 방법을 소개합니다.

우선, 움직임을 표현할 리스트에 애니메이션을 적용해 보겠습니다.

::: code-group

```html [index.html]
<div class="marquee">
  <ul class="marquee_list">
    <li class="marquee_item"></li>
    <li class="marquee_item"></li>
    <li class="marquee_item"></li>
    <li class="marquee_item"></li>
    <li class="marquee_item"></li>
  </ul>
</div>
```

```css{19} [index.css]
@keyframes roll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}

.marquee {
  display: flex;
  width: 500px;
  overflow: hidden;
}

.marquee_list {
  display: flex;
  padding: 0 !important;
  animation: roll 10s linear infinite;
}

.marquee_item {
  list-style: none;
  width: 180px;
  height: 100px;
  background-color: lightblue;
  margin-right: 10px;
}
```

:::

<div :class="$style.marquee">
  <ul :class="[$style.marquee_list, $style.active]">
    <li :class="$style.marquee_image">1</li>
    <li :class="$style.marquee_image">2</li>
    <li :class="$style.marquee_image">3</li>
    <li :class="$style.marquee_image">4</li>
    <li :class="$style.marquee_image">5</li>
  </ul>
</div>

잘 움직이긴 하지만, 연속성이 없어 부자연스러워 보입니다.

목록을 복사해서 뒤에 붙여넣어주면 자연스럽게 보일 것 같습니다.

::: code-group

<!-- prettier-ignore -->
```html [index.html]
<div class="marquee">
  <ul class="marquee_list">
    <li class="marquee_item"></li>
    <li class="marquee_item"></li>
    <li class="marquee_item"></li>
    <li class="marquee_item"></li>
    <li class="marquee_item"></li>
  </ul>
  <ul class="marquee_list copy">    // [!code ++]
    <li class="marquee_item"></li>  // [!code ++]
    <li class="marquee_item"></li>  // [!code ++]
    <li class="marquee_item"></li>  // [!code ++]
    <li class="marquee_item"></li>  // [!code ++]
    <li class="marquee_item"></li>  // [!code ++]
  </ul>                             // [!code ++]
</div>
```

```css [index.css]
@keyframes roll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}

.marquee {
  display: flex;
  width: 500px;
  overflow: hidden;
}

.marquee_list {
  display: flex;
  padding: 0 !important;
  animation: roll 10s linear infinite;
}

.marquee_item {
  list-style: none;
  width: 180px;
  height: 100px;
  background-color: lightblue;
  margin-right: 10px;
}
```

:::

<div :class="$style.marquee">
  <ul :class="[$style.marquee_list, $style.active]">
    <li :class="$style.marquee_image">1</li>
    <li :class="$style.marquee_image">2</li>
    <li :class="$style.marquee_image">3</li>
    <li :class="$style.marquee_image">4</li>
    <li :class="$style.marquee_image">5</li>
  </ul>
  <ul :class="[$style.marquee_list, $style.active]"> 
    <li :class="[$style.marquee_image]">1</li>
    <li :class="[$style.marquee_image]">2</li>
    <li :class="[$style.marquee_image]">3</li>
    <li :class="[$style.marquee_image]">4</li>
    <li :class="[$style.marquee_image]">5</li>
  </ul>
</div>

이해를 위해 복사된 영역은 색상을 다르게 해보겠습니다.

원본 영역과 복사 영역이 모두 본래 자리에서 100%만큼 이동한 후에

원래 자리로 회귀하는 동작을 반복하고,

우리의 눈에는 계속해서 이동하는 것처럼 보이게 됩니다.

<div :class="$style.marquee">
  <ul :class="[$style.marquee_list, $style.active]">
    <li :class="$style.marquee_image">1</li>
    <li :class="$style.marquee_image">2</li>
    <li :class="$style.marquee_image">3</li>
    <li :class="$style.marquee_image">4</li>
    <li :class="$style.marquee_image">5</li>
  </ul>
  <ul :class="[$style.marquee_list, $style.active]"> 
    <li :class="[$style.marquee_image, $style.copy]">1</li>
    <li :class="[$style.marquee_image, $style.copy]">2</li>
    <li :class="[$style.marquee_image, $style.copy]">3</li>
    <li :class="[$style.marquee_image, $style.copy]">4</li>
    <li :class="[$style.marquee_image, $style.copy]">5</li>
  </ul>
</div>

하지만 목록의 크기가 컨테이너보다 작을 경우에는 여전히 부자연스럽습니다.

<div :class="$style.marquee">
  <ul :class="[$style.marquee_list, $style.active]">
    <li :class="$style.marquee_image">1</li>
    <li :class="$style.marquee_image">2</li>
  </ul>
  <ul :class="[$style.marquee_list, $style.active]"> 
    <li :class="[$style.marquee_image, $style.copy]">1</li>
    <li :class="[$style.marquee_image, $style.copy]">2</li>
  </ul>
</div>

요구사항에 따라 달라지겠지만

여기서는 목록의 크기가 컨테이너보다 작을 경우에 애니메이션을 동작하지 않도록 막고 싶습니다.

요소를 선택적으로 제어하기 위해, `js`를 통해 목록의 복사가 이루어지도록 수정합니다.

::: code-group

```html [index.html]
<div id="marquee" class="marquee">
  <ul id="marquee_list" class="marquee_list">
    <li class="marquee_item"></li>
    <li class="marquee_item"></li>
    <li class="marquee_item"></li>
    <li class="marquee_item"></li>
    <li class="marquee_item"></li>
  </ul>
</div>
```

<!-- prettier-ignore -->
```js [index.js]
const container = document.getElementById("marquee"); // [!code ++]
const marqueeList = document.getElementById("marquee_list"); // [!code ++]

let copy = marqueeList.cloneNode(true);  // [!code ++]
copy.id = "marquee_list_copy";          // [!code ++]

container.appendChild(copy);      // [!code ++]
```

```css [index.css]
@keyframes roll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}

.marquee {
  display: flex;
  width: 500px;
  overflow: hidden;
}

.marquee_list {
  display: flex;
  padding: 0 !important;
  animation: roll 10s linear infinite;
}

.marquee_item {
  list-style: none;
  width: 180px;
  height: 100px;
  background-color: lightblue;
  margin-right: 10px;
}
```

:::

이제, 조건에 따라 목록을 복사하거나 애니메이션의 실행을 막도록 코드를 수정합니다.

::: code-group

```html [index.html]
<div id="marquee" class="marquee">
  <ul id="marquee_list" class="marquee_list"> // [!code --]
  <ul id="marquee_list" class="marquee_list active"> // [!code ++]
    <li class="marquee_item"></li>
    <li class="marquee_item"></li>
    <li class="marquee_item"></li>
    <li class="marquee_item"></li>
    <li class="marquee_item"></li>
  </ul>
</div>
```

<!-- prettier-ignore -->
```js [index.js]
const container = document.getElementById("marquee");
const marqueeList = document.getElementById("marquee_list");

const containerWidth = container.offsetWidth; // [!code ++]
const listWidth = marqueeList.offsetWidth; // [!code ++]

if (containerWidth < listWidth) { // [!code ++]
  let copy = marqueeList.cloneNode(true);
  copy.id = "marquee_list_copy";

  container.appendChild(copy);
} else { // [!code ++]
  marqueeList.classList.remove("active"); // [!code ++]
} // [!code ++]
```

<!-- prettier-ignore -->
```css [index.css]
@keyframes roll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}

.marquee {
  display: flex;
  width: 500px;
  overflow: hidden;
}

.marquee_list {
  display: flex;
  padding: 0 !important;
} /* [!code ++]*/
.marquee_list.active { /* [!code ++]*/
  animation: roll 10s linear infinite;
}

.marquee_item {
  list-style: none;
  width: 180px;
  height: 100px;
  background-color: lightblue;
  margin-right: 10px;
}
```

:::

다음과 같이 컨테이너의 크기와 목록의 크기에 따라 애니메이션을 실행하게 되었습니다.

<BaseMarquee>
  <div :class="$style.marquee_items">
    <div :class="$style.marquee_image"></div>
    <div :class="$style.marquee_image"></div>
  </div>
</BaseMarquee>
<br>
<BaseMarquee>
  <div :class="$style.marquee_items">
    <div :class="$style.marquee_image"></div>
    <div :class="$style.marquee_image"></div>
    <div :class="$style.marquee_image"></div>
    <div :class="$style.marquee_image"></div>
    <div :class="$style.marquee_image"></div>
  </div>
</BaseMarquee>

## HTML Code

::: details index.html
::: code-group

```html [index.html]
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Marquee</title>
    <link rel="stylesheet" href="./index.css" />
  </head>
  <body>
    <div class="container">
      <div id="marquee" class="marquee">
        <ul id="marquee_list" class="marquee_list active">
          <li class="marquee_item"></li>
          <li class="marquee_item"></li>
          <li class="marquee_item"></li>
          <li class="marquee_item"></li>
          <li class="marquee_item"></li>
        </ul>
      </div>
    </div>

    <script src="./index.js"></script>
  </body>
</html>
```

```css [index.css]
@keyframes roll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}

.marquee {
  display: flex;
  width: 500px;
  overflow: hidden;
}

.marquee_list {
  display: flex;
  padding: 0 !important;
}

.marquee_list.active {
  animation: roll 10s linear infinite;
}

.marquee_item {
  list-style: none;
  width: 180px;
  height: 100px;
  background-color: lightblue;
  margin-top: 0 !important;
  margin-right: 10px;
}
```

```js [index.js]
const container = document.getElementById("marquee");
const marqueeList = document.getElementById("marquee_list");

const containerWidth = container.offsetWidth;
const listWidth = marqueeList.offsetWidth;

if (containerWidth < listWidth) {
  let copy = marqueeList.cloneNode(true);
  copy.id = "marquee_list_copy";

  container.appendChild(copy);
} else {
  marqueeList.classList.remove("active");
}
```

:::

## Vue Code

::: details BaseMarquee.vue
::: code-group

```vue [BaseMarquee.vue]
<script setup>
import { ref, computed, onMounted } from "vue";

const props = defineProps({
  duration: {
    type: String,
    default: "10s",
  },
});

const container = ref();
const list = ref();

const copy = ref(false);

const isOverflowingContainer = computed(() => {
  return container.value.offsetWidth < list.value.offsetWidth;
});

onMounted(() => {
  if (isOverflowingContainer.value) {
    copy.value = true;
  }
});
</script>

<template>
  <div class="marquee" ref="container">
    <div
      ref="list"
      :class="{ marquee_list: true, active: copy }"
      :style="{ animationDuration: duration }"
    >
      <slot class="marquee_item"></slot>
    </div>
    <div
      v-if="copy"
      class="marquee_list copy active"
      :style="{ animationDuration: duration }"
    >
      <slot class="marquee_item"></slot>
    </div>
  </div>
</template>

<style scoped>
.marquee {
  width: 100%;
  display: flex;
  overflow: hidden;
}

.marquee_list {
  display: flex;
  padding: 0 !important;
}

.marquee_list.active {
  animation: roll 0s linear infinite;
}

@keyframes roll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}
</style>
```

:::
