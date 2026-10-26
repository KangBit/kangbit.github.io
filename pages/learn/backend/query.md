---
title: 백엔드 05. 쿼리 성능과 트랜잭션
description: 느린 질의를 찾아 고치고 동시 접근을 안전하게 다룹니다.
outline: deep
---

# 05. 쿼리 성능과 트랜잭션

데이터가 쌓여도 느려지지 않게 하는 방법과, 여러 요청이 같은 데이터를 건드릴 때의 규칙을 정리합니다.

## 인덱스의 동작과 복합 인덱스의 컬럼 순서

인덱스는 정렬된 사본입니다. 전체를 훑지 않고 찾아 들어갑니다.

```sql
CREATE INDEX idx_todos_user_created ON todos (user_id, created_at DESC);
```

**컬럼 순서가 핵심입니다.** 인덱스는 왼쪽부터 순서대로만 쓸 수 있습니다.

```sql
-- (user_id, created_at) 인덱스에서

WHERE user_id = 1                        -- 사용됩니다
WHERE user_id = 1 AND created_at > ...   -- 사용됩니다
WHERE created_at > ...                   -- 사용되지 않습니다
```

전화번호부를 성으로 정렬해 두면 이름만으로는 찾을 수 없는 것과 같습니다.

**구분력이 낮은 컬럼을 앞에 두지 않습니다.** 값이 두세 가지뿐인 컬럼을 선두에 두면 걸러지는 양이 적어 인덱스 효과가 거의 없습니다.

```sql
-- done은 true/false뿐이라 선두로는 의미가 약합니다
CREATE INDEX idx_bad ON todos (done, created_at);

-- 구분력 높은 컬럼을 앞에
CREATE INDEX idx_good ON todos (user_id, created_at DESC);
```

컬럼에 함수를 씌우면 인덱스를 못 씁니다.

```sql
WHERE DATE(created_at) = '2026-10-26'        -- 인덱스 사용 불가
WHERE created_at >= '2026-10-26'
  AND created_at <  '2026-10-27'             -- 범위로 바꿉니다

WHERE LOWER(email) = 'a@b.com'               -- 사용 불가
CREATE INDEX idx_email_lower ON users (LOWER(email));   -- 식 인덱스를 만들거나
```

앞이 열린 `LIKE`도 마찬가지입니다.

```sql
WHERE title LIKE '공부%'    -- 사용 가능
WHERE title LIKE '%공부%'   -- 사용 불가 — 전문 검색을 고려합니다
```

인덱스에는 비용이 있습니다. 쓰기마다 함께 갱신되고 공간을 차지합니다. 읽기가 느린 곳에만 만들고, 쓰지 않는 인덱스는 지웁니다.

```sql
-- PostgreSQL: 사용되지 않는 인덱스 찾기
SELECT indexrelname, idx_scan FROM pg_stat_user_indexes WHERE idx_scan = 0;
```

## 실행 계획 읽기

추측 대신 DB에게 물어봅니다.

```sql
EXPLAIN ANALYZE
SELECT * FROM todos WHERE user_id = 1 ORDER BY created_at DESC LIMIT 20;
```

```
Limit  (cost=0.43..8.45 rows=20) (actual time=0.02..0.05 rows=20 loops=1)
  ->  Index Scan using idx_todos_user_created on todos
        Index Cond: (user_id = 1)
Planning Time: 0.1 ms
Execution Time: 0.08 ms
```

볼 것은 세 가지입니다.

- **Seq Scan**이 큰 테이블에 나오는가 — 인덱스를 못 쓰고 있습니다
- **rows 추정치와 actual이 크게 다른가** — 통계가 오래됐을 수 있습니다
- 어느 단계가 시간을 **가장 많이 쓰는가**

`EXPLAIN`은 계획만 보여 주고, `EXPLAIN ANALYZE`는 실제로 실행합니다. 쓰기 쿼리에 `ANALYZE`를 붙이면 진짜로 데이터가 바뀌므로 트랜잭션 안에서 돌리고 롤백합니다.

작은 테이블에서는 Seq Scan이 더 빠를 수도 있습니다. 전체가 몇 백 행이면 인덱스를 거치는 것이 오히려 손해입니다.

## N+1 문제가 생기는 지점과 해결 방법

목록을 가져온 뒤, 각 항목마다 추가 질의를 보내는 패턴입니다.

```js
const todos = await db.query("SELECT * FROM todos LIMIT 20");   // 1번

for (const todo of todos) {
  todo.user = await db.query("SELECT * FROM users WHERE id = $1", [todo.userId]);
}
// 20번 더 — 합계 21번
```

목록이 20건이면 21번, 100건이면 101번입니다. 각각은 빠른데 합치면 느립니다.

ORM을 쓸 때 **자기도 모르게** 발생하는 경우가 많습니다. 관계 속성에 접근하는 순간 쿼리가 나갑니다.

해결은 한 번에 가져오는 것입니다.

```js
// 조인
const rows = await db.query(`
  SELECT t.*, u.email
  FROM todos t
  JOIN users u ON u.id = t.user_id
  LIMIT 20
`);
```

```js
// 또는 두 번에 나눠 가져와 메모리에서 묶습니다
const todos = await db.query("SELECT * FROM todos LIMIT 20");
const userIds = [...new Set(todos.map((t) => t.userId))];

const users = await db.query("SELECT * FROM users WHERE id = ANY($1)", [userIds]);
const userById = new Map(users.map((u) => [u.id, u]));

todos.forEach((t) => (t.user = userById.get(t.userId)));
```

ORM에는 보통 전용 옵션이 있습니다.

```js
// Prisma
prisma.todo.findMany({ include: { user: true } });

// TypeORM
repo.find({ relations: ["user"] });
```

