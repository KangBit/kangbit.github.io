---
title: 경력
# titleTemplate:
# description:
outline: 2
prev: false
next: false
---

# 개인 프로젝트

## [pip-tools](https://www.pip-tools.com/tools)

<Badge type='tip' text='Next 16' />
<Badge type='tip' text='React 19' />
<Badge type='info' text='typescript' />
<Badge type='info' text='Tailwind CSS' />

:::details 상세 {open}

Document PIP를 활용해 작은 독립 창에서 사용할 수 있는 웹 도구들을 제공하는 서비스입니다.

Color Picker가 다른 윈도우 위에 항상 떠있으면 좋겠다는 생각에서 시작했고,

이후 크롬 내장 AI를 활용한 번역기처럼 멀티태스킹에 어울리는 도구들을 확장했습니다.

도구 화면을 단순히 나열하는 데 그치지 않고, 각 도구를 PIP 창에서 독립적으로 사용할 수 있도록 화면 구조와 상태 흐름을 설계했습니다.

검색엔진 최적화와 서버 액션을 통한 서버 자원 활용을 고려해 Next.js 기반으로 구현했으며,

Vercel 배포 환경을 활용해 빠르게 실험하고 개선할 수 있는 구조로 운영하고 있습니다.

:::

## Vue Document PIP ([vue-pip](https://www.npmjs.com/package/vue-pip))

<Badge type='tip' text='Vue3' />
<Badge type='info' text='typescript' />

:::details 상세 {open}

Document PIP 창을 Vue 3에서 쉽게 사용할 수 있도록 만든 컴포넌트 라이브러리입니다.

반복적으로 작성해야 하는 PIP 창 생성, 콘텐츠 이동, 닫힘 처리, 지원 여부 확인 로직을 컴포넌트 단위로 추상화했습니다.

사용자는 기존 Vue 컴포넌트를 크게 바꾸지 않고 PIP 창으로 분리할 영역만 선언할 수 있도록 사용하는 쪽의 복잡도를 줄였습니다.

:::

## [react-document-pip](https://www.npmjs.com/package/react-document-pip)

<Badge type='tip' text='React 18' />
<Badge type='info' text='typescript' />

:::details 상세 {open}

Document PIP 창을 React에서 쉽게 사용할 수 있도록 만든 컴포넌트 라이브러리입니다.

브라우저의 Document Picture-in-Picture API를 직접 다룰 때 반복되는 창 생성, 스타일 복사, 상태 동기화, 닫힘 이벤트 처리를 컴포넌트와 타입으로 정리했습니다.

pip-tools에서 직접 겪은 사용성을 바탕으로, 애플리케이션 화면 일부를 독립 창으로 분리하는 경험을 더 단순하게 만들기 위해 개발했습니다.

:::
