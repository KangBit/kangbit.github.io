---
title: 프론트엔드 02. HTML과 문서 구조
description: 의미에 맞는 요소를 골라 문서와 입력 폼을 작성합니다.
outline: deep
---

# 02. HTML과 문서 구조

무엇을 쓰느냐가 접근성과 검색, 기본 동작을 결정합니다. 요소를 고르는 기준을 정리합니다.

## 제목, 문단, 목록, 링크와 이미지

제목은 크기가 아니라 **구조**입니다. `h1`부터 단계를 건너뛰지 않고 내려갑니다.

```html
<h1>학습 로드맵</h1>
<h2>프론트엔드</h2>
<h3>HTML</h3>
```

크기를 줄이려고 `h3`을 쓰는 것이 아니라, CSS로 크기를 조절합니다. 스크린 리더 사용자는 제목만 훑어 문서 구조를 파악하기 때문입니다.

목록은 순서가 의미 있으면 `ol`, 아니면 `ul`입니다. 용어와 설명은 `dl`입니다.

```html
<dl>
  <dt>DOM</dt>
  <dd>문서를 객체로 표현한 트리</dd>
</dl>
```

이미지에는 대체 텍스트를 적습니다. 장식용이면 **빈 값**으로 둡니다. 빼면 스크린 리더가 파일명을 읽습니다.

```html
<img src="chart.png" alt="월별 완료 건수 추이" />
<img src="divider.png" alt="" />
```

## 의미에 맞는 요소 선택

```html
<body>
  <header>로고, 전역 검색</header>
  <nav>주요 메뉴</nav>
  <main>
    <h1>할 일</h1>
    <section>
      <h2>오늘</h2>
    </section>
    <article>독립적으로 떼어 내도 말이 되는 덩어리</article>
  </main>
  <aside>본문과 간접적으로 관련된 것</aside>
  <footer>저작권, 연락처</footer>
</body>
```

`main`은 **문서에 하나**입니다. 보조 기술이 "본문으로 건너뛰기"의 목표로 삼습니다.

`section`은 제목을 가져야 의미가 있습니다. 제목 없이 묶기만 할 거라면 `div`가 맞습니다.

```html
<!-- 의미 없는 section -->
<section><p>텍스트</p></section>

<!-- div로 충분합니다 -->
<div class="wrapper"><p>텍스트</p></div>
```

같은 역할의 영역이 여러 개면 이름을 붙여 구분합니다.

```html
<nav aria-label="주요 메뉴">...</nav>
<nav aria-label="페이지 내 목차">...</nav>
```

## button과 a의 역할 구분

기준은 **이동이냐 동작이냐**입니다.

```html
<a href="/learn/frontend/">페이지로 이동</a>
<button type="button">항목 삭제</button>
```

`div`에 클릭 이벤트를 붙이면 겉보기에는 같지만 여러 가지를 잃습니다.

```html
<!-- 이렇게 하면 -->
<div onclick="remove()">삭제</div>
```

- 탭으로 도달할 수 없습니다
- Enter와 Space로 실행되지 않습니다
- 스크린 리더가 버튼이라고 알리지 않습니다

굳이 쓴다면 `tabindex="0"`, `role="button"`, 키보드 핸들러를 전부 직접 붙여야 합니다. `button`을 쓰면 공짜로 따라옵니다.

폼 안의 `button`은 기본 타입이 `submit`입니다. 제출이 아니라면 명시합니다.

```html
<form>
  <button>제출됩니다</button>
  <button type="button">제출되지 않습니다</button>
</form>
```

## form, label, input과 기본 입력 검증

모든 입력에는 레이블이 붙어야 합니다.

```html
<label for="title">할 일</label>
<input id="title" name="title" />

<!-- 감싸는 방식도 됩니다 -->
<label>
  할 일
  <input name="title" />
</label>
```

`placeholder`는 레이블이 아닙니다. 입력을 시작하면 사라져서 무엇을 적는 칸인지 알 수 없게 됩니다.

