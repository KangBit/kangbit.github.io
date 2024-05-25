---
title: 블로그 배포하기
titleTemplate: VitePress & Github Pages
description: 새로운 블로그를 구성하는 데 VitePress를 선택한 이유를 설명합니다.
outline: deep
---

# VitePress + Github Pages로 블로그 만들기 - 소개

## VitePress

2024년 3월 21일 [VitePress](https://vitepress.vuejs.kr/)가 release 되었습니다.  
[VitePress](https://vitepress.vuejs.kr/guide/what-is-vitepress#vitepress%E1%84%85%E1%85%A1%E1%86%AB-%E1%84%86%E1%85%AE%E1%84%8B%E1%85%A5%E1%86%BA%E1%84%8B%E1%85%B5%E1%86%AB%E1%84%80%E1%85%A1)는 빠르고 컨텐츠 중심의 웹사이트를 구축하기 위해 설계된 '정적 사이트 생성기' 입니다.  
개인 블로그 뿐 아니라 팀 블로그를 구성하거나 가이드 문서로 사용하기에도 아주 좋은 도구로 보입니다.

## 왜 VitePress인가

개발자가 아니여도 쉽게 생성할 수 있고,  
개발자라면 더 강력하고 아름다운 정적 사이트를 생성할 수 있습니다.

### 문서

문서가 깔끔하고 번역이 잘 되어있습니다.

### Vite + Vue3 개발자 경험 지원

마크다운 내부에서도 Vue를 사용할 수 있습니다.
Vue3에 익숙한 개발자라면 손쉽게 테마를 커스텀 할 수 있고,
다양한 컴포넌트를 생성해 마크다운 내부에서 사용할 수 있습니다.

### 레이아웃

네비게이션 바, 사이드 바, Anchor aside, 푸터를 쉽게 추가할 수 있습니다.

### 검색

검색 기능을 쉽게 추가할 수 있습니다.
![](https://velog.velcdn.com/images/kang-bit/post/ec750c20-b40f-4b39-a1b4-9836ea78dc07/image.png)

### 코드 블록 기능

하이라이트, 포커싱, 라인 번호, 그룹화 등 다양한 코드 블록 기능을 제공합니다.

```js{4}
export default {
  data () {
    return {
      msg: '강조됨!'
    }
  }
}
```

```js
export default {
  data() {
    return { msg: "포커싱됨!" }; // [!code focus]
  },
};
```

```js
export default {
  data () {
    return {
      msg: '삭제됨' // [!code --]
      msg: '추가됨' // [!code ++]
    }
  }
}
```

::: code-group

```js [file1.js]
return "FILE1";
```

```ts [file2.js]
return "FILE2";
```

:::

### Git 연동 기능

`editLink`를 통해 페이지를 편집하는 링크를 표시할 수 있습니다.
`lastUpdated`를 통해 각 페이지의 마지막 Git 업데이트 타임스탬프를 가져올 수 있습니다.

---

> [VitePress | Vite & Vue로 구동되는 정적 사이트 생성기](https://vitepress.vuejs.kr/)
