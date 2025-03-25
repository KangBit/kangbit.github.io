---
title: Mac FolderAction으로 이미지 워터마크 자동화하기
description: 반복되는 워터마크 작업으로 고생하는 디자이너를 위해 웹페이지를 개발하는 동료 개발자를 위해 만들어본 Watermark FolderAction
head:
  - - meta
    - name: keywords
      content: FolderAction, Automator, Watermark, Mac
outline: deep
comment: true
---

# 반복되는 워터마크 작업으로 고생하는 디자이너를 위해 웹페이지를 개발하는 동료 개발자를 위해 만들어본 Watermark FolderAction

<span style="color:gray;">하지만 디자이너의 기기는 macos가 아니었다고 합니다</span> :smiling_face_with_tear:

<img src="/assets/gifs/watermark-folderaction/1.gif" class="mb-0"></img>

## 폴더액션이란?

macOS는 자동화 도구인 Automator를 내장하고 있습니다.

Automator를 다양한 자동화 작업을 생성할 수 있게 해 주는데,

폴더액션은 Automator의 주요 기능 중 하나로,

특정 폴더에 변화가 생길 때 자동으로 작업을 실행하도록 할 수 있습니다.

## imagemagick 설치하기

Automator에서도 이미지에 대한 일부 작업을 제공하지만,

워터마크를 적용하기 위해서는 다른 도구의 힘을 빌려야 합니다.

