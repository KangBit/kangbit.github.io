---
title: Updates
titleTemplate: CSS
description: Baseline 기준으로 연도별 정리한 CSS 주요 기능 업데이트 내역 (2015~2026).
# outline:
prev: false
next: false
comment: true
---

# CSS

> 연도 기준: **Baseline** (Chrome · Edge · Firefox · Safari 전부 지원).

## 2026

- `@scope` (스타일 적용 범위 한정)
- Container Style Queries (`@container style(--theme: dark)`)
- 이름만 지정하는 컨테이너 쿼리 (`@container card`)
- `field-sizing: content` (폼 컨트롤 내용 맞춤 크기)
- `contrast-color()` (배경 대비 전경색 자동 선택)
- `shape()` (`clip-path`용 선언형 패스)
- `sibling-index()` / `sibling-count()` (형제 순서 기반 계산)
- `progress()` (값 범위를 0~1 진행도로 변환)
- `:open` (열린 상태 선택자 — `details` / `dialog` / `select` / popover)
- 루트 폰트 상대 단위 (`rch` / `rex` / `ric` / `rcap`)
- `::highlight()` (Custom Highlight API)

## 2025

- View Transitions (동일 문서)
- `view-transition-class`
- `::active-view-transition` (뷰 트랜지션 진행 중 스타일링)
- `::details-content` (`<details>` 본문 스타일링)
- `abs()` / `sign()`
- `scrollbar-color`
- `print-color-adjust`
- 맞춤법 / 문법 밑줄 (`text-decoration-line: spelling-error` / `grammar-error`)

## 2024

- `text-wrap: balance`
- `light-dark()`
- `@property` (타입 있는 커스텀 속성)
- `@starting-style` (진입 트랜지션)
- Relative color syntax (`rgb(from ...)`)
- `content-visibility`

## 2023

- Container Queries (`@container`, `cqw` / `cqi` 단위)
- `:has()` (부모 선택자)
- Subgrid
- 광색역 색상 함수 (`oklch()` / `oklab()` / `lab()` / `lch()` / `color()`)
- `color-mix()`
- CSS Nesting (`&` 네이티브 중첩)
- Media Query 범위 구문 (`@media (width >= 600px)`)

## 2022

- Cascade Layers (`@layer`)
- `:focus-visible`
- CSS Scroll Snap (`scroll-snap-type` / `scroll-snap-align`)
- 동적 뷰포트 단위 (`dvh` / `svh` / `lvh`)

## 2021

- Flexbox `gap`
- `aspect-ratio`
- `:is()` / `:where()`
- 논리 속성 (`margin-inline` / `padding-block` / `inset` 등)

## 2020

> 이 해 항목 다수는 Chromium 기반 Edge 79(2020.01)가 마지막으로 지원하며 상호운용이 완성된 케이스입니다.

- `min()` / `max()` / `clamp()`
- `object-fit` / `object-position`
- `prefers-color-scheme`
- `prefers-reduced-motion`
- `:focus-within`
- `mix-blend-mode` / `background-blend-mode`
- `place-items` / `place-content`
- `conic-gradient()`

## 2019

- `position: sticky` (prefix 제거)
- `touch-action`

## 2018

- Variable Fonts (`font-variation-settings`)

## 2017

- CSS Grid Layout
- CSS Custom Properties (변수, `--*` / `var()`)
- Multi-column Layout (`columns`)

## 2016

- CSS `filter` 함수 (`blur()` / `brightness()` / `drop-shadow()` 등)

## 2015

- Flexbox (prefix 제거)
- `@supports` (기능 쿼리)
