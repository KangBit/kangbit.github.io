import { defineConfig } from "vitepress";
import path from "path";

import nav from "./nav";
import sidebar from "./sidebar";

const siteName = "BitPage";
const siteUrl = "https://kangbit.github.io";
const defaultDescription = "Bit Dev Blog";

const socialLinks = [
  // You can add any icon from simple-icons (https://simpleicons.org/)
  { icon: "github", link: "https://github.com/KangBit" },
  { icon: "velog", link: "https://velog.io/@kang-bit/posts" },
  { icon: "kakaotalk", link: "https://open.kakao.com/o/svuLVaug" },
  { icon: "maildotru", link: "mailto:kangbit@kakao.com" },
];

// Markdown 상대 경로를 canonical 경로 규칙으로 정규화합니다.
const toCanonicalPath = (relativePath) => {
  return `/${relativePath}`.replace(/index\.md$/, "").replace(/\.md$/, ".html");
};

// 사이트 기준 절대 URL을 생성합니다.
const toAbsoluteUrl = (path) => {
  return new URL(path, `${siteUrl}/`).toString();
};

// 페이지 메타 태그를 생성하는 함수.
const getSeoHeadItems = ({ canonicalUrl, pageTitle, pageDescription }) => {
  return [
    ["link", { rel: "canonical", href: canonicalUrl }],
    ["meta", { property: "og:url", content: canonicalUrl }],
    ["meta", { property: "og:title", content: pageTitle }],
    ["meta", { property: "og:description", content: pageDescription }],
    ["meta", { property: "twitter:title", content: pageTitle }],
    ["meta", { property: "twitter:description", content: pageDescription }],
  ];
};

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: siteName,
  lang: "ko",
  description: defaultDescription,

  vite: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "../../"),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler", // Sass의 모던 API 사용을 강제
        },
      },
    },
  },

  // https://vitepress.dev/reference/default-theme-config
  themeConfig: {
    nav: nav,
    sidebar: sidebar,
    socialLinks: socialLinks,
    lastUpdated: true,
  },

  srcExclude: ["**/README.md"],
  rewrites: {
    "pages/:slug*": ":slug*",
  },

  sitemap: {
    hostname: `${siteUrl}/`,
    transformItems: (items) => {
      return items.map((item) => {
        item.url = item.url.replace(/\.html$/, "");
        return item;
      });
    },
  },
  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
    [
      "meta",
      { name: "robots", content: "index, follow, max-image-preview:large" },
    ],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:site_name", content: siteName }],
    ["meta", { property: "og:locale", content: "ko_KR" }],
    ["meta", { property: "og:image", content: `${siteUrl}/og-default.svg` }],
    ["meta", { property: "twitter:card", content: "summary_large_image" }],
    [
      "meta",
      { property: "twitter:image", content: `${siteUrl}/og-default.svg` },
    ],
    ["meta", { property: "twitter:title", content: siteName }],
    ["meta", { property: "twitter:description", content: defaultDescription }],
    [
      "script",
      { type: "application/ld+json" },
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: siteName,
        url: `${siteUrl}/`,
        description: defaultDescription,
        inLanguage: "ko-KR",
      }),
    ],
    [
      "script",
      { type: "application/ld+json" },
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        name: "강빛찬",
        url: `${siteUrl}/kangbit/`,
        sameAs: [
          "https://github.com/KangBit",
          "https://velog.io/@kang-bit/posts",
        ],
      }),
    ],
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

  /**
   * 각 페이지의 메타 태그를 주입하는 함수.
   * https://vitepress.dev/reference/default-theme-transform-page-data
   */
  transformPageData(pageData) {
    // 페이지별 canonical/OG/Twitter 생성에 사용할 기본 값들을 계산합니다.
    const canonicalPath = toCanonicalPath(pageData.relativePath);
    const canonicalUrl = toAbsoluteUrl(canonicalPath);
    const pageTitle = pageData.title
      ? `${pageData.title} | ${siteName}`
      : siteName;
    const pageDescription = pageData.description ?? defaultDescription;

    const seoHeadItems = getSeoHeadItems({
      canonicalUrl: canonicalUrl,
      pageTitle: pageTitle,
      pageDescription: pageDescription,
    });

    pageData.frontmatter.head ??= [];
    for (const seoHeadItem of seoHeadItems) {
      pageData.frontmatter.head.push(seoHeadItem);
    }

    // 글 상세 페이지에만 Article 구조화 데이터를 추가합니다.
    const isArticlePage =
      pageData.relativePath.startsWith("pages/posts/") &&
      !pageData.relativePath.endsWith("/index.md");

    if (isArticlePage) {
      pageData.frontmatter.head.push([
        "script",
        { type: "application/ld+json" },
        JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: pageData.title ?? siteName,
          description: pageDescription,
          image: toAbsoluteUrl("/og-default.svg"),
          inLanguage: "ko-KR",
          mainEntityOfPage: canonicalUrl,
          author: {
            "@type": "Person",
            name: "Kangbit",
            url: `${siteUrl}/kangbit/`,
          },
          publisher: {
            "@type": "Organization",
            name: siteName,
            logo: {
              "@type": "ImageObject",
              url: `${siteUrl}/favicon.ico`,
            },
          },
        }),
      ]);
    }
  },
});
