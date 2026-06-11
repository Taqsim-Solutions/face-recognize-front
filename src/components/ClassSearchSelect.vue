<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  // v-model value: selected class id as string, or 'all'
  modelValue: string
  classes: any[]
  disabled?: boolean
  loading?: boolean
  // show an "all classes" option at the top
  allowAll?: boolean
  placeholder?: string
  widthClass?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const open = ref(false)
const search = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const rootRef = ref<HTMLElement | null>(null)

const width = computed(() => props.widthClass || 'sm:w-[200px]')
const allowAll = computed(() => props.allowAll !== false)

// Canonical label: prefer Name, fall back to degree-symbol.
const classLabel = (c: any) =>
  c?.name && String(c.name).trim() ? String(c.name) : `${c?.degree}-${c?.symbol}`

// Normalize for fuzzy matching: lowercase, drop separators/quotes, fold Cyrillic.
const normalize = (s: string) => {
  const cyr: Record<string, string> = {
    'а': 'a', 'в': 'b', 'е': 'e', 'к': 'k', 'м': 'm', 'н': 'h',
    'о': 'o', 'р': 'p', 'с': 'c', 'т': 't', 'у': 'y', 'х': 'x'
  }
  return String(s || '')
    .toLowerCase()
    .replace(/[\s\-_"'“”«»]/g, '')
    .split('')
    .map((ch) => cyr[ch] || ch)
    .join('')
    .trim()
}

const filtered = computed(() => {
  const list = props.classes || []
  const q = normalize(search.value)
  if (!q) return list
  return list.filter((c: any) => normalize(classLabel(c)).includes(q))
})

const selectedLabel = computed(() => {
  if (props.modelValue === 'all') return props.placeholder || t('sinf', 'Sinf')
  const c = (props.classes || []).find((x: any) => String(x.id) === props.modelValue)
  return c ? classLabel(c) : props.placeholder || t('sinf', 'Sinf')
})

const select = (id: string) => {
  emit('update:modelValue', id)
  open.value = false
  search.value = ''
}

watch(open, (isOpen) => {
  if (isOpen) nextTick(() => searchInput.value?.focus())
})

const onClickOutside = (e: MouseEvent) => {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) open.value = false
}
onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div ref="rootRef" class="relative">
    <button
      type="button"
      :disabled="disabled || loading"
      @click="open = !open"
      :class="[
        'h-10 w-full border border-gray-200 rounded-xl text-gray-600 bg-white text-left font-medium px-3 flex items-center justify-between disabled:opacity-60 cursor-pointer',
        width
      ]"
    >
      <span :class="{ 'text-gray-400': modelValue === 'all' }">
        {{ loading ? t('loading', 'Yuklanmoqda') + '...' : selectedLabel }}
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
    </button>

    <div
      v-if="open"
      :class="['absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden', width]"
    >
      <div class="p-2 border-b border-gray-100">
        <input
          ref="searchInput"
          v-model="search"
          type="text"
          :placeholder="t('class-search-placeholder', 'Qidirish: 1-A')"
          class="h-8 w-full px-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#ff792d]"
          @click.stop
        />
      </div>
      <div class="max-h-[240px] overflow-y-auto py-1">
        <button
          v-if="allowAll"
          type="button"
          @click="select('all')"
          class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
          :class="modelValue === 'all' ? 'text-[#ff792d] font-semibold bg-orange-50' : 'text-gray-600'"
        >
          {{ t('all-classes', 'Barcha sinflar') }}
        </button>
        <button
          v-for="cls in filtered"
          :key="cls.id"
          type="button"
          @click="select(String(cls.id))"
          class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
          :class="modelValue === String(cls.id) ? 'text-[#ff792d] font-semibold bg-orange-50' : 'text-gray-700'"
        >
          {{ classLabel(cls) }}
        </button>
        <div v-if="!filtered.length" class="px-3 py-3 text-sm text-gray-400 text-center">
          {{ t('no-data', "Ma'lumot yo'q") }}
        </div>
      </div>
    </div>
  </div>
</template>
