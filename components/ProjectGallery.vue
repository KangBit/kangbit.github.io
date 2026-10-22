<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";

const props = defineProps({
  images: {
    type: Array,
    required: true,
  },
  layout: {
    type: String,
    default: "landscape",
  },
});

const galleryRef = ref(null);
const closeButtonRef = ref(null);
const modalDialogRef = ref(null);
const activeImageIndex = ref(-1);
const canScrollPrevious = ref(false);
const canScrollNext = ref(false);
const previouslyFocusedElement = ref(null);
const previousBodyOverflow = ref("");

let resizeObserver;

const isModalOpen = computed(() => {
  return activeImageIndex.value >= 0;
});

const activeImage = computed(() => {
  if (!isModalOpen.value) {
    return null;
  }

  return props.images[activeImageIndex.value];
});

const updateScrollControls = () => {
  const gallery = galleryRef.value;

  if (!gallery) {
    return;
  }

  const maximumScrollLeft = gallery.scrollWidth - gallery.clientWidth;
  canScrollPrevious.value = gallery.scrollLeft > 8;
  canScrollNext.value = gallery.scrollLeft < maximumScrollLeft - 8;
};

const scrollGallery = (direction) => {
  const gallery = galleryRef.value;

  if (!gallery) {
    return;
  }

  const item = gallery.querySelector(".project-gallery__item");

  if (!item) {
    return;
  }

  const galleryStyle = window.getComputedStyle(gallery);
  const gap = Number.parseFloat(galleryStyle.columnGap) || 0;
  const distance = item.getBoundingClientRect().width + gap;

  gallery.scrollBy({
    left: distance * direction,
    behavior: "smooth",
  });
};

const openModal = async (imageIndex) => {
  if (!props.images[imageIndex]) {
    return;
  }

  previouslyFocusedElement.value = document.activeElement;
  activeImageIndex.value = imageIndex;

  await nextTick();

  if (closeButtonRef.value) {
    closeButtonRef.value.focus();
  }
};

const closeModal = async () => {
  activeImageIndex.value = -1;

  await nextTick();

  const element = previouslyFocusedElement.value;

  if (element && typeof element.focus === "function") {
    element.focus();
  }
};

const showModalImage = (direction) => {
  const imageCount = props.images.length;

  if (imageCount === 0) {
    return;
  }

  let nextImageIndex = activeImageIndex.value + direction;

  if (nextImageIndex < 0) {
    nextImageIndex = imageCount - 1;
  }

  if (nextImageIndex >= imageCount) {
    nextImageIndex = 0;
  }

  activeImageIndex.value = nextImageIndex;
};

const handleModalKeydown = (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    closeModal();
    return;
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    showModalImage(-1);
    return;
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    showModalImage(1);
    return;
  }

  if (event.key !== "Tab" || !modalDialogRef.value) {
    return;
  }

  const focusableElements = modalDialogRef.value.querySelectorAll(
    'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
  );

  if (focusableElements.length === 0) {
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
    return;
  }

  if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
};

watch(isModalOpen, (isOpen) => {
  if (typeof document === "undefined") {
    return;
  }

  if (isOpen) {
    previousBodyOverflow.value = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return;
  }

  document.body.style.overflow = previousBodyOverflow.value;
});

onMounted(() => {
  updateScrollControls();

  if (typeof ResizeObserver === "undefined") {
    return;
  }

  resizeObserver = new ResizeObserver(() => {
    updateScrollControls();
  });

  if (galleryRef.value) {
    resizeObserver.observe(galleryRef.value);
  }
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }

  if (typeof document !== "undefined") {
    document.body.style.overflow = previousBodyOverflow.value;
  }
});
</script>

