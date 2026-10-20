# page-builder 작업 기준

> 전역 규칙 위에 덧붙는 이 레포 전용 규칙이다. 충돌하면 이 파일이 우선한다.
> 소개 페이지: `devcy0922.github.io/docs/lab/page-builder.md`. 구조를 바꾸면 [architecture.md](../architecture.md)를 먼저 고친다.

## 목적

영역을 클릭해 글자·여백·색을 바꾸고, 결과를 **CSS까지 묶은 HTML 파일 한 장**으로 받는 노코드 페이지 편집기.

## 불변식

- **편집 엔진은 GrapesJS를 그대로 쓴다.** 엔진을 감싸는 코드(`src/editor.js`)와 순수 함수(`src/export.js`, `src/start-page.js`)만 이 레포가 소유한다.
- **내보낸 HTML은 외부 파일 없이 열린다.** `<style>`을 문서 안에 넣고, 편집기 전용 속성·스크립트를 남기지 않는다.
- **서버가 없다.** 편집 내용은 브라우저 밖으로 나가지 않는다. 저장은 파일 내려받기(또는 이후 localStorage 개인 편의)로만.
- 예시 페이지 문구는 가상 가게임을 유지한다.
- **외부 CDN을 부르지 않는다.** CSS·아이콘·글꼴은 패키지에서 번들한다(GrapesJS `cssIcons: ''`).
- 편집기의 기준은 이 레포 하나다. 포트폴리오 사이트에는 소개·화면 미리보기·저장소 링크만 둔다.

## 검증

```bash
make install
make test     # vitest (내보내기 순수 함수)
make build    # dist/
```

화면을 바꿨으면 `make build && make preview`로 데스크톱·모바일 폭을 실제로 확인한다. 실행하지 않은 검증을 통과로 쓰지 않는다.

## 변경 범위

- push·배포는 명시적 요청이 있을 때만.
- 문서·주석·화면 문구는 한국어 우선.
