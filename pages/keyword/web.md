---
title: 웹
description: 웹 학습 키워드 설명입니다.
outline: false
prev: false
next: false
---

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const DEFAULT_SLUG = "csr";

const keywords = [
  {
    slug: "csr",
    label: "CSR",
    description:
      "CSR은 Client Side Rendering의 약자로, 브라우저가 JavaScript를 실행해 화면을 구성하는 방식입니다. 초기 HTML은 비교적 단순하고, 이후 데이터 요청과 라우팅, 화면 갱신을 클라이언트에서 처리합니다.",
  },
  {
    slug: "ssr",
    label: "SSR",
    description:
      "SSR은 Server Side Rendering의 약자로, 요청 시점에 서버가 HTML을 만들어 브라우저에 전달하는 방식입니다. 초기 화면을 빠르게 보여주고 검색 엔진이 내용을 파악하기 쉬운 장점이 있습니다.",
  },
  {
    slug: "ssg",
    label: "SSG",
    description:
      "SSG는 Static Site Generation의 약자로, 빌드 시점에 HTML을 미리 생성해 정적 파일로 제공하는 방식입니다. 내용 변경이 잦지 않은 페이지에서 빠른 응답과 안정적인 배포에 유리합니다.",
  },
  {
    slug: "isr",
    label: "ISR",
    description:
      "ISR은 Incremental Static Regeneration의 약자로, 정적 페이지를 제공하면서 일정 조건에 따라 서버에서 페이지를 다시 생성하는 방식입니다. 정적 배포의 성능과 데이터 갱신을 함께 가져가려는 전략입니다.",
  },
];

const selectedSlug = ref(DEFAULT_SLUG);

const selectedKeyword = computed(() => {
  const keyword = keywords.find((item) => {
    return item.slug === selectedSlug.value;
  });

  if (keyword) {
    return keyword;
  }

  return keywords[0];
});

function isActive(slug) {
  return selectedSlug.value === slug;
}

function selectKeyword(slug) {
  selectedSlug.value = slug;
}

function syncSelectedSlug() {
  const hash = window.location.hash.replace("#", "");
  const hasKeyword = keywords.some((keyword) => {
    return keyword.slug === hash;
  });

  if (hasKeyword) {
    selectedSlug.value = hash;
    return;
  }

  selectedSlug.value = DEFAULT_SLUG;
}

onMounted(() => {
  syncSelectedSlug();
  window.addEventListener("hashchange", syncSelectedSlug);
});

onBeforeUnmount(() => {
  window.removeEventListener("hashchange", syncSelectedSlug);
});
</script>

<nav class="keyword-nav" aria-label="웹 키워드">
  <a
    v-for="keyword in keywords"
    :key="keyword.slug"
    :class="{ active: isActive(keyword.slug) }"
    :href="'#' + keyword.slug"
    @click="selectKeyword(keyword.slug)"
  >
    {{ keyword.label }}
  </a>
</nav>

<section :id="selectedKeyword.slug" class="keyword-section">
  <h2>{{ selectedKeyword.label }}</h2>
  <p>{{ selectedKeyword.description }}</p>
</section>

<style scoped>
.keyword-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 8px 0 28px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.keyword-nav a {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}

.keyword-nav a:hover,
.keyword-nav a.active {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.keyword-section {
  margin-bottom: 18px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  scroll-margin-top: 96px;
}

.keyword-section h2 {
  margin: 0 0 8px;
  border-top: 0;
  padding-top: 0;
  color: var(--vp-c-text-1);
  font-size: 18px;
  line-height: 1.4;
}

.keyword-section p {
  margin: 0;
  color: var(--vp-c-text-2);
  line-height: 1.8;
}
</style>
