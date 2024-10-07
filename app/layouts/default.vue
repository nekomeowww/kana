<template>
  <div
    class="mx-auto h-full max-w-[1200px] w-full flex flex-col"
    transition="all ease-in-out" duration-1000
  >
    <main h-full w-full flex-1>
      <slot />
    </main>
    <Footer />
  </div>
</template>
