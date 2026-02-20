<template>
  <div class="max-w-lg mx-auto px-4 pt-4">

    <!-- 로딩 -->
    <div v-if="loading" class="text-center py-20">
      <p class="text-gray-400">불러오는 중...</p>
    </div>

    <!-- 에러 -->
    <div v-else-if="error" class="text-center py-20">
      <span class="text-4xl block mb-4">😢</span>
      <h1 class="text-xl font-bold mb-2">결과를 불러올 수 없어요</h1>
      <p class="text-gray-500 mb-6">{{ error }}</p>
      <router-link :to="`/g/${shareCode}`" class="text-primary-500 font-semibold">
        모임으로 돌아가기
      </router-link>
    </div>

    <!-- ========================================
         결과 카드: 확정된 시간 + 장소 + 캘린더 추가
         ======================================== -->
    <div v-else-if="result" class="py-4">

      <!-- 축하 헤더 -->
      <div class="text-center mb-6">
        <span class="text-5xl block mb-3">🎉</span>
        <h1 class="text-2xl font-extrabold mb-1">일정이 확정되었습니다!</h1>
        <p class="text-sm text-gray-500">
          {{ result.confirmedBy === 'AUTO' ? '투표 결과로 자동 확정' : '주최자가 직접 선택' }}
        </p>
      </div>

      <!-- 모임 정보 -->
      <div class="bg-white rounded-2xl p-6 shadow-sm mb-4">
        <h2 class="text-lg font-bold mb-1">{{ result.title }}</h2>
        <p class="text-sm text-gray-500">주최: {{ result.hostName }}</p>
      </div>

      <!-- 확정된 시간 -->
      <div v-if="result.confirmedDate" class="bg-white rounded-2xl p-6 shadow-sm mb-4">
        <div class="flex items-center gap-3 mb-3">
          <span class="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-lg">
            🕐
          </span>
          <h3 class="text-base font-bold">확정된 시간</h3>
        </div>
        <p class="text-lg font-semibold">
          {{ formatDate(result.confirmedDate) }}
        </p>
        <p class="text-sm text-gray-500 mt-1">
          {{ result.confirmedStartTime }}{{ result.confirmedEndTime ? ' ~ ' + result.confirmedEndTime : '' }}
        </p>
      </div>

      <!-- 확정된 장소 -->
      <div v-if="result.confirmedPlaceName" class="bg-white rounded-2xl p-6 shadow-sm mb-4">
        <div class="flex items-center gap-3 mb-3">
          <span class="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-lg">
            📍
          </span>
          <h3 class="text-base font-bold">확정된 장소</h3>
        </div>
        <p class="text-lg font-semibold">{{ result.confirmedPlaceName }}</p>

        <a
            v-if="result.confirmedPlaceMapLink"
            :href="result.confirmedPlaceMapLink"
            target="_blank"
            class="inline-block mt-2 text-sm text-primary-500 hover:underline"
        >
          지도에서 보기 ↗
        </a>
      </div>

      <!-- 참석자 목록 -->
      <div v-if="result.participantNames && result.participantNames.length" class="bg-white rounded-2xl p-6 shadow-sm mb-4">
        <div class="flex items-center gap-3 mb-3">
          <span class="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-lg">
            👥
          </span>
          <h3 class="text-base font-bold">참석자 ({{ result.participantNames.length }}명)</h3>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <span
              v-for="pName in result.participantNames"
              :key="pName"
              class="px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-700"
          >
            {{ pName }}
          </span>
        </div>
      </div>

      <!-- 액션 버튼 -->
      <div class="space-y-3 mt-6">
        <!-- .ics 캘린더 추가 (아이폰/기본 캘린더) -->
        <a
            v-if="result.confirmedDate"
            :href="icsDownloadUrl"
            class="block w-full py-4 bg-primary-500 hover:bg-primary-600
                 text-white font-semibold text-center rounded-xl transition"
        >
          📅 캘린더에 추가하기 (.ics)
        </a>

        <!-- 구글 캘린더 직접 추가 -->
        <a
            v-if="result.confirmedDate"
            :href="googleCalendarUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="block w-full py-4 bg-white border border-gray-200 font-semibold
                 text-center rounded-xl hover:bg-gray-50 transition"
        >
          📆 구글 캘린더에 추가
        </a>

        <!-- 카카오톡 공유 -->
        <button
            v-if="kakao.isAvailable"
            class="w-full py-4 bg-[#FEE500] text-[#191919] font-semibold
                 text-center rounded-xl hover:bg-[#F5DC00] transition flex items-center justify-center gap-2"
            @click="kakaoShareResult"
        >
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#191919" d="M9 1C4.58 1 1 3.79 1 7.21c0 2.17 1.44 4.08 3.62 5.17l-.93 3.44c-.08.3.26.54.52.37l4.1-2.72c.22.02.45.03.69.03 4.42 0 8-2.79 8-6.29S13.42 1 9 1z"/></svg>
          카카오톡으로 공유
        </button>

        <!-- 링크 공유 -->
        <button
            class="w-full py-4 bg-white border border-gray-200 font-semibold
                 text-center rounded-xl hover:bg-gray-50 transition"
            @click="shareResult"
        >
          {{ shareButtonText }}
        </button>

        <!-- 투표 현황 보기 -->
        <router-link
            :to="`/g/${shareCode}/votes`"
            class="block w-full py-3 text-center text-sm text-gray-500 font-semibold
                 hover:text-gray-700 transition"
        >
          투표 현황 보기
        </router-link>
      </div>

      <!-- 확정 시각 -->
      <p class="text-center text-xs text-gray-400 mt-6">
        {{ formatConfirmedAt(result.confirmedAt) }} 확정
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import { getResult } from '@/api'
import { useKakaoShare } from '@/composables/useKakaoShare'
import type { ConfirmedResultResponse } from '@/types'

dayjs.locale('ko')

const kakao = useKakaoShare()

function kakaoShareResult() {
  const url = `${window.location.origin}/g/${props.shareCode}/result`
  kakao.shareLink({
    title: `${result.value?.title} - 일정 확정!`,
    description: '모임 일정이 확정되었습니다. 확인해주세요!',
    url
  })
}

// ========== Props ==========

const props = defineProps<{ shareCode: string }>()

// ========== 상태 ==========

const result = ref<ConfirmedResultResponse | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

/** 공유 버튼 텍스트 (복사 후 피드백) */
const shareButtonText = ref('🔗 결과 링크 공유하기')

// ========== Computed ==========

/**
 * .ics 파일 다운로드 URL.
 * 백엔드에서 Content-Type: text/calendar 로 응답하여
 * 브라우저가 캘린더 앱으로 열어준다.
 */
const icsDownloadUrl = computed(() =>
    `/api/v1/gatherings/${props.shareCode}/result/ics`
)

/**
 * 구글 캘린더 직접 추가 URL.
 * 클릭 시 구글 캘린더 이벤트 생성 페이지로 이동.
 */
const googleCalendarUrl = computed(() => {
  const r = result.value
  if (!r?.confirmedDate) return ''

  const date = r.confirmedDate.replace(/-/g, '')
  const start = r.confirmedStartTime?.replace(/:/g, '') || '0000'
  const end = r.confirmedEndTime?.replace(/:/g, '') || start

  const dates = `${date}T${start}00/${date}T${end}00`
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: r.title,
    dates,
    details: `주최: ${r.hostName}`,
  })
  if (r.confirmedPlaceName) {
    params.set('location', r.confirmedPlaceName)
  }
  return `https://calendar.google.com/calendar/render?${params.toString()}`
})

