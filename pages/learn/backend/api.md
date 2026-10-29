---
title: 백엔드 03. API 설계와 구현
description: 리소스 중심으로 URL을 설계하고 일관된 응답을 만듭니다.
outline: deep
---

# 03. API 설계와 구현

쓰는 쪽이 예측할 수 있는 API를 만드는 기준을 정리합니다.

## 리소스 중심의 URL과 메서드 설계

URL은 **명사**로, 동작은 **메서드**로 표현합니다.

```
GET    /api/todos          목록
POST   /api/todos          생성
GET    /api/todos/1        단건
PATCH  /api/todos/1        부분 수정
PUT    /api/todos/1        전체 교체
DELETE /api/todos/1        삭제
```

동사를 URL에 넣으면 메서드와 의미가 겹칩니다.

```
POST /api/getTodos        조회인데 POST
POST /api/createTodo      이미 POST가 생성을 뜻합니다
POST /api/todos/1/delete  DELETE가 있습니다
```

복수형으로 통일합니다. 하나는 `/todos`, 다른 하나는 `/user`처럼 섞이면 외울 수 없습니다.

하위 리소스는 경로를 중첩합니다. 다만 두 단계를 넘기면 복잡해집니다.

```
GET /api/users/1/todos       사용자의 할 일
GET /api/todos/1/comments    할 일의 댓글

GET /api/users/1/todos/2/comments/3/replies   너무 깊습니다
GET /api/comments/3/replies                    평평하게 둡니다
```

리소스로 표현하기 어려운 동작도 있습니다. 그때는 동사를 쓰되 예외임을 분명히 합니다.

```
POST /api/todos/1/archive
POST /api/auth/login
POST /api/reports/generate
```

## 요청이 지나가는 계층

핸들러 하나에 검증, 규칙, 쿼리를 전부 넣으면 금방 길어지고 테스트할 수 없게 됩니다. 역할을 셋으로 나눕니다.

| 계층 | 하는 일 | 모르는 것 |
| --- | --- | --- |
| 라우터 (핸들러) | 요청을 읽고 검증, 상태 코드로 응답 | 비즈니스 규칙, SQL |
| 서비스 | 비즈니스 규칙과 흐름, 트랜잭션 경계 | HTTP, 테이블 구조 |
| 리포지토리 | 질의와 저장 | HTTP, 비즈니스 규칙 |

```js
// 라우터 — HTTP만 압니다
router.post("/", async (req, res) => {
  const data = createTodoSchema.parse(req.body);
  const todo = await todoService.create(req.user.id, data);

  res.status(201).location(`/api/todos/${todo.id}`).json(todo);
});
```

```js
// 서비스 — 규칙만 압니다. res도 SQL도 쓰지 않습니다
async function create(userId, data) {
  const count = await todoRepo.countByUser(userId);
  if (count >= 100) throw new AppError(409, "LIMIT_EXCEEDED", "한도를 초과했습니다");

  return todoRepo.insert({ ...data, userId });
}
```

```js
// 리포지토리 — 질의만 압니다
function insert(todo) {
  return db.query(
    "INSERT INTO todos (user_id, title) VALUES ($1, $2) RETURNING *",
    [todo.userId, todo.title],
  );
}
```

얻는 것은 **바꿀 때의 범위**입니다. 응답 형식을 바꾸면 라우터만, 테이블을 바꾸면 리포지토리만 고칩니다. 서비스는 HTTP를 모르기 때문에 배치 작업이나 스케줄러에서도 같은 함수를 부를 수 있고, 테스트할 때 서버를 띄우지 않아도 됩니다.

처음부터 파일을 셋으로 쪼갤 필요는 없습니다. **서비스가 `res`를 만지지 않는다**는 선 하나만 지켜도 대부분의 이득을 얻습니다. 이어지는 예제에서 `todoService`와 `todoRepo`가 나오면 이 구분을 가리킵니다.

## CRUD 구현

```js
// 생성
router.post("/", async (req, res) => {
  const data = createTodoSchema.parse(req.body);
  const todo = await todoService.create(req.user.id, data);

  res.status(201).location(`/api/todos/${todo.id}`).json(todo);
});

// 단건 조회
router.get("/:id", async (req, res) => {
  const todo = await todoService.findById(req.params.id);
  if (!todo) return res.status(404).json({ message: "찾을 수 없습니다" });

  res.json(todo);
});

// 부분 수정
router.patch("/:id", async (req, res) => {
  const patch = updateTodoSchema.parse(req.body);
  const todo = await todoService.update(req.params.id, patch);

  res.json(todo);
});

// 삭제
router.delete("/:id", async (req, res) => {
  await todoService.remove(req.params.id);
  res.status(204).end();
});
```

