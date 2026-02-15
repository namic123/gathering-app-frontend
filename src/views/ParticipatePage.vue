<template>
  <div class="max-w-lg mx-auto px-4 pt-4">

    <!-- ========================================
         로딩 상태: 모임 정보를 서버에서 가져오는 중
         ======================================== -->
    <div v-if="loading" class="text-center py-20">
      <p class="text-gray-400">불러오는 중...</p>
    </div>

    <!-- ========================================
         에러 상태: 모임을 찾을 수 없거나 서버 오류
         ======================================== -->
    <div v-else-if="error" class="text-center py-20">
      <span class="text-4xl block mb-4">😢</span>
      <h1 class="text-xl font-bold mb-2">모임을 찾을 수 없어요</h1>
      <p class="text-gray-500 mb-6">{{ error }}</p>
      <router-link to="/" class="text-primary-500 font-semibold">홈으로 돌아가기</router-link>
    </div>

    <!-- ========================================
         투표 마감 / 확정 상태: 이미 종료된 모임
         ======================================== -->
    <div v-else-if="gathering && gathering.status !== 'VOTING'" class="text-center py-20">
      <span class="text-4xl block mb-4">
        {{ gathering.status === 'CONFIRMED' ? '🎉' : gathering.status === 'TIEBREAK' ? '⚖️' : '⏰' }}
      </span>
      <h1 class="text-xl font-bold mb-2">
        {{ statusMessage }}
      </h1>
      <router-link
          v-if="gathering.status === 'CONFIRMED'"
          :to="`/g/${shareCode}/result`"
          class="inline-block mt-4 px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl"
      >
        결과 보기
      </router-link>
      <router-link
          v-if="gathering.status === 'TIEBREAK' && isAdmin"
          :to="`/g/${shareCode}/tiebreak`"
          class="inline-block mt-4 px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl"
      >
        동점 해소하기
      </router-link>
    </div>

    <!-- ========================================
         이미 참여 완료: 투표 변경 또는 현황 확인 안내
         ======================================== -->
    <div v-else-if="alreadyVoted && !isEditing" class="py-8">
      <!-- 모임 정보 카드 -->
      <GatheringInfoCard :gathering="gathering!" />

      <div class="bg-white rounded-xl p-6 shadow-sm text-center mt-4">
        <span class="text-3xl block mb-3">✅</span>
        <h2 class="text-lg font-bold mb-1">투표 완료!</h2>
        <p class="text-sm text-gray-500 mb-4">
          <strong>{{ existingSession?.name }}</strong>님으로 참여했습니다.
        </p>

        <div class="flex gap-2">
          <button
              class="flex-1 py-3 bg-white border border-gray-200 rounded-xl font-semibold
                   hover:bg-gray-50 transition text-sm"
              @click="isEditing = true"
          >
            투표 변경
          </button>
          <router-link
              :to="`/g/${shareCode}/votes`"
              class="flex-1 py-3 bg-primary-500 text-white rounded-xl font-semibold
                   hover:bg-primary-600 transition text-sm text-center"
          >
            투표 현황 보기
          </router-link>
        </div>
      </div>
    </div>

    <!-- ========================================
         투표 폼: 닉네임 입력 + 후보 선택
         isEditing=true이면 투표 변경 모드
         ======================================== -->
    <div v-else-if="gathering">
      <!-- 모임 정보 카드 -->
      <GatheringInfoCard :gathering="gathering" />

      <form @submit.prevent="handleSubmit" class="mt-6">

        <!-- 닉네임 입력 (신규 참여 시만 표시, 변경 모드에서는 숨김) -->
        <div v-if="!isEditing" class="mb-6">
          <label class="block text-sm font-semibold text-gray-500 mb-1">닉네임 *</label>
          <input
              v-model="name"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-base
                   focus:outline-none focus:border-primary-500 transition placeholder:text-gray-300"
              placeholder="투표에 사용할 이름"
              maxlength="30"
          />
        </div>

        <!-- 투표 변경 모드 안내 -->
        <div v-if="isEditing" class="mb-4 p-3 bg-primary-50 rounded-xl">
          <p class="text-sm text-primary-700 font-semibold">
            🔄 {{ existingSession?.name }}님의 투표를 변경합니다
          </p>
        </div>

        <!-- ==========================================
             시간 후보 선택 (TIME_ONLY, BOTH 타입일 때)
             복수 선택 가능: 가능한 시간을 모두 체크
             ========================================== -->
        <div v-if="gathering.type !== 'PLACE_ONLY'" class="mb-6">
          <h3 class="text-base font-bold mb-3">🕐 가능한 시간을 모두 선택하세요</h3>

          <div class="space-y-2">
            <button
                v-for="tc in gathering.timeCandidates"
                :key="tc.id"
                type="button"
                class="w-full flex items-center gap-3 p-4 rounded-xl border-2 transition text-left"
                :class="selectedTimeIds.has(tc.id)
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 bg-white hover:border-gray-300'"
                @click="toggleTime(tc.id)"
            >
              <!-- 체크 표시 -->
              <span
                  class="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition"
                  :class="selectedTimeIds.has(tc.id)
                  ? 'border-primary-500 bg-primary-500 text-white'
                  : 'border-gray-300'"
              >
                <span v-if="selectedTimeIds.has(tc.id)" class="text-xs">✓</span>
              </span>

              <!-- 시간 정보 -->
              <div class="flex-1">
                <p class="text-sm font-semibold">
                  {{ formatDate(tc.date) }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ tc.startTime }}{{ tc.endTime ? ' ~ ' + tc.endTime : '' }}
                </p>
              </div>

              <!-- 현재 득표수 (투표 변경 모드 또는 이미 투표된 후보) -->
              <span
                  v-if="tc.voteCount > 0"
                  class="text-xs text-gray-400 font-medium"
              >
                {{ tc.voteCount }}명
              </span>
            </button>
          </div>
        </div>

        <!-- ==========================================
             장소 후보 선택 (PLACE_ONLY, BOTH 타입일 때)
             복수 선택 가능: 가능한 장소를 모두 체크
             ========================================== -->
        <div v-if="gathering.type !== 'TIME_ONLY'" class="mb-6">
          <h3 class="text-base font-bold mb-3">📍 가능한 장소를 모두 선택하세요</h3>

          <div class="space-y-2">
            <button
                v-for="pc in gathering.placeCandidates"
                :key="pc.id"
                type="button"
                class="w-full flex items-center gap-3 p-4 rounded-xl border-2 transition text-left"
                :class="selectedPlaceIds.has(pc.id)
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 bg-white hover:border-gray-300'"
                @click="togglePlace(pc.id)"
            >
              <span
                  class="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition"
                  :class="selectedPlaceIds.has(pc.id)
                  ? 'border-primary-500 bg-primary-500 text-white'
                  : 'border-gray-300'"
              >
                <span v-if="selectedPlaceIds.has(pc.id)" class="text-xs">✓</span>
              </span>

              <div class="flex-1">
                <p class="text-sm font-semibold">{{ pc.name }}</p>
                <!-- 메모가 있으면 서브텍스트로 표시 -->
                <p v-if="pc.memo" class="text-xs text-gray-500">{{ pc.memo }}</p>
                <!-- 지도 링크가 있으면 외부 링크 -->

                v-if="pc.mapLink"
                :href="pc.mapLink"
                target="_blank"
                class="text-xs text-primary-500 hover:underline"
                @click.stop
                >
                지도 보기 ↗
                </a>
              </div>

              <span
                  v-if="pc.voteCount > 0"
                  class="text-xs text-gray-400 font-medium"
              >
                {{ pc.voteCount }}명
              </span>
            </button>
          </div>
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
          {{ submitButtonText }}
        </button>

        <!-- 투표 변경 모드: 취소 버튼 -->
        <button
            v-if="isEditing"
            type="button"
            class="w-full mt-2 py-3 text-gray-500 font-semibold text-sm"
            @click="cancelEdit"
        >
          취소
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import { getGathering, participate, updateVote } from '@/api'
import { useSessionToken } from '@/composables/useSessionToken'
import { useAdminToken } from '@/composables/useAdminToken'
import GatheringInfoCard from '@/components/GatheringInfoCard.vue'
import type { GatheringDetail } from '@/types'

