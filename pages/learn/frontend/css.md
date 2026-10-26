---
title: 프론트엔드 03. CSS와 반응형 레이아웃
description: 선택자와 박스 모델을 이해하고 화면 크기에 대응하는 레이아웃을 만듭니다.
outline: deep
---

# 03. CSS와 반응형 레이아웃

어떤 규칙이 이기는지, 요소가 어떻게 배치되는지, 화면이 달라져도 깨지지 않게 하는 방법을 정리합니다.

## 선택자, 상속, 명시도와 캐스케이드

여러 규칙이 같은 속성을 건드리면 순서대로 따져 승자를 정합니다.

1. `!important`가 붙었는가
2. 명시도가 높은가
3. 나중에 쓰였는가

명시도는 세 자리 숫자로 셉니다.

| 선택자 | 점수 |
| --- | --- |
| `#id` | 1-0-0 |
| `.class`, `[attr]`, `:hover` | 0-1-0 |
| `div`, `::before` | 0-0-1 |

```css
#app .todo { }     /* 1-1-0 */
.todo.done { }     /* 0-2-0 */
```

앞자리가 크면 뒤를 아무리 늘려도 이기지 못합니다. `#id`로 스타일을 잡기 시작하면 나중에 덮어쓰기 어려워집니다. 클래스 중심으로 쓰고 명시도를 낮게 유지하는 편이 낫습니다.

`!important`는 쓰는 순간 그것을 덮으려면 또 `!important`가 필요해집니다.

상속되는 속성과 아닌 것이 있습니다.

```css
/* 상속됨 */
color, font-*, line-height, text-align, visibility

/* 상속 안 됨 */
background, border, padding, margin, width, display
```

## 캐스케이드 레이어와 관계 선택자

`@layer`로 우선순위 묶음을 먼저 정해 둘 수 있습니다. 레이어 간에는 **명시도보다 레이어 순서가 먼저**입니다.

```css
@layer reset, base, components, utilities;

@layer components {
  #app .button { color: blue; }    /* 명시도 1-1-0 */
}

@layer utilities {
  .text-red { color: red; }        /* 명시도 0-1-0인데 이깁니다 */
}
```

라이브러리 스타일을 낮은 레이어에 두면 명시도 싸움 없이 덮어쓸 수 있습니다.

`:has()`는 자식을 보고 부모를 고릅니다. 오랫동안 불가능했던 일입니다.

```css
/* 체크된 입력을 가진 라벨 */
label:has(input:checked) { font-weight: bold; }

/* 이미지가 있는 카드만 다르게 */
.card:has(img) { padding: 0; }

/* 에러 메시지가 있는 폼 그룹 */
.field:has(.error) { border-color: red; }
```

`:is()`와 `:where()`는 선택자를 묶습니다. 차이는 명시도입니다.

```css
:is(h1, h2, h3) a { }      /* 가장 높은 것을 따릅니다 */
:where(h1, h2, h3) a { }   /* 명시도 0 — 덮어쓰기 쉽습니다 */
```

## 박스 모델, display, position과 쌓임 맥락

기본값에서는 `width`가 내용 영역만 가리켜서, 패딩과 테두리가 더해지면 커집니다.

```css
*, *::before, *::after {
  box-sizing: border-box;   /* width에 패딩과 테두리를 포함시킵니다 */
}
```

거의 모든 프로젝트가 이 한 줄로 시작합니다.

인접한 위아래 마진은 **합쳐집니다.** 40px과 20px이 만나면 60px이 아니라 40px입니다.

```css
.a { margin-bottom: 40px; }
.b { margin-top: 20px; }   /* 둘 사이는 40px */
```

Flex나 Grid 컨테이너 안에서는 이 현상이 일어나지 않습니다. `gap`을 쓰면 아예 신경 쓸 일이 없습니다.

`position`은 기준점이 다릅니다.

| 값 | 기준 | 자리 차지 |
| --- | --- | --- |
| `static` | 기본 흐름 | 예 |
| `relative` | 원래 자리 | 예 |
| `absolute` | 가장 가까운 `static`이 아닌 조상 | 아니오 |
| `fixed` | 뷰포트 | 아니오 |
| `sticky` | 스크롤 위치에 따라 전환 | 예 |

`sticky`는 `top` 같은 값이 있어야 동작하고, 부모에 `overflow: hidden`이 있으면 작동하지 않습니다. 자주 겪는 함정입니다.

`z-index`는 **같은 쌓임 맥락 안에서만** 비교됩니다. 아래 속성들이 새 맥락을 만듭니다.

```css
transform, opacity (1 미만), filter, will-change, isolation: isolate
position + z-index
```

부모가 `opacity: 0.99`면 그 안의 `z-index: 9999`도 부모 밖으로 못 나옵니다. 모달이 가려지는 흔한 원인입니다.

## Flexbox와 Grid

고르는 기준은 **한 방향이냐 두 방향이냐**입니다.

```css
/* 한 줄에 나열 — Flexbox */
.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar .spacer { margin-left: auto; }   /* 이후 항목을 오른쪽으로 */
```

```css
/* 행과 열 — Grid */
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 16px;
}
```

Flex 아이템은 기본적으로 줄어듭니다. 줄어들면 안 되는 것은 막아 줍니다.

```css
.sidebar { flex: 0 0 240px; }   /* grow 0, shrink 0, basis 240px */
.content { flex: 1; }
```

