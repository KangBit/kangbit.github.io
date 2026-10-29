---
title: 백엔드 07. 서버 보안
description: 신뢰할 수 없는 입력과 잘못된 설정에서 생기는 취약점을 막습니다.
outline: deep
---

# 07. 서버 보안

밖에서 들어오는 값을 어떻게 다룰지, 무엇을 숨겨야 하는지 정리합니다.

## SQL 인젝션과 매개변수 바인딩

값을 문자열로 이어 붙이면 입력이 SQL 문법으로 해석됩니다.

```js
db.query(`SELECT * FROM users WHERE email = '${email}'`);
```

```
email = "' OR '1'='1"
→ SELECT * FROM users WHERE email = '' OR '1'='1'
```

전체 행이 반환됩니다. 더 나아가면 데이터를 지우거나 다른 테이블을 읽을 수 있습니다.

**매개변수로 넘기면** 값과 문법이 분리됩니다.

```js
db.query("SELECT * FROM users WHERE email = $1", [email]);
```

드라이버가 값을 데이터로만 취급하므로, 안에 무엇이 들어 있든 문법이 되지 않습니다. 이스케이프를 직접 하려는 시도는 거의 항상 뚫립니다.

ORM을 써도 **원시 쿼리 자리**는 주의해야 합니다.

```js
prisma.$queryRawUnsafe(`SELECT * FROM todos WHERE title = '${title}'`);   // 위험
prisma.$queryRaw`SELECT * FROM todos WHERE title = ${title}`;             // 안전
```

**테이블명과 컬럼명은 바인딩할 수 없습니다.** 허용 목록으로 검증합니다.

```js
const SORTABLE = new Map([
  ["createdAt", "created_at"],
  ["title", "title"],
]);

const column = SORTABLE.get(req.query.sort);
if (!column) throw new AppError(400, "INVALID_SORT", "정렬 기준이 잘못되었습니다");

db.query(`SELECT * FROM todos ORDER BY ${column} DESC`);
```

허용 목록을 **객체 리터럴로 두면 안 됩니다.** 프로토타입 체인이 걸려서 목록에 없는 키가 통과합니다.

```js
const SORTABLE = { createdAt: "created_at", title: "title" };

SORTABLE["constructor"];   // function Object() { ... } — 빈 값이 아닙니다
SORTABLE["toString"];      // 함수 — 역시 통과합니다
```

`if (!column)`을 지나쳐 함수가 문자열로 변환된 채 SQL에 들어갑니다. `Map`을 쓰거나 `Object.hasOwn(SORTABLE, key)`로 직접 확인합니다.

## 명령어 인젝션과 경로 조작

셸 명령에 입력을 끼워 넣으면 임의 명령이 실행됩니다.

```js
exec(`convert ${filename} output.png`);
```

```
filename = "a.jpg; rm -rf /"
```

인자를 배열로 넘기는 API를 씁니다. 셸을 거치지 않아 `;`나 `|`가 의미를 잃습니다.

```js
import { execFile } from "node:child_process";

execFile("convert", [filename, "output.png"]);
```

경로에도 같은 문제가 있습니다.

```js
const file = path.join("/uploads", req.params.name);
fs.readFile(file);
```

```
name = "../../etc/passwd"
→ /etc/passwd
```

정규화한 뒤 **기준 폴더 안에 있는지** 확인합니다.

```js
const base = path.resolve("/uploads");
const target = path.resolve(base, req.params.name);

if (!target.startsWith(base + path.sep)) {
  throw new ForbiddenError();
}
```

사용자가 올린 파일 이름을 그대로 쓰지 않고, 서버가 만든 이름으로 저장하는 편이 더 안전합니다.

## 신뢰할 수 없는 입력의 검증과 정규화

경로 파라미터, 쿼리, 본문, 헤더, 쿠키, 업로드 파일 — **전부 조작 가능합니다.**

경계에서 한 번 검증하고, 통과한 뒤에는 믿고 씁니다.

```js
const createTodoSchema = z.object({
  title: z.string().trim().min(1).max(100),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
  dueDate: z.coerce.date().optional(),
});

const data = createTodoSchema.parse(req.body);
```

검증에서 자주 빠뜨리는 것들입니다.

