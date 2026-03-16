<script setup lang="ts">
import { computed } from 'vue'
import type { GameDetail } from '../composables/useApi'
import type { GameMode } from '../lib/modes'

const props = defineProps<{
  game: GameDetail
  mode: GameMode
}>()

const leader = computed(() => {
  if (!props.game.totals.length || !props.game.rounds.length) return null
  const sorted = [...props.game.totals].sort((a, b) =>
    props.mode.sortDirection === 'high' ? b.total - a.total : a.total - b.total
  )
  return sorted[0].player_id
})
</script>

<template>
  <div class="overflow-x-auto">
    <table class="score-table">
      <thead>
        <tr>
          <th class="text-left pl-4 w-10">#</th>
          <th
            v-for="player in game.players"
            :key="player.id"
            class="min-w-[72px]"
            :style="{ color: leader === player.id ? 'var(--gold)' : undefined }"
          >
            <span class="inline-flex items-center gap-1">
              {{ player.name }}
              <span v-if="leader === player.id" class="leader-glow">👑</span>
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="round in game.rounds" :key="round.id">
          <td class="text-left pl-4 !text-xs !font-normal" style="color: var(--text-muted)">{{ round.round_number }}</td>
          <td v-for="score in round.scores" :key="score.player_id">
            <span :style="{
              color: score.points > 0 ? 'var(--text-primary)' : score.points < 0 ? 'var(--red)' : 'var(--text-muted)'
            }">
              {{ score.points > 0 ? '+' + score.points : score.points }}
            </span>
          </td>
        </tr>
      </tbody>
      <tfoot v-if="game.rounds.length > 0">
        <tr>
          <td class="text-left pl-4 !text-xs !font-semibold" style="color: var(--text-muted)">Total</td>
          <td
            v-for="player in game.players"
            :key="player.id"
            :style="{ color: leader === player.id ? 'var(--gold)' : 'var(--text-primary)' }"
          >
            {{ game.totals.find(t => t.player_id === player.id)?.total ?? 0 }}
          </td>
        </tr>
      </tfoot>
    </table>

    <div v-if="!game.rounds.length" class="text-center py-12 px-4">
      <div class="text-3xl mb-2">🎲</div>
      <p class="text-sm" style="color: var(--text-muted)">No rounds yet. Add a round to start scoring.</p>
    </div>
  </div>
</template>
