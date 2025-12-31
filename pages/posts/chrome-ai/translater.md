---
title: Chrome Built-in AI - Translater
description: Chrome 내장 AI API인 Translater로 텍스트를 번역하는 방법을 소개합니다.
head:
  - - meta
    - name: keywords
      content: Chrome, AI, Web API, Translater, Translator API, Chrome AI, Built-in AI, Chrome Translater
comment: true
---

# Translater API

Chrome 브라우저에는 AI가 내장되어 있으며, API를 통해 AI 기반 작업을 실행할 수 있도록 지원합니다.

Translator는 입력 텍스트를 원하는 언어로 번역합니다.

아래 예제는 영어를 한국어로 번역합니다.

<script setup>
import Translator from "@/components/chrome-ai/Translator.vue";
</script>

<div class="example">
  <Translator />
</div>

## 0. 준비

> [!IMPORTANT] 브라우저 지원 현황을 확인하세요
> [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Translator#browser_compatibility) 에서 브라우저별 지원 현황을 확인할 수 있습니다.

> [!TIP] Typescript를 사용한다면
> [@types/dom-chromium-ai](https://www.npmjs.com/package/@types/dom-chromium-ai) npm 패키지를 사용하여 TypeScript 타이핑을 가져오세요.

## 1. 브라우저가 Translator API를 지원하는지 확인

```js
const isBrowserSupported = "Translator" in self;
```

## 2. AI 모델이 준비되었는지 확인

```js
const availability = await Translator.availability({
  sourceLanguage: sourceLanguage, // 'en'
  targetLanguage: targetLanguage, // 'ko'
});
```

이 함수는 다음 값 중 하나가 포함된 프로미스를 반환합니다.

- `available` : 모델이 이미 다운로드되어 있고 사용할 수 있습니다.
- `downloading` : 모델이 다운로드 중입니다.
- `downloadable` : 모델을 다운로드 할 수 있습니다.
- `unavailable` : 지원되지 않습니다. 기기의 전원이나 디스크 공간이 부족할 수 있습니다. `sourceLanguage`와 `targetLanguage`가 같거나 지원되지 않는 언어일 수 있습니다.

## 3. 모델 다운로드 및 인스턴스 생성

모델 다운로드 및 인스턴스 생성을 위해 `create()` 함수를 호출합니다.

원본 언어와 번역할 언어를 전달하고, 작업을 중단하기 위한 시그널도 전달할 수 있습니다.

```ts
const abortController = new AbortController();
const translator = await Translator.create({
  sourceLanguage: sourceLanguage,
  targetLanguage: targetLanguage,
  monitor(m) {
    m.addEventListener("downloadprogress", (e) => {
      console.log(`Downloaded ${e.loaded * 100}%`);
    });
  },
  signal: abortController.signal,
});
```

## 4. 번역

번역을 위해 `translate()` 함수를 호출합니다.

이 함수는 번역된 텍스트를 반환합니다.

```ts
const translatedText = await translator.translate(text);
```

## 5. 인스턴스 해제

작업이 완료되면 인스턴스를 해제합니다.

```ts
translator.destroy();
```

`create()` 를 호출할 때 전달하는 `signal`을 통해서 작업을 중단해도 같은 효과를 얻을 수 있습니다

( `create()` 가 완료되기 전에 `abort`할 경우에는 `create` 작업이 취소됩니다. )

```ts
abortController.abort();
```

## React 예제

사용자의 상호작용 없이 AI 모델을 다운로드하려고 하면 에러가 발생할 수 있습니다.

따라서 컴포넌트가 마운트되었을 때 인스턴스를 생성하는 것보다는

사용자의 상호작용이 있을 때 인스턴스를 생성할 수 있도록 유틸 함수를 작성합니다.

```ts
export const getTranslator = async (
  sourceLanguage: string,
  targetLanguage: string,
  signal: AbortSignal
) => {
  const isBrowserSupported = "Translator" in self;
  if (!isBrowserSupported) {
    throw new Error("Translator is not supported in this browser");
  }

  const availability = await Translator.availability({
    sourceLanguage: sourceLanguage,
    targetLanguage: targetLanguage,
  });

  if (availability === "unavailable") {
    throw new Error("Model is not available for the given languages");
  }

  return Translator.create({
    sourceLanguage: sourceLanguage,
    targetLanguage: targetLanguage,
    signal: signal,
  });
};
```

컴포넌트가 유지되는 동안은 Translator 인스턴스가 유지되도록 작성했습니다.

실제로 사용할 때는 원본 언어와 번역할 언어가 변경될 때 인스턴스를 새로 생성해야 할 수 있습니다.

```tsx import { useEffect, useState } from "react";
import { getTranslator } from "@/utils/translator";

export const Translator = () => {
  const translatorRef = useRef<Translator | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [translatedText, setTranslatedText] = useState<string>("");

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const translateText = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const text = formData.get("text") as string;

    try {
      setIsLoading(true);
      if (!translatorRef.current) {
        abortControllerRef.current = new AbortController();
        translatorRef.current = await getTranslator(
          "en",
          "ko",
          abortControllerRef.current.signal
        );
      }

      const results = (await translatorRef.current?.translate(text)) ?? "";
      setTranslatedText(results);
    } catch (error) {
      console.error("Error translating text", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div>
      <form onSubmit={translateText}>
        <input type="text" name="text" />
        <button type="submit">Translate</button>
      </form>
      <div>{translatedText}</div>
    </div>
  );
};
```

## React 예제 : Language Detector + Translator

[Language Detector](https://kangbit.github.io/posts/chrome-ai/language-detector.html)를 함께 사용하면 원본 언어를 알지 못해도 번역할 수 있습니다.

우선 `sourceLanguage`와 `targetLanguage`를 선택할 수 있도록 하겠습니다.

```tsx {8-9,16-24}
export const Translator = () => {
  // ...
  const translateText = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const text = formData.get("text") as string;
    const sourceLanguage = formData.get("sourceLanguage") as string;
    const targetLanguage = formData.get("targetLanguage") as string;

    // ...
  };
  return (
    <div>
      <form onSubmit={translateText}>
        <select name="sourceLanguage" id="sourceLanguage">
          <option value="auto">Detect Language</option>
          <option value="en">English</option>
          <option value="ko">Korean</option>
        </select>
        <select name="targetLanguage" id="targetLanguage">
          <option value="ko">Korean</option>
          <option value="en">English</option>
        </select>
        <input type="text" name="text" />
        <button type="submit">Translate</button>
      </form>
      <div>{translatedText}</div>
    </div>
  );
};
```

sourceLanguage가 `auto`인 경우에는 Language Detector를 사용해서 원본 언어를 감지해야 합니다.

원본 언어를 감지하기 위한 함수를 작성합니다.

마찬가지로 cleanup을 위해 `detector`와 `detectorAbortController`는 useRef로 선언합니다.

```tsx {4,5,13,17-30}
export const Translator = () => {
  const translatorRef = useRef<Translator | null>(null);
  const translatorAbortControllerRef = useRef<AbortController | null>(null);
  const detectorRef = useRef<LanguageDetector | null>(null);
  const detectorAbortControllerRef = useRef<AbortController | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [translatedText, setTranslatedText] = useState<string>("");

  useEffect(() => {
    return () => {
      translatorAbortControllerRef.current?.abort();
      detectorAbortControllerRef.current?.abort();
    };
  }, []);

  const detectLanguage = async (text: string) => {
    if (!detectorRef.current) {
      detectorAbortControllerRef.current = new AbortController();
      detectorRef.current = await getDetector(
        [],
        detectorAbortControllerRef.current.signal
      );
    }
    const results = await detectorRef.current?.detect(text);
    if (!results?.[0]?.detectedLanguage) {
      throw new Error("Failed to detect language");
    }
    return results[0].detectedLanguage;
  };
  // ...
};
```

선택된 `sourceLanguage`와 `targetLanguage`를 이용해서 translate 하도록 수정합니다.

```tsx {13-16,19-22,24-26,30-31}
export const Translator = () => {
  // ...

  const translateText = async (e: React.FormEvent<HTMLFormElement>) => {
    // ...
    let sourceLanguage = formData.get("sourceLanguage") as string;
    const targetLanguage = formData.get("targetLanguage") as string;

    try {
      setIsLoading(true);

      // sourceLanguage가 auto인 경우에는 Language Detector를 사용해서 원본 언어를 감지합니다.
      if (sourceLanguage === "auto") {
        const detectedLanguage = await detectLanguage(text);
        sourceLanguage = detectedLanguage;
      }

      // 원본 언어와 번역할 언어가 같으면 번역하지 않습니다.
      if (sourceLanguage === targetLanguage) {
        setTranslatedText(text);
        return;
      }

      // 이전 요청을 취소하고 ( translator를 destroy )
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // 새로운 인스턴스를 생성합니다.
      abortControllerRef.current = new AbortController();
      translatorRef.current = await getTranslator(
        sourceLanguage,
        targetLanguage,
        abortControllerRef.current.signal
      );

      const results = (await translatorRef.current?.translate(text)) ?? "";
      setTranslatedText(results);
  };
  // ...
};
```