- **길이 제한** — 없으면 10MB짜리 제목이 들어옵니다
- **타입 강제** — `{"id": {"$gt": ""}}` 같은 객체가 들어와 NoSQL 인젝션이 됩니다
- **허용하지 않은 필드** — `role: "admin"`이 그대로 반영되는 경우

마지막 것이 특히 위험합니다. 요청 본문을 통째로 넘기면 안 됩니다.

```js
// 사용자가 보낸 모든 필드가 들어갑니다
await userRepo.update(id, req.body);

// 허용한 필드만 꺼냅니다
const { name, bio } = updateProfileSchema.parse(req.body);
await userRepo.update(id, { name, bio });
```

본문 크기와 업로드도 제한합니다.

```js
app.use(express.json({ limit: "1mb" }));

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024, files: 3 },
});
```

업로드 파일은 **확장자가 아니라 실제 내용**으로 판단하고, 애플리케이션이 실행할 수 없는 위치에 저장합니다.

## 쿠키 보안 속성, CORS와 CSRF

인증 쿠키에는 세 가지를 모두 붙입니다.

```js
res.cookie("sid", sessionId, {
  httpOnly: true,    // JavaScript에서 읽을 수 없음 — XSS로 탈취 불가
  secure: true,      // HTTPS에서만 전송
  sameSite: "lax",   // 다른 사이트에서 온 요청에는 붙이지 않음
  path: "/",
  maxAge: 3600_000,
});
```

CORS는 **허용할 출처를 명시**합니다. 모두 허용하면 아무 사이트나 인증된 요청을 보낼 수 있습니다.

```js
// 위험합니다
app.use(cors({ origin: true, credentials: true }));

// 허용 목록
const allowed = new Set(["https://app.example.com"]);

app.use(
  cors({
    origin: (origin, cb) =>
      !origin || allowed.has(origin) ? cb(null, true) : cb(new ForbiddenError()),
    credentials: true,
  }),
);
```

`Access-Control-Allow-Origin: *`와 쿠키 전송은 함께 쓸 수 없습니다. 요청의 `Origin`을 그대로 반사해 주는 구현은 사실상 전체 허용이므로 피합니다.

CSRF는 쿠키 기반 인증일 때만 문제가 됩니다. 브라우저가 쿠키를 **자동으로** 붙이기 때문입니다.

- `SameSite=Lax` 쿠키 (요즘 브라우저 기본값)
- 상태를 바꾸는 요청에 **CSRF 토큰** 요구
- `Origin` 헤더 확인

`Authorization` 헤더로 토큰을 보내는 방식은 자동 전송이 아니므로 CSRF에 노출되지 않습니다.

보안 헤더도 함께 설정합니다.

```js
import helmet from "helmet";

app.use(helmet());   // CSP, X-Frame-Options, HSTS 등을 한 번에
```

## 비밀 정보 관리와 환경 변수 분리

비밀 키를 저장소에 넣지 않습니다. 한 번 올라가면 지워도 커밋 기록에 남습니다.

```bash
# .gitignore
.env
*.pem
```

```bash
# .env.example — 실제 값 없이 이름만
DATABASE_URL=
JWT_SECRET=
```

운영 환경에서는 비밀 관리 서비스를 씁니다. AWS Secrets Manager, Vault 같은 것들입니다. 환경 변수보다 나은 점은 **접근 기록이 남고 교체가 쉽다**는 것입니다.

유출됐다면 **반드시 교체**합니다. 커밋을 되돌리는 것만으로는 부족합니다. 이미 복제된 저장소에 남아 있습니다.

로그에 비밀이 섞이지 않게 거릅니다.

```js
const REDACTED = ["password", "token", "authorization", "cookie", "secret"];

function sanitize(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) =>
      REDACTED.some((k) => key.toLowerCase().includes(k))
        ? [key, "[REDACTED]"]
        : [key, value],
    ),
  );
}

logger.info("요청", { body: sanitize(req.body) });
```

요청 본문을 통째로 로그에 남기는 구현이 가장 흔한 유출 경로입니다.

## 속도 제한과 무차별 대입 방어

로그인은 횟수를 제한합니다. 제한이 없으면 비밀번호를 끝없이 시도할 수 있습니다.

기준을 **두 가지로 나눠** 겹쳐 둡니다.

