---
title: 백엔드 06. 인증과 인가
description: 사용자를 식별하고 접근 권한을 제한합니다.
outline: deep
---

# 06. 인증과 인가

누구인지 확인하는 것과, 무엇을 허용할지 정하는 것을 나누어 정리합니다.

## 인증과 인가의 차이

- **인증**(Authentication) — 당신이 누구인가
- **인가**(Authorization) — 그 사람이 이것을 해도 되는가

HTTP 상태 코드도 나뉘어 있습니다.

```
401 Unauthorized   토큰이 없거나 만료 — 인증 실패
403 Forbidden      누구인지는 알지만 권한 없음 — 인가 실패
```

이름과 달리 401이 인증, 403이 인가입니다. 자주 헷갈리는 지점입니다.

둘을 섞으면 코드가 복잡해집니다. 인증은 미들웨어에서 한 번, 인가는 각 리소스에서 확인하는 구조가 단순합니다.

```js
router.delete("/:id", authenticate, async (req, res) => {
  const todo = await todoRepo.findById(req.params.id);
  if (!todo) throw new NotFoundError("할 일");

  if (todo.userId !== req.user.id) throw new ForbiddenError();

  await todoRepo.remove(todo.id);
  res.status(204).end();
});
```

## 회원가입, 로그인, 로그아웃 흐름

```
회원가입:  이메일·비밀번호 → 검증 → 해시 → 저장
로그인:    이메일·비밀번호 → 해시 비교 → 세션·토큰 발급
요청:      세션·토큰 → 사용자 식별
로그아웃:  세션 삭제 또는 토큰 무효화
```

로그인 실패 메시지는 **구체적으로 알려 주지 않습니다.**

```js
// 가입된 이메일인지 알려 줍니다
if (!user) return res.status(401).json({ message: "존재하지 않는 이메일입니다" });
if (!valid) return res.status(401).json({ message: "비밀번호가 틀렸습니다" });

// 구분하지 않습니다
return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다" });
```

구분해서 알려 주면 이메일 목록을 훑어 가입 여부를 알아낼 수 있습니다.

사용자가 없을 때도 **해시 비교를 수행**해야 합니다. 응답 시간 차이로 가입 여부가 드러나기 때문입니다.

```js
const user = await userRepo.findByEmail(email);
const hash = user?.passwordHash ?? DUMMY_HASH;

const valid = await argon2.verify(hash, password);
if (!user || !valid) throw new UnauthorizedError();
```

## 비밀번호 해시와 솔트

비밀번호는 **절대 평문으로 저장하지 않습니다.** 복호화할 수 있는 암호화도 쓰지 않습니다.

일반 해시 함수도 안 됩니다. `SHA-256`은 너무 빨라서 초당 수십억 번 시도할 수 있습니다.

```js
// 하지 않습니다
crypto.createHash("sha256").update(password).digest("hex");
```

비밀번호 전용 해시를 씁니다. 일부러 느리고 메모리를 많이 쓰도록 설계되어 있습니다.

```js
import argon2 from "argon2";

const hash = await argon2.hash(password);          // 저장
const valid = await argon2.verify(hash, password); // 검증
```

bcrypt도 널리 쓰입니다. 비용 계수를 올리면 더 느려집니다.

```js
import bcrypt from "bcrypt";

const hash = await bcrypt.hash(password, 12);
```

**솔트**는 비밀번호마다 다른 무작위 값을 섞는 것입니다. 같은 비밀번호라도 해시가 달라져서, 미리 계산해 둔 표로 한 번에 깨는 공격이 통하지 않습니다.

argon2와 bcrypt는 솔트를 자동으로 만들어 해시 문자열 안에 포함합니다. 따로 관리할 필요가 없습니다.

```
$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$RdescudvJCsgt3ub+b+dWRWJTmaaJObG
          └─ 파라미터 ─┘      └─ 솔트 ─┘  └──── 해시 ────┘
```

비밀번호 정책은 **길이를 우선**합니다. 특수문자를 강제하면 사용자가 `Password1!` 같은 것을 만들어 오히려 약해집니다. 유출된 비밀번호 목록과 대조하는 방법이 더 효과적입니다.

## 세션과 토큰 방식의 차이, 만료와 갱신

| | 세션 | JWT |
| --- | --- | --- |
| 상태 저장 | 서버에 저장 | 토큰 자체에 담김 |
| 무효화 | 즉시 가능 | 만료까지 유효 |
| 확장 | 공유 저장소 필요 | 서버 간 공유 불필요 |
| 크기 | 쿠키에 ID만 | 토큰 전체가 매 요청에 |

**세션**은 서버가 상태를 들고 있습니다.

```js
// 로그인 시
const sessionId = crypto.randomUUID();
await redis.set(`session:${sessionId}`, JSON.stringify({ userId }), { EX: 3600 });

res.cookie("sid", sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  maxAge: 3600_000,
});
```

로그아웃이나 강제 차단을 **즉시** 할 수 있습니다. 세션을 지우면 끝입니다.

**JWT**는 서명된 데이터를 클라이언트가 들고 다닙니다.

