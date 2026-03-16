<script setup lang="ts">
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const showBack = computed(() => route.path !== '/')
</script>

<template>
  <div class="min-h-screen" style="background: var(--bg-deep)">
    <header class="sticky top-0 z-50" style="background: rgba(8,8,10,0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--border)">
      <div class="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
        <RouterLink v-if="showBack" to="/" class="flex items-center justify-center w-8 h-8 rounded-lg transition" style="color: var(--text-secondary)" @mouseenter="($event.target as HTMLElement).style.color='var(--text-primary)'" @mouseleave="($event.target as HTMLElement).style.color='var(--text-secondary)'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </RouterLink>
        <RouterLink to="/" class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style="background: var(--accent-glow); border: 1px solid rgba(99,102,241,0.3)">📊</div>
          <span class="font-display font-bold text-lg tracking-tight">Tally</span>
        </RouterLink>
      </div>
    </header>
    <main class="max-w-lg mx-auto px-4 py-5">
      <RouterView />
    </main>
  </div>
</template>
