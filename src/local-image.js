const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export function imageFileError(file) {
  if (!file) return '이미지 파일을 선택하세요.'
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) return 'JPEG, PNG, WebP 이미지 파일만 사용할 수 있습니다.'
  if (!Number.isFinite(file.size) || file.size < 1) return '비어 있는 파일은 사용할 수 없습니다.'
  if (file.size > MAX_IMAGE_BYTES) return '이미지는 5MB 이하로 골라 주세요.'
  return ''
}

export function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (typeof FileReader === 'undefined') {
      reject(new Error('이 브라우저에서는 로컬 이미지 읽기를 지원하지 않습니다.'))
      return
    }

    const reader = new FileReader()
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('이미지 파일을 읽지 못했습니다.'))
    }, { once: true })
    reader.addEventListener('error', () => {
      reject(new Error('이미지 파일을 읽지 못했습니다.'))
    }, { once: true })
    reader.readAsDataURL(file)
  })
}
