const homeMenu = { text: "홈", link: "/" };

const bitMenu = { text: "소개", link: "/kangbit/" };

const postMenu = {
  text: "게시글",
  link: "/posts",
};

const devMenu = {
  text: "개발",
  items: [
    {
      items: [
        { text: "Component", link: "/posts/component" },
        { text: "Snippet", link: "/posts/snippet" },
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
        { text: "CSS", link: "/posts/links/typescript" },
      ],
    },
    {
      items: [
        { text: "VUE", link: "/posts/links/vue" },
        { text: "REACT", link: "/posts/links/react" },
      ],
    },
    {
      items: [{ text: "IOS", link: "/posts/links/ios" }],
    },
    {
      items: [{ text: "etc", link: "/posts/links/etc" }],
    },
  ],
};

export default [homeMenu, bitMenu, postMenu, devMenu, linkMenu];
