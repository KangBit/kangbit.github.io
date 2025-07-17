<template>
  <div class="dp-f">
    <div ref="pipContainer" class="pip-container">
      <h1 v-show="!isPipOpen">Hello, PIP!</h1>
    </div>

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
  </div>
</template>

<script setup>
import { ref } from "vue";

const isPipSupported = "documentPictureInPicture" in window;
const pipContainer = ref(null);
const isPipOpen = ref(false);

const togglePip = () => {
  if (window.documentPictureInPicture.window) {
    closePip();
  } else {
    openPip();
  }
};

const openPip = async () => {
  const pipWindow = await window.documentPictureInPicture.requestWindow({
    width: 300,
    height: 300,
    disallowReturnToOpener: true,
    preferInitialWindowPlacement: true,
  });

  isPipOpen.value = true;

  pipWindow.addEventListener("pagehide", onClosePip);
  pipWindow.document.documentElement.classList.add("dark");
  pipWindow.document.body.append(pipContainer.value.cloneNode(true));
  copyStyles(pipWindow);
};

const closePip = () => {
  window.documentPictureInPicture.window.close();
};

const onClosePip = () => {
  isPipOpen.value = false;
};

const copyStyles = (pipWindow) => {
  [...document.styleSheets].forEach((styleSheet) => {
    try {
      const cssRules = [...styleSheet.cssRules]
        .map((rule) => rule.cssText)
        .join("");
      const style = document.createElement("style");
      style.textContent = cssRules;
      pipWindow.document.head.appendChild(style);
    } catch (e) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = styleSheet.type;
      link.media = styleSheet.media;
      link.href = styleSheet.href;
      pipWindow.document.head.appendChild(link);
    }
  });
};
</script>

<style scoped>
.dp-f {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

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

.pip-container {
  border-radius: 10px;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 200px;
  height: 150px;
  background-color: var(--vp-c-default-soft);
  color: yellow;
}
</style>
