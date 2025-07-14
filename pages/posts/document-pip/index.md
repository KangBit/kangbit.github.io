---
title: Document PIP
description: Document Picture-in-Picture API를 활용하여 웹 문서를 작은 창으로 분리해 띄우는 방법과 활용 사례를 소개합니다.
head:
  - - meta
    - name: keywords
      content: document pip, document picture-in-picture, picture-in-picture, pip api, 크롬 pip, 웹 api, 브라우저 pip, pip 활용, pip 예제
comment: true
---

# Document Picture In Picture

::: warning

Document Picture in Picture API는 아직 실험적 기능입니다. ( 2025-07 )

일부 브라우저에서 동작하지 않을 수 있습니다.

[CanIUse](https://caniuse.com/mdn-api_documentpictureinpicture) 에서 브라우저별 지원 현황을 확인할 수 있습니다.

:::

## Picture In Picture 란?

<img src="/assets/images/document-pip/video-pip.jpg" width="80%" class="mb-0"></img>

PIP는 화면을 작은 팝업 창으로 띄워, 화면을 보면서 다른 작업을 동시에 할 수 있도록 하는 기능입니다.

이 팝업 창은 항상 다른 창 위에 표시되며, 영상 재생에 사용되어 왔습니다.

Document PIP API를 활용하면 웹 문서도 작은 창으로 분리할 수 있습니다.

## Document PIP

이미 화면에 나타나고 있는 영역을 팝업 창으로 나타내는 것이기 때문에

새로운 element 를 생성하기보다는 기존의 영역을 옮겨서 나타내는 방식으로 보여줍니다.

하지만 clone하는 방식으로도 노출할 수 있습니다.

## PIP 창 열기

## PIP 창에 스타일 적용하기

## PIP 창의 이벤트 처리하기
