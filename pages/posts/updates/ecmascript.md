---
title: Updates
titleTemplate: ECMAScript
# description:
# outline:
prev: false
next: false
comment: true
---

# ECMAScript

## ES2026

- Array.fromAsync (비동기 이터러블 → 배열)
- Error.isError (`instanceof Error`보다 안전한 에러 판별)
- Math.sumPrecise (부동소수점 오차 없는 합계)
- Uint8Array Base64 / Hex 변환 (`toBase64` / `fromBase64` / `toHex` / `fromHex`)
- Iterator.concat (이터레이터 이어붙이기)
- JSON.parse source 접근 (reviver의 `source` / `JSON.rawJSON`)
- Map / WeakMap getOrInsert (upsert)

## ES2025

- Set 메서드 (intersection / union / difference / ...)
- Iterator helpers (map / filter / take / drop ...)
- Import Attributes (`with { type: "json" }`)
- JSON Modules
- Promise.try
- RegExp.escape
- RegExp 인라인 모디파이어 (`(?i:...)` / `(?-i:...)`)
- RegExp 중복 명명 캡처 그룹 (서로 다른 분기에서 같은 이름 허용)
- Float16Array / Math.f16round / DataView getFloat16 · setFloat16

## ES2024

- Object.groupBy / Map.groupBy
- Promise.withResolvers

## ES2023

- Array.prototype.findLast
- Array.prototype.findLastIndex
- Array.prototype.toSorted
- Array.prototype.toReversed
- Array.prototype.toSpliced
- Array.prototype.with

## ES2022

- Class 필드 개선 (프라이빗 접근 제어자, 퍼블릭 필드 / 정적필드 선언 방식)
- 최상위 레벨 await
- Array.prototype.at
- Object.hasOwn
- Error Cause (`new Error(msg, { cause })`)

## ES2021

- numeric separators
- replaceAll
- Logical assignment
- Promise.any

## ES2020

- BigInt
- nullish coalescing
- Promise.allSettled
- optional chaining
- globalThis
- String.prototype.matchAll
- 동적 import (`import()`)
- import.meta

## ES2019

- Object.fromEntries
- String trim
- Array.prototype.flat
- Array.prototype.flatMap
- Optional catch binding

## ES2018

- Object Rest/Spread
- Promise finally
- Async iteration
- RegExp 명명 캡처 그룹 `(?<name>...)`
- RegExp Lookbehind `(?<=...)`
- RegExp `s`(dotAll) flag

## ES2017

- async / await
- Object.values
- Object.entries
- String Padding
- Trailing commas in function parameter lists and calls

## ES2016

- \*\* 연산자
- Array.prototype.includes

## ES6

- Let and Const
- Template Literals
- Arrow Functions
- Promise
- Default Parameters
- Destructuring Assignment
- Enhanced Object Literals
- Class
- Module
- Spread / Rest (배열 · 함수 인자)
- Generators (`function*` / `yield`)
- Iterators / `for...of`
- Map / Set / WeakMap / WeakSet
- Symbol
- Proxy / Reflect
