<script setup lang="ts">
import type { Kana } from '../constants/kana'
import { hiragana, katakana } from '../constants/kana'

const hiraganaOn = ref(true)
const katakanaOn = ref(false)
const monographOn = ref(true)
const digraphOn = ref(false)
const unvoicedOn = ref(true)
const dakutenOn = ref(false)
const handakutenOn = ref(false)

const charTableView = ref(true)

const input = ref<string>('')

const hint = ref(false)
const correctness = ref(false)
const showCorrectness = ref(false)

const currentChar = ref<Kana | null>(null)
const userProfile = reactive<{
  characters: Record<string, {
    learningRate: number
    practiceCount: number
    lastPracticed: number | null
  }>
}>({
  characters: {},
})

const speakingChar = ref('')
const { speak } = useSpeechSynthesis(speakingChar, {
  lang: 'ja-JP',
})

const charTable = computed(() => {
  let table: Kana[] = []
  if (hiraganaOn.value) {
    table.push(...hiragana)
  }
  if (katakanaOn.value) {
    table.push(...katakana)
  }

  const requiredCategory: string[] = []
  if (monographOn.value) {
    requiredCategory.push('monograph')
  }
  if (digraphOn.value) {
    requiredCategory.push('digraph')
  }

  const requiredVoicing: string[] = []
  if (unvoicedOn.value) {
    requiredVoicing.push('unvoiced')
  }
  if (dakutenOn.value) {
    requiredVoicing.push('dakuten')
  }
  if (handakutenOn.value) {
    requiredVoicing.push('handakuten')
  }

  if (requiredCategory.length > 0) {
    table = table.filter(char => requiredCategory.some(category => char.category.includes(category)))
  }
  if (requiredVoicing.length > 0) {
    table = table.filter(char => requiredVoicing.some(voicing => char.category.includes(voicing)))
  }

  return table
})

function getRandomPracticingChar() {
  if (charTable.value.length === 0)
    return null

  // Shuffle the combined table
  const shuffledTable = [...charTable.value].sort(() => Math.random() - 0.5)

  // Calculate weights, but with a minimum weight to ensure some randomness
  const weightedChars = shuffledTable.map((char) => {
    const charData = userProfile.characters[char.writing] || {
      learningRate: 0,
      practiceCount: 0,
      lastPracticed: null,
    }

    const daysSinceLastPractice = charData.lastPracticed
      ? (Date.now() - charData.lastPracticed) / (1000 * 60 * 60 * 24)
      : 30 // Assume 30 days if never practiced

    // Ensure a minimum weight of 0.1
    const weight = Math.max(0.1, (1 - charData.learningRate) * (daysSinceLastPractice + 1) / (charData.practiceCount + 1))

    return { char, weight }
  })

  // Use weighted random selection
  const totalWeight = weightedChars.reduce((sum, char) => sum + char.weight, 0)
  let randomWeight = Math.random() * totalWeight

  for (const weightedChar of weightedChars) {
    randomWeight -= weightedChar.weight
    if (randomWeight <= 0)
      return weightedChar.char
  }

  // Fallback to a completely random selection
  return shuffledTable[Math.floor(Math.random() * shuffledTable.length)]!
}

function updateCharacterData(char: Kana, correct: boolean) {
  if (!userProfile.characters[char.writing]) {
    userProfile.characters[char.writing] = {
      learningRate: 0,
      practiceCount: 0,
      lastPracticed: null,
    }
  }

  const charData = userProfile.characters[char.writing] || {
    learningRate: 0,
    practiceCount: 0,
    lastPracticed: null,
  }

  const learningFactor = correct ? 0.1 : -0.05

  charData.learningRate = Math.max(0, Math.min(1, charData.learningRate + learningFactor))
  charData.practiceCount++
  charData.lastPracticed = Date.now()
}

async function checkAnswer(isCorrect: boolean) {
  if (currentChar.value) {
    updateCharacterData(currentChar.value, isCorrect)

    speakingChar.value = currentChar.value!.writing
    speak()
  }
  if (isCorrect) {
    currentChar.value = getRandomPracticingChar()

    input.value = ''
    hint.value = false
    correctness.value = true
    showCorrectness.value = true

    setTimeout(() => {
      showCorrectness.value = false
    }, 500)
  }
  else {
    hint.value = true
    correctness.value = false
    showCorrectness.value = true

    setTimeout(() => {
      showCorrectness.value = false
    }, 500)
  }
}

function isEnabled(char: Kana) {
  return (
    (hiraganaOn.value && char.category.includes('hiragana'))
    || (katakanaOn.value && char.category.includes('katakana'))
  ) && (
    (monographOn.value && char.category.includes('monograph'))
    || (digraphOn.value && char.category.includes('digraph'))
  ) && (
    (!dakutenOn.value && !handakutenOn.value)
    || (dakutenOn.value && char.category.includes('dakuten'))
    || (handakutenOn.value && char.category.includes('handakuten'))
  )
}

const families = ['∅', 'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w', 'g', 'z', 'd', 'b', 'p']

function getCharsByFamily(family: string, type: 'monograph' | 'digraph') {
  return charTable.value.filter(char =>
    char.alphabetColumn[0]!.toLowerCase() === family
    && char.category.includes(type),
  )
}