dayjs.locale('ko')

// ========== Props & Route ==========

const props = defineProps<{ shareCode: string }>()
const route = useRoute();

// ========== Composables ==========

const { save: saveSession, get: getSession, hasSession } = useSessionToken()
const { isAdmin: checkAdmin } = useAdminToken()

// ========== 상태 ==========

/** 서버에서 가져온 모임 상세 데이터 */
const gathering = ref<GatheringDetail | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

/** 투표 폼 입력 */
const name = ref('')
const selectedTimeIds = ref<Set<number>>(new Set())
const selectedPlaceIds = ref<Set<number>>(new Set())

/** 제출 상태 */
const submitting = ref(false)
const submitError = ref('')

/** 투표 변경 모드 여부 */
const isEditing = ref(false)

// ========== Computed ==========

/** 이미 이 모임에 투표했는지 (localStorage에 세션 토큰 존재) */
const alreadyVoted = computed(() => hasSession(props.shareCode))

/** 기존 세션 데이터 (투표 변경 시 사용) */
const existingSession = computed(() => getSession(props.shareCode))

/** 현재 사용자가 이 모임의 주최자인지 */
const isAdmin = computed(() => checkAdmin(props.shareCode))

/**
 * 폼 유효성 검사.
 * - 신규: 닉네임 필수 + 최소 1개 후보 선택
 * - 변경: 최소 1개 후보 선택만 필요 (닉네임은 이미 있음)
 */
