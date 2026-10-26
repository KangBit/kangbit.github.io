---
title: Go 01. 실행 환경과 기본 문법
description: 모듈을 만들고 빌드하는 과정을 확인하고 기본 문법을 익힙니다.
outline: deep
---

# 01. 실행 환경과 기본 문법

프로젝트를 시작하는 방법과, 값과 흐름을 다루는 문법을 정리합니다.

## 모듈 초기화

Go 프로젝트의 단위는 모듈입니다. 모듈 경로는 보통 저장소 주소를 씁니다.

```bash
mkdir todo && cd todo
go mod init github.com/kangbit/todo
```

`go.mod`가 만들어집니다. 모듈 이름, Go 버전, 의존성이 들어갑니다.

```
module github.com/kangbit/todo

go 1.23

require github.com/google/uuid v1.6.0
```

패키지를 추가하면 `go.mod`와 `go.sum`이 함께 갱신됩니다.

```bash
go get github.com/google/uuid
go mod tidy      # 쓰지 않는 의존성을 정리합니다
```

`go.sum`은 내려받은 코드의 체크섬입니다. 저장소에 함께 넣어 둡니다.

## 실행과 빌드

```bash
go run .              # 컴파일하고 바로 실행
go build -o todo .    # 실행 파일 생성
./todo
```

Go는 **의존성까지 포함한 하나의 실행 파일**을 만듭니다. 런타임을 따로 설치하지 않아도 돌아갑니다.

다른 운영체제용으로도 바로 만들 수 있습니다.

```bash
GOOS=linux GOARCH=amd64 go build -o todo-linux .
```

진입점은 `main` 패키지의 `main` 함수입니다.

```go
package main

import "fmt"

func main() {
    fmt.Println("실행")
}
```

## gofmt와 go vet

Go에는 코드 스타일 논쟁이 없습니다. 표준 포맷터가 정해 줍니다.

```bash
gofmt -l .        # 포맷이 다른 파일 목록
gofmt -w .        # 고쳐 쓰기
go fmt ./...      # 패키지 단위로
```

들여쓰기는 탭이고 중괄호 위치도 고정입니다. 편집기에서 저장할 때 자동 실행되도록 걸어 두는 것이 보통입니다.

`go vet`은 컴파일은 되지만 의심스러운 코드를 찾습니다.

```bash
go vet ./...
```

```go
fmt.Printf("%d\n", "문자열")   // vet이 잡아 줍니다
```

더 많은 검사가 필요하면 `golangci-lint` 같은 도구를 더합니다.

## 변수와 타입

타입은 이름 뒤에 옵니다.

```go
var count int = 1
var title string = "공부"

var count2 = 1          // 타입 추론
count3 := 1             // 함수 안에서 쓰는 짧은 선언
```

`:=`는 함수 안에서만 쓸 수 있습니다. 패키지 수준에서는 `var`를 씁니다.

**선언하고 쓰지 않으면 컴파일 오류입니다.** 가져다 쓰지 않는 `import`도 마찬가지입니다.

```go
func main() {
    count := 1   // declared and not used
}
```

값을 적지 않으면 타입별 기본값이 들어갑니다. `null`에 해당하는 상태가 없습니다.

```go
var count int       // 0
var title string    // ""
var done bool       // false
var list []int      // nil
var m map[string]int // nil
```

타입 변환은 항상 명시해야 합니다. 자동으로 섞이지 않습니다.

```go
var count int = 1
var ratio float64 = float64(count)   // 변환 없이는 컴파일되지 않습니다

text := strconv.Itoa(count)          // 숫자 → 문자열
n, err := strconv.Atoi("5")          // 문자열 → 숫자
```

상수는 `const`로 선언합니다. 연속된 값에는 `iota`를 씁니다.

```go
const MaxTitle = 100

type Status int

const (
    Todo Status = iota   // 0
    Doing                // 1
    Done                 // 2
)
```

## 조건문

괄호가 없고 중괄호는 필수입니다.

```go
if count > 10 {
    size = "많음"
} else if count > 0 {
    size = "적음"
} else {
    size = "없음"
}
```

조건 앞에 짧은 문장을 둘 수 있습니다. 거기서 선언한 변수는 `if` 블록 안에서만 삽니다.

```go
if value, err := strconv.Atoi(text); err == nil {
    fmt.Println(value)
}
```

`switch`는 `break`를 쓰지 않아도 다음으로 흘러가지 않습니다.

```go
switch status {
case Todo:
    label = "할 일"
case Doing, Done:
    label = "진행 또는 완료"
default:
    label = "알 수 없음"
}
```

조건식을 생략하면 `if` 사슬처럼 쓸 수 있습니다.

```go
switch {
case count > 10:
    size = "많음"
case count > 0:
    size = "적음"
}
```

## 반복문

반복문은 `for` 하나뿐입니다. 형태를 바꿔 다른 언어의 `while`을 대신합니다.

```go
for i := 0; i < 3; i++ { }    // 일반 반복

for count > 0 { }             // while

for { break }                 // 무한 반복
```

컬렉션은 `range`로 돕니다.

```go
for index, item := range list {
    fmt.Println(index, item)
}

for _, item := range list {   // 인덱스가 필요 없을 때
    fmt.Println(item)
}

for key, value := range m {
    fmt.Println(key, value)
}
```

`_`는 값을 버리겠다는 표시입니다. 쓰지 않는 변수가 컴파일 오류이므로 자주 등장합니다.

맵을 `range`로 돌면 **순서가 매번 다릅니다.** 의도적으로 무작위화되어 있으므로, 순서가 필요하면 키를 뽑아 정렬합니다.

## 함수

```go
func add(a, b int) int {
    return a + b
}
```

같은 타입이 이어지면 앞쪽을 생략할 수 있습니다.

Go의 가장 큰 특징은 **값을 여러 개 반환한다**는 점입니다. 오류를 마지막에 함께 돌려주는 관례가 여기서 나옵니다.

```go
func parse(text string) (int, error) {
    value, err := strconv.Atoi(text)
    if err != nil {
        return 0, err
    }
    return value, nil
}


value, err := parse("5")
if err != nil {
    return err
}
```

반환값에 이름을 붙일 수도 있습니다. 짧은 함수에서만 쓰는 편이 읽기 좋습니다.

```go
func divide(a, b int) (result int, err error) {
    if b == 0 {
        err = errors.New("0으로 나눌 수 없습니다")
        return
    }
    result = a / b
    return
}
```

함수는 값으로 다룰 수 있습니다.

```go
func apply(list []int, fn func(int) int) []int {
    result := make([]int, 0, len(list))
    for _, item := range list {
        result = append(result, fn(item))
    }
    return result
}

apply(numbers, func(n int) int { return n * 2 })
```

대문자로 시작하는 이름만 패키지 밖에서 보입니다. 접근 제어 키워드가 따로 없습니다.

```go
func Load() { }   // 공개
func parse() { }  // 패키지 내부
```
