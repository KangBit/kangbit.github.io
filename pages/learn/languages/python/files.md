---
title: Python 03. 파일과 예외 처리
description: 경로와 파일을 다루고 실패하는 상황을 처리합니다.
outline: deep
---

# 03. 파일과 예외 처리

파일을 안전하게 읽고 쓰는 방법과, 실패했을 때 어떻게 할지 정리합니다.

## 경로 처리

문자열을 더해 경로를 만들면 운영체제마다 구분자가 달라 깨집니다. `pathlib`을 씁니다.

```python
from pathlib import Path

base = Path("data")
target = base / "todos.json"    # 슬래시로 이어 붙입니다

target.exists()
target.suffix        # ".json"
target.stem          # "todos"
target.parent        # Path("data")
```

실행 파일 기준 경로는 `__file__`에서 만듭니다. 현재 작업 디렉터리는 실행 위치에 따라 달라지므로 기준으로 삼지 않습니다.

```python
HERE = Path(__file__).resolve().parent
DATA = HERE / "data" / "todos.json"
```

폴더를 미리 만들어 두어야 쓸 수 있습니다.

```python
DATA.parent.mkdir(parents=True, exist_ok=True)
```

디렉터리 안을 훑을 때도 쓸 수 있습니다.

```python
for path in Path("data").glob("*.json"):
    print(path.name)

for path in Path("data").rglob("*.json"):  # 하위 폴더까지
    print(path)
```

## with 문

파일을 열면 닫아야 합니다. `with`는 블록을 벗어날 때, 오류가 나더라도 반드시 닫아 줍니다.

```python
with open(DATA, encoding="utf-8") as file:
    text = file.read()
# 여기서 이미 닫혀 있습니다
```

`encoding`을 적지 않으면 운영체제 기본값을 따릅니다. 환경에 따라 한글이 깨지므로 항상 `utf-8`을 적어 둡니다.

열기 모드는 목적에 따라 고릅니다.

```python
open(path, "r")   # 읽기 (기본)
open(path, "w")   # 쓰기 — 기존 내용을 지웁니다
open(path, "a")   # 이어 쓰기
open(path, "rb")  # 바이너리 읽기
open(path, "x")   # 새로 만들기 — 이미 있으면 오류
```

작은 텍스트 파일은 `pathlib`으로 더 짧게 다룰 수 있습니다.

```python
text = DATA.read_text(encoding="utf-8")
DATA.write_text(text, encoding="utf-8")
```

### 컨텍스트 매니저 직접 만들기

`with`에 쓸 수 있는 객체는 `__enter__`와 `__exit__`를 가진 것입니다. 직접 만들면 "시작하고 반드시 정리하는" 패턴을 묶어 둘 수 있습니다.

```python
import time


class Timer:
    def __enter__(self):
        self.start = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self.elapsed = time.perf_counter() - self.start
        print(f"{self.elapsed:.3f}초")
        return False  # True를 반환하면 예외를 삼킵니다


with Timer():
    load_todos()
```

데코레이터로 더 짧게 쓸 수도 있습니다. `yield` 앞이 진입, 뒤가 정리입니다.

```python
from contextlib import contextmanager


@contextmanager
def timer():
    start = time.perf_counter()
    try:
        yield
    finally:
        print(f"{time.perf_counter() - start:.3f}초")


with timer():
    load_todos()
```

`finally`에 두어야 중간에 오류가 나도 정리가 실행됩니다.

## 텍스트와 JSON 읽기·쓰기

```python
import json

# 읽기
with open(DATA, encoding="utf-8") as file:
    todos = json.load(file)

# 쓰기
with open(DATA, "w", encoding="utf-8") as file:
    json.dump(todos, file, ensure_ascii=False, indent=2)
```

`ensure_ascii=False`를 넣지 않으면 한글이 `공부`처럼 저장됩니다. `indent`는 사람이 읽을 파일일 때만 씁니다.

문자열과 주고받을 때는 이름이 다릅니다.

```python
json.dumps(todos)   # 객체 → 문자열
json.loads(text)    # 문자열 → 객체
```

큰 파일은 한 번에 읽지 않고 한 줄씩 처리합니다.

```python
with open(path, encoding="utf-8") as file:
    for line in file:
        process(line.rstrip("\n"))
```

## 예외 처리

실패할 수 있는 지점을 감싸고, **어떤 실패인지 구체적으로** 잡습니다.

```python
try:
    with open(DATA, encoding="utf-8") as file:
        todos = json.load(file)
except FileNotFoundError:
    todos = []
except json.JSONDecodeError as error:
    print(f"형식이 잘못되었습니다: {error}")
    todos = []
```

`except Exception`으로 뭉뚱그리면 예상하지 못한 버그까지 조용히 삼킵니다. 더 나쁜 것은 아무것도 적지 않는 `except:`인데, `Ctrl+C`로 멈추려는 것까지 잡아 버립니다.

```python
# 권장하지 않습니다
try:
    load()
except:
    pass
```

전체 구조는 네 부분입니다.

```python
try:
    value = int(text)
except ValueError:
    print("숫자가 아닙니다")
else:
    print(f"성공: {value}")   # 예외가 없을 때만
finally:
    print("항상 실행")         # 성공이든 실패든
```

잡아서 처리할 수 없다면 다시 던집니다. 맥락을 덧붙일 때는 `raise ... from`을 씁니다.

```python
try:
    todos = json.load(file)
except json.JSONDecodeError as error:
    raise ValueError(f"{DATA} 형식이 잘못되었습니다") from error
```

`from`을 쓰면 원래 오류가 함께 출력되어 원인을 추적할 수 있습니다.

### 사용자 정의 예외

도메인에서 생기는 실패에는 이름을 붙입니다. 호출하는 쪽이 무엇을 잡아야 할지 분명해집니다.

```python
class TodoError(Exception):
    pass


class EmptyTitleError(TodoError):
    pass


def add_todo(todos, title):
    if not title.strip():
        raise EmptyTitleError("제목이 비어 있습니다")
    return [*todos, {"title": title.strip()}]
```

```python
try:
    add_todo(todos, "  ")
except TodoError as error:     # 하위 예외까지 함께 잡힙니다
    print(error)
```
