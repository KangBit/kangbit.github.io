---
title: Python 04. 모듈과 객체
description: 코드를 모듈로 나누고 클래스와 제너레이터로 구조를 만듭니다.
outline: deep
---

# 04. 모듈과 객체

파일을 나누어 책임을 분리하고, 데이터를 담는 객체와 값을 흘려보내는 방법을 정리합니다.

## 모듈과 패키지

파일 하나가 모듈이고, 폴더가 패키지입니다.

```
src/
├── __init__.py
├── todo.py
└── storage/
    ├── __init__.py
    └── json_file.py
```

```python
from src.todo import add_todo
from src.storage.json_file import save
import src.todo as todo
```

`__init__.py`는 비어 있어도 됩니다. 패키지에서 공개할 것을 모아 두는 자리로 씁니다.

```python
# src/storage/__init__.py
from .json_file import load, save

__all__ = ["load", "save"]
```

같은 패키지 안에서는 상대 경로로 가져올 수 있습니다.

```python
from .todo import add_todo      # 같은 패키지
from ..config import SETTINGS   # 상위 패키지
```

모듈은 처음 가져올 때 **한 번만 실행**되고 결과가 공유됩니다. 모듈 최상단에 무거운 작업이나 부수 효과를 두지 않습니다.

```python
# 권장하지 않습니다 — import만 해도 실행됩니다
connection = connect_database()
```

## 클래스

데이터와 그것을 다루는 동작을 묶습니다.

```python
class TodoList:
    def __init__(self, todos=None):
        self.todos = todos or []

    def add(self, title):
        self.todos.append({"title": title, "done": False})
        return self

    def undone(self):
        return [todo for todo in self.todos if not todo["done"]]

    def __len__(self):
        return len(self.todos)

    def __repr__(self):
        return f"TodoList({len(self.todos)}건)"
```

```python
todos = TodoList()
todos.add("공부").add("운동")

len(todos)   # 2  — __len__이 호출됩니다
todos        # TodoList(2건)
```

첫 번째 매개변수 `self`는 인스턴스 자신입니다. 호출할 때는 넘기지 않습니다.

이름 앞에 밑줄을 붙이면 "내부용"이라는 관례적 표시입니다. 실제로 접근을 막지는 않습니다.

```python
class Store:
    def __init__(self):
        self._cache = {}       # 밖에서 쓰지 말라는 신호
        self.__secret = 1      # 이름이 바뀌어 접근이 번거로워집니다
```

## 인스턴스

클래스 속성과 인스턴스 속성은 저장되는 위치가 다릅니다. 가변 객체를 클래스 속성으로 두면 **모든 인스턴스가 공유**합니다.

```python
class Bad:
    todos = []            # 클래스 속성 — 공유됩니다

    def add(self, title):
        self.todos.append(title)


a, b = Bad(), Bad()
a.add("공부")
b.todos   # ["공부"]  ← a가 넣은 것이 보입니다
```

```python
class Good:
    def __init__(self):
        self.todos = []   # 인스턴스마다 따로 만듭니다
```

함수의 기본 인자와 같은 성격의 함정입니다.

## 데이터 클래스

값을 담기만 하는 클래스는 `dataclass`로 짧게 씁니다. 생성자와 `__repr__`, `__eq__`가 자동으로 만들어집니다.

```python
from dataclasses import dataclass, field, replace


@dataclass
class Todo:
    id: int
    title: str
    done: bool = False
    tags: list[str] = field(default_factory=list)
```

```python
todo = Todo(id=1, title="공부")

todo          # Todo(id=1, title='공부', done=False, tags=[])
todo == Todo(id=1, title="공부")   # True — 값으로 비교합니다
```

가변 기본값은 `field(default_factory=...)`로 둡니다. 리스트를 직접 쓰면 오류가 납니다.

일부만 바꾼 새 객체는 `replace`로 만듭니다.

```python
done_todo = replace(todo, done=True)   # todo는 그대로입니다
```

바뀌지 않아야 하는 값에는 `frozen=True`를 씁니다. 대입이 막히고 딕셔너리 키로도 쓸 수 있게 됩니다.

```python
@dataclass(frozen=True)
class Point:
    x: int
    y: int


p = Point(1, 2)
p.x = 3   # FrozenInstanceError
```

## 이터레이터와 제너레이터

`for`가 돌 수 있는 객체는 `__iter__`를 가진 것입니다. 직접 만들 수도 있지만, 보통은 제너레이터를 씁니다.

`yield`가 있는 함수는 호출해도 바로 실행되지 않고, 값을 하나 요청할 때마다 다음 `yield`까지 진행합니다.

```python
def read_lines(path):
    with open(path, encoding="utf-8") as file:
        for line in file:
            yield line.rstrip("\n")


for line in read_lines("big.log"):
    process(line)
```

파일 전체를 메모리에 올리지 않고 한 줄씩 처리합니다. 리스트로 모두 읽는 방식과 대비됩니다.

```python
lines = open(path).readlines()   # 전부 메모리에 올립니다
```

제너레이터 표현식은 컴프리헨션의 괄호만 바꾼 것입니다. 중간 리스트를 만들지 않습니다.

```python
total = sum(todo["count"] for todo in todos)      # 괄호
counts = [todo["count"] for todo in todos]        # 대괄호 — 리스트를 만듭니다
```

끝이 없는 수열도 표현할 수 있습니다. 필요한 만큼만 꺼내 씁니다.

```python
from itertools import count, islice


def ids():
    for n in count(1):
        yield f"todo-{n}"


list(islice(ids(), 3))   # ['todo-1', 'todo-2', 'todo-3']
```

한 번 소비하면 다시 돌 수 없다는 점에 주의합니다. 두 번 순회해야 하면 리스트로 만들어 둡니다.

```python
gen = (n for n in range(3))

list(gen)   # [0, 1, 2]
list(gen)   # []  ← 이미 소진되었습니다
```

## 데코레이터

함수를 받아 기능을 덧씌운 함수를 돌려줍니다. `@` 표기는 그 과정을 짧게 쓴 것입니다.

```python
import functools
import time


def log_time(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        print(f"{func.__name__}: {time.perf_counter() - start:.3f}초")
        return result

    return wrapper


@log_time
def load_todos(path):
    ...
```

`@log_time`은 `load_todos = log_time(load_todos)`와 같습니다.

`functools.wraps`를 붙이지 않으면 함수의 이름과 설명이 `wrapper`의 것으로 바뀌어 디버깅이 어려워집니다.

표준 라이브러리에도 자주 쓰는 것들이 있습니다.

```python
from functools import cache


@cache
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)
```

## 자주 쓰는 표준 라이브러리

설치 없이 바로 쓸 수 있고, 직접 구현하기 전에 먼저 찾아볼 것들입니다.

| 모듈 | 쓰임 |
| --- | --- |
| `pathlib` | 경로 다루기 |
| `datetime` | 날짜와 시간, 기간 계산 |
| `collections` | `defaultdict`, `Counter`, `deque` |
| `itertools` | `groupby`, `chain`, `islice` |
| `functools` | `cache`, `reduce`, `partial` |
| `json` / `csv` | 데이터 형식 읽고 쓰기 |
| `argparse` | 명령행 인자 |
| `logging` | 로그 |

```python
from collections import Counter, defaultdict

Counter(["a", "b", "a"])          # Counter({'a': 2, 'b': 1})

grouped = defaultdict(list)
for todo in todos:
    grouped[todo["done"]].append(todo)   # 키가 없어도 바로 append
```
