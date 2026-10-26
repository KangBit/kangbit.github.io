---
title: Go 04. 오류 처리와 입출력
description: 오류를 값으로 다루고 자원을 정리하며 파일과 JSON을 처리합니다.
outline: deep
---

# 04. 오류 처리와 입출력

실패를 어떻게 돌려주고 확인할지, 파일과 데이터를 다루는 표준 방법을 정리합니다.

## error 반환

Go에는 예외가 없습니다. 오류는 **그냥 값**이고 마지막 반환값으로 돌려줍니다.

```go
func Load(path string) ([]Todo, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return nil, err
    }

    var todos []Todo
    if err := json.Unmarshal(data, &todos); err != nil {
        return nil, err
    }

    return todos, nil
}
```

호출하는 쪽은 **바로 확인합니다.** 이 세 줄이 Go 코드에서 가장 자주 보이는 모양입니다.

```go
todos, err := Load("todos.json")
if err != nil {
    return err
}
```

장황해 보이지만, 실패할 수 있는 지점이 코드에 그대로 드러난다는 장점이 있습니다. 어디서 무엇이 실패하는지 숨지 않습니다.

오류를 만드는 방법은 두 가지입니다.

```go
errors.New("제목이 비어 있습니다")
fmt.Errorf("잘못된 id: %d", id)
```

미리 선언해 두면 호출하는 쪽이 비교할 수 있습니다. 이름은 `Err`로 시작하는 것이 관례입니다.

```go
var ErrEmptyTitle = errors.New("제목이 비어 있습니다")

func Add(todos []Todo, title string) ([]Todo, error) {
    if strings.TrimSpace(title) == "" {
        return nil, ErrEmptyTitle
    }
    return append(todos, Todo{Title: title}), nil
}
```

오류를 무시하려면 명시적으로 버려야 합니다. `_`가 보이면 의도적으로 무시했다는 뜻이 됩니다.

```go
_ = file.Close()
```

## 오류 감싸기와 확인

그대로 올려보내면 어디서 났는지 알 수 없습니다. 맥락을 덧붙입니다. `%w`가 원래 오류를 안에 보존합니다.

```go
if err != nil {
    return fmt.Errorf("%s 읽기 실패: %w", path, err)
}
```

```
todos.json 읽기 실패: open todos.json: no such file or directory
```

`%w` 대신 `%v`를 쓰면 메시지만 남고 원래 오류를 꺼낼 수 없습니다.

감싼 오류는 `errors.Is`로 확인합니다. 몇 겹을 감쌌든 안쪽까지 찾아 들어갑니다.

```go
if errors.Is(err, os.ErrNotExist) {
    return []Todo{}, nil   // 파일이 없으면 빈 목록으로 시작합니다
}

if errors.Is(err, ErrEmptyTitle) {
    ...
}
```

`==`로 비교하면 감싼 오류를 놓칩니다.

```go
if err == ErrEmptyTitle { }     // 감싸져 있으면 false입니다
if errors.Is(err, ErrEmptyTitle) { }   // 이쪽을 씁니다
```

추가 정보가 필요하면 타입을 만들고 `errors.As`로 꺼냅니다.

```go
type ValidationError struct {
    Field string
    Value string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("%s 값이 잘못되었습니다: %s", e.Field, e.Value)
}


var validationErr *ValidationError
if errors.As(err, &validationErr) {
    fmt.Println(validationErr.Field)
}
```

`panic`은 예외가 아닙니다. 복구할 수 없는 프로그래밍 오류에만 쓰고, 일반적인 실패에는 쓰지 않습니다.

## defer

함수가 끝날 때 실행할 것을 예약합니다. 중간에 어디서 반환하든, 패닉이 나도 실행됩니다.

```go
func Save(path string, todos []Todo) error {
    file, err := os.Create(path)
    if err != nil {
        return err
    }
    defer file.Close()

    return json.NewEncoder(file).Encode(todos)
}
```

여는 코드 바로 아래에 닫는 코드를 두므로, 닫는 것을 잊기 어렵습니다.

여러 개는 **역순으로** 실행됩니다.

