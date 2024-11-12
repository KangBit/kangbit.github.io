import { defineConfig } from "vitepress";
import path from "path";

import nav from "./nav";
import sidebar from "./sidebar";

// https://vitepress.dev/reference/site-config

export default defineConfig({
  title: "BitPage",
  lang: "ko",
  description: "Bit Dev Blog",

  vite: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "../../"),
      },
    },
  },

  // https://vitepress.dev/reference/default-theme-config
  themeConfig: {
    nav: nav,
    sidebar: sidebar,
    socialLinks: [
      // You can add any icon from simple-icons (https://simpleicons.org/)
      { icon: "github", link: "https://github.com/KangBit" },
      { icon: "velog", link: "https://velog.io/@kang-bit/posts" },
      { icon: "kakaotalk", link: "https://open.kakao.com/o/svuLVaug" },
      { icon: "maildotru", link: "mailto:kangbit@kakao.com" },
    ],
    lastUpdated: true,
  },

  srcExclude: ["**/README.md"],
  rewrites: {
    "pages/:slug*": ":slug*",
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
