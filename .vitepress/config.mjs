import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "BitPage",
  description: "Bit Dev Blog",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: "Home", link: "/" }],
    sidebar: {
      "/posts/vitepress/": [
        {
          text: "VitePres + Github Pages",
          items: [
            {
              text: "왜 VitePress인가",
              link: "/posts/vitepress/why-vitepress",
            },
            {
              text: "프로젝트 생성하기",
              link: "/posts/vitepress/create-project",
            },
            {
              text: "Github Pages에 배포하기",
              link: "/posts/vitepress/github-deploy",
            },
          ],
        },
      ],
    },

    socialLinks: [{ icon: "github", link: "https://github.com/KangBit" }],
    lastUpdated: true,
  },

  srcExclude: ["**/README.md"],
  rewrites: {
    "pages(/:path)*/(.*)": "(/:path)*/(.*)",
  },

  sitemap: {
    hostname: "https://kangbit.github.io/",
  },
  head: [
    [
      "script",
      {
        async: "",
        src: "https://www.googletagmanager.com/gtag/js?id=G-P9FSHHKTBN",
      },
    ],
    [
      "script",
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-P9FSHHKTBN');`,
    ],
    [
      "meta",
      {
        name: "naver-site-verification",
        content: "5912e8936a16866a425cfefd2311f36745d4f9f1",
      },
    ],
  ],
});
