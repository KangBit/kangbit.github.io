---
title: 프론트엔드 심화 · 플랫폼 확장
description: PWA와 Service Worker, 웹 컴포넌트, 웹 기술로 만드는 데스크톱·모바일 앱을 정리합니다.
outline: deep
---

# 플랫폼 확장

웹으로 만든 것을 설치 가능한 앱으로, 다른 프레임워크에서도 쓰이는 부품으로, 데스크톱과 모바일로 넓히는 방법입니다.

## PWA: 매니페스트와 설치

설치할 수 있는 웹 앱이 되려면 세 가지가 필요합니다. HTTPS, 매니페스트, Service Worker입니다.

```json
{
  "name": "할 일 관리",
  "short_name": "할 일",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

```html
<link rel="manifest" href="/manifest.webmanifest" />
```

`display: "standalone"`이면 주소창 없이 열립니다. 주소창이 없다는 것은 **뒤로 가기도 새로고침도 사용자에게 보이지 않는다**는 뜻이므로, 앱 안에 이동 수단을 직접 둬야 합니다.

설치 배너는 브라우저가 조건을 판단해 띄웁니다. 직접 띄우려면 이벤트를 잡아 둡니다.

```js
let installPrompt = null;

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
  installButton.hidden = false;
});

installButton.addEventListener("click", async () => {
  await installPrompt.prompt();
  installPrompt = null;
  installButton.hidden = true;
});
```

## Service Worker와 캐시 갱신 전략

브라우저와 네트워크 사이에 끼어드는 스크립트입니다. 요청을 가로채 캐시에서 먼저 돌려줄 수 있습니다.

```js
// sw.js
const CACHE = "app-v3";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(["/", "/app.css", "/app.js"])),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((hit) => hit ?? fetch(event.request)),
  );
});
```

자원 종류마다 전략이 다릅니다.

| 자원 | 전략 | 이유 |
| --- | --- | --- |
| 해시가 붙은 JS·CSS | 캐시 우선 | 내용이 바뀌면 파일 이름이 바뀝니다 |
| HTML | 네트워크 우선 | 최신 버전으로 들어가야 합니다 |
| API 응답 | 네트워크 우선, 실패 시 캐시 | 오프라인에서도 마지막 화면은 보입니다 |
| 이미지 | 캐시 우선 + 기한 | 자주 바뀌지 않습니다 |

가장 자주 겪는 사고는 **갱신이 안 되는 것**입니다. 배포했는데 사용자에게 예전 화면이 계속 보입니다. 오래된 캐시를 지우고, 새 워커가 바로 넘겨받게 합니다.

```js
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});
```

::: warning
Service Worker는 한 번 등록되면 사용자의 브라우저에 남습니다. 잘못 올린 캐시 규칙은 서버를 고쳐도 되돌릴 수 없습니다. 반드시 해제 경로를 준비하고, 처음에는 좁은 범위로 시작합니다.
:::

오프라인 전용 화면도 준비해 둡니다. 네트워크도 캐시도 없을 때 빈 화면 대신 보여 줄 것이 필요합니다.

## 웹 컴포넌트: HTML Template, Custom Elements와 Shadow DOM

프레임워크 없이, 또는 여러 프레임워크에서 함께 쓰는 부품을 만들 때 씁니다. 세 가지 기술이 묶여 있습니다.

`<template>`은 파싱되지만 그려지지 않는 조각입니다.

```html
<template id="badge-template">
  <span class="badge"><slot></slot></span>
</template>
```

Custom Element는 새 태그를 정의합니다.

```js
class StatusBadge extends HTMLElement {
  connectedCallback() {
    const template = document.querySelector("#badge-template");
    const shadow = this.attachShadow({ mode: "open" });
    shadow.append(template.content.cloneNode(true));
  }
}

