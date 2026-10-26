---
title: Python 01. 실행 환경과 기본 문법
description: 인터프리터와 가상 환경을 준비하고 기본 문법을 익힙니다.
outline: deep
---

# 01. 실행 환경과 기본 문법

코드를 실행할 환경을 갖추고, 값과 흐름을 다루는 문법을 정리합니다.

## 인터프리터

Python은 컴파일 단계 없이 인터프리터가 한 줄씩 읽어 실행합니다. 파일로 실행하거나 대화형으로 바로 써 볼 수 있습니다.

```bash
python3 main.py        # 파일 실행
python3                # 대화형 셸
python3 -m http.server # 모듈을 실행
```

여러 버전이 깔려 있을 수 있으므로 쓰고 있는 버전을 확인해 둡니다.

```bash
python3 --version
which python3
```

실행 중인 파일이 직접 실행된 것인지, 다른 곳에서 가져다 쓴 것인지 구분하는 관용 표현이 있습니다.

```python
def main():
    print("실행")


if __name__ == "__main__":
    main()
```

`import`로 불러왔을 때는 `__name__`이 모듈 이름이 되므로 `main()`이 실행되지 않습니다.

## 가상 환경

패키지를 전역에 깔면 프로젝트마다 다른 버전이 필요할 때 충돌합니다. 프로젝트별로 격리된 환경을 만듭니다.

```bash
python3 -m venv .venv
source .venv/bin/activate   # Windows는 .venv\Scripts\activate

python -m pip install requests
pip freeze > requirements.txt

deactivate
```

`.venv` 폴더는 저장소에 넣지 않고 `.gitignore`에 추가합니다. 대신 `requirements.txt`를 공유해 같은 환경을 재현합니다.

```bash
pip install -r requirements.txt
```

## 변수와 기본 타입

선언 키워드 없이 대입하면 변수가 만들어집니다. 타입은 값에 붙어 있습니다.

```python
count = 1          # int
ratio = 1.5        # float
title = "공부"      # str
done = False       # bool
nothing = None     # NoneType

type(count)        # <class 'int'>
isinstance(count, int)  # True
```

정수는 크기 제한이 없습니다.

```python
2 ** 100  # 1267650600228229401496703205376
```

나눗셈이 둘로 나뉘는 점에 주의합니다.

```python
7 / 2   # 3.5   항상 float
7 // 2  # 3     몫
7 % 2   # 1     나머지
-7 // 2 # -4    버림이 아니라 내림입니다
```

실수 계산은 다른 언어와 마찬가지로 오차가 있습니다. 금액에는 `decimal`을 씁니다.

```python
0.1 + 0.2        # 0.30000000000000004

from decimal import Decimal
Decimal("0.1") + Decimal("0.2")  # Decimal('0.3')
```

`None`은 값이 없음을 나타냅니다. 비교에는 `==`가 아니라 `is`를 씁니다.

```python
if value is None:
    ...
```

## 문자열 처리와 f-string

문자열은 만들어진 뒤 바뀌지 않습니다. 메서드는 모두 새 문자열을 돌려줍니다.

```python
title = "  공부하기  "

title.strip()        # "공부하기"
title.replace("공부", "운동")
title.upper()
"a,b,c".split(",")   # ["a", "b", "c"]
",".join(["a", "b"]) # "a,b"

title  # 원본은 그대로입니다
```

값을 끼워 넣을 때는 f-string을 씁니다.

```python
name = "bit"
count = 3

f"{name}님의 할 일 {count}건"
f"{count / 7:.2f}"        # 소수점 둘째 자리까지
f"{count:>5}"             # 오른쪽 정렬
f"{name=}"                # "name='bit'" — 디버깅에 편리합니다
```

여러 줄 문자열은 따옴표 세 개를 씁니다.

```python
message = """첫 줄
둘째 줄"""
```

## 들여쓰기

Python은 중괄호 대신 들여쓰기로 블록을 구분합니다. 같은 블록은 들여쓰기 폭이 같아야 하고, 섞이면 실행 자체가 되지 않습니다.

```python
def check(count):
    if count > 0:
        return "있음"
    return "없음"
```

```python
def broken(count):
    if count > 0:
        return "있음"
      return "없음"  # IndentationError
```

공백 네 칸이 표준입니다. 탭과 공백을 섞으면 `TabError`가 납니다.

본문이 아직 없는 자리에는 `pass`를 둡니다.

```python
def todo():
    pass
```

## 조건문과 반복문

조건문에 괄호는 필요 없고, `else if`는 `elif`입니다.

```python
if count > 10:
    size = "많음"
elif count > 0:
    size = "적음"
else:
    size = "없음"
```

한 줄로 쓰는 조건식도 있습니다.

```python
size = "많음" if count > 10 else "적음"
```

빈 값은 거짓으로 취급됩니다.

```python
# 거짓으로 취급되는 것들
False, None, 0, 0.0, "", [], (), {}, set()

if not items:
    print("비어 있습니다")
```

반복문은 시퀀스를 직접 돕니다. 인덱스로 도는 방식은 거의 쓰지 않습니다.

```python
items = ["a", "b", "c"]

for item in items:
    print(item)

for index, item in enumerate(items):
    print(index, item)

for a, b in zip(items, [1, 2, 3]):
    print(a, b)

for i in range(3):      # 0, 1, 2
    print(i)
```

`for`와 `while`에 `else`를 붙일 수 있습니다. **`break` 없이 끝났을 때** 실행됩니다.

```python
for item in items:
    if item == "찾는 값":
        break
else:
    print("찾지 못했습니다")
```
