import axios from 'axios'
// 기존 코드에서 이 줄만 수정:
import type {
    CreateGatheringRequest,
    CreateGatheringResponse,
    GatheringDetail,
    ParticipateRequest,
    ParticipateResponse,
    ConfirmRequest,
    ConfirmedResultResponse,
    VoteSummaryResponse         // ← 추가
} from '@/types'


/**
 * Axios 인스턴스.
 * Vite proxy가 /api → localhost:8080으로 포워딩.
 */
const api = axios.create({
    baseURL: '/api/v1',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' }
})

/** 응답 인터셉터: 에러 메시지 정규화 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.data?.message) {
            error.userMessage = error.response.data.message
        } else if (error.code === 'ECONNABORTED') {
            error.userMessage = '요청 시간이 초과되었습니다.'
        } else {
            error.userMessage = '서버와 연결할 수 없습니다.'
        }
        return Promise.reject(error)
    }
)

// ========== 모임 API ==========

export function createGathering(data: CreateGatheringRequest) {
    return api.post<CreateGatheringResponse>('/gatherings', data)
}

export function getGathering(shareCode: string) {
    return api.get<GatheringDetail>(`/gatherings/${shareCode}`)
}

// ========== 투표 API ==========

export function participate(shareCode: string, data: ParticipateRequest) {
    return api.post<ParticipateResponse>(`/gatherings/${shareCode}/participate`, data)
}

export function updateVote(shareCode: string, data: ParticipateRequest, sessionToken: string) {
    return api.put(`/gatherings/${shareCode}/vote`, data, {
        headers: { 'X-Session-Token': sessionToken }
    })
}

// 기존 getVoteSummary를 아래로 교체:
export function getVoteSummary(shareCode: string) {
    return api.get<VoteSummaryResponse>(`/gatherings/${shareCode}/votes`)
}
// ========== 확정 API ==========

export function confirmGathering(shareCode: string, data: ConfirmRequest, adminToken: string) {
    return api.post(`/gatherings/${shareCode}/confirm`, data, {
        headers: { 'X-Admin-Token': adminToken }
    })
}

export function resolveTiebreak(shareCode: string, data: ConfirmRequest, adminToken: string) {
    return api.post(`/gatherings/${shareCode}/tiebreak`, data, {
        headers: { 'X-Admin-Token': adminToken }
    })
}

export function getResult(shareCode: string) {
    return api.get<ConfirmedResultResponse>(`/gatherings/${shareCode}/result`)
}



export default api