export const PROJECT_FORMAT = 'moru-page-builder'
export const PROJECT_VERSION = 1

function cleanMarkup(value) {
  return String(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '')
    .replace(/\s+on[\w:-]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s+(href|src|xlink:href)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, '')
}

function sanitizeNode(value) {
  if (Array.isArray(value)) return value.map(sanitizeNode)
  if (!value || typeof value !== 'object') return value

  const scriptTag = String(value.tagName ?? '').toLowerCase() === 'script'
  const result = {}
  for (const [key, entry] of Object.entries(value)) {
    const normalized = key.toLowerCase().replace(/[-_]/g, '')
    if (['script', 'scriptexport', 'scriptcontent'].includes(normalized)) continue
    if (scriptTag && key === 'content') continue
    if (key === 'tagName' && scriptTag) {
      result[key] = 'div'
      continue
    }
    if (key === 'content' && typeof entry === 'string') {
      result[key] = cleanMarkup(entry)
      continue
    }
    if (key === 'attributes' && entry && typeof entry === 'object' && !Array.isArray(entry)) {
      const attributes = {}
      for (const [name, attribute] of Object.entries(entry)) {
        if (/^on/i.test(name)) continue
        if (['href', 'src', 'xlink:href'].includes(name.toLowerCase()) && /^\s*javascript:/i.test(String(attribute))) continue
        attributes[name] = sanitizeNode(attribute)
      }
      result[key] = attributes
      continue
    }
    result[key] = sanitizeNode(entry)
  }
  return result
}

export function createProjectDocument({ project, seo = {} } = {}) {
  return {
    format: PROJECT_FORMAT,
    version: PROJECT_VERSION,
    savedAt: new Date().toISOString(),
    seo: {
      title: String(seo.title ?? ''),
      description: String(seo.description ?? ''),
      canonical: String(seo.canonical ?? ''),
      ogImage: String(seo.ogImage ?? ''),
      jsonLd: String(seo.jsonLd ?? ''),
    },
    project: sanitizeNode(project),
  }
}

export function parseProjectDocument(text) {
  let document
  try {
    document = JSON.parse(String(text))
  } catch {
    throw new Error('프로젝트 파일이 올바른 JSON이 아닙니다.')
  }
  if (document?.format !== PROJECT_FORMAT || document?.version !== PROJECT_VERSION) {
    throw new Error('지원하지 않는 프로젝트 파일 형식 또는 버전입니다.')
  }
  if (!document.project || typeof document.project !== 'object' || Array.isArray(document.project)) {
    throw new Error('편집 프로젝트 데이터가 없습니다.')
  }
  const project = sanitizeNode(document.project)
  const seo = document.seo && typeof document.seo === 'object' && !Array.isArray(document.seo) ? document.seo : {}
  return {
    project,
    seo: {
      title: String(seo.title ?? ''),
      description: String(seo.description ?? ''),
      canonical: String(seo.canonical ?? ''),
      ogImage: String(seo.ogImage ?? ''),
      jsonLd: String(seo.jsonLd ?? ''),
    },
  }
}
