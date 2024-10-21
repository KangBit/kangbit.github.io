---
title: Bitpage
# titleTemplate:
# description:
# outline: false
---

<script setup>
import BaseSlider from '@/components/BaseSlider.vue'
</script>

# Slider

## 들어가며

많은 프로젝트에서 슬라이더를 직접 구현하지 않고 외부 라이브러리를 사용하고 있을 겁니다.

물론 요구사항이 많을수록 잘 만들어진 라이브러리를 사용하는 게 유리한 경우가 많습니다.

하지만 기본적인 기능을 직접 구현하는 것도 그리 어렵지 않고,

한번 만들어 두면 여러 프로젝트에서 커스텀하여 사용할 수 있습니다.

'[가속합성으로 인한 화면 깜빡임 해결](https://kangbit.github.io/posts/hardware-acceleration/)'에서도 스와이퍼가 내부 라이브러리였다면

문제를 더 쉽게 해결할 수 있었을지도 모릅니다.

요구사항을 고려하지 않은 상태에서 라이브러리를 선호하기보다는

적절한 선택을 할 수 있기를 바라며 이 글을 작성합니다.

## Slider란

슬라이더는 이미지, 텍스트, 비디오 등 다양한 콘텐츠를 SlideShow 형식으로 보여주기 위한 UI 요소입니다.

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

<BaseSlider :auto-play="true">
  <div :class="$style.swiper_slide">SLIDE 1</div>
  <div :class="$style.swiper_slide">SLIDE 2</div>
  <div :class="$style.swiper_slide">SLIDE 3</div>
  <div :class="$style.swiper_slide">SLIDE 4</div>
  <div :class="$style.swiper_slide">SLIDE 5</div>
</BaseSlider>

가장 기본적인 기능인 버튼을 이용한 슬라이드 이동과 자동 슬라이드를 구현하고,

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

슬라이드를 실행할 함수 작성.

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

  slideWrapper.style.transitionProperty = "transform";
  slideWrapper.style.transitionDuration = "0.3s";
  slideWrapper.style.transform = `translate3d(${translateX}%, 0, 0)`;
};
```

:::

위에서는 트랜지션을 위해 하드웨어 가속을 이용하고 있지만,

무조건 좋은 것은 아니므로 상황에 맞게 사용할 수 있도록

하드웨어 가속에 대해 공부해 두는 것을 추천합니다.

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

제 게시글인 [MARQUEE](https://kangbit.github.io/posts/marquee/)에서 소개한 구현 방법과 유사합니다.

맞습니다. [MARQUEE](https://kangbit.github.io/posts/marquee/)는 이 글을 쓰기 위한 준비단계였습니다.

다만 전체 item을 통째로 복사했던 MARQUEE와는 달리 양 끝의 하나의 아이템반 복사합니다.

또한, 한쪽으로만 움직이는 MARQUEE와는 달리 양쪽으로 움직여야 하므로 양쪽 끝에 복사해서 넣어줍니다.

cloneNode를 삽입한 모습은 다음과 같습니다.

```html
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

다만, copy된 영역으로 이동한 후에는 original의 위치로 Duration 없이 빠르게 복귀해야 합니다.

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

  slideWrapper.style.transitionProperty = "";
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
