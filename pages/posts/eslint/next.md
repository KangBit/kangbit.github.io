---
title: "@next/eslint-plugin-next"
description: Next.js 공식 ESLint 플러그인 규칙을 한국어로 정리합니다.
head:
  - - meta
    - name: keywords
      content: "ESLint, Next.js, @next/eslint-plugin-next"
comment: true
---

# @next/eslint-plugin-next

::: info
이 문서는 ChatGPT 5.5를 통해 작성되었습니다.
:::

기준일: 2026-04-29  
기준 버전: `@next/eslint-plugin-next@16.2.4`  
출처: [npm @next/eslint-plugin-next](https://www.npmjs.com/package/@next/eslint-plugin-next), 패키지 배포본의 `rules` 메타데이터

## 규칙 목록

| 규칙                                            | 설명                                                                                              |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `google-font-display`                           | Google Fonts 사용 시 `font-display` 동작을 강제합니다.                                            |
| `google-font-preconnect`                        | Google Fonts 사용 시 `preconnect` 설정을 요구합니다.                                              |
| `inline-script-id`                              | inline content가 있는 `next/script` 컴포넌트에 `id` 속성을 요구합니다.                            |
| `next-script-for-ga`                            | Google Analytics나 Tag Manager inline script 대신 `@next/third-parties/google` 사용을 권장합니다. |
| `no-assign-module-variable`                     | `module` 변수에 값을 할당하지 못하게 합니다.                                                      |
| `no-async-client-component`                     | Client Component를 `async` 함수로 선언하지 못하게 합니다.                                         |
| `no-before-interactive-script-outside-document` | `next/script`의 `beforeInteractive` 전략을 `pages/_document.js` 밖에서 쓰지 못하게 합니다.        |
| `no-css-tags`                                   | 수동 stylesheet 태그 사용을 금지합니다.                                                           |
| `no-document-import-in-page`                    | `pages/_document.js` 밖에서 `next/document`를 import하지 못하게 합니다.                           |
| `no-duplicate-head`                             | `pages/_document.js`에서 `<Head>`를 중복 사용하지 못하게 합니다.                                  |
| `no-head-element`                               | 직접 `<head>` 요소를 사용하지 못하게 합니다.                                                      |
| `no-head-import-in-document`                    | `pages/_document.js`에서 `next/head`를 사용하지 못하게 합니다.                                    |
| `no-html-link-for-pages`                        | 내부 Next.js 페이지 이동에 일반 `<a>` 요소를 쓰지 않도록 합니다.                                  |
| `no-img-element`                                | LCP와 대역폭 최적화를 위해 일반 `<img>` 요소 사용을 경고합니다.                                   |
| `no-page-custom-font`                           | 특정 페이지에만 custom font를 넣는 패턴을 금지합니다.                                             |
| `no-script-component-in-head`                   | `next/head` 안에서 `next/script`를 사용하지 못하게 합니다.                                        |
| `no-styled-jsx-in-document`                     | `pages/_document.js`에서 `styled-jsx` 사용을 금지합니다.                                          |
| `no-sync-scripts`                               | 동기 script 사용을 금지합니다.                                                                    |
| `no-title-in-document-head`                     | `next/document`의 `Head` 안에서 `<title>`을 쓰지 못하게 합니다.                                   |
| `no-typos`                                      | Next.js 데이터 fetching 함수 이름의 흔한 오타를 금지합니다.                                       |
| `no-unwanted-polyfillio`                        | Polyfill.io 중복 polyfill 사용을 방지합니다.                                                      |
