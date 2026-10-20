<script setup>
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { DEVICES, createEditor, readFontSize, resetEditor } from './editor.js'
import { buildHtmlDocument, fileNameFor, titleFromHtml } from './export.js'

const host = ref(null)
const editor = shallowRef(null)
const error = ref('')
const selected = ref(null)
const fontSize = ref(16)
const device = ref('Desktop')

function applyFontSize(v) {
  fontSize.value = v
  editor.value?.getSelected()?.addStyle({ 'font-size': `${v}px` })
}

function setDevice(id) {
  device.value = id
  editor.value?.setDevice(id)
}

function exportHtml() {
  const ed = editor.value
  if (!ed) return
  const html = ed.getHtml()
  const title = titleFromHtml(html)
  const doc = buildHtmlDocument({ html, css: ed.getCss(), title })
  const url = URL.createObjectURL(new Blob([doc], { type: 'text/html' }))
  const a = document.createElement('a')
  a.href = url
  a.download = fileNameFor(title)
  a.click()
  URL.revokeObjectURL(url)
}

function reset() {
  if (editor.value && confirm('처음 상태로 되돌릴까요? 지금 고친 내용은 사라집니다.')) resetEditor(editor.value)
}

onMounted(() => {
  try {
    const ed = createEditor(host.value)
    ed.on('component:selected', (c) => {
      selected.value = c ? c.getName?.() || c.get('tagName') : null
      fontSize.value = readFontSize(c)
    })
    ed.on('component:deselected', () => {
      selected.value = null
    })
    editor.value = ed
  } catch (e) {
    error.value = e?.message ?? String(e)
  }
})

onBeforeUnmount(() => editor.value?.destroy())
</script>

<template>
  <div class="app">
    <header class="bar">
      <strong class="brand">페이지 빌더</strong>
      <span class="sel">{{ selected ? `선택: ${selected}` : '영역을 클릭하세요' }}</span>
      <label class="size">
        글자 크기
        <input type="range" min="10" max="96" :value="fontSize" :disabled="!selected" @input="applyFontSize(Number($event.target.value))" />
        <output>{{ fontSize }}px</output>
      </label>
      <div class="devices" role="group" aria-label="미리보기 화면 크기">
        <button v-for="d in DEVICES" :key="d.id" type="button" :aria-pressed="device === d.id" :disabled="!editor" @click="setDevice(d.id)">{{ d.label }}</button>
      </div>
      <button type="button" class="btn" :disabled="!editor" @click="reset">처음 상태로</button>
      <button type="button" class="btn btn--primary" :disabled="!editor" @click="exportHtml">HTML 내려받기</button>
    </header>
    <p class="narrow">좁은 화면에서는 영역 선택과 글자 크기만 바꿀 수 있습니다. 스타일 패널은 넓은 화면에서 열립니다.</p>
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
.size input { width: 160px; accent-color: var(--ink); }
.size output { min-width: 44px; font-variant-numeric: tabular-nums; }
.devices { display: inline-flex; margin-left: auto; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
.devices button { height: 34px; padding: 0 12px; border: 0; background: #fff; color: var(--soft); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
.devices button + button { border-left: 1px solid var(--line); }
.devices button[aria-pressed="true"] { background: var(--ink); color: #fff; }
.btn { height: 36px; padding: 0 14px; border: 1px solid var(--line); border-radius: 8px; background: #fff; color: var(--ink); font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; }
.btn--primary { border-color: var(--ink); background: var(--ink); color: #fff; }
.btn:disabled, .devices button:disabled { opacity: 0.5; cursor: default; }
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
  .devices { margin-left: 0; }
  /* 오른쪽 패널(15%)이 너무 좁아 글자가 한 자씩 꺾인다. 좁은 화면에서는 캔버스를 전체 폭으로 쓴다. */
  .narrow { display: block; margin: 0; padding: 8px 16px; border-bottom: 1px solid var(--line); background: var(--wash); color: var(--soft); font-size: 13px; line-height: 1.5; }
  .gjs-cv-canvas { width: 100%; }
  .gjs-pn-commands { width: 100%; }
  .gjs-pn-options { right: 0; }
  .gjs-pn-views, .gjs-pn-views-container { display: none; }
}
</style>
