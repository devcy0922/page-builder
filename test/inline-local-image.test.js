import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { inlineLocalImagePlugin } from '../src/inline-local-image-plugin.js'

const plugin = inlineLocalImagePlugin()
const imagePath = new URL('../src/assets/forge-hero.webp', import.meta.url).pathname

describe('시작 이미지 단일 HTML 포함', () => {
  it('로컬 WebP를 data URL 모듈로 바꾼다', async () => {
    const source = await readFile(imagePath)
    const module = await plugin.load(imagePath + '?inline')

    expect(module).toContain('data:image/webp;base64,')
    expect(module).toContain(source.toString('base64'))
  })

  it('대상 assets 디렉터리 밖의 이미지는 건드리지 않는다', async () => {
    await expect(plugin.load('/tmp/outside.webp?inline')).resolves.toBeNull()
  })

  it('일반 파일 import는 건드리지 않는다', async () => {
    await expect(plugin.load(imagePath)).resolves.toBeNull()
  })
})
