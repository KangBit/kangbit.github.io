---
title: Mac FolderAction으로 이미지에 Watermark 적용하기
description: 반복되는 워터마크 작업으로 고생하는 디자이너를 위해 웹페이지를 개발하는 동료 개발자를 위해 만들어본 Watermark FolderAction
head:
  - - meta
    - name: keywords
      content: FolderAction, Automator, Watermark, Mac
outline: deep
comment: true
---

# 반복되는 워터마크 작업으로 고생하는 디자이너를 위해 웹페이지를 개발하는 동료 개발자를 위해 만들어본 Watermark FolderAction

<img src="/assets/gifs/watermark-folderaction/1.gif" class="mb-0"></img>

## 폴더액션이란?

macOS에는 자동화 도구인 Automator를 내장하고 있습니다.

Automator를 복잡한 프로그래밍 지식 없이도 다양한 자동화 작업을 생성할 수 있게 해 주는데,

폴더액션은 Automator의 주요 기능 중 하나입니다.

폴더액션을 이용하면 특정 폴더에 변화가 생길 때 자동으로 작업을 실행할 수 있습니다.

## imagemagick 설치하기

Automator에서도 이미지에 대한 일부 작업을 제공하지만,

워터마크를 적용하기 위해서는 다른 도구의 힘을 빌려야 합니다.

[ImageMagick](https://imagemagick.org/index.php)은 폴더액션과 함께 워터마크를 추가하는 데 매우 적합한 도구입니다.

강력한 오픈소스 이미지 처리 도구로,

명령어를 통해 터미널이나 스크립트에서 쉽게 이미지 처리를 할 수 있습니다.

터미널에서 [Homebrew](https://brew.sh/)를 통해 다운로드 받을 수 있습니다.

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

4. '지정된 Finder 항목 가져오기'와 '셸 스크립트 실행'을 작업 공간에 넣어줍니다.

<img src="/assets/gifs/watermark-folderaction/2.gif" width="80%" class="mb-0"></img>

<img src="/assets/gifs/watermark-folderaction/3.gif" width="80%" class="mb-0"></img>

5. `Cmd + s` 로 저장 후 Spotlight에서 ‘폴더 적용 스크립트 설정’을 확인해보면 설정이 적용되었음을 확인할 수 있습니다.

<img src="/assets/images/watermark-folderaction/4.jpg" width="80%" class="mb-0"></img>

## 워터마크 적용하기

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
      # 위치
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
