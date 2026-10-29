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
SELECT id, title, status
FROM todos
WHERE user_id = 1 AND status <> 'done'
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
WHERE t.status <> 'done';
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

## 자주 쓰이는 데이터베이스

이름은 들어 봤을 제품들이 각각 어디에 맞는지 정리합니다.

### 관계형

| 제품 | 특징 |
| --- | --- |
| PostgreSQL | 기능 범위가 넓습니다. JSONB, 전문 검색, 지리 정보까지 확장으로 붙습니다 |
| MySQL / MariaDB | 어느 호스팅에나 있습니다. 읽기 중심 서비스에서 오래 검증됐습니다 |
| SQLite | 서버 프로세스 없이 파일 하나입니다. 로컬 개발, 테스트, 모바일 앱에 씁니다 |
| Oracle / SQL Server | 기업 환경에서 만나게 됩니다. 라이선스 비용이 큽니다 |

새로 시작한다면 **PostgreSQL이 무난한 기본값입니다.** 표준 SQL을 비교적 충실히 따라서 배운 것이 다른 DB로도 옮겨 가고, 나중에 필요해지는 기능이 대체로 이미 들어 있습니다. 이 장의 예제도 PostgreSQL 기준입니다.

기능을 **확장으로 덧붙이는 구조**라는 점이 특히 큽니다.

| 확장 | 용도 |
| --- | --- |
| PostGIS | 좌표와 거리, 지도 질의 |
| pgvector | 임베딩 유사도 검색 |
| TimescaleDB | 시계열 데이터의 압축과 구간 집계 |
| Citus | 여러 노드로 분산 |

"이 기능 때문에 다른 DB가 필요하다"는 순간이 그만큼 늦게 옵니다. 다만 관리형 서비스는 **쓸 수 있는 확장 목록이 정해져 있으니** 옮기기 전에 확인합니다.

MySQL은 기본값이 다른 지점이 있습니다. 격리 수준이 Repeatable Read이고, `GROUP BY`에 없는 컬럼을 허용하기도 하고, `ENUM`을 컬럼에 직접 선언합니다. 앞에서 짚은 차이들이 여기서 나옵니다.

SQLite는 작아서 못 쓰는 것이 아닙니다. 쓰기가 한 번에 하나로 제한될 뿐, 읽기가 대부분인 곳이면 충분합니다. 설정할 것이 없어 **테스트용으로 쓰고 싶어지는데**, 운영에서 다른 DB를 쓴다면 문법 차이 때문에 테스트에서만 통과하는 쿼리가 생깁니다. [08. 테스트와 예외 처리](/learn/backend/testing)에서 다룹니다.

한 대로 감당이 안 될 만큼 커지면 **분산 SQL**이 선택지에 들어옵니다. CockroachDB, TiDB, YugabyteDB처럼 여러 노드에 나눠 저장하면서 SQL과 트랜잭션을 유지하는 제품들이고, MySQL 쪽에는 Vitess가 있습니다. 대신 노드 사이를 오가는 비용이 붙어 **단건 질의는 오히려 느려질 수 있고** 운영 난이도가 한 단계 올라갑니다. 더 큰 장비와 읽기 복제본으로 버티는 동안은 그쪽이 쌉니다.

### 행 지향과 열 지향

같은 SQL을 쓰더라도 **데이터를 디스크에 늘어놓는 방향**이 다릅니다.

```
행 지향:  [1, 공부, todo]  [2, 운동, done]  [3, 청소, todo]
열 지향:  [1, 2, 3]  [공부, 운동, 청소]  [todo, done, todo]
```

행 지향은 한 행 전체를 꺼내는 데 유리합니다. 한 건을 읽고 고치는 서비스 질의가 여기에 맞고, PostgreSQL과 MySQL이 이쪽입니다.

열 지향은 **한 컬럼만 쭉 읽는 데** 유리합니다. 1억 행에서 `SUM(amount)`를 구할 때 다른 컬럼은 건드리지 않고, 같은 종류의 값이 붙어 있어 압축도 잘 됩니다. ClickHouse, BigQuery, Redshift가 이쪽입니다. DuckDB는 SQLite처럼 파일 하나로 도는 열 지향 DB라 로컬 분석에 씁니다.

| | 행 지향 (OLTP) | 열 지향 (OLAP) |
| --- | --- | --- |
| 잘하는 것 | 한 건 조회·수정 | 넓은 범위 집계 |
| 힘든 것 | 수억 행 집계 | 건건 수정·삭제 |
| 쓰는 자리 | 서비스 DB | 분석과 리포트 |

무거운 집계를 운영 DB에 그대로 돌리면 서비스 질의까지 함께 느려집니다. 먼저 **읽기 복제본**으로 분리하고, 그것으로도 모자랄 때 분석 전용 저장소를 둡니다.

### 캐시와 문서, 검색