watch([hiraganaOn, katakanaOn, monographOn, digraphOn, unvoicedOn, dakutenOn, handakutenOn], () => {
  currentChar.value = getRandomPracticingChar()
})

onMounted(() => {
  currentChar.value = getRandomPracticingChar()
})
</script>

<template>
  <div h-full w-full flex flex-col items-center justify-center>
    <div flex gap-4 px-2 py-6>
      <label
        :class="[hiraganaOn ? '' : 'text-neutral-200 dark:text-neutral-700']"
        transition="all ease-in-out"
        cursor-pointer duration-500
        title="Hiragana"
      >
        <input v-model="hiraganaOn" type="checkbox" invisible appearance-none>
        <span>あ</span>
      </label>
      <label
        :class="[katakanaOn ? '' : 'text-neutral-200 dark:text-neutral-700']"
        cursor-pointer
        transition="all ease-in-out" duration-500
        title="Katakana"
      >
        <input v-model="katakanaOn" type="checkbox" invisible appearance-none>
        <span>ア</span>
      </label>
      <label
        :class="[monographOn ? '' : 'text-neutral-200 dark:text-neutral-700']"
        cursor-pointer
        transition="all ease-in-out" duration-500
        title="Monographs"
      >
        <input v-model="monographOn" type="checkbox" invisible appearance-none>
        <span>き</span>
      </label>
      <label
        :class="[digraphOn ? '' : 'text-neutral-200 dark:text-neutral-700']"
        cursor-pointer
        transition="all ease-in-out" duration-500
        title="Digraphs"
      >
        <input v-model="digraphOn" type="checkbox" invisible appearance-none>
        <span>きゃ</span>
      </label>
      <label
        :class="[unvoicedOn ? '' : 'text-neutral-200 dark:text-neutral-700']"
        cursor-pointer
        transition="all ease-in-out" duration-500
        title="清音"
      >
        <input v-model="unvoicedOn" type="checkbox" invisible appearance-none>
        <span>清音</span>
      </label>
      <label
        :class="[dakutenOn ? '' : 'text-neutral-200 dark:text-neutral-700']"
        cursor-pointer
        transition="all ease-in-out" duration-500
        title="Dakuten"
      >
        <input v-model="dakutenOn" type="checkbox" invisible appearance-none>
        <span>濁点</span>
      </label>
      <label
        :class="[handakutenOn ? '' : 'text-neutral-200 dark:text-neutral-700']"
        cursor-pointer
        transition="all ease-in-out" duration-500
        title="Handakuten"
      >
        <input v-model="handakutenOn" type="checkbox" invisible appearance-none>
        <span>半濁点</span>
      </label>
    </div>
    <div v-if="false" relative flex flex-col items-center>
      <div i-carbon:edge-enhancement cursor-zoom-in text-neutral-500 @mouseenter="charTableView = true" @mouseleave="charTableView = false" />
      <div
        v-if="charTableView"
        :class="charTableView ? 'opacity-100' : 'opacity-0'"
        absolute bg="white dark:[#222]" w-250
        transition="all ease-in-out"
        duration-500
      >
        <div class="grid grid-cols-[auto_1fr_1fr] gap-px border border-neutral-200 bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-700">
          <div class="bg-white p-2 font-bold dark:bg-neutral-800" />
          <div class="bg-white p-2 font-bold dark:bg-neutral-800">
            Monograph
          </div>
          <div class="bg-white p-2 font-bold dark:bg-neutral-800">
            Digraph
          </div>

          <template v-for="family in families" :key="family">
            <div class="bg-white p-2 font-bold dark:bg-neutral-800">
              {{ family }}
            </div>
            <div class="bg-white p-2 dark:bg-neutral-800">
              <span
                v-for="char in getCharsByFamily(family, 'monograph')"
                :key="char.writing"
                class="mr-2" :class="[
                  isEnabled(char) ? 'text-inherit dark:text-inherit' : 'text-neutral-300 dark:text-neutral-600',
                ]"
              >
                {{ char.writing }}
              </span>
            </div>
            <div class="bg-white p-2 dark:bg-neutral-800">
              <span
                v-for="char in getCharsByFamily(family, 'digraph')"
                :key="char.writing"
                class="mr-2" :class="[
                  isEnabled(char) ? 'text-inherit dark:text-inherit' : 'text-neutral-300 dark:text-neutral-600',
                ]"
              >
                {{ char.writing }}
              </span>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div v-if="currentChar" flex flex-1 items-center>
      <div w-fit flex flex-col items-center gap-4>
        <div v-if="currentChar" :key="currentChar.writing">
          <div w-fit font-japanese @click="hint = true">
            <span text="4em">{{ currentChar.writing }}</span>
          </div>
          <div
            :class="hint ? 'op-100' : 'op-0'"
            text="center neutral-500 dark:neutral-400"
            transition="all ease-in-out" duration-500
          >
            {{ currentChar.romaji }}
          </div>
        </div>
        <form mb-2 @submit.prevent="checkAnswer(input.toLowerCase().trim() === currentChar.romaji.toLowerCase())">
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
            border="b-2"
            transition="all ease-in-out"
            autofocus w-full appearance-none px-4 pb-1 pt-2 text-center text-lg outline-none duration-500
          >
        </form>
      </div>
    </div>
    <div v-else flex flex-1 items-center>
      <p>No characters!</p>
    </div>
  </div>
</template>
