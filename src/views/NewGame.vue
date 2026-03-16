<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCreateGame } from '../composables/useApi'
import { gameModes } from '../lib/modes'

const router = useRouter()
const createGame = useCreateGame()

const name = ref('')
const mode = ref('generic')
const playerNames = ref(['', ''])
const error = ref('')

function addPlayer() {
  playerNames.value.push('')
}

function removePlayer(i: number) {
  if (playerNames.value.length > 2) {
    playerNames.value.splice(i, 1)
  }
}

async function submit() {
  error.value = ''
  const trimmedPlayers = playerNames.value.map(p => p.trim()).filter(Boolean)
  if (!name.value.trim()) { error.value = 'Game name is required'; return }
  if (trimmedPlayers.length < 2) { error.value = 'At least 2 players required'; return }

  try {
    const game = await createGame.mutateAsync({
      name: name.value.trim(),
      mode: mode.value,
      players: trimmedPlayers,
    })
    router.push(`/game/${game.id}`)
  } catch (e: any) {
    error.value = e.message
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="font-display text-2xl font-bold tracking-tight">New Game</h1>
      <p style="color: var(--text-muted)" class="text-sm mt-0.5">Set up your game and players</p>
    </div>

    <!-- Error -->
    <div v-if="error" class="card-static px-4 py-3" style="border-color: rgba(229,69,69,0.3); background: rgba(229,69,69,0.08)">
      <p class="text-sm" style="color: var(--red)">{{ error }}</p>
    </div>

    <!-- Game Name -->
    <div>
      <label class="block text-xs font-semibold uppercase tracking-wider mb-2" style="color: var(--text-muted)">Game Name</label>
      <input v-model="name" type="text" placeholder="Friday Night Cards" class="input" />
    </div>

    <!-- Game Mode -->
    <div>
      <label class="block text-xs font-semibold uppercase tracking-wider mb-3" style="color: var(--text-muted)">Game Mode</label>
      <div class="grid grid-cols-4 gap-2">
        <button
          v-for="m in gameModes"
          :key="m.key"
          @click="mode = m.key"
          :class="['mode-btn', mode === m.key ? 'active' : '']"
        >
          <span class="text-xl">{{ m.icon }}</span>
          <span class="text-[10px] font-medium" :style="{ color: mode === m.key ? 'var(--text-primary)' : 'var(--text-secondary)' }">{{ m.label }}</span>
        </button>
      </div>
      <div class="card-static mt-3 px-4 py-3">
        <p class="text-xs" style="color: var(--text-secondary)">
          <span class="font-semibold" style="color: var(--text-primary)">{{ gameModes.find(m => m.key === mode)?.label }}</span>
          — {{ gameModes.find(m => m.key === mode)?.description }}
        </p>
      </div>
    </div>

    <!-- Players -->
    <div>
      <label class="block text-xs font-semibold uppercase tracking-wider mb-3" style="color: var(--text-muted)">Players</label>
      <div class="space-y-2">
        <div v-for="(_, i) in playerNames" :key="i" class="flex gap-2 items-center">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style="background: var(--accent-glow); color: var(--accent)">
            {{ i + 1 }}
          </div>
          <input
            v-model="playerNames[i]"
            type="text"
            :placeholder="`Player ${i + 1}`"
            class="input"
            @keydown.enter="i === playerNames.length - 1 ? addPlayer() : undefined"
          />
          <button
            v-if="playerNames.length > 2"
            @click="removePlayer(i)"
            class="btn-ghost flex-shrink-0 !p-2"
            style="color: var(--text-muted)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <button @click="addPlayer" class="btn-ghost text-xs mt-2" style="color: var(--accent)">
        + Add Player
      </button>
    </div>

    <!-- Submit -->
    <button @click="submit" :disabled="createGame.isPending.value" class="btn-primary w-full text-base">
      {{ createGame.isPending.value ? 'Creating...' : 'Start Game' }}
    </button>
  </div>
</template>
