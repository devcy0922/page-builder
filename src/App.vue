<script setup>
import { onBeforeUnmount, onMounted, reactive, ref, shallowRef } from 'vue'
import { DEVICES, createEditor, readFontSize, resetEditor } from './editor.js'
import { buildHtmlDocument, buildSiteBundle, fileNameFor, titleFromHtml } from './export.js'
import { imageFileError, readImageAsDataUrl } from './local-image.js'
import { createProjectDocument, parseProjectDocument } from './project.js'
import { auditSeo } from './seo.js'

const host = ref(null)
const imageInput = ref(null)
const projectInput = ref(null)
const editor = shallowRef(null)
const error = ref('')
const selected = ref(null)
const selectedImage = ref(false)
const imageAlt = ref('')
const fontSize = ref(16)
const device = ref('Desktop')
const panelOpen = ref(false)
const seoOpen = ref(false)
const imageNotice = ref('')
const imageNoticeKind = ref('status')
const notice = ref('')
const noticeKind = ref('status')
const seoResults = ref([])
const checkingResponsive = ref(false)
const seo = reactive({
  title: titleFromHtml('<h1>두드리고 다듬어 오래 쓰는 것</h1>'),
  description: '쇠와 나무를 다루는 작은 공방입니다. 쓰임에 맞는 도구를 한 점씩 만듭니다.',
  canonical: '',
  ogImage: '',
  jsonLd: '',
})

function setNotice(message, kind = 'status') {
  notice.value = message
  noticeKind.value = kind
}

function currentHtml() {
  return editor.value?.getHtml() || ''
}

function applyFontSize(value) {
  fontSize.value = value
  editor.value?.getSelected()?.addStyle({ 'font-size': value + 'px' })
}

function setDevice(id) {
  device.value = id
  editor.value?.setDevice(id)
}

function applyAlt(value) {
  imageAlt.value = value
  editor.value?.getSelected()?.addAttributes({ alt: value })
}

function openImagePicker() {
  imageNotice.value = ''
  imageInput.value?.click()
}

