<script setup lang="ts">
import { useGames } from '../composables/useApi'
import { getMode } from '../lib/modes'
import { RouterLink } from 'vue-router'

const { data: games, isLoading } = useGames()
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Games</h1>
      <div class="flex gap-2">
        <RouterLink to="/history" class="px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition">
          History
        </RouterLink>
        <RouterLink to="/new" class="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition">
          + New Game
        </RouterLink>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-12 text-gray-500">Loading...</div>

    <div v-else-if="!games?.length" class="text-center py-16 space-y-3">
      <div class="text-5xl">📊</div>
      <p class="text-gray-400">No games yet</p>
      <RouterLink to="/new" class="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition">
        Start your first game
      </RouterLink>
    </div>

    <div v-else class="space-y-2">
      <RouterLink
        v-for="game in games?.filter(g => g.status === 'active')"
        :key="game.id"
        :to="`/game/${game.id}`"
        class="block bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition"
      >
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-lg">{{ getMode(game.mode).icon }}</span>
              <span class="font-semibold">{{ game.name }}</span>
            </div>
            <div class="text-sm text-gray-400 mt-1">
              {{ game.players.map(p => p.name).join(', ') }}
            </div>
          </div>
          <span class="text-xs px-2 py-0.5 bg-green-900/50 text-green-400 rounded-full">Active</span>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
