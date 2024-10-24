<script setup>
import {
  ref,
  computed,
  cloneVNode,
  useSlots,
  onMounted,
  onBeforeUnmount,
} from "vue";

// Composables
const slots = useSlots();

// Props
const props = defineProps({
  speed: {
    type: Number,
    default: 500,
  },
  loop: {
    type: Boolean,
    default: false,
  },
  autoPlay: {
    type: Boolean,
    default: false,
  },
});

// Variables
let timeout = null;

// Refs
const swiperWrapper = ref(null);

const slideIndex = ref(0);
const isSliding = ref(false);

// Computed
const slideItems = computed(() => {
  if (!slots.default) {
    return [];
  }
  return slots.default();
});

const slideLength = computed(() => {
  return slideItems.value.length;
});

const firstSlide = computed(() => {
  return slideItems.value[0];
});

const lastSlide = computed(() => {
  return slideItems.value[slideLength.value - 1];
});

const canSlideRight = computed(() => {
  if (isSliding.value) {
    return false;
  }
  return props.loop || slideIndex.value < slideLength.value - 1;
});

const canSlideLeft = computed(() => {
  if (isSliding.value) {
    return false;
  }
  return props.loop || slideIndex.value > 0;
});

const swiperWrapperStyle = computed(() => {
  const left = props.loop ? 100 : 0;
  const translateX = slideIndex.value * -100 - left;

  const transform = `translate3d(${translateX}%, 0, 0)`;
  const transitionDuration = isSliding.value ? `${props.speed}ms` : "0ms";

  return { transform, transitionDuration };
});

// Methods
const slideTo = (index) => {
  isSliding.value = true;
  slideIndex.value = index;
};

const onClickLeftButton = () => {
  if (!canSlideLeft.value) {
    return;
  }
  slideTo(slideIndex.value - 1);
};

const onClickRightButton = () => {
  if (!canSlideRight.value) {
    return;
  }
  slideTo(slideIndex.value + 1);
};

const onTransitionEnd = () => {
  isSliding.value = false;

  if (slideIndex.value < 0) {
    slideIndex.value = slideLength.value - 1;
  }

  if (slideIndex.value === slideLength.value) {
    slideIndex.value = 0;
  }

  if (props.autoPlay) {
    startAutoPlay();
  }
};

const startAutoPlay = () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    if (canSlideRight.value) {
      slideTo(slideIndex.value + 1);
    }
  }, 2000);
};

// LifeCycle
onMounted(() => {
  if (props.autoPlay) {
    startAutoPlay();
  }
});

onBeforeUnmount(() => {
  clearTimeout(timeout);
});
</script>

<template>
  <div class="swiper-container">
    <div class="swiper">
      <div
        ref="swiperWrapper"
        class="swiper-wrapper"
        :style="swiperWrapperStyle"
        @transitionend="onTransitionEnd"
      >
        <component
          v-if="loop && lastSlide"
          :is="cloneVNode(lastSlide, { class: 'copy' })"
        ></component>
        <slot></slot>
        <component
          v-if="loop && firstSlide"
          :is="cloneVNode(firstSlide, { class: 'copy' })"
        ></component>
      </div>

      <div class="btn-arrow btn-left" @click="onClickLeftButton">PREV</div>
      <div class="btn-arrow btn-right" @click="onClickRightButton">NEXT</div>
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
}

.swiper-wrapper {
  position: absolute;
  display: flex;
  width: 100%;
  height: 100%;

  transition-property: transform;
}

.swiper-container .btn-arrow {
  padding: 2rem;
  font-size: 1rem;
  position: absolute;
  cursor: pointer;
  user-select: none;
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
