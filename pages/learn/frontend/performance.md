---
title: 프론트엔드 09. 브라우저 심화와 성능
description: 실행과 렌더링 흐름을 이해하고 병목을 찾아 개선합니다.
outline: deep
---

# 09. 브라우저 심화와 성능

왜 느린지 설명할 수 있어야 고칠 수 있습니다. 실행 구조와 측정 방법을 정리합니다.

## 호출 스택, 이벤트 루프, 태스크와 마이크로태스크

JavaScript는 한 번에 하나씩 실행합니다. 스택이 비어야 다음 일을 꺼냅니다.

대기열은 두 종류이고 **마이크로태스크가 먼저**입니다.

| 대기열 | 들어가는 것 |
| --- | --- |
| 마이크로태스크 | `Promise.then`, `queueMicrotask`, `MutationObserver` |
| 태스크 | `setTimeout`, 이벤트 핸들러, 네트워크 응답 |

```js
console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");

// 1 4 3 2
```

마이크로태스크가 전부 비워질 때까지 태스크로 넘어가지 않습니다. 그래서 마이크로태스크에서 무한히 작업을 추가하면 화면이 영영 멈춥니다.

긴 작업은 화면 갱신과 입력 처리를 막습니다.

```js
// 3초 동안 클릭도 스크롤도 반응하지 않습니다
const end = Date.now() + 3000;
while (Date.now() < end) {}
```

큰 목록을 처리해야 하면 쪼개서 양보합니다.

```js
async function processAll(items) {
  for (let i = 0; i < items.length; i += 100) {
    process(items.slice(i, i + 100));
    await new Promise((resolve) => setTimeout(resolve, 0));   // 틈을 줍니다
  }
}
```

계산이 정말 무거우면 Web Worker로 보냅니다. 메인 스레드를 비워 두는 것이 목적입니다.

## 레이아웃, 페인트와 화면 갱신 비용

무엇을 바꾸느냐에 따라 다시 하는 단계가 다릅니다.

| 바꾸는 속성 | 다시 하는 일 |
| --- | --- |
| `width`, `height`, `top`, `margin` | 레이아웃 → 페인트 → 합성 |
| `background-color`, `box-shadow` | 페인트 → 합성 |
| `transform`, `opacity` | 합성만 |

애니메이션에는 `transform`과 `opacity`를 씁니다. 위치를 옮길 때 `left`를 쓰면 매 프레임 레이아웃을 다시 계산합니다.

```css
/* 매 프레임 레이아웃 */
.slide { transition: left 0.3s; }

/* 합성만 */
.slide { transition: transform 0.3s; }
```

읽기와 쓰기를 번갈아 하면 강제로 레이아웃이 반복됩니다.

```js
// 나쁨 — 읽을 때마다 계산을 강제합니다
for (const el of items) {
  el.style.height = el.offsetHeight + 10 + "px";
}

// 좋음 — 모아서 읽고 모아서 씁니다
const heights = items.map((el) => el.offsetHeight);
items.forEach((el, i) => (el.style.height = heights[i] + 10 + "px"));
```

`offsetHeight`, `getBoundingClientRect`, `scrollTop` 같은 것을 읽으면 브라우저가 "지금 정확한 값"을 주려고 레이아웃을 즉시 수행합니다.

## Core Web Vitals: LCP, INP와 CLS

사용자 체감을 세 가지 숫자로 봅니다.

| 지표 | 의미 | 좋음 |
| --- | --- | --- |
| LCP | 가장 큰 콘텐츠가 보이기까지 | 2.5초 이하 |
| INP | 입력에 반응하기까지 | 200ms 이하 |
| CLS | 레이아웃이 밀린 정도 | 0.1 이하 |

**LCP**는 보통 큰 이미지나 제목 블록입니다. 그것이 늦게 오는 이유를 찾습니다. 서버 응답이 느린지, 이미지가 큰지, CSS나 폰트가 막고 있는지입니다.

**INP**는 클릭했을 때 화면이 반응하기까지입니다. 긴 JavaScript 작업이 주범입니다.

**CLS**는 읽고 있는데 내용이 갑자기 밀리는 현상입니다. 크기를 모르는 이미지와 나중에 끼어드는 배너가 원인입니다.

```html
<!-- 크기를 적어 두면 자리를 미리 잡습니다 -->
<img src="hero.jpg" width="1200" height="600" alt="" />
```

```css
img { aspect-ratio: 2 / 1; width: 100%; height: auto; }
```

폰트 교체도 레이아웃을 흔듭니다. `size-adjust`로 대체 글꼴의 크기를 맞춰 두면 덜 튑니다.

실제 사용자 값은 라이브러리로 수집할 수 있습니다.

```js
import { onLCP, onINP, onCLS } from "web-vitals";

onLCP(send);
onINP(send);
onCLS(send);
```

실험실 측정(Lighthouse)과 실제 사용자 값은 다릅니다. 둘 다 봐야 합니다.

## 이미지 크기·형식과 지연 로딩

이미지가 전체 전송량의 대부분인 경우가 많습니다.

