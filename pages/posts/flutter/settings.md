---
title: 맥북에서 Flutter 시작하기
titleTemplate: Feat Cursor
description: Flutter Setting in Macbook Pro m1 with Cursor
head:
  - - meta
    - name: keywords
      content: Flutter, Flutter Setting, Macbook, Macbook m1, Dart, Cursor
outline: deep
---

# 맥북에서 Flutter 시작하기

개인 맥북으로 도전했다가 8GB 메모리의 벽에 부딪힌 후

회사 맥북으로 다시 설치하며, 울면서 기록하는 글

## Flutter Extension 다운로드

Cursor 의 Extensions에서 Flutter를 찾아서 다운로드 합니다.

<img src="/assets/images/flutter/setting-0.jpeg" width="60%" alt="Flutter Extension"></img>


## Flutter SDK 다운로드

Cursor에서 `Shift` + `Cmd` + `P` 단축키 입력 후 `Run Flutter Doctor` 명령어를 선택합니다.

<img src="/assets/images/flutter/setting-1.jpeg" width="85%" alt="Flutter Doctor 실행"></img>

아래와 같이 SDK를 찾을 수 없다는 경고가 노출됩니다.

Download SDK 버튼을 클릭해 SDK 를 다운로드 받았습니다.

<img src="/assets/images/flutter/setting-2.jpeg" width="60%" alt="Fluttter SDK Error"></img>

다운로드 경로는 기록해 둡니다.

저는 `/Users/kangbit/SDK` 경로에 다운로드 받았습니다. 

## Flutter SDK 설정

### 1. Cursor - Flutter SDK 설정

다시 `Run Flutter Doctor`를 실행 후, Locate SDK 버튼을 클릭합니다. 

Flutter SDK가 설치된 폴더를 지정하여 Cursor에 SDK 경로를 알려주었습니다.

### 2. Flutter SDK 환경변수 설정

터미널에서도 flutter 명령어를 사용할 수 있게 환경변수를 설정해 주겠습니다.

터미널에서 `vim ~/.zshrc`를 입력해 Zsh 설정 파일을 수정합니다.

위에서 SDK 파일을 다운로드 한 경로를 삽입합니다.

``` sh
# Flutter SDK bin path
export PATH="$PATH:/Users/kangbit/SDK/flutter/bin"
```

삽입 후, 값을 적용하기 위해 `source ~/.zshrc` 명령어를 실행합니다.


## Android Studio 다운로드

Flutter Doctor를 다시 실행하니, `Android toolchain` 과 `Android Studio`에 에러가 보입니다. 


### 1. Android Studio 설치

한꺼번에 해결하기 위해 Android Studio를 설치합니다.

공식 홈페이지에서 최신 버전으로 설치했습니다.

### 2. SDK 설치

SDK를 설치하기 위해 Andoid Studio를 한 번 실행합니다.

클릭 몇번이면 자동으로 설치가 완료됩니다.

### 3. SDK Command line tools

다시 Flutter doctor 를 실행하니, `Android toolchain`의 하위 항목에 에러가 보입니다.

commandline tools 가 없다고 하네요.

Android Studio의 Preference에서 `Languages & Flameworks` > `Android SDK` 로 이동합니다.

`SDK Tools` 탭에서 `Android SDK Command-line Tools`를 찾습니다.

체크 후 OK 버튼을 눌러주면 자동으로 설치됩니다.

### 4. License Update

`Android license status unknown` 이라는 에러가 아직 남아 있습니다.

터미널에 `flutter doctor --android-licenses` 명령어를 입력 후,

각 항목에 동의하여 라이센스를 등록합니다.


## Flutter app 생성

Cursor 명령어인 `Flutter: New Project` 로 앱을 생성할 수 있지만,

특정 플랫폼만 포함시키기 위해서는 별도의 설정이 필요합니다.

터미널에서 `flutter create my_project --platforms=android,ios` 명령어로 앱을 생성합니다.

다음과 같이 앱이 생성됩니다.

<img src="/assets/images/flutter/setting-3.jpeg" width="100%" alt="Flutter 앱 생성 결과"></img>

## Flutter app 실행

main.dart 파일에서 우측 상단의 Start Debugging 버튼을 클릭하면, 

Device를 선택할 수 있습니다.

IOS 설정은 아직 하지 않았기 때문에 Android 가상 머신을 선택했습니다.

앱이 잘 실행되니, 이제 Dart 먼저 공부하러 가야겠네요.