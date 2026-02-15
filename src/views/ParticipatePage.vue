<template>
  <div class="max-w-lg mx-auto px-4 pt-12 text-center">
    <span class="text-4xl block mb-4">🗳️</span>
    <h1 class="text-xl font-bold mb-2">투표 페이지</h1>
    <p class="text-gray-500">D6에서 구현 예정</p>
    <p class="text-sm text-gray-400 mt-2">shareCode: {{ shareCode }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ shareCode: string }>()
</script>