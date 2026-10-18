import { describe, expect, it } from 'vitest'
import { buildHtmlDocument, fileNameFor, titleFromHtml } from '../src/export.js'
import { BLOCKS } from '../src/start-page.js'

describe('buildHtmlDocument', () => {
  it('CSS를 문서 안에 넣고 body 껍데기는 한 번만 쓴다', () => {
    const doc = buildHtmlDocument({ html: '<body><h1>안녕</h1></body>', css: 'h1{color:red}', title: '안녕' })
    expect(doc).toMatch(/^<!doctype html>/)
    expect(doc).toContain('<style>\nh1{color:red}\n</style>')
    expect(doc.match(/<body>/g)).toHaveLength(1)
    expect(doc).toContain('<title>안녕</title>')
  })

  it('CSS 안의 </style>이 문서를 깨지 못하게 막는다', () => {
    const doc = buildHtmlDocument({ html: '<p>x</p>', css: 'p{}</style><script>alert(1)</script>' })
    expect(doc).not.toContain('</style><script>')
  })

  it('제목을 HTML 이스케이프한다', () => {
    expect(buildHtmlDocument({ html: '', css: '', title: '<b>' })).toContain('<title>&lt;b&gt;</title>')
  })
})

describe('제목과 파일 이름', () => {
  it('첫 h1 글자를 제목으로 쓴다', () => {
    expect(titleFromHtml('<header><h1 class="x">아침 7시,<br> 오늘 빵</h1></header>')).toBe('아침 7시, 오늘 빵')
    expect(titleFromHtml('<p>없음</p>')).toBe('내보낸 페이지')
  })

  it('파일 이름에 쓸 수 없는 문자를 걷어 낸다', () => {
    expect(fileNameFor('아침 7시: 오늘/빵?')).toBe('아침-7시-오늘-빵.html')
    expect(fileNameFor('')).toBe('page.html')
  })
})

it('블록 id는 겹치지 않는다', () => {
  const ids = BLOCKS.map((b) => b.id)
  expect(new Set(ids).size).toBe(ids.length)
})
