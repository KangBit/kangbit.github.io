---
title: Document PIP - Vue
description: Vue에서 컴포넌트를 별도의 작은 창(PIP)으로 분리해 띄우는 방법을 소개합니다.
head:
  - - meta
    - name: keywords
      content: vue-pip, vue-document-pip, document pip, document picture-in-picture, picture-in-picture
comment: true
---

# Document Picture In Picture

::: warning 실험적 기능

Document Picture in Picture API는 아직 실험적 기능입니다. ( 2025-07 )

일부 브라우저에서 동작하지 않을 수 있습니다.

[CanIUse](https://caniuse.com/mdn-api_documentpictureinpicture) 에서 브라우저별 지원 현황을 확인할 수 있습니다.

:::

::: info Secure Context

[Secure Context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) 에서만 사용할 수 있습니다.

:::

[Document PIP - HTML](https://kangbit.github.io/posts/document-pip/html.html)를 먼저 읽어주세요.

[vue-pip](https://www.npmjs.com/package/vue-pip)를 이용하면, 구현된 컴포넌트를 쉽게 사용할 수 있습니다.

## Vue에서의 Document PIP

<img src="/assets/images/document-pip/video-pip.jpg" width="80%" class="mb-0"></img>

[Document PIP - HTML](https://kangbit.github.io/posts/document-pip/html.html)에서는 DOM 요소를 직접 선택하여 PIP 창으로 이동시켰습니다.

```javascript
const element = document.getElementById("my-element");
pipWindow.document.body.appendChild(element);
```

하지만 Dom Element만 복사해서는 컴포넌트의 상태나 이벤트를 활용할 수 없습니다.

따라서 아래의 방법을 사용합니다.

## PIP에 새로운 Vue 앱 마운트하기

PIP 창에 독립적인 Vue 앱을 마운트 할 수 있습니다.

다음과 같은 모습이 될 것 같습니다.

```javascript
export const useDocumentPIP = (
  width: number,
  height: number,
  component: Component
) => {
  //...
  const openPIPWindow = async () => {
    const pip = await window.documentPictureInPicture.requestWindow({
      width,
      height,
    });

    const appDiv = pip.document.createElement('div');
    appDiv.id = 'pip-app';
    pip.document.body.appendChild(appDiv);

    const pipApp = createApp(component);
    pipApp.mount(pip.document.getElementById("pip-app")!);
  };

  return {
    openPIPWindow,
  };
};
```

이 방법으로도 어떤 컴포넌트에서는 충분할 것 같습니다.

하지만 외부 상태에 영향을 받는 컴포넌트라면 다음 방법을 사용하는 것이 나을 것 같습니다.

## PIP로 Teleport 하기

### 목표

[Teleport](https://ko.vuejs.org/guide/built-ins/teleport.html)를 이용하면 동일한 인스턴스에서 컴포넌트를 렌더링 할 수 있습니다.

동일한 인스턴스에 존재하기 때문에 Store에도 간단히 접근할 수 있고,

다음과 같이 간단하게 props를 전달하고 event를 청취할 수 있습니다.

```vue
<template>
  <MyComponent @someEvent="handleSomeEvent" :someProp="someProp" />
  <Teleport :to="pipTarget">
    <MyComponent @someEvent="handleSomeEvent" :someProp="someProp" />
  </Teleport>
</template>
```

재사용성을 위해 `DocumentPip` 컴포넌트를 만들고, `slot`을 활용해 PIP 창에 렌더링하겠습니다.

이렇게 사용하는 것이 목표입니다.

```vue
<template>
  <DocumentPip :isPipOpen="isPipOpen" :size="{ width: 500, height: 200 }">
    <PipContent />
  </DocumentPip>
</template>
```

### PIP 창 열기

먼저 PIP 창을 열고 컴포넌트가 `Teleport`될 요소를 준비해야 합니다.

```vue
<script setup lang="ts">
const openPIPWindow = async () => {
  const pip = await window.documentPictureInPicture.requestWindow({
    width: 500,
    height: 200,
  });

  const rootDiv = pip.document.createElement("div");
  rootDiv.id = "pip-root";
  pip.document.body.appendChild(rootDiv);

  const pipRoot = pip.document.getElementById("pip-root"); // Teleport Target
};
</script>
```

우리는 이 pip 창이 열렸을 때 다음과 같이 컴포넌트를 조건부로 렌더링해야 합니다.

```vue
<template>
  <slot v-if="!pipRoot"></slot>
  <Teleport v-else :to="pipRoot">
    <slot></slot>
  </Teleport>
</template>
```

`pipRoot`가 변경되었을 때 컴포넌트가 다시 렌더링되어야 합니다.

다음과 같이 수정하겠습니다.

```vue
<script setup lang="ts">
const pipWindow = ref<Window | null>(null);
const pipRoot = computed(() => {
  return pipWindow.value?.document.getElementById("pip-root") || null;
});

const openPIPWindow = async () => {
  const pip = await window.documentPictureInPicture.requestWindow({
    width: 500,
    height: 200,
  });

  const rootDiv = pip.document.createElement("div");
  rootDiv.id = "pip-root";
  pip.document.body.appendChild(rootDiv);

  pipWindow.value = pip;
};
</script>
```

이제 props의 변화를 감지하고, 그 값에 따라 PIP 창을 열고 닫습니다.

```vue
<script setup lang="ts">
// ...

watch(
  () => props.isPipOpen,
  (newVal: boolean) => {
    togglePictureInPicture(newVal);
  }
);

const togglePictureInPicture = (isPipOpen: boolean) => {
  if (isPipOpen) {
    openPIPWindow();
  } else {
    closePIPWindow();
  }
};

const openPIPWindow = async () => {
  // ...
};

const closePIPWindow = () => {
  pipWindow.value.close();
  pipWindow.value = null;
};
</script>
```

## 전체 코드

:::details 전체 코드

:::code-group

```vue [DocumentPIP.vue]
<script setup lang="ts">
import { ref, watch, onBeforeUnmount, computed } from "vue";
import loadCDNScripts from "@/utils/loadCDNScripts";
import copyStyles from "@/utils/copyStyles";

import type {
  DocumentPIPProps as Props,
  DocumentPIPEmits as Emits,
} from "@/types/pip";

// Variables
const isPIPSupported = "documentPictureInPicture" in window;

// Props & Emits
const props = withDefaults(defineProps<Props>(), {
  mode: "transfer",
  copyAllStyles: true,
  disallowReturnToOpener: false,
  preferInitialWindowPlacement: false,
});
const emit = defineEmits<Emits>();

// Refs
const pipWindow = ref<Window | null>(null);

// Computed
const pipRoot = computed(() => {
  return pipWindow.value?.document.getElementById("pip-root") || null;
});

const requestWindowParams = computed(() => {
  return {
    width: props.size?.width || 0,
    height: props.size?.height || 0,
    disallowReturnToOpener: props.disallowReturnToOpener,
    preferInitialWindowPlacement: props.preferInitialWindowPlacement,
  };
});

// Methods
const togglePictureInPicture = (open: boolean) => {
  if (!isPIPSupported) {
    console.warn(
      "Document Picture-in-Picture API is not supported in this browser"
    );
    return;
  }

  if (open) {
    openPIPWindow();
  } else {
    closePIPWindow();
  }
};

const openPIPWindow = async () => {
  const pip = await window.documentPictureInPicture.requestWindow(
    requestWindowParams.value
  );

  if (props.copyAllStyles) {
    copyStyles(pip);
  }
  if (props.cdnScripts && props.cdnScripts.length > 0) {
    await loadCDNScripts(pip, props.cdnScripts);
  }

  const root = pip.document.createElement("div");
  root.id = "pip-root";
  pip.document.body.appendChild(root);

  pip.addEventListener("pagehide", onClosePIPWindow, { once: true });

  pipWindow.value = pip;
};

const closePIPWindow = () => {
  if (!pipWindow.value) {
    return;
  }

  pipWindow.value.close();
  pipWindow.value = null;
};

const onClosePIPWindow = () => {
  closePIPWindow();
  if (props.isPipOpen) {
    emit("onClose");
  }
};

// Watches
watch(
  () => props.isPipOpen,
  (newVal: boolean) => {
    togglePictureInPicture(newVal);
  }
);

// LifeCycle
onBeforeUnmount(() => {
  closePIPWindow();
});
</script>

<template>
  <slot v-if="!pipRoot || mode === 'clone'"></slot>

  <Teleport v-if="pipRoot" :to="pipRoot">
    <slot></slot>
  </Teleport>
</template>

<style scoped></style>
```

```ts [pip.ts]
export type PIPMode = "clone" | "transfer";
export type PIPWindowSize = { width: number; height: number };

export type DocumentPIPProps = {
  size?: Partial<PIPWindowSize>;
  mode?: PIPMode;
  copyAllStyles?: boolean;
  isPipOpen: boolean;
  cdnScripts?: string[];
  disallowReturnToOpener?: boolean; // '탭으로 돌아가기' 버튼 숨기기
  preferInitialWindowPlacement?: boolean; // 항상 초기 위치에 설정 크기로 열림 (Chrome 130+)
};
export type DocumentPIPEmits = {
  (e: "onClose"): void;
};
```

```ts [copyStyles.ts]
/**
 * Copy styles from the main window to the PIP window
 * @param targetWindow - The window to copy styles to
 */
const copyStyles = (targetWindow: Window) => {
  [...document.styleSheets].forEach((styleSheet) => {
    try {
      const cssRules = [...styleSheet.cssRules]
        .map((rule) => rule.cssText)
        .join("");
      const style = document.createElement("style");
      style.textContent = cssRules;
      targetWindow.document.head.appendChild(style);
    } catch (error) {
      console.warn("Error copying styles: ", error);

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = styleSheet.type;
      link.media = styleSheet.media.toString();
      link.href = styleSheet.href ?? "";
      targetWindow.document.head.appendChild(link);
    }
  });
};

export default copyStyles;
```

```ts [loadCDNScripts.ts]
/**
 * Load CDN scripts into a target window
 * @param targetWindow - The window to load scripts into
 * @param scriptUrls - Array of CDN script URLs to load
 */
const loadCDNScripts = async (targetWindow: Window, scriptUrls: string[]) => {
  const loadScript = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = targetWindow.document.createElement("script");
      script.src = url;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
      targetWindow.document.head.appendChild(script);
    });
  };

  try {
    await Promise.all(scriptUrls.map(loadScript));
  } catch (error) {
    console.warn("Error loading CDN scripts:", error);
  }
};

export default loadCDNScripts;
```

## 참고 자료

- [Vue Teleport](https://ko.vuejs.org/guide/built-ins/teleport.html)
- [MDN](https://developer.chrome.com/docs/web-platform/document-picture-in-picture)
- [Chrome for developers](https://developer.chrome.com/blog/document-pip-use-case?hl=ko)
- [Can I Use](https://caniuse.com/mdn-api_documentpictureinpicture)
