<template>
  <div class="max-w-lg mx-auto px-4 pt-4">

    <!-- 진행 바 -->
    <div class="h-1 bg-gray-200 rounded-full overflow-hidden mb-2">
      <div
          class="h-full bg-primary-500 rounded-full transition-all duration-300"
          :style="{ width: (step / totalSteps) * 100 + '%' }"
      ></div>
    </div>
    <p class="text-xs text-gray-400 text-right mb-6">{{ step }} / {{ totalSteps }}</p>

    <!-- ============ Step 1: 기본 정보 ============ -->
    <section v-if="step === 1">
      <h2 class="text-xl font-bold mb-6">모임 기본 정보</h2>

      <div class="mb-5">
        <label class="block text-sm font-semibold text-gray-500 mb-1">모임 제목 *</label>
        <input
            v-model="form.title"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-base
                 focus:outline-none focus:border-primary-500 transition placeholder:text-gray-300"
            placeholder="예: 금요일 회식"
            maxlength="100"
        />
      </div>

      <div class="mb-5">
        <label class="block text-sm font-semibold text-gray-500 mb-1">주최자 이름 *</label>
        <input
            v-model="form.hostName"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-base
                 focus:outline-none focus:border-primary-500 transition placeholder:text-gray-300"
            placeholder="예: 김민수"
            maxlength="30"
        />
      </div>

      <div class="mb-5">
        <label class="block text-sm font-semibold text-gray-500 mb-1">설명 (선택)</label>
        <textarea
            v-model="form.description"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-base
                 focus:outline-none focus:border-primary-500 transition placeholder:text-gray-300
                 resize-y min-h-20"
            placeholder="참여자에게 전달할 메모"
            maxlength="500"
            rows="3"
        ></textarea>
      </div>

      <div class="mb-5">
        <label class="block text-sm font-semibold text-gray-500 mb-1">투표 유형 *</label>
        <div class="flex gap-2">
          <button
              v-for="t in typeOptions"
              :key="t.value"
              class="flex-1 flex flex-col items-center gap-1 p-4 border-2 rounded-xl transition"
              :class="form.type === t.value
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 bg-white'"
              @click="form.type = t.value"
          >
            <span class="text-xl">{{ t.icon }}</span>
            <span class="text-sm font-semibold">{{ t.label }}</span>
          </button>
        </div>
      </div>

      <div class="mb-5">
        <label class="block text-sm font-semibold text-gray-500 mb-1">투표 마감 *</label>
        <input
            v-model="form.deadlineLocal"
            type="datetime-local"
            :min="minDeadline"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-base
                 focus:outline-none focus:border-primary-500 transition"
        />
      </div>

      <button
          class="w-full py-3.5 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300
               text-white font-semibold rounded-xl transition"
          :disabled="!isStep1Valid"
          @click="step = 2"
      >
        다음
      </button>
    </section>

    <!-- ============ Step 2: 후보 등록 ============ -->
    <section v-if="step === 2">
      <h2 class="text-xl font-bold mb-6">후보 등록</h2>

      <!-- 시간 후보 -->
      <div v-if="form.type !== 'PLACE_ONLY'" class="mb-8">
        <h3 class="text-base font-bold mb-4">🕐 시간 후보</h3>

        <div
            v-for="(tc, idx) in form.timeCandidates"
            :key="idx"
            class="bg-white border border-gray-200 rounded-xl p-4 mb-3 relative"
        >
          <div class="flex gap-2">
            <div class="flex-1">
              <label class="block text-xs font-semibold text-gray-500 mb-1">날짜 *</label>
              <input v-model="tc.date" type="date"
                     class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                       focus:outline-none focus:border-primary-500" />
            </div>
            <div class="flex-1">
              <label class="block text-xs font-semibold text-gray-500 mb-1">시작 *</label>
              <input v-model="tc.startTime" type="time"
                     class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                       focus:outline-none focus:border-primary-500" />
            </div>
            <div class="flex-1">
              <label class="block text-xs font-semibold text-gray-500 mb-1">종료</label>
              <input v-model="tc.endTime" type="time"
                     class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                       focus:outline-none focus:border-primary-500" />
            </div>
          </div>

          <button
              v-if="form.timeCandidates.length > 1"
              class="text-xs text-danger font-semibold mt-2 px-2 py-1"
              @click="form.timeCandidates.splice(idx, 1)"
          >
            삭제
          </button>
        </div>

        <button
            v-if="form.timeCandidates.length < 20"
            class="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl
                 text-sm font-semibold text-gray-500 hover:border-primary-500 hover:text-primary-500 transition"
            @click="addTimeCandidate"
        >
          + 시간 후보 추가
        </button>
      </div>

      <!-- 장소 후보 -->
      <div v-if="form.type !== 'TIME_ONLY'" class="mb-8">
        <h3 class="text-base font-bold mb-4">📍 장소 후보</h3>

        <div
            v-for="(pc, idx) in form.placeCandidates"
            :key="idx"
            class="bg-white border border-gray-200 rounded-xl p-4 mb-3"
        >
          <div class="mb-2">
            <label class="block text-xs font-semibold text-gray-500 mb-1">장소명 *</label>
            <input v-model="pc.name"
                   class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                     focus:outline-none focus:border-primary-500"
                   placeholder="예: 강남 고기집" maxlength="100" />
          </div>
          <div class="mb-2">
            <label class="block text-xs font-semibold text-gray-500 mb-1">지도 링크 (선택)</label>
            <input v-model="pc.mapLink"
                   class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                     focus:outline-none focus:border-primary-500"
                   placeholder="카카오맵/네이버지도 URL" maxlength="500" />
          </div>
          <div class="mb-1">
            <label class="block text-xs font-semibold text-gray-500 mb-1">메모 (선택)</label>
            <input v-model="pc.memo"
                   class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                     focus:outline-none focus:border-primary-500"
                   placeholder="예: 삼겹살 맛집, 주차 가능" maxlength="200" />
          </div>

          <button
              v-if="form.placeCandidates.length > 1"
              class="text-xs text-danger font-semibold mt-2 px-2 py-1"
              @click="form.placeCandidates.splice(idx, 1)"
          >
            삭제
          </button>
        </div>

        <button
            v-if="form.placeCandidates.length < 10"
            class="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl
                 text-sm font-semibold text-gray-500 hover:border-primary-500 hover:text-primary-500 transition"
            @click="addPlaceCandidate"
        >
          + 장소 후보 추가
        </button>
      </div>

      <div class="flex gap-2 mt-6">
        <button
            class="px-6 py-3.5 bg-white border border-gray-200 rounded-xl font-semibold
                 hover:bg-gray-50 transition"
            @click="step = 1"
        >
          이전
        </button>
        <button
            class="flex-1 py-3.5 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300
                 text-white font-semibold rounded-xl transition"
            :disabled="!isStep2Valid"
            @click="step = 3"
        >
          다음
        </button>
      </div>
    </section>

    <!-- ============ Step 3: 최종 확인 ============ -->
    <section v-if="step === 3">
      <h2 class="text-xl font-bold mb-6">최종 확인</h2>

      <div class="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div class="flex justify-between items-center py-2 border-b border-gray-100">
          <span class="text-sm text-gray-500 font-semibold">모임 제목</span>
          <span class="text-sm font-medium">{{ form.title }}</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-gray-100">
          <span class="text-sm text-gray-500 font-semibold">주최자</span>
          <span class="text-sm font-medium">{{ form.hostName }}</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-gray-100">
          <span class="text-sm text-gray-500 font-semibold">투표 유형</span>
          <span class="text-sm font-medium">{{ typeLabel }}</span>
        </div>
        <div class="flex justify-between items-center py-2">
          <span class="text-sm text-gray-500 font-semibold">마감</span>
          <span class="text-sm font-medium">{{ deadlineDisplay }}</span>
        </div>

        <!-- 시간 후보 목록 -->
        <div v-if="form.type !== 'PLACE_ONLY'" class="pt-4 border-t border-gray-100 mt-2">
          <span class="text-sm text-gray-500 font-semibold">
            시간 후보 ({{ validTimeCandidates.length }}개)
          </span>
          <ul class="mt-2 space-y-1">
            <li v-for="(tc, idx) in validTimeCandidates" :key="idx"
                class="text-sm before:content-['·'] before:text-primary-500 before:font-bold before:mr-2">
              {{ tc.date }} {{ tc.startTime }}{{ tc.endTime ? '~' + tc.endTime : '' }}
            </li>
          </ul>
        </div>

        <!-- 장소 후보 목록 -->
        <div v-if="form.type !== 'TIME_ONLY'" class="pt-4 border-t border-gray-100 mt-2">
          <span class="text-sm text-gray-500 font-semibold">
            장소 후보 ({{ validPlaceCandidates.length }}개)
          </span>
          <ul class="mt-2 space-y-1">
            <li v-for="(pc, idx) in validPlaceCandidates" :key="idx"
                class="text-sm before:content-['·'] before:text-primary-500 before:font-bold before:mr-2">
              {{ pc.name }}
            </li>
          </ul>
        </div>
      </div>

      <p v-if="errorMsg" class="text-sm text-danger text-center mb-4">
        {{ errorMsg }}
      </p>

      <div class="flex gap-2">
        <button
            class="px-6 py-3.5 bg-white border border-gray-200 rounded-xl font-semibold
                 hover:bg-gray-50 transition"
            @click="step = 2"
        >
          이전
        </button>
        <button
            class="flex-1 py-3.5 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300
                 text-white font-semibold rounded-xl transition"
            :disabled="submitting"
            @click="handleSubmit"
        >
          {{ submitting ? '생성 중...' : '모임 생성' }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { createGathering } from '@/api'
import { useAdminToken } from '@/composables/useAdminToken'
import type { GatheringType } from '@/types'

const router = useRouter()
const { save: saveAdminToken } = useAdminToken()

// ========== 상태 ==========

const step = ref(1)
const totalSteps = 3
const submitting = ref(false)
const errorMsg = ref('')

interface TimeForm { date: string; startTime: string; endTime: string }
interface PlaceForm { name: string; mapLink: string; memo: string }

const form = reactive({
  title: '',
  hostName: '',
  description: '',
  type: 'BOTH' as GatheringType,
  deadlineLocal: '',
  timeCandidates: [{ date: '', startTime: '', endTime: '' }] as TimeForm[],
  placeCandidates: [{ name: '', mapLink: '', memo: '' }] as PlaceForm[]
})

// ========== 상수 ==========

const typeOptions = [
  { value: 'TIME_ONLY' as GatheringType, label: '시간만', icon: '🕐' },
  { value: 'PLACE_ONLY' as GatheringType, label: '장소만', icon: '📍' },
  { value: 'BOTH' as GatheringType, label: '시간+장소', icon: '📅' }
]

const minDeadline = computed(() => {
  return dayjs().add(15, 'minute').format('YYYY-MM-DDTHH:mm')
})

// ========== 유효성 ==========

const isStep1Valid = computed(() => {
  return form.title.trim().length > 0 &&
      form.hostName.trim().length > 0 &&
      form.type &&
      form.deadlineLocal
})

const validTimeCandidates = computed(() =>
    form.timeCandidates.filter(tc => tc.date && tc.startTime)
)

const validPlaceCandidates = computed(() =>
    form.placeCandidates.filter(pc => pc.name.trim().length > 0)
)

const isStep2Valid = computed(() => {
  const needTime = form.type !== 'PLACE_ONLY'
  const needPlace = form.type !== 'TIME_ONLY'
  const timeOk = !needTime || validTimeCandidates.value.length > 0
  const placeOk = !needPlace || validPlaceCandidates.value.length > 0
  return timeOk && placeOk
})

// ========== 표시용 ==========

const typeLabel = computed(() =>
    typeOptions.find(t => t.value === form.type)?.label || ''
)

const deadlineDisplay = computed(() => {
  if (!form.deadlineLocal) return ''
  return dayjs(form.deadlineLocal).format('M월 D일 (ddd) HH:mm')
})

// ========== 후보 추가 ==========

function addTimeCandidate() {
  form.timeCandidates.push({ date: '', startTime: '', endTime: '' })
}

function addPlaceCandidate() {
  form.placeCandidates.push({ name: '', mapLink: '', memo: '' })
}

// ========== 제출 ==========

async function handleSubmit() {
  if (submitting.value) return
  submitting.value = true
  errorMsg.value = ''

  try {
    const deadline = dayjs(form.deadlineLocal).toISOString()

    const timeCandidates = form.type !== 'PLACE_ONLY'
        ? validTimeCandidates.value.map(tc => ({
          date: tc.date,
          startTime: tc.startTime,
          endTime: tc.endTime || null
        }))
        : null

    const placeCandidates = form.type !== 'TIME_ONLY'
        ? validPlaceCandidates.value.map(pc => ({
          name: pc.name.trim(),
          mapLink: pc.mapLink || null,
          memo: pc.memo || null
        }))
        : null

    const { data } = await createGathering({
      title: form.title.trim(),
      hostName: form.hostName.trim(),
      description: form.description.trim() || null,
      type: form.type,
      deadline,
      timeCandidates,
      placeCandidates
    })

    saveAdminToken(data.shareCode, data.adminToken)

    router.push({
      name: 'CreateComplete',
      params: { shareCode: data.shareCode }
    })
  } catch (err: any) {
    errorMsg.value = err.userMessage || '모임 생성에 실패했습니다.'
  } finally {
    submitting.value = false
  }
}
</script>