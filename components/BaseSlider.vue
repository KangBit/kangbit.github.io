<script setup>
import { ref, computed, onMounted, onBeforeUnmount, useSlots } from "vue";

const props = defineProps({
  loop: {
    type: Boolean,
    default: false,
  },
  autoPlay: {
    type: Boolean,
    default: false,
  },
});

// const slots = useSlots();

// const slideItems = slots.default();
// const slideLength = slideItems.length;
// const firstSlide = slideItems[0];
// const lastSlide = slideItems[slideLength];

// Variables
let interval = null;

// Refs
const swiperWrapper = ref(null);

const slideIndex = ref(0);
const isSliding = ref(false);

// Methods
const slideTo = (index) => {
  isSliding.value = true;

  const translateX = index * -100;

  swiperWrapper.value.style.transitionProperty = "transform";
  swiperWrapper.value.style.transitionDuration = "0.3s";
  swiperWrapper.value.style.transform = `translate(${translateX}%, 0)`;
};

const onClickLeftButton = () => {
  if (isSliding.value) {
    return;
  }

  slideIndex.value = slideIndex.value - 1;
  slideTo(slideIndex.value);
};

const onClickRightButton = () => {
  if (isSliding.value) {
    return;
  }

  slideIndex.value = slideIndex.value + 1;
  slideTo(slideIndex.value);
};

const onTransitionEnd = () => {
  isSliding.value = false;

  swiperWrapper.value.style.transitionProperty = "";
  swiperWrapper.value.style.transitionDuration = "";

  if (slideIndex < 0) {
    slideIndex.value = 4;
    swiperWrapper.value.style.transform = `translate(-400%, 0)`;
  }

  if (slideIndex > 4) {
    slideIndex.value = 0;
    swiperWrapper.value.style.transform = `translate(0%, 0)`;
  }
};

const startAutoPlay = () => {
  if (!props.autoPlay) {
    return;
  }

  interval = setInterval(() => {
    if (isSliding.value) {
      return;
    }

    if (slideIndex.value === 4) {
      slideIndex.value = 0;
    } else {
      slideIndex.value = slideIndex.value + 1;
    }

    slideTo(slideIndex.value);
  }, 2000);
};

// LifeCycle
onMounted(() => {
  startAutoPlay();
});

onBeforeUnmount(() => {
  clearInterval(interval);
  interval = null;
});
</script>

<template>
  <div class="swiper-container">
    <div
      id="swiper-left-button"
      class="btn-arrow btn-left"
      @click="onClickLeftButton"
    >
      PREV
    </div>
    <div id="swiper" class="swiper">
      <div
        id="swiper-wrapper"
        class="swiper-wrapper"
        ref="swiperWrapper"
        @transitionend="onTransitionEnd"
      >
        <slot></slot>
      </div>
    </div>
    <div
      id="swiper-right-button"
      class="btn-arrow btn-right"
      @click="onClickRightButton"
    >
      NEXT
    </div>
  </div>
</template>

<style scoped lang="scss">
.swiper-container {
  position: relative;
  width: 100%;
  aspect-ratio: 2;
  margin: auto;
  overflow-x: hidden;
  color: black;
}

.swiper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.swiper-wrapper {
  position: absolute;
  display: flex;
  width: 100%;
  height: 100%;
}

.swiper-container .btn-arrow {
  padding: 2rem;
  font-size: 1rem;
  position: absolute;
  cursor: pointer;
  user-select: none;
  z-index: 2;
}

.btn-left {
  left: 0;
  top: 50%;
  transform: translate(0, -50%);
}

.btn-right {
  right: 0;
  top: 50%;
  transform: translate(0, -50%);
}
</style>
