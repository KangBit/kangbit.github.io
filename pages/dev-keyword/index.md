---
title: 웹 개발 키워드
description: 웹 개발 학습 키워드 모음입니다.
outline: false
prev: false
next: false
aside: false
---

<div class="study-map">
  <section class="study-category web">
    <p class="study-label">웹</p>
    <div class="study-keywords">
      <a href="/dev-keyword/web#csr">CSR</a>
      <a href="/dev-keyword/web#ssr">SSR</a>
      <a href="/dev-keyword/web#ssg">SSG</a>
      <a href="/dev-keyword/web#isr">ISR</a>
    </div>
  </section>
</div>

<style scoped>
.study-map {
  display: flex;
  flex-direction: column;
  gap: 28px;
  margin-top: 32px;
}

.study-category {
  padding-bottom: 28px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.study-category:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.study-label {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  margin: 0 0 12px;
  color: var(--vp-c-text-1);
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
}

.study-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.study-keywords a {
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

.study-keywords a:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
</style>
