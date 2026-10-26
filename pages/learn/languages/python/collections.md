---
title: Python 02. 컬렉션과 함수
description: 리스트와 딕셔너리로 데이터를 다루고 함수로 로직을 묶습니다.
outline: deep
---

# 02. 컬렉션과 함수

데이터를 담는 자료형들의 차이를 확인하고, 필요한 것만 골라 변환하는 방법을 정리합니다.

## 리스트

순서가 있고 바꿀 수 있는 목록입니다.

```python
todos = ["공부", "운동"]

todos.append("독서")         # 끝에 추가
todos.insert(0, "기상")      # 위치 지정
todos.remove("운동")         # 값으로 삭제
popped = todos.pop()         # 마지막을 꺼내면서 삭제

len(todos)
"공부" in todos              # True
```

정렬은 원본을 바꾸는 것과 새 리스트를 주는 것이 나뉩니다.

```python
numbers = [3, 1, 2]

numbers.sort()               # 원본이 바뀝니다
sorted(numbers, reverse=True)  # 새 리스트를 반환합니다

sorted(todos, key=len)       # 기준을 지정
```

## 튜플

바꿀 수 없는 목록입니다. 고정된 묶음이나 함수의 여러 반환값에 씁니다.

```python
point = (1, 2)
point[0] = 3   # TypeError

x, y = point   # 언패킹
```

요소가 하나일 때는 쉼표가 있어야 튜플입니다.

```python
one = (1,)   # 튜플
not_tuple = (1)  # 그냥 int
```

바뀌지 않으므로 딕셔너리의 키나 집합의 원소로 쓸 수 있습니다. 리스트는 쓸 수 없습니다.

## 딕셔너리

키와 값을 짝지어 담습니다. 삽입 순서가 유지됩니다.

```python
todo = {"id": 1, "title": "공부", "done": False}

todo["title"]            # "공부"
todo["memo"]             # KeyError
todo.get("memo")         # None
todo.get("memo", "없음")  # 기본값

todo["memo"] = "추가"     # 없으면 만들고 있으면 덮어씁니다
del todo["memo"]

"title" in todo          # True — 키를 확인합니다
```

순회할 때는 무엇을 돌 것인지 밝혀 적습니다.

```python
for key in todo:            # 키
    ...
for value in todo.values(): # 값
    ...
for key, value in todo.items():  # 둘 다
    print(key, value)
```

합치기와 복사도 자주 씁니다.

```python
merged = {**todo, "done": True}   # 일부만 바꾼 새 딕셔너리
```

## 집합

중복이 없고 순서도 없습니다. 포함 여부 확인이 빠릅니다.

```python
seen = {1, 2, 2, 3}   # {1, 2, 3}
seen.add(4)
seen.discard(1)       # 없어도 오류가 나지 않습니다

list(set([1, 1, 2]))  # 중복 제거
```

집합 연산을 그대로 쓸 수 있습니다.

```python
a = {1, 2, 3}
b = {2, 3, 4}

a & b   # {2, 3}      교집합
a | b   # {1, 2, 3, 4} 합집합
a - b   # {1}         차집합
```

빈 집합은 `{}`가 아니라 `set()`입니다. `{}`는 빈 딕셔너리입니다.

## 슬라이싱

`[시작:끝:간격]`으로 일부를 잘라 냅니다. 끝은 포함하지 않습니다.

```python
items = [0, 1, 2, 3, 4]

items[1:3]    # [1, 2]
items[:2]     # [0, 1]
items[2:]     # [2, 3, 4]
items[-2:]    # [3, 4]
items[::2]    # [0, 2, 4]
items[::-1]   # [4, 3, 2, 1, 0]  역순
```

문자열에도 똑같이 적용됩니다.

```python
"abcdef"[1:3]   # "bc"
```

슬라이싱 결과는 **얕은 복사**입니다. 리스트 자체는 새것이지만 안의 객체는 공유합니다.

```python
copy = items[:]     # 새 리스트
copy.append(5)
items               # 영향 없음
```

## 컴프리헨션

반복과 변환을 한 줄로 씁니다. Python에서 가장 자주 보이는 표현입니다.

```python
titles = [todo["title"] for todo in todos]

undone = [todo for todo in todos if not todo["done"]]

upper = [t.upper() for t in titles if len(t) > 2]
```

딕셔너리와 집합도 만들 수 있습니다.

```python
by_id = {todo["id"]: todo for todo in todos}

unique_titles = {todo["title"] for todo in todos}
```

조건에 따라 값을 바꿀 때는 앞쪽에 조건식을 둡니다. 거르는 `if`와 자리가 다릅니다.

```python
labels = ["완료" if todo["done"] else "진행" for todo in todos]
```

줄이 길어지면 그냥 `for` 문으로 푸는 편이 읽기 좋습니다. 중첩이 두 단계를 넘어가면 특히 그렇습니다.

## 함수 인자와 반환값

```python
def add_todo(todos, title, done=False):
    return [*todos, {"title": title, "done": done}]


add_todo(todos, "운동")
add_todo(todos, "운동", done=True)   # 이름을 붙여 전달
```

개수를 정하지 않고 받을 수 있습니다.

```python
def summarize(*args, **kwargs):
    print(args)    # 튜플
    print(kwargs)  # 딕셔너리


summarize(1, 2, name="bit")
# (1, 2)
# {'name': 'bit'}
```

여러 값을 반환하면 튜플로 묶여 나옵니다.

```python
def parse(text):
    value = int(text)
    return value, value > 0


number, is_positive = parse("5")
```

### 기본 인자에 가변 객체를 쓰지 않습니다

기본값은 **함수를 정의할 때 한 번만 만들어집니다.** 리스트나 딕셔너리를 기본값으로 두면 호출할 때마다 같은 객체가 재사용됩니다.

```python
def append_bad(item, target=[]):
    target.append(item)
    return target


append_bad(1)  # [1]
append_bad(2)  # [1, 2]  ← 비어 있을 것으로 기대했지만 남아 있습니다
```

`None`을 기본값으로 두고 안에서 만듭니다.

```python
def append(item, target=None):
    if target is None:
        target = []
    target.append(item)
    return target
```