긴 텍스트가 Flex 아이템을 밀어내는 것도 자주 겪습니다. `min-width`의 기본값이 `auto`라 내용보다 작아지지 않기 때문입니다.

```css
.content { min-width: 0; }   /* 줄어들 수 있게 합니다 */
```

미디어 쿼리 없이 접히는 레이아웃도 만들 수 있습니다.

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}
```

## 상대 단위, 미디어 쿼리와 유연한 레이아웃

```css
font-size: 1rem;    /* 루트 글자 크기 기준 — 사용자 설정을 따릅니다 */
padding: 0.5em;     /* 자기 글자 크기 기준 */
width: 50%;         /* 부모 기준 */
height: 100dvh;     /* 모바일 주소창을 반영한 화면 높이 */
```

`px`로 글자 크기를 고정하면 브라우저 글자 크기 설정이 무시됩니다. 본문 글자에는 `rem`을 씁니다.

미디어 쿼리는 **작은 화면을 기본으로 두고 넓어질 때 더하는** 방향이 간단합니다.

```css
.layout { display: block; }

@media (min-width: 768px) {
  .layout {
    display: grid;
    grid-template-columns: 240px 1fr;
  }
}
```

## 컨테이너 쿼리와 논리 속성

미디어 쿼리는 화면 크기를 봅니다. 같은 컴포넌트가 사이드바에도 본문에도 들어간다면 화면이 아니라 **자기가 놓인 공간**을 기준으로 삼아야 합니다.

```css
.card-area { container-type: inline-size; }

@container (min-width: 400px) {
  .card { display: grid; grid-template-columns: 80px 1fr; }
}
```

논리 속성은 좌우 대신 글의 시작과 끝을 가리킵니다.

```css
margin-inline: auto;        /* 좌우 */
padding-block: 16px;        /* 위아래 */
border-inline-start: 2px;   /* 글 시작 쪽 */
```

좌우 쓰기 방향이 다른 언어를 지원할 때 코드를 고치지 않아도 됩니다. `margin-inline: auto`는 가운데 정렬을 짧게 쓰는 방법이기도 합니다.

## 글꼴, 웹폰트 로딩과 줄 간격

웹폰트는 받는 동안 글자가 보이지 않거나 바뀝니다.

```css
@font-face {
  font-family: "Pretendard";
  src: url("/fonts/pretendard.woff2") format("woff2");
  font-display: swap;   /* 먼저 기본 글꼴로 보여 주고 나중에 교체 */
}
```

`font-display: swap`은 글자가 늦게 뜨는 것을 막지만, 교체될 때 레이아웃이 흔들립니다. 중요한 글꼴은 미리 받아 둡니다.

```html
<link rel="preload" as="font" type="font/woff2" href="/fonts/pretendard.woff2" crossorigin />
```

가독성에 영향이 큰 것은 줄 간격과 한 줄 길이입니다.

```css
body {
  line-height: 1.6;      /* 단위 없이 — 자식이 자기 크기 기준으로 계산합니다 */
  word-break: keep-all;  /* 한글 단어 중간에서 줄바꿈하지 않습니다 */
}

.prose { max-width: 70ch; }   /* 한 줄이 너무 길어지지 않게 */
```

## 사용자 정의 속성과 상태 스타일

변수는 런타임에 바뀌고 상속됩니다. 전처리기 변수와 다른 점입니다.

```css
:root {
  --color-text: #1a1a1a;
  --color-bg: #ffffff;
  --space: 8px;
}

.card {
  color: var(--color-text);
  padding: calc(var(--space) * 2);
}
```

```js
element.style.setProperty("--space", "12px");   // JS로 바꿀 수 있습니다
```

상태는 가상 클래스로 표현합니다.

```css
.button:hover { }
.button:focus-visible { outline: 2px solid; }   /* 키보드로 왔을 때만 */
.button:disabled { opacity: 0.5; cursor: not-allowed; }
.input:user-invalid { border-color: red; }      /* 사용자가 건드린 뒤에만 */
```

`:focus`가 아니라 `:focus-visible`을 씁니다. 마우스 클릭에는 테두리가 안 생기고 키보드 탐색에는 생깁니다. 아예 지우는 것은 키보드 사용자에게 치명적입니다.

```css
/* 하지 않습니다 */
*:focus { outline: none; }
```

전환은 애니메이션할 속성을 명시합니다.

```css
.button {
  transition: background-color 0.2s, transform 0.2s;
}
```

`transition: all`은 예상치 못한 속성까지 애니메이션해서 성능과 동작 모두 불안정해집니다.

## 다크 모드

```css
:root {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #1a1a1a;
    --color-text: #f0f0f0;
  }
}

body {
  background: var(--color-bg);
  color: var(--color-text);
}
```

변수만 바꾸면 전체가 따라옵니다. 색을 각 규칙에 직접 적어 두면 다크 모드를 넣을 때 전부 고쳐야 합니다.

브라우저 기본 UI도 맞춰 줍니다.

```css
:root { color-scheme: light dark; }
```

스크롤바와 폼 요소가 테마에 맞게 바뀝니다.

사용자가 직접 고를 수 있게 하려면 속성으로 덮어씁니다.

```css
:root[data-theme="dark"] {
  --color-bg: #1a1a1a;
}
```
