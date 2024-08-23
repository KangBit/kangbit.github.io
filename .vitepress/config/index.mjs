import { defineConfig } from "vitepress";
import path from "path";

import nav from "./nav";
import sidebar from "./sidebar";

// https://vitepress.dev/reference/site-config

export default defineConfig({
  title: "BitPage",
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
