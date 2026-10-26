---
title: 백엔드 04. 데이터 모델링과 SQL
description: 테이블 구조를 설계하고 SQL로 질의합니다.
outline: deep
---

# 04. 데이터 모델링과 SQL

데이터를 어떤 모양으로 저장할지 정하고, 원하는 결과를 꺼내는 방법을 정리합니다.

## 관계형 데이터베이스와 SQL 기초

데이터를 표로 나누어 저장하고, 필요할 때 연결해서 꺼냅니다.

```sql
SELECT id, title, done
FROM todos
WHERE user_id = 1 AND done = false
ORDER BY created_at DESC
LIMIT 20;
```

실행 순서는 적는 순서와 다릅니다.

```
FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
```

`SELECT`가 뒤에 오기 때문에 `SELECT`에서 붙인 별칭을 `WHERE`에서 쓸 수 없습니다. `ORDER BY`에서는 쓸 수 있습니다.

`NULL`은 "값이 없음"이라 비교가 성립하지 않습니다.

```sql
WHERE memo = NULL       -- 아무것도 걸리지 않습니다
WHERE memo IS NULL      -- 이렇게 씁니다

SELECT COUNT(*)         -- 모든 행
SELECT COUNT(memo)      -- memo가 NULL이 아닌 행만
```

`NOT IN`에 `NULL`이 섞이면 결과가 통째로 비어 버립니다. `NOT EXISTS`가 안전합니다.

## 테이블 설계, 기본 키, 외래 키, 제약 조건

```sql
CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE todos (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(100) NOT NULL,
    status      todo_status NOT NULL DEFAULT 'todo',
    due_date    DATE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT title_not_blank CHECK (length(trim(title)) > 0)
);
```

제약 조건은 **데이터베이스가 지켜 주는 규칙**입니다. 애플리케이션 코드가 여러 개이거나 누군가 콘솔에서 직접 넣어도 깨지지 않습니다.

| 제약 | 보장 |
| --- | --- |
| `PRIMARY KEY` | 고유하고 NULL이 아님 |
| `UNIQUE` | 중복 없음 |
| `NOT NULL` | 반드시 값이 있음 |
| `FOREIGN KEY` | 참조하는 행이 실제로 존재함 |
| `CHECK` | 값이 조건을 만족함 |

애플리케이션에서 검증했더라도 DB 제약을 함께 두는 편이 낫습니다. 동시 요청에서는 "확인하고 넣기" 사이에 다른 요청이 끼어들 수 있어, `UNIQUE` 제약만이 중복을 확실히 막습니다.

외래 키의 삭제 동작도 정해 둡니다.

```sql
ON DELETE CASCADE     -- 부모가 지워지면 자식도 함께
ON DELETE RESTRICT    -- 자식이 있으면 부모를 못 지움
ON DELETE SET NULL    -- 자식의 참조를 NULL로
```

문자열 열거는 자유 문자열 대신 **타입으로 고정**합니다. 오타가 들어오지 않고 저장 공간도 작습니다.

```sql
CREATE TYPE todo_status AS ENUM ('todo', 'doing', 'done');
```

MySQL이라면 `ENUM`을 컬럼에 직접 씁니다. 값이 자주 늘어난다면 별도 코드 테이블이 유연합니다.

타입 선택에서 자주 하는 실수들입니다.

- 돈에 `FLOAT`을 씁니다 → `NUMERIC`이나 최소 단위 정수
- 시간에 `TIMESTAMP`(시간대 없음)를 씁니다 → `TIMESTAMPTZ`
- 모든 문자열을 `TEXT`로 둡니다 → 길이 제한이 곧 검증입니다

## 정규화와 의도적인 비정규화

같은 값을 여러 곳에 두지 않는 것이 정규화입니다.

```sql
-- 중복이 있는 설계
todos(id, title, user_email, user_name)
```

사용자가 이메일을 바꾸면 모든 행을 고쳐야 하고, 하나라도 빠뜨리면 데이터가 어긋납니다.

```sql
-- 분리
users(id, email, name)
todos(id, user_id, title)
```

기준은 **하나의 사실은 한 곳에만** 입니다.

다대다 관계는 중간 테이블로 풉니다.

```sql
CREATE TABLE todo_tags (
    todo_id BIGINT NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
    tag_id  BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (todo_id, tag_id)
);
```

반대로 일부러 중복을 두기도 합니다. 조인이 너무 무거울 때입니다.

```sql
ALTER TABLE todos ADD COLUMN comment_count INT NOT NULL DEFAULT 0;
```