개발 중에 **쿼리 로그를 켜 두면** 바로 눈에 띕니다. 같은 모양의 쿼리가 줄줄이 찍히면 N+1입니다.

## 트랜잭션과 격리 수준, 교착 상태

여러 작업을 **전부 성공하거나 전부 취소**되게 묶습니다.

```js
await db.transaction(async (tx) => {
  await tx.query("UPDATE accounts SET balance = balance - $1 WHERE id = $2", [amount, from]);
  await tx.query("UPDATE accounts SET balance = balance + $1 WHERE id = $2", [amount, to]);
});
```

중간에 오류가 나면 둘 다 되돌아갑니다. 돈이 사라지는 상황을 막습니다.

격리 수준은 **다른 트랜잭션의 작업이 얼마나 보이는지**를 정합니다.

| 수준 | 막아 주는 것 |
| --- | --- |
| Read Uncommitted | 거의 없음 |
| Read Committed | 커밋되지 않은 값 읽기 (PostgreSQL 기본) |
| Repeatable Read | 같은 질의의 결과가 중간에 바뀌는 것 (MySQL 기본) |
| Serializable | 거의 전부 — 대신 충돌이 잦습니다 |

기본값으로 충분한 경우가 대부분입니다. 다만 "읽고 판단해서 쓰는" 흐름에는 함정이 있습니다.

```js
// 두 요청이 동시에 들어오면 둘 다 통과합니다
const count = await tx.query("SELECT COUNT(*) FROM todos WHERE user_id = $1", [userId]);
if (count >= 100) throw new Error("한도 초과");

await tx.query("INSERT INTO todos ...");
```

읽는 시점에 잠금을 걸거나, DB 제약으로 막습니다.

```sql
SELECT * FROM accounts WHERE id = $1 FOR UPDATE;   -- 다른 트랜잭션이 기다립니다
```

교착 상태는 서로 상대가 잡은 것을 기다릴 때 생깁니다.

```
트랜잭션 A: 1번 잠금 → 2번 요청
트랜잭션 B: 2번 잠금 → 1번 요청
```

DB가 감지해서 한쪽을 실패시킵니다. 예방법은 **항상 같은 순서로 잠그는 것**입니다.

```js
const [first, second] = [fromId, toId].sort((a, b) => a - b);
```

트랜잭션은 **짧게** 유지합니다. 안에서 외부 API를 호출하면 그동안 잠금이 유지되어 다른 요청이 전부 밀립니다.

```js
// 위험합니다
await db.transaction(async (tx) => {
  await tx.query("UPDATE ...");
  await fetch("https://payment.example.com/charge");   // 몇 초가 걸릴 수 있습니다
});
```

## 커넥션 풀과 동시 접속 처리

DB 연결은 만드는 데 비용이 큽니다. 미리 만들어 두고 돌려씁니다.

```js
const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,                      // 최대 연결 수
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});
```

풀 크기는 크게 잡는다고 빨라지지 않습니다. DB가 감당할 수 있는 동시 연결 수가 한계이고, 넘기면 오히려 느려집니다.

**서버 인스턴스 수 × 풀 크기**가 DB의 최대 연결 수를 넘지 않아야 합니다. 서버를 10대로 늘렸는데 각각 풀을 20으로 잡으면 200개 연결을 요구합니다.

연결을 빌린 뒤 반납하지 않으면 풀이 말라 모든 요청이 멈춥니다.

```js
const client = await pool.connect();
try {
  await client.query("...");
} finally {
  client.release();   // 반드시 반납합니다
}
```

서버리스 환경에서는 인스턴스가 수시로 생겼다 사라져 연결이 폭증합니다. 이때는 외부 커넥션 풀러(PgBouncer 등)를 앞에 둡니다.

## 매개변수 바인딩과 스키마 마이그레이션

값을 문자열로 이어 붙이면 SQL 인젝션이 됩니다.

```js
// 절대 하지 않습니다
db.query(`SELECT * FROM todos WHERE title = '${title}'`);

// 매개변수로 넘깁니다
db.query("SELECT * FROM todos WHERE title = $1", [title]);
```

바인딩하면 값은 **데이터로만** 취급되어 SQL 문법으로 해석되지 않습니다. 자세한 내용은 [07. 서버 보안](/learn/backend/security)에서 다룹니다.

테이블 이름이나 컬럼 이름은 바인딩할 수 없습니다. 허용 목록으로 검증해야 합니다.

스키마 변경은 **파일로 기록하고 순서대로** 적용합니다.

```
migrations/
├── 001_create_users.sql
├── 002_create_todos.sql
└── 003_add_todos_due_date.sql
```

```sql
-- 003_add_todos_due_date.sql
ALTER TABLE todos ADD COLUMN due_date DATE;
CREATE INDEX CONCURRENTLY idx_todos_due_date ON todos (due_date);
```

운영 중인 테이블에 거는 작업은 **잠금 시간**을 확인해야 합니다.

- `CREATE INDEX`는 테이블을 잠급니다 → PostgreSQL은 `CONCURRENTLY`를 씁니다
- `NOT NULL` 컬럼을 기본값과 함께 추가하면 전체 행을 다시 씁니다
- 컬럼 타입 변경은 대부분 전체 재작성입니다

안전하게 바꾸는 방법은 단계를 나누는 것입니다.

```
1. 새 컬럼 추가 (nullable)
2. 코드가 양쪽에 쓰도록 배포
3. 기존 데이터 채우기 (배치로 나눠서)
4. NOT NULL 제약 추가
5. 옛 컬럼 제거
```

한 번에 바꾸려다 테이블이 몇 분간 잠기면 그 시간 동안 서비스가 멈춥니다.
