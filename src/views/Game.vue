<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGame, useUpdateGame, useDeleteGame, useDeleteRound } from '../composables/useApi'
import { getMode } from '../lib/modes'
import ScoreGrid from '../components/ScoreGrid.vue'
import AddRoundModal from '../components/AddRoundModal.vue'

const route = useRoute()
const router = useRouter()
const gameId = computed(() => Number(route.params.id))
const { data: game, isLoading } = useGame(gameId)
const updateGame = useUpdateGame()
const deleteGame = useDeleteGame()
const deleteRound = useDeleteRound()

const showAddRound = ref(false)
const showConfirmDelete = ref(false)

const mode = computed(() => game.value ? getMode(game.value.mode) : null)

async function finishGame() {
  if (!game.value) return
  await updateGame.mutateAsync({ id: game.value.id, status: 'finished' })
}

async function reactivateGame() {
  if (!game.value) return
  await updateGame.mutateAsync({ id: game.value.id, status: 'active' })
}

async function handleDelete() {
  if (!game.value) return
  await deleteGame.mutateAsync(game.value.id)
  router.push('/')
}

async function undoLastRound() {
  if (!game.value?.rounds.length) return
  const lastRound = game.value.rounds[game.value.rounds.length - 1]
  await deleteRound.mutateAsync({ gameId: game.value.id, roundId: lastRound.id })
}
</script>

<template>
  <div v-if="isLoading" class="text-center py-12 text-gray-500">Loading...</div>

  <div v-else-if="!game" class="text-center py-12 text-gray-500">Game not found</div>

  <div v-else class="space-y-4">
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div>
        <div class="flex items-center gap-2">
          <span class="text-xl">{{ mode?.icon }}</span>
          <h1 class="text-xl font-bold">{{ game.name }}</h1>
        </div>
        <p class="text-xs text-gray-500 mt-0.5">
          {{ mode?.label }} · {{ mode?.scoreLabel }} · {{ mode?.sortDirection === 'high' ? 'Highest wins' : 'Lowest wins' }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <span
          :class="[
            'text-xs px-2 py-0.5 rounded-full',
            game.status === 'active' ? 'bg-green-900/50 text-green-400' : 'bg-gray-800 text-gray-400'
          ]"
        >
          {{ game.status === 'active' ? 'Active' : 'Finished' }}
        </span>
      </div>
    </div>

    <!-- Score Grid -->
    <ScoreGrid :game="game" :mode="mode!" />

    <!-- Actions -->
    <div v-if="game.status === 'active'" class="flex gap-2">
      <button
        @click="showAddRound = true"
        class="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition"
      >
        + Add Round
      </button>
      <button
        v-if="game.rounds.length > 0"
        @click="undoLastRound"
        :disabled="deleteRound.isPending.value"
        class="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition disabled:opacity-50"
        title="Undo last round"
      >
        ↩
      </button>
    </div>

    <!-- Game controls -->
    <div class="flex gap-2 pt-2 border-t border-gray-800">
      <button
        v-if="game.status === 'active'"
        @click="finishGame"
        class="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition"
      >
        Finish Game
      </button>
      <button
        v-else
        @click="reactivateGame"
        class="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition"
      >
        Reactivate
      </button>
      <button
        @click="showConfirmDelete = true"
        class="px-4 py-2 text-red-400 hover:bg-red-950/50 rounded-lg text-sm transition"
      >
        Delete
      </button>
    </div>

    <!-- Delete confirmation -->
    <div v-if="showConfirmDelete" class="bg-red-950/30 border border-red-900 rounded-lg p-4 space-y-3">
      <p class="text-sm">Delete this game and all its scores?</p>
      <div class="flex gap-2">
        <button @click="handleDelete" class="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm transition">
          Yes, Delete
        </button>
        <button @click="showConfirmDelete = false" class="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">
          Cancel
        </button>
      </div>
    </div>

    <!-- Add Round Modal -->
    <AddRoundModal
      v-if="showAddRound"
      :game="game"
      :mode="mode!"
      @close="showAddRound = false"
    />
  </div>
</template>
