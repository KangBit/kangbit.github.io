---
title: Document PIP
description: Document Picture-in-Picture API를 활용하여 웹 문서를 작은 창으로 분리해 띄우는 방법과 활용 사례를 소개합니다.
head:
  - - meta
    - name: keywords
      content: document pip, document picture-in-picture, picture-in-picture, pip api, 크롬 pip, 웹 api, 브라우저 pip, pip 활용, pip 예제
comment: true
---

<script setup>
import ButtonPipOpen from '@/pages/posts/document-pip/ButtonPipOpen.vue'
import ButtonPipToggle from '@/pages/posts/document-pip/ButtonPipToggle.vue'
import ContentsPip from '@/pages/posts/document-pip/ContentsPip.vue'
import ContentsPipCss from '@/pages/posts/document-pip/ContentsPipCss.vue'
</script>

# Document Picture In Picture

::: warning

Document Picture in Picture API는 아직 실험적 기능입니다. ( 2025-07 )

일부 브라우저에서 동작하지 않을 수 있습니다.

[CanIUse](https://caniuse.com/mdn-api_documentpictureinpicture) 에서 브라우저별 지원 현황을 확인할 수 있습니다.

:::

## Picture In Picture 란?

<img src="/assets/images/document-pip/video-pip.jpg" width="80%" class="mb-0"></img>

PIP는 화면을 작은 팝업 창으로 띄워, 화면을 보면서 다른 작업을 동시에 할 수 있도록 하는 기능입니다.

이 팝업 창은 항상 다른 창 위에 표시되며, 영상 재생에 사용되어 왔습니다.

## Document Picture In Picture

Document PIP API를 활용하면 웹 문서도 작은 창으로 분리할 수 있습니다.

표시할 콘텐츠를 PIP로 이동하고,

스타일시트를 복사하여 콘텐츠의 스타일이 기본 창에 있을 때와 동일하게 적용되도록 할 수 있습니다.

## PIP 창 열기

API 를 지원하는지 확인하고,

```js
const isPipSupported = "documentPictureInPicture" in window;
```

API를 지원할 경우 requestWindow를 통해 PIP를 띄워줍니다.

::: code-group

```html [index.html]
<div id="container">
  <button id="toggle-pip">Toggle PiP</button>
</div>
```

<!-- prettier-ignore -->
```js [index.js]
const container = document.getElementById("container");
const togglePipButton = document.getElementById("toggle-pip");

const isPipSupported = "documentPictureInPicture" in window;

if (!isPipSupported) {
  container.innerHTML = "Picture-in-Picture is not supported in this browser";
} else {
  togglePipButton.addEventListener("click", openPiP);
  togglePipButton.style.display = "block";
}

// Open Pip Window
async function openPip() {
  const pipWindow = await window.documentPictureInPicture.requestWindow({ // [!code highlight]
    width: 300, // [!code highlight]
    height: 300, // [!code highlight]
    disallowReturnToOpener: true, // '탭으로 돌아가기' 버튼 숨기기 // [!code highlight]
    preferInitialWindowPlacement: true, // 항상 초기 위치에 설정 크기로 열림 (Chrome 130+) // [!code highlight]
  }); // [!code highlight]
} 
```

```css [index.css]
#toggle-pip {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 10px;
  display: none;
}
```

:::

아래 버튼을 클릭하면, PIP가 잘 나타나는 것을 볼 수 있습니다.
<ButtonPipOpen/>

## PIP 닫기

PIP를 닫을 때는 반환받은 `pipWindow`를 이용하거나, window에 접근해서 닫을 수 있습니다.

```js
// 반환받은 pipWindow 이용
pipWindow.close();

// documentPictureInPicture window 이용
if (window.documentPictureInPicture.window) {
  window.documentPictureInPicture.window.close();
}
```

PIP를 토글하도록 버튼 클릭 액션을 수정하겠습니다.

::: code-group

```html [index.html]
<div id="container">
  <button id="toggle-pip">Toggle PiP</button>
</div>
```

<!-- prettier-ignore -->
```js [index.js]
// ...
if (!isPipSupported) {
  container.innerHTML = "Picture-in-Picture is not supported in this browser";
} else {
  togglePipButton.addEventListener("click", togglePictureInPicture); // [!code highlight]
  togglePipButton.style.display = "block";
}

function togglePictureInPicture() { // [!code highlight]
  if (window.documentPictureInPicture.window) { // [!code highlight]
    closePip(); // [!code highlight]
  } else { // [!code highlight]
    openPip(); // [!code highlight]
  } // [!code highlight]
} // [!code highlight]

async function openPip() {
  const pipWindow = await window.documentPictureInPicture.requestWindow({
    width: 300,
    height: 300,
    disallowReturnToOpener: true,
    preferInitialWindowPlacement: true,
  });
}

function closePip() { // [!code highlight]
  window.documentPictureInPicture.window.close(); // [!code highlight]
} // [!code highlight]
```

:::

<ButtonPipToggle/>

## PIP 창에 콘텐츠 노출하기

콘텐츠를 노출하기 위해서 직접 html 코드를 작성해서 넣을 수 있습니다.

```js
pipWindow.document.body.innerHTML = `
  <h1> Hello, PIP!</h1>
`;
```

하지만, PIP는 보통 이미 보고있던 화면을 PIP 화면으로 이동시켜서 보기 위해 사용됩니다.

따라서 일반적인 사용 방법은 콘텐츠를 PIP 윈도우로 이동시키는 것입니다.

::: code-group

```html [index.html]
<div id="container">
  <button id="toggle-pip">Toggle PiP</button>
</div>
<div id="pip-container">
  <div id="pip-content" class="pip-content">
    <h1>Hello, PIP!</h1>
  </div>
</div>
```

<!-- prettier-ignore -->
```js [index.js]
const container = document.getElementById("container");
const pipContent = document.getElementById("pip-content"); // [!code highlight]

async function openPip() {
  const pipWindow = await window.documentPictureInPicture.requestWindow({
    width: 300,
    height: 300,
    disallowReturnToOpener: true,
    preferInitialWindowPlacement: true,
  });

  pipWindow.document.body.append(pipContent); // [!code highlight]
}
```

:::

하지만 이렇게 될 경우, PIP가 종료되어도 콘텐츠가 제자리로 돌아오지 않습니다.

`pagehide` 이벤트를 청취해서 콘텐츠를 제자리로 돌려두는 작업이 필요합니다.

::: code-group

<!-- prettier-ignore -->
```js [index.js]
const container = document.getElementById("container");
const pipContent = document.getElementById("pip-content");

async function openPip() {
  const pipWindow = await window.documentPictureInPicture.requestWindow({
    // ...
  });

  pipWindow.addEventListener("pagehide", onClosePip); // [!code highlight]
  pipWindow.document.body.append(pipContent);
}

function onClosePip(event) {
  container.append(event.target.querySelector("#pip-content")); // [!code highlight]
}
```

```css [index.css]
.pip-content {
  color: yellow;
}
```

:::

이렇게 되면 요소는 적절하게 이동됩니다.

하지만, 스타일은 PIP에서 적용되지 않고 있습니다.

<ContentsPip/>

## PIP 창에 스타일 적용하기

스타일을 적용하기 위해서 CSS 파일을 PIP Window에 복사합니다.

::: code-group

<!-- prettier-ignore -->
```js [index.js]
async function openPip() {
  const pipWindow = await window.documentPictureInPicture.requestWindow({
    // ...
  });

  //...
  copyStyles(pipWindow); // [!code highlight]
}

const copyStyles = (pipWindow) => {  // [!code highlight]
  [...document.styleSheets].forEach((styleSheet) => {  // [!code highlight]
    try {  // [!code highlight]
      const cssRules = [...styleSheet.cssRules]  // [!code highlight]
        .map((rule) => rule.cssText)  // [!code highlight]
        .join("");  // [!code highlight]
      const style = document.createElement("style");  // [!code highlight]
      style.textContent = cssRules;  // [!code highlight]
      pipWindow.document.head.appendChild(style);  // [!code highlight]
    } catch (e) {  // [!code highlight]
      const link = document.createElement("link");  // [!code highlight]
      link.rel = "stylesheet";  // [!code highlight]
      link.type = styleSheet.type;  // [!code highlight]
      link.media = styleSheet.media;  // [!code highlight]
      link.href = styleSheet.href;  // [!code highlight]
      pipWindow.document.head.appendChild(link);  // [!code highlight]
    }  // [!code highlight]
  });  // [!code highlight]
};  // [!code highlight]
```

:::
<ContentsPipCss/>
