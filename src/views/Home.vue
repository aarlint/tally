<script setup lang="ts">
import { computed } from 'vue'
import { useGames } from '../composables/useApi'
import { getMode } from '../lib/modes'
import { RouterLink } from 'vue-router'
import ModeIcon from '../components/ModeIcon.vue'

const { data: games, isLoading } = useGames()

const activeGames = computed(() => games.value?.filter(g => g.status === 'active') ?? [])
const recentFinished = computed(() => games.value?.filter(g => g.status === 'finished').slice(0, 3) ?? [])
</script>

<template>
  <div class="space-y-5">
    <!-- Loading -->
    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="card-static p-4">
        <div class="h-4 rounded" style="background: var(--border); width: 60%"></div>
        <div class="h-3 rounded mt-2" style="background: var(--border); width: 40%"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!games?.length" class="card-static text-center py-16 px-6">
      <div class="mb-4" style="color: var(--green); filter: drop-shadow(0 0 8px rgba(51, 255, 51, 0.3))">
        <ModeIcon name="hash" :size="40" />
      </div>
      <p class="text-sm mb-1" style="color: var(--text-bright)">no games yet</p>
      <p class="text-xs mb-6" style="color: var(--text-dim)">start tracking scores for card games, board games, and more</p>
      <RouterLink to="/new" class="btn-primary inline-block">
        new game &rarr;
      </RouterLink>
    </div>

    <template v-else>
      <!-- Active Games -->
      <div v-if="activeGames.length" class="space-y-3">
        <p class="section-label">active</p>
        <RouterLink
          v-for="game in activeGames"
          :key="game.id"
          :to="`/game/${game.id}`"
          class="card block p-4"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <span style="color: var(--green); filter: drop-shadow(0 0 6px rgba(51, 255, 51, 0.3))"><ModeIcon :name="getMode(game.mode).icon" :size="22" /></span>
              <div>
                <div class="text-sm font-medium" style="color: var(--text-bright)">{{ game.name }}</div>
                <div class="text-xs mt-0.5" style="color: var(--text-dim)">
                  {{ game.players.map(p => p.name).join(' · ') }}
                </div>
              </div>
            </div>
            <span class="badge badge-active">live</span>
          </div>
        </RouterLink>
      </div>

      <!-- Recent Finished -->
      <div v-if="recentFinished.length" class="space-y-3">
        <p class="section-label">recent</p>
        <RouterLink
          v-for="game in recentFinished"
          :key="game.id"
          :to="`/game/${game.id}`"
          class="card block p-4 opacity-60 hover:opacity-100"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <span style="color: var(--text-dim)"><ModeIcon :name="getMode(game.mode).icon" :size="22" /></span>
              <div>
                <div class="text-sm" style="color: var(--text)">{{ game.name }}</div>
                <div class="text-xs mt-0.5" style="color: var(--text-dim)">
                  {{ game.players.map(p => p.name).join(' · ') }}
                </div>
              </div>
            </div>
            <span class="badge badge-finished">done</span>
          </div>
        </RouterLink>
      </div>
    </template>
  </div>
</template>
