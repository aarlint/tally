<script setup lang="ts">
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const showBack = computed(() => route.path !== '/')
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-white">
    <header class="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800">
      <div class="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
        <RouterLink v-if="showBack" to="/" class="text-gray-400 hover:text-white transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </RouterLink>
        <RouterLink to="/" class="flex items-center gap-2">
          <span class="text-xl">📊</span>
          <span class="font-bold text-lg">Tally</span>
        </RouterLink>
      </div>
    </header>
    <main class="max-w-lg mx-auto px-4 py-4">
      <RouterView />
    </main>
  </div>
</template>