<template>
  <div class="project-carousel">
    <button
      class="project-carousel__button project-carousel__button--previous"
      type="button"
      aria-label="이전 이미지"
      :disabled="!canScrollPrevious"
      @click="scrollGallery(-1)"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="m15 18-6-6 6-6" />
      </svg>
    </button>

    <div
      ref="galleryRef"
      class="project-gallery"
      :class="`project-gallery--${layout}`"
      role="region"
      aria-label="프로젝트 이미지 캐러셀"
      tabindex="0"
      @scroll.passive="updateScrollControls"
    >
      <figure
        v-for="(image, imageIndex) in images"
        :key="image.src"
        class="project-gallery__item"
      >
        <button
          class="project-gallery__link"
          type="button"
          :aria-label="`${image.title} 크게 보기`"
          @click="openModal(imageIndex)"
        >
          <img
            class="project-gallery__image"
            :src="image.src"
            :alt="`${image.title} 화면`"
            loading="lazy"
            decoding="async"
          />
        </button>
        <figcaption class="project-gallery__caption">
          {{ image.title }}
        </figcaption>
      </figure>
    </div>

    <button
      class="project-carousel__button project-carousel__button--next"
      type="button"
      aria-label="다음 이미지"
      :disabled="!canScrollNext"
      @click="scrollGallery(1)"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>
  </div>

  <Teleport to="body">
    <Transition name="project-lightbox">
      <div
        v-if="isModalOpen && activeImage"
        class="project-lightbox"
        role="dialog"
        aria-modal="true"
        :aria-label="`${activeImage.title} 이미지 뷰어`"
        @click.self="closeModal"
        @keydown="handleModalKeydown"
      >
        <div ref="modalDialogRef" class="project-lightbox__dialog">
          <button
            ref="closeButtonRef"
            class="project-lightbox__button project-lightbox__button--close"
            type="button"
            aria-label="이미지 뷰어 닫기"
            @click="closeModal"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>

          <button
            v-if="images.length > 1"
            class="project-lightbox__button project-lightbox__button--previous"
            type="button"
            aria-label="이전 이미지"
            @click="showModalImage(-1)"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <figure class="project-lightbox__figure">
            <img
              class="project-lightbox__image"
              :src="activeImage.src"
              :alt="`${activeImage.title} 화면`"
              decoding="async"
            />
            <figcaption class="project-lightbox__caption" aria-live="polite">
              <strong>{{ activeImage.title }}</strong>
              <span>{{ activeImageIndex + 1 }} / {{ images.length }}</span>
            </figcaption>
          </figure>

          <button
            v-if="images.length > 1"
            class="project-lightbox__button project-lightbox__button--next"
            type="button"
            aria-label="다음 이미지"
            @click="showModalImage(1)"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.project-carousel {
  position: relative;
  margin: 20px 0 8px;
}

.project-gallery {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 2px;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  overscroll-behavior-inline: contain;
}

.project-gallery::-webkit-scrollbar {
  display: none;
}

