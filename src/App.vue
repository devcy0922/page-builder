<script setup>
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { DEVICES, createEditor, readFontSize, resetEditor } from './editor.js'
import { buildHtmlDocument, fileNameFor, titleFromHtml } from './export.js'
import { imageFileError, readImageAsDataUrl } from './local-image.js'

const host = ref(null)
const imageInput = ref(null)
const editor = shallowRef(null)
const error = ref('')
const selected = ref(null)
const fontSize = ref(16)
const device = ref('Desktop')
const imageNotice = ref('')
const imageNoticeKind = ref('status')

function applyFontSize(value) {
  fontSize.value = value
  editor.value?.getSelected()?.addStyle({ 'font-size': value + 'px' })
}

function setDevice(id) {
  device.value = id
  editor.value?.setDevice(id)
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
      component.addAttributes({ src: dataUrl, alt: attributes.alt || file.name })
    } else {
      component.addStyle({
        'background-image': 'linear-gradient(90deg, rgb(15 15 13 / 78%) 0%, rgb(15 15 13 / 28%) 62%, rgb(15 15 13 / 18%) 100%), url("' + dataUrl + '")',
        'background-position': 'center',
        'background-repeat': 'no-repeat',
        'background-size': 'cover',
      })
    }

    imageNotice.value = '이미지를 적용했습니다. 내려받는 HTML에 이미지도 포함됩니다.'
    imageNoticeKind.value = 'status'
  } catch (cause) {
    imageNotice.value = cause?.message || '이미지를 읽지 못했습니다.'
    imageNoticeKind.value = 'error'
  }
}

function exportHtml() {
  const ed = editor.value
  if (!ed) return
  const html = ed.getHtml()
  const title = titleFromHtml(html)
  const doc = buildHtmlDocument({ html, css: ed.getCss(), title })
  const url = URL.createObjectURL(new Blob([doc], { type: 'text/html' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileNameFor(title)
  anchor.click()
  URL.revokeObjectURL(url)
}

function reset() {
  if (editor.value && confirm('처음 상태로 되돌릴까요? 지금 고친 내용은 사라집니다.')) {
    resetEditor(editor.value)
    imageNotice.value = ''
  }
}

onMounted(() => {
  try {
    const ed = createEditor(host.value)
    ed.on('component:selected', (component) => {
      selected.value = component ? component.getName?.() || component.get('tagName') : null
      fontSize.value = readFontSize(component)
    })
    ed.on('component:deselected', () => {
      selected.value = null
    })
    editor.value = ed
  } catch (cause) {
    error.value = cause?.message ?? String(cause)
  }
})

onBeforeUnmount(() => editor.value?.destroy())
</script>

<template>
  <div class="app">
    <header class="bar">
      <strong class="brand">페이지 빌더</strong>
      <span class="sel">{{ selected ? '선택: ' + selected : '영역을 클릭하세요' }}</span>
      <label class="size">
        글자 크기
        <input type="range" min="10" max="96" :value="fontSize" :disabled="!selected" @input="applyFontSize(Number($event.target.value))" />
        <output>{{ fontSize }}px</output>
      </label>
      <div class="devices" role="group" aria-label="미리보기 화면 크기">
        <button v-for="item in DEVICES" :key="item.id" type="button" :aria-pressed="device === item.id" :disabled="!editor" @click="setDevice(item.id)">{{ item.label }}</button>
      </div>
      <button type="button" class="btn" :disabled="!selected" @click="openImagePicker">이미지 배경</button>
      <input ref="imageInput" class="screen-reader-only" type="file" accept="image/jpeg,image/png,image/webp" aria-label="로컬 이미지 선택" tabindex="-1" @change="applyImage" />
      <button type="button" class="btn" :disabled="!editor" @click="reset">처음 상태로</button>
      <button type="button" class="btn btn--primary" :disabled="!editor" @click="exportHtml">HTML 내려받기</button>
      <p v-if="imageNotice" class="notice" :class="'notice--' + imageNoticeKind" :role="imageNoticeKind === 'error' ? 'alert' : 'status'" aria-live="polite">{{ imageNotice }}</p>
    </header>
    <p class="narrow">영역을 선택해 글자 크기를 바꾸거나 로컬 이미지를 배경에 넣으세요. 스타일 패널은 넓은 화면에서 열립니다.</p>
    <p v-if="error" class="err">편집기를 불러오지 못했습니다: {{ error }}</p>
    <main ref="host" class="host" />
  </div>
</template>

<style>
:root { --ink: #16181d; --soft: #3d424d; --line: #e2e5ea; --wash: #f6f7f9; --accent: #2450e6; }
html, body, #app { height: 100%; margin: 0; }
body { font-family: "Pretendard Variable", Pretendard, -apple-system, sans-serif; color: var(--ink); background: #fff; }
.app { display: flex; flex-direction: column; height: 100%; }
.bar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; padding: 10px 16px; border-bottom: 1px solid var(--line); }
.brand { font-size: 15px; }
.sel { min-width: 140px; font-size: 14px; font-weight: 650; }
.size { display: inline-flex; align-items: center; gap: 10px; color: var(--soft); font-size: 14px; }
.size input { width: 128px; accent-color: var(--ink); }
.size output { min-width: 44px; font-variant-numeric: tabular-nums; }
.devices { display: inline-flex; margin-left: auto; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
.devices button { min-height: 36px; padding: 0 12px; border: 0; background: #fff; color: var(--soft); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
.devices button + button { border-left: 1px solid var(--line); }
.devices button[aria-pressed="true"] { background: var(--ink); color: #fff; }
.btn { min-height: 36px; padding: 0 13px; border: 1px solid var(--line); border-radius: 8px; background: #fff; color: var(--ink); font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; }
.btn--primary { border-color: var(--ink); background: var(--ink); color: #fff; }
.btn:disabled, .devices button:disabled { opacity: 0.5; cursor: default; }
.btn:focus-visible, .devices button:focus-visible, .size input:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.notice { flex: 1 0 100%; margin: 0; color: var(--soft); font-size: 13px; line-height: 1.45; }
.notice--error { color: #a12c2c; }
.screen-reader-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
.err { margin: 0; padding: 12px 16px; color: #a12c2c; }
.host { flex: 1; min-height: 0; }

/* GrapesJS 기본 다크 패널을 흰 바탕·먹색 강조로 바꾼다. */
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

@media (max-width: 760px) {
  .bar { gap: 8px; padding: 9px 12px; }
  .sel { flex: 1; min-width: 120px; }
  .size { flex: 1 1 100%; }
  .size input { flex: 1; }
  .devices { margin-left: 0; }
  .devices button { padding-inline: 9px; }
  .btn { padding-inline: 10px; }
  .narrow { display: block; margin: 0; padding: 8px 12px; border-bottom: 1px solid var(--line); background: var(--wash); color: var(--soft); font-size: 13px; line-height: 1.5; }
  .gjs-cv-canvas { width: 100%; }
  .gjs-pn-commands { width: 100%; }
  .gjs-pn-options { right: 0; }
  .gjs-pn-views, .gjs-pn-views-container { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; }
}
</style>