// ========== 날짜 포맷 ==========

/** "2026-03-07" → "3월 7일 (토)" */
function formatDate(dateStr: string): string {
  return dayjs(dateStr).format('M월 D일 (ddd)')
}

/** ISO 문자열 → "2월 15일 23:00" */
function formatConfirmedAt(isoStr: string): string {
  return dayjs(isoStr).format('M월 D일 HH:mm')
}

// ========== 결과 공유 ==========

async function shareResult() {
  const url = `${window.location.origin}/g/${props.shareCode}/result`

  // Web Share API (모바일)
  if (navigator.share) {
    try {
      await navigator.share({
        title: `${result.value?.title} - 일정 확정!`,
        text: '모임 일정이 확정되었습니다. 확인해주세요!',
        url
      })
      return
    } catch { /* 사용자 취소 */ }
  }

  // 폴백: 클립보드 복사
  try {
    await navigator.clipboard.writeText(url)
  } catch {
    const input = document.createElement('input')
    input.value = url
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
  }
  shareButtonText.value = '복사됨 ✓'
  setTimeout(() => { shareButtonText.value = '🔗 결과 링크 공유하기' }, 2000)
}

// ========== 데이터 로드 ==========

onMounted(async () => {
  try {
    const { data } = await getResult(props.shareCode)
    result.value = data
  } catch (err: any) {
    error.value = err.userMessage || '결과를 불러올 수 없습니다.'
  } finally {
    loading.value = false
  }
})
</script>