---
title: Chrome135+ 에서 CSS로 캐러셀 만들기
description: Chrome135+ 에서 CSS만으로 캐러셀을 만드는 방법을 소개합니다.
head:
  - - meta
    - name: keywords
      content: scroll-marker, scroll-marker-group, scroll-group, CSS, Carousel, 캐러셀
comment: true
---

# Chrome135+ 에서 CSS로 캐러셀 만들기

::: warning

여기서 설명하는 캐러셀은 최신 브라우저에서만 작동합니다.

[CanIUse](https://caniuse.com/mdn-css_selectors_scroll-button) 에서 브라우저별 지원 현황을 확인할 수 있습니다.

:::

## 캐러셀이란?

캐러셀은 여러개의 컨텐츠를 슬라이드 형태로 보여주는 UI 요소입니다.

캐러셀은 보통 자동으로 슬라이드되거나 드래그를 통해 컨텐츠를 이동하지만,

좌우 버튼이나 페이지네이션을 포함하여 특정 컨텐츠로 이동할 수도 있습니다.

기존에도 javascript 없이 캐러셀을 구현할 수 있지만,

좌우 버튼이나 페이지네이션을 포함시킬 수는 없었습니다.

Chrome 135부터는 [CSS Overflow Module Level 5](https://drafts.csswg.org/css-overflow-5/)을 사용하여

css만으로 좌우 버튼과 페이지네이션을 포함하는 캐러셀을 구현할 수 있습니다.

이 포스트에서는 이 기능을 사용하여 캐러셀을 구현하는 방법을 소개합니다.

## 캐러셀 예제

[CSS Carousel Gallery](https://chrome.dev/carousel/) 에서는 CSS로 만든 다양한 캐러셀 예제를 확인할 수 있습니다.

## 캐러셀 만들기

우선, 기본적인 형태의 캐러셀을 만들어 보겠습니다.

::: code-group

```html [index.html]
<div class="scroll-layout">
  <ul class="carousel">
    <li class="carousel-item"></li>
    <li class="carousel-item"></li>
    <li class="carousel-item"></li>
    <li class="carousel-item"></li>
    <li class="carousel-item"></li>
    <li class="carousel-item"></li>
    <li class="carousel-item"></li>
    <li class="carousel-item"></li>
    <li class="carousel-item"></li>
    <li class="carousel-item"></li>
  </ul>
</div>
```

```css [style.css]
li {
  list-style-type: none;
}

.scroll-layout {
  width: 100vw;
  display: flex;
  justify-content: center;
}

.carousel {
  width: 80%;
  display: grid;
  grid: 30vmin / auto-flow 40%;
  gap: 15px;
  padding: 0;
  margin: 0;

  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
}

.carousel-item {
  border: 3px solid #888;
  scroll-snap-align: center;
}
```

:::

<style module>
.scroll_layout {
  width: 100%;
  display: flex;
  justify-content: center;
  background-color: #161618;
  padding: 40px 0;
}

.carousel {
  width: 80%;
  display: grid;
  grid: 20vmin / auto-flow 40%;
  gap: 15px;
  padding: 0;
  margin: 0;

  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
}

.carousel_item {
  list-style-type: none;

  background-color: #888;
  border: 3px solid #888;
  scroll-snap-align: center;
}

.carousel_2 {
  width: 80%;
  display: grid;
  grid: 20vmin / auto-flow 40%;
  gap: 15px;
  padding: 0;
  margin: 0;

  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
}

.carousel_item_2 {
  list-style-type: none;

  background-color: #888;
  border: 3px solid #888;
  scroll-snap-align: center;
}

.carousel_2 {
  anchor-name: --carousel2;

  &::scroll-button(*) {
    position: fixed;
    position-anchor: --carousel2;

    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 2px solid #999;

    margin: 5px;
  }

  &::scroll-button(left) {
    position-area: inline-start center;
    content: "⬅" / "Scroll Left";
  }

  &::scroll-button(right) {
    position-area: inline-end center;
    content: "⮕" / "Scroll Right";
  }
}

.carousel_3 {
  width: 80%;
  display: grid;
  grid: 20vmin / auto-flow 40%;
  gap: 15px;
  padding: 0;
  margin: 0;

  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
}

.carousel_item_3 {
  list-style-type: none;

  background-color: #888;
  border: 3px solid #888;
  scroll-snap-align: center;
}

.carousel_3 {
  anchor-name: --carousel3;
  scroll-marker-group: after;
  
  &::scroll-marker-group {
    position: fixed;
    position-anchor: --carousel3;
    position-area: block-end;

    display: grid;
    place-content: safe center;
    grid: 16px / auto-flow 16px;
    gap: 15px;
    padding: 15px;
  }
}

.carousel_item_3 {
  &::scroll-marker {
    content: " ";

    border: 1px solid #bbb;
    border-radius: 50%;
    outline-offset: 4px;
  }

  &::scroll-marker:is(:hover, :focus-visible) {
    border-color: LinkText;
  }

  &::scroll-marker:target-current {
    background: LinkText;
    border-color: LinkText;
  }
}
</style>

<div :class="$style.scroll_layout">
  <div :class="$style.carousel">
    <div :class="$style.carousel_item"></div>
    <div :class="$style.carousel_item"></div>
    <div :class="$style.carousel_item"></div>
    <div :class="$style.carousel_item"></div>
    <div :class="$style.carousel_item"></div>
    <div :class="$style.carousel_item"></div>
    <div :class="$style.carousel_item"></div>
    <div :class="$style.carousel_item"></div>
    <div :class="$style.carousel_item"></div>
    <div :class="$style.carousel_item"></div>
    <div :class="$style.carousel_item"></div>
    <div :class="$style.carousel_item"></div>
  </div>
</div>

## 좌우 버튼 추가하기

`::scroll-button`의사 요소를 이용해 캐러셀에 좌우 버튼을 추가할 수 있습니다.

```css
.carousel {
  anchor-name: --carousel;

  &::scroll-button(*) {
    position: fixed;
    position-anchor: --carousel;

    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 2px solid #999;

    margin: 5px;
  }

  &::scroll-button(left) {
    position-area: inline-start center;
    content: "⬅" / "Scroll Left";
  }

  &::scroll-button(right) {
    position-area: inline-end center;
    content: "⮕" / "Scroll Right";
  }
}
```

<div :class="$style.scroll_layout">
  <div :class="$style.carousel_2">
    <div :class="$style.carousel_item_2"></div>
    <div :class="$style.carousel_item_2"></div>
    <div :class="$style.carousel_item_2"></div>
    <div :class="$style.carousel_item_2"></div>
    <div :class="$style.carousel_item_2"></div>
    <div :class="$style.carousel_item_2"></div>
    <div :class="$style.carousel_item_2"></div>
    <div :class="$style.carousel_item_2"></div>
    <div :class="$style.carousel_item_2"></div>
    <div :class="$style.carousel_item_2"></div>
    <div :class="$style.carousel_item_2"></div>
    <div :class="$style.carousel_item_2"></div>
  </div>
</div>

좌우 버튼은 기본적으로 스크롤 영역의 85% 를 스크롤합니다.

하나의 컨텐츠씩 스크롤하려면 아래와 같이 설정합니다.

```css
.carousel-item {
  scroll-snap-stop: always;
}
```

## 페이지네이션 추가하기

`::scroll-marker-group` 의사 요소와

`::scroll-marker` 의사 요소를 이용해 페이지네이션을 추가할 수 있습니다.

```css
.carousel {
  scroll-marker-group: after;

  &::scroll-marker-group {
    position: fixed;
    position-anchor: --carousel;
    position-area: block-end;

    display: grid;
    place-content: safe center;
    grid: 16px / auto-flow 16px;
    gap: 15px;
    padding: 15px;
  }
}

.carousel-item {
  &::scroll-marker {
    content: " ";

    border: 1px solid #bbb;
    border-radius: 50%;
    outline-offset: 4px;
  }

  &::scroll-marker:is(:hover, :focus-visible) {
    border-color: LinkText;
  }

  &::scroll-marker:target-current {
    background: LinkText;
    border-color: LinkText;
  }
}
```

<div :class="$style.scroll_layout">
  <div :class="$style.carousel_3">
    <div :class="$style.carousel_item_3"></div>
    <div :class="$style.carousel_item_3"></div>
    <div :class="$style.carousel_item_3"></div>
    <div :class="$style.carousel_item_3"></div>
    <div :class="$style.carousel_item_3"></div>
    <div :class="$style.carousel_item_3"></div>
    <div :class="$style.carousel_item_3"></div>
    <div :class="$style.carousel_item_3"></div>
    <div :class="$style.carousel_item_3"></div>
    <div :class="$style.carousel_item_3"></div>
    <div :class="$style.carousel_item_3"></div>
  </div>
</div>

## 참고

- [CSS Overflow Module Level 5](https://drafts.csswg.org/css-overflow-5/)
- [CSS Carousels with CSS](https://developer.chrome.com/blog/carousels-with-css?hl=ko#add_scroll_markers_with_scroll-marker)
- [CSS Carousel Configurator](https://chrome.dev/carousel-configurator/)
- [CSS Carousel Gallery](https://chrome.dev/carousel/)
