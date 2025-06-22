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

const smartscoreAppImages = [
  "/assets/images/smartscore/smartscoreapp001.png",
  "/assets/images/smartscore/smartscoreapp011.png",
  "/assets/images/smartscore/smartscoreapp021.png",
  "/assets/images/smartscore/smartscoreapp0302.png",
];
</script>

## 스마트스코어 앱

<CarouselContainer :images="smartscoreAppImages">
  <CarouselItem
    v-for="(image, i) in smartscoreAppImages"
    :key="image"
    style="width: 60%; scrollSnapStop: always"
  >
    <img :src="image" :alt="`image-${i}`" />
  </CarouselItem>
</CarouselContainer>
