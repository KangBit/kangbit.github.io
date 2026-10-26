---
title: 프론트엔드 10. 개발 도구와 TypeScript
description: 빌드와 검사 도구를 갖추고 타입으로 유지보수성을 높입니다.
outline: deep
---

# 10. 개발 도구와 TypeScript

코드를 자동으로 검사하고, 바꾸기 쉬운 구조로 만드는 도구들을 정리합니다.

## 패키지 관리와 개발·프로덕션 빌드 구분

`package.json`이 프로젝트의 명령과 의존성을 담습니다.

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "test": "vitest"
  },
  "dependencies": {},
  "devDependencies": {
    "vite": "^6.0.0",
    "typescript": "^5.7.0"
  }
}
```

`dependencies`는 실행에 필요한 것, `devDependencies`는 개발·빌드에만 쓰는 것입니다. 프런트엔드는 번들에 포함될 것만 `dependencies`에 둡니다.

버전 앞 기호가 갱신 범위를 정합니다.

| 표기 | 범위 |
| --- | --- |
| `^1.2.3` | `1.x.x` 최신 |
| `~1.2.3` | `1.2.x` 최신 |
| `1.2.3` | 고정 |

락 파일(`pnpm-lock.yaml`, `package-lock.json`)이 실제 설치 버전을 고정합니다. 반드시 저장소에 함께 둡니다. 없으면 "제 컴퓨터에서는 되는데"가 생깁니다.

개발과 프로덕션 빌드는 하는 일이 다릅니다.

| | 개발 | 프로덕션 |
| --- | --- | --- |
| 변환 | 최소한, 빠르게 | 최적화 |
| 소스맵 | 전체 | 선택 |
| 압축 | 안 함 | 함 |
| 갱신 | HMR로 즉시 | 없음 |

```bash
npm run dev      # 개발 서버
npm run build    # dist/ 생성
npm run preview  # 빌드 결과를 로컬에서 확인
```

`build` 결과를 한 번은 직접 열어 봐야 합니다. 개발에서는 되는데 빌드 후 깨지는 경우가 있습니다. 경로 설정과 환경 변수가 주된 원인입니다.

## 번들러의 모듈 그래프와 트리 셰이킹

번들러는 진입점에서 시작해 `import`를 따라가며 **그래프**를 만들고, 필요한 것만 모아 파일로 냅니다.

```
main.js → todo.js → format.js
        → view.js  → format.js   (한 번만 포함됩니다)
```

쓰지 않는 export는 빼는 것이 트리 셰이킹입니다. ESM의 정적 구조 덕분에 가능합니다.

```js
// util.js
export function used() {}
export function unused() {}   // 빌드 결과에서 빠집니다
```

작동하지 않는 경우가 있습니다.

```js
// CommonJS는 정적으로 분석되지 않습니다
const util = require("./util");

// 부수 효과가 있으면 지우지 못합니다
import "./polyfill.js";
```

패키지가 `"sideEffects": false`를 선언하면 번들러가 더 공격적으로 제거합니다. CSS를 import하는 패키지라면 그 파일을 예외로 적어야 합니다.

```json
{ "sideEffects": ["*.css"] }
```

## 소스맵으로 빌드된 코드 디버깅하기

압축된 코드는 읽을 수 없습니다. 소스맵이 원본과 연결해 줍니다.

```js
// vite.config.js
export default {
  build: { sourcemap: true },
};
```

소스맵이 있으면 개발자 도구에서 원본 파일과 줄 번호가 보이고, 오류 추적 도구도 정확한 위치를 알려 줍니다.

공개 서버에 올릴지는 선택입니다. 올리면 누구나 원본 코드를 볼 수 있습니다. 오류 추적 서비스에만 업로드하고 공개 경로에는 두지 않는 방식이 흔합니다.

```js
build: { sourcemap: "hidden" }   // 생성하되 참조 주석은 넣지 않습니다
```

## 코드 포맷, 정적 분석과 실행 스크립트

둘은 역할이 다릅니다.

- **Prettier** — 줄바꿈, 따옴표, 들여쓰기 같은 **모양**을 통일합니다. 동작은 바꾸지 않습니다
- **ESLint** — 실행하지 않고 코드를 읽어 **문제가 될 패턴**을 찾습니다

```bash
npx prettier --write .
npx eslint . --fix
```

ESLint가 잡아 주는 것들입니다.

```js
const unused = 1;              // 쓰지 않는 변수

async function load() {
  fetch("/api");               // 빠뜨린 await
}

if (value = 1) {}              // == 대신 =

