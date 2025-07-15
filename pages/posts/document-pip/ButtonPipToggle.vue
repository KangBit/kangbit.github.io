<template>
  <div id="toggle-button-container">
    <button
      ref="toggle-pip"
      class="pip-button"
      @click="togglePip"
      v-if="isPipSupported"
    >
      Toggle PIP
    </button>
    <div v-else class="not-support">
      Picture-in-Picture is not supported in this browser
    </div>
  </div>
</template>

<script setup>
const isPipSupported = "documentPictureInPicture" in window;

const togglePip = () => {
  if (window.documentPictureInPicture.window) {
    closePip();
  } else {
    openPip();
  }
};

const closePip = () => {
  window.documentPictureInPicture.window.close();
};

const openPip = async () => {
  await window.documentPictureInPicture.requestWindow({
    width: 300,
    height: 300,
    disallowReturnToOpener: true,
    preferInitialWindowPlacement: true,
  });
};
</script>

<style scoped>
.not-support {
  border-radius: 8px;
  background-color: var(--vp-custom-block-warning-bg);
  padding: 20px 20px;
}

.pip-button {
  font-weight: bold;
  padding: 10px;
  border-radius: 10px;
  color: var(--vp-button-brand-text);
  border-color: var(--vp-button-brand-border);
  background-color: var(--vp-button-brand-bg);
}

.pip-button:hover {
  border-color: var(--vp-button-brand-hover-border);
  color: var(--vp-button-brand-hover-text);
  background-color: var(--vp-button-brand-hover-bg);
}
</style>