PUT과 PATCH는 의미가 다릅니다. PUT은 **보내지 않은 필드를 비웁니다.** 일부만 고칠 때는 PATCH를 씁니다.

```http
PUT /api/todos/1
{"title":"운동"}
→ status 필드가 기본값으로 돌아갑니다

PATCH /api/todos/1
{"title":"운동"}
→ title만 바뀝니다
```

삭제는 멱등합니다. 이미 없는 것을 지워 달라고 해도 204를 주는 편이 재시도에 안전합니다.

## 입력 검증과 일관된 응답 형식

클라이언트가 보낸 값은 **전부 의심합니다.** 핸들러 첫 줄에서 검증하고, 통과한 뒤에는 믿고 씁니다.

```js
import { z } from "zod";

const createTodoSchema = z.object({
  title: z.string().trim().min(1).max(100),
  dueDate: z.coerce.date().optional(),
  status: z.enum(["todo", "doing", "done"]).default("todo"),
});
```

검증은 타입뿐 아니라 **범위와 형식**까지 봅니다. 길이 제한이 없으면 10MB짜리 제목이 들어옵니다.

응답 형식은 하나로 정해 둡니다. 성공과 실패의 모양이 매번 다르면 클라이언트가 분기를 늘려야 합니다.

```json
// 성공
{ "id": 1, "title": "공부", "status": "todo" }

// 목록
{ "items": [...], "page": { "cursor": "...", "hasNext": true } }

// 실패
{
  "code": "VALIDATION_ERROR",
  "message": "입력값을 확인해 주세요",
  "details": [{ "field": "title", "message": "1자 이상이어야 합니다" }]
}
```

`code`는 **기계가 읽는 값**, `message`는 사람이 읽는 값입니다. 클라이언트가 `message` 문자열로 분기하면 문구만 고쳐도 깨집니다.

오류를 한 곳에서 변환하면 핸들러가 깔끔해집니다.

```js
class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    Object.assign(this, { status, code, details });
  }
}

export class NotFoundError extends AppError {
  constructor(resource) {
    super(404, "NOT_FOUND", `${resource}을(를) 찾을 수 없습니다`);
  }
}
```

```js
app.use((error, req, res, next) => {
  if (error instanceof AppError) {
    return res.status(error.status).json({
      code: error.code,
      message: error.message,
      details: error.details,
    });
  }

  if (error instanceof z.ZodError) {
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "입력값을 확인해 주세요",
      details: error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      })),
    });
  }

  logger.error("처리되지 않은 오류", { error, requestId: req.id });
  res.status(500).json({ code: "INTERNAL_ERROR", message: "서버 오류" });
});
```

## 상황에 맞는 상태 코드 선택 기준

| 상황 | 코드 |
| --- | --- |
| 조회 성공 | 200 |
| 생성 성공 | 201 + `Location` |
| 삭제 성공, 본문 없음 | 204 |
| 형식이 잘못됨 (JSON 파싱 실패 등) | 400 |
| 형식은 맞지만 값이 유효하지 않음 | 422 또는 400 |
| 토큰 없음·만료 | 401 |
| 권한 없음 | 403 |
| 리소스 없음 | 404 |
| 중복·상태 충돌 | 409 |
| 요청 과다 | 429 |

**없는 것을 403으로 줄지 404로 줄지**는 보안 판단입니다. 404를 주면 "그 ID가 존재하지 않는다"가 노출되지 않습니다. 남의 리소스를 404로 응답하면 ID를 훑어 존재 여부를 알아내는 것을 막을 수 있습니다.

서버 잘못이 아닌 것을 500으로 주지 않습니다. 모니터링에서 진짜 장애와 섞입니다.

## 목록 페이지네이션, 필터링, 정렬

전체를 돌려주는 API는 데이터가 늘면 반드시 터집니다. 처음부터 제한을 둡니다.

```
GET /api/todos?status=done&sort=-createdAt&limit=20
```

오프셋 방식은 단순하지만 뒤로 갈수록 느려지고, 중간에 데이터가 추가되면 항목이 밀려 중복되거나 건너뜁니다.

```sql
SELECT * FROM todos ORDER BY created_at DESC LIMIT 20 OFFSET 10000;
```

커서 방식은 **마지막 위치를 기준**으로 다음을 가져옵니다.

