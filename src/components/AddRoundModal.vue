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
  <div class="overlay flex items-end sm:items-center justify-center" @click.self="emit('close')">
    <div class="w-full max-w-lg card-static rounded-t-2xl sm:rounded-2xl p-6 space-y-5" style="background: var(--bg-surface); border-color: var(--border-hover)">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-display text-lg font-bold tracking-tight">
            Round {{ (game.rounds.length || 0) + 1 }}
          </h2>
          <p class="text-xs mt-0.5" style="color: var(--text-muted)">
            Enter {{ mode.scoreLabel.toLowerCase() }} for each player
          </p>
        </div>
        <button @click="emit('close')" class="btn-ghost !p-2" style="color: var(--text-muted)">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Score inputs -->
      <div class="space-y-3">
        <div v-for="player in game.players" :key="player.id" class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style="background: var(--accent-glow); color: var(--accent)">
            {{ player.name.charAt(0).toUpperCase() }}
          </div>
          <label class="text-sm font-medium flex-1 truncate" style="color: var(--text-secondary)">{{ player.name }}</label>
          <input
            v-model.number="scoreInputs[player.id]"
            type="number"
            inputmode="numeric"
            class="input-score w-24"
            @focus="($event.target as HTMLInputElement).select()"
          />
        </div>
      </div>

      <!-- Info -->
      <div class="flex items-center justify-center gap-2 py-1">
        <span class="badge badge-mode">{{ mode.scoreLabel }}</span>
        <span class="text-[10px]" style="color: var(--text-muted)">
          {{ mode.sortDirection === 'high' ? 'Highest wins' : 'Lowest wins' }}
        </span>
      </div>

      <!-- Submit -->
      <button @click="submit" :disabled="addRound.isPending.value" class="btn-primary w-full text-base">
        {{ addRound.isPending.value ? 'Saving...' : 'Save Round' }}
      </button>
    </div>
  </div>
</template>
