---
title: Bitpage
titleTemplate: Slider
description: 간단한 슬라이더를 만드는 방법을 설명합니다.
# outline: false
comment: true
---

<script setup>
import BaseSlider from '@/components/BaseSlider.vue'
</script>

# Slider

## 들어가며

많은 프로젝트에서 슬라이더를 직접 구현하지 않고 외부 라이브러리를 사용하고 있을 겁니다.

물론 요구사항이 많을수록 잘 만들어진 라이브러리를 사용하는 게 유리한 경우가 많습니다.

하지만 기본적인 기능은 직접 구현하는 것도 그리 어렵지 않고,

한번 만들어 두면 여러 프로젝트에서 커스텀하여 사용할 수 있습니다.

'[가속합성으로 인한 화면 깜빡임 해결](https://kangbit.github.io/posts/hardware-acceleration/)'에서도 스와이퍼가 내부 라이브러리였다면

문제를 더 쉽게 해결할 수 있었을지도 모릅니다.

요구사항을 고려하지 않은 상태에서 라이브러리를 선호하기보다는

적절한 선택을 할 수 있기를 바라며 이 글을 작성합니다.

## Slider란

<style module>
.swiper_slide {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  flex-shrink: 0;

  font-size: 2rem;
  background-color: lightblue;
}
</style>

<BaseSlider :auto-play="true" :loop="true">
  <div :class="$style.swiper_slide">SLIDE 1</div>
  <div :class="$style.swiper_slide">SLIDE 2</div>
  <div :class="$style.swiper_slide">SLIDE 3</div>
  <div :class="$style.swiper_slide">SLIDE 4</div>
  <div :class="$style.swiper_slide">SLIDE 5</div>
</BaseSlider>

슬라이더는 이미지, 텍스트, 비디오 등 다양한 콘텐츠를 SlideShow 형식으로 보여주기 위한 UI 요소입니다.

버튼을 이용한 슬라이드 이동과 자동 슬라이드를 구현하고,

자동 슬라이드가 더 자연스럽도록 페이지를 순환하게 해보겠습니다.<br>
(`SLIDE 1 -> SLIDE 2 -> SLIDE 3 -> SLIDE 1 -> SLIDE 2 -> SLIDE 3`)

드래그 이벤트, 모바일 환경을 위한 스와이프 이벤트 처리와

페이지네이션 등은 직접 구현해 보시면 좋을 것 같습니다.

## 기본 슬라이더 (버튼 이동)

::: info
원활한 설명을 위해 `slide-item`의 갯수를 5개로 고정하고, `slider`의 높이를 고정값으로 설정했습니다.
:::

html과 css는 다음과 같습니다.

::: code-group

```html [index.html]
<div id="slider" class="slider">
  <div id="slide-wrapper" class="slide-wrapper">
    <div class="slide-item">SLIDE 1</div>
    <div class="slide-item">SLIDE 2</div>
    <div class="slide-item">SLIDE 3</div>
    <div class="slide-item">SLIDE 4</div>
    <div class="slide-item">SLIDE 5</div>
  </div>
  <div id="slider-prev-button" class="btn-arrow btn-prev">PREV</div>
  <div id="slider-next-button" class="btn-arrow btn-next">NEXT</div>
</div>
```

```css [index.css]
.slider {
  position: relative;
  overflow-x: hidden;
  width: 100%;
  height: 300px;
}

.slide-wrapper {
  position: absolute;
  display: flex;
  width: 100%;
  transition-property: transform;
}

.slider-container .btn-arrow {
  position: absolute;
  cursor: pointer;
}

.btn-prev {
  left: 0;
  top: 50%;
  transform: translate(0, -50%);
}

.btn-next {
  right: 0;
  top: 50%;
  transform: translate(0, -50%);
}

.slide-item {
  background-color: lightblue;

  width: 100%;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  flex-shrink: 0;

  font-size: 2rem;
}
```

:::

위치를 이동시킬 `slide-wrapper`와 클릭 이벤트를 등록할 버튼을 가져옵니다.

