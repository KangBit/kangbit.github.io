<script setup>
import { onMounted, watch } from "vue";

// Props
const props = defineProps(["theme"]);

// Methods
const appendUtteranc = () => {
  let script = document.createElement("script");

  script.src = "https://utteranc.es/client.js";
  script.async = true;
  script.crossOrigin = "anonymous";

  script.setAttribute("repo", "KangBit/kangbit.github.io");
  script.setAttribute("issue-term", "pathname");
  script.setAttribute("label", "Comment");
  script.setAttribute("theme", props.theme);

  document.querySelector("#comments-container").appendChild(script);
};

// LifeCycle
onMounted(() => {
  appendUtteranc();
});

// Watch
watch(
  () => props.theme,
  () => {
    const iframe = document.querySelector(".utterances-frame");

    const targetOrigin = "https://utteranc.es";
    const message = {
      type: "set-theme",
      theme: props.theme,
    };

    iframe?.contentWindow?.postMessage(message, targetOrigin);
  }
);
</script>

<template>
  <div id="comments-container" class="comments-container"></div>
</template>

<style scoped>
.comments-container {
  margin-top: 40px;
}
</style>
