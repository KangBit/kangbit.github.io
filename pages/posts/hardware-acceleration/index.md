---
title: 가속합성으로 인한 화면 깜빡임 해결
description: 가속합성으로 인한 화면 깜빡임 현상을 해결한 경험을 공유합니다.
---

<style module>
  .stack_container {
    position: relative;
    width: 60%;
    height: 200px;
    background-color: black;
  }

  .stack_page {
    display: flex;
    position: absolute;
    width: 50px;
    height: 100px;
    left: 50%;
    top: 60%;
    opacity: 0.6;

    justify-content: center;
    color: black;
    font-size: 0.8rem;
  }

  .page1 {
    transform: translateX(-110%) translateY(-90%);
    background-color: lightsteelblue;
  }
  .page2 {
    transform: translateX(-50%) translateY(-70%);
    background-color: lightsteelblue;
  }
  .page3 {
    transform: translateX(10%) translateY(-50%);
    background-color: lightsteelblue;
  }
</style>

# 가속합성으로 인한 화면 깜빡임 해결

하이브리드 앱의 웹뷰 컨텐츠를 개발하던 중 발생한 이슈의 해결과정을 설명합니다.

## 배경

이 프로젝트에서는 페이지 전환을 앱처럼 보이도록 하기 위해 화면을 겹친 상태로 유지하고 있고,

<div :class="$style.stack_container">
  <div :class="[$style.stack_page, $style.page1]">PAGE1</div>
  <div :class="[$style.stack_page, $style.page2]">PAGE2</div>
  <div :class="[$style.stack_page, $style.page3]">PAGE3</div>
</div>

페이지 전환 트랜지션을 위해 `translate3d`를 사용합니다.

각 화면에서의 탭 변경 트랜지션을 위해서도 `translate3d`를 사용합니다.

또한 여러 페이지에서 이미지 슬라이드를 표현하기 위해 `vue-awesome-swiper`를 사용하고 있는데,

`vue-awesome-swiper`에서도 스와이프 전환 트랜지션을 위해 `translate3d`를 사용합니다.

## 현상

다음과 같이 탭을 변경하면 트랜지션 완료 후 화면 깜빡임이 간헐적으로 발생합니다.

<img src="/assets/gifs/hardware-acceleration1.gif" width="30%" class="mb-0"></img>

## 원인

처음에는 탭이 변경된 이후에 이미지 슬라이더 이외의 영역이 다시 그려지는 것이 아닌지 의심했습니다.

하지만 트랜지션이 시작되기 전 컴포넌트의 렌더링이 완료되고,

이후에도 렌더링을 유발하는 변경은 없었습니다.

결정적으로 아래 GIF에서 확인할 수 있듯이 일부 영역만 가려지는 듯한 현상을 확인할 수 있었습니다.

<img src="/assets/gifs/hardware-acceleration2.gif" width="30%" class="mb-0"></img>

[배경](/posts/hardware-acceleration/#%E1%84%87%E1%85%A2%E1%84%80%E1%85%A7%E1%86%BC)에서 언급했듯이 여러 페이지가 겹쳐져 있는 상태에서

가려진 영역의 요소가 잠깐 최상단으로 끌어올려져 보여지는 것이 아닐까 했습니다.

<br>

각 페이지에서는 `vue-awesome-swiper`로 이미지 슬라이드를 표현하고 있는데,

다른 페이지에 가려진 이후에도 슬라이드를 중지하지 않고 있었습니다.

<img src="/assets/gifs/hardware-acceleration3.gif" width="70%" class="mb-0"></img>

<br>

스와이퍼를 삭제해 보니 현상이 사라지는 것을 확인할 수 있었습니다.

트랜지션 직후에만 어떤 요소가 화면을 잠시 가린다는 점,

이미지 슬라이더 컴포넌트를 삭제했을 때 해결되는 점을 근거로

`vue-awesome-swiper`와 탭 전환 트랜지션를 원인으로 추측했습니다.

비슷한 현상을 찾아보던 중 하드웨어 가속과 가속 합성에 대한 내용을 찾을 수 있었습니다.

가속 합성에 대한 설명은 글 하단의 링크로 대체하겠습니다.

<br>

탭의 전환 애니메이션은 `vue`의 `Transition` 컴포넌트를 통해 이루어지므로

`translate3d` 속성은 전환이 시작될 때 추가되었다가 완료된 후 삭제됩니다.

가속 합성과 관련지어 생각해보면,

탭 영역이 `Graphics Layer`에서 `Render Layer`로 변경되며

화면의 합성이 다시 진행되는 것이 원인이지 않을까 추측해 볼 수 있습니다.

## 해결

선행되었어야 할 해결책은 화면이 전면에 노출되지 않는 경우에는 슬라이드를 중지하는 것입니다.

하지만 프로젝트 구조와 업무 프로세스의 문제로

모든 페이지에서 슬라이드를 중지하는 것은 빠른 기간 안에 진행하기 힘든 일이었습니다.

따라서 빠른 해결을 위해 아래의 방식을 채택했습니다.

<br>

원인 파악을 위해 아래의 css를 추가했을 때 현상이 사라지는 것을 확인할 수 있었습니다.

```css
.swiper-slide {
  backface-visibility: hidden;
  transform: translate3d(0, 0, 0);
}
.swiper-wrapper {
  transform-style: preserve-3d;
}
```

하지만 글로벌 css를 변경하게 되면, 스와이퍼가 존재하는 모든 화면에 적용됩니다.

성능과 Side Effect를 고려해서 다른 방향으로 해결해야 합니다.

탭의 translate가 나타났다가 사라지는 영역 내부를 한번 더 감싸서

하위 요소들이 Container의 합성 영역 안에서 합성되도록 했습니다.

```vue
<template>
  <div class="tab-contents">
    <div style="transform: translateZ(0)">
      <!--...-->
    </div>
  </div>
</template>
```

## Reference List

[GPU Accelerated Compositing in Chrome](https://www.chromium.org/developers/design-documents/gpu-accelerated-compositing-in-chrome/?spm=a2c65.11461447.0.0.5c88790bv6fasK)

[Front-End Performance Optimization with Accelerated Compositing Part 1 ](https://www.alibabacloud.com/blog/front-end-performance-optimization-with-accelerated-compositing-part-1_594194)

[하드웨어 가속에 대한 이해와 적용](https://d2.naver.com/helloworld/2061385)

[[CSS] 브라우저의 Layer Model과 하드웨어 가속을 이용한 렌더링 최적화에 대해 알아보자!](https://ssocoit.tistory.com/259)

[(번역) CSS GPU 애니메이션 제대로 하기](https://wit.nts-corp.com/2017/08/31/4861)

[rotate3d와 z-index 충돌 해결](https://joyful-development.tistory.com/17)

[Swiper-API : maxBackfaceHiddenSlides](https://swiperjs.com/swiper-api#param-maxBackfaceHiddenSlides)

[will-change - CSS: Cascading Style Sheets | MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change)

[backface-visibility - CSS: Cascading Style Sheets | MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/backface-visibility)

[transform-style - CSS: Cascading Style Sheets | MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-style)
