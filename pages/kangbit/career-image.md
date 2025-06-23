---
title: 경력
# titleTemplate:
# description:
outline: 2
prev: false
next: false
---

<script setup>
import CarouselContainer from "@/components/CarouselContainer.vue";
import CarouselItem from '@/components/CarouselItem.vue'
</script>

## 스마트스코어 앱

<CarouselContainer :images="smartscoreAppImages">
  <CarouselItem style="width: 60%; scrollSnapStop: always">
    <img src="/assets/images/smartscore/smartscoreapp001.png"/>
  </CarouselItem>
  <CarouselItem style="width: 60%; scrollSnapStop: always">
    <img src="/assets/images/smartscore/smartscoreapp011.png"/>
  </CarouselItem>
  <CarouselItem style="width: 60%; scrollSnapStop: always">
    <img src="/assets/images/smartscore/smartscoreapp012.png"/>
  </CarouselItem>
  <CarouselItem style="width: 60%; scrollSnapStop: always">
    <img src="/assets/images/smartscore/smartscoreapp021.png"/>
  </CarouselItem>
  <CarouselItem style="width: 60%; scrollSnapStop: always">
    <img src="/assets/images/smartscore/smartscoreapp0302.png"/>
  </CarouselItem>
</CarouselContainer>
