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
  <!-- Loading -->
  <div v-if="isLoading" class="space-y-4">
    <div class="card-static p-4 animate-pulse">
      <div class="h-6 rounded" style="background: var(--border); width: 50%"></div>
      <div class="h-3 rounded mt-2" style="background: var(--border); width: 30%"></div>
    </div>
    <div class="card-static p-6 animate-pulse">
      <div class="h-32 rounded" style="background: var(--border)"></div>
    </div>
  </div>

  <!-- Not found -->
  <div v-else-if="!game" class="card-static text-center py-16">
    <p style="color: var(--text-muted)">Game not found</p>
  </div>

  <div v-else class="space-y-4">
    <!-- Header card -->
    <div class="card-static p-4">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style="background: var(--accent-glow); border: 1px solid rgba(99,102,241,0.2)">
            {{ mode?.icon }}
          </div>
          <div>
            <h1 class="font-display text-xl font-bold tracking-tight">{{ game.name }}</h1>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="badge badge-mode">{{ mode?.label }}</span>
              <span class="text-xs" style="color: var(--text-muted)">
                {{ mode?.scoreLabel }} · {{ mode?.sortDirection === 'high' ? 'Highest wins' : 'Lowest wins' }}
              </span>
            </div>
          </div>
        </div>
        <span :class="['badge', game.status === 'active' ? 'badge-active' : 'badge-finished']">
          {{ game.status === 'active' ? 'Live' : 'Done' }}
        </span>
      </div>
    </div>

    <!-- Score Grid -->
    <div class="card-static overflow-hidden">
      <ScoreGrid :game="game" :mode="mode!" />
    </div>

    <!-- Actions -->
    <div v-if="game.status === 'active'" class="flex gap-2">
      <button @click="showAddRound = true" class="btn-primary flex-1 text-base">
        + Add Round
      </button>
      <button
        v-if="game.rounds.length > 0"
        @click="undoLastRound"
        :disabled="deleteRound.isPending.value"
        class="btn-secondary !px-4"
        title="Undo last round"
      >
        ↩
      </button>
    </div>

    <!-- Game controls -->
    <div class="flex gap-2">
      <button
        v-if="game.status === 'active'"
        @click="finishGame"
        class="btn-secondary flex-1 text-sm"
      >
        Finish Game
      </button>
      <button
        v-else
        @click="reactivateGame"
        class="btn-secondary flex-1 text-sm"
      >
        Reactivate
      </button>
      <button @click="showConfirmDelete = true" class="btn-danger text-sm">
        Delete
      </button>
    </div>

    <!-- Delete confirmation -->
    <div v-if="showConfirmDelete" class="card-static p-4 space-y-3" style="border-color: rgba(229,69,69,0.3); background: rgba(229,69,69,0.06)">
      <p class="text-sm" style="color: var(--text-secondary)">Delete this game and all its scores? This can't be undone.</p>
      <div class="flex gap-2">
        <button @click="handleDelete" class="btn-primary !bg-red-600 text-sm">
          Yes, Delete
        </button>
        <button @click="showConfirmDelete = false" class="btn-secondary text-sm">
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
