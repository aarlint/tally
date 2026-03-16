<script setup lang="ts">
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { computed } from 'vue'
import { Hash, Home, PlusCircle, Clock } from 'lucide-vue-next'

const route = useRoute()
const showNav = computed(() => !route.path.startsWith('/game/'))
</script>

<template>
  <div class="app-shell">
    <!-- Top header -->
    <header class="app-header">
      <div class="max-w-lg mx-auto px-4 h-12 flex items-center gap-2.5">
        <RouterLink to="/" class="flex items-center gap-2">
          <span style="color: var(--green); filter: drop-shadow(0 0 6px rgba(51, 255, 51, 0.3))">
            <Hash :size="20" />
          </span>
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
        <Home :size="20" />
        <span>games</span>
      </RouterLink>
      <RouterLink to="/new" class="nav-item" active-class="nav-active">
        <PlusCircle :size="20" />
        <span>new</span>
      </RouterLink>
      <RouterLink to="/history" class="nav-item" active-class="nav-active">
        <Clock :size="20" />
        <span>history</span>
      </RouterLink>
    </nav>
  </div>
</template>
