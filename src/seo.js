const escapeHtml = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

export function absoluteHttpUrl(value) {
  const text = String(value ?? '').trim()
  if (!text) return ''
  try {
    const url = new URL(text)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : ''
  } catch {
    return ''
  }
}

function meta(name, content, property = false) {
  if (!content) return ''
  return '<meta ' + (property ? 'property' : 'name') + '="' + escapeHtml(name) + '" content="' + escapeHtml(content) + '">'
}

export function createSeoMetadataHtml({ title, description, canonical, ogImage, jsonLd } = {}) {
  const pageTitle = String(title ?? '').trim()
  const pageDescription = String(description ?? '').trim()
  const pageUrl = absoluteHttpUrl(canonical)
  const imageUrl = absoluteHttpUrl(ogImage)
  const lines = ['<title>' + escapeHtml(pageTitle || '새 페이지') + '</title>']

  if (pageDescription) lines.push(meta('description', pageDescription))
  if (pageUrl) lines.push('<link rel="canonical" href="' + escapeHtml(pageUrl) + '">')
  lines.push(meta('og:type', 'website', true))
  if (pageTitle) lines.push(meta('og:title', pageTitle, true))
  if (pageDescription) lines.push(meta('og:description', pageDescription, true))
  if (pageUrl) lines.push(meta('og:url', pageUrl, true))
  if (imageUrl) lines.push(meta('og:image', imageUrl, true), meta('twitter:card', 'summary_large_image'))
  if (imageUrl) lines.push(meta('twitter:image', imageUrl))
  if (pageTitle) lines.push(meta('twitter:title', pageTitle))
  if (pageDescription) lines.push(meta('twitter:description', pageDescription))

  const schema = String(jsonLd ?? '').trim()
  if (schema) {
    try {
      const compact = JSON.stringify(JSON.parse(schema)).replace(/</g, '\\u003c')
      lines.push('<script type="application/ld+json">' + compact + '</script>')
    } catch {
      // Invalid JSON-LD is omitted from output and reported by the local audit.
    }
  }
  return lines.filter(Boolean).join('\n')
}

