import { describe, expect, it } from 'vitest'
import { imageFileError, MAX_IMAGE_BYTES } from '../src/local-image.js'

describe('로컬 이미지 확인', () => {
  it('JPEG, PNG, WebP 파일을 허용한다', () => {
    for (const type of ['image/jpeg', 'image/png', 'image/webp']) {
      expect(imageFileError({ type, size: 1024 })).toBe('')
    }
  })

  it('SVG와 알 수 없는 형식은 거부한다', () => {
    expect(imageFileError({ type: 'image/svg+xml', size: 1024 })).toContain('JPEG, PNG, WebP')
    expect(imageFileError({ type: '', size: 1024 })).toContain('JPEG, PNG, WebP')
  })

  it('비어 있거나 5MB보다 큰 파일은 거부한다', () => {
    expect(imageFileError({ type: 'image/png', size: 0 })).toContain('비어')
    expect(imageFileError({ type: 'image/png', size: MAX_IMAGE_BYTES + 1 })).toContain('5MB')
  })

  it('선택되지 않은 파일은 설명을 돌려준다', () => {
    expect(imageFileError(null)).toContain('선택')
  })
})
