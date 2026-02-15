<template>
  <!--
    상태별 색상 매핑:
    VOTING    → 보라 (진행 중)
    TIEBREAK  → 노랑 (주의)
    CONFIRMED → 초록 (완료)
    EXPIRED   → 회색 (종료)
  -->
  <span
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      :class="badgeClass"
  >
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GatheringStatus } from '@/types'

const props = defineProps<{
  status: GatheringStatus
}>()

/**
 * 상태별 배지 스타일 + 텍스트 매핑.
 * Tailwind 클래스를 동적으로 적용한다.
 */
const config = computed(() => {
  switch (props.status) {
    case 'VOTING':
      return { class: 'bg-primary-100 text-primary-700', label: '투표 중' }
    case 'TIEBREAK':
      return { class: 'bg-yellow-100 text-yellow-700', label: '동점' }
    case 'CONFIRMED':
      return { class: 'bg-green-100 text-green-700', label: '확정' }
    case 'EXPIRED':
      return { class: 'bg-gray-100 text-gray-500', label: '만료' }
    default:
      return { class: 'bg-gray-100 text-gray-500', label: props.status }
  }
})

const badgeClass = computed(() => config.value.class)
const label = computed(() => config.value.label)
</script>