function plainText(html) {
  return String(html ?? '')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function item(level, title, detail) {
  return { level, title, detail }
}

export function auditSeo({ html = '', seo = {} } = {}) {
  const source = String(html ?? '')
  const title = String(seo.title ?? '').trim()
  const description = String(seo.description ?? '').trim()
  const canonical = String(seo.canonical ?? '').trim()
  const ogImage = String(seo.ogImage ?? '').trim()
  const jsonLd = String(seo.jsonLd ?? '').trim()
  const results = []

  results.push(title
    ? item('ok', '페이지 제목', '검색 결과와 브라우저 탭에 쓸 제목이 있습니다.')
    : item('error', '페이지 제목', '페이지 내용을 설명하는 제목을 입력하세요.'))
  results.push(description
    ? item('ok', '페이지 설명', '검색 결과에 보여 줄 요약 문장이 있습니다.')
    : item('warn', '페이지 설명', '한두 문장으로 페이지의 실제 내용을 요약해 보세요.'))

  if (canonical) {
    results.push(absoluteHttpUrl(canonical)
      ? item('ok', '대표 주소', '절대 URL 형식입니다.')
      : item('error', '대표 주소', 'http:// 또는 https://로 시작하는 공개 주소를 입력하세요.'))
  } else {
    results.push(item('info', '대표 주소', '배포할 주소를 알 때 canonical, sitemap, robots.txt를 만들 수 있습니다.'))
  }

  if (ogImage) {
    results.push(absoluteHttpUrl(ogImage)
      ? item('ok', '공유 이미지', '소셜 미리보기용 절대 URL입니다.')
      : item('warn', '공유 이미지', '공유 이미지는 배포된 파일의 절대 URL을 사용하세요.'))
  } else {
    results.push(item('info', '공유 이미지', '링크 미리보기를 원하면 공개된 이미지 주소를 추가하세요.'))
  }

  const headings = [...source.matchAll(/<h([1-6])\b[^>]*>/gi)].map((match) => Number(match[1]))
  const h1Count = headings.filter((level) => level === 1).length
  results.push(h1Count === 1
    ? item('ok', '주 제목', '페이지 주제를 나타내는 h1이 하나 있습니다.')
    : item(h1Count === 0 ? 'warn' : 'warn', '주 제목', '페이지 주제를 나타내는 h1을 하나 두세요. 현재 ' + h1Count + '개입니다.'))

  let previous = 0
  let skipped = false
  for (const level of headings) {
    if (previous && level > previous + 1) skipped = true
    previous = level
  }
  results.push(skipped
    ? item('warn', '제목 순서', '중간 단계를 건너뛴 제목이 있습니다. h2, h3 순서로 내용을 나눠 보세요.')
    : item('ok', '제목 순서', '제목 단계가 순서대로 이어집니다.'))

  const images = [...source.matchAll(/<img\b([^>]*)>/gi)]
  const missingAlt = images.filter((match) => {
    const alt = match[1].match(/\balt\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i)
    return !alt || !String(alt[1] ?? alt[2] ?? alt[3] ?? '').trim()
  }).length
  results.push(missingAlt
    ? item('warn', '이미지 대체 텍스트', '설명이 없는 이미지가 ' + missingAlt + '개 있습니다.')
    : item('ok', '이미지 대체 텍스트', images.length ? '이미지에 대체 텍스트가 있습니다.' : '이미지 없음. 나중에 추가할 때 대체 텍스트를 적으세요.'))

  const links = [...source.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)]
  const vagueLink = links.filter((match) => {
    const label = match[1].match(/\baria-label\s*=\s*(?:"([^"]*)"|'([^']*)')/i)
    return !plainText(match[2]) && !String(label?.[1] ?? label?.[2] ?? '').trim()
  }).length
  results.push(vagueLink
    ? item('warn', '링크 설명', '화면 낭독기와 검색 시스템이 목적을 알 수 없는 링크가 ' + vagueLink + '개 있습니다.')
    : item('ok', '링크 설명', '링크가 설명 문구나 접근 가능한 이름을 가집니다.'))

  const bodyText = plainText(source)
  results.push(bodyText.length >= 80
    ? item('ok', '본문 설명', '페이지에서 읽을 수 있는 본문이 있습니다.')
    : item('info', '본문 설명', '짧은 문구만 두기보다 무엇을 제공하는지 본문으로 설명하면 이해에 도움이 됩니다.'))

  const h1 = source.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)
  const afterH1 = h1 ? source.slice((h1.index ?? 0) + h1[0].length, (h1.index ?? 0) + h1[0].length + 800) : ''
  results.push(/<p\b[^>]*>[\s\S]*?\S[\s\S]*?<\/p>/i.test(afterH1)
    ? item('ok', '첫 설명 문장', '주 제목 뒤에 페이지를 직접 설명하는 문단이 있습니다.')
    : item('info', '첫 설명 문장', '주 제목 바로 뒤에 페이지가 답하는 질문이나 제공 내용을 짧게 설명해 보세요.'))

  if (jsonLd) {
    try {
      const value = JSON.parse(jsonLd)
      results.push(value && typeof value === 'object' && !Array.isArray(value) && value['@context']
        ? item('ok', '구조화 데이터', 'JSON이 유효하며 @context가 있습니다. 내용이 화면과 같은지 확인하세요.')
        : item('warn', '구조화 데이터', 'JSON 객체에 schema.org @context를 넣고 화면에 보이는 사실과 일치시켜 주세요.'))
    } catch {
      results.push(item('error', '구조화 데이터', 'JSON 문법을 고치거나 비워 두세요. 선택 입력입니다.'))
    }
  } else {
    results.push(item('info', '구조화 데이터', '필수 항목이 아닙니다. 실제 사업체나 문서 정보를 정확히 설명할 때만 추가하세요.'))
  }

  return results
}

export function buildDiscoveryFiles(canonical) {
  const pageUrl = absoluteHttpUrl(canonical)
  if (!pageUrl) return {}
  const sitemapUrl = new URL('/sitemap.xml', pageUrl).href
  const xmlEscape = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
  return {
    'robots.txt': 'User-agent: *\nAllow: /\nSitemap: ' + sitemapUrl + '\n',
    'sitemap.xml': '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>' + xmlEscape(pageUrl) + '</loc></url>\n</urlset>\n',
  }
}
