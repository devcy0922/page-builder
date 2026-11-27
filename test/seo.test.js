import { describe, expect, it } from 'vitest'
import { auditSeo, buildDiscoveryFiles, createSeoMetadataHtml } from '../src/seo.js'

describe('SEO/GEO 기본 점검', () => {
  it('제목, 요약, 본문 구조, 대체 텍스트를 확인한다', () => {
    const results = auditSeo({
      html: '<h1>대장간</h1><p>맞춤 도구를 만듭니다. 문의는 언제든 가능합니다.</p><h2>작업 소개</h2><img alt="망치" src="tool.webp"><a href="/contact">문의</a>',
      seo: { title: '모루 대장간 | 맞춤 도구', description: '작업장 소개와 문의 안내입니다.' },
    })
    expect(results.find((result) => result.title === '페이지 제목').level).toBe('ok')
    expect(results.find((result) => result.title === '주 제목').level).toBe('ok')
    expect(results.find((result) => result.title === '이미지 대체 텍스트').level).toBe('ok')
  })

  it('빈 설명, 순서가 건너뛴 제목, 빈 링크를 경고한다', () => {
    const results = auditSeo({ html: '<h1>제목</h1><h3>소제목</h3><a href="/"></a>' })
    expect(results.find((result) => result.title === '페이지 설명').level).toBe('warn')
    expect(results.find((result) => result.title === '제목 순서').level).toBe('warn')
    expect(results.find((result) => result.title === '링크 설명').level).toBe('warn')
  })

  it('잘못된 구조화 데이터 JSON을 출력하지 않고 오류로 알린다', () => {
    expect(auditSeo({ seo: { jsonLd: '{잘못됨' } }).find((result) => result.title === '구조화 데이터').level).toBe('error')
    expect(createSeoMetadataHtml({ jsonLd: '{잘못됨' })).not.toContain('application/ld+json')
  })

  it('유효한 구조화 데이터는 스크립트 종료 문자열을 이스케이프한다', () => {
    const html = createSeoMetadataHtml({ jsonLd: '{"@context":"https://schema.org","@type":"WebPage","name":"</script>"}' })
    expect(html).toContain('\\u003c/script>')
  })
})

describe('검색 파일', () => {
  it('공개 주소가 있을 때 robots와 단일 주소 sitemap을 만든다', () => {
    const files = buildDiscoveryFiles('https://example.com/page')
    expect(files['robots.txt']).toContain('Sitemap: https://example.com/sitemap.xml')
    expect(files['sitemap.xml']).toContain('<loc>https://example.com/page</loc>')
  })

  it('잘못된 주소로 검색 파일을 만들지 않는다', () => {
    expect(buildDiscoveryFiles('javascript:alert(1)')).toEqual({})
  })
})