매번 댓글을 세는 대신 값을 들고 있습니다. 대신 **갱신을 빠뜨리면 틀어집니다.** 비정규화는 측정해서 느린 것을 확인한 뒤에 하는 선택이지, 처음부터 할 일은 아닙니다.

## 테이블 간 관계와 JOIN

```sql
SELECT t.id, t.title, u.email
FROM todos t
JOIN users u ON u.id = t.user_id
WHERE t.done = false;
```

| 종류 | 결과 |
| --- | --- |
| `INNER JOIN` | 양쪽에 다 있는 행만 |
| `LEFT JOIN` | 왼쪽 전부 + 오른쪽은 있으면 |
| `RIGHT JOIN` | 그 반대 |
| `FULL JOIN` | 양쪽 전부 |

`LEFT JOIN`을 쓰고 `WHERE`에서 오른쪽 컬럼을 거르면 `INNER JOIN`이 되어 버립니다.

```sql
-- 댓글이 없는 할 일이 사라집니다
LEFT JOIN comments c ON c.todo_id = t.id
WHERE c.created_at > '2026-01-01'

-- 조인 조건에 넣어야 합니다
LEFT JOIN comments c ON c.todo_id = t.id AND c.created_at > '2026-01-01'
```

조인하면 **행이 늘어납니다.** 댓글이 3개면 할 일 한 건이 3행이 됩니다. 집계할 때 이것을 놓치면 숫자가 부풀려집니다.

```sql
-- 잘못된 집계 — 댓글 수만큼 중복됩니다
SELECT u.id, COUNT(t.id)
FROM users u
JOIN todos t ON t.user_id = u.id
JOIN comments c ON c.todo_id = t.id
GROUP BY u.id;

-- 중복을 제거하거나
COUNT(DISTINCT t.id)

-- 서브쿼리로 따로 셉니다
SELECT u.id,
       (SELECT COUNT(*) FROM todos WHERE user_id = u.id) AS todo_count
FROM users u;
```

## 집계와 그룹화

```sql
SELECT
    user_id,
    COUNT(*)                                        AS total,
    COUNT(*) FILTER (WHERE status = 'done')         AS done_count,
    MIN(created_at)                                 AS first_created
FROM todos
GROUP BY user_id
HAVING COUNT(*) >= 5
ORDER BY total DESC;
```

`WHERE`는 그룹을 만들기 **전에**, `HAVING`은 만든 **후에** 거릅니다. 집계 함수로 거르려면 `HAVING`이어야 합니다.

`GROUP BY`에 없는 컬럼을 `SELECT`에 쓰면 오류입니다. MySQL은 설정에 따라 허용하는데, 어떤 행의 값이 나올지 알 수 없어 위험합니다.

윈도 함수는 **행을 줄이지 않고** 집계를 붙입니다.

```sql
SELECT
    id,
    title,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn,
    COUNT(*)     OVER (PARTITION BY user_id)                          AS user_total
FROM todos;
```

"사용자별 최근 3건"처럼 그룹 안에서 순위를 매기는 질의에 유용합니다.

```sql
SELECT * FROM (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
    FROM todos
) ranked
WHERE rn <= 3;
```

## 관계형과 NoSQL의 선택 기준

| | 관계형 | 문서형 (MongoDB 등) |
| --- | --- | --- |
| 스키마 | 고정, DB가 강제 | 유연, 앱이 책임 |
| 관계 | JOIN | 중첩하거나 앱에서 조합 |
| 트랜잭션 | 강력 | 제한적인 경우가 많음 |
| 적합 | 관계가 많고 정합성이 중요 | 구조가 제각각, 쓰기가 매우 많음 |

처음에는 **관계형으로 시작하는 편이 안전합니다.** 제약 조건과 트랜잭션이 실수를 막아 주고, 나중에 특정 부분만 다른 저장소로 옮기는 것이 반대 방향보다 쉽습니다.

"스키마가 없어서 편하다"는 장점은 개발 초기에만 유효합니다. 결국 애플리케이션 코드가 모든 형태를 알아서 처리해야 하고, 예전 형식의 문서가 남아 있는 문제를 떠안게 됩니다.

관계형 DB도 JSON 컬럼을 지원해서, 정형 데이터와 비정형 설정을 한 테이블에 둘 수 있습니다.

```sql
ALTER TABLE todos ADD COLUMN metadata JSONB;

SELECT * FROM todos WHERE metadata->>'source' = 'import';
CREATE INDEX idx_todos_metadata ON todos USING GIN (metadata);
```

다만 JSON 컬럼에는 제약 조건을 걸기 어렵습니다. 중요한 값은 정식 컬럼으로 꺼내 두는 편이 낫습니다.
