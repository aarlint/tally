<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useGames } from '../composables/useApi'
import { getMode } from '../lib/modes'

const { data: games, isLoading } = useGames()

const finishedGames = computed(() => games.value?.filter(g => g.status === 'finished') ?? [])
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="font-display text-2xl font-bold tracking-tight">History</h1>
      <p style="color: var(--text-muted)" class="text-sm mt-0.5">Past games and final scores</p>
    </div>

    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="card-static p-4 animate-pulse">
        <div class="h-5 rounded" style="background: var(--border); width: 60%"></div>
        <div class="h-3 rounded mt-2" style="background: var(--border); width: 40%"></div>
      </div>
    </div>

    <div v-else-if="!finishedGames.length" class="card-static text-center py-16">
      <div class="text-4xl mb-3">🏆</div>
      <p style="color: var(--text-muted)" class="text-sm">No finished games yet</p>
    </div>

    <div v-else class="space-y-2">
      <RouterLink
        v-for="game in finishedGames"
        :key="game.id"
        :to="`/game/${game.id}`"
        class="card block p-4"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style="background: rgba(139,138,149,0.08); border: 1px solid var(--border)">
              {{ getMode(game.mode).icon }}
            </div>
            <div>
              <div class="font-semibold text-sm">{{ game.name }}</div>
              <div class="text-xs mt-0.5" style="color: var(--text-secondary)">
                {{ game.players.map(p => p.name).join(' · ') }}
              </div>
              <div class="text-[10px] mt-1" style="color: var(--text-muted)">
                {{ game.finished_at ? new Date(game.finished_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '' }}
              </div>
            </div>
          </div>
          <span class="badge badge-mode text-[10px]">{{ getMode(game.mode).label }}</span>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