::: code-group

```js [index.js]
const slideWrapper = document.getElementById("slide-wrapper");
const prevButton = document.getElementById("slider-prev-button");
const nextButton = document.getElementById("slider-next-button");
```

:::

슬라이드를 실행할 함수를 작성합니다.

::: code-group

```js [index.js]
let slideIndex = 0;
let isSliding = false;

const slideTo = (index) => {
  if (isSliding) {
    return;
  }

  slideIndex = index;
  isSliding = true;

  const translateX = index * -100;

  slideWrapper.style.transitionDuration = "0.3s";
  slideWrapper.style.transform = `translate3d(${translateX}%, 0, 0)`;
};
```

:::

전환 애니메이션을 위해 하드웨어 가속을 이용하는 것을 볼 수 있습니다. ( `translate3d` )

여기서는 문제가 생길 수 있다는 것을 보여주기 위해 하드웨어 가속을 이용했습니다.

[여기서](https://kangbit.github.io/posts/slider/#slider%E1%84%85%E1%85%A1%E1%86%AB) 슬라이드 전환 시 깜빡거림이 발생하는 것을 볼 수 있습니다. ( 사파리 )

[여기서](https://kangbit.github.io/posts/slider/#slider%E1%84%85%E1%85%A1%E1%86%AB) 5번 - 1번 슬라이드 전환을 하다보면 깜빡거림이 발생하는 것을 볼 수 있습니다. ( 크롬 )

하드웨어 가속을 이용함으로 얻을 수 있는 장점도 있지만, 해결하기 어려운 문제에 직면할 때도 있습니다.

[swiperjs param](https://swiperjs.com/swiper-api#param-maxBackfaceHiddenSlides) 에서도 깜빡거림을 줄이기 위한 구현이 있다는 있다는 것을 확인할 수 있습니다.

> If total number of slides less than specified here value,
> then Swiper will enable backface-visibility: hidden on slide elements to reduce visual "flicker" in Safari.

또한 일부 해결책에도 한계가 있다는 것을 확인할 수 있습니다.

> It is not recommended to enable it on large amount of slides as it will reduce performance

해결방법을 찾아서 하드웨어 가속을 사용할지, 하드웨어 가속을 사용하지 않을지,

선택적으로 사용할 것인지는 각자의 판단에 맡기겠습니다.

여기에서의 깜빡임 해결 방법은 아래에서 설명하기로 하고,

다시 구현으로 돌아와서 버튼 클릭 이벤트 리스너를 추가해주면 완성입니다.

::: code-group

```js [index.js]
const onClickPrevButton = () => {
  if (slideIndex === 0) {
    return;
  }

  slideTo(slideIndex - 1);
};

const onClickNextButton = () => {
  if (slideIndex === 4) {
    return;
  }

  slideTo(slideIndex + 1);
};

const onTransitionEnd = () => {
  isSliding = false;
};

const setEventListeners = () => {
  prevButton.addEventListener("click", onClickPrevButton);
  nextButton.addEventListener("click", onClickNextButton);

  slideWrapper.addEventListener("transitionend", onTransitionEnd);
};

setEventListeners();
```

:::

## 무한 슬라이드

무한 슬라이드를 위해 양쪽 끝에 `slide-item`을 복사해서 삽입하겠습니다.

저번 게시글 [MARQUEE](https://kangbit.github.io/posts/marquee/)에서 소개한 구현 방법과 유사합니다.

맞습니다. [MARQUEE](https://kangbit.github.io/posts/marquee/)는 이 글을 쓰기 위한 준비단계였습니다.

다만 리스트를 통째로 복사했던 MARQUEE와는 달리 양 끝의 하나의 아이템만 복사합니다.

또한, 한쪽으로만 움직이는 MARQUEE와는 달리 양쪽으로 움직여야 하므로 양쪽 끝에 복사해서 넣어줍니다.

::: code-group

```js [index.js]
const slides = document.querySelectorAll("#slide-wrapper .slide-item");

const insertCloneSlides = () => {
  const firstSlide = slides[0];
  const lastSlide = slides[slides.length - 1];

  const cloneFirstSlide = firstSlide.cloneNode(true);
  const cloneLastSlide = lastSlide.cloneNode(true);

  slideWrapper.insertBefore(cloneLastSlide, firstSlide);
  slideWrapper.appendChild(cloneFirstSlide);
};

insertCloneSlides();
```

:::

cloneNode가 삽입된 모습은 다음과 같습니다.

```html{2,8}
<div id="slide-wrapper" class="slide-wrapper">
  <div class="slide-item copy">SLIDE 5</div>
  <div class="slide-item">SLIDE 1</div>
  <div class="slide-item">SLIDE 2</div>
  <div class="slide-item">SLIDE 3</div>
  <div class="slide-item">SLIDE 4</div>
  <div class="slide-item">SLIDE 5</div>
  <div class="slide-item copy">SLIDE 1</div>
</div>
```

복사된 노드로 Slide 된 후에는 원본 노드의 위치로 지연 없이 빠르게 복귀해야 합니다.

따라서 함수는 다음과 같이 변경됩니다.

::: code-group

```js [index.js]
const onClickPrevButton = () => {
  slideTo(slideIndex - 1);
};

const onClickNextButton = () => {
  slideTo(slideIndex + 1);
};

const onTransitionEnd = () => {
  isSliding = false;

  slideWrapper.style.transitionDuration = "";

  if (slideIndex < 0) {
    slideIndex = 4;
    slideWrapper.style.transform = `translate(-400%, 0)`;
  }

  if (slideIndex > 4) {
    slideIndex = 0;
    slideWrapper.style.transform = `translate(0%, 0)`;
  }
};
```

:::

## 슬라이더 자동 재생

자동 재생을 할 때 떠올리기 가장 쉬운 방법은 인터벌을 주는 것입니다.

```js
setInterval(() => {
  slideTo(slideIndex + 1);
}, delay);
```

하지만 인터벌 중간에 슬라이드 이동이 있을 경우 이렇게 동작할 수 있습니다.

`1초(인터벌) -> 1.9초(버튼 클릭) -> 2초(인터벌)`

전환이 종료된 후 일정 시간이 지났을 때 자동으로 슬라이드 되는 게 자연스러울 것 같습니다.

::: code-group

```js [index.js]
let timeout;
let autoPlay = true;

const onTransitionEnd = () => {
  // ...
  if (autoPlay) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      slideTo(slideIndex + 1);
    }, 500);
  }
};
```

:::

## 깜빡임 현상 해결

다음 두가지 방법 중 하나를 사용하면 깜빡임 현상을 해결할 수 있습니다.

```css
.slide-item {
  will-change: translate;
}
```

```css
.slide-item {
  transform: translateZ(0);
}
```

다만 전환이 자주 발생하는 슬라이더의 특성상 `transform`을 사용하는 게 좋아보입니다.

`will-change`의 경우에는 브라우저에서 전환에 대비하고 있어야 하므로

지속적으로 사용하기보다는 필요할 때만 적용하고, 변화를 마친 후에는 제거해 주어야 합니다.

물론 `transform: translateZ(0)`의 경우에도 너무 많은 요소에 사용하게 되면

성능에 안좋은 영향을 줄 수 있으므로 너무 많은 전환 요소가 있을 경우에는

3d전환은 일부 요소에만 적용하고, 2d전환을 이용하는 것이 더 좋은 선택이 될 수 있습니다.

## HTML Code

::: details index.html
::: code-group

```html index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Slider</title>
    <link rel="stylesheet" href="./index.css" />
  </head>
  <body>
    <section>
      <div id="slider-container" class="slider-container">
        <div id="slider" class="slider">
          <div id="slide-wrapper" class="slide-wrapper">
            <div class="slide-item">SLIDE 1</div>
            <div class="slide-item">SLIDE 2</div>
            <div class="slide-item">SLIDE 3</div>
            <div class="slide-item">SLIDE 4</div>
            <div class="slide-item">SLIDE 5</div>
          </div>
          <div id="slider-prev-button" class="btn-arrow btn-prev">PREV</div>
          <div id="slider-next-button" class="btn-arrow btn-next">NEXT</div>
        </div>
      </div>
    </section>
    <!-- script -->
    <script src="./index.js"></script>
  </body>
</html>
```

```css index.css
body {
  background-color: #eee;
}

.slider-container {
  width: 60%;
  margin: auto;
}

.slider {
  position: relative;
  overflow-x: hidden;
  width: 100%;
  height: 300px;
}

.slide-wrapper {
  position: absolute;
  display: flex;
  width: 100%;
  transition-property: transform;
}

.slider-container .btn-arrow {
  padding: 2rem;
  font-size: 2rem;
  position: absolute;
  cursor: pointer;
  user-select: none;
}

.btn-prev {
  left: 0;
  top: 50%;
  transform: translate(0, -50%);
}

.btn-next {
  right: 0;
  top: 50%;
  transform: translate(0, -50%);
}

.slide-item {
  background-color: lightblue;

  width: 100%;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  flex-shrink: 0;

  font-size: 2rem;

  transform: translateZ(0);
}
```

```js [index.js]
/** Query Selector */
const slideWrapper = document.getElementById("slide-wrapper");
const prevButton = document.getElementById("slider-prev-button");
const nextButton = document.getElementById("slider-next-button");

const slides = document.querySelectorAll("#slide-wrapper .slide-item");

/** Variables */
const loop = true;
const autoPlay = false;
const autoPlayDelay = 400;
const slideCount = slides.length;

let timeout;
let slideIndex = 0;
let isSliding = false;

/** Functions */
const insertCloneSlides = () => {
  const firstSlide = slides[0];
  const lastSlide = slides[slides.length - 1];

  const cloneFirstSlide = firstSlide.cloneNode(true);
  const cloneLastSlide = lastSlide.cloneNode(true);

  slideWrapper.insertBefore(cloneLastSlide, firstSlide);
  slideWrapper.appendChild(cloneFirstSlide);
};

const teleportTo = (index) => {
  slideIndex = index;

  const translateX = index * -100;
  slideWrapper.style.transform = `translate3d(${translateX}%, 0, 0)`;
};

const slideTo = (index) => {
  slideIndex = index;
  isSliding = true;

  const translateX = index * -100;
  slideWrapper.style.transitionDuration = "300ms";
  slideWrapper.style.transform = `translate3d(${translateX}%, 0, 0)`;
};

const autoSlideAfter = (delay) => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    if (isSliding) {
      return;
    }

    slideTo(slideIndex + 1);
  }, delay);
};

const onClickPrevButton = () => {
  if (!loop && slideIndex === 0) {
    return;
  }
  if (isSliding) {
    return;
  }

  slideTo(slideIndex - 1);
};

const onClickNextButton = () => {
  if (!loop && slideIndex === slideCount - 1) {
    return;
  }
  if (isSliding) {
    return;
  }

  slideTo(slideIndex + 1);
};

const onTransitionEnd = () => {
  isSliding = false;

  slideWrapper.style.transitionDuration = "0ms";

  if (slideIndex < 0) {
    teleportTo(slideCount - 1);
  }

  if (slideIndex > slideCount - 1) {
    teleportTo(0);
  }

  if (autoPlay) {
    autoSlideAfter(autoPlayDelay);
  }
};

const setEventListeners = () => {
  prevButton.addEventListener("click", onClickPrevButton);
  nextButton.addEventListener("click", onClickNextButton);

  slideWrapper.addEventListener("transitionend", onTransitionEnd);
};

setEventListeners();

if (loop) {
  insertCloneSlides();
  slideWrapper.style.left = `-100%`;
}

if (autoPlay) {
  autoSlideAfter(autoPlayDelay);
}
```

:::

## Vue Code

::: details BaseSlider.vue
::: code-group

```vue [BaseSlider.vue]
<script setup>
import {
  ref,
  computed,
  cloneVNode,
  useSlots,
  onMounted,
  onBeforeUnmount,
} from "vue";

// Composables
const slots = useSlots();

// Props
const props = defineProps({
  speed: {
    type: Number,
    default: 500,
  },
  loop: {
    type: Boolean,
    default: false,
  },
  autoPlay: {
    type: Boolean,
    default: false,
  },
});

// Variables
let timeout = null;

// Refs
const swiperWrapper = ref(null);

const slideIndex = ref(0);
const isSliding = ref(false);

// Computed
const slideItems = computed(() => {
  if (!slots.default) {
    return [];
  }
  return slots.default();
});

const slideLength = computed(() => {
  return slideItems.value.length;
});

const firstSlide = computed(() => {
  return slideItems.value[0];
});

const lastSlide = computed(() => {
  return slideItems.value[slideLength.value - 1];
});

const canSlideRight = computed(() => {
  if (isSliding.value) {
    return false;
  }
  return props.loop || slideIndex.value < slideLength.value - 1;
});

const canSlideLeft = computed(() => {
  if (isSliding.value) {
    return false;
  }
  return props.loop || slideIndex.value > 0;
});

const swiperWrapperStyle = computed(() => {
  const left = props.loop ? 100 : 0;
  const translateX = slideIndex.value * -100 - left;

  const transform = `translate3d(${translateX}%, 0, 0)`;
  const transitionDuration = isSliding.value ? `${props.speed}ms` : "0ms";

  return { transform, transitionDuration };
});

// Methods
const slideTo = (index) => {
  isSliding.value = true;
  slideIndex.value = index;
};

const onClickLeftButton = () => {
  if (!canSlideLeft.value) {
    return;
  }
  slideTo(slideIndex.value - 1);
};

const onClickRightButton = () => {
  if (!canSlideRight.value) {
    return;
  }
  slideTo(slideIndex.value + 1);
};

const onTransitionEnd = () => {
  isSliding.value = false;

  if (slideIndex.value < 0) {
    slideIndex.value = slideLength.value - 1;
  }

  if (slideIndex.value === slideLength.value) {
    slideIndex.value = 0;
  }

  startAutoPlay();
};

const startAutoPlay = () => {
  if (!props.autoPlay) {
    return;
  }

  clearTimeout(timeout);
  timeout = setTimeout(() => {
    if (canSlideRight.value) {
      slideTo(slideIndex.value + 1);
    }
  }, 2000);
};

// LifeCycle
onMounted(() => {
  startAutoPlay();
});

onBeforeUnmount(() => {
  clearTimeout(timeout);
});
</script>

<template>
  <div class="swiper">
    <div
      ref="swiperWrapper"
      class="swiper-wrapper"
      :style="swiperWrapperStyle"
      @transitionend="onTransitionEnd"
    >
      <component
        v-if="loop && lastSlide"
        :is="cloneVNode(lastSlide, { class: 'copy' })"
      ></component>
      <slot></slot>
      <component
        v-if="loop && firstSlide"
        :is="cloneVNode(firstSlide, { class: 'copy' })"
      ></component>
    </div>

    <div class="btn-arrow btn-left" @click="onClickLeftButton">PREV</div>
    <div class="btn-arrow btn-right" @click="onClickRightButton">NEXT</div>
  </div>
</template>

<style scoped lang="scss">
.swiper {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.swiper-wrapper {
  position: absolute;
  display: flex;
  width: 100%;
  height: 100%;

  transition-property: transform;
}

.swiper-container .btn-arrow {
  padding: 2rem;
  font-size: 1rem;
  position: absolute;
  cursor: pointer;
  user-select: none;
}

.btn-left {
  left: 0;
  top: 50%;
  transform: translate(0, -50%);
}

.btn-right {
  right: 0;
  top: 50%;
  transform: translate(0, -50%);
}
</style>
```

:::
