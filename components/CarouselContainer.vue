<script setup>
const props = defineProps({
  gap: {
    type: Number,
    default: 0,
  },
});
</script>

<template>
  <div class="scroll-layout">
    <div class="carousel" :style="{ grid: grid, gap: gap }">
      <slot class="carousel-item"></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.scroll-layout {
  width: 100%;
  display: flex;
  justify-content: center;
}

.carousel {
  anchor-name: --carousel;

  display: flex;
  flex-wrap: nowrap;
  justify-content: space-evenly;
  padding: 0;
  margin: 0;

  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;

  &::scroll-button(*) {
    position: fixed;
    position-anchor: --carousel;

    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 2px solid #999;

    margin: 10px;
  }

  &::scroll-button(left) {
    position-area: inline-start center;
    content: "⬅" / "Scroll Left";
  }

  &::scroll-button(right) {
    position-area: inline-end center;
    content: "⮕" / "Scroll Right";
  }

  &::scroll-button(*):hover:not(:disabled),
  &::scroll-button(*):focus:not(:disabled) {
    transition: all 0.3s ease;
    transform: scale(1.1);
    cursor: pointer;
  }

  &::scroll-button(*):disabled {
    background-color: transparent;
    cursor: unset;
  }
}
</style>
