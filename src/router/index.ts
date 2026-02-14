import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    // === 주최자 플로우 ===
    {
        path: '/',
        component: () => import('../views/HomePage.vue'),         // 랜딩 페이지 (모임 생성 시작)
    },
    {
        path: '/create',
        component: () => import('../views/CreatePage.vue'),       // 모임 생성 위자드 (제목→후보→완료)
    },

    // === 참여자 플로우 ===
    // :shareCode → 동적 파라미터 (예: /g/aB3kX7)
    // 카카오톡 공유 링크로 들어오는 진입점
    {
        path: '/g/:shareCode',
        component: () => import('../views/ParticipatePage.vue'),  // 닉네임 입력 + 투표
    },

    // === 공통/관리 화면 ===
    {
        path: '/g/:shareCode/dashboard',
        component: () => import('../views/DashboardPage.vue'),    // 주최자 대시보드 (링크 공유, 투표 현황)
    },
    {
        path: '/g/:shareCode/votes',
        component: () => import('../views/VotesPage.vue'),        // 투표 현황 (누구나 열람 가능)
    },
    {
        path: '/g/:shareCode/result',
        component: () => import('../views/ResultPage.vue'),       // 확정 결과 카드 + .ics 다운로드
    },
    {
        path: '/g/:shareCode/tiebreak',
        component: () => import('../views/TiebreakPage.vue'),     // 동점 해소 (주최자 전용)
    },
]

export default createRouter({
    // HTML5 History 모드: URL에 # 없이 깔끔한 경로 사용
    // (배포 시 서버에서 SPA fallback 설정 필요 — Vercel은 자동 처리)
    history: createWebHistory(),
    routes,
})