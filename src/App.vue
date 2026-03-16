<script setup lang="ts">
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const showNav = computed(() => !route.path.startsWith('/game/'))
</script>

<template>
  <div class="app-shell">
    <!-- Top header -->
    <header class="app-header">
      <div class="max-w-lg mx-auto px-4 h-12 flex items-center gap-2.5">
        <RouterLink to="/" class="flex items-center gap-2">
          <span class="text-lg" style="filter: drop-shadow(0 0 6px rgba(51, 255, 51, 0.3))">📊</span>
          <span class="font-bold text-sm tracking-wide" style="color: var(--green); text-shadow: 0 0 10px rgba(51, 255, 51, 0.2)">tally</span>
        </RouterLink>
      </div>
    </header>

    <!-- Content -->
    <main :class="['app-content max-w-lg mx-auto px-4 py-5', showNav ? 'has-nav' : '']">
      <RouterView />
    </main>

    <!-- Bottom nav -->
    <nav v-if="showNav" class="bottom-nav">
      <RouterLink to="/" class="nav-item" :class="{ 'nav-active': route.path === '/' }">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
        </svg>
        <span>games</span>
      </RouterLink>
      <RouterLink to="/new" class="nav-item" active-class="nav-active">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        <span>new</span>
      </RouterLink>
      <RouterLink to="/history" class="nav-item" active-class="nav-active">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>history</span>
      </RouterLink>
    </nav>
  </div>
</template>
