<script setup>
import { useData } from "vitepress";
import DefaultTheme from "vitepress/theme";
import UtterancComment from "@/components/UtterancComment.vue";

const { frontmatter, page } = useData();
const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <template #doc-after>
      <UtterancComment
        v-if="frontmatter.comment"
        :key="page.relativePath"
      ></UtterancComment>
    </template>
  </Layout>
</template>
