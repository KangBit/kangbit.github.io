---
title: Go 05. 동시성과 테스트
description: 고루틴과 채널로 작업을 나누고 취소와 경쟁 상태를 다룹니다.
outline: deep
---

# 05. 동시성과 테스트

여러 작업을 동시에 진행시키는 방법과, 그것이 올바른지 확인하는 방법을 정리합니다.

## 고루틴

함수 호출 앞에 `go`를 붙이면 별도의 흐름으로 실행됩니다.

```go
go fetch(url)
```

스레드보다 훨씬 가볍습니다. 수만 개를 만들어도 부담이 적습니다.

주의할 점은 **기다려 주지 않는다**는 것입니다. `main`이 끝나면 전부 사라집니다.

```go
func main() {
    go fmt.Println("실행될까요")
    // 아무것도 출력되지 않고 끝납니다
}
```

끝날 때까지 기다리려면 `sync.WaitGroup`을 씁니다.

```go
var wg sync.WaitGroup

for _, url := range urls {
    wg.Add(1)
    go func() {
        defer wg.Done()
        fetch(url)
    }()
}

wg.Wait()
```

Go 1.22부터는 반복 변수가 반복마다 새로 만들어집니다. 그 이전에는 변수를 복사해 넘겨야 했습니다.

```go
// Go 1.21 이하에서 필요했던 코드
for _, url := range urls {
    url := url
    go func() { fetch(url) }()
}
```

고루틴 안에서 난 패닉은 **프로그램 전체를 종료시킵니다.** 복구는 그 고루틴 안에서 해야 합니다.

```go
go func() {
    defer func() {
        if r := recover(); r != nil {
            slog.Error("패닉", "value", r)
        }
    }()
    process()
}()
```

## 채널

고루틴 사이에 값을 주고받는 통로입니다.

```go
ch := make(chan int)        // 버퍼 없음
ch := make(chan int, 10)    // 버퍼 10개

ch <- 1        // 보내기
value := <-ch  // 받기
close(ch)
```

버퍼가 없으면 보내는 쪽과 받는 쪽이 **만날 때까지 둘 다 멈춥니다.** 이 성질이 동기화 역할을 합니다.

```go
done := make(chan struct{})

go func() {
    process()
    close(done)
}()

<-done   // 끝날 때까지 기다립니다
```

`range`로 닫힐 때까지 받을 수 있습니다.

```go
results := make(chan Todo)

go func() {
    defer close(results)   // 보내는 쪽이 닫습니다
    for _, todo := range todos {
        results <- todo
    }
}()

for todo := range results {
    fmt.Println(todo.Title)
}
```

닫는 것은 **보내는 쪽의 책임**입니다. 받는 쪽이 닫거나 두 번 닫으면 패닉이 납니다.

닫힌 채널에서 받으면 기본값과 `false`가 나옵니다.

```go
value, ok := <-ch
if !ok {
    // 채널이 닫혔습니다
}
```

여러 채널을 동시에 기다릴 때는 `select`를 씁니다. 준비된 것 중 하나가 실행됩니다.

```go
select {
case todo := <-results:
    process(todo)
case err := <-errs:
    return err
case <-time.After(3 * time.Second):
    return errors.New("시간 초과")
}
```

`default`를 두면 기다리지 않고 바로 넘어갑니다.

## 동기화

채널로 값을 주고받는 대신, 공유 메모리를 잠가서 보호할 수도 있습니다.

```go
type Counter struct {
    mu    sync.Mutex
    count int
}

func (c *Counter) Increase() {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.count++
}
```

읽기가 훨씬 많다면 `RWMutex`가 유리합니다. 읽기끼리는 서로 막지 않습니다.

```go
type Store struct {
    mu    sync.RWMutex
    todos map[int64]Todo
}

func (s *Store) Get(id int64) (Todo, bool) {
    s.mu.RLock()
    defer s.mu.RUnlock()
    todo, ok := s.todos[id]
    return todo, ok
}
```

뮤텍스를 가진 구조체는 복사하면 안 됩니다. 메서드 리시버를 반드시 포인터로 둡니다.

한 번만 실행할 초기화에는 `sync.Once`를 씁니다.

```go
var once sync.Once

func Config() *Settings {
    once.Do(func() { settings = load() })
    return settings
}
```

