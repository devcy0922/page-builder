// GrapesJS 설정. 엔진은 그대로 쓰고, 기기·스타일 섹터·빈 상태 문구만 정한다.
import grapesjs from 'grapesjs'
import 'grapesjs/dist/css/grapes.min.css'
import { BLOCKS, START_CSS, START_HTML } from './start-page.js'

export const DEVICES = [
  { id: 'Desktop', label: '데스크톱', width: '' },
  { id: 'Tablet', label: '태블릿', width: '768px', widthMedia: '992px' },
  { id: 'Mobile', label: '모바일', width: '375px', widthMedia: '480px' },
]

const EMPTY = '캔버스에서 영역을 먼저 선택하세요.'

export function createEditor(container) {
  return grapesjs.init({
    container,
    height: '100%',
    width: 'auto',
    storageManager: false,
    // 캔버스는 iframe이라 글꼴을 따로 넣는다.
    canvas: { styles: ['https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css'] },
    i18n: { messagesAdd: { en: { styleManager: { empty: EMPTY }, traitManager: { empty: EMPTY } } } },
    components: START_HTML,
    style: START_CSS,
    deviceManager: { devices: DEVICES.map(({ id, width, widthMedia }) => ({ id, name: id, width, widthMedia })) },
    styleManager: {
      sectors: [
        { name: '글자', open: true, properties: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align'] },
        { name: '배경과 여백', open: false, properties: ['background-color', 'padding', 'margin', 'border-radius'] },
        { name: '크기', open: false, properties: ['width', 'max-width', 'height'] },
      ],
    },
    blockManager: { blocks: BLOCKS },
  })
}

export function resetEditor(editor) {
  editor.setComponents(START_HTML)
  editor.setStyle(START_CSS)
}

/** 선택한 영역의 실제 글자 크기(px). 계산할 수 없으면 16. */
export function readFontSize(component) {
  const el = component?.getEl?.()
  const px = el ? parseFloat(getComputedStyle(el).fontSize) : NaN
  return Number.isFinite(px) ? Math.round(px) : 16
}
