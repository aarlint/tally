<script setup lang="ts">
import { ref } from 'vue'
import { useAddPlayer } from '../composables/useApi'
import type { GameDetail } from '../composables/useApi'

const props = defineProps<{
  game: GameDetail
}>()

const emit = defineEmits<{ close: [] }>()
const addPlayer = useAddPlayer()
const playerName = ref('')
const backfill = ref<'average' | 'zero'>('average')
const hasRounds = props.game.rounds.length > 0

async function submit() {
  if (!playerName.value.trim()) return
  await addPlayer.mutateAsync({
    gameId: props.game.id,
    name: playerName.value.trim(),
    backfill: backfill.value,
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
            add player
          </h2>
          <p class="text-[10px] mt-0.5" style="color: var(--text-dim)">
            join game in progress
          </p>
        </div>
        <button @click="emit('close')" class="btn-ghost !p-2" style="color: var(--text-dim)">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Name input -->
      <div>
        <label class="text-[10px] uppercase tracking-wider mb-1 block" style="color: var(--text-dim)">player name</label>
        <input
          v-model="playerName"
          type="text"
          placeholder="Enter name"
          class="input-score w-full"
          autofocus
        />
      </div>

      <!-- Backfill option (only if rounds exist) -->
      <div v-if="hasRounds">
        <label class="text-[10px] uppercase tracking-wider mb-2 block" style="color: var(--text-dim)">past rounds</label>
        <div class="flex gap-2">
          <button
            @click="backfill = 'average'"
            :class="['btn-secondary flex-1 !text-xs', backfill === 'average' && '!border-[var(--green)] !text-[var(--green)]']"
          >
            use average
          </button>
          <button
            @click="backfill = 'zero'"
            :class="['btn-secondary flex-1 !text-xs', backfill === 'zero' && '!border-[var(--green)] !text-[var(--green)]']"
          >
            start at zero
          </button>
        </div>
        <p class="text-[10px] mt-1.5" style="color: var(--text-dim)">
          {{ backfill === 'average'
            ? 'past rounds will use the average score of other players'
            : 'past rounds will be filled with 0' }}
        </p>
      </div>

      <!-- Submit -->
      <button
        @click="submit"
        :disabled="addPlayer.isPending.value || !playerName.trim()"
        class="btn-primary w-full"
      >
        {{ addPlayer.isPending.value ? 'adding...' : 'add player →' }}
      </button>
    </div>
  </div>
</template>
