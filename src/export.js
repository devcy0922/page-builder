// 편집 결과를 외부 파일 없이 열리는 HTML 문서 한 장으로 묶는다. DOM을 쓰지 않는 순수 함수만 둔다.

const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** 문서 제목은 첫 h1 글자를 쓰고, 없으면 기본 제목. */
export function titleFromHtml(html, fallback = '내보낸 페이지') {
  const m = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html ?? '')
  const text = m ? m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : ''
  return text || fallback
}

/** 파일 이름으로 쓸 수 없는 문자를 걷어 낸다. 비면 page.html. */
export function fileNameFor(title) {
  const base = String(title ?? '')
    .replace(/[\\/:*?"<>|]+/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return `${base || 'page'}.html`
}

/**
 * GrapesJS의 getHtml()·getCss() 결과로 HTML 문서를 만든다.
 * getHtml()은 <body>로 감싸 돌려줄 때가 있어 안쪽만 쓴다. `</style>`이 CSS에 섞여 문서가 깨지지 않게 막는다.
 */
export function buildHtmlDocument({ html, css, title, lang = 'ko' }) {
  const body = String(html ?? '').replace(/^\s*<body[^>]*>/i, '').replace(/<\/body>\s*$/i, '').trim()
  const style = String(css ?? '').replace(/<\/style/gi, '<\\/style').trim()
  const docTitle = escapeHtml(title ?? titleFromHtml(body))
  return `<!doctype html>
<html lang="${escapeHtml(lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${docTitle}</title>
<style>
${style}
</style>
</head>
<body>
${body}
</body>
</html>
`
}
