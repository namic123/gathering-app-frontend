import { createRouter, createWebHistory } from 'vue-router'

/**
 * 라우트 정의.
 *
 * 핵심 흐름:
 * 홈(/) → 생성(/create) → 완료(/created/:shareCode)
 *                        → 투표(/g/:shareCode)
 *                        → 대시보드(/g/:shareCode/dashboard)
 *                        → 투표현황(/g/:shareCode/votes)
 *                        → 결과(/g/:shareCode/result)
 *                        → 동점해소(/g/:shareCode/tiebreak)
 */
const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/HomePage.vue')
    },
    {
        path: '/create',
        name: 'Create',
        component: () => import('@/views/CreatePage.vue')
    },
    {
        path: '/created/:shareCode',
        name: 'CreateComplete',
        component: () => import('@/views/CreateCompletePage.vue'),
        props: true
    },
    {
        path: '/g/:shareCode',
        name: 'Participate',
        component: () => import('@/views/ParticipatePage.vue'),
        props: true
    },
    {
        path: '/g/:shareCode/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/DashboardPage.vue'),
        props: true
    },
    {
        path: '/g/:shareCode/votes',
        name: 'Votes',
        component: () => import('@/views/VotesPage.vue'),
        props: true
    },
    {
        path: '/g/:shareCode/result',
        name: 'Result',
        component: () => import('@/views/ResultPage.vue'),
        props: true
    },
    {
        path: '/g/:shareCode/tiebreak',
        name: 'Tiebreak',
        component: () => import('@/views/TiebreakPage.vue'),
        props: true
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/NotFoundPage.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return { top: 0 }
    }
})

export default router