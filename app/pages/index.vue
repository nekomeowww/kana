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
    (unvoicedOn.value && char.category.includes('unvoiced'))
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
        bg="white dark:[#222]"
        transition="all ease-in-out"
        absolute w-250 w-fit duration-500
      >
        <div class="grid grid-cols-[2rem_auto_auto] gap-px border border-neutral-200 rounded-xl p-2 shadow-sm">
          <div class="p-2 font-bold" />
          <div class="w-fit p-2 font-bold">
            Monograph
          </div>
          <div class="w-fit p-2 font-bold">
            Digraph
          </div>

          <template v-for="family in families" :key="family">
            <div class="p-2 font-bold">
              {{ family }}
            </div>
            <div class="min-w-10rem w-fit p-2 text-nowrap">
              <span
                v-for="char in getCharsByFamily(family, 'monograph')"
                :key="char.writing"
                :class="[
                  isEnabled(char) ? 'text-inherit dark:text-inherit' : 'text-neutral-300 dark:text-neutral-600',
                ]"
              >
                {{ char.writing }}
              </span>
            </div>
            <div class="min-w-10rem w-fit p-2 text-nowrap">
              <span
                v-for="char in getCharsByFamily(family, 'digraph')"
                :key="char.writing"
                :class="[
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
    <RomajiInput
      v-if="currentChar"
      :current="currentChar"
      flex
      flex-1 items-center
      @check-answer="checkAnswer"
    />
    <div v-else flex flex-1 items-center>
      <p>No characters!</p>
    </div>
  </div>
</template>
