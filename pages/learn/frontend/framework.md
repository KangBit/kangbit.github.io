---
title: 프론트엔드 심화 · 프레임워크
description: 상태와 화면을 연결하는 프레임워크의 공통 개념과 선택 기준을 정리합니다.
outline: deep
---

# 프레임워크

기본기를 마쳤다면 직접 DOM을 다루는 코드가 어디서 무너지는지 보입니다. 프레임워크가 그 자리를 어떻게 대신하는지 정리합니다.

## 직접 DOM을 다룰 때 생기는 문제

상태를 바꾸는 자리마다 화면을 고치는 코드를 함께 적어야 합니다.

```js
function addTodo(title) {
  const todo = { id: crypto.randomUUID(), title, done: false };
  todos.push(todo);

  list.append(createItem(todo));                       // 목록
  counter.textContent = `${countLeft(todos)}개 남음`;   // 개수
  emptyMessage.hidden = true;                          // 빈 상태
}
```

삭제, 수정, 필터에도 같은 세 줄이 필요합니다. 하나를 빠뜨리면 데이터와 화면이 어긋나고, 그 버그는 재현하기 어렵습니다.

프레임워크는 이 관계를 뒤집습니다. **상태를 바꾸면 화면이 따라옵니다.**

```jsx
function TodoApp() {
  const [todos, setTodos] = useState([]);
  const left = todos.filter((todo) => !todo.done).length;

  function addTodo(title) {
    setTodos([...todos, { id: crypto.randomUUID(), title, done: false }]);
  }

  return (
    <>
      <TodoList todos={todos} />
      <p>{left}개 남음</p>
    </>
  );
}
```

화면을 고치는 코드가 사라졌습니다. 갱신을 빠뜨릴 자리 자체가 없어집니다.

## 하나를 골라 깊게 익히기

| 프레임워크 | 갱신 방식 | 특징 |
| --- | --- | --- |
| React | 가상 DOM | 생태계가 가장 넓습니다. 채용 수요도 많습니다 |
| Vue | 가상 DOM + 반응성 | 템플릿 문법이 HTML에 가깝습니다 |
| Angular | 변경 감지 | 라우터·폼·HTTP가 모두 들어 있습니다 |
| Svelte | 컴파일 시 변환 | 런타임이 작고 문법이 간결합니다 |
| Solid | 세밀한 반응성 | JSX를 쓰지만 재렌더가 없습니다 |

공통 개념은 거의 같습니다. 컴포넌트, props, 상태, 렌더링 주기, 라우팅. 하나를 깊게 익히면 다른 것은 문법만 다릅니다.

::: tip
둘을 얕게 아는 것보다 하나로 제품을 끝까지 만들어 보는 편이 낫습니다. 비교는 그다음입니다.
:::

## 컴포넌트 분리

나누는 기준은 재사용이 아니라 **상태의 경계**입니다.

```
TodoApp        todos 상태를 가집니다
 ├ TodoInput   입력값만 가집니다
 ├ TodoList    상태 없이 받은 것을 그립니다
 │  └ TodoItem 상태 없이 받은 것을 그립니다
 └ TodoFilter  현재 필터를 받습니다
```

상태를 가진 컴포넌트와 받아서 그리기만 하는 컴포넌트를 구분하면 테스트가 쉬워집니다. 뒤쪽은 props만 넣으면 그대로 검증됩니다.

너무 잘게 쪼개면 props가 여러 단계를 지나갑니다.

```jsx
<Page user={user}>
  <Layout user={user}>
    <Header user={user}>
      <Avatar user={user} />   {/* 세 단계를 거쳐 왔습니다 */}
```

이럴 때 전역 상태나 컨텍스트를 꺼냅니다. 처음부터 꺼내지는 않습니다.

## 상태 관리

상태는 쓰는 곳에 가장 가깝게 둡니다. 올리는 것은 공유가 필요해진 다음입니다.

```
컴포넌트 안        → useState
형제끼리 공유      → 공통 부모로 올리기
앱 전체에서 공유   → 컨텍스트나 전역 상태 라이브러리
```

더 중요한 구분은 **서버 상태와 클라이언트 상태**입니다.

| | 서버 상태 | 클라이언트 상태 |
| --- | --- | --- |
| 예 | 할 일 목록, 사용자 정보 | 열린 모달, 선택한 탭, 입력 중인 값 |
| 주인 | 서버 | 브라우저 |
| 문제 | 오래됨, 로딩, 실패, 재검증 | 없음 |

