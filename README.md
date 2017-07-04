# gulp starter

- html
- css
- javascript
- images

## bower 로 설치하는 플러그인

1. bootstrap
2. bxslider-4
3. fontawesome 
4. swiper

`bower` 로 플러그인 설치시 어떤 플러그인을 설치할지 모르는 상황, 매번 똑같은 플러그인을 설치하는것이 아니고 상황에 따라 바뀌는 현상

`bower` 에서 지원하는 모듈들이 있지만 상황에 맞지 않음.

여기서는 `gulp-copy` 모듈을 사용하여 `dist` 폴더에 복사해서 사용.
`css` , `js`, `fonts`, `image` 등을 모두 복사해서 `dist`폴더에 붙여넣음.

나머지는 로컬에서 `html`, `sass`, `javascript`, `image` 등을 최적화해서 `dist` 폴더에 생성


## 설치

`nodejs` 가 설치되어 있어야 합니다.

```sh
npm i # npm install && bower install
```

또는 `yarn` 이 설치되어 있는 경우
`yarn` 이 설치되어 있지 않다면 `npm i -g yarn` 실행후 아래코드 실행

```sh
yarn # yarn install && bower install
```


## 사용

```sh
npm start 
# or gulp serve
```


