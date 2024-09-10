// https://vitepress.dev/guide/custom-theme
import DefaultTheme from "vitepress/theme";
import BaseLayout from "./BaseLayout.vue";
import "./style.css";

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  Layout: BaseLayout,
  enhanceApp({ app, router, siteData }) {
    // ...
  },
};
