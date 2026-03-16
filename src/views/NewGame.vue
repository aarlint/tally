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
    <h1 class="text-2xl font-bold">New Game</h1>

    <div v-if="error" class="bg-red-900/30 border border-red-800 rounded-lg px-4 py-2 text-red-400 text-sm">
      {{ error }}
    </div>

    <!-- Game Name -->
    <div>
      <label class="block text-sm font-medium text-gray-400 mb-1">Game Name</label>
      <input
        v-model="name"
        type="text"
        placeholder="Friday Night Cards"
        class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
      />
    </div>

    <!-- Game Mode -->
    <div>
      <label class="block text-sm font-medium text-gray-400 mb-2">Game Mode</label>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="m in gameModes"
          :key="m.key"
          @click="mode = m.key"
          :class="[
            'flex flex-col items-center gap-1 p-3 rounded-lg border text-sm transition',
            mode === m.key
              ? 'border-indigo-500 bg-indigo-950/50'
              : 'border-gray-800 bg-gray-900 hover:border-gray-600'
          ]"
        >
          <span class="text-xl">{{ m.icon }}</span>
          <span class="text-xs">{{ m.label }}</span>
        </button>
      </div>
      <p class="text-xs text-gray-500 mt-2">
        {{ gameModes.find(m => m.key === mode)?.description }}
      </p>
    </div>

    <!-- Players -->
    <div>
      <label class="block text-sm font-medium text-gray-400 mb-2">Players</label>
      <div class="space-y-2">
        <div v-for="(_, i) in playerNames" :key="i" class="flex gap-2">
          <input
            v-model="playerNames[i]"
            type="text"
            :placeholder="`Player ${i + 1}`"
            class="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            @keydown.enter="i === playerNames.length - 1 ? addPlayer() : undefined"
          />
          <button
            v-if="playerNames.length > 2"
            @click="removePlayer(i)"
            class="px-3 text-gray-500 hover:text-red-400 transition"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <button @click="addPlayer" class="mt-2 text-sm text-indigo-400 hover:text-indigo-300 transition">
        + Add Player
      </button>
    </div>

    <!-- Submit -->
    <button
      @click="submit"
      :disabled="createGame.isPending.value"
      class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg font-medium transition"
    >
      {{ createGame.isPending.value ? 'Creating...' : 'Start Game' }}
    </button>
  </div>
</template>
