const homeMenu = { text: "Home", link: "/" };
const postMenu = {
  text: "Post",
  link: "/posts",
};
const linkMenu = {
  text: "Links",
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

export default [homeMenu, postMenu, linkMenu];
