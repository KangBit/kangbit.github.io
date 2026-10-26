---
title: 프론트엔드 08. 접근성과 사용성
description: 키보드와 보조 기술로도 이용할 수 있는 화면을 만듭니다.
outline: deep
---

# 08. 접근성과 사용성

마우스를 쓰지 않거나 화면을 보지 않는 사용자도 같은 일을 할 수 있게 만드는 방법을 정리합니다.

## 시맨틱 HTML과 접근 가능한 이름

접근성의 대부분은 **올바른 요소를 쓰는 것**으로 해결됩니다. ARIA를 더하기 전에 요소 선택을 먼저 봅니다.

```html
<div class="btn" onclick="...">삭제</div>   <!-- 보조 기술이 버튼으로 인식하지 못합니다 -->
<button type="button">삭제</button>          <!-- 역할, 키보드, 포커스가 모두 따라옵니다 -->
```

모든 상호작용 요소에는 **이름**이 있어야 합니다. 이름은 여러 경로로 정해집니다.

```html
<button>저장</button>                           <!-- 내용 -->
<button aria-label="닫기">×</button>            <!-- 속성 -->
<label for="title">제목</label><input id="title" />  <!-- 연결된 레이블 -->
<img src="logo.png" alt="BitPage" />            <!-- 대체 텍스트 -->
```

아이콘만 있는 버튼이 가장 자주 빠뜨리는 자리입니다. 스크린 리더가 "버튼"이라고만 읽으면 무엇을 하는 버튼인지 알 수 없습니다.

```html
<button type="button">
  <svg aria-hidden="true">...</svg>
  <span class="sr-only">할 일 삭제</span>
</button>
```

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
```

`display: none`이나 `visibility: hidden`은 스크린 리더에서도 사라집니다. 시각적으로만 숨기려면 위 방식을 씁니다.

## 키보드 탐색, 포커스 순서와 포커스 복원

Tab 키만으로 화면 전체를 돌 수 있어야 합니다. 직접 해 보는 것이 가장 빠른 점검입니다.

- 모든 버튼과 링크에 도달하는가
- 지금 어디에 있는지 보이는가
- 순서가 화면 흐름과 맞는가
- 빠져나올 수 없는 곳이 없는가

포커스 표시를 지우면 키보드 사용자는 길을 잃습니다.

```css
/* 하지 않습니다 */
*:focus { outline: none; }

/* 기본이 마음에 들지 않으면 대체합니다 */
:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
```

`:focus-visible`은 키보드로 왔을 때만 적용되어, 마우스 클릭에는 테두리가 생기지 않습니다.

`tabindex`는 세 가지 의미가 있습니다.

```html
<div tabindex="0">   <!-- 원래 순서에 포함 -->
<div tabindex="-1">  <!-- Tab으로는 못 가지만 focus()로는 갈 수 있음 -->
<div tabindex="3">   <!-- 순서를 앞당김 — 쓰지 않습니다 -->
```

양수는 전체 순서를 뒤틀어 놓습니다. DOM 순서를 화면 순서와 맞추는 편이 낫습니다.

모달을 열면 **포커스를 안으로 옮기고, 닫으면 원래 자리로 되돌립니다.**

```js
let lastFocused;

function openDialog() {
  lastFocused = document.activeElement;
  dialog.showModal();          // dialog는 포커스 가두기가 내장되어 있습니다
}

dialog.addEventListener("close", () => {
  lastFocused?.focus();
});
```

되돌리지 않으면 닫은 뒤 Tab이 문서 맨 위에서 다시 시작합니다.

반복되는 영역을 건너뛸 수단도 둡니다.

```html
<a href="#main" class="skip-link">본문으로 건너뛰기</a>
...
<main id="main" tabindex="-1">
```

## 색상 대비와 색상에만 의존하지 않기

본문 글자는 배경과 **4.5:1** 이상 차이가 나야 합니다. 큰 글자(18pt 이상 또는 14pt 굵게)는 3:1입니다.

개발자 도구에서 색상 견본을 클릭하면 대비 값이 바로 나옵니다. Lighthouse의 접근성 검사에도 포함됩니다.

상태를 색으로만 표시하면 색각 이상 사용자는 구분할 수 없습니다.

```html
<!-- 색만으로 구분 -->
<span class="text-red">오류</span>

<!-- 아이콘과 글자를 함께 -->
<span class="text-red">
  <svg aria-hidden="true"><!-- 경고 아이콘 --></svg>
  오류: 제목을 입력해 주세요
