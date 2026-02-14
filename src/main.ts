import { createApp } from 'vue'
import { createPinia } from 'pinia'   // 전역 상태 관리 (토큰, 모임 데이터)
import router from './router'          // 페이지 라우팅
import App from './App.vue'
import './style.css'                   // TailwindCSS

const app = createApp(App)

app.use(createPinia())  // Pinia를 먼저 등록 (Router 가드에서 store 사용 가능하도록)
app.use(router)         // Vue Router 등록
app.mount('#app')       // index.html의 <div id="app">에 마운트