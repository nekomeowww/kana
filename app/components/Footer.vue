<template>
  <div text="xl neutral4" flex="~ gap3" m-5 items-center justify-center>
    <a i-carbon-logo-github href="https://github.com/nekomeowww/kana" target="_blank" />
    <div w-full flex flex-1 justify-center gap-4>
      <NuxtLink to="/" class="text-neutral-200 transition-all duration-500 ease-in-out dark:text-neutral-700" active-class="text-neutral-600 dark:text-neutral-300!">
        Kana
      </NuxtLink>
      <NuxtLink to="/vocabulary" class="text-neutral-200 transition-all duration-500 ease-in-out dark:text-neutral-700" active-class="text-neutral-600 dark:text-neutral-300!">
        Vocabulary
      </NuxtLink>
    </div>
    <DarkToggle />
  </div>
</template>