const isFormValid = computed(() => {
  const hasName = isEditing.value || name.value.trim().length > 0

  const needTime = gathering.value?.type !== 'PLACE_ONLY'
  const needPlace = gathering.value?.type !== 'TIME_ONLY'

  const timeOk = !needTime || selectedTimeIds.value.size > 0
  const placeOk = !needPlace || selectedPlaceIds.value.size > 0

  return hasName && (timeOk || placeOk)
})

/** 제출 버튼 텍스트 (상태에 따라 변경) */
const submitButtonText = computed(() => {
  if (submitting.value) return '처리 중...'
  if (isEditing.value) return '투표 변경하기'
  return '투표하기'
})

/**
 * 마감/확정 등 투표 불가 상태 메시지.
 * 상태별로 다른 안내 문구를 표시.
 */
const statusMessage = computed(() => {
  switch (gathering.value?.status) {
    case 'CONFIRMED': return '일정이 확정되었습니다!'
    case 'TIEBREAK': return '동점이 발생했습니다. 주최자의 선택을 기다려주세요.'
    case 'EXPIRED': return '투표 없이 마감되었습니다.'
    default: return '투표가 마감되었습니다.'
  }
})

// ========== 후보 선택 토글 ==========

/**
 * 시간 후보 선택/해제 토글.
 * Set을 직접 변경하면 Vue가 반응성을 감지하지 못하므로
 * new Set()으로 교체하여 참조를 변경한다.
 */
function toggleTime(id: number) {
  const next = new Set(selectedTimeIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  selectedTimeIds.value = next
}

function togglePlace(id: number) {
  const next = new Set(selectedPlaceIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  selectedPlaceIds.value = next
}

// ========== 날짜 포맷 ==========

/** "2026-03-07" → "3월 7일 (토)" */
function formatDate(dateStr: string): string {
  return dayjs(dateStr).format('M월 D일 (ddd)')
}

// ========== 데이터 로드 ==========

/** 모임 상세 정보를 서버에서 가져온다 */
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

// ========== 제출 ==========

async function handleSubmit() {
  if (!isFormValid.value || submitting.value) return
  submitting.value = true
  submitError.value = ''

  try {
    const timeIds = Array.from(selectedTimeIds.value)
    const placeIds = Array.from(selectedPlaceIds.value)

    if (isEditing.value) {
      // ========== 투표 변경 ==========
      // 기존 세션 토큰을 X-Session-Token 헤더에 담아서 전송
      const session = existingSession.value!
      await updateVote(props.shareCode, {
        name: session.name,
        timeCandidateIds: timeIds,
        placeCandidateIds: placeIds
      }, session.token)

      // 변경 완료 → 편집 모드 종료 + 모임 데이터 리프레시
      isEditing.value = false
      await fetchGathering()
    } else {
      // ========== 신규 참여 + 투표 ==========
      const { data } = await participate(props.shareCode, {
        name: name.value.trim(),
        timeCandidateIds: timeIds,
        placeCandidateIds: placeIds
      })

      // 세션 토큰을 localStorage에 저장 (투표 변경 시 필요)
      saveSession(props.shareCode, {
        token: data.sessionToken,
        participantId: data.participantId,
        name: name.value.trim()
      })

      // 모임 데이터 리프레시 (득표수 갱신)
      await fetchGathering()
    }
  } catch (err: any) {
    submitError.value = err.userMessage || '투표에 실패했습니다.'
  } finally {
    submitting.value = false
  }
}

/** 투표 변경 모드 취소 → 완료 상태로 복귀 */
function cancelEdit() {
  isEditing.value = false
  selectedTimeIds.value = new Set()
  selectedPlaceIds.value = new Set()
}

// ========== 라이프사이클 ==========

onMounted(() => {
  fetchGathering()
})
</script>