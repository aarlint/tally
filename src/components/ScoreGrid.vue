<script setup lang="ts">
import { computed } from 'vue'
import type { GameDetail } from '../composables/useApi'
import type { GameMode } from '../lib/modes'

const props = defineProps<{
  game: GameDetail
  mode: GameMode
}>()

const leaderIdx = computed(() => {
  if (!props.game.totals.length) return -1
  const sorted = [...props.game.totals].sort((a, b) =>
    props.mode.sortDirection === 'high' ? b.total - a.total : a.total - b.total
  )
  return props.game.players.findIndex(p => p.id === sorted[0].player_id)
})
</script>

<template>
  <div class="overflow-x-auto -mx-4 px-4">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-gray-800">
          <th class="py-2 pr-2 text-left text-gray-500 font-medium text-xs">#</th>
          <th
            v-for="(player, i) in game.players"
            :key="player.id"
            :class="[
              'py-2 px-2 text-center font-medium text-xs min-w-[64px]',
              i === leaderIdx && game.rounds.length > 0 ? 'text-amber-400' : 'text-gray-400'
            ]"
          >
            {{ player.name }}
            <span v-if="i === leaderIdx && game.rounds.length > 0" class="ml-0.5">👑</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="round in game.rounds" :key="round.id" class="border-b border-gray-800/50">
          <td class="py-1.5 pr-2 text-gray-600 text-xs">{{ round.round_number }}</td>
          <td
            v-for="score in round.scores"
            :key="score.player_id"
            class="py-1.5 px-2 text-center tabular-nums"
          >
            <span :class="score.points > 0 ? 'text-white' : score.points < 0 ? 'text-red-400' : 'text-gray-600'">
              {{ score.points }}
            </span>
          </td>
        </tr>
      </tbody>
      <tfoot v-if="game.rounds.length > 0">
        <tr class="border-t-2 border-gray-700">
          <td class="py-2 pr-2 text-gray-500 font-medium text-xs">Total</td>
          <td
            v-for="(player, i) in game.players"
            :key="player.id"
            :class="[
              'py-2 px-2 text-center font-bold tabular-nums',
              i === leaderIdx ? 'text-amber-400' : 'text-white'
            ]"
          >
            {{ game.totals.find(t => t.player_id === player.id)?.total ?? 0 }}
          </td>
        </tr>
      </tfoot>
    </table>

    <p v-if="!game.rounds.length" class="text-center py-8 text-gray-600 text-sm">
      No rounds yet. Add a round to start scoring.
    </p>
  </div>
</template>