</span>
```

링크를 본문 중간에 둘 때도 색만으로 구분하면 보이지 않습니다. 밑줄을 함께 씁니다.

## 폼 오류 안내와 동적 변경 알림

오류는 **어떤 입력이 왜 잘못됐는지** 함께 알려야 합니다.

```html
<label for="title">할 일</label>
<input
  id="title"
  name="title"
  aria-invalid="true"
  aria-describedby="title-error"
/>
<p id="title-error" class="error">제목은 1자 이상이어야 합니다</p>
```

`aria-describedby`로 연결하면 입력에 포커스했을 때 오류 메시지를 함께 읽어 줍니다.

화면이 바뀌어도 포커스가 그대로면 스크린 리더는 아무것도 모릅니다. 라이브 영역으로 알립니다.

```html
<div role="status" aria-live="polite">3건이 저장되었습니다</div>
<div role="alert">저장에 실패했습니다</div>
```

| 값 | 읽는 시점 |
| --- | --- |
| `polite` | 지금 읽는 것이 끝난 뒤 |
| `assertive` | 즉시 끊고 |

`assertive`는 꼭 필요할 때만 씁니다. 자주 쓰면 방해가 됩니다.

라이브 영역은 **미리 DOM에 있어야** 합니다. 메시지와 함께 요소를 새로 만들면 알림이 울리지 않는 경우가 있습니다.

```js
// 빈 컨테이너를 미리 두고 내용만 바꿉니다
statusRegion.textContent = `${count}건이 저장되었습니다`;
```

여러 건의 오류가 있는 폼은 제출 시 요약을 보여 주고 첫 오류로 포커스를 옮깁니다.

```js
if (errors.length > 0) {
  summary.textContent = `${errors.length}개 항목을 확인해 주세요`;
  form.querySelector("[aria-invalid='true']")?.focus();
}
```

## 화면 확대와 동작 줄이기 설정 대응

브라우저 확대 200%에서 내용이 잘리거나 가로 스크롤이 생기지 않아야 합니다.

```css
/* 고정 높이는 글자가 커지면 넘칩니다 */
.card { height: 80px; }

/* 최소 높이로 두면 늘어납니다 */
.card { min-height: 80px; }
```

`px`로 고정한 글자 크기는 브라우저 글자 크기 설정을 무시합니다. 본문에는 `rem`을 씁니다.

움직임에 어지러움을 느끼는 사용자가 있습니다. 운영체제 설정을 존중합니다.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

JavaScript에서도 확인할 수 있습니다.

```js
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
element.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
```

터치 대상은 충분히 커야 합니다. 24×24 CSS 픽셀이 최소 기준이고, 44×44 정도가 편합니다.

## 기본 HTML로 표현하기 어려운 경우의 ARIA

ARIA의 첫 번째 규칙은 **쓰지 않는 것**입니다. 네이티브 요소로 되는 일에 쓰면 오히려 망가집니다.

```html
<div role="button" tabindex="0">삭제</div>   <!-- 키보드 핸들러를 직접 붙여야 합니다 -->
<button>삭제</button>                          <!-- 전부 따라옵니다 -->
```

잘못된 ARIA는 없는 것보다 나쁩니다. `role="button"`을 붙이고 Enter 처리를 안 하면, 보조 기술은 버튼이라고 알리는데 실제로는 눌리지 않습니다.

필요한 자리는 네이티브 요소가 없는 UI입니다. 탭, 트리, 콤보박스 같은 것들입니다.

```html
<div role="tablist">
  <button role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1">
    목록
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2">
    통계
  </button>
</div>

<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">...</div>
```

이런 패턴에는 정해진 키보드 동작이 있습니다. 탭은 좌우 화살표로 이동해야 합니다. 직접 만들기 전에 [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)의 패턴을 확인하는 편이 빠릅니다.

상태를 나타내는 속성은 실제 상태와 **항상 맞춰야** 합니다.

```js
button.setAttribute("aria-expanded", String(isOpen));
button.setAttribute("aria-pressed", String(isActive));
input.setAttribute("aria-invalid", String(hasError));
```

## 점검 방법

자동 도구가 잡아 주는 것은 전체의 일부입니다. 직접 써 보는 과정이 필요합니다.

```bash
npx lighthouse https://example.com --only-categories=accessibility
```

- **axe DevTools** 확장으로 페이지를 검사합니다
- **키보드만으로** 주요 흐름을 끝까지 해 봅니다
- **스크린 리더**를 켜고 들어 봅니다. macOS는 `Cmd + F5`로 VoiceOver를 켤 수 있습니다
- 브라우저를 **200% 확대**해 봅니다

처음에는 어색하지만, 몇 번 해 보면 어떤 코드가 문제를 만드는지 감이 잡힙니다.
