<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useGameByCode, useUpdateGame, useDeleteRound } from '../composables/useApi'
import { getMode } from '../lib/modes'
import { isGameOwner } from '../lib/ownership'
import ScoreGrid from '../components/ScoreGrid.vue'
import AddRoundModal from '../components/AddRoundModal.vue'
import EditScoreModal from '../components/EditScoreModal.vue'
import AddPlayerModal from '../components/AddPlayerModal.vue'
import ModeIcon from '../components/ModeIcon.vue'
import SharePanel from '../components/SharePanel.vue'

const route = useRoute()
const code = computed(() => route.params.code as string)

const { data: game, isLoading } = useGameByCode(code, { refetchInterval: 3000 })

const showAddRound = ref(false)
const showAddPlayer = ref(false)
const editTarget = ref<{ roundId: number; roundNumber: number; playerId: number; playerName: string; currentPoints: number } | null>(null)

const deleteRound = useDeleteRound()

const mode = computed(() => game.value ? getMode(game.value.mode) : null)
const owner = computed(() => game.value ? isGameOwner(game.value.id) : false)
const canEdit = computed(() => {
  if (!game.value) return false
  if (owner.value) return true
  return game.value.access_mode === 'collaborative'
})

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
    <p class="text-xs mt-2" style="color: var(--text-dim)">check the link and try again</p>
  </div>

  <div v-else class="space-y-4">
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
        <div class="flex flex-col items-end gap-1">
          <span :class="['badge', game.status === 'active' ? 'badge-active' : 'badge-finished']">
            {{ game.status === 'active' ? 'live' : 'done' }}
          </span>
          <span v-if="!canEdit" class="badge badge-finished !text-[8px]">spectating</span>
          <span v-else-if="!owner" class="badge badge-active !text-[8px]">collaborative</span>
        </div>
      </div>
    </div>

    <!-- Share Panel (owner only) -->
    <SharePanel
      v-if="owner && game.access_mode !== 'solo'"
      :share-code="game.share_code"
      :access-mode="game.access_mode"
    />

    <!-- Score Grid -->
    <div class="card-static overflow-hidden">
      <ScoreGrid :game="game" :mode="mode!" :editable="canEdit && game.status === 'active'" @editScore="editTarget = $event" />
    </div>

    <!-- Actions (only if can edit and game is active) -->
    <div v-if="canEdit && game.status === 'active'" class="flex gap-2">
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

    <!-- Auto-refresh indicator for non-owners -->
    <div v-if="!owner" class="text-center">
      <span class="text-[10px]" style="color: var(--text-dim)">auto-refreshing every 3s</span>
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
