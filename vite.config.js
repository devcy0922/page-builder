import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { inlineLocalImagePlugin } from './src/inline-local-image-plugin.js'

// 정적 파일만 만든다. base를 상대 경로로 두어 어느 하위 경로에 올려도 열린다.
// 시작 예시 이미지는 개발·빌드 모두 data URL로 넣어 HTML 한 장에 포함한다.
export default defineConfig({
  base: './',
  plugins: [inlineLocalImagePlugin(), vue()],
})
