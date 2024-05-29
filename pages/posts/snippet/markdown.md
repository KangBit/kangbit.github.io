---
title: Snippet
titleTemplate: Markdown
description: Markdown Snippet 코드
outline: deep
prev: false
next: false
---

# Markdown Snippet

## Code block

### Code Block

::: code-group

<!-- prettier-ignore -->
````json [markdown.json]
{
  "Insert fenced code block": {
    "prefix": "code",
    "body": [
      "```${1:js}",
      "$2",
      "```"
    ],
    "description": "Insert fenced code block"
  }
}
````

:::

### Code Group

::: code-group

<!-- prettier-ignore -->
```json [markdown.json]
{
  "Insert fenced code group": {
    "prefix": "code group",
    "body": [
      "::: code-group",
      "```${1:js} [${2:filename.json}]",
      "$3",
      "```",
      ":::"
    ],
    "description": "Insert fenced code group"
  }
}
```

:::

### Code Highlighted

::: code-group

<!-- prettier-ignore -->
```json [markdown.json]
{
  "Insert code block with highlight": {
    "prefix": "code highlight",
    "body": [
      "```${1:js}{${2:1}}",
      "$3",
      "```"
    ],
    "description": "Insert code block with highlight"
  }
}
```

:::