서버 상태를 전역 스토어에 복사해 두면 언제 다시 불러올지를 직접 관리해야 합니다. TanStack Query 같은 도구가 캐시, 재검증, 중복 요청 제거를 맡습니다. 전역 상태 라이브러리는 그러고도 남는 것에만 씁니다.

파생할 수 있는 값은 상태로 두지 않습니다.

```jsx
const [todos, setTodos] = useState([]);
const [left, setLeft] = useState(0);   // 어긋날 수 있습니다

const left = todos.filter((todo) => !todo.done).length;   // 항상 맞습니다
```

## 렌더링 주기와 불필요한 렌더

상태가 바뀌면 그 컴포넌트와 자식이 다시 그려집니다. 대부분은 빠르고, 문제가 되는 것은 긴 목록과 무거운 계산입니다.

목록에는 안정적인 key가 필요합니다.

```jsx
{todos.map((todo, index) => <TodoItem key={index} />)}   // 순서가 바뀌면 깨집니다
{todos.map((todo) => <TodoItem key={todo.id} />)}        // 항목을 따라갑니다
```

인덱스를 key로 쓰면 항목을 지웠을 때 체크박스 상태가 옆 항목으로 옮겨 가는 식의 버그가 생깁니다.

메모이제이션은 **측정한 다음에** 넣습니다.

```jsx
const sorted = useMemo(() => heavySort(todos), [todos]);
```

미리 감싸 두면 비교 비용만 늘고 코드가 읽기 어려워집니다. 개발자 도구의 프로파일러로 실제로 오래 걸리는 컴포넌트를 먼저 찾습니다.

## 클라이언트 라우팅

주소가 곧 상태입니다. 같은 주소를 열면 같은 화면이 나와야 합니다.

```jsx
<Route path="/todos" element={<TodoList />} />
<Route path="/todos/:id" element={<TodoDetail />} />
```

필터나 검색어처럼 공유·새로고침해도 유지되어야 하는 값은 쿼리 문자열에 둡니다.

```
/todos?filter=done&sort=created
```

화면 단위로 코드를 나누면 첫 로딩에 필요한 양이 줄어듭니다.

```jsx
const Settings = lazy(() => import("./Settings"));
```

라우트를 추가할 때 404 화면과 권한 없는 접근도 같이 정합니다. 나중에 붙이면 빠지는 자리가 생깁니다.

## 데이터 패칭

비동기 처리에서 다룬 상태 구분이 그대로 필요합니다.

```jsx
if (query.isPending) return <Skeleton />;
if (query.isError) return <ErrorBox onRetry={query.refetch} />;
if (query.data.length === 0) return <Empty />;
return <TodoList todos={query.data} />;
```

직접 구현하면 요청 취소, 응답 순서, 중복 요청, 캐시 만료를 전부 손으로 다뤄야 합니다. 화면 두세 개를 넘어가면 라이브러리를 쓰는 편이 빠릅니다.

데이터를 가져오는 위치도 선택지입니다. 컴포넌트가 마운트된 뒤 가져오면 폭포수가 생기고, 라우트 단계에서 미리 시작하면 겹칩니다.

```
마운트 후: 레이아웃 → 목록 → 상세   (순차)
라우트에서: 목록 + 상세 동시 시작    (병렬)
```

## 디자인 시스템: 토큰, 공용 컴포넌트와 문서화

화면이 늘어나면 같은 버튼이 조금씩 다른 모양으로 열 개쯤 생깁니다. 값을 먼저 이름으로 묶습니다.

```css
:root {
  --color-accent: #2563eb;
  --space-2: 8px;
  --radius-md: 6px;
}
```

그 위에 공용 컴포넌트를 올립니다. 변형은 속성으로 받습니다.

```jsx
<Button variant="primary" size="sm">저장</Button>
```

마지막은 문서입니다. 어떤 컴포넌트가 있고 언제 쓰는지 볼 수 없으면 결국 새로 만듭니다. Storybook처럼 상태별로 모아 보는 도구를 쓰면 접근성과 다크 모드도 한자리에서 확인할 수 있습니다.

프레임워크를 바꿔도 남는 자산은 이 토큰과 규칙입니다. 코드보다 오래갑니다.
