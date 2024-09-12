---
title: 블로그 배포하기
titleTemplate: VitePress & Github Pages
description: VitePress로 생성한 프로젝트에 댓글 기능을 추가하는 방법을 소개합니다.
outline: deep
comment: true
---

# VitePress + Github Pages 블로그에 댓글 추가하기

## 블로그에 댓글 추가하기

[utterances](https://github.com/utterance)를 이용해서 블로그에 댓글 기능을 추가하는 방법을 소개합니다.

## utterances

utterances는 댓글을 등록하고 검색하는 데 GitHub Issue를 이용합니다.

페이지에 대응하는 이슈를 [utterances-bot](https://github.com/utterances-bot)을 통해 생성하고,

[Github Rest API](https://docs.github.com/ko/rest)를 이용해 이슈의 댓글 목록을 가져와서 노출합니다.

## Github App 설치

이슈를 연결할 깃허브 공개 저장소가 하나 필요합니다.

댓글 전용으로 저장소를 생성해도 좋으나, 저는 블로그 프로젝트의 저장소를 연결해 사용했습니다.

공개 저장소를 하나 정한 후, Github에 [utterances app](https://github.com/apps/utterances)을 설치합니다.

## utterances script 생성

[utteranc.es](https://utteranc.es/)의 가이드를 따르다 보면,

다음과 같은 script tag를 페이지에 삽입하도록 가이드하고 있습니다.

```html
<script
  src="https://utteranc.es/client.js"
  repo="[ENTER REPO HERE]"
  issue-term="pathname"
  theme="github-dark"
  crossorigin="anonymous"
  async
></script>
```

하지만 Vue에는 특정 페이지/컴포넌트에 스크립트를 추가하는 구체적인 방법이 없고,

실제로 스크립트를 삽입해 보면 동작하지 않는 것을 확인할 수 있습니다.

따라서 DOM 조작을 통해 `script` 태그를 직접 생성해서 추가해야 합니다.

## UtterancComment 컴포넌트

DOM에 script 태그를 추가하는 `UtterancComment`컴포넌트를 작성합니다.

```vue
<script setup>
import { onMounted } from "vue";

// Methods
const appendUtteranc = () => {
  let script = document.createElement("script");

  script.src = "https://utteranc.es/client.js";
  script.async = true;
  script.crossOrigin = "anonymous";

  script.setAttribute("repo", "ENTER REPO HERE");
  script.setAttribute("issue-term", "pathname");
  script.setAttribute("label", "Comment");
  script.setAttribute("theme", "photon-dark");

  document.querySelector("#comments-container").appendChild(script);
};

// LifeCycle
onMounted(() => {
  appendUtteranc();
});
</script>

<template>
  <div id="comments-container"></div>
</template>
```

댓글을 노출하고 싶은 페이지에 컴포넌트를 직접 삽입할 수 있지만

[Layout Slots](https://vitepress.dev/guide/extending-default-theme#layout-slots)을 이용하면 좀더 손쉽게 원하는 페이지에 댓글을 노출할 수 있을 것 같습니다.

## Layout에 적용하기

`BaseLayout.vue` 를 작성하고, vitepress의 Layout에 적용합니다.

```bash
├── .vitepress
│   └── theme
│        ├── BaseLayout.vue
│        ├── index.js
│        └── style.css
├── components
│   └── UtterancComment.vue
```

::: code-group

```js [theme/index.js]
// https://vitepress.dev/guide/custom-theme
import DefaultTheme from "vitepress/theme";
import BaseLayout from "./BaseLayout.vue";
import "./style.css";

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  Layout: BaseLayout,
  enhanceApp({ app, router, siteData }) {
    // ...
  },
};
```

```vue [theme/BaseLayout.vue]
<script setup>
import { useData } from "vitepress";
import DefaultTheme from "vitepress/theme";
import UtterancComment from "@/components/UtterancComment.vue";

const { Layout } = DefaultTheme;

// Composable
const { frontmatter, page } = useData();
</script>

<template>
  <Layout>
    <template #doc-after>
      <UtterancComment
        v-if="frontmatter.comment"
        :key="page.relativePath"
      ></UtterancComment>
    </template>
  </Layout>
</template>
```

```md [markdown.md]
---
title: ...
titleTemplate: ...
comment: true
---

Markdown Contents
```

:::

## 테마 변경 대응하기

블로그의 색상 테마를 변경했을 때 댓글의 테마를 변경하고 싶습니다.

우선, Vitepress 색상 테마에 따라 댓글의 테마를 설정하도록 변경합니다.

::: code-group

```vue [BaseLayout.vue]
<script setup>
import { computed } from "vue";
import { useData } from "vitepress";
import DefaultTheme from "vitepress/theme";
import UtterancComment from "@/components/UtterancComment.vue";

const { Layout } = DefaultTheme;

const COMMENT_THEME_DARK = "photon-dark";
const COMMENT_THEME_LIGHT = "github-light";

// Composable
const { frontmatter, page, isDark } = useData();

// Computed
const commentTheme = computed(() => {
  return isDark.value ? COMMENT_THEME_DARK : COMMENT_THEME_LIGHT;
});
</script>

<template>
  <Layout>
    <template #doc-after>
      <UtterancComment
        v-if="frontmatter.comment"
        :key="page.relativePath"
        :theme="commentTheme"
      ></UtterancComment>
    </template>
  </Layout>
</template>
```

```vue [UtterancComment.vue]
<script setup>
import { onMounted } from "vue";

// Props
const props = defineProps(["theme"]);

// Methods
const appendUtteranc = () => {
  let script = document.createElement("script");

  script.src = "https://utteranc.es/client.js";
  script.async = true;
  script.crossOrigin = "anonymous";

  script.setAttribute("repo", "ENTER REPO HERE");
  script.setAttribute("issue-term", "pathname");
  script.setAttribute("label", "Comment");
  script.setAttribute("theme", props.theme);

  document.querySelector("#comments-container").appendChild(script);
};

// LifeCycle
onMounted(() => {
  appendUtteranc();
});
</script>

<template>
  <div id="comments-container" class="comments-container"></div>
</template>

<style scoped>
.comments-container {
  margin-top: 40px;
}
</style>
```

:::

하지만 외부 페이지인 댓글 화면은 테마 변경에 대해 반응하지 않습니다.

다음과 같이 색상 변경을 감지하여 iframe에 테마를 변경해달라는 메세지를 전달합니다.

::: code-group

```vue [UtterancComment.vue]
<script setup>
import { onMounted, watch } from "vue";

// ...

// Watch
watch(
  () => props.theme,
  () => {
    const iframe = document.querySelector(".utterances-frame");

    const targetOrigin = "https://utteranc.es";
    const message = {
      type: "set-theme",
      theme: props.theme,
    };

    iframe?.contentWindow?.postMessage(message, targetOrigin);
  }
);
</script>
```

:::

---

## Reference

[utterances](https://github.com/utterance)<br>
[issue search API](https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28#search-issues-and-pull-requests)<br>
[issue comment create API](https://docs.github.com/ko/rest/issues/comments?apiVersion=2022-11-28#create-an-issue-comment)