.project-gallery__item {
  flex: 0 0 88%;
  margin: 0;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

.project-gallery--portrait .project-gallery__item {
  flex-basis: 42%;
}

.project-gallery__link {
  display: flex;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  padding: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  color: inherit;
  cursor: zoom-in;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.project-gallery--portrait .project-gallery__link {
  aspect-ratio: 9 / 16;
}

.project-gallery__link:hover,
.project-gallery__link:focus-visible {
  border-color: var(--vp-c-brand-1);
  box-shadow: var(--vp-shadow-2);
  transform: translateY(-2px);
}

.project-gallery__link:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 3px;
}

.project-gallery__image {
  width: 100%;
  height: 100%;
  margin: 0;
  object-fit: cover;
  object-position: center;
  background: #fff;
  transition: transform 0.25s ease;
}

.project-gallery__link:hover .project-gallery__image {
  transform: scale(1.015);
}

.project-gallery__caption {
  display: flex;
  min-height: 36px;
  margin-top: 8px;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.4;
  text-align: center;
  align-items: flex-start;
  justify-content: center;
}

.project-carousel__button,
.project-lightbox__button {
  display: grid;
  padding: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 50%;
  place-items: center;
  cursor: pointer;
  backdrop-filter: blur(8px);
}

.project-carousel__button {
  position: absolute;
  top: calc(50% - 22px);
  z-index: 2;
  width: 42px;
  height: 42px;
  background: color-mix(in srgb, var(--vp-c-bg) 88%, transparent);
  color: var(--vp-c-text-1);
  transform: translateY(-50%);
  box-shadow: var(--vp-shadow-2);
}

.project-carousel__button svg,
.project-lightbox__button svg {
  display: block;
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.project-carousel__button:hover:not(:disabled),
.project-carousel__button:focus-visible,
.project-lightbox__button:hover,
.project-lightbox__button:focus-visible {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.project-carousel__button:focus-visible,
.project-lightbox__button:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.project-carousel__button:disabled {
  opacity: 0.3;
  cursor: default;
}

.project-carousel__button--previous {
  left: 12px;
}

.project-carousel__button--next {
  right: 12px;
}

.project-lightbox {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: grid;
  padding: 24px;
  background: rgb(5 7 12 / 92%);
  place-items: center;
  backdrop-filter: blur(10px);
}

.project-lightbox__dialog {
  position: relative;
  width: min(1200px, 100%);
  height: min(900px, calc(100vh - 48px));
  padding: 48px 64px 16px;
}

.project-lightbox__figure {
  display: grid;
  width: 100%;
  height: 100%;
  min-height: 0;
  margin: 0;
  grid-template-rows: minmax(0, 1fr) auto;
}

.project-lightbox__image {
  width: 100%;
  height: 100%;
  min-height: 0;
  margin: 0;
  border-radius: 12px;
  object-fit: contain;
}

.project-lightbox__caption {
  display: flex;
  gap: 16px;
  min-height: 32px;
  padding-top: 12px;
  color: #fff;
  font-size: 14px;
  line-height: 1.4;
  align-items: center;
  justify-content: center;
}

.project-lightbox__caption span {
  color: rgb(255 255 255 / 65%);
  font-variant-numeric: tabular-nums;
}

.project-lightbox__button {
  position: absolute;
  z-index: 1;
  width: 46px;
  height: 46px;
  background: rgb(255 255 255 / 12%);
  border-color: rgb(255 255 255 / 28%);
  color: #fff;
}

.project-lightbox__button--close {
  top: 0;
  right: 0;
}

.project-lightbox__button--previous,
.project-lightbox__button--next {
  top: 50%;
  transform: translateY(-50%);
}

.project-lightbox__button--previous {
  left: 0;
}

.project-lightbox__button--next {
  right: 0;
}

.project-lightbox-enter-active,
.project-lightbox-leave-active {
  transition: opacity 0.2s ease;
}

.project-lightbox-enter-from,
.project-lightbox-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .project-gallery__item {
    flex-basis: 92%;
  }

  .project-gallery--portrait .project-gallery__item {
    flex-basis: 62%;
  }

  .project-carousel__button {
    width: 38px;
    height: 38px;
  }

  .project-carousel__button--previous {
    left: 8px;
  }

  .project-carousel__button--next {
    right: 8px;
  }

  .project-lightbox {
    padding: 12px;
  }

  .project-lightbox__dialog {
    width: 100%;
    height: calc(100dvh - 24px);
    padding: 52px 0 12px;
  }

  .project-lightbox__button {
    width: 42px;
    height: 42px;
    background: rgb(5 7 12 / 70%);
  }

  .project-lightbox__button--close {
    top: 2px;
    right: 2px;
  }

  .project-lightbox__button--previous {
    left: 6px;
  }

  .project-lightbox__button--next {
    right: 6px;
  }

  .project-lightbox__caption {
    gap: 10px;
    padding-right: 8px;
    padding-left: 8px;
    font-size: 13px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .project-gallery {
    scroll-behavior: auto;
  }

  .project-gallery__link,
  .project-gallery__image,
  .project-lightbox-enter-active,
  .project-lightbox-leave-active {
    transition: none;
  }
}
</style>
