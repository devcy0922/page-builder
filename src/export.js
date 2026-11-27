import { strToU8, zipSync } from 'fflate'
import { buildDiscoveryFiles, createSeoMetadataHtml } from './seo.js'

const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

export function titleFromHtml(html, fallback = '내보낸 페이지') {
  const m = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html ?? '')
  const text = m ? m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : ''
  return text || fallback
}

export function fileNameFor(title, extension = 'html') {
  const base = String(title ?? '')
    .replace(/[\\/:*?"<>|]+/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return (base || 'page') + '.' + extension.replace(/^\./, '')
}

function bodyContent(html) {
  return String(html ?? '').replace(/^\s*<body[^>]*>/i, '').replace(/<\/body>\s*$/i, '').trim()
}

export function buildHtmlDocument({ html, css, title, lang = 'ko', seo = {} }) {
  const body = bodyContent(html)
  const style = String(css ?? '').replace(/<\/style/gi, '<\\/style').trim()
  const pageTitle = String(seo.title ?? '').trim() || String(title ?? '').trim() || titleFromHtml(body)
  const head = createSeoMetadataHtml({ ...seo, title: pageTitle })
  return '<!doctype html>\n<html lang="' + escapeHtml(lang) + '">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n' + head + '\n<style>\n' + style + '\n</style>\n</head>\n<body>\n' + body + '\n</body>\n</html>\n'
}

const DATA_IMAGE = /data:(image\/(?:png|jpeg|webp|gif|svg\+xml));base64,([a-z0-9+/=]+)/gi

function imageExtension(mime) {
  return ({ 'image/jpeg': 'jpg', 'image/svg+xml': 'svg' })[mime.toLowerCase()] || mime.split('/')[1].toLowerCase()
}

function decodeBase64(value) {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return bytes
}

export function splitEmbeddedImages(html, css) {
  const assets = {}
  const paths = new Map()
  let count = 0
  const rewrite = (input) => String(input ?? '').replace(DATA_IMAGE, (dataUrl, mime, base64) => {
    if (paths.has(dataUrl)) return paths.get(dataUrl)
    count += 1
    const path = 'assets/image-' + String(count).padStart(2, '0') + '.' + imageExtension(mime)
    paths.set(dataUrl, path)
    assets[path] = decodeBase64(base64)
    return path
  })
  return { html: rewrite(html), css: rewrite(css), assets }
}

export function buildSiteBundle({ html, css, title, lang = 'ko', seo = {} }) {
  const split = splitEmbeddedImages(bodyContent(html), css)
  const indexHtml = buildHtmlDocument({ html: split.html, css: split.css, title, lang, seo })
  const entries = {
    'index.html': strToU8(indexHtml),
    'README.txt': strToU8('정적 사이트 파일입니다.\nindex.html을 호스팅 루트에 올리세요.\nassets 폴더의 파일도 함께 올리세요.\nrobots.txt와 sitemap.xml은 대표 주소를 입력한 경우에만 포함됩니다.\n'),
  }
  for (const [path, bytes] of Object.entries(split.assets)) entries[path] = bytes
  for (const [path, content] of Object.entries(buildDiscoveryFiles(seo.canonical))) entries[path] = strToU8(content)
  return { archive: zipSync(entries, { level: 6 }), files: Object.keys(entries) }
}
