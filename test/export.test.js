import { describe, expect, it } from 'vitest'
import { unzipSync, strFromU8 } from 'fflate'
import { buildHtmlDocument, buildSiteBundle, fileNameFor, splitEmbeddedImages, titleFromHtml } from '../src/export.js'
import { BLOCKS, START_CSS, START_HTML } from '../src/start-page.js'

describe('buildHtmlDocument', () => {
  it('검색·공유 메타데이터와 CSS를 포함한 문서를 만든다', () => {
    const doc = buildHtmlDocument({
      html: '<body><h1>안녕</h1></body>',
      css: 'h1{color:red}',
      title: '안녕',
      seo: { description: '소개 페이지', canonical: 'https://example.com/', ogImage: 'https://example.com/cover.webp' },
    })
    expect(doc).toMatch(/^<!doctype html>/)
    expect(doc).toContain('<style>\nh1{color:red}\n</style>')
    expect(doc.match(/<body>/g)).toHaveLength(1)
    expect(doc).toContain('<title>안녕</title>')
    expect(doc).toContain('<meta name="description" content="소개 페이지">')
    expect(doc).toContain('<link rel="canonical" href="https://example.com/">')
    expect(doc).toContain('<meta property="og:image" content="https://example.com/cover.webp">')
  })

  it('CSS 안의 </style>이 문서를 깨지 못하게 막는다', () => {
    const doc = buildHtmlDocument({ html: '<p>x</p>', css: 'p{}</style><script>alert(1)</script>' })
    expect(doc).not.toContain('</style><script>')
  })

  it('문서 제목과 메타데이터를 HTML 이스케이프한다', () => {
    expect(buildHtmlDocument({ html: '', css: '', title: '<b>', seo: { description: '"onload"' } })).toContain('<title>&lt;b&gt;</title>')
    expect(buildHtmlDocument({ html: '', css: '', seo: { description: '" onload="' } })).toContain('content="&quot; onload=&quot;"')
  })
})

describe('제목과 파일 이름', () => {
  it('첫 h1 글자를 제목으로 쓴다', () => {
    expect(titleFromHtml('<header><h1 class="x">아침 7시,<br> 오늘 빵</h1></header>')).toBe('아침 7시, 오늘 빵')
    expect(titleFromHtml('<p>없음</p>')).toBe('내보낸 페이지')
  })

  it('파일 이름에 쓸 수 없는 문자를 걷어 낸다', () => {
    expect(fileNameFor('아침 7시: 오늘/빵?')).toBe('아침-7시-오늘-빵.html')
    expect(fileNameFor('', 'zip')).toBe('page.zip')
  })
})

it('블록 id는 겹치지 않는다', () => {
  const ids = BLOCKS.map((b) => b.id)
  expect(new Set(ids).size).toBe(ids.length)
})

describe('사이트 ZIP', () => {
  it('HTML과 data URL 이미지를 분리하고 검색 파일을 넣는다', () => {
    const dataUrl = 'data:image/webp;base64,AAAA'
    const result = buildSiteBundle({
      html: '<header><h1>작업장</h1><img src="' + dataUrl + '" alt="대장간"></header>',
      css: '.hero{background-image:url("' + dataUrl + '")}',
      seo: { title: '작업장', canonical: 'https://example.com/workshop' },
    })
    const files = unzipSync(result.archive)
    expect(result.files).toContain('index.html')
    expect(result.files).toContain('assets/image-01.webp')
    expect(result.files).toContain('sitemap.xml')
    expect(result.files).toContain('robots.txt')
    const html = strFromU8(files['index.html'])
    expect(html).toContain('src="assets/image-01.webp"')
    expect(html).toContain('url("assets/image-01.webp")')
    expect(strFromU8(files['sitemap.xml'])).toContain('https://example.com/workshop')
    expect(files['assets/image-01.webp']).toEqual(new Uint8Array([0, 0, 0]))
  })

  it('시작 작업장 이미지를 ZIP 자산으로 분리한다', () => {
    const result = buildSiteBundle({ html: START_HTML, css: START_CSS, seo: { title: '작업장' } })
    const files = unzipSync(result.archive)
    expect(Object.keys(files).some((path) => path.startsWith('assets/') && path.endsWith('.webp'))).toBe(true)
    expect(strFromU8(files['index.html'])).not.toContain('data:image/webp')
  })

  it('대표 주소가 없으면 크롤러 파일은 생성하지 않는다', () => {
    const result = buildSiteBundle({ html: '<p>소개</p>', css: '' })
    expect(result.files).not.toContain('sitemap.xml')
    expect(result.files).not.toContain('robots.txt')
  })

  it('같은 이미지 data URL을 하나의 파일로 재사용한다', () => {
    const image = 'data:image/png;base64,AQID'
    const split = splitEmbeddedImages('<img src="' + image + '">', '.x{background:url(' + image + ')}')
    expect(Object.keys(split.assets)).toHaveLength(1)
    expect(split.html).toContain('assets/image-01.png')
    expect(split.css).toContain('assets/image-01.png')
  })
})
