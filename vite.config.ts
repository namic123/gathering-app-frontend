import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    // Vue 3 SFC(.vue 파일) 컴파일
    vue(),

    // TailwindCSS — Vite 전용 플러그인 (PostCSS 설정 불필요)
    tailwindcss(),

    // PWA — 서비스워커 자동 생성 + 오프라인 캐싱 + 홈화면 추가 프롬프트
    VitePWA({
      // autoUpdate: 새 버전 배포 시 자동으로 서비스워커 업데이트
      registerType: 'autoUpdate',
      manifest: {
        name: '모임 - 약속 투표',          // 설치 시 표시되는 전체 이름
        short_name: '모임',               // 홈화면 아이콘 아래 표시
        theme_color: '#6366f1',           // 상단 바 색상 (indigo)
        display: 'standalone',            // 브라우저 UI 숨김 → 앱처럼 보임
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],

  server: {
    port: 3000,
    proxy: {
      // 개발 시 /api 요청을 Spring Boot(8080)로 프록시
      // 예: fetch('/api/v1/gatherings') → http://localhost:8080/api/v1/gatherings
      // → CORS 문제 없이 BE API 호출 가능
      '/api': 'http://localhost:8080'
    }
  }
})