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

## Picture In Picture란?

<img src="/assets/images/document-pip/video-pip.jpg" width="80%" class="mb-0"></img>

**Picture in Picture** (**PIP**)는 사용자가 다른 작업을 수행하면서도 특정 콘텐츠를 계속 볼 수 있도록 도와주는 기능입니다.

기존에는 주로 동영상 재생 시에 활용되어, 사용자가 웹 서핑이나 문서 작업을 하면서도 영상을 계속 시청할 수 있게 해주었습니다. 이 작은 팝업 창은 항상 다른 창들 위에 떠 있어서 필요한 정보를 지속적으로 제공합니다.

## Document Picture In Picture

**Document PIP API**의 등장으로 이제는 **웹 문서 전체를 작은 창으로 분리**할 수 있게 되었습니다. 이는 단순한 비디오 재생을 넘어서, 채팅창, 대시보드, 문서 편집기 등 다양한 웹 애플리케이션을 독립적인 창으로 분리하여 멀티태스킹을 극대화할 수 있게 해줍니다.

Document PIP의 핵심은 **콘텐츠의 완전한 이동**과 **스타일의 완벽한 복사**에 있습니다. 사용자가 보고 있던 화면의 특정 부분을 그대로 PIP 창으로 이동시키고, 모든 스타일시트를 복사하여 원본과 동일한 모습을 유지할 수 있습니다.

## PIP 창 열기

### 브라우저 지원 확인

먼저 브라우저가 Document PIP API를 지원하는지 확인해야 합니다.

```js
const isPipSupported = "documentPictureInPicture" in window;
```

### PIP 창 생성하기

API를 지원하는 경우, `requestWindow` 메서드를 통해 PIP 창을 생성할 수 있습니다.

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

async function openPip() { // [!code highlight]
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

아래 버튼을 클릭해보시면 PIP 창이 어떻게 나타나는지 직접 확인할 수 있습니다.

<ButtonPipOpen/>

## PIP 창 제어하기

### PIP 창 닫기

PIP 창을 닫기 위해서 반환받은 `pipWindow` 객체를 이용하거나 `documentPictureInPicture` 객체를 통해 접근합니다.

```js
// 방법 1: 반환받은 pipWindow 이용
pipWindow.close();

// 방법 2: documentPictureInPicture window 이용
if (window.documentPictureInPicture.window) {
  window.documentPictureInPicture.window.close();
}
```

### 토글 기능 구현

PIP 창을 열고 닫는 토글 기능을 구현해보겠습니다.

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

이제 아래 버튼을 클릭하면 PIP 창을 열고 닫을 수 있습니다.

<ButtonPipToggle/>

## 콘텐츠를 PIP 창에 표시하기

### 기본적인 콘텐츠 추가

가장 간단한 방법은 PIP 창에 직접 HTML 코드를 작성하는 것입니다.

```js
pipWindow.document.body.innerHTML = `
  <h1>Hello, PIP!</h1>
`;
```

하지만 실제 사용 사례에서는 사용자가 보고 있던 특정 부분을 PIP 창으로 이동시키는 것이 일반적입니다.

### 기존 요소를 PIP 창으로 이동

이를 통해 원본 페이지에서 보고 있던 영역을 PIP 창에서 볼 수 있습니다.

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

### PIP 창 닫힐 때 콘텐츠 복원

PIP 창이 닫힐 때는 콘텐츠를 원래 위치로 복귀시켜야 합니다.

`pagehide` 이벤트를 활용해서 요소를 다시 원래 위치로 가져옵니다.

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
  padding: 20px;
  background: #333;
  border-radius: 8px;
}
```

:::

이제 요소가 적절하게 이동하고 복원됩니다.

하지만 아직 스타일이 PIP 창에 적용되지 않아 콘텐츠가 제대로 표시되지 않는 것을 확인할 수 있습니다.

<ContentsPip/>

## 스타일을 PIP 창에 적용하기

### 스타일 복사의 중요성

PIP 창에서 콘텐츠가 원본과 동일하게 보이려면 스타일시트를 PIP 창에 복사해야 합니다.

다음과 같은 방법으로 모든 스타일을 PIP 창에 복사할 수 있습니다:

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

이 코드는 다음과 같은 작업을 수행합니다:

1. **모든 스타일시트 순회**: `document.styleSheets`를 통해 페이지의 모든 스타일시트에 접근
2. **내부 스타일시트 처리**: CSS 규칙을 추출하여 새로운 `<style>` 태그로 생성
3. **외부 스타일시트 처리**: CORS 정책으로 인해 접근할 수 없는 외부 CSS 파일은 `<link>` 태그로 복사

이제 PIP 창에서도 원본과 동일한 스타일이 적용됩니다.

<ContentsPipCss/>

## 참고 자료

- [MDN](https://developer.chrome.com/docs/web-platform/document-picture-in-picture)
- [Chrome for developers](https://developer.chrome.com/blog/document-pip-use-case?hl=ko)
- [Can I Use](https://caniuse.com/mdn-api_documentpictureinpicture)
