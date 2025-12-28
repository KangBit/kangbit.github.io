---
title: Chrome Built-in AI -  Translater
description: Chrome 내장 AI API인 Translater를 사용하는 방법을 소개합니다.
head:
  - - meta
    - name: keywords
      content: Chrome, AI, Translater, Chrome AI, Built-in AI, Chrome Translater
comment: true
---

::: warning 작성중
이 포스트는 작성중입니다.
:::

::: tip
[@types/dom-chromium-ai](https://www.npmjs.com/package/@types/dom-chromium-ai) npm 패키지를 사용하여 TypeScript 타이핑을 가져오세요.
:::

# Translater

## 시작하기

입력 텍스트를 번역할 수 있습니다.

1. 브라우저가 Translator API를 지원하는지 확인

```js
const isBrowserSupported = "Translator" in self;
```

2. API가 준비되었는지 확인

```js
const availability = await Translator.availability({
  sourceLanguage: sourceLanguage,
  targetLanguage: targetLanguage,
});
```

이 함수는 다음 값 중 하나가 포함된 프로미스를 반환합니다.

- `available` : 모델이 이미 다운로드되어 있고 사용할 수 있습니다.
- `downloading` : 모델이 다운로드 중입니다.
- `downloadable` : 모델을 다운로드 할 수 있습니다.
- `unavailable` : 지원되지 않습니다. 기기의 전원이나 디스크 공간이 부족할 수 있습니다.

## 참고

- [AI on Chrome](https://developer.chrome.com/docs/ai/built-in?hl=ko)
- [Language Detector API](https://developer.mozilla.org/en-US/docs/Web/API/LanguageDetector)
