<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCreateGame } from '../composables/useApi'
import { gameModes } from '../lib/modes'
import ModeIcon from '../components/ModeIcon.vue'
import { Lock, Users, Eye } from 'lucide-vue-next'

const router = useRouter()
const createGame = useCreateGame()

const name = ref('')
const mode = ref('generic')
const accessMode = ref<'solo' | 'collaborative' | 'spectator'>('solo')
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
  if (!name.value.trim()) { error.value = 'game name is required'; return }
  if (accessMode.value !== 'collaborative' && trimmedPlayers.length < 2) {
    error.value = 'at least 2 players required'; return
  }

  try {
    const game = await createGame.mutateAsync({
      name: name.value.trim(),
      mode: mode.value,
      players: trimmedPlayers,
      access_mode: accessMode.value,
    })
    router.push(`/game/${game.id}`)
  } catch (e: any) {
    error.value = e.message
  }
}
</script>

<template>
  <div class="space-y-5">
    <!-- Error -->
    <div v-if="error" class="card-static px-4 py-3" style="border-color: rgba(255,68,68,0.3); background: rgba(255,68,68,0.05)">
      <p class="text-xs" style="color: var(--red)">{{ error }}</p>
    </div>

    <!-- Game Name -->
    <div>
      <label class="section-label block mb-2">game name</label>
      <input v-model="name" type="text" placeholder="friday night cards" class="input" />
    </div>

    <!-- Game Mode -->
    <div>
      <label class="section-label block mb-3">game mode</label>
      <div class="grid grid-cols-4 gap-2">
        <button
          v-for="m in gameModes"
          :key="m.key"
          @click="mode = m.key"
          :class="['mode-btn', mode === m.key ? 'active' : '']"
        >
          <span :style="{ color: mode === m.key ? 'var(--green)' : 'var(--text-dim)' }"><ModeIcon :name="m.icon" :size="20" /></span>
          <span class="text-[9px] uppercase tracking-wider" :style="{ color: mode === m.key ? 'var(--green)' : 'var(--text-dim)' }">{{ m.label }}</span>
        </button>
      </div>
      <div class="card-static mt-3 px-4 py-3">
        <p class="text-xs" style="color: var(--text-dim)">
          <span style="color: var(--amber)">{{ gameModes.find(m => m.key === mode)?.label }}</span>
          — {{ gameModes.find(m => m.key === mode)?.description }}
        </p>
      </div>
    </div>

    <!-- Access Mode -->
    <div>
      <label class="section-label block mb-3">sharing</label>
      <div class="grid grid-cols-3 gap-2">
        <button
          @click="accessMode = 'solo'"
          :class="['mode-btn', accessMode === 'solo' ? 'active' : '']"
        >
          <Lock :size="18" :style="{ color: accessMode === 'solo' ? 'var(--green)' : 'var(--text-dim)' }" />
          <span class="text-[9px] uppercase tracking-wider" :style="{ color: accessMode === 'solo' ? 'var(--green)' : 'var(--text-dim)' }">solo</span>
        </button>
        <button
          @click="accessMode = 'collaborative'"
          :class="['mode-btn', accessMode === 'collaborative' ? 'active' : '']"
        >
          <Users :size="18" :style="{ color: accessMode === 'collaborative' ? 'var(--green)' : 'var(--text-dim)' }" />
          <span class="text-[9px] uppercase tracking-wider" :style="{ color: accessMode === 'collaborative' ? 'var(--green)' : 'var(--text-dim)' }">collab</span>
        </button>
        <button
          @click="accessMode = 'spectator'"
          :class="['mode-btn', accessMode === 'spectator' ? 'active' : '']"
        >
          <Eye :size="18" :style="{ color: accessMode === 'spectator' ? 'var(--green)' : 'var(--text-dim)' }" />
          <span class="text-[9px] uppercase tracking-wider" :style="{ color: accessMode === 'spectator' ? 'var(--green)' : 'var(--text-dim)' }">spectate</span>
        </button>
      </div>
      <div class="card-static mt-3 px-4 py-3">
        <p class="text-xs" style="color: var(--text-dim)">
          <template v-if="accessMode === 'solo'">
            <span style="color: var(--amber)">Solo</span> — only you can view and edit scores
          </template>
          <template v-else-if="accessMode === 'collaborative'">
            <span style="color: var(--amber)">Collaborative</span> — anyone with the link can add scores
          </template>
          <template v-else>
            <span style="color: var(--amber)">Spectator</span> — others can watch, only you can edit
          </template>
        </p>
      </div>
    </div>

    <!-- Players -->
    <div>
      <label class="section-label block mb-3">players</label>
      <div class="space-y-2">
        <div v-for="(_, i) in playerNames" :key="i" class="flex gap-2 items-center">
          <span class="text-xs w-5 text-center" style="color: var(--green-dim)">{{ i + 1 }}</span>
          <input
            v-model="playerNames[i]"
            type="text"
            :placeholder="`player ${i + 1}`"
            class="input"
            @keydown.enter="i === playerNames.length - 1 ? addPlayer() : undefined"
          />
          <button
            v-if="playerNames.length > 2"
            @click="removePlayer(i)"
            class="btn-ghost flex-shrink-0 !p-2"
            style="color: var(--text-dim)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <button @click="addPlayer" class="btn-ghost text-xs mt-2" style="color: var(--green-dim)">
        + add player
      </button>
      <p v-if="accessMode === 'collaborative'" class="text-[10px] mt-2" style="color: var(--text-dim)">
        players can also join via share link after creating the game
      </p>
    </div>

    <!-- Submit -->
    <button @click="submit" :disabled="createGame.isPending.value" class="btn-primary w-full">
      {{ createGame.isPending.value ? 'creating...' : 'start game →' }}
    </button>
  </div>
</template>
