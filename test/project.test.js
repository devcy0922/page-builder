import { describe, expect, it } from 'vitest'
import { createProjectDocument, parseProjectDocument } from '../src/project.js'

describe('프로젝트 JSON', () => {
  it('편집 데이터와 메타데이터를 내려받기·불러오기 형식으로 묶는다', () => {
    const saved = createProjectDocument({
      project: { pages: [{ component: { tagName: 'main', components: [{ tagName: 'h1', content: '작업장' }] } }] },
      seo: { title: '작업장', description: '소개' },
    })
    const loaded = parseProjectDocument(JSON.stringify(saved))
    expect(loaded.project.pages[0].component.components[0].content).toBe('작업장')
    expect(loaded.seo.title).toBe('작업장')
  })

  it('스크립트와 이벤트 속성을 제거해 저장된 프로젝트를 안전하게 정리한다', () => {
    const file = JSON.stringify({
      format: 'moru-page-builder',
      version: 1,
      project: { components: [{ tagName: 'script', content: 'alert(1)', attributes: { onclick: 'alert(1)', href: 'javascript:alert(1)' } }] },
    })
    const loaded = parseProjectDocument(file)
    const component = loaded.project.components[0]
    expect(component.tagName).toBe('div')
    expect(component.content).toBeUndefined()
    expect(component.attributes).toEqual({})
  })

  it('지원하지 않는 버전과 JSON을 거부한다', () => {
    expect(() => parseProjectDocument('{')).toThrow('올바른 JSON')
    expect(() => parseProjectDocument(JSON.stringify({ format: 'moru-page-builder', version: 99, project: {} }))).toThrow('지원하지 않는')
  })
})