async function applyImage(event) {
  const input = event.currentTarget
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  const component = editor.value?.getSelected()
  if (!component) {
    imageNotice.value = '이미지를 넣을 영역을 먼저 선택하세요.'
    imageNoticeKind.value = 'error'
    return
  }

  const fileError = imageFileError(file)
  if (fileError) {
    imageNotice.value = fileError
    imageNoticeKind.value = 'error'
    return
  }

  try {
    const dataUrl = await readImageAsDataUrl(file)
    const tagName = String(component.get('tagName') || '').toLowerCase()

    if (tagName === 'img') {
      const attributes = component.getAttributes() || {}
      component.addAttributes({ src: dataUrl, alt: attributes.alt || '' })
      imageAlt.value = attributes.alt || ''
    } else {
      component.addStyle({
        'background-image': 'linear-gradient(90deg, rgb(15 15 13 / 78%) 0%, rgb(15 15 13 / 28%) 62%, rgb(15 15 13 / 18%) 100%), url("' + dataUrl + '")',
        'background-position': 'center',
        'background-repeat': 'no-repeat',
        'background-size': 'cover',
      })
    }

    imageNotice.value = '이미지를 적용했습니다. HTML에는 포함하고 ZIP에서는 assets 폴더로 분리합니다.'
    imageNoticeKind.value = 'status'
  } catch (cause) {
    imageNotice.value = cause?.message || '이미지를 읽지 못했습니다.'
    imageNoticeKind.value = 'error'
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function auditCurrentPage() {
  seoResults.value = auditSeo({ html: currentHtml(), seo })
  return seoResults.value
}

function openSeo() {
  seoOpen.value = true
  auditCurrentPage()
}

function exportHtml() {
  const ed = editor.value
  if (!ed) return
  const html = ed.getHtml()
  const title = seo.title.trim() || titleFromHtml(html)
  const doc = buildHtmlDocument({ html, css: ed.getCss(), title, seo })
  downloadBlob(new Blob([doc], { type: 'text/html;charset=utf-8' }), fileNameFor(title))
  setNotice('HTML 파일을 내려받았습니다. 이미지와 CSS가 문서 안에 들어 있습니다.')
  auditCurrentPage()
}

function exportSite() {
  const ed = editor.value
  if (!ed) return
  const title = seo.title.trim() || titleFromHtml(ed.getHtml())
  const result = buildSiteBundle({ html: ed.getHtml(), css: ed.getCss(), title, seo })
  downloadBlob(new Blob([result.archive], { type: 'application/zip' }), fileNameFor(title, 'zip'))
  setNotice('정적 사이트 ZIP을 내려받았습니다. ' + result.files.join(', '))
  auditCurrentPage()
}

function saveProject() {
  const ed = editor.value
  if (!ed) return
  const project = createProjectDocument({ project: ed.getProjectData(), seo })
  const title = seo.title.trim() || titleFromHtml(ed.getHtml())
  downloadBlob(new Blob([JSON.stringify(project, null, 2)], { type: 'application/json;charset=utf-8' }), fileNameFor(title, 'moru-project.json'))
  setNotice('프로젝트 JSON을 내려받았습니다. 파일 안에 페이지 구조와 로컬 이미지가 포함됩니다.')
}

async function loadProject(event) {
  const input = event.currentTarget
  const file = input.files?.[0]
  input.value = ''
  if (!file || !editor.value) return
  if (file.size > 25 * 1024 * 1024) {
    setNotice('프로젝트 파일은 25 MB 이하만 열 수 있습니다.', 'error')
    return
  }
  if (!confirm('프로젝트 파일을 열면 현재 편집 내용이 바뀝니다. 계속할까요?')) return

  try {
    const loaded = parseProjectDocument(await file.text())
    editor.value.loadProjectData(loaded.project)
    Object.assign(seo, loaded.seo)
    seoResults.value = []
    setNotice('프로젝트 파일을 열었습니다. 내용은 이 브라우저 안에서 처리됩니다.')
  } catch (cause) {
    setNotice(cause?.message || '프로젝트 파일을 열지 못했습니다.', 'error')
  }
}

function openProjectPicker() {
  projectInput.value?.click()
}

async function checkResponsive() {
  const ed = editor.value
  if (!ed || checkingResponsive.value) return
  checkingResponsive.value = true
  const original = device.value
  const findings = []
  try {
    const pageViewport = document.documentElement.clientWidth || window.innerWidth
    const pageContent = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)
    findings.push(pageContent > pageViewport + 1
      ? '편집기 화면: 가로 넘침 ' + (pageContent - pageViewport) + 'px'
      : '편집기 화면: 가로 넘침 없음')
    for (const item of DEVICES) {
      setDevice(item.id)
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      const frame = ed.Canvas?.getFrameEl?.()
      const doc = frame?.contentDocument
      if (!doc?.documentElement) {
        findings.push(item.label + ': 캔버스를 읽지 못했습니다.')
        continue
      }
      const viewport = doc.documentElement.clientWidth || frame.clientWidth
      const content = Math.max(doc.documentElement.scrollWidth, doc.body?.scrollWidth || 0)
      findings.push(content > viewport + 1
        ? item.label + ' ' + viewport + 'px: 가로 넘침 ' + (content - viewport) + 'px'
        : item.label + ' ' + viewport + 'px: 가로 넘침 없음')
    }
    const issues = findings.filter((line) => line.includes('가로 넘침 '))
    const overflows = issues.filter((line) => !line.endsWith('가로 넘침 없음'))
    setNotice(overflows.length ? overflows.join(' · ') : '데스크톱·태블릿·모바일 캔버스에서 가로 넘침을 찾지 못했습니다.')
  } catch (cause) {
    setNotice(cause?.message || '반응형 점검에 실패했습니다.', 'error')
  } finally {
    setDevice(original)
    checkingResponsive.value = false
  }
}

function reset() {
  if (editor.value && confirm('처음 상태로 되돌릴까요? 지금 고친 내용은 사라집니다.')) {
    resetEditor(editor.value)
    Object.assign(seo, {
      title: titleFromHtml('<h1>두드리고 다듬어 오래 쓰는 것</h1>'),
      description: '쇠와 나무를 다루는 작은 공방입니다. 쓰임에 맞는 도구를 한 점씩 만듭니다.',
      canonical: '',
      ogImage: '',
      jsonLd: '',
    })
    imageNotice.value = ''
    setNotice('처음 작업장 예시로 되돌렸습니다.')
  }
}

onMounted(() => {
  try {
    const ed = createEditor(host.value)
    ed.on('component:selected', (component) => {
      selected.value = component ? component.getName?.() || component.get('tagName') : null
      const tagName = String(component?.get('tagName') || '').toLowerCase()
      selectedImage.value = tagName === 'img'
      imageAlt.value = component?.getAttributes?.()?.alt || ''
      fontSize.value = readFontSize(component)
    })
    ed.on('component:deselected', () => {
      selected.value = null
      selectedImage.value = false
      imageAlt.value = ''
    })
    editor.value = ed
  } catch (cause) {
    error.value = cause?.message ?? String(cause)
  }
})

onBeforeUnmount(() => editor.value?.destroy())
</script>

<template>
  <div class="app" :class="{ 'app--panel-open': panelOpen }">
    <header class="bar">
      <div class="identity">
        <strong class="brand">페이지 빌더</strong>
        <span class="sel">{{ selected ? '선택: ' + selected : '영역을 클릭해 편집하세요' }}</span>
      </div>
      <label class="size">
        글자 크기
        <input type="range" min="10" max="96" :value="fontSize" :disabled="!selected" @input="applyFontSize(Number($event.target.value))" />
        <output>{{ fontSize }}px</output>
      </label>
      <label v-if="selectedImage" class="alt-editor">이미지 대체 텍스트 <input :value="imageAlt" aria-label="이미지 대체 텍스트" placeholder="이미지가 전달하는 정보를 적으세요" @input="applyAlt($event.target.value)" /></label>
      <div class="devices" role="group" aria-label="미리보기 화면 크기">
        <button v-for="item in DEVICES" :key="item.id" type="button" :aria-pressed="device === item.id" :disabled="!editor" @click="setDevice(item.id)">{{ item.label }}</button>
      </div>
      <div class="actions">
        <button type="button" class="btn panel-toggle" :aria-pressed="panelOpen" @click="panelOpen = !panelOpen">{{ panelOpen ? '패널 닫기' : '편집 패널' }}</button>
        <button type="button" class="btn" :disabled="!selected" @click="openImagePicker">이미지 넣기</button>
        <button type="button" class="btn" :disabled="!editor || checkingResponsive" @click="checkResponsive">{{ checkingResponsive ? '화면 확인 중' : '반응형 확인' }}</button>
        <button type="button" class="btn" :disabled="!editor" @click="saveProject">프로젝트 저장</button>
        <button type="button" class="btn" :disabled="!editor" @click="openProjectPicker">프로젝트 열기</button>
        <button type="button" class="btn" :disabled="!editor" @click="openSeo">SEO · GEO</button>
        <button type="button" class="btn" :disabled="!editor" @click="reset">처음으로</button>
        <button type="button" class="btn" :disabled="!editor" @click="exportHtml">HTML</button>
        <button type="button" class="btn btn--primary" :disabled="!editor" @click="exportSite">사이트 ZIP</button>
      </div>
      <input ref="imageInput" class="screen-reader-only" type="file" accept="image/jpeg,image/png,image/webp" aria-label="로컬 이미지 선택" tabindex="-1" @change="applyImage" />
      <input ref="projectInput" class="screen-reader-only" type="file" accept="application/json,.json" aria-label="프로젝트 JSON 선택" tabindex="-1" @change="loadProject" />
      <p v-if="imageNotice" class="notice" :class="'notice--' + imageNoticeKind" :role="imageNoticeKind === 'error' ? 'alert' : 'status'" aria-live="polite">{{ imageNotice }}</p>
      <p v-if="notice" class="notice" :class="'notice--' + noticeKind" :role="noticeKind === 'error' ? 'alert' : 'status'" aria-live="polite">{{ notice }}</p>
    </header>
    <p class="narrow">데스크톱·태블릿·모바일 폭을 확인할 수 있습니다. 작은 화면에서는 편집 패널을 열어 속성을 조절하세요.</p>
    <p v-if="error" class="err">편집기를 불러오지 못했습니다: {{ error }}</p>
    <main ref="host" class="host" />
    <div v-if="seoOpen" class="modal-scrim" @click.self="seoOpen = false" @keydown.esc="seoOpen = false">
      <section class="seo-dialog" role="dialog" aria-modal="true" aria-labelledby="seo-title">
        <header class="seo-head">
          <div>
            <p class="eyebrow">내보내기 전 확인</p>
            <h1 id="seo-title">검색과 공유 정보</h1>
          </div>
          <button type="button" class="btn" @click="seoOpen = false">닫기</button>
        </header>
        <div class="seo-body">
          <label>페이지 제목
            <input v-model="seo.title" maxlength="120" autocomplete="off" placeholder="예: 모루 대장간 | 맞춤 도구" @input="auditCurrentPage" />
          </label>
          <label>페이지 설명
            <textarea v-model="seo.description" rows="3" maxlength="320" placeholder="이 페이지가 무엇을 제공하는지 한두 문장으로 적으세요." @input="auditCurrentPage"></textarea>
          </label>
          <label>공개 페이지 주소
            <input v-model="seo.canonical" type="url" inputmode="url" autocomplete="url" placeholder="https://example.com/" @input="auditCurrentPage" />
          </label>
          <label>공유 이미지 주소
            <input v-model="seo.ogImage" type="url" inputmode="url" placeholder="https://example.com/cover.webp" @input="auditCurrentPage" />
          </label>
          <label>JSON-LD (선택)
            <textarea v-model="seo.jsonLd" rows="5" spellcheck="false" placeholder='{"@context":"https://schema.org","@type":"WebPage"}' @input="auditCurrentPage"></textarea>
          </label>
          <div class="geo-note">
            <strong>검색·AI 요약에 도움이 되는 기본기</strong>
            <p>질문에 답하는 제목과 본문, 분명한 업체·작성자 정보, 출처 링크와 대체 텍스트를 확인하세요. AI 전용 태그나 이 점검 결과가 노출을 보장하지는 않습니다.</p>
            <a href="https://developers.google.com/search/docs/appearance/ai-features" target="_blank" rel="noreferrer">Google 검색 AI 기능 안내</a>
          </div>
          <section class="audit" aria-live="polite">
            <div class="audit-head">
              <h2>페이지 구조 점검</h2>
              <button type="button" class="btn" @click="auditCurrentPage">다시 점검</button>
            </div>
            <ul>
              <li v-for="(result, index) in seoResults" :key="index" :class="'audit--' + result.level">
                <span class="audit-mark" aria-hidden="true">{{ result.level === 'ok' ? '✓' : result.level === 'error' ? '!' : result.level === 'warn' ? '·' : 'i' }}</span>
                <div><strong>{{ result.title }}</strong><p>{{ result.detail }}</p></div>
              </li>
            </ul>
          </section>
          <p class="disclaimer">이 점검은 편집 보조입니다. 공개 사이트 설정, 크롤링, 색인과 검색 결과는 따로 확인해야 합니다.</p>
        </div>
        <footer class="seo-foot">
          <button type="button" class="btn" @click="seoOpen = false">닫기</button>
          <button type="button" class="btn" @click="exportHtml">HTML 받기</button>
          <button type="button" class="btn btn--primary" @click="exportSite">사이트 ZIP 받기</button>
        </footer>
      </section>
    </div>
  </div>
</template>

<style>
:root { --ink: #16181d; --soft: #3d424d; --line: #e2e5ea; --wash: #f6f7f9; --accent: #2450e6; }
html, body, #app { height: 100%; margin: 0; overflow: hidden; }
body { font-family: "Pretendard Variable", Pretendard, -apple-system, sans-serif; color: var(--ink); background: #fff; }
button, input, textarea { font: inherit; }
.app { display: flex; flex-direction: column; height: 100%; min-width: 0; overflow: hidden; }
.bar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; padding: 10px 16px; border-bottom: 1px solid var(--line); }
.identity { display: flex; align-items: center; gap: 14px; min-width: 180px; }
.brand { font-size: 15px; }
.sel { color: var(--soft); font-size: 13px; font-weight: 600; }
.size { display: inline-flex; align-items: center; gap: 10px; color: var(--soft); font-size: 14px; }
.size input { width: 128px; accent-color: var(--ink); }
.size output { min-width: 44px; font-variant-numeric: tabular-nums; }
.alt-editor { display: inline-flex; align-items: center; gap: 7px; min-width: 210px; color: var(--soft); font-size: 12px; }
.alt-editor input { min-width: 120px; width: min(22vw, 230px); padding: 7px 8px; border: 1px solid var(--line); border-radius: 7px; color: var(--ink); }
.devices { display: inline-flex; margin-left: auto; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
.devices button { min-height: 36px; padding: 0 12px; border: 0; background: #fff; color: var(--soft); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
.devices button + button { border-left: 1px solid var(--line); }
.devices button[aria-pressed="true"] { background: var(--ink); color: #fff; }
.actions { display: flex; flex-wrap: wrap; gap: 7px; align-items: center; }
.btn { min-height: 36px; padding: 0 12px; border: 1px solid var(--line); border-radius: 8px; background: #fff; color: var(--ink); font-size: 13px; font-weight: 600; cursor: pointer; }
.btn--primary { border-color: var(--ink); background: var(--ink); color: #fff; }
.btn:disabled, .devices button:disabled { opacity: .5; cursor: default; }
.btn:focus-visible, .devices button:focus-visible, .size input:focus-visible, input:focus-visible, textarea:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.panel-toggle { display: none; }
.notice { flex: 1 0 100%; margin: 0; color: var(--soft); font-size: 13px; line-height: 1.45; }
.notice--error { color: #a12c2c; }
.screen-reader-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
.err { margin: 0; padding: 12px 16px; color: #a12c2c; }
.host { position: relative; flex: 1; min-width: 0; min-height: 0; overflow: hidden; }
.gjs-one-bg { background-color: #fff; }
.gjs-two-color { color: var(--soft); }
.gjs-three-bg { background-color: var(--ink); color: #fff; }
.gjs-four-color, .gjs-four-color-h:hover { color: var(--accent); }
.gjs-pn-panel, .gjs-pn-views-container { border-color: var(--line); }
.gjs-pn-views-container, .gjs-pn-views { border-left: 1px solid var(--line); box-shadow: none; }
.gjs-cv-canvas { background: var(--wash); }
.gjs-block { width: 44%; min-height: 64px; border: 1px solid var(--line); border-radius: 8px; box-shadow: none; font-family: inherit; }
.gjs-block:hover { border-color: var(--ink); color: var(--ink); }
.gjs-sm-sector-title, .gjs-layer-title, .gjs-block-category .gjs-title { background: var(--wash); border-color: var(--line); }
.gjs-field { background: var(--wash); border: 1px solid var(--line); color: var(--ink); }
.gjs-pn-devices-c { display: none; }
.gjs-editor { font-family: inherit; }
.narrow { display: none; }
.modal-scrim { position: fixed; inset: 0; z-index: 20000; display: grid; place-items: center; padding: 18px; background: rgb(16 18 22 / 56%); }
.seo-dialog { display: flex; flex-direction: column; width: min(760px, 100%); max-height: min(92vh, 900px); overflow: hidden; border: 1px solid var(--line); border-radius: 16px; background: #fff; box-shadow: 0 24px 80px rgb(0 0 0 / 22%); }
.seo-head, .seo-foot { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 15px 20px; border-bottom: 1px solid var(--line); }
.seo-head h1 { margin: 3px 0 0; font-size: 21px; letter-spacing: -.025em; }
.eyebrow { margin: 0; color: #795739; font-size: 11px; font-weight: 700; letter-spacing: .07em; }
.seo-body { overflow-y: auto; padding: 18px 20px; }
.seo-body > label { display: grid; gap: 6px; margin-bottom: 13px; color: var(--soft); font-size: 13px; font-weight: 650; }
.seo-body input, .seo-body textarea { width: 100%; box-sizing: border-box; padding: 10px 11px; border: 1px solid var(--line); border-radius: 8px; background: #fff; color: var(--ink); font-size: 14px; font-weight: 400; }
.seo-body textarea { resize: vertical; line-height: 1.55; }
.geo-note { margin: 16px 0; padding: 13px 15px; border-radius: 10px; background: var(--wash); font-size: 13px; line-height: 1.55; }
.geo-note p { margin: 5px 0 8px; color: var(--soft); }
.geo-note a { color: #2146bd; }
.audit { margin-top: 18px; }
.audit-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.audit-head h2 { margin: 0; font-size: 16px; }
.audit ul { display: grid; gap: 8px; padding: 0; margin: 12px 0 0; list-style: none; }
.audit li { display: flex; gap: 10px; padding: 10px 11px; border: 1px solid var(--line); border-radius: 9px; }
.audit-mark { display: grid; place-items: center; flex: 0 0 22px; width: 22px; height: 22px; border-radius: 50%; background: #edf4ee; color: #27633a; font-size: 13px; font-weight: 800; }
.audit--warn .audit-mark, .audit--info .audit-mark { background: #f6f2e8; color: #795b22; }
.audit--error .audit-mark { background: #f8eceb; color: #9a2e28; }
.audit li strong { font-size: 13px; }
.audit li p { margin: 3px 0 0; color: var(--soft); font-size: 12px; line-height: 1.45; }
.disclaimer { margin: 14px 0 0; color: var(--soft); font-size: 12px; line-height: 1.5; }
.seo-foot { justify-content: flex-end; border-top: 1px solid var(--line); border-bottom: 0; }
@media (max-width: 960px) {
  .identity { flex: 1 1 100%; }
  .devices { margin-left: 0; }
}
@media (max-width: 760px) {
  .bar { gap: 8px; padding: 9px 12px; }
  .identity { gap: 8px; min-width: 100%; }
  .sel { flex: 1; }
  .size { flex: 1 1 100%; }
  .size input { flex: 1; }
  .devices { flex: 1 0 auto; }
  .devices button { flex: 1; padding-inline: 7px; }
  .actions { flex: 1 1 100%; }
  .actions .btn { flex: 1 1 auto; }
  .panel-toggle { display: inline-block; }
  .narrow { display: block; margin: 0; padding: 7px 12px; border-bottom: 1px solid var(--line); background: var(--wash); color: var(--soft); font-size: 12px; line-height: 1.45; }
  .gjs-cv-canvas { width: 100%; }
  .gjs-pn-commands { display: none !important; }
  .gjs-pn-options { display: none !important; }
  .gjs-pn-views-container { position: absolute !important; top: 0 !important; right: 0 !important; bottom: 0 !important; z-index: 1000; display: block !important; width: min(86vw, 320px) !important; max-width: calc(100vw - 28px); border-left: 1px solid var(--line); background: #fff; box-shadow: -12px 0 28px rgb(0 0 0 / 12%); transform: translateX(calc(100% + 8px)); transition: transform .18s ease; }
  .gjs-pn-views { display: block !important; }
  .app--panel-open .gjs-pn-views-container { transform: translateX(0); }
  .modal-scrim { place-items: end center; padding: 0; }
  .seo-dialog { width: 100%; max-height: 94dvh; border-radius: 16px 16px 0 0; }
  .seo-head, .seo-foot { padding: 12px 14px; }
  .seo-body { padding: 15px 14px; }
  .seo-foot .btn { flex: 1; padding: 0 6px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; }
}
</style>
