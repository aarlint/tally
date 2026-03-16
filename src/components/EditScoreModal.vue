<script setup lang="ts">
import { ref } from 'vue'
import { useUpdateRound } from '../composables/useApi'

const props = defineProps<{
  gameId: number
  roundId: number
  roundNumber: number
  playerId: number
  playerName: string
  currentPoints: number
}>()

const emit = defineEmits<{ close: [] }>()
const updateRound = useUpdateRound()
const points = ref(props.currentPoints)

async function submit() {
  await updateRound.mutateAsync({
    gameId: props.gameId,
    roundId: props.roundId,
    scores: [{ player_id: props.playerId, points: points.value || 0 }],
  })
  emit('close')
}
</script>

<template>
  <div class="overlay flex items-end sm:items-center justify-center" @click.self="emit('close')">
    <div class="w-full max-w-lg card-static rounded-t-md sm:rounded-md p-5 space-y-4" style="background: var(--surface); border-color: var(--border)">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-bold" style="color: var(--text-bright)">
            edit round {{ roundNumber }}
          </h2>
          <p class="text-[10px] mt-0.5" style="color: var(--text-dim)">
            {{ playerName }}
          </p>
        </div>
        <button @click="emit('close')" class="btn-ghost !p-2" style="color: var(--text-dim)">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Score input -->
      <div class="flex items-center gap-3">
        <span class="text-xs w-6 text-center" style="color: var(--green-dim)">{{ playerName.charAt(0).toUpperCase() }}</span>
        <label class="text-xs flex-1 truncate" style="color: var(--text-dim)">{{ playerName }}</label>
        <input
          v-model.number="points"
          type="number"
          inputmode="numeric"
          class="input-score w-24"
          @focus="($event.target as HTMLInputElement).select()"
          autofocus
        />
      </div>

      <!-- Submit -->
      <button @click="submit" :disabled="updateRound.isPending.value" class="btn-primary w-full">
        {{ updateRound.isPending.value ? 'saving...' : 'save change →' }}
      </button>
    </div>
  </div>
</template>