브라우저가 제공하는 검증을 먼저 씁니다.

```html
<input name="title" required maxlength="100" />
<input type="email" name="email" />
<input type="number" name="count" min="1" max="99" />
<input name="code" pattern="[A-Z]{3}-\d{4}" />
```

`form`으로 감싸면 Enter로 제출되고, 브라우저가 검증 메시지를 띄웁니다. 자바스크립트 없이도 동작하는 기반이 생깁니다.

```js
form.addEventListener("submit", (event) => {
  event.preventDefault();   // 기본 제출을 막고 직접 처리
  const data = new FormData(form);
  data.get("title");
});
```

`name`이 없는 입력은 `FormData`에 담기지 않습니다.

## input type과 모바일 키보드, 자동 완성

타입에 따라 모바일에서 뜨는 키보드가 달라집니다.

```html
<input type="email" />   <!-- @ 키가 있는 키보드 -->
<input type="tel" />     <!-- 숫자 패드 -->
<input type="url" />
<input type="search" />
<input type="date" />
```

숫자를 받을 때 `type="number"`는 스피너가 붙고 복사·붙여넣기에서 문제가 생기기도 합니다. 전화번호나 카드번호처럼 **계산하지 않는 숫자**에는 `inputmode`가 낫습니다.

```html
<input type="text" inputmode="numeric" pattern="\d*" />
```

자동 완성은 `autocomplete`로 안내합니다. 사용자의 입력 수고를 크게 줄입니다.

```html
<input name="email" autocomplete="email" />
<input name="name" autocomplete="name" />
<input type="password" autocomplete="current-password" />
<input type="password" autocomplete="new-password" />
```

## table의 구조

표에는 정해진 뼈대가 있습니다.

```html
<table>
  <caption>월별 완료 건수</caption>
  <thead>
    <tr>
      <th scope="col">월</th>
      <th scope="col">건수</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">1월</th>
      <td>12</td>
    </tr>
  </tbody>
</table>
```

`scope`는 그 머리 칸이 **열을 설명하는지 행을 설명하는지** 알려 줍니다. 이것이 있어야 스크린 리더가 "1월, 건수 12"처럼 읽어 줍니다.

표는 데이터를 위한 것입니다. 레이아웃에는 Grid나 Flexbox를 씁니다.

## dialog, details 등 동작이 내장된 요소

예전에는 직접 만들던 것들이 표준 요소로 들어와 있습니다.

```html
<dialog id="confirm">
  <form method="dialog">
    <p>삭제할까요?</p>
    <button value="cancel">취소</button>
    <button value="ok">삭제</button>
  </form>
</dialog>
```

```js
confirm.showModal();   // 배경 클릭 차단, 포커스 가두기, Esc 닫기가 기본 동작
confirm.returnValue;   // "ok" 또는 "cancel"
```

모달에서 가장 구현하기 까다로운 포커스 관리가 내장되어 있습니다.

```html
<details>
  <summary>자세히</summary>
  <p>펼쳐지는 내용</p>
</details>
```

JavaScript 없이 접고 펼칩니다. 같은 `name`을 주면 아코디언처럼 하나만 열립니다.

```html
<details name="faq"><summary>질문 1</summary>답</details>
<details name="faq"><summary>질문 2</summary>답</details>
```

## 문서 메타데이터

```html
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>할 일 관리</title>
  <meta name="description" content="검색 결과에 표시되는 설명" />

  <link rel="canonical" href="https://example.com/todos" />

  <meta property="og:title" content="할 일 관리" />
  <meta property="og:description" content="공유 시 미리보기 설명" />
  <meta property="og:image" content="https://example.com/og.png" />
</head>
```

`viewport`가 없으면 모바일에서 데스크톱 너비로 렌더링한 뒤 축소해 보여 줍니다. 반응형 CSS가 통째로 무시됩니다.

`title`은 탭과 검색 결과, 북마크에 쓰입니다. 페이지마다 다르게 적습니다.
