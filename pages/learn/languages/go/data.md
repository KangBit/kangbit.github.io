---
title: Go 02. 데이터 구조와 메모리
description: 슬라이스와 맵의 동작을 이해하고 값과 포인터의 차이를 익힙니다.
outline: deep
---

# 02. 데이터 구조와 메모리

데이터를 담는 구조들이 내부에서 어떻게 동작하는지, 값을 넘길 때 무엇이 복사되는지 정리합니다.

## 배열과 슬라이스

배열은 길이가 타입의 일부입니다. `[3]int`와 `[4]int`는 다른 타입이라 서로 대입할 수 없습니다.

```go
var fixed [3]int
fixed[0] = 1
len(fixed)   // 3
```

실제로는 길이가 유연한 슬라이스를 거의 항상 씁니다.

```go
list := []int{1, 2, 3}
list = append(list, 4)

empty := make([]int, 0)       // 길이 0
sized := make([]int, 3)       // [0 0 0]
```

슬라이스는 배열을 **들여다보는 창**입니다. 포인터와 길이, 용량 세 가지를 들고 있습니다.

```go
origin := []int{1, 2, 3, 4, 5}
window := origin[1:3]   // [2 3]

window[0] = 99
origin   // [1 99 3 4 5]  ← 같은 배열을 봅니다
```

잘라 낸 슬라이스를 고치면 원본이 바뀝니다. 끊어 내려면 복사합니다.

```go
copied := make([]int, len(window))
copy(copied, window)
```

## 슬라이스의 길이와 용량

`len`은 지금 보이는 개수, `cap`은 바탕 배열에 들어갈 수 있는 개수입니다.

```go
list := make([]int, 2, 5)

len(list)   // 2
cap(list)   // 5
```

`append`는 용량이 남으면 그 자리에 쓰고, 모자라면 **더 큰 배열을 새로 만들어 옮깁니다.**

```go
a := make([]int, 0, 2)
a = append(a, 1, 2)
b := append(a, 3)      // 용량 초과 — 새 배열이 만들어집니다

a = append(a, 99)      // a는 옛 배열을 씁니다
b[0]                   // b는 영향을 받지 않습니다
```

용량이 남아 있을 때는 같은 배열을 공유해서 결과가 달라집니다.

```go
a := make([]int, 2, 5)   // [0 0]
b := append(a, 1)        // 같은 배열에 씁니다
c := append(a, 2)        // 같은 자리를 덮어씁니다

b[2]   // 2  ← 1이 아닙니다
```

그래서 `append`의 결과는 **항상 같은 변수에 다시 받는** 것이 관례입니다.

```go
list = append(list, item)
```

크기를 알고 있으면 미리 잡아 두는 편이 낫습니다. 재할당과 복사가 줄어듭니다.

```go
result := make([]Todo, 0, len(todos))
```

슬라이스의 기본값은 `nil`입니다. 길이가 0인 것과 거의 같게 동작하므로 그냥 써도 됩니다.

```go
var list []int
len(list)              // 0
list = append(list, 1) // 동작합니다
list == nil            // 처음에는 true
```

## 맵

키와 값을 짝지어 담습니다. 쓰기 전에 만들어야 합니다.

```go
m := make(map[string]int)
m := map[string]int{"a": 1}

var nilMap map[string]int
nilMap["a"] = 1   // panic: assignment to entry in nil map
```

없는 키를 읽으면 오류가 아니라 **기본값**이 나옵니다. 있는지 확인하려면 두 번째 반환값을 받습니다.

```go
count := m["없는키"]          // 0

value, ok := m["없는키"]
if !ok {
    fmt.Println("없습니다")
}

delete(m, "a")
len(m)
```

값이 0인 것과 키가 없는 것을 구분하려면 반드시 `ok`를 확인해야 합니다.

맵은 순서가 없습니다. 정렬된 순회가 필요하면 키를 모아 정렬합니다.

