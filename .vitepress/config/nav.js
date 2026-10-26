const homeMenu = { text: "홈", link: "/" };

const bitMenu = { text: "소개", link: "/kangbit/" };

const postMenu = {
  text: "게시글",
  link: "/posts",
};

const learningMenu = {
  text: "학습",
  items: [
    { text: "언어", link: "/learn/languages/javascript" },
    { text: "프론트엔드", link: "/learn/frontend/" },
    { text: "백엔드", link: "/learn/backend/" },
    { text: "주식", link: "/learn/stocks/" },
  ],
};

const devMenu = {
  text: "개발",
  items: [
    {
      items: [
        { text: "Whats New In", link: "/posts/updates" },
        { text: "ESLint", link: "/posts/eslint/settings" },
      ],
    },
  ],
};

const linkMenu = {
  text: "링크 모음",
  items: [
    {
      items: [
        { text: "JS", link: "/posts/links/javascript" },
        { text: "CSS", link: "/posts/links/css" },
      ],
    },
    {
      items: [
        { text: "VUE", link: "/posts/links/vue" },
        { text: "REACT", link: "/posts/links/react" },
      ],
    },
    {
      items: [{ text: "AI", link: "/posts/links/ai" }],
    },
    {
      items: [{ text: "IOS", link: "/posts/links/ios" }],
    },
    {
      items: [{ text: "etc", link: "/posts/links/etc" }],
    },
  ],
};

export default [homeMenu, bitMenu, postMenu, learningMenu, devMenu, linkMenu];
