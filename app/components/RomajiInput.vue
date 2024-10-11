<script setup lang="ts">
const props = defineProps<{
  current?: {
    writing: string
    romaji: string
    furigana?: string
  }
}>()

const emit = defineEmits<{
  (e: 'checkAnswer', value: boolean): void
}>()

const input = ref('')
const correctness = ref<boolean>(false)
const showCorrectness = ref<boolean>(false)
const hintCount = ref(0)
const hintFurigana = ref<boolean>(false)
const hintRomaji = ref<boolean>(false)

async function checkAnswer() {
  const isCorrect = input.value.toLowerCase().trim() === props.current?.romaji.toLowerCase()

  if (isCorrect) {
    input.value = ''
    hintFurigana.value = false
    hintRomaji.value = false
    hintCount.value = 0
    correctness.value = true
    showCorrectness.value = true

    setTimeout(() => {
      showCorrectness.value = false
    }, 500)
  }
  else {
    hintCount.value++
    if (props.current?.furigana) {
      if (hintCount.value >= 1) {
        hintFurigana.value = true
      }
      if (hintCount.value >= 2) {
        hintRomaji.value = true
      }
    }
    else {
      if (hintCount.value >= 1) {
        hintRomaji.value = true
      }
    }

    correctness.value = false
    showCorrectness.value = true

    setTimeout(() => {
      showCorrectness.value = false
    }, 500)
  }

  emit('checkAnswer', isCorrect)
}

watch(hintCount, () => {
  if (props.current?.furigana) {
    if (hintCount.value >= 1) {
      hintFurigana.value = true
    }
    if (hintCount.value >= 2) {
      hintRomaji.value = true
    }
  }
  else {
    if (hintCount.value >= 1) {
      hintRomaji.value = true
    }
  }
})
</script>

<template>
  <div v-if="current">
    <div w-fit flex flex-col items-center gap-4>
      <div v-if="current" :key="current.writing">
        <div w-fit flex flex-col items-center font-japanese>
          <div
            :class="current?.furigana && hintFurigana ? 'op-100' : 'op-0'"
            text="center neutral-500 dark:neutral-400"
            transition="all ease-in-out" duration-500
          >
            <span text="1.5em">{{ current?.furigana }}</span>
          </div>
          <div cursor-pointer @click="hintCount++">
            <span text="4em">{{ current.writing }}</span>
          </div>
        </div>
        <div
          :class="hintRomaji ? 'op-100' : 'op-0'"
          text="center neutral-500 dark:neutral-400"
          transition="all ease-in-out" duration-500
        >
          {{ current.romaji }}
        </div>
      </div>
      <form mb-2 @submit.prevent="checkAnswer">
        <label>
          <input
            v-model="input"
            :class="[
              showCorrectness
                ? correctness
                  ? 'border-green-500 dark:border-green-600'
                  : 'border-red-500 dark:border-red-600'
                : 'border-neutral-300 dark:border-neutral-600',
            ]"
            bg="transparent"
            transition="all ease-in-out"
            autofocus w-full appearance-none px-4 pb-1 pt-2 text-center text-lg outline-none duration-500
          >
          <div h-1 class="bg-neutral-300 dark:bg-neutral-700" rounded-full />
        </label>
      </form>
    </div>
  </div>
</template>
