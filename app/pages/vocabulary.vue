<script setup lang="ts">
import { ref } from 'vue'

import { vocabulariesN5 } from '~/constants/n5'

const currentVocabulary = ref<{ writing: string, romaji: string, furigana: string } | null>()

const userProfile = reactive<{
  vocabularies: Record<string, {
    learningRate: number
    practiceCount: number
    lastPracticed: number | null
  }>
}>({
  vocabularies: {},
})

function getRandomPracticingVocabulary() {
  if (vocabulariesN5.length === 0)
    return null

  // Shuffle the combined table
  const shuffledTable = [...vocabulariesN5].sort(() => Math.random() - 0.5)

  // Calculate weights, but with a minimum weight to ensure some randomness
  const weightedChars = shuffledTable.map((char) => {
    const vocabularyData = userProfile.vocabularies[char.writing] || {
      learningRate: 0,
      practiceCount: 0,
      lastPracticed: null,
    }

    const daysSinceLastPractice = vocabularyData.lastPracticed
      ? (Date.now() - vocabularyData.lastPracticed) / (1000 * 60 * 60 * 24)
      : 30 // Assume 30 days if never practiced

    // Ensure a minimum weight of 0.1
    const weight = Math.max(0.1, (1 - vocabularyData.learningRate) * (daysSinceLastPractice + 1) / (vocabularyData.practiceCount + 1))

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

async function checkAnswer(isCorrect: boolean) {
  if (isCorrect) {
    currentVocabulary.value = getRandomPracticingVocabulary()
  }
}

onMounted(() => {
  currentVocabulary.value = getRandomPracticingVocabulary()
})
</script>

<template>
  <div h-full w-full flex flex-col items-center justify-center>
    <RomajiInput
      v-if="currentVocabulary"
      :current="currentVocabulary"
      flex
      flex-1 items-center
      @check-answer="checkAnswer"
    />
  </div>
</template>
