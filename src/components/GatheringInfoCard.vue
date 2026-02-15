<template>
  <!--
    모임 정보 요약 카드.
    제목, 주최자, 마감 시간, 설명, 상태 배지를 표시한다.
    투표/대시보드/현황 페이지 상단에 공통으로 사용.
  -->
  <div class="bg-white rounded-xl p-5 shadow-sm">
    <!-- 상단: 제목 + 상태 배지 -->
    <div class="flex items-start justify-between gap-2 mb-3">
      <h1 class="text-lg font-bold leading-snug">{{ gathering.title }}</h1>
      <StatusBadge :status="gathering.status" />
    </div>

    <!-- 주최자 + 마감 정보 -->
    <div class="space-y-1 text-sm text-gray-500">
      <p>👤 {{ gathering.hostName }}</p>
      <p>⏰ {{ deadlineText }}</p>
      <p v-if="gathering.participantCount > 0">
        🗳️ {{ gathering.participantCount }}명 참여
      </p>
    </div>

    <!-- 설명 (있을 때만 표시) -->
    <p
        v-if="gathering.description"
        class="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3"
    >
      {{ gathering.description }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import relativeTime from 'dayjs/plugin/relativeTime'
import StatusBadge from '@/components/StatusBadge.vue'
import type { GatheringDetail } from '@/types'

dayjs.locale('ko')
dayjs.extend(relativeTime)

const props = defineProps<{
  gathering: GatheringDetail
}>()

/**
 * 마감 시간 표시.
 * 미래: "3월 7일 18:00 (2일 남음)"
 * 과거: "3월 7일 18:00 (마감됨)"
 */
const deadlineText = computed(() => {
  const dl = dayjs(props.gathering.deadline)
  const formatted = dl.format('M월 D일 (ddd) HH:mm')
  const now = dayjs()

  if (dl.isAfter(now)) {
    return `${formatted} (${dl.fromNow()} 마감)`
  }
  return `${formatted} (마감됨)`
})
</script>