---
title: eslint-plugin-vue
description: eslint-plugin-vue 규칙을 한국어로 정리합니다.
head:
  - - meta
    - name: keywords
      content: "ESLint, Vue, eslint-plugin-vue"
comment: true
---

# eslint-plugin-vue

::: info
이 문서는 ChatGPT 5.5를 통해 작성되었습니다.
:::

기준일: 2026-04-29  
기준 버전: `eslint-plugin-vue@10.4.0`  
출처: [eslint-plugin-vue Available rules](https://eslint.vuejs.org/rules/), [npm eslint-plugin-vue](https://www.npmjs.com/package/eslint-plugin-vue)

## Base Rules

| 규칙 | 설명 |
| --- | --- |
| `comment-directive` | `<template>` 안에서 ESLint 제어 주석을 사용할 수 있게 합니다. |
| `jsx-uses-vars` | JSX에서 사용한 변수가 미사용 변수로 잘못 보고되지 않게 합니다. |

## Priority A: Essential

| 규칙 | 설명 |
| --- | --- |
| `multi-word-component-names` | 컴포넌트 이름을 항상 여러 단어로 작성하도록 강제합니다. |
| `no-arrow-functions-in-watch` | watcher를 화살표 함수로 정의하는 것을 금지합니다. |
| `no-async-in-computed-properties` | computed property 안에서 비동기 동작을 수행하는 것을 금지합니다. |
| `no-child-content` | `v-html`, `v-text` 등으로 덮어써질 요소의 자식 콘텐츠를 금지합니다. |
| `no-computed-properties-in-data` | `data` 안에서 computed property에 접근하는 것을 금지합니다. |
| `no-custom-modifiers-on-v-model` | Vue 2 컴포넌트의 `v-model`에 커스텀 modifier를 붙이는 것을 금지합니다. |
| `no-deprecated-data-object-declaration` | Vue 3에서 deprecated된 객체 형태의 `data` 선언을 금지합니다. |
| `no-deprecated-delete-set` | Vue 3에서 deprecated된 `$delete`, `$set` 사용을 금지합니다. |
| `no-deprecated-destroyed-lifecycle` | Vue 3에서 deprecated된 `destroyed`, `beforeDestroy` lifecycle hook 사용을 금지합니다. |
| `no-deprecated-dollar-listeners-api` | Vue 3에서 deprecated된 `$listeners` 사용을 금지합니다. |
| `no-deprecated-dollar-scopedslots-api` | Vue 3에서 deprecated된 `$scopedSlots` 사용을 금지합니다. |
| `no-deprecated-events-api` | Vue 3에서 deprecated된 events API 사용을 금지합니다. |
| `no-deprecated-filter` | Vue 3에서 deprecated된 filter 문법 사용을 금지합니다. |
| `no-deprecated-functional-template` | Vue 3에서 deprecated된 `functional` template 사용을 금지합니다. |
| `no-deprecated-html-element-is` | Vue 3에서 deprecated된 HTML 요소의 `is` 속성 사용을 금지합니다. |
| `no-deprecated-inline-template` | Vue 3에서 deprecated된 `inline-template` 속성 사용을 금지합니다. |
| `no-deprecated-model-definition` | Vue 3에서 deprecated된 `model` 옵션 정의를 금지합니다. |
| `no-deprecated-props-default-this` | Vue 3에서 deprecated된 props 기본값 함수의 `this` 접근을 금지합니다. |
| `no-deprecated-router-link-tag-prop` | Vue 3에서 deprecated된 `RouterLink`의 `tag` prop 사용을 금지합니다. |
| `no-deprecated-scope-attribute` | Vue 2.5 이후 deprecated된 `scope` 속성 사용을 금지합니다. |
| `no-deprecated-slot-attribute` | Vue 2.6 이후 deprecated된 `slot` 속성 사용을 금지합니다. |
| `no-deprecated-slot-scope-attribute` | Vue 2.6 이후 deprecated된 `slot-scope` 속성 사용을 금지합니다. |
| `no-deprecated-v-bind-sync` | Vue 3에서 deprecated된 `v-bind`의 `.sync` modifier 사용을 금지합니다. |
| `no-deprecated-v-is` | Vue 3.1 이후 deprecated된 `v-is` directive 사용을 금지합니다. |
| `no-deprecated-v-on-native-modifier` | Vue 3에서 deprecated된 `.native` modifier 사용을 금지합니다. |
| `no-deprecated-v-on-number-modifiers` | Vue 3에서 deprecated된 숫자 keycode modifier 사용을 금지합니다. |
| `no-deprecated-vue-config-keycodes` | Vue 3에서 deprecated된 `Vue.config.keyCodes` 사용을 금지합니다. |
| `no-dupe-keys` | 컴포넌트 옵션의 필드 이름 중복을 금지합니다. |
| `no-dupe-v-else-if` | `v-if` / `v-else-if` 체인에서 중복 조건을 금지합니다. |
| `no-duplicate-attributes` | 같은 요소의 속성 중복을 금지합니다. |
| `no-export-in-script-setup` | `<script setup>` 안의 `export` 사용을 금지합니다. |
| `no-expose-after-await` | `await` 이후 `expose`를 등록하는 것을 금지합니다. |
| `no-lifecycle-after-await` | `await` 이후 lifecycle hook을 등록하는 것을 금지합니다. |
| `no-multiple-template-root` | Vue 2 template에 여러 root node를 두는 것을 금지합니다. |
| `no-mutating-props` | 컴포넌트 prop을 직접 변경하는 것을 금지합니다. |
| `no-parsing-error` | `<template>` 파싱 오류를 금지합니다. |
| `no-ref-as-operand` | Composition API의 `ref()` 값을 `.value` 없이 operand로 사용하는 것을 금지합니다. |
| `no-reserved-component-names` | 예약된 이름을 컴포넌트 이름으로 사용하는 것을 금지합니다. |
| `no-reserved-keys` | 예약된 key를 덮어쓰는 것을 금지합니다. |
| `no-reserved-props` | 예약된 이름을 prop으로 사용하는 것을 금지합니다. |
| `no-shared-component-data` | 컴포넌트 `data` 옵션이 객체가 아니라 함수가 되도록 강제합니다. |
| `no-side-effects-in-computed-properties` | computed property 안의 side effect를 금지합니다. |
| `no-template-key` | `<template>`에 `key` 속성을 붙이는 것을 금지합니다. |
| `no-textarea-mustache` | `<textarea>` 안의 mustache 문법을 금지합니다. |
| `no-unused-components` | template에서 사용하지 않는 컴포넌트 등록을 금지합니다. |
| `no-unused-vars` | `v-for` 또는 scope attribute에서 선언하고 사용하지 않는 변수를 금지합니다. |
| `no-use-computed-property-like-method` | computed property를 메서드처럼 호출하는 것을 금지합니다. |
| `no-use-v-if-with-v-for` | 같은 요소에 `v-if`와 `v-for`를 함께 쓰는 것을 금지합니다. |
| `no-useless-template-attributes` | `<template>`의 의미 없는 속성을 금지합니다. |
| `no-v-for-template-key-on-child` | `<template v-for>`의 `key`를 자식 요소에 두는 것을 금지합니다. |
| `no-v-for-template-key` | Vue 2에서 `<template v-for>`에 `key` 속성을 붙이는 것을 금지합니다. |
| `no-v-model-argument` | Vue 2 custom component의 `v-model`에 인자를 추가하는 것을 금지합니다. |
| `no-v-text-v-html-on-component` | 컴포넌트에 `v-text` 또는 `v-html`을 사용하는 것을 금지합니다. |
| `no-watch-after-await` | `await` 이후 `watch`를 등록하는 것을 금지합니다. |
| `prefer-import-from-vue` | `@vue/*` 대신 `vue`에서 import하도록 강제합니다. |
| `require-component-is` | `<component>` 요소에 `v-bind:is`를 요구합니다. |
| `require-prop-type-constructor` | prop type이 생성자 함수가 되도록 강제합니다. |
| `require-render-return` | render 함수가 항상 값을 반환하도록 강제합니다. |
| `require-slots-as-functions` | `$slots` 속성을 함수로 사용하도록 강제합니다. |
| `require-toggle-inside-transition` | `<transition>` 내부 콘텐츠의 표시 상태를 제어하도록 요구합니다. |
| `require-v-for-key` | `v-for` directive에 `key`를 요구합니다. |
| `require-valid-default-prop` | prop 기본값이 유효하도록 강제합니다. |
| `return-in-computed-property` | computed property에 `return` 문을 요구합니다. |
| `return-in-emits-validator` | emits validator에 `return` 문을 요구합니다. |
| `use-v-on-exact` | `v-on`에 `exact` modifier 사용을 강제합니다. |
| `valid-attribute-name` | 유효한 attribute 이름만 허용합니다. |
| `valid-define-emits` | `defineEmits` compiler macro 사용이 유효한지 검사합니다. |
| `valid-define-options` | `defineOptions` compiler macro 사용이 유효한지 검사합니다. |
| `valid-define-props` | `defineProps` compiler macro 사용이 유효한지 검사합니다. |
| `valid-model-definition` | Vue 2 `model` 옵션의 key가 유효한지 검사합니다. |
| `valid-next-tick` | `nextTick` 호출이 유효한지 검사합니다. |
| `valid-template-root` | template root가 유효한지 검사합니다. |
| `valid-v-bind-sync` | Vue 2 `v-bind`의 `.sync` modifier 사용이 유효한지 검사합니다. |
| `valid-v-bind` | `v-bind` directive 사용이 유효한지 검사합니다. |
| `valid-v-cloak` | `v-cloak` directive 사용이 유효한지 검사합니다. |
| `valid-v-else-if` | `v-else-if` directive 사용이 유효한지 검사합니다. |
| `valid-v-else` | `v-else` directive 사용이 유효한지 검사합니다. |
| `valid-v-for` | `v-for` directive 사용이 유효한지 검사합니다. |
| `valid-v-html` | `v-html` directive 사용이 유효한지 검사합니다. |
| `valid-v-if` | `v-if` directive 사용이 유효한지 검사합니다. |
| `valid-v-is` | `v-is` directive 사용이 유효한지 검사합니다. |
| `valid-v-memo` | `v-memo` directive 사용이 유효한지 검사합니다. |
| `valid-v-model` | `v-model` directive 사용이 유효한지 검사합니다. |
| `valid-v-on` | `v-on` directive 사용이 유효한지 검사합니다. |
| `valid-v-once` | `v-once` directive 사용이 유효한지 검사합니다. |
| `valid-v-pre` | `v-pre` directive 사용이 유효한지 검사합니다. |
| `valid-v-show` | `v-show` directive 사용이 유효한지 검사합니다. |
| `valid-v-slot` | `v-slot` directive 사용이 유효한지 검사합니다. |
| `valid-v-text` | `v-text` directive 사용이 유효한지 검사합니다. |

## Priority B: Strongly Recommended

| 규칙 | 설명 |
| --- | --- |
| `attribute-hyphenation` | template의 custom component attribute 이름 스타일을 강제합니다. |
| `component-definition-name-casing` | 컴포넌트 정의 이름의 casing을 강제합니다. |
| `first-attribute-linebreak` | 첫 번째 attribute의 위치를 강제합니다. |
| `html-closing-bracket-newline` | 태그 닫는 괄호 앞 줄바꿈 사용 여부를 강제합니다. |
| `html-closing-bracket-spacing` | 태그 닫는 괄호 앞 공백 사용 여부를 강제합니다. |
| `html-end-tags` | HTML end tag 스타일을 강제합니다. |
| `html-indent` | `<template>` 들여쓰기를 강제합니다. |
| `html-quotes` | HTML attribute 따옴표 스타일을 강제합니다. |
| `html-self-closing` | self-closing 스타일을 강제합니다. |
| `max-attributes-per-line` | 한 줄에 허용할 attribute 최대 개수를 제한합니다. |
| `multiline-html-element-content-newline` | 여러 줄 요소 콘텐츠 앞뒤 줄바꿈을 요구합니다. |
| `mustache-interpolation-spacing` | mustache interpolation 내부 공백을 통일합니다. |
| `no-multi-spaces` | 여러 개의 연속 공백을 금지합니다. |
| `no-spaces-around-equal-signs-in-attribute` | attribute의 `=` 주변 공백을 금지합니다. |
| `no-template-shadow` | template 변수가 바깥 스코프 변수를 shadowing하는 것을 금지합니다. |
| `one-component-per-file` | 파일 하나에 컴포넌트 하나만 정의하도록 강제합니다. |
| `prop-name-casing` | Vue 컴포넌트 prop 이름의 casing을 강제합니다. |
| `require-default-prop` | prop에 기본값 정의를 요구합니다. |
| `require-explicit-emits` | `$emit()`으로 발생시키는 이벤트를 `emits` 옵션에 명시하도록 요구합니다. |
| `require-prop-types` | props에 type 정의를 요구합니다. |
| `singleline-html-element-content-newline` | 한 줄 요소 콘텐츠 앞뒤 줄바꿈을 요구합니다. |
| `v-bind-style` | `v-bind` directive 스타일을 강제합니다. |
| `v-on-event-hyphenation` | custom component의 `v-on` 이벤트 이름 스타일을 강제합니다. |
| `v-on-style` | `v-on` directive 스타일을 강제합니다. |
| `v-slot-style` | `v-slot` directive 스타일을 강제합니다. |

## Priority C: Recommended

| 규칙 | 설명 |
| --- | --- |
| `attributes-order` | attribute 순서를 강제합니다. |
| `block-order` | 컴포넌트 최상위 block 순서를 강제합니다. |
| `no-lone-template` | 불필요한 `<template>` 사용을 금지합니다. |
| `no-multiple-slot-args` | scoped slot에 여러 인자를 전달하는 것을 금지합니다. |
| `no-required-prop-with-default` | 기본값이 있는 prop은 required가 아니도록 강제합니다. |
| `no-v-html` | XSS 위험을 줄이기 위해 `v-html` 사용을 금지합니다. |
| `order-in-components` | 컴포넌트 옵션 속성 순서를 강제합니다. |
| `this-in-template` | template 안에서 `this` 사용을 금지합니다. |

## Uncategorized

| 규칙 | 설명 |
| --- | --- |
| `block-lang` | 허용한 `lang` 외의 block 언어 사용을 금지합니다. |
| `block-tag-newline` | block-level tag의 여는 태그 뒤와 닫는 태그 앞 줄바꿈을 강제합니다. |
| `component-api-style` | 컴포넌트 API 스타일을 강제합니다. |
| `component-name-in-template-casing` | template 안의 컴포넌트 이름 casing을 강제합니다. |
| `component-options-name-casing` | `components` 옵션에 등록된 컴포넌트 이름 casing을 강제합니다. |
| `custom-event-name-casing` | custom event 이름 casing을 강제합니다. |
| `define-emits-declaration` | `defineEmits` 선언 스타일을 강제합니다. |
| `define-macros-order` | `defineProps`, `defineEmits` 등 compiler macro 순서를 강제합니다. |
| `define-props-declaration` | `defineProps` 선언 스타일을 강제합니다. |
| `define-props-destructuring` | props 구조 분해 스타일을 일관되게 강제합니다. |
| `enforce-style-attribute` | SFC 최상위 `<style>`의 `scoped`, `module` 속성 사용 여부를 강제합니다. |
| `html-button-has-type` | `button` 요소에 명시적인 `type` 속성을 요구합니다. |
| `html-comment-content-newline` | HTML 주석 콘텐츠의 줄바꿈 스타일을 강제합니다. |
| `html-comment-content-spacing` | HTML 주석 콘텐츠의 공백 스타일을 강제합니다. |
| `html-comment-indent` | HTML 주석 들여쓰기를 강제합니다. |
| `match-component-file-name` | 컴포넌트 이름이 파일 이름과 일치하도록 요구합니다. |
| `match-component-import-name` | 등록된 컴포넌트 이름이 import 이름과 일치하도록 요구합니다. |
| `max-lines-per-block` | Vue SFC block별 최대 줄 수를 제한합니다. |
| `max-props` | Vue 컴포넌트 prop 개수의 최대값을 제한합니다. |
| `max-template-depth` | template 중첩 깊이의 최대값을 제한합니다. |
| `new-line-between-multi-line-property` | Vue 컴포넌트의 여러 줄 속성 사이에 빈 줄을 요구합니다. |
| `next-tick-style` | `nextTick`을 Promise 또는 callback 중 지정한 방식으로 쓰도록 강제합니다. |
| `no-bare-strings-in-template` | `<template>` 안의 bare string 사용을 금지합니다. |
| `no-boolean-default` | boolean prop 기본값 사용을 제한합니다. |
| `no-duplicate-attr-inheritance` | `v-bind="$attrs"` 사용 시 `inheritAttrs: false` 설정을 강제합니다. |
| `no-duplicate-class-names` | class attribute 안의 중복 class 이름을 금지합니다. |
| `no-empty-component-block` | `<template>`, `<script>`, `<style>` block이 비어 있는 것을 금지합니다. |
| `no-import-compiler-macros` | Vue compiler macro를 import하는 것을 금지합니다. |
| `no-literals-in-template` | template 안의 객체, 배열, 함수 literal 사용을 금지합니다. |
| `no-multiple-objects-in-class` | class 배열에 여러 객체를 전달하는 것을 금지합니다. |
| `no-negated-v-if-condition` | `v-if` / `v-else` 조건에 부정 조건을 쓰는 것을 금지합니다. |
| `no-potential-component-option-typo` | 컴포넌트 옵션 이름의 잠재적인 오타를 금지합니다. |
| `no-ref-object-reactivity-loss` | ref 객체의 반응성을 잃게 만들 수 있는 사용을 금지합니다. |
| `no-restricted-block` | 지정한 SFC block 사용을 금지합니다. |
| `no-restricted-call-after-await` | `await` 이후 지정한 메서드 호출을 금지합니다. |
| `no-restricted-class` | Vue 컴포넌트에서 지정한 class 사용을 금지합니다. |
| `no-restricted-component-names` | 지정한 컴포넌트 이름 사용을 금지합니다. |
| `no-restricted-component-options` | 지정한 컴포넌트 옵션 사용을 금지합니다. |
| `no-restricted-custom-event` | 지정한 custom event 사용을 금지합니다. |
| `no-restricted-html-elements` | 지정한 HTML 요소 사용을 금지합니다. |
| `no-restricted-props` | 지정한 prop 사용을 금지합니다. |
| `no-restricted-static-attribute` | 지정한 정적 attribute 사용을 금지합니다. |
| `no-restricted-v-bind` | `v-bind`에서 지정한 인자 사용을 금지합니다. |
| `no-restricted-v-on` | `v-on`에서 지정한 인자 사용을 금지합니다. |
| `no-root-v-if` | root element에 `v-if`를 사용하는 것을 금지합니다. |
| `no-setup-props-reactivity-loss` | `setup`에 전달된 `props`의 반응성을 잃게 만드는 사용을 금지합니다. |
| `no-static-inline-styles` | 정적 inline `style` attribute 사용을 금지합니다. |
| `no-template-target-blank` | `target="_blank"` 사용 시 안전한 `rel` 값을 요구합니다. |
| `no-this-in-before-route-enter` | `beforeRouteEnter` 메서드 안에서 `this` 사용을 금지합니다. |
| `no-undef-components` | `<template>`에서 정의되지 않은 컴포넌트 사용을 금지합니다. |
| `no-undef-directives` | 정의되지 않은 custom directive 사용을 금지합니다. |
| `no-undef-properties` | 정의되지 않은 property 사용을 금지합니다. |
| `no-unsupported-features` | 지정한 Vue 버전에서 지원하지 않는 문법 사용을 금지합니다. |
| `no-unused-emit-declarations` | 사용하지 않는 emit 선언을 금지합니다. |
| `no-unused-properties` | 사용하지 않는 property를 금지합니다. |
| `no-unused-refs` | 사용하지 않는 ref를 금지합니다. |
| `no-use-v-else-with-v-for` | 같은 요소에 `v-for`와 `v-else-if` 또는 `v-else`를 함께 쓰는 것을 금지합니다. |
| `no-useless-mustaches` | 불필요한 mustache interpolation을 금지합니다. |
| `no-useless-v-bind` | 불필요한 `v-bind` directive를 금지합니다. |
| `no-v-text` | `v-text` 사용을 금지합니다. |
| `padding-line-between-blocks` | SFC block 사이 빈 줄 사용 여부를 강제합니다. |
| `padding-line-between-tags` | template 형제 tag 사이 줄바꿈 사용 여부를 강제합니다. |
| `padding-lines-in-component-definition` | 컴포넌트 정의 안의 빈 줄 사용 여부를 강제합니다. |
| `prefer-define-options` | default export 대신 `defineOptions` 사용을 강제합니다. |
| `prefer-prop-type-boolean-first` | prop 타입 배열에서 `Boolean`을 앞에 두도록 강제합니다. |
| `prefer-separate-static-class` | template의 정적 class 이름을 별도 `class` attribute에 두도록 요구합니다. |
| `prefer-single-event-payload` | custom event emit에 단일 인자만 전달하도록 강제합니다. |
| `prefer-true-attribute-shorthand` | `v-bind` 값이 `true`일 때 attribute shorthand를 요구합니다. |
| `prefer-use-template-ref` | template ref에 `ref` / `shallowRef` 대신 `useTemplateRef` 사용을 요구합니다. |
| `prefer-v-model` | `:prop` / `@update:prop` 조합 대신 `v-model` 사용을 강제합니다. |
| `require-default-export` | 컴포넌트를 default export하도록 요구합니다. |
| `require-direct-export` | 컴포넌트를 직접 export하도록 요구합니다. |
| `require-emit-validator` | emits에 type 또는 validator 정의를 요구합니다. |
| `require-explicit-slots` | slot을 명시적으로 정의하도록 요구합니다. |
| `require-expose` | public property를 `expose`로 선언하도록 요구합니다. |
| `require-macro-variable-name` | compiler macro 결과 변수 이름을 지정한 형태로 강제합니다. |
| `require-name-property` | Vue 컴포넌트에 `name` property를 요구합니다. |
| `require-prop-comment` | prop에 주석을 요구합니다. |
| `require-typed-object-prop` | object prop에 type 선언을 추가하도록 강제합니다. |
| `require-typed-ref` | `ref`, `shallowRef`를 강한 타입으로 선언하도록 요구합니다. |
| `restricted-component-names` | 허용한 컴포넌트 이름만 사용하도록 강제합니다. |
| `script-indent` | `<script>` 들여쓰기를 강제합니다. |
| `slot-name-casing` | slot 이름 casing을 강제합니다. |
| `sort-keys` | `order-in-components`와 호환되는 방식으로 key 정렬을 강제합니다. |
| `static-class-names-order` | 정적 class 이름 순서를 강제합니다. |
| `v-for-delimiter-style` | `v-for` directive의 delimiter 스타일을 강제합니다. |
| `v-if-else-key` | 조건부 렌더링되는 반복 컴포넌트에 `key` attribute를 요구합니다. |
| `v-on-handler-style` | `v-on` handler 작성 스타일을 강제합니다. |

## Extension Rules

| 규칙 | 설명 |
| --- | --- |
| `array-bracket-newline` | `<template>` 안 배열 대괄호의 줄바꿈 스타일을 강제합니다. |
| `array-bracket-spacing` | `<template>` 안 배열 대괄호 내부 공백을 강제합니다. |
| `array-element-newline` | `<template>` 안 배열 요소 사이 줄바꿈을 강제합니다. |
| `arrow-spacing` | `<template>` 안 화살표 함수의 화살표 앞뒤 공백을 강제합니다. |
| `block-spacing` | `<template>` 안 블록 중괄호 내부 공백을 강제합니다. |
| `brace-style` | `<template>` 안 블록 중괄호 스타일을 강제합니다. |
| `camelcase` | `<template>` 안 식별자 camelCase 규칙을 강제합니다. |
| `comma-dangle` | `<template>` 안 trailing comma 사용 여부를 강제합니다. |
| `comma-spacing` | `<template>` 안 쉼표 앞뒤 공백을 강제합니다. |
| `comma-style` | `<template>` 안 쉼표 위치 스타일을 강제합니다. |
| `dot-location` | `<template>` 안 점 표기 줄바꿈 위치를 강제합니다. |
| `dot-notation` | `<template>` 안 가능한 경우 점 표기법을 사용하도록 강제합니다. |
| `eqeqeq` | `<template>` 안에서 `===`, `!==` 사용을 요구합니다. |
| `func-call-spacing` | `<template>` 안 함수 이름과 호출 괄호 사이 공백 사용 여부를 강제합니다. |
| `key-spacing` | `<template>` 안 객체, 타입, 인터페이스의 key 주변 공백을 강제합니다. |
| `keyword-spacing` | `<template>` 안 keyword 앞뒤 공백을 강제합니다. |
| `max-len` | `.vue` 파일의 한 줄 최대 길이를 제한합니다. |
| `multiline-ternary` | `<template>` 안 삼항 연산자 피연산자 사이 줄바꿈을 강제합니다. |
| `no-console` | `<template>` 안 `console` 사용을 금지합니다. |
| `no-constant-condition` | `<template>` 안 상수 조건식을 금지합니다. |
| `no-empty-pattern` | `<template>` 안 빈 구조 분해 패턴을 금지합니다. |
| `no-extra-parens` | `<template>` 안 불필요한 괄호를 금지합니다. |
| `no-implicit-coercion` | `<template>` 안 축약형 타입 변환을 금지합니다. |
| `no-irregular-whitespace` | `.vue` 파일 안의 불규칙한 공백 문자를 금지합니다. |
| `no-loss-of-precision` | `<template>` 안 정밀도를 잃는 숫자 literal을 금지합니다. |
| `no-negated-condition` | `<template>` 안 부정 조건을 금지합니다. |
| `no-restricted-syntax` | `<template>` 안 지정한 문법 사용을 금지합니다. |
| `no-sparse-arrays` | `<template>` 안 sparse array를 금지합니다. |
| `no-useless-concat` | `<template>` 안 불필요한 문자열 연결을 금지합니다. |
| `object-curly-newline` | `<template>` 안 객체 중괄호 줄바꿈 스타일을 강제합니다. |
| `object-curly-spacing` | `<template>` 안 객체 중괄호 내부 공백을 강제합니다. |
| `object-property-newline` | `<template>` 안 객체 property를 별도 줄에 배치하도록 강제합니다. |
| `object-shorthand` | `<template>` 안 객체 literal의 shorthand 문법 사용 여부를 강제합니다. |
| `operator-linebreak` | `<template>` 안 연산자 줄바꿈 스타일을 강제합니다. |
| `prefer-template` | `<template>` 안 문자열 연결 대신 template literal 사용을 요구합니다. |
| `quote-props` | `<template>` 안 객체 literal 등의 property 따옴표 사용 여부를 강제합니다. |
| `space-in-parens` | `<template>` 안 괄호 내부 공백을 강제합니다. |
| `space-infix-ops` | `<template>` 안 중위 연산자 주변 공백을 요구합니다. |
| `space-unary-ops` | `<template>` 안 단항 연산자 앞뒤 공백을 강제합니다. |
| `template-curly-spacing` | `<template>` 안 template string 표현식 주변 공백을 강제합니다. |
