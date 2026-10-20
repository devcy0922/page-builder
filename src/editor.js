// GrapesJS 설정. 엔진은 그대로 쓰고, 기기·스타일 섹터·빈 상태 문구만 정한다.
import grapesjs from 'grapesjs'
import ko from 'grapesjs/locale/ko'
import 'grapesjs/dist/css/grapes.min.css'
// 편집기 아이콘과 글꼴은 패키지에서 번들한다. 외부 CDN이 막혀도 버튼 아이콘과 캔버스 글꼴이 그대로 나온다.
import 'font-awesome/css/font-awesome.min.css'
import pretendardCss from 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css?url'
import { BLOCKS, START_CSS, START_HTML } from './start-page.js'

export const DEVICES = [
  { id: 'Desktop', label: '데스크톱', width: '' },
  { id: 'Tablet', label: '태블릿', width: '768px', widthMedia: '992px' },
  { id: 'Mobile', label: '모바일', width: '375px', widthMedia: '480px' },
]

const EMPTY = '캔버스에서 영역을 먼저 선택하세요.'

// GrapesJS 한국어 문구 위에, 이 앱에서 쓰는 이름으로 덮어쓴다.
const KO = {
  styleManager: {
    empty: EMPTY,
    properties: {
      'font-family': '글꼴',
      'font-size': '글자 크기',
      'font-weight': '굵기',
      'letter-spacing': '자간',
      color: '글자 색',
      'line-height': '줄 간격',
      'text-align': '정렬',
      'background-color': '배경 색',
      padding: '안쪽 여백',
      margin: '바깥 여백',
      'border-radius': '모서리',
      width: '너비',
      'max-width': '최대 너비',
      height: '높이',
    },
  },
  traitManager: { empty: EMPTY },
  selectorManager: { label: '클래스' },
  deviceManager: { device: '기기' },
  panels: {
    buttons: {
      titles: {
        'sw-visibility': '영역 테두리 보기',
        'export-template': '코드 보기',
        'open-sm': '스타일',
        'open-tm': '속성',
        'open-layers': '레이어',
        'open-blocks': '블록 추가',
      },
    },
  },
}

export function createEditor(container) {
  return grapesjs.init({
    container,
    height: '100%',
    width: 'auto',
    storageManager: false,
    // 기본값은 cdnjs의 Font Awesome을 불러온다. 위에서 패키지로 불러오므로 끈다.
    cssIcons: '',
    // 캔버스는 iframe이라 글꼴 CSS를 따로 넣는다(빌드 결과에 포함된 파일 주소).
    canvas: { styles: [pretendardCss] },
    i18n: { locale: 'ko', detectLocale: false, messages: { ko }, messagesAdd: { ko: KO } },
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
