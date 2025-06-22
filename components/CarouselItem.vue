<script setup></script>

<template>
  <div class="carousel-item">
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
.carousel-item {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 0 0 auto;
  scroll-snap-align: center;
}
</style>
