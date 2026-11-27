# page-builder

브라우저에서 페이지를 편집하고, 결과를 단일 HTML 또는 여러 파일이 든 정적 사이트 ZIP으로 내려받는 로컬 우선 편집기입니다. 편집 엔진은 [GrapesJS](https://grapesjs.com)(BSD-3)를 그대로 씁니다.

- 설계: [architecture.md](architecture.md) · 작업 기준: [agents/rules.md](agents/rules.md)
- 바로 써보기: https://devcy0922.github.io/page-builder/ (main 푸시 때 GitHub Pages로 배포)
- 소개: https://devcy0922.github.io/lab/page-builder
- 편집, 이미지 처리, 프로젝트 저장과 점검은 브라우저 안에서 진행합니다. 서버 업로드나 계정은 없습니다.
- web-preview 코드를 가져오거나 런타임으로 연결하지 않습니다. 내보낸 ZIP은 사용자가 원하는 호스팅·미리보기 도구에 직접 전달합니다.

## 결과물

- **HTML:** CSS와 로컬 이미지를 포함한 단일 문서. 외부 파일을 따로 올릴 필요가 없습니다.
- **사이트 ZIP:** index.html과 assets/ 이미지 파일을 나눕니다. 공개 주소를 적으면 sitemap.xml과 robots.txt도 함께 만듭니다.
- **프로젝트 JSON:** 다음 작업 때 다시 열 수 있는 편집 데이터와 페이지 메타데이터를 저장합니다. 업로드는 브라우저 파일 선택으로만 이뤄집니다.

SEO · GEO 점검은 제목, 설명, canonical, 공유 미리보기, 제목 단계, 이미지 대체 텍스트, 링크와 읽을 수 있는 본문을 확인합니다. 구조화 데이터는 선택 항목이며 유효한 JSON만 내보냅니다. GEO는 별도 태그나 점수로 해결되지 않습니다. 검색·AI 답변 노출은 공개 사이트의 크롤링, 정보의 정확성, 호스팅과 외부 시스템에 달려 있어 이 도구가 보장하지 않습니다.

## 실행

Node.js 20 이상, pnpm 9

```bash
make install
make dev        # http://<호스트>:5182
make test
make build      # dist/ — 어느 정적 호스팅에 올려도 열립니다(base: './')
```

## 편집기 구성

CSS·아이콘(Font Awesome 4.7)·글꼴(Pretendard)을 패키지에서 번들해 외부 CDN 없이 엽니다. 화면 문구는 한국어입니다.

- 데스크톱, 태블릿, 모바일 폭을 바꿔 가며 확인합니다. 좁은 화면에서는 편집 패널을 겹쳐 열 수 있습니다.
- 선택 영역에서 이미지의 대체 텍스트를 고칠 수 있습니다. 로컬 JPEG·PNG·WebP는 5 MB 이하로 브라우저가 읽습니다.
- HTML·ZIP·프로젝트 JSON은 편집 내용을 외부 서버에 보내지 않고 내려받습니다.
