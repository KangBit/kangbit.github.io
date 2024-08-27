<script setup>
import { ref, computed, onMounted } from "vue";

const props = defineProps({
  duration: {
    type: String,
    default: "10s",
  },
});

const container = ref();
const list = ref();

const copy = ref(false);

const isOverflowingContainer = computed(() => {
  return container.value.offsetWidth < list.value.offsetWidth;
});

onMounted(() => {
  if (isOverflowingContainer.value) {
    copy.value = true;
  }
});
</script>

<template>
  <div class="marquee" ref="container">
    <div
      ref="list"
      :class="{ marquee_list: true, active: copy }"
      :style="{ animationDuration: duration }"
    >
      <slot class="marquee_item"></slot>
    </div>
    <div
      v-if="copy"
      class="marquee_list copy active"
      :style="{ animationDuration: duration }"
    >
      <slot class="marquee_item"></slot>
    </div>
  </div>
</template>

<style scoped>
.marquee {
  width: 100%;
  display: flex;
  overflow: hidden;
}

.marquee_list {
  display: flex;
  padding: 0 !important;
}

.marquee_list.active {
  animation: roll 0s linear infinite;
}

@keyframes roll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}
</style>