```js
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const window = { windowMs: 15 * 60 * 1000 };
const tooMany = { code: "TOO_MANY_REQUESTS", message: "잠시 후 다시 시도해 주세요" };

// 한 곳에서 여러 계정을 훑는 것을 막습니다
const byIp = rateLimit({
  ...window,
  max: 50,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  message: tooMany,
});

// IP를 바꿔 가며 한 계정을 노리는 것을 막습니다
const byAccount = rateLimit({
  ...window,
  max: 5,
  keyGenerator: (req) => `account:${req.body.email ?? ""}`,
  message: tooMany,
});

router.post("/login", byIp, byAccount, loginHandler);
```

하나만 두면 반쪽입니다. IP만으로 제한하면 같은 네트워크의 사용자가 함께 막히고, 공격자는 IP를 바꿔 우회합니다. `${req.ip}:${email}` 같은 **조합 키도 마찬가지입니다.** (IP, 계정) 쌍마다 따로 세기 때문에, IP를 돌리면 한 계정에 사실상 무제한으로 시도할 수 있습니다.

`req.ip`를 그대로 키로 쓰는 것도 피합니다. IPv6에서는 주소 하나하나가 다른 키가 되는데, 공격자는 할당받은 대역 안에서 주소를 바꾸면 그만입니다. `ipKeyGenerator`가 IPv6를 서브넷 단위로 묶어 줍니다.

서버가 여러 대면 카운트를 공유해야 합니다. 메모리에 두면 인스턴스마다 따로 세어 제한이 느슨해집니다. Redis를 씁니다.

비용이 큰 엔드포인트에도 제한을 둡니다. 리포트 생성이나 전체 조회처럼 한 번에 오래 걸리는 것들입니다.

```http
429 Too Many Requests
Retry-After: 900
```

`Retry-After`를 함께 주면 클라이언트가 언제 다시 시도할지 알 수 있습니다.

## 민감 정보와 내부 오류 상세 정보의 노출 방지

예외 메시지를 그대로 내보내면 내부 구조가 드러납니다.

```json
{
  "error": "relation \"users\" does not exist",
  "stack": "at Query.run (/app/node_modules/pg/lib/query.js:72:19)..."
}
```

테이블 이름, 파일 경로, 라이브러리 버전이 전부 노출됩니다. 공격자에게는 지도와 같습니다.

```js
app.use((error, req, res, next) => {
  if (error instanceof AppError) {
    return res.status(error.status).json({
      code: error.code,
      message: error.message,
    });
  }

  // 예상치 못한 오류 — 자세한 내용은 로그에만
  logger.error("처리되지 않은 오류", { error, requestId: req.id });

  res.status(500).json({
    code: "INTERNAL_ERROR",
    message: "서버 오류가 발생했습니다",
    requestId: req.id,   // 문의할 때 쓸 수 있는 식별자
  });
});
```

`requestId`를 돌려주면 사용자가 그 값을 알려 줄 때 로그에서 바로 찾을 수 있습니다. 내부 정보를 노출하지 않으면서 디버깅이 가능합니다.

응답에서 빼야 할 것들도 있습니다.

```js
// 비밀번호 해시가 그대로 나갑니다
res.json(user);

// 내보낼 필드를 정합니다
res.json({ id: user.id, email: user.email, name: user.name });
```

`SELECT *`로 가져와 그대로 응답하는 구조는 컬럼이 추가될 때 자동으로 노출됩니다. 응답 직렬화를 한 곳에 모아 두면 실수가 줄어듭니다.

서버 정보를 알리는 헤더도 끕니다.

```js
app.disable("x-powered-by");
```

## 의존성 취약점 점검과 갱신

직접 쓴 코드보다 가져다 쓴 패키지가 더 많습니다.

```bash
npm audit
npm audit fix
```

CI에 넣어 정기적으로 돌리고, Dependabot 같은 도구로 갱신 PR을 자동으로 받습니다.

락 파일을 저장소에 두어 설치 버전을 고정하고, 배포 시에는 락 파일 그대로 설치합니다.

```bash
npm ci   # package-lock.json 그대로
```

새 패키지를 추가할 때 확인할 것들입니다.

- 최근에 갱신되고 있는가
- 의존성이 과도하게 많지 않은가
- 정말 필요한가 — 몇 줄짜리 기능 때문에 공급망 위험을 늘리지 않습니다
