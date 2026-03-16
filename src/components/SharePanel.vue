<script setup lang="ts">
import { ref, onMounted } from 'vue'
import QRCode from 'qrcode'
import { Copy, Check, Link } from 'lucide-vue-next'

const props = defineProps<{
  shareCode: string
  accessMode: string
}>()

const qrSvg = ref('')
const copied = ref(false)

const shareUrl = `tally.notdone.dev/g/${props.shareCode}`
const fullUrl = `https://${shareUrl}`

onMounted(async () => {
  const svg = await QRCode.toString(fullUrl, {
    type: 'svg',
    color: { dark: '#33ff33', light: '#0a0a0a' },
    margin: 1,
    width: 160,
  })
  qrSvg.value = svg
})

async function copyUrl() {
  await navigator.clipboard.writeText(fullUrl)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

const modeLabels: Record<string, string> = {
  collaborative: 'collaborative',
  spectator: 'spectator',
}
</script>

<template>
  <div class="card-static p-4 space-y-3">
    <div class="flex items-center justify-between">
      <span class="section-label !text-[10px]">share game</span>
      <span class="badge badge-active !text-[9px]">{{ modeLabels[accessMode] || accessMode }}</span>
    </div>

    <!-- QR Code -->
    <div class="flex justify-center py-2">
      <div v-if="qrSvg" v-html="qrSvg" class="qr-container" />
      <div v-else class="w-40 h-40 rounded" style="background: var(--border)" />
    </div>

    <!-- Share URL + Copy -->
    <div class="flex items-center gap-2">
      <div class="flex-1 flex items-center gap-2 px-3 py-2 rounded" style="background: var(--bg); border: 1px solid var(--border)">
        <Link :size="12" style="color: var(--text-dim); flex-shrink: 0" />
        <span class="text-xs truncate" style="color: var(--green)">{{ shareUrl }}</span>
      </div>
      <button @click="copyUrl" class="btn-secondary !px-3 !py-2 flex items-center gap-1.5">
        <component :is="copied ? Check : Copy" :size="14" />
        <span class="text-[10px]">{{ copied ? 'copied' : 'copy' }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.qr-container :deep(svg) {
  border-radius: 4px;
  border: 1px solid var(--border);
}
</style>
