import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 정적 파일만 만든다. base를 상대 경로로 두어 어느 하위 경로에 올려도 열린다.
export default defineConfig({
  base: './',
  plugins: [vue()],
})
