<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useGames } from '../composables/useApi'
import { getMode } from '../lib/modes'

const { data: games, isLoading } = useGames()

const finishedGames = computed(() => games.value?.filter(g => g.status === 'finished') ?? [])
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold">Game History</h1>

    <div v-if="isLoading" class="text-center py-12 text-gray-500">Loading...</div>

    <div v-else-if="!finishedGames.length" class="text-center py-12 text-gray-500">
      No finished games yet
    </div>

    <div v-else class="space-y-2">
      <RouterLink
        v-for="game in finishedGames"
        :key="game.id"
        :to="`/game/${game.id}`"
        class="block bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition"
      >
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span>{{ getMode(game.mode).icon }}</span>
              <span class="font-semibold">{{ game.name }}</span>
            </div>
            <div class="text-sm text-gray-400 mt-1">
              {{ game.players.map(p => p.name).join(', ') }}
            </div>
            <div class="text-xs text-gray-600 mt-1">
              {{ game.finished_at ? new Date(game.finished_at).toLocaleDateString() : '' }}
            </div>
          </div>
          <span class="text-xs text-gray-500">{{ getMode(game.mode).label }}</span>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
