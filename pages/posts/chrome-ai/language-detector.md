---
title: Chrome Built-in AI -  Language Detector
description: Chrome 내장 AI API인 Language Detector를 사용하는 방법을 소개합니다.
head:
  - - meta
    - name: keywords
      content: Chrome, AI, Language Detector, Chrome AI, Built-in AI, Chrome Language Detector
comment: true
---

::: warning 작성중
이 포스트는 작성중입니다.
:::

::: tip
[@types/dom-chromium-ai](https://www.npmjs.com/package/@types/dom-chromium-ai) npm 패키지를 사용하여 TypeScript 타이핑을 가져오세요.
:::

# Language Detector

입력 텍스트의 언어를 감지하여 확률이 가장 높은 언어부터 가장 낮은 언어 순으로 반환합니다.

이를 이용해 Translator API에 번역할 텍스트의 입력 언어를 전달할 수 있습니다.

## 시작하기

### 1. 브라우저가 Language Detector API를 지원하는지 확인

```js
const isBrowserSupported = "LanguageDetector" in self;
```

### 2. API가 준비되었는지 확인

API가 준비되었는지 확인하려면 비동기 `availability()` 함수를 호출합니다.

```js
const availability = await LanguageDetector.availability({
  expectedInputLanguages: languages,
});
```

이 함수는 다음 값 중 하나가 포함된 프로미스를 반환합니다.

- `available` : 모델이 이미 다운로드되어 있고 사용할 수 있습니다.
- `downloading` : 모델이 다운로드 중입니다.
- `downloadable` : 모델을 다운로드 할 수 있습니다.
- `unavailable` : 지원되지 않습니다. 기기의 전원이나 디스크 공간이 부족할 수 있습니다.

### 3. 모델 다운로드 및 인스턴스 생성

모델 다운로드 및 인스턴스 생성을 위해 `create()` 함수를 호출합니다.

이 때 예상 언어를 전달하거나, 작업을 중단하기 위한 시그널을 전달할 수 있습니다.

```ts
const detector = await LanguageDetector.create({
  expectedInputLanguages: languages,
  monitor(m) {
    m.addEventListener("downloadprogress", (e) => {
      console.log(`Downloaded ${e.loaded * 100}%`);
    });
  },
  signal: signal,
});
```

### 4. 언어 감지

언어 감지를 위해 `detect()` 함수를 호출합니다.

```js
const detectedLanguages = await detector.detect(text);
```

이 함수는 다음과 같은 목록을 포함하는 프로미스를 반환합니다.

```ts
[
  {
      "confidence": 0.9427181482315063,
      "detectedLanguage": "en"
  },
  {
      "confidence": 0.016950147226452827,
      "detectedLanguage": "es"
  },
  ...
]
```