[ImageMagick](https://imagemagick.org/index.php)은 폴더액션과 함께 워터마크를 추가하는 데 매우 적합한 도구입니다.

강력한 오픈소스 이미지 처리 도구로,

명령어를 통해 터미널이나 스크립트에서 쉽게 이미지 처리를 할 수 있습니다.

터미널에서 [Homebrew](https://brew.sh/)를 통해 간단히 설치할 수 있습니다.

```zsh
brew install imagemagick
```

설치가 완료되면 터미널에서 다음 명령어를 이용해 imagemagick의 경로를 확인합니다.

이 경로는 뒤에서 필요하기 때문에 잘 메모해 둡니다.

```zsh
which imagemagick
```

제 환경에서의 경로는 다음과 같았습니다.

```zsh
# /opt/homebrew/bin/magick
```

## 폴더액션 생성하기

1. Spotlight 검색에서 Automator를 열어줍니다.

<img src="/assets/images/watermark-folderaction/1.jpg" width="80%" class="mb-0"></img>

2.폴더 적용 스크립트를 선택합니다.

<img src="/assets/images/watermark-folderaction/2.jpg" width="80%" class="mb-0"></img>

3. 적용할 폴더를 선핵합니다. ( ‘기타’ 클릭 후 폴더 선택 )

<img src="/assets/images/watermark-folderaction/3.jpg" width="80%" class="mb-0"></img>

4. '선택된 Finder 항목 가져오기'와 '셸 스크립트 실행'을 작업 공간에 넣어줍니다.

<img src="/assets/gifs/watermark-folderaction/2.gif" width="80%" class="mb-0"></img>

<img src="/assets/gifs/watermark-folderaction/3.gif" width="80%" class="mb-0"></img>

5. `Cmd + s` 로 저장 후 Spotlight에서 ‘폴더 적용 스크립트 설정’을 확인해보면 설정이 적용되었음을 확인할 수 있습니다.

<img src="/assets/images/watermark-folderaction/4.jpg" width="80%" class="mb-0"></img>

## 워터마크 적용하기

다시 Automator로 돌아와서, 셸 스크립트를 작성합니다.

위에서 메모해둔 imagemagick 경로와,

워터마크로 사용할 파일의 경로를 이용해 스크립트를 작성합니다.

```zsh
for file in "$@"; do
	if [[ "$file" =~ \.(jpg|jpeg|png)$ ]]; then
      # 파일명에 _watermarked가 이미 포함되어 있는지 확인
      filename=$(basename "$file")
      if [[ "$filename" == *"_watermarked"* ]]; then
          # 이미 처리된 파일이므로 건너뜀
          continue
      fi

      # which magick 으로 확인한 imagemagick 경로
      MAGICK="/opt/homebrew/bin/magick"
      # 워터마크로 적용할 파일 경로
      WATERMARK="/Users/my/Desktop/watermark.png"
      # 위치 (center, northwest, southeast 등)
      GRAVITY="center"
      # 투명도
      OPACITY="50%"

      # 원본 파일의 확장자와 경로
      extension="${file##*.}"
      filepath="${file%.*}"

      # 워터마크 적용
      "$MAGICK" \
        composite -gravity "$GRAVITY" -dissolve "$OPACITY" \
        "$WATERMARK" "$file" "${filepath}_watermarked.${extension}"
	fi
done
```

## 타일패턴으로 워터마크 적용하기

다음과 같이 타일 패턴을 생성한 후, 워터마크로 적용할 수도 있습니다.

```zsh
for file in "$@"; do
	if [[ "$file" =~ \.(jpg|jpeg|png)$ ]]; then
      # 파일명에 _watermarked가 이미 포함되어 있는지 확인
      filename=$(basename "$file")
      if [[ "$filename" == *"_watermarked"* ]]; then
          # 이미 처리된 파일이므로 건너뜀
          continue
      fi

      # which magick 으로 확인한 imagemagick 경로
      MAGICK="/opt/homebrew/bin/magick"
      # 워터마크로 적용할 파일 경로
      WATERMARK="/Users/smartscore/Desktop/watermark.png"
      # 위치
      GRAVITY="center"
      # 투명도
      OPACITY="100%"

      # 원본 파일의 확장자와 경로
      extension="${file##*.}"
      filepath="${file%.*}"

      # 원본 파일의 크기
      ORIG_WIDTH=$("$MAGICK" identify -format "%w" "$file")
      ORIG_HEIGHT=$("$MAGICK" identify -format "%h" "$file")

      # 타일 워터마크 생성
      "$MAGICK" convert -size "$ORIG_WIDTH"x"$ORIG_HEIGHT" \
        tile:"$WATERMARK" /tmp/tiled_watermark.png

      # 워터마크 적용
      "$MAGICK" \
        composite -gravity "$GRAVITY" -dissolve "$OPACITY" \
        /tmp/tiled_watermark.png "$file" "${filepath}_watermarked.${extension}"

      # 임시 파일 삭제
      rm /tmp/tiled_watermark.png
	fi
done
```

<img src="/assets/gifs/watermark-folderaction/4.gif" width="80%" class="mb-0"></img>

## 주의사항 및 문제해결

- 워터마크 이미지는 PNG 포맷의 투명 배경을 사용하세요
- ImageMagick의 옵션들은 적용 순서에 따라 결과가 달라질 수 있습니다
- 폴더액션이 작동하지 않을 경우 폴더 권한을 확인해보세요
- 워터마크가 적용된 이미지의 원본은 가급적 삭제하거나 다른 폴더로 이동시키세요

## 기타 imagemagick 스크립트

imagemagick을 통해 이미지 회전이나 타일의 간격 설정 등 다양한 작업을 할 수 있습니다.

이를 잘 조합하여 폴더 액션을 생성해 보세요.

### 좌측상단에서 50px 50px에 워터마크 적용

```zsh
magick composite -geometry +50+50 /경로/워터마크이미지.png 원본이미지.jpg 결과이미지.jpg
```

### 우측하단에 워터마크 적용

```zsh
magick composite -gravity southeast /경로/워터마크이미지.png 원본이미지.jpg 결과이미지.jpg
```

### 워터마크 회전

```zsh
magick convert /경로/워터마크이미지.png -background none -rotate 45 /tmp/rotated_watermark.png
```

### 워터마크 타일 생성

```zsh
# 워터마크 크기 확인
WMARK_WIDTH=$(magick identify -format "%w" /경로/워터마크이미지.png)
WMARK_HEIGHT=$(magick identify -format "%h" /경로/워터마크이미지.png)

# 원하는 반복 횟수 설정 (가로 3개, 세로 2개)
REPEAT_X=3
REPEAT_Y=2

TILE_WIDTH=$(( WMARK_WIDTH * REPEAT_X ))
TILE_HEIGHT=$(( WMARK_HEIGHT * REPEAT_Y ))

magick convert -size "$TILE_WIDTH"x"$TILE_HEIGHT" tile:/경로/워터마크이미지.png /tmp/tiled_watermark.png
```
