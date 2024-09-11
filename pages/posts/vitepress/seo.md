---
title: 블로그 배포하기
titleTemplate: VitePress & Github Pages
description: VitePress, Github Pages를 통해 배포한 블로그를 구글, 네이버 검색 엔진에 등록하는 방법을 소개합니다.
outline: deep
comment: true
---

# VitePress + Github Pages로 블로그 만들기 - SEO

## 검색 엔진에 블로그 등록하기

**_이 글은 VitePress의 실험적인 기능을 포함합니다_**

---

### Sitemap 생성

Vitepress에서는 [사이트맵 생성](https://vitepress.dev/ko/guide/sitemap-generation)을 지원합니다.

아래와 같이 `/.viteprss/config.mjs`에 sitemap을 작성합니다.

<!-- prettier-ignore -->
```js
export default defineConfig({
  sitemap: { // [!code focus:3]
    hostname: "https://{userName}.github.io/",
  },
});
```

이후에 빌드를 해보면 다음과 같이 `sitemap.xml` 파일이 포함되어 있는 것을 볼 수 있습니다.
<img src="/assets/images/vitepress/seo-1.jpeg" width="30%"></img>

이 사이트맵을 `Google Search Console`과 `Naver 웹마스터 도구`에 등록하면

구글과 네이버의 검색 결과에 내 블로그의 콘텐츠를 노출할 수 있습니다.

### Google 검색 엔진에 등록

[Google Search Console](https://search.google.com/search-console/welcome) 에 점속해서 내 블로그의 URL을 입력합니다.

<img src="/assets/images/vitepress/seo-2.jpeg" width="60%"></img>

입력 후 계속 버튼을 클릭하면 홈페이지의 소유권을 확인하기 위한 화면이 나타납니다.

저는 Google 애널리틱스를 통해 소유권을 인증하겠습니다.

<img src="/assets/images/vitepress/seo-3.jpeg" width="60%"></img>

[구글 애널리틱스](https://analytics.google.com/analytics/web)에 접속해서 계정과 속성을 생성 후, 태그 ID를 확인합니다.

태그 ID를 생성하고 확인하는 설명은 링크로 대체하겠습니다.

> [1.웹사이트 및 앱용 애널리틱스 설정](https://support.google.com/analytics/answer/9304153?hl=ko&ref_topic=14088998&sjid=17674989375840628322-AP)  
> [2.설정 어시스턴스를 사용하여 GA4 속성 구성하기](https://support.google.com/analytics/answer/10110290?hl=ko&ref_topic=14088998&sjid=17674989375840628322-AP)  
> [3.Google 태그 ID 찾기](https://support.google.com/analytics/answer/9539598?hl=ko&ref_topic=14088998&sjid=17674989375840628322-AP)

<br>
태그 ID를 찾았다면, 다음 스크립트를 `/.viteprss/config.mjs`에 삽입합니다.

```js{7,16}
export default defineConfig({
  head: [ // [!code focus:17]
    [
      "script",
      {
        async: "",
        src: "https://www.googletagmanager.com/gtag/js?id={태그 ID}", // 태그 ID
      },
    ],
    [
      "script",
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '{태그 ID}');`, // 태그 ID
    ],
  ],
});
```

배포를 진행한 후, `Google Search Console`으로 돌아가 확인을 누르면 다음과 같은 팝업을 화인할 수 있습니다.
<img src="/assets/images/vitepress/seo-4.jpeg" width="60%"></img>

속성으로 이동 버튼을 클릭해 속성 페이지로 이동합니다.

좌측 메뉴의 Sitemaps 메뉴를 통헤 페이지에 진입한 후, 사이트맵의 주소를 입력합니다.

<img src="/assets/images/vitepress/seo-5.jpeg"></img>

제출이 완료되면, 제출된 사이트맵에 다음과 같이 노출됩니다.

<img src="/assets/images/vitepress/seo-6.jpeg"></img>

며칠 기다리면, 구글 검색에 내 블로그가 노출되는 것을 확인할 수 있습니다.

### Naver 검색 엔진에 등록

[Naver Search Advisor](https://searchadvisor.naver.com/console/board)에 접속해서 내 블로그의 URL을 입력합니다.

<img src="/assets/images/vitepress/seo-8.jpeg"></img>

구글과 마찬가지로 홈페이지의 소유권을 확인하기 위한 화면이 나타납니다.
<img src="/assets/images/vitepress/seo-9.jpeg"></img>

HTML 태그를 통해 소유권을 확인하도록 하겠습니다.

content를 복사해서 `/.viteprss/config.mjs`에 스크립트를 삽입해 줍니다

```js
export default defineConfig({
  head: [ // [!code focus:10]
    ...,
    [
      "meta",
      {
        name: "naver-site-verification",
        content: '{content}',
      },
    ],
  ],
});
```

배포 후 소유확인 버튼을 누르면 다음과 같은 팝업을 확인할 수 있습니다.
<img src="/assets/images/vitepress/seo-10.jpeg" width="60%"></img>

요청 > 사이트맵 제출 메뉴로 이동하여 사이트맵 URL을 입력해 줍니다.
<img src="/assets/images/vitepress/seo-11.jpeg"></img>

며칠 기다리면, 네이버 검색에 내 블로그가 노출되는 것을 확인할 수 있습니다.
