<template>
  <div class="max-w-lg mx-auto px-4 pt-4">

    <!-- 로딩 -->
    <div v-if="loading" class="text-center py-20">
      <p class="text-gray-400">불러오는 중...</p>
    </div>

    <!-- 에러 -->
    <div v-else-if="error" class="text-center py-20">
      <span class="text-4xl block mb-4">😢</span>
      <p class="text-gray-500">{{ error }}</p>
    </div>

    <!-- 콘텐츠 -->
    <div v-else-if="gathering && summary">

      <!-- 모임 정보 카드 -->
      <GatheringInfoCard :gathering="gathering" />

      <!-- ========================================
           참여자 요약: 총 인원 + 이름 목록
           ======================================== -->
      <div class="mt-4 bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-sm font-bold text-gray-700">
            참여자 {{ summary.participantCount }}명
          </h2>
          <!-- 자동 갱신 표시: 폴링이 활성화되어 있음을 나타냄 -->
          <span class="text-xs text-gray-400">자동 갱신 중</span>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <span
              v-for="pName in summary.participantNames"
              :key="pName"
              class="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600"
          >
            {{ pName }}
          </span>
          <!-- 아직 참여자가 없을 때 -->
          <span v-if="summary.participantCount === 0" class="text-xs text-gray-400">
            아직 참여자가 없습니다
          </span>
        </div>
      </div>

      <!-- ========================================
           시간 후보별 득표 현황
           막대 그래프로 시각화 + 투표자 이름 표시
           ======================================== -->
      <div v-if="gathering.type !== 'PLACE_ONLY'" class="mt-6">
        <h2 class="text-base font-bold mb-3">🕐 시간 투표 현황</h2>

        <div class="space-y-3">
          <div
              v-for="tc in gathering.timeCandidates"
              :key="tc.id"
              class="bg-white rounded-xl p-4 shadow-sm"
          >
            <!-- 후보 정보 + 득표수 -->
            <div class="flex items-center justify-between mb-2">
              <div>
                <p class="text-sm font-semibold">{{ formatDate(tc.date) }}</p>
                <p class="text-xs text-gray-500">
                  {{ tc.startTime }}{{ tc.endTime ? ' ~ ' + tc.endTime : '' }}
                </p>
              </div>
              <span class="text-lg font-bold text-primary-500">
                {{ getVoteCount(tc.id, 'time') }}
              </span>
            </div>

            <!--
              득표율 막대 그래프.
              전체 참여자 수 대비 이 후보의 득표 비율을 시각화.
              참여자가 0명이면 width=0 (빈 바).
            -->
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div
                  class="h-full bg-primary-400 rounded-full transition-all duration-500"
                  :style="{ width: getVotePercent(tc.id, 'time') + '%' }"
              ></div>
            </div>

            <!-- 투표자 이름 태그 -->
            <div class="flex flex-wrap gap-1">
              <span
                  v-for="voter in getVoterNames(tc.id, 'time')"
                  :key="voter"
                  class="text-xs px-2 py-0.5 bg-primary-50 text-primary-600 rounded-full"
              >
                {{ voter }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================
           장소 후보별 득표 현황
           ======================================== -->
      <div v-if="gathering.type !== 'TIME_ONLY'" class="mt-6">
        <h2 class="text-base font-bold mb-3">📍 장소 투표 현황</h2>

        <div class="space-y-3">
          <div
              v-for="pc in gathering.placeCandidates"
              :key="pc.id"
              class="bg-white rounded-xl p-4 shadow-sm"
          >
            <div class="flex items-center justify-between mb-2">
              <div>
                <p class="text-sm font-semibold">{{ pc.name }}</p>
                <p v-if="pc.memo" class="text-xs text-gray-500">{{ pc.memo }}</p>
                <div v-if="pc.estCost || pc.travelMin || (pc.moodTags && pc.moodTags.length)" class="flex flex-wrap gap-1 mt-1">
                  <span v-if="pc.estCost" class="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">
                    ~{{ pc.estCost.toLocaleString() }}원
                  </span>
                  <span v-if="pc.travelMin" class="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">
                    이동 {{ pc.travelMin }}분
                  </span>
                  <span v-for="tag in pc.moodTags" :key="tag"
                        class="text-xs px-1.5 py-0.5 bg-primary-50 text-primary-600 rounded">
                    #{{ tag }}
                  </span>
                </div>
              </div>
              <span class="text-lg font-bold text-primary-500">
                {{ getVoteCount(pc.id, 'place') }}
              </span>
            </div>

            <div class="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div
                  class="h-full bg-primary-400 rounded-full transition-all duration-500"
                  :style="{ width: getVotePercent(pc.id, 'place') + '%' }"
              ></div>
            </div>

            <div class="flex flex-wrap gap-1">
              <span
                  v-for="voter in getVoterNames(pc.id, 'place')"
                  :key="voter"
                  class="text-xs px-2 py-0.5 bg-primary-50 text-primary-600 rounded-full"
              >
                {{ voter }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 하단 네비게이션 -->
      <div class="mt-8 flex gap-2">
        <router-link
            :to="`/g/${shareCode}`"
            class="flex-1 py-3 bg-white border border-gray-200 rounded-xl font-semibold
                 hover:bg-gray-50 transition text-sm text-center"
        >
          투표 화면
        </router-link>
        <router-link
            v-if="isAdmin"
            :to="`/g/${shareCode}/dashboard`"
            class="flex-1 py-3 bg-primary-500 text-white rounded-xl font-semibold
                 hover:bg-primary-600 transition text-sm text-center"
        >
          대시보드
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import { getGathering, getVoteSummary } from '@/api'
import { useAdminToken } from '@/composables/useAdminToken'
import GatheringInfoCard from '@/components/GatheringInfoCard.vue'
import type { GatheringDetail, VoteSummaryResponse, CandidateVote } from '@/types'

dayjs.locale('ko')

// ========== Props ==========

const props = defineProps<{ shareCode: string }>()

// ========== 상태 ==========

const gathering = ref<GatheringDetail | null>(null)
const summary = ref<VoteSummaryResponse | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const { isAdmin: checkAdmin } = useAdminToken()
const isAdmin = computed(() => checkAdmin(props.shareCode))

/**
 * 폴링 타이머 ID.
 * 5초마다 투표 현황을 갱신한다.
 * 컴포넌트 언마운트 시 반드시 정리해야 메모리 누수 방지.
 */
let pollTimer: ReturnType<typeof setInterval> | null = null

// ========== 데이터 조회 ==========

/** 모임 정보 + 투표 현황을 동시에 가져온다 */
async function fetchAll() {
  try {
    const [gRes, sRes] = await Promise.all([
      getGathering(props.shareCode),
      getVoteSummary(props.shareCode)
    ])
    gathering.value = gRes.data
    summary.value = sRes.data
  } catch (err: any) {
    error.value = err.userMessage || '데이터를 불러올 수 없습니다.'
  } finally {
    loading.value = false
  }
}

/** 투표 현황만 갱신 (폴링용 — 모임 정보는 안 바뀌므로) */
async function pollSummary() {
  try {
    const { data } = await getVoteSummary(props.shareCode)
    summary.value = data
  } catch {
    // 폴링 실패는 무시 (다음 주기에 재시도)
  }
}

// ========== 헬퍼 함수 ==========

function formatDate(dateStr: string): string {
  return dayjs(dateStr).format('M월 D일 (ddd)')
}

/**
 * 특정 후보의 득표수를 조회한다.
 * summary의 CandidateVote 배열에서 candidateId로 찾는다.
 */
function findCandidateVote(candidateId: number, type: 'time' | 'place'): CandidateVote | undefined {
  const votes = type === 'time'
      ? summary.value?.timeCandidateVotes
      : summary.value?.placeCandidateVotes
  return votes?.find(v => v.candidateId === candidateId)
}

function getVoteCount(candidateId: number, type: 'time' | 'place'): number {
  return findCandidateVote(candidateId, type)?.voteCount ?? 0
}

/**
 * 득표율 계산 (막대 그래프용).
 * 전체 참여자 수 대비 이 후보의 득표 비율.
 * 0명이면 0%, 최대 100%.
 */
function getVotePercent(candidateId: number, type: 'time' | 'place'): number {
  const total = summary.value?.participantCount ?? 0
  if (total === 0) return 0
  const count = getVoteCount(candidateId, type)
  return Math.round((count / total) * 100)
}

function getVoterNames(candidateId: number, type: 'time' | 'place'): string[] {
  return findCandidateVote(candidateId, type)?.voterNames ?? []
}

// ========== 라이프사이클 ==========

onMounted(async () => {
  await fetchAll()

  // VOTING 상태일 때만 5초 폴링 시작
  if (gathering.value?.status === 'VOTING') {
    pollTimer = setInterval(pollSummary, 5000)
  }
})

onUnmounted(() => {
  // 컴포넌트 파괴 시 폴링 정리 (메모리 누수 방지)
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
})
</script>