customElements.define("status-badge", StatusBadge);
```

```html
<status-badge>진행 중</status-badge>
```

이름에 하이픈이 반드시 들어가야 합니다. 표준 태그와 겹치지 않게 하는 규칙입니다.

Shadow DOM은 스타일과 구조를 격리합니다. 바깥 CSS가 안으로 들어오지 못하고, 안쪽 클래스 이름이 밖과 충돌하지 않습니다.

```js
shadow.innerHTML = `
  <style>.badge { padding: 2px 8px; border-radius: 999px; }</style>
  <span class="badge"><slot></slot></span>
`;
```

격리는 장점이자 제약입니다. 바깥에서 모양을 바꾸려면 통로를 열어 둬야 합니다.

```css
status-badge { --badge-bg: #eef2ff; }        /* 사용자 정의 속성은 통과합니다 */
status-badge::part(label) { font-weight: 600; }   /* part로 노출한 부분만 */
```

디자인 시스템을 여러 팀, 여러 프레임워크에 배포할 때가 가장 잘 맞습니다. 한 앱 안에서만 쓰는 부품이라면 쓰던 프레임워크의 컴포넌트가 단순합니다.

## 데스크톱 앱: Electron, Tauri

웹 화면을 창에 띄우고 파일 시스템 같은 OS 기능을 붙입니다.

| | Electron | Tauri |
| --- | --- | --- |
| 렌더링 | Chromium 포함 | OS의 웹뷰 사용 |
| 백엔드 | Node.js | Rust |
| 배포 크기 | 수십 MB 이상 | 수 MB |
| 화면 일관성 | 어디서나 동일 | OS·버전에 따라 다름 |

Electron은 모든 사용자가 같은 엔진을 쓰므로 렌더링 차이가 없습니다. 대신 브라우저를 통째로 함께 배포합니다. Tauri는 OS에 있는 웹뷰를 쓰므로 가볍지만, 플랫폼마다 엔진이 달라 호환성 확인이 필요합니다.

공통으로 중요한 것은 **권한 경계**입니다. 화면 쪽 코드에 파일 시스템 권한을 그대로 주면, XSS 하나가 사용자 디스크 접근으로 이어집니다.

```js
// Electron: 화면 쪽에서 Node를 끄고, 필요한 기능만 통로로 엽니다
new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    preload: path.join(__dirname, "preload.js"),
  },
});
```

```js
// preload.js — 꺼내 줄 것만 정확히 적습니다
contextBridge.exposeInMainWorld("api", {
  readConfig: () => ipcRenderer.invoke("config:read"),
});
```

자동 업데이트, 코드 서명, 설치 파일 배포는 웹에 없던 일입니다. 처음부터 일정에 넣어 둡니다.

## 모바일 앱: React Native, Flutter, Ionic

세 가지는 접근 방식이 다릅니다.

| | 화면을 그리는 방식 | 언어 |
| --- | --- | --- |
| React Native | OS의 네이티브 위젯 | JavaScript·TypeScript |
| Flutter | 자체 엔진으로 직접 그림 | Dart |
| Ionic | 웹뷰 안의 HTML·CSS | 웹 그대로 |

React는 알지만 Dart는 모른다면 React Native가 가깝습니다. 디자인을 플랫폼과 무관하게 똑같이 맞춰야 한다면 Flutter가 유리합니다. 이미 있는 웹 앱을 빠르게 스토어에 올리는 것이 목적이라면 Ionic이 가장 적은 작업으로 끝납니다.

웹에서 넘어올 때 바뀌는 지점들입니다.

- **CSS가 그대로 쓰이지 않습니다** — React Native는 `StyleSheet`에 Flexbox 일부만 있습니다
- **라우팅이 다릅니다** — URL이 아니라 화면 스택입니다. 뒤로 가기는 OS 제스처입니다
- **네트워크가 끊깁니다** — 오프라인과 느린 연결이 예외가 아닙니다
- **권한을 물어봐야 합니다** — 카메라, 위치, 알림 모두 거절당할 수 있습니다
- **배포가 심사를 거칩니다** — 고치고 바로 올리는 웹과 다릅니다

반대로 그대로 가져가는 것도 많습니다. 컴포넌트 분리, 상태 관리, 비동기 처리, 접근성은 플랫폼이 바뀌어도 같은 이야기입니다. 기본기가 남는 자리가 여기입니다.
