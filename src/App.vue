<script setup lang="ts">
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

// Hide bottom nav when viewing a specific game (full-screen scoreboard)
const showNav = computed(() => !route.path.startsWith('/game/'))
</script>

<template>
  <div class="app-shell">
    <!-- Top header -->
    <header class="app-header">
      <div class="max-w-lg mx-auto px-4 h-13 flex items-center gap-2.5">
        <RouterLink to="/" class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style="background: var(--accent-glow); border: 1px solid rgba(99,102,241,0.3)">📊</div>
          <span class="font-display font-bold text-lg tracking-tight">Tally</span>
        </RouterLink>
      </div>
    </header>

    <!-- Scrollable content -->
    <main :class="['app-content max-w-lg mx-auto px-4 py-5', showNav ? 'has-nav' : '']">
      <RouterView />
    </main>

    <!-- Bottom nav -->
    <nav v-if="showNav" class="bottom-nav">
      <RouterLink to="/" class="nav-item" active-class="nav-active" :class="{ 'nav-active': route.path === '/' }">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
        </svg>
        <span>Games</span>
      </RouterLink>
      <RouterLink to="/new" class="nav-item" active-class="nav-active">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        <span>New</span>
      </RouterLink>
      <RouterLink to="/history" class="nav-item" active-class="nav-active">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>History</span>
      </RouterLink>
    </nav>
  </div>
</template>
