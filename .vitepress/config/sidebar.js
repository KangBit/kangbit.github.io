const vitePressPages = {
  "/posts/vitepress/": [
    {
      text: "VitePress + Github Pages",
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
          text: "CSS",
          link: "/posts/updates/css",
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

const eslintPages = {
  "/posts/eslint/": [
    {
      text: "ESLint",
      items: [
        {
          text: "eslint/js",
          link: "/posts/eslint/settings",
        },
        {
          text: "stylistic/eslint-plugin",
          link: "/posts/eslint/stylistic",
        },
        {
          text: "typescript-eslint",
          link: "/posts/eslint/typescript",
        },
        {
          text: "eslint-plugin-react",
          link: "/posts/eslint/react",
        },
        {
          text: "eslint-plugin-react-hooks",
          link: "/posts/eslint/react-hooks",
        },
        {
          text: "next/eslint-plugin-next",
          link: "/posts/eslint/next",
        },
        {
          text: "eslint-plugin-vue",
          link: "/posts/eslint/vue",
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
        {
          text: "Summarizer",
          link: "/posts/chrome-ai/summarizer",
        },
      ],
    },
  ],
};

const codexAppPages = {
  "/posts/codex-app/": [
    {
      text: "Codex App",
      items: [
        {
          text: "플러그인 114선",
          link: "/posts/codex-app/plugins",
        },
        {
          text: "스킬 8선",
          link: "/posts/codex-app/skills",
        },
      ],
    },
  ],
};

const devKeywordPages = {
  "/keyword/": [
    {
      text: "개발 키워드",
      items: [
        {
          text: "웹",
          link: "/keyword/web",
        },
        {
          text: "JS",
          link: "/keyword/js",
        },
        {
          text: "TS",
          link: "/keyword/ts",
        },
        {
          text: "Vue",
          link: "/keyword/vue",
        },
        {
          text: "React",
          link: "/keyword/react",
        },
        {
          text: "Next",
          link: "/keyword/next",
        },
      ],
    },
  ],
};

export default {
  "/learn/stocks/": [
    {
      text: "주식 학습",
      items: [{ text: "로드맵", link: "/learn/stocks/" }],
    },
  ],
  "/learn/languages/": [
    {
      text: "JavaScript",
      collapsed: true,
      items: [
        { text: "로드맵", link: "/learn/languages/javascript/" },
        { text: "01. 실행 환경과 기본 문법", link: "/learn/languages/javascript/basics" },
        { text: "02. 함수와 데이터 처리", link: "/learn/languages/javascript/functions" },
        { text: "03. 스코프와 객체 모델", link: "/learn/languages/javascript/scope" },
        { text: "04. 비동기 처리", link: "/learn/languages/javascript/async" },
        { text: "05. 모듈과 검증", link: "/learn/languages/javascript/modules" },
      ],
    },
    {
      text: "TypeScript",
      collapsed: true,
      items: [
        { text: "로드맵", link: "/learn/languages/typescript/" },
        { text: "01. 준비와 기본 타입", link: "/learn/languages/typescript/basics" },
        { text: "02. 데이터 모델과 함수", link: "/learn/languages/typescript/models" },
        { text: "03. 유니온과 타입 좁히기", link: "/learn/languages/typescript/narrowing" },
        { text: "04. 재사용 가능한 타입", link: "/learn/languages/typescript/generics" },
        { text: "05. 프로젝트 적용과 경계 검증", link: "/learn/languages/typescript/boundaries" },
      ],
    },
    {
      text: "Python",
      collapsed: true,
      items: [
        { text: "로드맵", link: "/learn/languages/python/" },
        { text: "01. 실행 환경과 기본 문법", link: "/learn/languages/python/basics" },
        { text: "02. 컬렉션과 함수", link: "/learn/languages/python/collections" },
        { text: "03. 파일과 예외 처리", link: "/learn/languages/python/files" },
        { text: "04. 모듈과 객체", link: "/learn/languages/python/modules" },
        { text: "05. 타입 힌트와 테스트", link: "/learn/languages/python/typing" },
      ],
    },
    {
      text: "Java",
      collapsed: true,
      items: [
        { text: "로드맵", link: "/learn/languages/java/" },
        { text: "01. 실행 환경과 기본 문법", link: "/learn/languages/java/basics" },
        { text: "02. 클래스와 객체", link: "/learn/languages/java/classes" },
        { text: "03. 컬렉션과 제네릭", link: "/learn/languages/java/collections" },
        { text: "04. 예외와 null 처리", link: "/learn/languages/java/exceptions" },
        { text: "05. 람다, 스트림과 입출력", link: "/learn/languages/java/streams" },
        { text: "06. 동시성, 빌드와 테스트", link: "/learn/languages/java/concurrency" },
      ],
    },
    {
      text: "Go",
      collapsed: true,
      items: [
        { text: "로드맵", link: "/learn/languages/go/" },
        { text: "01. 실행 환경과 기본 문법", link: "/learn/languages/go/basics" },
        { text: "02. 데이터 구조와 메모리", link: "/learn/languages/go/data" },
        { text: "03. 메서드와 인터페이스", link: "/learn/languages/go/interfaces" },
        { text: "04. 오류 처리와 입출력", link: "/learn/languages/go/errors" },
        { text: "05. 동시성과 테스트", link: "/learn/languages/go/concurrency" },
      ],
    },
  ],
  "/learn/frontend/": [
    {
      text: "프론트엔드 학습",
      items: [
        { text: "로드맵", link: "/learn/frontend/" },
      ],
    },
  ],
  "/learn/backend/": [
    {
      text: "백엔드 학습",
      items: [
        { text: "로드맵", link: "/learn/backend/" },
      ],
    },
  ],
  ...vitePressPages,
  ...bitPages,
  ...linksPages,
  ...updatesPages,
  ...eslintPages,
  ...documentPipPages,
  ...chromeAiPages,
  ...codexAppPages,
  ...devKeywordPages,
};