useEffect(() => {}, []);       // 빠뜨린 의존성 (React 플러그인)
```

설정은 프로젝트에 맞게 고르되, 규칙을 과하게 늘리지 않는 편이 좋습니다. 경고가 많아지면 전부 무시하게 됩니다.

저장할 때 자동으로 돌아가게 하고, 커밋 전에도 한 번 거르면 손이 덜 갑니다.

```json
{
  "lint-staged": {
    "*.{js,ts}": ["eslint --fix", "prettier --write"]
  }
}
```

## 파일과 모듈의 책임 분리

기술 종류로 나누는 방식과 기능으로 나누는 방식이 있습니다.

```
src/components/  src/utils/  src/api/     # 기술별
src/todo/  src/user/  src/shared/          # 기능별
```

작은 프로젝트는 기술별이 단순합니다. 커질수록 기능별이 찾기 쉽습니다. 하나를 고칠 때 폴더 여러 개를 오가지 않기 때문입니다.

어느 쪽이든 **화면을 모르는 코드**를 떼어 두는 것이 핵심입니다.

```
todo.ts       데이터 규칙 — 브라우저 없이 실행됩니다
api.ts        서버 통신
view.ts       DOM 조작
main.ts       연결
```

의존 방향을 한쪽으로 유지합니다. `todo.ts`가 `view.ts`를 가져오기 시작하면 테스트할 수 없게 됩니다.

## TypeScript 기본 타입, 유니온, 타입 좁히기와 제네릭

::: tip
문법은 [TypeScript 로드맵](/learn/languages/typescript/)에서 더 자세히 다룹니다. 여기서는 프런트엔드 코드에서 자주 쓰는 모양을 봅니다.
:::

데이터 모델을 먼저 정의합니다.

```ts
interface Todo {
  id: string;
  title: string;
  done: boolean;
}

type Filter = "all" | "todo" | "done";
```

화면 상태는 **판별 유니온**으로 두면 불가능한 조합이 막힙니다.

```ts
type State =
  | { status: "loading" }
  | { status: "success"; todos: Todo[] }
  | { status: "error"; message: string };

function render(state: State) {
  switch (state.status) {
    case "loading":
      return renderSkeleton();
    case "success":
      return renderList(state.todos);   // todos는 여기에만 있습니다
    case "error":
      return renderError(state.message);
  }
}
```

로딩 중인데 데이터를 읽는 코드는 컴파일되지 않습니다. 속성을 모두 선택적으로 두면 이 보호가 사라집니다.

DOM API는 `null`을 돌려줄 수 있어 확인이 필요합니다.

```ts
const input = document.querySelector("#title");
input.value;   // 오류: Element | null

const input = document.querySelector<HTMLInputElement>("#title");
if (!input) throw new Error("#title을 찾을 수 없습니다");
input.value;   // 통과
```

제네릭은 여러 모델에 같은 함수를 쓸 때 꺼냅니다.

```ts
async function request<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(String(response.status));
  return response.json();
}

const todos = await request<Todo[]>("/api/todos");
```

다만 이 코드는 타입을 **선언만 했을 뿐 확인하지 않습니다.** 다음 절의 문제입니다.

## 컴파일 시 타입 검사와 런타임 데이터 검증의 차이

타입은 컴파일 후 사라집니다. **밖에서 들어온 값은 아무도 확인하지 않습니다.**

```ts
const todos = await request<Todo[]>("/api/todos");
```

서버가 `title` 대신 `name`을 보내도 컴파일은 통과합니다. 오류는 한참 뒤 화면을 그리는 곳에서 터지고, 원인을 찾기 어렵습니다.

경계에서 한 번 확인합니다.

```ts
function parseTodo(value: unknown): Todo {
  if (typeof value !== "object" || value === null) {
    throw new Error("객체가 아닙니다");
  }

  const { id, title, done } = value as Record<string, unknown>;

  if (typeof id !== "string") throw new Error("id가 문자열이 아닙니다");
  if (typeof title !== "string") throw new Error("title이 문자열이 아닙니다");

  return { id, title, done: Boolean(done) };
}
```

손으로 쓰면 길어지므로 보통 스키마 라이브러리를 씁니다.

```ts
import { z } from "zod";

const TodoSchema = z.object({
  id: z.string(),
  title: z.string(),
  done: z.boolean(),
});

type Todo = z.infer<typeof TodoSchema>;   // 스키마에서 타입을 뽑습니다

const todos = z.array(TodoSchema).parse(await response.json());
```

검증이 필요한 자리는 API 응답만이 아닙니다.

- `localStorage`에서 읽은 JSON — 예전 버전이 남아 있을 수 있습니다
- URL 쿼리와 라우트 파라미터 — 사용자가 직접 고칠 수 있습니다
- 폼 입력값
- 환경 변수 — 전부 `string | undefined`입니다

```ts
const filter = new URLSearchParams(location.search).get("filter");
const safe: Filter = ["all", "todo", "done"].includes(filter ?? "")
  ? (filter as Filter)
  : "all";
```

바깥에서 안으로 들어오는 모든 자리에 관문을 하나씩 두고, 그 안쪽에서는 타입을 믿고 씁니다.

타입 단언(`as`)은 검사를 끄는 것입니다. 꼭 써야 한다면 왜 안전한지 주석으로 남깁니다.
