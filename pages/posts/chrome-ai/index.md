---
title: Chrome Built-in AI
description: Chrome Built-in AI API를 소개합니다.
head:
  - - meta
    - name: keywords
      content: Chrome, AI, Chrome AI API, Built-in AI, Chrome Built-in AI
comment: true
---

# Chrome Built-in AI

## 소개

Chrome 브라우저에는 AI가 내장되어 있으며, API를 통해 AI 기반 작업을 실행할 수 있도록 지원합니다.

Google은 이러한 API가 모든 브라우저에서 작동하도록 표준화하기 위해 노력하고 있습니다.

## 장점

자체 AI 모델을 배포하거나 관리할 필요 없이 AI 기반 기능을 제공할 수 있습니다.

사용자의 브라우저에서 실행되고 추론을 실행하기 때문에

지연 시간 감소, 사용자 개인 정보 보호 강화, 오프라인 액세스 등의 이점을 누릴 수 있습니다.

## API 종류

개발 단계에 따라 사용할 수 있는 여러 API가 있습니다.

일부 API는 Chrome 안정화 버전에 있지만,

일부는 오리진 트라이얼에서 모든 개발자가 사용할 수 있고,

일부는 초기 미리보기 프로그램 (EPP) 참여자만 사용할 수 있습니다.

| API               | 설명                     | 웹              | 확장 프로그램   |
| ----------------- | ------------------------ | --------------- | --------------- |
| Translator        | 번역 API                 | Chrome 138      | Chrome 138      |
| Language Detector | 언어 감지 API            | Chrome 138      | Chrome 138      |
| Summarizer        | 요약 API                 | Chrome 138      | Chrome 138      |
| Writer            | 글쓰기 API               | 오리진 트라이얼 | 오리진 트라이얼 |
| Rewriter          | 텍스트 수정 API          | 오리진 트라이얼 | 오리진 트라이얼 |
| Prompt            | Gemini Nano 프롬프트 API | 오리진 트라이얼 | Chrome 138      |
| Proofreader       | 텍스트 교정 API          | 오리진 트라이얼 | 오리진 트라이얼 |

## 하드웨어 요구사항

일부 API는 휴대기기에서 작동하지 않으며

운영체제나 저장소 용량, GPU 또는 CPU, 네트워크 조건을 충족해야 할 수 있습니다.

이 조건은 [여기서](https://developer.chrome.com/docs/ai/get-started?hl=ko#hardware) 확인할 수 있습니다.

## 주의사항

### 특정 용도에 맞게 만들기

내장 AI는 서버에서 실행되는 보통의 AI보다 작습니다.

특정 작업에서는 서버 측 모델보다 성능이 우수할 수 있지만,

일반적인 작업에서는 성능이 떨어질 수 있습니다.

### 다운로드 크기 고려하기

AI 모델은 크기가 커서 모바일 데이터와 저장 공간을 많이 사용할 수 있습니다.

### 상호작용 필요

내장 AI API를 지원하지만 모델이 아직 다운로드되지 않은 경우,

모델을 다운로드 하기 위해서는 페이지 로드가 완료된 후 사용자가 페이지와 직접 상호작용해야 합니다.

이러한 상호작용 없이 모델을 다운로드 하려고 하면 다음과 같은 오류가 발생할 수 있습니다.

```bash
NotAllowedError: Requires a user gesture when availability is "downloading" or "downloadable"
```

## 참고

- [AI on Chrome](https://developer.chrome.com/docs/ai/built-in?hl=ko)
