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

    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" },
    ],
    lastUpdated: true,
  },

  srcExclude: ["**/README.md"],
  base: "/bitpage/",
  rewrites: {
    "pages(/:path)*/(.*)": "(/:path)*/(.*)",
  },
});
