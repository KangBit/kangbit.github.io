---
title: 블로그 배포하기
titleTemplate: VitePress & Github Pages
outline: deep
---

# VitePress + Github Pages로 블로그 만들기 - 배포

## 워크플로우 작성

`.github/workflows` 폴더를 생성 후 `deplay.yml` 파일을 생성해 줍니다

<img src="https://velog.velcdn.com/images/kang-bit/post/afb20ff9-6a12-485d-a946-949cb746846e/image.png" width="40%" style="margin: 1rem 0;">

`deploy.yml` 파일에 [공식 문서](https://vitepress.vuejs.kr/guide/deploy#github-pages)에 있는 샘플 워크플로우를 복사해서 붙여줍니다.

다만 우리는 공식 문서의 가이드와는 폴더 구조가 다르기 때문에 `Upload artifact` 설정을 수정해 주어야 합니다.

```
jobs:
  # 빌드 작업
  build:
    runs-on: ubuntu-latest
    steps:
	  ...
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: .vitepress/dist
          # path: docs/.vitepress/dist
```

## Github 저장소에 소스 코드 올리기

우선 새로운 저장소를 생성해 줍니다.

이 때 저장소의 이름은 홈페이지의 하위 경로가 됩니다. (`https://{username}.github.io/{RepositoryName}/`)

<img src="https://velog.velcdn.com/images/kang-bit/post/42e06e0b-3d41-476d-8ed7-f3f54c0d1121/image.png" width="50%" style="margin: 1rem 0;">

생성된 저장소의 설정을 수정해 줍니다.

<img src="https://velog.velcdn.com/images/kang-bit/post/b1f13d11-7692-42bc-8680-d7d701a745bc/image.png" width="80%" style="margin: 1rem 0;">

위에서, 저장소의 이름이 홈페이지의 하위 경로가 된다고 했습니다.
프로젝트로 돌아가서 기본 경로 설정을 추가해 주어야 합니다.
`.vitepress/config.mjs` 파일을 수정합니다.

```
export default defineConfig({
  ...,
  base: "/RepositoryName/",
});
```

이제 터미널을 통해 저장소에 소스 코드를 업로드합니다.

```
$ git init
$ git add --all
$ git commit -m "first commit"
$ git branch -M main
$ git remote add origin {깃허브 저장소 주소}
$ git push -u origin main
```

업로드 후에 저장소의 Actions 페이지에 접근해 보면,
배포 상황을 확인할 수 있습니다.

<img src="https://velog.velcdn.com/images/kang-bit/post/f2eef239-99ee-4334-a6ec-ebd106869268/image.png" width="80%" style="margin: 1rem 0;">

위와 같이 배포가 성공적으로 완료되었다면,
`https://{username}.github.io/{RepositoryName}/`로 접근해서 홈페이지를 확인할 수 있습니다.

## 전체 코드

전체 코드는 https://github.com/KangBit/bitpage 에서 확인할 수 있습니다.

---

> [VitePress | Vite & Vue로 구동되는 정적 사이트 생성기](https://vitepress.vuejs.kr/)
