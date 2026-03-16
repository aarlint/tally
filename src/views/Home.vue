<script setup lang="ts">
import { computed } from 'vue'
import { useGames } from '../composables/useApi'
import { getMode } from '../lib/modes'
import { RouterLink } from 'vue-router'

const { data: games, isLoading } = useGames()

const activeGames = computed(() => games.value?.filter(g => g.status === 'active') ?? [])
const recentFinished = computed(() => games.value?.filter(g => g.status === 'finished').slice(0, 3) ?? [])
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="font-display text-2xl font-bold tracking-tight">Games</h1>
      <p style="color: var(--text-muted)" class="text-sm mt-0.5">Track scores for any game</p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="card-static p-4 animate-pulse">
        <div class="h-5 rounded" style="background: var(--border); width: 60%"></div>
        <div class="h-3 rounded mt-2" style="background: var(--border); width: 40%"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!games?.length" class="card-static text-center py-16 px-6">
      <div class="text-5xl mb-4">🎯</div>
      <h2 class="font-display text-xl font-bold mb-1">No games yet</h2>
      <p style="color: var(--text-muted)" class="text-sm mb-6">Start tracking scores for your favorite card games, board games, and more.</p>
      <RouterLink to="/new" class="btn-primary inline-block text-sm">
        Start your first game
      </RouterLink>
    </div>

    <template v-else>
      <!-- Active Games -->
      <div v-if="activeGames.length" class="space-y-3">
        <h2 class="text-xs font-semibold uppercase tracking-wider" style="color: var(--text-muted)">Active</h2>
        <RouterLink
          v-for="game in activeGames"
          :key="game.id"
          :to="`/game/${game.id}`"
          class="card block p-4"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style="background: var(--accent-glow); border: 1px solid rgba(99,102,241,0.2)">
                {{ getMode(game.mode).icon }}
              </div>
              <div>
                <div class="font-semibold">{{ game.name }}</div>
                <div class="text-xs mt-0.5" style="color: var(--text-secondary)">
                  {{ game.players.map(p => p.name).join(' · ') }}
                </div>
              </div>
            </div>
            <span class="badge badge-active">Live</span>
          </div>
        </RouterLink>
      </div>

      <!-- Recent Finished -->
      <div v-if="recentFinished.length" class="space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-xs font-semibold uppercase tracking-wider" style="color: var(--text-muted)">Recent</h2>
        </div>
        <RouterLink
          v-for="game in recentFinished"
          :key="game.id"
          :to="`/game/${game.id}`"
          class="card block p-4 opacity-70 hover:opacity-100"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style="background: rgba(139,138,149,0.08); border: 1px solid var(--border)">
                {{ getMode(game.mode).icon }}
              </div>
              <div>
                <div class="font-semibold text-sm">{{ game.name }}</div>
                <div class="text-xs mt-0.5" style="color: var(--text-muted)">
                  {{ game.players.map(p => p.name).join(' · ') }}
                </div>
              </div>
            </div>
            <span class="badge badge-finished">Done</span>
          </div>
        </RouterLink>
      </div>
    </template>
  </div>
</template>
