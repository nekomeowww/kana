const color = useColorMode()

const darkPreset = ref('#222')
const lightPreset = ref('#fff')

const backgroundColor = computed(() => {
  return color.preference === 'dark' ? darkPreset.value : lightPreset.value
})

export function useAppBackground(options?: { dark?: string, light?: string }) {
  if (options !== null) {
    if (options?.dark != null) {
      darkPreset.value = options.dark
    }
    if (options?.light != null) {
      lightPreset.value = options.light
    }
  }

  function setBackgroundColor(options: { dark: string, light: string }) {
    if (color.preference === 'dark') {
      darkPreset.value = options.dark
    }
    else {
      lightPreset.value = options.light
    }
  }

  return {
    backgroundColor,
    setBackgroundColor,
  }
}
