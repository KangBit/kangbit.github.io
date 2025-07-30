---
title: Document PIP(React)
description: React에서 컴포넌트를 별도의 작은 창(PIP)으로 분리해 띄우는 방법을 소개합니다.
head:
  - - meta
    - name: keywords
      content: react-pip, react-document-pip, document pip, document picture-in-picture, picture-in-picture
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

[react-document-pip](https://www.npmjs.com/package/react-document-pip)를 이용하면, 구현된 컴포넌트를 쉽게 사용할 수 있습니다.

## React에서의 Document PIP

<img src="/assets/images/document-pip/video-pip.jpg" width="80%" class="mb-0"></img>

[Document PIP - HTML](https://kangbit.github.io/posts/document-pip/html.html)에서는 DOM 요소를 직접 선택하여 PIP 창으로 이동시켰습니다.

```javascript
const element = document.getElementById("my-element");
pipWindow.document.body.appendChild(element);
```

하지만 DOM Element만 복사해서는 컴포넌트의 상태나 이벤트를 활용할 수 없습니다.

따라서 아래의 방법을 사용합니다.

## PIP에 새로운 React 앱 마운트하기

PIP 창에 독립적인 React 앱을 렌더링할 수 있습니다.

다음과 같은 모습이 될 것 같습니다.

```javascript
export const useDocumentPIP = (
  width: number,
  height: number,
  component: React.ComponentType
) => {
  const openPIPWindow = async () => {
    const pip = await window.documentPictureInPicture.requestWindow({
      width,
      height,
    });

    const appDiv = pip.document.createElement("div");
    appDiv.id = "pip-app";
    pip.document.body.appendChild(appDiv);

    const root = createRoot(pip.document.getElementById("pip-app")!);
    root.render(React.createElement(component));
  };

  return {
    openPIPWindow,
  };
};
```

이 방법으로도 어떤 컴포넌트에서는 충분할 것 같습니다.

하지만 외부 상태에 영향을 받는 컴포넌트라면 다음 방법을 사용하는 것이 나을 것 같습니다.

## PIP로 Portal 하기

### 목표

[React Portal](https://react.dev/reference/react-dom/createPortal)을 이용하면 동일한 인스턴스에서 컴포넌트를 렌더링할 수 있습니다.

동일한 인스턴스에 존재하기 때문에 Store에도 간단히 접근할 수 있고,

다음과 같이 간단하게 props를 전달하고 event를 청취할 수 있습니다.

<!-- prettier-ignore -->
```jsx
<>
  <MyComponent someProp={someProp} onSomeEvent={handleSomeEvent} />
  {createPortal(
      <MyComponent someProp={someProp} onSomeEvent={handleSomeEvent} />,
      pipRoot
  )}
</>
```

재사용성을 위해 `DocumentPIP` 컴포넌트를 만들고, `children`을 활용해 PIP 창에 렌더링하겠습니다.

이렇게 사용하는 것이 목표입니다.

```jsx
return (
  <DocumentPIP isPipOpen={isPipOpen} size={{ width: 500, height: 200 }}>
    <PipContent />
  </DocumentPIP>
);
```

### PIP 창 열기

먼저 PIP 창을 열고 컴포넌트가 `Portal`될 요소를 준비해야 합니다.

```jsx
function DocumentPIP() {
  const openPIPWindow = async () => {
    const pip = await window.documentPictureInPicture.requestWindow({
      width: 500,
      height: 200,
    });

    const rootDiv = pip.document.createElement("div");
    rootDiv.id = "pip-root";
    pip.document.body.appendChild(rootDiv);
  };
}
```

우리는 이 pip 창이 열렸을 때 다음과 같이 컴포넌트를 조건부로 렌더링해야 합니다.

<!-- prettier-ignore -->
```jsx
function DocumentPIP({ children }) {
  // ...

  if (pipRoot) {
    return createPortal(children, pipRoot);
  }

  return children;
}
```

`pipRoot`가 변경되었을 때 컴포넌트가 다시 렌더링되어야 합니다.

다음과 같이 수정하겠습니다.

<!-- prettier-ignore -->
```jsx
function DocumentPIP({ children, isPipOpen }) {
  const [pipWindow, setPipWindow] = useState(null);

  const openPIPWindow = async () => {
    const pip = await window.documentPictureInPicture.requestWindow({
      width: 500,
      height: 200,
    });

    const rootDiv = pip.document.createElement("div");
    rootDiv.id = "pip-root";
    pip.document.body.appendChild(rootDiv);

    setPipWindow(pip);
  };

  const pipContent = () => {
    const pipRoot = pipWindow?.document.getElementById("pip-root");
    if (!pipRoot || !isPipOpen) {
      return children;
    }

    return createPortal(children, pipRoot);
  };

  return pipContent();
}
```

이제 props의 변화를 감지하고, 그 값에 따라 PIP 창을 열고 닫습니다.

```jsx
function DocumentPIP({ children, isPipOpen }) {
  // ...

  useEffect(() => {
    togglePictureInPicture(isPipOpen);

    return () => {
      togglePictureInPicture(false);
    };
  }, [isPipOpen]);

  const togglePictureInPicture = (open: boolean) => {
    if (open) {
      openPIPWindow();
    } else {
      closePIPWindow();
    }
  };

  const openPIPWindow = async () => {
    // ...
  };

  const closePIPWindow = () => {
    pipWindow.close();
    setPipWindow(null);
  };
}
```

## Styled Component 사용하기

`styled-components`를 사용하고 있다면, 전체 스타일을 `pipWindow`로 복사하지 않아도 됩니다.

`StyleSheetManager`를 이용해 `pipWindow`에 스타일을 주입할 수 있습니다.

```jsx
import { StyleSheetManager } from "styled-components";

const pipContent = () => {
  // ...

  return createPortal(
    <StyleSheetManager target={pipWindow?.document.head}>
      {children}
    </StyleSheetManager>,
    pipRoot
  );
};
```

## 전체 코드

:::details 전체 코드

:::code-group

```jsx [DocumentPIP.jsx]
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { StyleSheetManager } from "styled-components";

import copyStyles from "@/utils/copyStyles";

import type { DocumentPIPProps } from "@/types/pip";

const isPIPSupported = "documentPictureInPicture" in window;

export default function DocumentPIP({
  children,
  isPipOpen,
  size,
  mode = "transfer",
  copyAllStyles = true,
  useStyledComponents = false,
  disallowReturnToOpener = false,
  preferInitialWindowPlacement = false,
  onClose,
}: DocumentPIPProps) {
  const [pipWindow, setPipWindow] = (useState < Window) | (null > null);

  // Effects
  useEffect(() => {
    togglePictureInPicture(isPipOpen);

    return () => {
      togglePictureInPicture(false);
    };
  }, [isPipOpen]);

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
    const pip = await window.documentPictureInPicture.requestWindow({
      width: size?.width || 0,
      height: size?.height || 0,
      disallowReturnToOpener,
      preferInitialWindowPlacement,
    });

    if (copyAllStyles) {
      copyStyles(pip);
    }

    const root = pip.document.createElement("div");
    root.id = "pip-root";
    pip.document.body.appendChild(root);

    pip.addEventListener("pagehide", onClosePIPWindow, { once: true });

    setPipWindow(pip);
  };

  const closePIPWindow = () => {
    if (!pipWindow) {
      return;
    }

    pipWindow.close();
    setPipWindow(null);
  };

  const onClosePIPWindow = () => {
    closePIPWindow();

    if (isPipOpen) {
      onClose();
    }
  };

  const pipContent = () => {
    const pipRoot = pipWindow?.document.getElementById("pip-root");
    if (!pipRoot || !isPipOpen) {
      return children;
    }

    return (
      <>
        {mode === "clone" ? children : null}
        {createPortal(
          useStyledComponents ? (
            <StyleSheetManager target={pipWindow?.document.head}>
              {children}
            </StyleSheetManager>
          ) : (
            children
          ),
          pipRoot
        )}
      </>
    );
  };

  return pipContent();
}
```

:::

## 참고 자료

- [React Portal](https://react.dev/reference/react-dom/createPortal)
- [MDN](https://developer.chrome.com/docs/web-platform/document-picture-in-picture)
- [Chrome for developers](https://developer.chrome.com/blog/document-pip-use-case?hl=ko)
- [Can I Use](https://caniuse.com/mdn-api_documentpictureinpicture)