Go의 관례는 **"메모리를 공유해서 통신하지 말고, 통신해서 메모리를 공유하라"**입니다. 단순한 카운터나 캐시에는 뮤텍스가, 작업을 넘겨주는 흐름에는 채널이 맞습니다.

## context를 통한 취소

오래 걸리는 작업에 "그만둬도 된다"를 전달합니다. 함수의 **첫 번째 인자**로 받는 것이 관례입니다.

```go
func Fetch(ctx context.Context, url string) ([]byte, error) {
    req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
    if err != nil {
        return nil, err
    }

    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    return io.ReadAll(resp.Body)
}
```

기한이나 취소를 붙여 넘깁니다.

```go
ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
defer cancel()   // 반드시 호출합니다. 하지 않으면 자원이 남습니다

data, err := Fetch(ctx, url)
if errors.Is(err, context.DeadlineExceeded) {
    ...
}
```

직접 만든 반복 작업에서는 중간중간 확인합니다.

```go
for _, todo := range todos {
    select {
    case <-ctx.Done():
        return ctx.Err()
    default:
    }

    process(todo)
}
```

`context`는 취소와 기한을 전달하는 용도입니다. 값을 담을 수 있지만, 함수의 인자로 넘길 수 있는 것을 거기에 숨기지 않습니다.

## 단위 테스트와 경쟁 상태 검사

테스트 파일은 `_test.go`로 끝나고 대상과 같은 폴더에 둡니다.

```go
// todo_test.go
package todo

import (
    "errors"
    "testing"
)

func TestAdd(t *testing.T) {
    todos := []Todo{{Title: "공부"}}

    result, err := Add(todos, "운동")

    if err != nil {
        t.Fatalf("예상치 못한 오류: %v", err)
    }
    if len(result) != 2 {
        t.Errorf("길이가 2여야 하는데 %d입니다", len(result))
    }
}

func TestAddEmptyTitle(t *testing.T) {
    _, err := Add(nil, "   ")

    if !errors.Is(err, ErrEmptyTitle) {
        t.Errorf("ErrEmptyTitle을 기대했지만 %v입니다", err)
    }
}
```

`t.Error`는 기록하고 계속 진행하고, `t.Fatal`은 그 자리에서 멈춥니다. 이후 코드가 의미 없어지는 실패에는 `Fatal`을 씁니다.

입력만 다른 경우는 표로 묶습니다. Go에서 가장 흔한 테스트 모양입니다.

```go
func TestParse(t *testing.T) {
    tests := []struct {
        name    string
        input   string
        want    int
        wantErr bool
    }{
        {"정상", "5", 5, false},
        {"음수", "-1", -1, false},
        {"숫자 아님", "a", 0, true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := Parse(tt.input)

            if (err != nil) != tt.wantErr {
                t.Fatalf("오류 여부가 다릅니다: %v", err)
            }
            if got != tt.want {
                t.Errorf("%d를 기대했지만 %d입니다", tt.want, got)
            }
        })
    }
}
```

파일을 다루는 테스트는 `t.TempDir()`을 씁니다. 끝나면 자동으로 지워집니다.

```go
func TestSave(t *testing.T) {
    path := filepath.Join(t.TempDir(), "todos.json")

    if err := Save(path, []Todo{{Title: "공부"}}); err != nil {
        t.Fatal(err)
    }
}
```

```bash
go test ./...
go test -v ./...
go test -run TestAdd ./...
go test -cover ./...
```

동시성 코드에는 **경쟁 상태 검사**를 켭니다. 여러 고루틴이 같은 메모리를 보호 없이 건드리는 것을 실행 중에 잡아냅니다.

```bash
go test -race ./...
go run -race .
```

```
WARNING: DATA RACE
Write at 0x00c000018098 by goroutine 7:
  main.(*Counter).Increase()
Previous write at 0x00c000018098 by goroutine 6:
  main.(*Counter).Increase()
```

실행된 경로만 검사하므로 테스트가 그 상황을 만들어야 발견됩니다. 동시성 코드를 쓴다면 CI에서 `-race`를 항상 켜 두는 편이 낫습니다.

벤치마크도 같은 파일에 둘 수 있습니다.

```go
func BenchmarkAdd(b *testing.B) {
    for i := 0; i < b.N; i++ {
        Add(nil, "공부")
    }
}
```

```bash
go test -bench=. -benchmem ./...
```
