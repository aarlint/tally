<script setup lang="ts">
import { ref } from 'vue'
import { useAddRound } from '../composables/useApi'
import type { GameDetail } from '../composables/useApi'
import type { GameMode } from '../lib/modes'

const props = defineProps<{
  game: GameDetail
  mode: GameMode
}>()

const emit = defineEmits<{ close: [] }>()
const addRound = useAddRound()

const scoreInputs = ref<Record<number, number>>(
  Object.fromEntries(props.game.players.map(p => [p.id, 0]))
)

async function submit() {
  const scores = props.game.players.map(p => ({
    player_id: p.id,
    points: scoreInputs.value[p.id] || 0,
  }))

  await addRound.mutateAsync({ gameId: props.game.id, scores })
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60" @click.self="emit('close')">
    <div class="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-t-2xl sm:rounded-2xl p-5 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold">
          Round {{ (game.rounds.length || 0) + 1 }}
        </h2>
        <button @click="emit('close')" class="text-gray-500 hover:text-white transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="space-y-3">
        <div v-for="player in game.players" :key="player.id" class="flex items-center gap-3">
          <label class="w-24 text-sm text-gray-300 truncate">{{ player.name }}</label>
          <input
            v-model.number="scoreInputs[player.id]"
            type="number"
            inputmode="numeric"
            class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-center text-lg tabular-nums focus:outline-none focus:border-indigo-500"
            @focus="($event.target as HTMLInputElement).select()"
          />
        </div>
      </div>

      <p class="text-xs text-gray-500 text-center">
        {{ mode.scoreLabel }} · {{ mode.sortDirection === 'high' ? 'Highest wins' : 'Lowest wins' }}
      </p>

      <button
        @click="submit"
        :disabled="addRound.isPending.value"
        class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg font-medium transition"
      >
        {{ addRound.isPending.value ? 'Saving...' : 'Save Round' }}
      </button>
    </div>
  </div>
</template>
