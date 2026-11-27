import { readFile } from 'node:fs/promises'
import { extname, isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const assetDirectory = resolve(fileURLToPath(new URL('./assets/', import.meta.url)))
const imageMimeTypes = new Map([
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.webp', 'image/webp'],
])

export async function loadInlineLocalImage(id) {
  const queryIndex = id.indexOf('?')
  if (queryIndex < 0) return null

  const query = new URLSearchParams(id.slice(queryIndex + 1).split('#', 1)[0])
  if (!query.has('inline')) return null

  const filename = resolve(id.slice(0, queryIndex))
  const pathFromAssetDirectory = relative(assetDirectory, filename)
  if (!pathFromAssetDirectory || pathFromAssetDirectory.startsWith('..') || isAbsolute(pathFromAssetDirectory)) {
    return null
  }

  const mimeType = imageMimeTypes.get(extname(filename).toLowerCase())
  if (!mimeType) return null

  const bytes = await readFile(filename)
  const dataUrl = 'data:' + mimeType + ';base64,' + bytes.toString('base64')
  return 'export default ' + JSON.stringify(dataUrl)
}

export function inlineLocalImagePlugin() {
  return {
    name: 'page-builder-inline-local-images',
    enforce: 'pre',
    load: loadInlineLocalImage,
  }
}
