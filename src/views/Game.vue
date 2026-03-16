<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGame, useUpdateGame, useDeleteGame, useDeleteRound } from '../composables/useApi'
import { getMode } from '../lib/modes'
import ScoreGrid from '../components/ScoreGrid.vue'
import AddRoundModal from '../components/AddRoundModal.vue'
import EditScoreModal from '../components/EditScoreModal.vue'
import AddPlayerModal from '../components/AddPlayerModal.vue'
import ModeIcon from '../components/ModeIcon.vue'

const route = useRoute()
const router = useRouter()
const gameId = computed(() => Number(route.params.id))
const { data: game, isLoading } = useGame(gameId)
const updateGame = useUpdateGame()
const deleteGame = useDeleteGame()
const deleteRound = useDeleteRound()

const showAddRound = ref(false)
const showConfirmDelete = ref(false)
const showAddPlayer = ref(false)
const editTarget = ref<{ roundId: number; roundNumber: number; playerId: number; playerName: string; currentPoints: number } | null>(null)

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
    <div class="card-static p-4">
      <div class="h-5 rounded" style="background: var(--border); width: 50%"></div>
      <div class="h-3 rounded mt-2" style="background: var(--border); width: 30%"></div>
    </div>
  </div>

  <!-- Not found -->
  <div v-else-if="!game" class="card-static text-center py-16">
    <p style="color: var(--text-dim)">game not found</p>
  </div>

  <div v-else class="space-y-4">
    <!-- Back link -->
    <button @click="router.push('/')" class="btn-ghost !px-0 text-xs" style="color: var(--text-dim)">
      ← back to games
    </button>

    <!-- Header -->
    <div class="card-static p-4">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
          <span style="color: var(--green); filter: drop-shadow(0 0 6px rgba(51, 255, 51, 0.3))"><ModeIcon v-if="mode" :name="mode.icon" :size="28" /></span>
          <div>
            <h1 class="text-base font-bold" style="color: var(--text-bright)">{{ game.name }}</h1>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="badge badge-mode">{{ mode?.label }}</span>
              <span class="text-[10px]" style="color: var(--text-dim)">
                {{ mode?.scoreLabel }} · {{ mode?.sortDirection === 'high' ? 'highest wins' : 'lowest wins' }}
              </span>
            </div>
          </div>
        </div>
        <span :class="['badge', game.status === 'active' ? 'badge-active' : 'badge-finished']">
          {{ game.status === 'active' ? 'live' : 'done' }}
        </span>
      </div>
    </div>

    <!-- Score Grid -->
    <div class="card-static overflow-hidden">
      <ScoreGrid :game="game" :mode="mode!" :editable="game.status === 'active'" @editScore="editTarget = $event" />
    </div>

    <!-- Actions -->
    <div v-if="game.status === 'active'" class="flex gap-2">
      <button @click="showAddRound = true" class="btn-primary flex-1">
        + add round
      </button>
      <button @click="showAddPlayer = true" class="btn-secondary !px-4" title="Add player">
        + player
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
        class="btn-secondary flex-1"
      >
        finish game
      </button>
      <button
        v-else
        @click="reactivateGame"
        class="btn-secondary flex-1"
      >
        reactivate
      </button>
      <button @click="showConfirmDelete = true" class="btn-danger">
        delete
      </button>
    </div>

    <!-- Delete confirmation -->
    <div v-if="showConfirmDelete" class="card-static p-4 space-y-3" style="border-color: rgba(255,68,68,0.3)">
      <p class="text-xs" style="color: var(--text-dim)">delete this game and all scores? this can't be undone.</p>
      <div class="flex gap-2">
        <button @click="handleDelete" class="btn-danger">yes, delete</button>
        <button @click="showConfirmDelete = false" class="btn-secondary">cancel</button>
      </div>
    </div>

    <!-- Add Round Modal -->
    <AddRoundModal
      v-if="showAddRound"
      :game="game"
      :mode="mode!"
      @close="showAddRound = false"
    />

    <!-- Edit Score Modal -->
    <EditScoreModal
      v-if="editTarget"
      :game-id="game.id"
      :round-id="editTarget.roundId"
      :round-number="editTarget.roundNumber"
      :player-id="editTarget.playerId"
      :player-name="editTarget.playerName"
      :current-points="editTarget.currentPoints"
      @close="editTarget = null"
    />

    <!-- Add Player Modal -->
    <AddPlayerModal
      v-if="showAddPlayer"
      :game="game"
      @close="showAddPlayer = false"
    />
  </div>
</template>