```go
keys := make([]string, 0, len(m))
for key := range m {
    keys = append(keys, key)
}
sort.Strings(keys)

for _, key := range keys {
    fmt.Println(key, m[key])
}
```

집합이 필요하면 값이 빈 구조체인 맵을 씁니다. 메모리를 쓰지 않습니다.

```go
seen := map[string]struct{}{}
seen["a"] = struct{}{}

if _, ok := seen["a"]; ok { }
```

## 구조체

필드를 묶은 타입입니다. 클래스는 없습니다.

```go
type Todo struct {
    ID    int64
    Title string
    Done  bool
}


todo := Todo{ID: 1, Title: "공부"}
todo := Todo{1, "공부", false}   // 순서대로 — 필드가 바뀌면 깨집니다
var empty Todo                    // 모든 필드가 기본값
```

필드 이름을 적는 쪽이 안전합니다. 구조체에 필드가 추가돼도 그대로 컴파일됩니다.

JSON과 주고받을 때는 태그로 이름을 지정합니다.

```go
type Todo struct {
    ID    int64  `json:"id"`
    Title string `json:"title"`
    Done  bool   `json:"done"`
    Memo  string `json:"memo,omitempty"`
}
```

소문자로 시작하는 필드는 패키지 밖에서 보이지 않고, JSON으로도 나가지 않습니다.

구조체는 **값**입니다. 대입하면 전체가 복사됩니다.

```go
a := Todo{Title: "공부"}
b := a
b.Title = "운동"

a.Title   // "공부" — 그대로입니다
```

비교도 됩니다. 모든 필드가 비교 가능한 타입이어야 합니다.

```go
Todo{ID: 1} == Todo{ID: 1}   // true
```

슬라이스나 맵이 필드에 있으면 비교할 수 없습니다.

## 포인터

값이 있는 위치를 가리킵니다.

```go
todo := Todo{Title: "공부"}

p := &todo       // 주소를 얻습니다
p.Title          // (*p).Title 을 줄여 쓴 것입니다
p.Title = "운동"

todo.Title       // "운동" — 원본이 바뀌었습니다
```

Go에는 포인터 연산이 없습니다. 주소를 더하거나 빼서 옮겨 다닐 수 없습니다.

`nil` 포인터를 따라가면 패닉이 납니다.

```go
var p *Todo
p.Title   // panic: nil pointer dereference

if p != nil {
    p.Title
}
```

`new`로 만들 수도 있지만, 보통은 구조체 리터럴의 주소를 씁니다.

```go
p := new(Todo)        // 기본값으로 채운 Todo의 포인터
p := &Todo{Title: "공부"}   // 이쪽을 더 많이 씁니다
```

## 값 복사와 공유

**Go는 항상 값을 복사해서 전달합니다.** 포인터를 넘기는 것도 "주소라는 값"을 복사하는 것입니다.

```go
func rename(todo Todo) {
    todo.Title = "운동"   // 복사본을 고칩니다
}

func renamePtr(todo *Todo) {
    todo.Title = "운동"   // 원본을 고칩니다
}


todo := Todo{Title: "공부"}

rename(todo)
todo.Title      // "공부"

renamePtr(&todo)
todo.Title      // "운동"
```

슬라이스와 맵은 내부에 포인터를 들고 있어서, 값으로 넘겨도 **내용은 공유됩니다.**

```go
func fill(list []int) {
    list[0] = 99      // 원본이 바뀝니다
}

func add(list []int) {
    list = append(list, 1)   // 재할당되면 원본과 끊어집니다
}
```

`append`가 새 배열을 만들면 함수 안의 변수만 그것을 가리킵니다. 늘어난 결과가 필요하면 반환해서 다시 받아야 합니다.

```go
func add(list []int) []int {
    return append(list, 1)
}

list = add(list)
```

포인터를 쓸지 값을 쓸지는 두 가지로 판단합니다.

- 원본을 고쳐야 하면 포인터
- 구조체가 커서 복사 비용이 크면 포인터

작고 바뀌지 않는 구조체는 값으로 넘기는 편이 단순하고 안전합니다.
