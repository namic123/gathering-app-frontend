import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getGathering } from '@/api'
import type { GatheringDetail } from '@/types'

/**
 * 모임 상세 스토어.
 *
 * 투표 페이지, 대시보드, 결과 페이지 등 여러 컴포넌트에서
 * 동일한 모임 데이터를 공유해야 하므로 Pinia로 관리.
 *
 * 사용:
 *   const store = useGatheringStore()
 *   await store.fetch('aB3kX7')
 *   store.gathering?.title
 */
export const useGatheringStore = defineStore('gathering', () => {
    const gathering = ref<GatheringDetail | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const currentShareCode = ref<string | null>(null)

    /**
     * 모임 상세 조회.
     * 같은 shareCode면 캐시 사용 (force로 강제 갱신 가능).
     */
    async function fetch(shareCode: string, force = false) {
        // 캐시 히트
        if (!force && currentShareCode.value === shareCode && gathering.value) {
            return gathering.value
        }

        loading.value = true
        error.value = null

        try {
            const { data } = await getGathering(shareCode)
            gathering.value = data
            currentShareCode.value = shareCode
            return data
        } catch (err: any) {
            error.value = err.userMessage || '모임 정보를 불러올 수 없습니다.'
            gathering.value = null
            throw err
        } finally {
            loading.value = false
        }
    }

    /** 캐시 초기화 (페이지 전환 시) */
    function reset() {
        gathering.value = null
        currentShareCode.value = null
        error.value = null
    }

    return { gathering, loading, error, currentShareCode, fetch, reset }
})