| 제품 | 쓰는 자리 |
| --- | --- |
| Redis | 캐시, 세션, 속도 제한 카운터, 간단한 큐 |
| MongoDB | 문서마다 형태가 다른 데이터 |
| Elasticsearch / OpenSearch | 전문 검색과 로그 분석 |
| DynamoDB / Cassandra | 키로 찾는 접근이 대부분이고 쓰기가 아주 많을 때 |

Redis는 단순한 키-값이 아니라 **자료구조**를 제공합니다. 값을 통째로 꺼내 와 애플리케이션에서 계산하지 않고, 서버에서 바로 처리합니다.

| 자료구조 | 쓰는 자리 |
| --- | --- |
| String | 캐시 값, 카운터 |
| Hash | 객체 하나의 필드들 |
| List | 간단한 큐 |
| Set | 중복 없는 집합 |
| Sorted Set | 랭킹, 시간순 윈도 |

속도 제한 카운터가 전형적인 예입니다.

```
INCR   rate:user:42        # 없으면 0에서 시작해 1이 됩니다
EXPIRE rate:user:42 60 NX  # 만료가 없을 때만 겁니다
```

[07. 서버 보안](/learn/backend/security)에서 서버가 여러 대면 카운트를 공유해야 한다고 한 이유가 이것입니다.

메모리에 두어 빠른 대신 용량이 한계이고, 재시작하면 날아갈 수 있습니다. 영속성 설정을 확인하고 **없어져도 되는 데이터**만 둡니다. 세션을 Redis에만 두면 재시작할 때 전원이 로그아웃됩니다. 라이선스 변경을 거치며 Valkey라는 호환 포크가 생겨, 관리형 서비스에서는 둘 중 하나를 고르게 됩니다.

MongoDB는 행 대신 **문서**를 저장합니다. 같은 컬렉션 안에서도 문서마다 필드가 다를 수 있습니다.

```js
// 관계형이라면 todos + todo_tags + tags로 나뉠 내용입니다
{
  _id: ObjectId("..."),
  title: "공부",
  status: "todo",
  tags: ["study", "daily"],
  author: { id: 42, name: "kang" },
}
```

조인 없이 한 번에 읽는 것이 장점입니다. 대신 `author.name`이 바뀌면 그 이름이 박힌 문서를 **전부 찾아 고쳐야 합니다.** 함께 읽고 잘 바뀌지 않는 것은 중첩으로, 자주 바뀌는 것은 참조(id만 저장)로 두는 것이 기준입니다.

다중 문서 트랜잭션도 지원하지만, 애초에 **한 문서 안에서 끝나도록** 설계하는 것이 이 모델의 전제입니다. 문서 하나는 16MB를 넘을 수 없어서, 댓글을 전부 문서 안에 담는 식으로 끝없이 늘어나는 배열은 피합니다.

검색·분석용 저장소는 보통 **정본이 아니라 사본**입니다. 관계형 DB에 원본을 두고 색인을 따로 채웁니다. 동기화가 밀리는 순간이 있다는 것을 전제로 설계합니다.

### 고를 때 보는 것

기능 비교표보다 **운영 조건**이 결정적인 경우가 많습니다.

- **팀이 아는 것** — 새벽에 장애가 났을 때 로그를 읽을 수 있는 사람이 있는가
- **쓰려는 환경에 관리형 서비스가 있는가** — 없으면 백업과 장애 조치가 전부 숙제가 됩니다
- **자료의 양** — 막혔을 때 검색해서 답이 나오는가
- **지원 종료 시점** — 메이저 버전마다 정해져 있습니다. 업그레이드도 일정에 들어갑니다

벤치마크 숫자는 그대로 믿지 않습니다. 대부분 특정 조건에서 잰 것이고, 실제 병목은 제품 선택보다 인덱스와 질의에서 생깁니다.

저장소를 하나 더 들이면 백업, 모니터링, 장애 대응 대상도 하나 늘어납니다. PostgreSQL 하나로 꽤 멀리 갑니다.

| 필요한 것 | PostgreSQL에서 |
| --- | --- |
| 문서형 저장 | `JSONB` 컬럼 |
| 전문 검색 | `tsvector`와 GIN 인덱스 |
| 작업 큐 | `SELECT ... FOR UPDATE SKIP LOCKED` |

전용 저장소가 필요해지는 시점은 옵니다. 다만 그때 떼어 내는 편이, 처음부터 다섯 개를 운영하며 시작하는 것보다 쉽습니다.

직접 설치해 운영하면 백업, 복제, 장애 조치, 버전 업그레이드를 전부 떠안습니다. 클라우드의 관리형 서비스(RDS, Cloud SQL 등)가 이 부분을 대신해 줍니다. 비용이 들지만 사람이 적을수록 유리한 거래입니다. 운영에서 챙길 것들은 [10. 배포와 운영](/learn/backend/deploy)에서 다룹니다.
