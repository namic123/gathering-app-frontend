<template>
  <div class="max-w-lg mx-auto px-4">
    <section class="text-center py-12">
      <h1 class="text-3xl font-extrabold leading-tight mb-4">
        모임 일정,<br />
        <span class="text-primary-500">3초면</span> 정해져요
      </h1>
      <p class="text-gray-500 text-base mb-8">
        링크 하나로 투표 → 자동 확정 → 캘린더 추가까지
      </p>

      <router-link
          to="/create"
          class="block w-full py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold text-lg rounded-xl transition"
      >
        모임 만들기
      </router-link>
    </section>

    <section class="flex flex-col gap-3 mt-4">
      <div
          v-for="feature in features"
          :key="feature.icon"
          class="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4"
      >
        <span class="text-2xl shrink-0">{{ feature.icon }}</span>
        <div>
          <h3 class="text-sm font-bold mb-0.5">{{ feature.title }}</h3>
          <p class="text-sm text-gray-500">{{ feature.desc }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const features = [
  { icon: '🔗', title: '링크 공유', desc: '카톡으로 링크만 보내면 끝' },
  { icon: '✅', title: '간편 투표', desc: '회원가입 없이 3초 투표' },
  { icon: '📅', title: '자동 확정', desc: '마감 후 1위 자동 선택' },
]
</script>