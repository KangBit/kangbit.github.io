<script setup>
import { onMounted } from "vue";

onMounted(() => {
  let script = document.createElement("script");
  script.src = "https://utteranc.es/client.js";
  script.async = true;
  script.crossOrigin = "anonymous";
  script.setAttribute("repo", "KangBit/kangbit.github.io");
  script.setAttribute("issue-term", "pathname");
  script.setAttribute("label", "Comment");
  script.setAttribute("theme", "photon-dark");
  document.querySelector("#comment").appendChild(script);
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