```js
import jwt from "jsonwebtoken";

const token = jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, {
  expiresIn: "15m",
});

const payload = jwt.verify(token, config.jwtSecret);
```

서버가 조회하지 않아도 되어 가볍지만, **한 번 발급하면 만료까지 취소할 수 없습니다.**

그래서 보통 둘을 섞습니다.

```
액세스 토큰   짧게 (15분)  — 매 요청에 사용
리프레시 토큰 길게 (2주)   — 서버에 저장, 액세스 토큰 재발급용
```

리프레시 토큰은 DB에 저장하므로 폐기할 수 있습니다. 액세스 토큰이 유출돼도 15분 뒤에는 쓸모없어집니다.

```js
router.post("/refresh", async (req, res) => {
  const saved = await tokenRepo.find(req.cookies.refreshToken);
  if (!saved || saved.expiresAt < new Date()) throw new UnauthorizedError();

  await tokenRepo.remove(saved.id);          // 한 번 쓰면 폐기
  const next = await tokenRepo.create(saved.userId);   // 새로 발급

  res.cookie("refreshToken", next.token, cookieOptions);
  res.json({ accessToken: createAccessToken(saved.userId) });
});
```

JWT에서 자주 하는 실수들입니다.

- `alg: none`을 허용 → 서명 없는 토큰이 통과합니다. 알고리즘을 명시적으로 지정합니다
- 비밀 정보를 페이로드에 담기 → **서명은 위조를 막을 뿐 내용을 가리지 않습니다.** 누구나 디코딩할 수 있습니다
- 만료를 길게 설정 → 유출 시 피해가 커집니다

## 역할 기반 접근 제어와 사용자별 데이터 접근 제어

권한은 두 층위로 나눠서 봅니다.

**역할 기반** — 이 사람이 이 기능을 쓸 수 있는가

```js
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) throw new ForbiddenError();
    next();
  };
}

router.delete("/users/:id", authenticate, requireRole("admin"), handler);
```

**리소스 소유권** — 이 사람이 *이* 데이터를 건드릴 수 있는가

역할만 확인하고 소유권을 빠뜨리는 것이 가장 흔한 취약점입니다.

```js
// 로그인한 사람이면 누구나 남의 할 일을 지울 수 있습니다
router.delete("/todos/:id", authenticate, async (req, res) => {
  await todoRepo.remove(req.params.id);
  res.status(204).end();
});
```

ID를 1부터 올려 가며 요청하면 전부 지워집니다. 조회에서도 같은 문제가 생깁니다.

```js
// 조건에 사용자를 포함시킵니다
const todo = await todoRepo.findByIdAndUser(req.params.id, req.user.id);
if (!todo) throw new NotFoundError("할 일");
```

없는 것과 남의 것을 **둘 다 404로** 응답하면, ID를 훑어 존재 여부를 알아내는 것도 막힙니다.

쿼리 레벨에서 사용자 조건을 강제하는 구조로 두면 실수가 줄어듭니다.

```js
class TodoRepository {
  constructor(userId) {
    this.userId = userId;
  }

  findById(id) {
    return db.query("SELECT * FROM todos WHERE id = $1 AND user_id = $2", [
      id,
      this.userId,
    ]);
  }
}
```

권한 판단에 쓰는 값은 **요청 본문이 아니라 토큰에서** 가져옵니다.

```js
const userId = req.body.userId;   // 위조할 수 있습니다
const userId = req.user.id;       // 서명된 토큰에서 나옵니다
```

## 소셜 로그인과 OAuth의 기본 흐름

비밀번호를 직접 받지 않고 외부 제공자에게 맡깁니다.

```
1. 사용자가 "구글로 로그인" 클릭
2. 구글 동의 화면으로 이동 (state 값 동봉)
3. 사용자가 승인
4. 지정한 주소로 code를 들고 돌아옴
5. 서버가 code를 토큰으로 교환 (서버 간 통신)
6. 토큰으로 사용자 정보 조회
7. 가입 처리 후 자체 세션·토큰 발급
```

핵심은 **5번이 서버에서 일어난다**는 점입니다. 클라이언트 시크릿이 브라우저에 노출되지 않습니다.

`state` 값은 CSRF를 막습니다. 2번에서 무작위 값을 만들어 세션에 저장해 두고, 4번에서 돌아온 값과 같은지 확인합니다. 다르면 공격자가 시작한 흐름입니다.

```js
// 시작
const state = crypto.randomUUID();
req.session.oauthState = state;
res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?...&state=${state}`);

// 콜백
if (req.query.state !== req.session.oauthState) throw new ForbiddenError();
```

리디렉트 주소는 제공자 콘솔에 **미리 등록한 것만** 허용됩니다. 등록하지 않은 주소로는 code가 가지 않아, 탈취 경로가 막힙니다.

이메일이 같은 기존 계정과의 연결 정책도 미리 정해 둡니다. 자동으로 합치면 계정 탈취 경로가 될 수 있으므로, 기존 비밀번호 확인을 요구하는 편이 안전합니다.
