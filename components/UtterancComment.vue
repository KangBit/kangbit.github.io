<script setup>
import { onMounted, computed, watch } from "vue";
import { useData } from "vitepress";

const { isDark } = useData();

// computed
const theme = computed(() => {
  return isDark.value ? "photon-dark" : "github-light";
});

// methods
const appendComments = () => {
  let script = document.createElement("script");
  script.src = "https://utteranc.es/client.js";
  script.async = true;
  script.crossOrigin = "anonymous";
  script.setAttribute("repo", "KangBit/kangbit.github.io");
  script.setAttribute("issue-term", "pathname");
  script.setAttribute("label", "Comment");
  script.setAttribute("theme", theme.value);

  document.querySelector("#comment").appendChild(script);
};

// LifeCycle
onMounted(() => {
  appendComments();
});

// Watch
watch(isDark, () => {
  const iframe = document.querySelector(".utterances-frame");
  if (!iframe) {
    return;
  }

  const message = {
    type: "set-theme",
    theme: theme.value,
  };

  iframe.contentWindow.postMessage(message, "https://utteranc.es");
});
</script>

<template>
  <div id="comment" class="comments-container"></div>
</template>

<style scoped>
.comments-container {
  margin-top: 40px;
}
</style>
