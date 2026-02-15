<template>
  <div class="max-w-lg mx-auto px-4 pt-4">

    <!-- 로딩 -->
    <div v-if="loading" class="text-center py-20">
      <p class="text-gray-400">불러오는 중...</p>
    </div>

    <!-- 권한 없음: 주최자가 아닌 사용자가 접근 -->
    <div v-else-if="!isAdmin" class="text-center py-20">
      <span class="text-4xl block mb-4">🔒</span>
      <h1 class="text-xl font-bold mb-2">주최자만 접근 가능합니다</h1>
      <p class="text-gray-500 mb-6">이 기기에 주최자 권한이 없습니다.</p>
      <router-link
          :to="`/g/${shareCode}`"
          class="text-primary-500 font-semibold"
      >
        투표 화면으로
      </router-link>
    </div>

    <!-- 에러 -->
    <div v-else-if="error" class="text-center py-20">
      <span class="text-4xl block mb-4">😢</span>
      <p class="text-gray-500">{{ error }}</p>
    </div>

    <!-- ========================================
         대시보드 메인
         ======================================== -->
    <div v-else-if="gathering">

      <!-- 모임 정보 카드 -->
      <GatheringInfoCard :gathering="gathering" />

      <!-- ========================================
           빠른 액션 버튼들
           ======================================== -->
      <div class="mt-4 grid grid-cols-2 gap-2">
        <!-- 공유 링크 복사 -->
        <button
            class="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200
                 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
            @click="copyShareLink"
        >
          {{ copied ? '복사됨 ✓' : '🔗 링크 복사' }}
        </button>

        <!-- 투표 현황 페이지 이동 -->
        <router-link
            :to="`/g/${shareCode}/votes`"
            class="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200
                 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
        >
          📊 투표 현황
        </router-link>
      </div>

      <!-- ========================================
           수동 확정 섹션 (VOTING 상태일 때만)
           주최자가 마감 전에도 직접 확정 가능
           ======================================== -->
      <div
          v-if="gathering.status === 'VOTING'"
          class="mt-6 bg-white rounded-xl p-5 shadow-sm"
      >
        <h2 class="text-base font-bold mb-1">⚡ 수동 확정</h2>
        <p class="text-xs text-gray-500 mb-4">
          투표 마감 전이라도 직접 결과를 확정할 수 있습니다.
        </p>

        <!-- 시간 후보 선택 (TIME_ONLY, BOTH) -->
        <div v-if="gathering.type !== 'PLACE_ONLY'" class="mb-4">
          <label class="block text-sm font-semibold text-gray-500 mb-2">시간 선택</label>
          <div class="space-y-1.5">
            <button
                v-for="tc in gathering.timeCandidates"
                :key="tc.id"
                type="button"
                class="w-full text-left px-3 py-2.5 rounded-lg border transition text-sm"
                :class="selectedTimeCandidateId === tc.id
                ? 'border-primary-500 bg-primary-50 font-semibold'
                : 'border-gray-200 hover:border-gray-300'"
                @click="selectedTimeCandidateId = tc.id"
            >
              {{ formatDate(tc.date) }} {{ tc.startTime }}{{ tc.endTime ? '~' + tc.endTime : '' }}
              <span class="text-gray-400 ml-1">({{ tc.voteCount }}표)</span>
            </button>
          </div>
        </div>

        <!-- 장소 후보 선택 (PLACE_ONLY, BOTH) -->
        <div v-if="gathering.type !== 'TIME_ONLY'" class="mb-4">
          <label class="block text-sm font-semibold text-gray-500 mb-2">장소 선택</label>
          <div class="space-y-1.5">
            <button
                v-for="pc in gathering.placeCandidates"
                :key="pc.id"
                type="button"
                class="w-full text-left px-3 py-2.5 rounded-lg border transition text-sm"
                :class="selectedPlaceCandidateId === pc.id
                ? 'border-primary-500 bg-primary-50 font-semibold'
                : 'border-gray-200 hover:border-gray-300'"
                @click="selectedPlaceCandidateId = pc.id"
            >
              {{ pc.name }}
              <span class="text-gray-400 ml-1">({{ pc.voteCount }}표)</span>
            </button>
          </div>
        </div>

        <!-- 확정 에러 -->
        <p v-if="confirmError" class="text-sm text-danger text-center mb-3">
          {{ confirmError }}
        </p>

        <!-- 확정 버튼 -->
        <button
            class="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300
                 text-white font-semibold rounded-xl transition"
            :disabled="!canConfirm || confirming"
            @click="handleConfirm"
        >
          {{ confirming ? '확정 중...' : '선택한 후보로 확정하기' }}
        </button>
      </div>

      <!-- ========================================
           이미 확정된 경우 → 결과 보기 링크
           ======================================== -->
      <div
          v-if="gathering.status === 'CONFIRMED'"
          class="mt-6 bg-green-50 rounded-xl p-5 text-center"
      >
        <span class="text-3xl block mb-2">🎉</span>
        <p class="text-sm font-semibold text-green-700 mb-3">일정이 확정되었습니다</p>
        <router-link
            :to="`/g/${shareCode}/result`"
            class="inline-block px-6 py-2.5 bg-green-600 text-white font-semibold rounded-xl
                 hover:bg-green-700 transition text-sm"
        >
          결과 보기
        </router-link>
      </div>

      <!-- ========================================
           동점 상태 → 동점 해소 페이지 이동
           ======================================== -->
      <div
          v-if="gathering.status === 'TIEBREAK'"
          class="mt-6 bg-yellow-50 rounded-xl p-5 text-center"
      >
        <span class="text-3xl block mb-2">⚖️</span>
        <p class="text-sm font-semibold text-yellow-700 mb-3">동점이 발생했습니다</p>
        <router-link
            :to="`/g/${shareCode}/tiebreak`"
            class="inline-block px-6 py-2.5 bg-yellow-600 text-white font-semibold rounded-xl
                 hover:bg-yellow-700 transition text-sm"
        >
          동점 해소하기
        </router-link>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import { getGathering, confirmGathering } from '@/api'
