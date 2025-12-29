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
        {
          text: "댓글 추가하기",
          link: "/posts/vitepress/append-comments",
        },
      ],
    },
  ],
};

const bitPages = {
  "/kangbit/": [
    {
      text: "강빛찬",
      items: [
        {
          text: "소개",
          link: "/kangbit/",
        },
        {
          text: "2022~",
          link: "/kangbit/career2",
        },
        {
          text: "2019~",
          link: "/kangbit/career1",
        },
        {
          text: "개인 프로젝트",
          link: "/kangbit/my-project",
        },
        // {
        //   text: "프로젝트 이미지",
        //   link: "/kangbit/career-image",
        // },
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
          text: "AI",
          link: "/posts/links/ai",
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

const updatesPages = {
  "/posts/updates/": [
    {
      text: "Whats New In",
      items: [
        {
          text: "ECMAScript",
          link: "/posts/updates/ecmascript",
        },
        {
          text: "Vue",
          link: "/posts/updates/vue",
        },
        {
          text: "react",
          link: "/posts/updates/react",
        },
      ],
    },
  ],
};

const documentPipPages = {
  "/posts/document-pip/": [
    {
      text: "Document PIP",
      items: [
        {
          text: "HTML PIP",
          link: "/posts/document-pip/html",
        },
        {
          text: "Vue PIP",
          link: "/posts/document-pip/vue",
        },
        {
          text: "React PIP",
          link: "/posts/document-pip/react",
        },
      ],
    },
  ],
};

const chromeAiPages = {
  "/posts/chrome-ai/": [
    {
      text: "Chrome AI",
      items: [
        {
          text: "소개",
          link: "/posts/chrome-ai/index",
        },
        {
          text: "Language Detector",
          link: "/posts/chrome-ai/language-detector",
        },
        {
          text: "Translater",
          link: "/posts/chrome-ai/translater",
        },
      ],
    },
  ],
};

export default {
  ...vitePressPages,
  ...bitPages,
  ...linksPages,
  ...snippetPages,
  ...componentPages,
  ...updatesPages,
  ...documentPipPages,
  ...chromeAiPages,
};
