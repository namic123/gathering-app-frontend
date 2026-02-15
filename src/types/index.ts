// ========== 모임 생성 ==========

export interface TimeCandidateItem {
    date: string           // "2026-03-07"
    startTime: string      // "18:00"
    endTime: string | null // "20:00" 또는 null
}

export interface PlaceCandidateItem {
    name: string
    mapLink: string | null
    memo: string | null
    estCost?: number | null
    travelMin?: number | null
    moodTags?: string | null
}

export interface CreateGatheringRequest {
    title: string
    hostName: string
    description: string | null
    type: 'TIME_ONLY' | 'PLACE_ONLY' | 'BOTH'
    deadline: string       // ISO 8601 UTC
    timeCandidates: TimeCandidateItem[] | null
    placeCandidates: PlaceCandidateItem[] | null
}

export interface CreateGatheringResponse {
    shareCode: string
    adminToken: string
    shareUrl: string
    deadline: string
}

// ========== 모임 조회 ==========

export interface TimeCandidateDetail {
    id: number
    date: string
    startTime: string
    endTime: string | null
    voteCount: number
}

export interface PlaceCandidateDetail {
    id: number
    name: string
    mapLink: string | null
    memo: string | null
    estCost: number | null
    travelMin: number | null
    moodTags: string[]
    voteCount: number
}

export type GatheringType = 'TIME_ONLY' | 'PLACE_ONLY' | 'BOTH'
export type GatheringStatus = 'VOTING' | 'TIEBREAK' | 'CONFIRMED' | 'EXPIRED'

export interface GatheringDetail {
    title: string
    hostName: string
    description: string | null
    type: GatheringType
    status: GatheringStatus
    deadline: string
    timeCandidates: TimeCandidateDetail[]
    placeCandidates: PlaceCandidateDetail[]
    participantCount: number
}

// ========== 투표 ==========

export interface ParticipateRequest {
    name: string
    timeCandidateIds: number[]
    placeCandidateIds: number[]
}

export interface ParticipateResponse {
    participantId: number
    sessionToken: string
}

// ========== 확정 ==========

export interface ConfirmRequest {
    timeCandidateId: number | null
    placeCandidateId: number | null
}

export interface ConfirmedResultResponse {
    title: string
    hostName: string
    confirmedDate: string | null
    confirmedStartTime: string | null
    confirmedEndTime: string | null
    confirmedPlaceName: string | null
    confirmedPlaceMapLink: string | null
    confirmedBy: 'AUTO' | 'HOST'
    confirmedAt: string
    icsDownloadUrl: string
}

// ========== 투표 현황 (D6 추가) ==========

/**
 * 후보 1건의 투표 집계 결과.
 * candidateId: TimeCandidate 또는 PlaceCandidate의 DB id.
 * voterNames: 이 후보에 투표한 참여자 닉네임 목록.
 */
export interface CandidateVote {
    candidateId: number
    voteCount: number
    voterNames: string[]
}

/**
 * GET /api/v1/gatherings/{shareCode}/votes 응답.
 * 5초 폴링으로 실시간 투표 현황 갱신에 사용.
 */
export interface VoteSummaryResponse {
    participantCount: number
    participantNames: string[]
    timeCandidateVotes: CandidateVote[]
    placeCandidateVotes: CandidateVote[]
}