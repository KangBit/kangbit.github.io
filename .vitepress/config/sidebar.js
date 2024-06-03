const vitePressPages = {
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
        {
          text: "검색엔진에 Blog 등록하기",
          link: "/posts/vitepress/seo",
        },
      ],
    },
  ],
};

const linksPages = {
  "/posts/links/": [
    {
      text: "링크 저장소",
      items: [
        {
          text: "JS",
          link: "/posts/links/javascript",
        },
        {
          text: "TS",
          link: "/posts/links/typescript",
        },
        {
          text: "CSS",
          link: "/posts/links/css",
        },
        {
          text: "Vue",
          link: "/posts/links/vue",
        },
        {
          text: "React",
          link: "/posts/links/react",
        },
        {
          text: "IOS",
          link: "/posts/links/ios",
        },
        {
          text: "etc",
          link: "/posts/links/etc",
        },
      ],
    },
  ],
};

const snippetPages = {
  "/posts/snippet/": [
    {
      text: "Snippets",
      items: [
        {
          text: "Vue",
          link: "/posts/snippet/vue",
        },
        {
          text: "Markdown",
          link: "/posts/snippet/markdown",
        },
      ],
    },
  ],
};

const componentPages = {
  "/posts/component/": [
    {
      text: "Components",
      items: [],
    },
  ],
};

export default {
  ...vitePressPages,
  ...linksPages,
  ...snippetPages,
  ...componentPages,
};
