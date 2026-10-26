---
title: Python 05. 타입 힌트와 테스트
description: 타입 힌트로 의도를 드러내고 테스트와 명령행 인자로 마무리합니다.
outline: deep
---

# 05. 타입 힌트와 테스트

코드의 계약을 드러내고, 바뀌어도 깨지지 않는지 확인하는 방법을 정리합니다.

## 함수 타입 힌트

Python의 타입 힌트는 **실행에 영향을 주지 않습니다.** 인터프리터는 검사하지 않고 그냥 지나갑니다.

```python
def add(a: int, b: int) -> int:
    return a + b


add("a", "b")   # 실행됩니다. 결과는 "ab"
```

그래도 적는 이유는 편집기의 자동 완성과 별도 검사 도구, 그리고 읽는 사람 때문입니다.

```python
from pathlib import Path


def load_todos(path: Path) -> list[dict[str, object]]:
    ...


def find_todo(todos: list[Todo], todo_id: int) -> Todo | None:
    for todo in todos:
        if todo.id == todo_id:
            return todo
    return None
```

`list[str]`과 `int | None` 표기는 비교적 최근 문법입니다. 예전 코드에서는 `typing` 모듈의 `List`, `Optional`을 볼 수 있습니다.

```python
# 예전 표기
from typing import List, Optional, Dict

def find(todos: List[dict], id: int) -> Optional[dict]: ...

# 지금 표기
def find(todos: list[dict], id: int) -> dict | None: ...
```

자주 쓰는 것들입니다.

```python
from collections.abc import Callable, Iterable, Sequence

def apply(items: Iterable[int], fn: Callable[[int], str]) -> list[str]:
    return [fn(item) for item in items]
```

받는 쪽은 넓게, 돌려주는 쪽은 좁게 적습니다. 인자를 `list`가 아닌 `Iterable`로 받으면 제너레이터도 넘길 수 있습니다.

반복되는 긴 표기에는 이름을 붙입니다.

```python
type TodoDict = dict[str, str | bool]   # Python 3.12+

TodoDict = dict[str, str | bool]        # 그 이전
```

검사는 별도 도구가 합니다.

```bash
pip install mypy
mypy src
```

## 의존성 기록

무엇을 깔아야 이 코드가 도는지 적어 둡니다. 가장 단순한 방법은 `requirements.txt`입니다.

```bash
pip freeze > requirements.txt
pip install -r requirements.txt
```

다만 `pip freeze`는 **직접 설치한 것과 딸려 온 것을 구분하지 않습니다.** 목록이 길어지고, 나중에 무엇을 지워도 되는지 알 수 없게 됩니다. 직접 쓰는 것만 적어 두는 편이 낫습니다.

```
requests>=2.32
pytest>=8.0
```

요즘은 `pyproject.toml` 하나에 모으는 방식을 많이 씁니다.

```toml
[project]
name = "todo"
requires-python = ">=3.11"
dependencies = ["requests>=2.32"]

[project.optional-dependencies]
dev = ["pytest>=8.0", "mypy>=1.11"]
```

```bash
pip install -e ".[dev]"
```

실행에 필요한 것과 개발할 때만 쓰는 것을 나눠 두면, 배포 환경에 테스트 도구가 섞이지 않습니다.

## 단위 테스트

`pytest`를 많이 씁니다. `test_`로 시작하는 파일과 함수를 찾아 실행합니다.

```python
# test_todo.py
import pytest

from src.todo import add_todo, EmptyTitleError


def test_목록_끝에_추가한다():
    todos = [{"title": "공부", "done": False}]

    result = add_todo(todos, "운동")

    assert len(result) == 2
    assert result[1]["title"] == "운동"


def test_원본을_바꾸지_않는다():
    todos = []

    add_todo(todos, "운동")

    assert todos == []


def test_제목이_비면_오류를_낸다():
    with pytest.raises(EmptyTitleError):
        add_todo([], "   ")
```

```bash
pytest
pytest -v           # 테스트 이름까지 출력
pytest -k 제목      # 이름으로 골라 실행
```

같은 준비가 반복되면 `fixture`로 뺍니다.

```python
@pytest.fixture
def todos():
    return [{"title": "공부", "done": False}]


def test_필터(todos):
    assert len(undone(todos)) == 1
```

입력만 다른 테스트는 묶어서 씁니다.

```python
@pytest.mark.parametrize(
    "text,expected",
    [("1", 1), ("10", 10), ("-1", -1)],
)
def test_파싱(text, expected):
    assert parse(text) == expected
```

파일을 다루는 코드는 실제 경로 대신 임시 디렉터리를 받습니다. 테스트가 서로 간섭하지 않습니다.

```python
def test_저장(tmp_path):
    target = tmp_path / "todos.json"

    save(target, [{"title": "공부"}])

    assert target.exists()
```

무엇을 테스트할지는 **규칙**을 기준으로 고릅니다. 빈 제목을 막는지, 원본을 바꾸지 않는지, 경계값에서 어떻게 되는지 같은 것들입니다. 단순한 대입과 반환까지 전부 덮을 필요는 없습니다.

## 명령행 인자

스크립트를 다른 사람이 쓰게 하려면 인자를 받아야 합니다. `sys.argv`를 직접 파싱하는 대신 `argparse`를 씁니다.

```python
import argparse
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description="할 일 목록을 관리합니다")

    parser.add_argument("command", choices=["list", "add"])
    parser.add_argument("title", nargs="?", help="추가할 제목")
    parser.add_argument(
        "--file",
        type=Path,
        default=Path("todos.json"),
        help="저장 파일 경로",
    )
    parser.add_argument("--verbose", action="store_true")

    args = parser.parse_args()

    if args.command == "add" and not args.title:
        parser.error("add 명령에는 제목이 필요합니다")

    run(args)


if __name__ == "__main__":
    main()
```

```bash
python main.py add "공부" --file data/todos.json
python main.py --help     # 도움말이 자동으로 만들어집니다
```

`type=Path`를 지정하면 문자열이 아니라 `Path`로 변환되어 들어옵니다. `--help`는 적어 둔 `help` 문구로 자동 생성됩니다.

종료 코드를 맞춰 주면 다른 스크립트에서 이어 쓸 수 있습니다.

```python
import sys

try:
    run(args)
except TodoError as error:
    print(f"오류: {error}", file=sys.stderr)
    sys.exit(1)
```

실패를 표준 에러로 내보내고 0이 아닌 코드로 끝내는 것이 명령행 도구의 관례입니다.
