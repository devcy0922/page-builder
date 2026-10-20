# page-builder

영역을 클릭해 글자·여백·색을 바꾸고, 결과를 **CSS까지 묶은 HTML 파일 한 장**으로 받는 노코드 페이지 편집기. 편집 엔진은 [GrapesJS](https://grapesjs.com)(BSD-3)를 그대로 씁니다.

- 설계: [architecture.md](architecture.md) · 작업 기준: [agents/rules.md](agents/rules.md)
- 바로 써보기: https://devcy0922.github.io/page-builder/ (main 푸시 때 GitHub Pages로 배포)
- 소개: https://devcy0922.github.io/lab/page-builder
- 서버가 없습니다. 편집 내용은 브라우저 밖으로 나가지 않습니다.

## 실행

Node.js 20 이상, pnpm 9

```bash
make install
make dev        # http://<호스트>:5182
make test
make build      # dist/ — 어느 정적 호스팅에 올려도 열립니다(base: './')
```

## 외부 요청 없음

편집기 CSS·아이콘(Font Awesome 4.7)·글꼴(Pretendard)을 모두 패키지에서 번들합니다. 화면을 여는 동안 외부 CDN을 부르지 않으므로 사내망이나 CDN이 막힌 곳에서도 버튼 아이콘과 캔버스 글꼴이 그대로 나옵니다.

- 화면 문구는 한국어입니다(GrapesJS 한국어 문구 + 이 앱 전용 이름).
- 좁은 화면(760px 이하)에서는 캔버스를 전체 폭으로 쓰고, 스타일 패널은 넓은 화면에서만 엽니다.
- 내보낸 파일 이름과 `<title>`을 첫 제목(h1)으로 정합니다. CSS 안의 `</style>`은 무력화합니다.

예전에 [devcy0922.github.io](https://devcy0922.github.io/lab/page-builder)에 들어 있던 편집기 프로토타입은 사이트에서 뺐습니다. 편집기는 이 저장소가 유일한 기준입니다.
