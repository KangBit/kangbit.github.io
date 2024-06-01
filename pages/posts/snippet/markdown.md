---
title: Snippet
titleTemplate: Markdown
description: Markdown Snippet 코드
outline: deep
prev: false
next: false
---

# Markdown Snippet

## VitePress Frontmatter

::: code-group

```json [markdown.json]
{
  "Insert Vitepress Frontmatter": {
    "prefix": "frontmatter",
    "body": [
      "---",
      "title: $1",
      "titleTemplate: $2",
      "description: $3",
      "outline: ${4:deep}",
      "prev: ${5:true}",
      "next: ${5:true}",
      "---"
    ],
    "description": "Insert vitepress frontmatter"
  }
}
```

:::

## Vitepress Code block

### Code Block

::: code-group

<!-- prettier-ignore -->
```json [markdown.json]
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
```

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

## VitePress Badge

::: code-group

<!-- prettier-ignore -->
```json [markdown.json]
{
  "Insert Vitepress Badge": {
		"prefix": "badge",
		"body": [
			"<Badge type='${1|info,tip,warning,danger|}' text='$2' />" 
		],
		"description": "Insert Vitepress Badge"
	}
}
```

:::
