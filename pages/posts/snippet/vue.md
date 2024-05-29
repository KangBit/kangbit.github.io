---
title: Snippet
titleTemplate: Vue
description: Vue Snippet 코드
prev: false
next: false
---

# Vue Snippet

## Composition Component

::: code-group

```json [vue.json]
{
  "Vue3 Composition Component": {
    "prefix": "vnc",
    "body": [
      "<script setup>",
      "${1}",
      "</script>\n",

      "<template>",
      "\t<div></div>",
      "</template>\n",

      "<style scoped lang='scss'></style>"
    ],
    "description": "Vue3 New Component"
  }
}
```

:::

## Composable

::: code-group

```json [javascript.json]
{
  "Vue3 Composable": {
    "prefix": "vue use",
    "body": [
      "import { ref } from 'vue';\n",

      "export const ${TM_FILENAME_BASE} = () => {",
      "\treturn {};",
      "};"
    ],
    "description": "Vue3 Composable"
  }
}
```

:::

## Pinia Store

::: code-group

```json [javascript.json]
{
  "Vue3 Pinia Store": {
    "prefix": "vue store",
    "body": [
      "import { defineStore } from 'pinia';\n",

      "export const use${1:Common}Store = defineStore('${2:common}', () => {",
      "\treturn {};",
      "});"
    ],
    "description": "Vue3 Pinia Store"
  }
}
```

:::
