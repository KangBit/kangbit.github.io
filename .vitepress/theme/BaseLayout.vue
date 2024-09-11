<script setup>
import { computed } from "vue";
import { useData } from "vitepress";
import DefaultTheme from "vitepress/theme";
import UtterancComment from "@/components/UtterancComment.vue";

const { Layout } = DefaultTheme;

const COMMENT_THEME_DARK = "photon-dark";
const COMMENT_THEME_LIGHT = "github-light";

// Composable
const { frontmatter, page, isDark } = useData();

// Computed
const commentTheme = computed(() => {
  return isDark.value ? COMMENT_THEME_DARK : COMMENT_THEME_LIGHT;
});
</script>

<template>
  <Layout>
    <template #doc-after>
      <UtterancComment
        v-if="frontmatter.comment"
        :key="page.relativePath"
        :theme="commentTheme"
      ></UtterancComment>
    </template>
  </Layout>
</template>
