<script setup lang="ts">
import { computed, type Component } from 'vue'
import {
  Target,
  Layers,
  Spade,
  Heart,
  Gauge,
  Crown,
  Club,
  ListOrdered,
  SquareStack,
  ALargeSmall,
  Dice5,
  CircleDollarSign,
  HelpCircle,
  Hash,
  Trophy,
} from 'lucide-vue-next'

const props = defineProps<{
  name: string
  size?: number
}>()

const iconMap: Record<string, Component> = {
  target: Target,
  layers: Layers,
  spade: Spade,
  heart: Heart,
  gauge: Gauge,
  crown: Crown,
  club: Club,
  'list-ordered': ListOrdered,
  'square-stack': SquareStack,
  'a-large-small': ALargeSmall,
  'dice-5': Dice5,
  'circle-dollar-sign': CircleDollarSign,
  hash: Hash,
  trophy: Trophy,
}

const iconComponent = computed(() => iconMap[props.name] || HelpCircle)
</script>

<template>
  <component :is="iconComponent" :size="size || 20" />
</template>
