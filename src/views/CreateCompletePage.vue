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

      <!-- 카카오톡 공유 (최우선) -->
      <button
          v-if="kakao.isAvailable"
          class="w-full py-3 bg-[#FEE500] text-[#191919] font-semibold rounded-xl
               hover:bg-[#F5DC00] transition flex items-center justify-center gap-2"
          @click="kakaoShare"
      >
        <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#191919" d="M9 1C4.58 1 1 3.79 1 7.21c0 2.17 1.44 4.08 3.62 5.17l-.93 3.44c-.08.3.26.54.52.37l4.1-2.72c.22.02.45.03.69.03 4.42 0 8-2.79 8-6.29S13.42 1 9 1z"/></svg>
        카카오톡으로 공유
      </button>

      <!-- 일반 공유 -->
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
import { useKakaoShare } from '@/composables/useKakaoShare'

const props = defineProps<{ shareCode: string }>()

const kakao = useKakaoShare()

function kakaoShare() {
  kakao.shareLink({
    title: '모임 일정 투표',
    description: '투표에 참여해주세요!',
    url: shareUrl.value
  })
}

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