import { useAdminToken } from '@/composables/useAdminToken'
import GatheringInfoCard from '@/components/GatheringInfoCard.vue'
import type { GatheringDetail } from '@/types'

dayjs.locale('ko')

// ========== Props ==========

const props = defineProps<{ shareCode: string }>()
const router = useRouter()

// ========== 상태 ==========

const gathering = ref<GatheringDetail | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

/** 수동 확정용 선택 상태 */
const selectedTimeCandidateId = ref<number | null>(null)
const selectedPlaceCandidateId = ref<number | null>(null)
const confirming = ref(false)
const confirmError = ref('')

/** 링크 복사 피드백 */
const copied = ref(false)

// ========== 주최자 권한 ==========

const { isAdmin: checkAdmin, get: getAdminToken } = useAdminToken()
const isAdmin = computed(() => checkAdmin(props.shareCode))

// ========== Computed ==========

/**
 * 확정 버튼 활성화 조건.
 * 모임 타입에 따라 시간/장소/둘 다 선택해야 함.
 */
const canConfirm = computed(() => {
  if (!gathering.value) return false
  const type = gathering.value.type

  const timeOk = type === 'PLACE_ONLY' || selectedTimeCandidateId.value !== null
  const placeOk = type === 'TIME_ONLY' || selectedPlaceCandidateId.value !== null

  return timeOk && placeOk
})

// ========== 데이터 조회 ==========

async function fetchGathering() {
  try {
    const { data } = await getGathering(props.shareCode)
    gathering.value = data
  } catch (err: any) {
    error.value = err.userMessage || '모임을 불러올 수 없습니다.'
  } finally {
    loading.value = false
  }
}

// ========== 수동 확정 ==========

async function handleConfirm() {
  if (!canConfirm.value || confirming.value) return
  confirming.value = true
  confirmError.value = ''

  try {
    const adminToken = getAdminToken(props.shareCode)!

    await confirmGathering(
        props.shareCode,
        {
          timeCandidateId: selectedTimeCandidateId.value,
          placeCandidateId: selectedPlaceCandidateId.value
        },
        adminToken
    )

    // 확정 성공 → 결과 페이지로 이동
    router.push(`/g/${props.shareCode}/result`)
  } catch (err: any) {
    confirmError.value = err.userMessage || '확정에 실패했습니다.'
  } finally {
    confirming.value = false
  }
}

// ========== 유틸 ==========

function formatDate(dateStr: string): string {
  return dayjs(dateStr).format('M월 D일 (ddd)')
}

async function copyShareLink() {
  const url = `${window.location.origin}/g/${props.shareCode}`
  try {
    await navigator.clipboard.writeText(url)
  } catch {
    // 폴백: 임시 input 생성
    const input = document.createElement('input')
    input.value = url
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
  }
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

// ========== 라이프사이클 ==========

onMounted(() => {
  fetchGathering()
})
</script>