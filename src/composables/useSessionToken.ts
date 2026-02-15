/**
 * 참여자 세션 토큰 composable.
 *
 * 참여(투표) 시 서버가 1회 발급하는 세션 토큰을 관리한다.
 * 이 토큰은 투표 변경(PUT /votes) 시 X-Session-Token 헤더에 필요하다.
 *
 * localStorage 키: moim_session_{shareCode}
 * 값: JSON 문자열 { token, participantId, name }
 *
 * 사용 예:
 *   const { save, get, hasSession } = useSessionToken()
 *   save('aB3kX7', { token: '...', participantId: 1, name: '김민수' })
 *   const session = get('aB3kX7')
 *   if (hasSession('aB3kX7')) { ... }
 */
export interface SessionData {
    token: string
    participantId: number
    name: string
}

export function useSessionToken() {
    const KEY_PREFIX = 'moim_session_'

    /** 세션 저장 (참여 완료 시 호출) */
    function save(shareCode: string, data: SessionData): void {
        try {
            localStorage.setItem(KEY_PREFIX + shareCode, JSON.stringify(data))
        } catch {
            console.warn('[useSessionToken] localStorage 저장 실패')
        }
    }

    /** 세션 조회. 없거나 파싱 실패 시 null */
    function get(shareCode: string): SessionData | null {
        try {
            const raw = localStorage.getItem(KEY_PREFIX + shareCode)
            if (!raw) return null
            return JSON.parse(raw) as SessionData
        } catch {
            return null
        }
    }

    /** 세션 삭제 */
    function remove(shareCode: string): void {
        try {
            localStorage.removeItem(KEY_PREFIX + shareCode)
        } catch {
            // ignore
        }
    }

    /** 이미 이 모임에 참여했는지 여부 */
    function hasSession(shareCode: string): boolean {
        return get(shareCode) !== null
    }

    return { save, get, remove, hasSession }
}