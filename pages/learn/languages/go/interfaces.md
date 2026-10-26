---
title: Go 03. 메서드와 인터페이스
description: 타입에 동작을 붙이고 인터페이스로 구현을 갈아 끼웁니다.
outline: deep
---

# 03. 메서드와 인터페이스

타입에 동작을 정의하는 방법과, 구현에 묶이지 않는 코드를 쓰는 방법을 정리합니다.

## 메서드

함수 이름 앞에 받는 타입을 적으면 메서드가 됩니다.

```go
type Todo struct {
    ID    int64
    Title string
    Done  bool
}

func (t Todo) Label() string {
    if t.Done {
        return "[x] " + t.Title
    }
    return "[ ] " + t.Title
}


todo := Todo{Title: "공부"}
todo.Label()   // "[ ] 공부"
```

구조체뿐 아니라 직접 정의한 타입이면 무엇이든 붙일 수 있습니다.

```go
type Status int

func (s Status) String() string {
    switch s {
    case Todo:
        return "할 일"
    case Done:
        return "완료"
    }
    return "알 수 없음"
}
```

`String()` 메서드가 있으면 `fmt`가 출력할 때 자동으로 씁니다.

## 값·포인터 리시버

리시버를 값으로 받으면 복사본이, 포인터로 받으면 원본이 전달됩니다.

```go
func (t Todo) CompleteValue() {
    t.Done = true     // 복사본만 바뀝니다
}

func (t *Todo) Complete() {
    t.Done = true     // 원본이 바뀝니다
}


todo := Todo{}
todo.CompleteValue()
todo.Done   // false

todo.Complete()
todo.Done   // true
```

`todo.Complete()`처럼 값에 포인터 메서드를 불러도 동작합니다. 컴파일러가 `(&todo).Complete()`로 바꿔 줍니다. 다만 **주소를 얻을 수 있는 값**이어야 합니다.

```go
todos := map[string]Todo{"a": {}}
todos["a"].Complete()   // 컴파일 오류 — 맵의 값은 주소를 얻을 수 없습니다
```

고르는 기준은 단순합니다.

- 상태를 바꾸는 메서드가 하나라도 있으면 **전부 포인터 리시버**로 통일합니다
- 구조체가 크면 복사를 피하려고 포인터를 씁니다
- 작고 바뀌지 않는 값 타입이면 값 리시버가 자연스럽습니다

섞어 쓰면 어떤 것이 원본을 바꾸는지 읽는 사람이 매번 확인해야 합니다.

## 인터페이스

메서드 묶음만 정의합니다. 구현하겠다고 선언하지 않아도, 메서드를 갖추면 **자동으로 만족합니다.**

```go
type Storage interface {
    Load() ([]Todo, error)
    Save(todos []Todo) error
}


type JSONStorage struct {
    Path string
}

func (s JSONStorage) Load() ([]Todo, error) { ... }
func (s JSONStorage) Save(todos []Todo) error { ... }
// implements 같은 키워드가 없습니다
```

쓰는 쪽은 인터페이스를 받습니다. 저장 방식이 바뀌어도 이 코드는 그대로입니다.

```go
type Service struct {
    storage Storage
}

func NewService(storage Storage) *Service {
    return &Service{storage: storage}
}


NewService(JSONStorage{Path: "todos.json"})
NewService(MemoryStorage{})   // 테스트에서는 이쪽
```

인터페이스는 **쓰는 쪽에 두는 것**이 Go의 관례입니다. 구현하는 패키지가 아니라 필요로 하는 패키지에 선언합니다. 그래야 필요한 메서드만 작게 정의할 수 있습니다.

작을수록 좋습니다. 표준 라이브러리의 인터페이스는 대부분 메서드가 하나입니다.

```go
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Stringer interface {
    String() string
}
```

`any`는 모든 타입을 받습니다. 꺼낼 때는 타입 단언으로 확인합니다.

```go
func describe(value any) string {
    switch v := value.(type) {
    case string:
        return "문자열: " + v
    case int:
        return fmt.Sprintf("정수: %d", v)
    default:
        return "알 수 없음"
    }
}


text, ok := value.(string)   // ok로 받으면 실패해도 패닉이 나지 않습니다
```

인터페이스 값은 타입과 값 두 가지를 들고 있습니다. 그래서 **nil 포인터를 담은 인터페이스는 nil이 아닙니다.**

```go
var p *JSONStorage = nil
var s Storage = p

s == nil   // false  ← 타입 정보가 들어 있습니다
```

오류를 돌려줄 때 자주 부딪히는 함정입니다. `error`를 반환할 때는 구체 타입 변수를 거치지 말고 `nil`을 그대로 반환합니다.

## 합성과 임베딩

Go에는 상속이 없습니다. 필요한 것을 **필드로 가집니다.**

```go
type Service struct {
    storage Storage
    logger  *slog.Logger
}
```

이름 없이 타입만 적으면 임베딩이 됩니다. 안쪽 타입의 메서드가 바깥으로 올라옵니다.

```go
type Base struct {
    ID int64
}

func (b Base) Describe() string {
    return fmt.Sprintf("#%d", b.ID)
}


type Todo struct {
    Base          // 임베딩
    Title string
}


todo := Todo{Base: Base{ID: 1}, Title: "공부"}

todo.ID          // 1 — todo.Base.ID 를 줄여 쓴 것입니다
todo.Describe()  // "#1"
```

상속처럼 보이지만 다릅니다. **`Todo`는 `Base`가 아닙니다.** `Base`를 받는 함수에 `Todo`를 넘길 수 없습니다.

```go
func print(b Base) { }

print(todo)        // 컴파일 오류
print(todo.Base)   // 이렇게 넘깁니다
```

인터페이스도 임베딩할 수 있습니다.

```go
type ReadWriter interface {
    Reader
    Writer
}
```

구조체에 인터페이스를 임베딩하면, 일부 메서드만 덮어쓰는 구현을 만들 수 있습니다.

```go
type LoggingStorage struct {
    Storage          // 나머지는 그대로 위임됩니다
    logger *slog.Logger
}

func (s LoggingStorage) Save(todos []Todo) error {
    s.logger.Info("저장", "count", len(todos))
    return s.Storage.Save(todos)
}
```

## 제네릭

Go 1.18부터 타입 매개변수를 쓸 수 있습니다.

```go
func Map[T, R any](list []T, fn func(T) R) []R {
    result := make([]R, 0, len(list))
    for _, item := range list {
        result = append(result, fn(item))
    }
    return result
}


titles := Map(todos, func(t Todo) string { return t.Title })
```

제약은 인터페이스로 적습니다.

```go
type Number interface {
    ~int | ~int64 | ~float64
}

func Sum[T Number](list []T) T {
    var total T
    for _, item := range list {
        total += item
    }
    return total
}
```

`~int`는 "기본 타입이 int인 모든 타입"입니다. `type Status int`처럼 정의한 타입도 포함됩니다.

자주 쓰는 제약은 표준으로 제공됩니다.

```go
import "cmp"

func Max[T cmp.Ordered](list []T) T { ... }
```

타입 매개변수는 함수와 타입에 쓸 수 있지만 **메서드에는 쓸 수 없습니다.**

```go
func (s Service) Map[T any](...) { }   // 컴파일 오류
```

제네릭이 생겼다고 모든 곳에 쓰지는 않습니다. 인터페이스로 충분하면 인터페이스가 읽기 쉽습니다. 여러 타입에 대해 **똑같은 코드를 반복하게 될 때**가 쓸 자리입니다.
