# page-builder

영역을 클릭해 글자·여백·색을 바꾸고, 결과를 **CSS까지 묶은 HTML 파일 한 장**으로 받는 노코드 페이지 편집기. 편집 엔진은 [GrapesJS](https://grapesjs.com)(BSD-3)를 그대로 씁니다.

- 설계: [architecture.md](architecture.md) · 작업 기준: [agents/rules.md](agents/rules.md)
- 소개·미리 써보기: https://devcy0922.github.io/lab/page-builder
- 서버가 없습니다. 편집 내용은 브라우저 밖으로 나가지 않습니다.

## 실행

Node.js 20 이상, pnpm 9

```bash
make install
make dev        # http://<호스트>:5182
make test
make build      # dist/ — 어느 정적 호스팅에 올려도 열립니다(base: './')
```

## 사이트 프로토타입과 다른 점

- 편집기 CSS를 CDN이 아니라 패키지에서 불러옵니다.
- 내보낸 파일 이름과 `<title>`을 첫 제목(h1)으로 정합니다. CSS 안의 `</style>`은 무력화합니다.
- 화면 전체를 편집기로 씁니다.
