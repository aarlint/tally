<script setup lang="ts">
defineProps<{
  players: { id: number; name: string }[]
}>()
</script>

<template>
  <div class="flex flex-wrap gap-1.5">
    <span
      v-for="player in players"
      :key="player.id"
      class="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-300"
    >
      {{ player.name }}
    </span>
  </div>
</template>
