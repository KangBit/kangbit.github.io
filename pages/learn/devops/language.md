---
title: 데브옵스 02. 프로그래밍 언어 한 가지
description: 반복 작업을 코드로 옮기고, 운영 도구의 동작을 읽고 고칠 수 있는 수준을 만듭니다.
outline: deep
---

# 02. 프로그래밍 언어 한 가지

설정 파일을 채우는 것과 도구가 왜 그렇게 도는지 아는 것은 다릅니다. 언어 하나를 다룰 수 있으면 두 번째가 가능해집니다.

## 무엇을 고를까

| 언어 | 강한 자리 |
| --- | --- |
| Python | 자동화 스크립트, 클라우드 SDK, 데이터 처리 |
| Go | 단일 실행 파일, 쿠버네티스 생태계 도구 |
| JavaScript | 이미 쓰고 있다면 그대로, Node 기반 도구 |

쿠버네티스, Terraform, Prometheus, Docker가 모두 Go로 쓰였습니다. 이슈를 따라 소스를 열어 볼 일이 잦아지면 Go를 읽을 수 있는 쪽이 유리합니다. 처음 한 가지라면 **Python**이 무난합니다. 라이브러리가 많고 서버에 대체로 이미 깔려 있습니다.

문법 자체는 [언어별 로드맵](/learn/languages/python/)에서 다룹니다. 여기서는 운영 작업에서 반복해서 쓰는 형태만 봅니다.

## 설정 파일 다루기

YAML과 JSON을 읽고 쓰는 일이 가장 잦습니다.

```python
import yaml

with open("values.yaml") as f:
    values = yaml.safe_load(f)

values["image"]["tag"] = "v1.4.0"

with open("values.yaml", "w") as f:
    yaml.safe_dump(values, f, sort_keys=False, allow_unicode=True)
```

`yaml.load`가 아니라 **`yaml.safe_load`** 를 씁니다. 전자는 파일 안의 태그로 임의의 파이썬 객체를 만들 수 있어, 신뢰할 수 없는 설정 파일을 읽으면 그대로 실행 경로가 됩니다.

`sed`로 YAML을 고치는 스크립트를 자주 보게 되지만, 들여쓰기가 조금만 달라도 깨집니다. 구조를 아는 파서를 쓰는 편이 안전합니다.

## HTTP 요청과 응답 처리

헬스 체크, 배포 상태 조회, 웹훅 호출 모두 같은 모양입니다.

```python
import httpx

def wait_healthy(url: str, timeout: float = 60.0) -> bool:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        try:
            r = httpx.get(url, timeout=3.0)
            if r.status_code == 200:
                return True
        except httpx.RequestError:
            pass          # 아직 뜨는 중일 수 있습니다
        time.sleep(2)
    return False
```

**타임아웃을 반드시 겁니다.** 기본값이 무한인 클라이언트가 많아, 응답하지 않는 서버 하나에 배포 파이프라인 전체가 멈춥니다.

## 환경 변수와 명령행 인자

스크립트에 값을 박아 두면 환경마다 복사본이 생깁니다.

```python
import argparse, os

parser = argparse.ArgumentParser()
parser.add_argument("--env", default=os.getenv("DEPLOY_ENV", "staging"))
parser.add_argument("--dry-run", action="store_true")
args = parser.parse_args()

token = os.environ["DEPLOY_TOKEN"]   # 없으면 즉시 실패
```

비밀 값은 인자가 아니라 **환경 변수**로 받습니다. 명령행 인자는 같은 서버의 다른 사용자가 `ps`로 볼 수 있습니다.

`--dry-run`은 습관으로 둘 만합니다. 무엇을 바꿀지 먼저 출력하고, 확인한 뒤 실행합니다.

## 종료 코드와 오류 처리

CI는 **종료 코드로만** 성공과 실패를 판단합니다. 오류 메시지를 출력하고 0으로 끝나면 파이프라인은 통과로 봅니다.

```python
import sys

def main() -> int:
    if not wait_healthy(url):
        print(f"헬스 체크 실패: {url}", file=sys.stderr)
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())
```

사람이 읽을 메시지는 `stderr`로, 다음 단계가 받아 쓸 값은 `stdout`으로 내보냅니다. 섞으면 파이프로 이어 붙일 수 없습니다.

## 어디까지 스크립트로 둘까

셸 스크립트로 시작했다가 분기와 반복이 늘면 읽기 어려워집니다. 옮길 시점의 신호입니다.

- 조건 분기가 서너 개를 넘음
- JSON·YAML을 파싱해야 함
- 오류마다 다르게 처리해야 함
- 테스트를 붙이고 싶음

반대로 명령 몇 개를 순서대로 부르는 일이라면 셸이 짧고 명확합니다([03. 리눅스와 셸 스크립트](/learn/devops/linux)).

## 반복 작업부터 옮기기

연습 과제를 따로 만들 필요가 없습니다. 지금 손으로 하는 일 중 **두 번 이상 반복한 것**을 고릅니다.

- 로그에서 특정 기간의 오류만 모아 집계하기
- 여러 서버의 디스크 사용량을 한 번에 확인하기
- 오래된 컨테이너 이미지 태그 정리하기
- 배포 후 헬스 체크하고 실패하면 알림 보내기

처음부터 범용으로 만들지 않습니다. 쓰이는 것이 확인된 뒤에 인자를 늘립니다.