```html
<img
  src="photo.webp"
  width="800"
  height="600"
  loading="lazy"
  decoding="async"
  alt="설명"
/>
```

`loading="lazy"`는 화면에 가까워질 때 받습니다. 다만 **첫 화면 이미지에는 붙이지 않습니다.** LCP가 늦어집니다.

화면 크기에 맞는 이미지를 주면 모바일에서 큰 파일을 받지 않습니다.

```html
<img
  src="photo-800.webp"
  srcset="photo-400.webp 400w, photo-800.webp 800w, photo-1600.webp 1600w"
  sizes="(max-width: 600px) 100vw, 800px"
  alt="설명"
/>
```

형식은 WebP나 AVIF가 JPEG보다 훨씬 작습니다. 지원하지 않는 브라우저를 위해 대체를 둘 수 있습니다.

```html
<picture>
  <source srcset="photo.avif" type="image/avif" />
  <source srcset="photo.webp" type="image/webp" />
  <img src="photo.jpg" alt="설명" />
</picture>
```

## 캐시와 리소스 로딩 전략

변하지 않는 파일에는 긴 캐시를, HTML에는 짧은 캐시를 줍니다.

```http
# 파일 이름에 해시가 들어간 번들
Cache-Control: public, max-age=31536000, immutable

# HTML
Cache-Control: no-cache
```

`no-cache`는 저장하지 않는다는 뜻이 아니라 **매번 서버에 물어본다**는 뜻입니다. 바뀌지 않았으면 304가 와서 빠릅니다. 저장을 막는 것은 `no-store`입니다.

중요한 리소스는 미리 알려 줍니다.

```html
<link rel="preconnect" href="https://api.example.com" />
<link rel="preload" as="font" type="font/woff2" href="/fonts/main.woff2" crossorigin />
<link rel="preload" as="image" href="/hero.webp" />
```

`preload`를 남발하면 정작 중요한 것과 대역폭을 다툽니다. LCP에 관여하는 것 한두 개만 지정합니다.

## 번들 크기와 코드 분할

받아야 실행할 수 있으므로, 초기에 필요 없는 코드는 떼어 냅니다.

```js
// 클릭할 때 받습니다
editButton.addEventListener("click", async () => {
  const { openEditor } = await import("./editor.js");
  openEditor();
});
```

무엇이 번들을 차지하는지 먼저 봅니다.

```bash
npx vite-bundle-visualizer
```

무거운 라이브러리를 발견하면 대안을 찾거나 필요한 부분만 가져옵니다.

```js
import _ from "lodash";              // 전체
import debounce from "lodash/debounce";   // 하나만
```

날짜 라이브러리처럼 표준 API로 대체할 수 있는 것도 많습니다.

```js
new Intl.DateTimeFormat("ko-KR").format(date);
new Intl.NumberFormat("ko-KR").format(price);
```

## 개발자 도구로 측정하기

**Performance 탭**에서 기록한 뒤 볼 것은 셋입니다.

- 메인 스레드의 **긴 작업**(빨간 삼각형). 50ms를 넘으면 입력이 밀립니다
- **보라색 레이아웃 블록**이 반복되는 구간
- 이벤트에서 화면 갱신까지의 간격

**Network 탭**에서는 폭포 그래프의 모양을 봅니다. 요청이 줄줄이 이어지면(하나가 끝나야 다음이 시작) 의존 관계를 끊을 수 있는지 봅니다.

**Lighthouse**는 전체 점수와 함께 개선 항목을 짚어 줍니다. 다만 실험실 환경이라 실제 사용자 경험과 다를 수 있습니다.

측정할 때 지켜야 할 것들입니다.

- 캐시를 비우고 첫 방문 상황을 봅니다
- 네트워크와 CPU를 느리게 설정해 봅니다(Fast 3G, 4x slowdown)
- 확장 프로그램의 영향을 피하려면 시크릿 창에서 봅니다
- **고치기 전후를 같은 조건에서** 비교합니다

추측으로 고치면 효과를 확인할 수 없습니다. 숫자를 먼저 보고, 고친 뒤 다시 재는 순서를 지킵니다.

## 리스너·타이머 정리와 메모리 누수

참조가 남아 있으면 회수되지 않습니다. 화면을 떠날 때 정리합니다.

```js
const controller = new AbortController();

window.addEventListener("resize", onResize, { signal: controller.signal });
const timer = setInterval(poll, 1000);
const observer = new IntersectionObserver(onIntersect);

function cleanup() {
  controller.abort();
  clearInterval(timer);
  observer.disconnect();
}
```

자주 새는 자리들입니다.

- 제거한 DOM 요소를 변수나 배열이 계속 들고 있는 경우
- `setInterval`을 멈추지 않은 경우
- 전역 객체에 쌓이는 캐시
- `IntersectionObserver`, `ResizeObserver`를 끊지 않은 경우

Memory 탭에서 힙 스냅샷을 두 번 찍고 비교하면, 늘어난 객체를 찾을 수 있습니다. 화면을 여러 번 열고 닫은 뒤 메모리가 계속 늘어나면 누수를 의심합니다.
