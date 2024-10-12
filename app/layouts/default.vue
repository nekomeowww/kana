<template>
  <div
    class="mx-auto h-full max-w-[1200px] w-full flex flex-col overflow-hidden"
    p="l-[max(env(safe-area-inset-left),8px)] t-[max(env(safe-area-inset-top),16px)] r-[max(env(safe-area-inset-right),8px)] b-[max(env(safe-area-inset-bottom),16px)]"
    transition="all ease-in-out" duration-1000
  >
    <main w-full flex-1>
      <slot />
    </main>
    <Footer />
  </div>
</template>
