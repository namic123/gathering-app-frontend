<template>
  <div class="max-w-lg mx-auto px-4 pt-12">
    <div class="bg-white rounded-2xl p-8 text-center shadow-md">
      <span class="text-5xl block mb-4">🎉</span>
      <h1 class="text-xl font-extrabold mb-2">모임이 생성됐어요!</h1>
      <p class="text-gray-500 mb-6">아래 링크를 참여자에게 공유하세요</p>

      <!-- 공유 링크 -->
      <div class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 mb-4">
        <span class="flex-1 text-sm text-gray-700 break-all text-left">{{ shareUrl }}</span>
        <button
            class="shrink-0 px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg
                 hover:bg-primary-600 transition"
            @click="copyLink"
        >
          {{ copied ? '복사됨 ✓' : '복사' }}
        </button>
      </div>

      <button
          class="w-full py-3 bg-white border border-gray-200 rounded-xl font-semibold
               hover:bg-gray-50 transition"
          @click="nativeShare"
      >
        📤 공유하기
      </button>

      <p class="mt-6 text-xs text-gray-400 leading-relaxed">
        ⚠️ 이 기기에 주최자 권한이 저장되었습니다.<br />
        다른 기기에서는 확정/수정이 불가합니다.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{ shareCode: string }>()

const copied = ref(false)

const shareUrl = computed(() =>
    `${window.location.origin}/g/${props.shareCode}`
)

async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
  } catch {
    const input = document.createElement('input')
    input.value = shareUrl.value
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
  }
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

async function nativeShare() {
  if (navigator.share) {
    try {
      await navigator.share({
        title: '모임 일정 투표',
        text: '투표에 참여해주세요!',
        url: shareUrl.value
      })
    } catch { /* 사용자 취소 */ }
  } else {
    copyLink()
  }
}
</script>