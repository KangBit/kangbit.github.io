---
title: 블로그 배포하기
titleTemplate: VitePress & Github Pages
description: VitePress를 이용해 블로그 홈페이지를 생성하는 방법을 소개합니다.
head:
  - - meta
    - name: keywords
      content: Vitepress, Vitepress Blog, Vitepress Github, Blog, Github pages
outline: deep
comment: true
---

# VitePress + Github Pages로 블로그 만들기 - 생성

## 설치 환경

```
Node version: v20.11.1
Vitepress version: v1.1.0
```

## 프로젝트 생성

프로젝트 폴더를 생성한 후 폴더 내부에서 터미널을 통해 다음 명령어를 입력합니다.
최신 버전의 vitepress 프로젝트를 생성합니다.

```bash
$ npx vitepress init
```

프로젝트를 생성하기 위한 몇가지 설정을 미리 해주어야 합니다.

설정 파일과 컨텐츠들이 위치할 폴더를 정합니다.
현재 디렉토리로 설정합니다.

```bash
◇  Where should VitePress initialize the config?
│  ./
```

블로그의 타이틀을 정합니다.
설정 파일에서 손쉽게 수정할 수 있으므로 무엇으로 하든 무방합니다.

```bash
◇  Site title:
│  MyBlog
```

블로그의 설명을 정합니다. ( html의 meta 태그로 렌더링 됩니다. )
설정 파일에서 손쉽게 수정할 수 있으므로 무엇으로 하든 무방합니다.

```bash
◇  Site description:
│  My VitePress Blog
```

테마를 커스텀해서 사용할지 말지 정합니다.
저는 배포 후에 커스텀할 생각이므로 두번째 옵션을 선택했습니다.

```bash
◇  Theme:
│  ○ Default Theme
│  ● Default Theme + Customization
│  ○ Custom Theme
```

개인 블로그용이라면 타입스크립트까지는 필요하지 않을 것 같습니다.

```bash
◇  Use TypeScript for config and theme files?
│  No
```

프로젝트를 실행, 빌드, 프리뷰하기 위한 스크립트를 자동으로 작성하도록 합니다.

```bash
◇  Add VitePress npm scripts to package.json?
│  Yes
```

프로젝트를 완료하면 다음과 같은 팁이 나타나는데,
지금은 잊어도 좋습니다.

```bash
Tips:
- Since you've chosen to customize the theme, you should also explicitly install vue as a dev dependency.
```

## 프로젝트 실행

프로젝트 생성이 완료되었습니다.
이제 다음과 같은 구조로 프로젝트가 생성되었을 겁니다.

이제 터미널에서 프로젝트를 실행해 보겠습니다.

```bash
$ npm run docs:dev
```

다음과 같은 메세지가 나타나며 실행에 실패했다면, 정상입니다.

```bash
sh: vitepress: command not found
```

프로젝트에 vitepress를 설치해 주겠습니다.

```bash
$ npm install -D vitepress
```

다시 프로젝트를 실행하면

```bash
$ npm run docs:dev
```

프로젝트가 실행되고, 접속할 수 있는 주소가 나타납니다.

```bash
  vitepress v1.1.4

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

브라우저에서 해당 주소로 접속하면, 성공적으로 실행된 화면을 볼 수 있습니다.

## 폴더 구조 변경

생성된 프로젝트의 폴더 구조를 보면, 다음과 같습니다.

<img src="/assets/images/vitepress/create-project-1.jpeg" width="40%" alt="Vitepress 초기 폴더"></img>

`.md` 확장자의 파일들은 블로그에 추가될 페이지들입니다.
최상위 디렉토리에 위치할 경우 페이지가 늘어날수록 관리하기 힘들 수 있습니다.
폴더를 만들어 넣어주도록 하겠습니다.
저는 pages로 폴더를 만들었습니다.

<img src="/assets/images/vitepress/create-project-2.jpeg" width="40%" alt="Vitepress 폴더 설정"></img>

하지만 폴더 구조를 수정하니, 페이지에 접근할 수 없습니다.

<img src="/assets/images/vitepress/create-project-3.jpeg" width="50%" alt="Vitepress 폴더 설정 UI 오류"></img>

페이지의 위치가 변경되었음을 프로젝트에 알려주어야 합니다.
설정 파일인 `/.viteprss/config.mjs` 에 `rewrites`을 추가해 주면,

```js
export default defineConfig({
...
  rewrites: {
    "pages(/:path)*/(.*)": "(/:path)*/(.*)",
  },
...
})
```

페이지에 다시 접근할 수 있습니다.

<img src="/assets/images/vitepress/create-project-4.jpeg" width="50%" alt="Vitepress 폴더 설정 UI 확인"></img>

---

> [VitePress | Vite & Vue로 구동되는 정적 사이트 생성기](https://vitepress.dev/ko/)
