/**
 * 주최자 관리 토큰 composable.
 *
 * localStorage 키: moim_admin_{shareCode}
 * shareCode별로 관리하여 여러 모임의 토큰을 동시 보관 가능.
 */
export function useAdminToken() {
    const KEY_PREFIX = 'moim_admin_'

    function save(shareCode: string, token: string): void {
        try {
            localStorage.setItem(KEY_PREFIX + shareCode, token)
        } catch {
            console.warn('[useAdminToken] localStorage 저장 실패')
        }
    }

    function get(shareCode: string): string | null {
        try {
            return localStorage.getItem(KEY_PREFIX + shareCode)
        } catch {
            return null
        }
    }

    function remove(shareCode: string): void {
        try {
            localStorage.removeItem(KEY_PREFIX + shareCode)
        } catch {
            // ignore
        }
    }

    function isAdmin(shareCode: string): boolean {
        return get(shareCode) !== null
    }

    return { save, get, remove, isAdmin }
}