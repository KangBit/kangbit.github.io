---
title: Chrome Built-in AI - Summarizer
description: Chrome 내장 AI API인 Summarizer로 텍스트를 요약하는 방법을 소개합니다.
head:
  - - meta
    - name: keywords
      content: Chrome, AI, Web API, Summarizer, Summarizer API, Chrome AI, Built-in AI, Chrome Summarizer
comment: true
---

# Summarizer API

Chrome 브라우저에는 AI가 내장되어 있으며, API를 통해 AI 기반 작업을 실행할 수 있도록 지원합니다.

Summarizer는 긴 텍스트를 다양한 형식의 요약으로 만들어 주는 API입니다.

리뷰 예약, 기사 제목·머리글 등에 활용할 수 있습니다.

간단한 예제를 확인해보세요.

<script setup>
import Summarizer from "@/components/chrome-ai/Summarizer.vue";
</script>

<div class="example">
  <Summarizer />
</div>

## 0. 준비

> [!IMPORTANT] 브라우저 지원 현황을 확인하세요
> [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Summarizer#browser_compatibility) 에서 브라우저별 지원 현황을 확인할 수 있습니다.

> [!TIP] Typescript를 사용한다면
> [@types/dom-chromium-ai](https://www.npmjs.com/package/@types/dom-chromium-ai) npm 패키지를 사용하여 TypeScript 타이핑을 가져오세요.

## 1. 브라우저가 Summarizer API를 지원하는지 확인

```js
const isBrowserSupported = "Summarizer" in self;
```

## 2. AI 모델이 준비되었는지 확인

모델이 사용 가능한지 확인하려면 비동기 `availability()` 함수를 호출합니다.

```js
const availability = await Summarizer.availability();
```

이 함수는 다음 값 중 하나가 포함된 프로미스를 반환합니다.

- `available` : 모델이 이미 다운로드되어 있고 사용할 수 있습니다.
- `downloading` : 모델이 다운로드 중입니다.
- `downloadable` : 모델을 다운로드 할 수 있습니다.
- `unavailable` : 지원되지 않습니다. 기기의 전원이나 디스크 공간이 부족할 수 있습니다.

## 3. 모델 다운로드 및 인스턴스 생성

모델 다운로드 및 요약기 생성을 위해 `create()` 함수를 호출합니다.

```ts
const summarizer = await Summarizer.create({
  type: "key-points",
  format: "markdown",
  length: "medium",
  sharedContext: "This is a scientific article",
  monitor(m) {
    m.addEventListener("downloadprogress", (e) => {
      console.log(`Downloaded ${e.loaded * 100}%`);
    });
  },
});
```

`create()`에 전달할 수 있는 옵션은 다음과 같습니다.

- `sharedContext`: 요약에 도움이 되는 추가 컨텍스트
- `type`: 요약 유형. `key-points`(기본값), `tldr`, `teaser`, `headline`
- `format`: 출력 형식. `markdown`(기본값), `plain-text`
- `length`: 요약 길이. `short`(기본값), `medium`, `long`
- `expectedInputLanguages`: 예상 입력 언어 코드 배열 (다국어 시)
- `outputLanguage`: 출력 언어 코드
- `expectedContextLanguages`: 컨텍스트 예상 언어 (다국어 시)

설정한 매개변수는 변경할 수 없습니다. 옵션을 바꾸려면 새 요약기 인스턴스를 만들어야 합니다.

다음 표는 요약 유형과 길이별 의미입니다. 길이는 최대 기준이며, 결과가 더 짧을 수 있습니다.

| 유형         | 의미                             | short    | medium   | long     |
| ------------ | -------------------------------- | -------- | -------- | -------- |
| `tldr`       | 짧은 개요, 바쁜 독자용           | 문장 1개 | 문장 3개 | 문장 5개 |
| `teaser`     | 흥미로운 부분 중심, 더 읽게 유도 | 문장 1개 | 문장 3개 | 문장 5개 |
| `key-points` | 핵심 포인트를 불릿 목록으로      | 불릿 3개 | 불릿 5개 | 불릿 7개 |
| `headline`   | 기사 제목 형식의 한 문장         | 12단어   | 17단어   | 22단어   |

## 4. 요약 실행

요약 방식은 **일괄**과 **스트리밍** 두 가지입니다.

### 일괄 요약

입력을 모두 처리한 뒤 한 번에 결과를 반환합니다.

```ts
const abortController = new AbortController();
const summary = await summarizer.summarize(text, {
  context: "This article is intended for a tech-savvy audience.",
  signal: abortController.signal,
});
console.log(summary);
```

두 번째 인자의 `context`는 해당 요약만을 위한 배경 정보로, 요약 품질을 높이는 데 활용됩니다.

### 스트리밍 요약

결과를 실시간으로 받으며, 입력이 바뀌면 출력도 갱신됩니다.

```ts
const streamedSummary = "";
const abortController = new AbortController();
const stream = summarizer.summarizeStreaming(text, {
  context: "This article is intended for junior developers.",
  signal: abortController.signal,
});
for await (const chunk of stream) {
  streamedSummary += chunk;
}
console.log(streamedSummary);
```

## 5. 인스턴스 해제

작업이 완료되면 인스턴스를 해제합니다.

```ts
summarizer.destroy();
```

## React 예제

사용자 상호작용 없이 AI 모델을 다운로드하려고 하면 에러가 발생할 수 있습니다.

버튼 클릭 등 사용자 액션 이후에 요약기를 생성하도록 해야 합니다.

::: details summarizer.ts {open}

```ts
export const getSummarizer = async () => {
  const isBrowserSupported = "Summarizer" in self;
  if (!isBrowserSupported) {
    throw new Error("Summarizer API is not supported in this browser");
  }

  const availability = await Summarizer.availability();

  if (availability === "unavailable") {
    throw new Error("Summarizer model is not available");
  }

  const createOptions: SummarizerCreateOptions = {
    type: "key-points",
    format: "markdown",
    length: "short",
    expectedInputLanguages: ["en"],
    outputLanguage: "en",
  };

  if (availability === "available") {
    return Summarizer.create(createOptions);
  }

  return Summarizer.create({
    ...createOptions,
    monitor(monitor) {
      monitor.addEventListener("downloadprogress", (e) => {
        console.log(
          `Summarizer Download Progress : ${Math.floor(e.loaded * 100)}%`,
        );
      });
    },
  });
};
```

:::

::: details Summarizer.tsx {open}

```tsx
import { useEffect, useRef, useState } from "react";
import { getSummarizer } from "@/utils/summarizer";

export const SummarizerExample = () => {
  const summarizerRef = useRef<Summarizer | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string>("");

  const USE_STREAMING = false;

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      summarizerRef.current?.destroy();
    };
  }, []);

  const handleSummarize = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSummary("");

    const formData = new FormData(e.target as HTMLFormElement);
    const text = formData.get("text") as string;
    const abortController = new AbortController();

    if (!text.trim()) {
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = abortController;
    setIsLoading(true);

    try {
      if (!summarizerRef.current) {
        summarizerRef.current = await getSummarizer();
      }

      if (USE_STREAMING) {
        await summarizeStreaming(text, abortController.signal);
      } else {
        await summarize(text, abortController.signal);
      }
    } catch (error) {
      abortController.abort();
      console.error("Error summarizing text", error);
    } finally {
      setIsLoading(false);
    }
  };

  const summarizeStreaming = async (text: string, signal: AbortSignal) => {
    if (!summarizerRef.current) {
      return;
    }

    const stream = summarizerRef.current.summarizeStreaming(text, { signal });
    const reader = stream.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        setSummary((prev) => prev + value);
      }
    } finally {
      reader.releaseLock();
    }
  };

  const summarize = async (text: string, signal: AbortSignal) => {
    if (!summarizerRef.current) {
      return;
    }

    const result = await summarizerRef.current.summarize(text, { signal });
    setSummary(result);
  };

  return (
    <div>
      <h2>Summarizer</h2>
      <form onSubmit={handleSummarize}>
        <label>
          입력
          <textarea
            name="text"
            rows={6}
            placeholder="요약할 텍스트를 입력하세요..."
            disabled={isLoading}
          />
        </label>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "요약 중..." : "요약하기"}
        </button>
      </form>
      <div>
        <h3>요약 결과</h3>
        {summary ? (
          <div style={{ whiteSpace: "pre-wrap" }}>{summary}</div>
        ) : (
          <p>요약 결과가 여기에 표시됩니다.</p>
        )}
      </div>
    </div>
  );
};
```

:::