```
GET /api/todos?limit=20
→ { "items": [...], "page": { "cursor": "eyJpZCI6MTIzfQ", "hasNext": true } }

GET /api/todos?limit=20&cursor=eyJpZCI6MTIzfQ
```

```sql
SELECT * FROM todos
WHERE (created_at, id) < ($1, $2)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

정렬 기준이 겹칠 수 있으므로 **고유한 값을 함께** 비교합니다. `created_at`만 쓰면 같은 시각의 항목에서 흔들립니다.

필터와 정렬은 **허용 목록**으로 받습니다. 사용자 입력을 그대로 SQL에 넣으면 인젝션이 됩니다.

```js
const SORTABLE = new Map([
  ["createdAt", "created_at"],
  ["title", "title"],
]);

function parseSort(input = "-createdAt") {
  if (typeof input !== "string") {
    throw new AppError(400, "INVALID_SORT", "정렬 기준이 잘못되었습니다");
  }

  const desc = input.startsWith("-");
  const key = desc ? input.slice(1) : input;
  const column = SORTABLE.get(key);

  if (!column) throw new AppError(400, "INVALID_SORT", "정렬 기준이 잘못되었습니다");

  return `${column} ${desc ? "DESC" : "ASC"}`;
}
```

허용 목록을 **객체 리터럴로 두고 `SORTABLE[key]`로 꺼내면 안 됩니다.** 프로토타입 체인이 걸려서 `sort=constructor`나 `sort=toString`이 `if (!column)`을 통과하고, 함수가 문자열로 변환되어 SQL에 들어갑니다. `Map`을 쓰거나 `Object.hasOwn(SORTABLE, key)`로 확인합니다.

타입도 확인합니다. `?sort[a]=b`로 보내면 `input`이 객체라서 `startsWith`에서 500이 납니다. 인젝션 관점의 설명은 [07. 서버 보안](/learn/backend/security)에 있습니다.

`limit`에는 상한과 하한을 함께 둡니다. `limit=1000000`도, `limit=-1`도 그대로 받으면 안 됩니다.

```js
const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
```

상한만 두면 음수가 지나가 `LIMIT -1`이 됩니다.

## API 버전 관리와 호환성 유지

이미 쓰고 있는 클라이언트를 깨뜨리지 않는 것이 기본입니다. **추가는 안전하고 제거와 변경은 위험합니다.**

| 변경 | 안전한가 |
| --- | --- |
| 응답에 필드 추가 | 예 |
| 선택적 요청 필드 추가 | 예 |
| 응답 필드 제거·이름 변경 | 아니오 |
| 필드 타입 변경 | 아니오 |
| 필수 요청 필드 추가 | 아니오 |

깨뜨려야 한다면 버전을 나눕니다.

```
/api/v1/todos
/api/v2/todos
```

헤더로 버전을 받는 방식도 있지만, 경로에 넣는 쪽이 디버깅과 캐싱에 단순합니다.

없애려는 필드는 바로 지우지 않고 알립니다.

```http
Deprecation: true
Sunset: Wed, 31 Dec 2026 23:59:59 GMT
Link: </api/v2/todos>; rel="successor-version"
```

응답에 필드를 더할 때, 클라이언트가 **모르는 필드를 무시하도록** 되어 있어야 합니다. 엄격하게 검증하는 클라이언트는 필드 추가만으로도 깨집니다.

## 요청·응답 예시를 포함한 API 문서 작성

문서가 코드와 따로 놀면 금방 틀려집니다. 스키마에서 생성하는 방식이 가장 오래갑니다.

```js
// zod 스키마에서 OpenAPI 문서를 생성
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
```

직접 쓴다면 OpenAPI 형식이 표준입니다.

```yaml
paths:
  /api/todos:
    post:
      summary: 할 일 생성
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [title]
              properties:
                title: { type: string, maxLength: 100 }
            example:
              title: "공부"
      responses:
        "201":
          description: 생성됨
          content:
            application/json:
              example:
                id: 1
                title: "공부"
                status: "todo"
        "400":
          description: 입력값 오류
```

문서에 꼭 들어가야 하는 것들입니다.

- 실제로 복사해 쓸 수 있는 **요청·응답 예시**
- **실패 응답**과 그때의 `code` 목록
- 인증 방법
- 페이지네이션 사용법
- 제한 사항 (크기, 횟수)

성공 예시만 있는 문서는 절반입니다. 클라이언트가 가장 많이 묻는 것은 "실패하면 뭐가 오나요"입니다.
