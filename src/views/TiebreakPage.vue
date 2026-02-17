<template>
  <div class="max-w-lg mx-auto px-4 pt-4">

    <!-- 로딩 -->
    <div v-if="loading" class="text-center py-20">
      <p class="text-gray-400">불러오는 중...</p>
    </div>

    <!-- 에러 -->
    <div v-else-if="error" class="text-center py-20">
      <span class="text-4xl block mb-4">😢</span>
      <h1 class="text-xl font-bold mb-2">오류가 발생했어요</h1>
      <p class="text-gray-500 mb-6">{{ error }}</p>
      <router-link :to="`/g/${shareCode}`" class="text-primary-500 font-semibold">
        모임으로 돌아가기
      </router-link>
    </div>

    <!-- 주최자가 아닌 경우 -->
    <div v-else-if="!isAdmin" class="text-center py-20">
      <span class="text-4xl block mb-4">🔒</span>
      <h1 class="text-xl font-bold mb-2">주최자만 접근할 수 있어요</h1>
      <p class="text-gray-500 mb-6">동점 해소는 주최자 기기에서만 가능합니다.</p>
      <router-link :to="`/g/${shareCode}/votes`" class="text-primary-500 font-semibold">
        투표 현황 보기
      </router-link>
    </div>

    <!-- TIEBREAK가 아닌 상태 -->
    <div v-else-if="gathering && gathering.status !== 'TIEBREAK'" class="text-center py-20">
      <span class="text-4xl block mb-4">
        {{ gathering.status === 'CONFIRMED' ? '🎉' : '📊' }}
      </span>
      <h1 class="text-xl font-bold mb-2">
        {{ gathering.status === 'CONFIRMED' ? '이미 확정되었습니다' : '현재 동점 상태가 아닙니다' }}
      </h1>
      <router-link
          v-if="gathering.status === 'CONFIRMED'"
          :to="`/g/${shareCode}/result`"
          class="inline-block mt-4 px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl"
      >
        결과 보기
      </router-link>
    </div>

    <!-- ========================================
         동점 해소 폼: 동점 후보 중 하나 선택
         ======================================== -->
    <div v-else-if="gathering">
      <div class="text-center mb-6">
        <span class="text-4xl block mb-3">⚖️</span>
        <h1 class="text-xl font-extrabold mb-1">동점이 발생했습니다</h1>
        <p class="text-sm text-gray-500">
          득표수가 같은 후보가 있습니다.<br />
          주최자로서 최종 선택을 해주세요.
        </p>
      </div>

      <!-- 모임 정보 -->
      <GatheringInfoCard :gathering="gathering" />

      <form @submit.prevent="handleSubmit" class="mt-6">

        <!-- ==========================================
             시간 동점 후보 선택 (TIME_ONLY, BOTH)
             동점인 후보만 필터링하여 표시
             ========================================== -->
        <div v-if="tiedTimeCandidates.length > 0" class="mb-6">
          <h3 class="text-base font-bold mb-1">🕐 시간 후보 선택</h3>
          <p class="text-xs text-gray-500 mb-3">
            {{ tiedTimeCandidates.length }}개 후보가 {{ topTimeVoteCount }}표로 동점
          </p>

          <div class="space-y-2">
            <button
                v-for="tc in tiedTimeCandidates"
                :key="tc.id"
                type="button"
                class="w-full flex items-center gap-3 p-4 rounded-xl border-2 transition text-left"
                :class="selectedTimeId === tc.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 bg-white hover:border-gray-300'"
                @click="selectedTimeId = tc.id"
            >
              <!-- 라디오 표시 (단일 선택) -->
              <span
                  class="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition"
                  :class="selectedTimeId === tc.id
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-gray-300'"
              >
                <span
                    v-if="selectedTimeId === tc.id"
                    class="w-2.5 h-2.5 bg-white rounded-full"
                ></span>
              </span>

              <div class="flex-1">
                <p class="text-sm font-semibold">{{ formatDate(tc.date) }}</p>
                <p class="text-xs text-gray-500">
                  {{ tc.startTime }}{{ tc.endTime ? ' ~ ' + tc.endTime : '' }}
                </p>
              </div>

              <span class="text-xs text-gray-400 font-medium">{{ tc.voteCount }}표</span>
            </button>
          </div>
        </div>

        <!-- ==========================================
             장소 동점 후보 선택 (PLACE_ONLY, BOTH)
             ========================================== -->
        <div v-if="tiedPlaceCandidates.length > 0" class="mb-6">
          <h3 class="text-base font-bold mb-1">📍 장소 후보 선택</h3>
          <p class="text-xs text-gray-500 mb-3">
            {{ tiedPlaceCandidates.length }}개 후보가 {{ topPlaceVoteCount }}표로 동점
          </p>

          <div class="space-y-2">
            <button
                v-for="pc in tiedPlaceCandidates"
                :key="pc.id"
                type="button"
                class="w-full flex items-center gap-3 p-4 rounded-xl border-2 transition text-left"
                :class="selectedPlaceId === pc.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 bg-white hover:border-gray-300'"
                @click="selectedPlaceId = pc.id"
            >
              <span
                  class="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition"
                  :class="selectedPlaceId === pc.id
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-gray-300'"
              >
                <span
                    v-if="selectedPlaceId === pc.id"
                    class="w-2.5 h-2.5 bg-white rounded-full"
                ></span>
              </span>

              <div class="flex-1">
                <p class="text-sm font-semibold">{{ pc.name }}</p>
                <p v-if="pc.memo" class="text-xs text-gray-500">{{ pc.memo }}</p>

                v-if="pc.mapLink"
                :href="pc.mapLink"
                target="_blank"
                class="text-xs text-primary-500 hover:underline"
                @click.stop
                >
                지도 보기 ↗
                </a>
              </div>

              <span class="text-xs text-gray-400 font-medium">{{ pc.voteCount }}표</span>
            </button>
          </div>
        </div>

        <!-- 비동점 후보 안내 (단독 1위는 자동 선택됨) -->
        <div v-if="autoSelectedTimeText || autoSelectedPlaceText" class="mb-6 p-4 bg-gray-50 rounded-xl">
          <p class="text-sm text-gray-600 font-semibold mb-1">자동 선택된 후보</p>
          <p v-if="autoSelectedTimeText" class="text-sm text-gray-500">
            🕐 {{ autoSelectedTimeText }}
          </p>
          <p v-if="autoSelectedPlaceText" class="text-sm text-gray-500">
            📍 {{ autoSelectedPlaceText }}
          </p>
        </div>

        <!-- 에러 메시지 -->
        <p v-if="submitError" class="text-sm text-danger text-center mb-4">
          {{ submitError }}
        </p>

        <!-- 제출 버튼 -->
        <button
            type="submit"
            class="w-full py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300
                 text-white font-semibold text-lg rounded-xl transition"
            :disabled="!isFormValid || submitting"
        >
          {{ submitting ? '확정 중...' : '이 후보로 확정하기' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import { getGathering, getVoteSummary, resolveTiebreak } from '@/api'
import { useAdminToken } from '@/composables/useAdminToken'
import GatheringInfoCard from '@/components/GatheringInfoCard.vue'
import type { GatheringDetail, VoteSummaryResponse, TimeCandidateDetail, PlaceCandidateDetail } from '@/types'

dayjs.locale('ko')

// ========== Props & Router ==========

const props = defineProps<{ shareCode: string }>()
const router = useRouter()

// ========== Composables ==========

const { get: getAdminToken, isAdmin: checkAdmin } = useAdminToken()

// ========== 상태 ==========

const gathering = ref<GatheringDetail | null>(null)
const voteSummary = ref<VoteSummaryResponse | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

/** 선택된 후보 ID (단일 선택: 라디오 버튼 방식) */
const selectedTimeId = ref<number | null>(null)
const selectedPlaceId = ref<number | null>(null)

const submitting = ref(false)
const submitError = ref('')

// ========== Computed ==========

const isAdmin = computed(() => checkAdmin(props.shareCode))

/**
 * 시간 후보 중 동점인 것만 필터링.
 *
 * 알고리즘:
 * 1. voteSummary에서 시간 후보별 득표수 가져오기
 * 2. 최대 득표수 계산
 * 3. 최대 득표수를 가진 후보가 2개 이상이면 → 동점
 * 4. gathering의 timeCandidates에서 동점 ID만 필터링
 */
const topTimeVoteCount = computed(() => {
  if (!voteSummary.value) return 0
  const votes = voteSummary.value.timeCandidateVotes
  if (votes.length === 0) return 0
  return Math.max(...votes.map(v => v.voteCount))
})

const tiedTimeCandidates = computed(() => {
  if (!gathering.value || !voteSummary.value) return []

  const votes = voteSummary.value.timeCandidateVotes
  const maxVotes = topTimeVoteCount.value
  if (maxVotes === 0) return []

  // 최대 득표수를 가진 후보 ID 수집
  const tiedIds = votes
      .filter(v => v.voteCount === maxVotes)
      .map(v => v.candidateId)

  // 동점이 아니면 (1개만 1위) 빈 배열 반환 → 자동 선택 안내로 표시
  if (tiedIds.length <= 1) return []

  return gathering.value.timeCandidates.filter(tc => tiedIds.includes(tc.id))
})

/** 장소 동점 후보 (위와 동일 로직) */
const topPlaceVoteCount = computed(() => {
  if (!voteSummary.value) return 0
  const votes = voteSummary.value.placeCandidateVotes
  if (votes.length === 0) return 0
  return Math.max(...votes.map(v => v.voteCount))
})

const tiedPlaceCandidates = computed(() => {
  if (!gathering.value || !voteSummary.value) return []

  const votes = voteSummary.value.placeCandidateVotes
  const maxVotes = topPlaceVoteCount.value
  if (maxVotes === 0) return []

  const tiedIds = votes
      .filter(v => v.voteCount === maxVotes)
      .map(v => v.candidateId)

  if (tiedIds.length <= 1) return []

  return gathering.value.placeCandidates.filter(pc => tiedIds.includes(pc.id))
})

/**
 * 단독 1위인 후보 (동점이 아닌 쪽)의 텍스트.
 * BOTH 타입에서 시간만 동점이고 장소는 단독 1위인 경우 등에 사용.
 */
const autoSelectedTimeText = computed(() => {
  if (!gathering.value || gathering.value.type === 'PLACE_ONLY') return ''
  if (tiedTimeCandidates.value.length > 0) return '' // 동점이면 자동 선택 아님

  // 단독 1위 찾기
  if (!voteSummary.value) return ''
  const votes = voteSummary.value.timeCandidateVotes
  if (votes.length === 0) return ''
  const maxVotes = Math.max(...votes.map(v => v.voteCount))
  const topVote = votes.find(v => v.voteCount === maxVotes)
  if (!topVote) return ''

  const tc = gathering.value.timeCandidates.find(t => t.id === topVote.candidateId)
  if (!tc) return ''
  return `${formatDate(tc.date)} ${tc.startTime}${tc.endTime ? ' ~ ' + tc.endTime : ''} (${topVote.voteCount}표, 단독 1위)`
})

const autoSelectedPlaceText = computed(() => {
  if (!gathering.value || gathering.value.type === 'TIME_ONLY') return ''
  if (tiedPlaceCandidates.value.length > 0) return ''

  if (!voteSummary.value) return ''
  const votes = voteSummary.value.placeCandidateVotes
  if (votes.length === 0) return ''
  const maxVotes = Math.max(...votes.map(v => v.voteCount))
  const topVote = votes.find(v => v.voteCount === maxVotes)
  if (!topVote) return ''

  const pc = gathering.value.placeCandidates.find(p => p.id === topVote.candidateId)
  if (!pc) return ''
  return `${pc.name} (${topVote.voteCount}표, 단독 1위)`
})

/**
 * 폼 유효성: 동점인 카테고리에서 반드시 하나를 선택해야 함.
 * 동점이 아닌 카테고리는 서버가 자동으로 단독 1위를 선택.
 */
const isFormValid = computed(() => {
  const needTimeSelection = tiedTimeCandidates.value.length > 0
  const needPlaceSelection = tiedPlaceCandidates.value.length > 0

  const timeOk = !needTimeSelection || selectedTimeId.value !== null
  const placeOk = !needPlaceSelection || selectedPlaceId.value !== null

  return timeOk && placeOk
})

// ========== 날짜 포맷 ==========

function formatDate(dateStr: string): string {
  return dayjs(dateStr).format('M월 D일 (ddd)')
}

// ========== 데이터 로드 ==========

onMounted(async () => {
  if (!isAdmin.value) {
    loading.value = false
    return
  }

  try {
    const [gatheringRes, voteRes] = await Promise.all([
      getGathering(props.shareCode),
      getVoteSummary(props.shareCode)
    ])
    gathering.value = gatheringRes.data
    voteSummary.value = voteRes.data
  } catch (err: any) {
    error.value = err.userMessage || '데이터를 불러올 수 없습니다.'
  } finally {
    loading.value = false
  }
})

// ========== 제출 ==========

async function handleSubmit() {
  if (!isFormValid.value || submitting.value) return
  submitting.value = true
  submitError.value = ''

  try {
    const adminToken = getAdminToken(props.shareCode)!

    await resolveTiebreak(
        props.shareCode,
        {
          timeCandidateId: selectedTimeId.value,
          placeCandidateId: selectedPlaceId.value
        },
        adminToken
    )

    // 확정 완료 → 결과 페이지로 이동
    router.push(`/g/${props.shareCode}/result`)
  } catch (err: any) {
    submitError.value = err.userMessage || '동점 해소에 실패했습니다.'
  } finally {
    submitting.value = false
  }
}
</script>