```go
defer fmt.Println("1")
defer fmt.Println("2")
// 2, 1 순으로 출력됩니다
```

인자는 `defer`를 만나는 **시점에 평가됩니다.**

```go
count := 1
defer fmt.Println(count)   // 1이 출력됩니다
count = 2
```

지금 값이 아니라 끝날 때의 값이 필요하면 클로저로 감쌉니다.

```go
defer func() { fmt.Println(count) }()   // 2
```

쓰기 작업의 `Close`는 오류를 확인해야 합니다. 버퍼를 비우는 단계에서 실패할 수 있기 때문입니다.

```go
func Save(path string, todos []Todo) (err error) {
    file, err := os.Create(path)
    if err != nil {
        return err
    }
    defer func() {
        if closeErr := file.Close(); closeErr != nil && err == nil {
            err = closeErr
        }
    }()

    return json.NewEncoder(file).Encode(todos)
}
```

반환값에 이름을 붙여야 `defer` 안에서 고칠 수 있습니다.

`defer`를 반복문 안에 두면 함수가 끝날 때까지 쌓입니다. 파일이 계속 열린 채로 남으므로, 반복 안의 자원은 별도 함수로 빼냅니다.

## 파일과 JSON 처리

작은 파일은 통째로 읽고 씁니다.

```go
data, err := os.ReadFile(path)
err := os.WriteFile(path, data, 0o644)
```

JSON은 구조체와 서로 변환합니다.

```go
type Todo struct {
    ID    int64  `json:"id"`
    Title string `json:"title"`
    Done  bool   `json:"done"`
}


data, err := json.Marshal(todos)
data, err := json.MarshalIndent(todos, "", "  ")   // 보기 좋게

var todos []Todo
err := json.Unmarshal(data, &todos)   // 포인터를 넘겨야 합니다
```

파일을 직접 쓸 때는 인코더와 디코더가 더 효율적입니다. 전체를 메모리에 올리지 않습니다.

```go
file, err := os.Open(path)
if err != nil {
    return nil, err
}
defer file.Close()

var todos []Todo
if err := json.NewDecoder(file).Decode(&todos); err != nil {
    return nil, err
}
```

JSON에 없는 필드는 기본값으로 남습니다. 값이 0인 것과 키가 없는 것을 구분해야 하면 포인터를 씁니다.

```go
type Patch struct {
    Title *string `json:"title"`   // nil이면 보내지 않은 것입니다
    Done  *bool   `json:"done"`
}
```

큰 텍스트 파일은 한 줄씩 읽습니다.

```go
file, _ := os.Open(path)
defer file.Close()

scanner := bufio.NewScanner(file)
for scanner.Scan() {
    process(scanner.Text())
}
if err := scanner.Err(); err != nil {
    return err
}
```

`scanner.Err()` 확인을 빠뜨리면 중간에 끊긴 것을 정상 종료로 착각합니다.

## 자주 쓰는 표준 라이브러리

외부 패키지를 찾기 전에 먼저 볼 것들입니다.

| 패키지 | 쓰임 |
| --- | --- |
| `fmt` | 출력과 문자열 조립 |
| `strings` / `strconv` | 문자열 처리와 변환 |
| `os` / `path/filepath` | 파일과 경로 |
| `encoding/json` | JSON |
| `errors` | 오류 감싸기와 확인 |
| `time` | 시간과 기간 |
| `net/http` | HTTP 서버와 클라이언트 |
| `log/slog` | 구조적 로그 |
| `sort` / `slices` / `maps` | 정렬과 컬렉션 도우미 |
| `context` | 취소와 기한 |

```go
strings.TrimSpace(title)
strings.Split("a,b", ",")
strings.Contains(title, "공부")

filepath.Join("data", "todos.json")   // 운영체제별 구분자를 씁니다

slices.Contains(list, item)
slices.SortFunc(todos, func(a, b Todo) int { return cmp.Compare(a.ID, b.ID) })
```

로그는 `log/slog`로 키와 값을 함께 남깁니다. 나중에 검색하고 필터링하기 좋습니다.

```go
slog.Info("저장 완료", "count", len(todos), "path", path)
slog.Error("저장 실패", "error", err)
```
