<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useGames } from '../composables/useApi'
import { getMode } from '../lib/modes'

const { data: games, isLoading } = useGames()

const finishedGames = computed(() => games.value?.filter(g => g.status === 'finished') ?? [])
</script>

<template>
  <div class="space-y-5">
    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="card-static p-4">
        <div class="h-4 rounded" style="background: var(--border); width: 60%"></div>
        <div class="h-3 rounded mt-2" style="background: var(--border); width: 40%"></div>
      </div>
    </div>

    <div v-else-if="!finishedGames.length" class="card-static text-center py-16">
      <div class="text-3xl mb-3">🏆</div>
      <p class="text-xs" style="color: var(--text-dim)">no finished games yet</p>
    </div>

    <div v-else class="space-y-2">
      <p class="section-label">completed</p>
      <RouterLink
        v-for="game in finishedGames"
        :key="game.id"
        :to="`/game/${game.id}`"
        class="card block p-4"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <span class="text-xl">{{ getMode(game.mode).icon }}</span>
            <div>
              <div class="text-sm" style="color: var(--text)">{{ game.name }}</div>
              <div class="text-xs mt-0.5" style="color: var(--text-dim)">
                {{ game.players.map(p => p.name).join(' · ') }}
              </div>
              <div class="text-[10px] mt-1" style="color: var(--text-dim)">
                {{ game.finished_at ? new Date(game.finished_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '' }}
              </div>
            </div>
          </div>
          <span class="badge badge-mode text-[9px]">{{ getMode(game.mode).label }}</span>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
