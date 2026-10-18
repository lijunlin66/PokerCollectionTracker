<template>
  <div
    class="card-item"
    :class="{
      collected: card.isCollected,
      'is-joker': card.suit === 'joker',
      'joker-big': card.id === 'joker_big',
      'joker-small': card.id === 'joker_small'
    }"
    @click="$emit('toggle')"
    :title="card.note ? `备注：${card.note}` : '点击切换收集状态 / 角标编辑备注'"
  >
    <div class="card-corner top-left" :style="{ color: suitColor }">
      {{ cornerLabel }}
    </div>

    <button
      class="note-btn"
      :class="{ 'has-note': !!card.note }"
      @click.stop="$emit('edit-note')"
      :title="card.note ? '编辑备注' : '添加备注'"
    >
      {{ card.note ? '📝' : '✎' }}
    </button>

    <div class="card-center" :style="{ color: suitColor }">
      <span class="card-symbol">{{ displaySymbol }}</span>
      <span class="card-rank">{{ displayRank }}</span>
    </div>

    <div class="card-corner bottom-right" :style="{ color: suitColor }">
      {{ cornerLabel }}
    </div>

    <div v-if="card.isCollected" class="check-mark">✓</div>
    <div v-if="card.isCollected && card.collectedAt" class="collected-time">
      {{ formatDate(card.collectedAt) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Card, Suit } from '@shared/types'
import { SUIT_SYMBOLS } from '@shared/cardData'

const props = defineProps<{ card: Card }>()
defineEmits<{
  (e: 'toggle'): void
  (e: 'edit-note'): void
}>()

const suitColorMap: Record<Suit, string> = {
  spade: 'var(--color-spade)',
  heart: 'var(--color-heart)',
  diamond: 'var(--color-diamond)',
  club: 'var(--color-club)',
  joker: 'var(--color-joker-big)'
}

const suitColor = computed(() => {
  if (props.card.id === 'joker_small') return 'var(--color-joker-small)'
  return suitColorMap[props.card.suit]
})

const cornerLabel = computed(() => {
  if (props.card.suit === 'joker') return ''
  return props.card.rank + SUIT_SYMBOLS[props.card.suit]
})

const displaySymbol = computed(() => {
  if (props.card.suit === 'joker') {
    return props.card.id === 'joker_big' ? '大' : '小'
  }
  return SUIT_SYMBOLS[props.card.suit]
})

const displayRank = computed(() => {
  if (props.card.suit === 'joker') return '王'
  return props.card.rank
})

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    if (!Number.isFinite(d.getTime())) return ''
    return `${d.getMonth() + 1}/${d.getDate()}`
  } catch {
    return ''
  }
}
</script>

<style scoped>
.card-item {
  position: relative;
  aspect-ratio: 2.5 / 3.5;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.2s ease,
    border-color 0.2s ease;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  user-select: none;
}
.card-item:hover {
  background: var(--color-card-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-accent);
}
.card-item:active {
  transform: translateY(-1px);
}
.card-item.collected {
  background: var(--color-card-collected);
  border-color: var(--color-success);
}
.card-item.collected:hover {
  background: #d4ecd6;
}
.card-item.joker-big {
  background: linear-gradient(135deg, #fff7e6 0%, #ffe9c2 100%);
}
.card-item.joker-big.collected {
  background: linear-gradient(135deg, #e8f5e9 0%, #c9eacb 100%);
}
.card-item.joker-small {
  background: linear-gradient(135deg, #f7f8f9 0%, #e4e7e9 100%);
}
.card-item.joker-small.collected {
  background: linear-gradient(135deg, #e8f5e9 0%, #c9eacb 100%);
}
.card-corner {
  position: absolute;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
}
.top-left {
  top: 5px;
  left: 5px;
}
.bottom-right {
  bottom: 5px;
  right: 5px;
  transform: rotate(180deg);
}
.note-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  background: rgba(255, 255, 255, 0.7);
  opacity: 0;
  transition: opacity 0.15s ease, background 0.15s ease;
  z-index: 2;
}
.card-item:hover .note-btn {
  opacity: 1;
}
.note-btn:hover {
  background: #fff;
  transform: scale(1.1);
}
.note-btn.has-note {
  opacity: 1;
  background: rgba(255, 235, 59, 0.4);
}
.card-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  z-index: 1;
}
.card-symbol {
  font-size: 28px;
  line-height: 1;
  font-weight: bold;
}
.card-rank {
  font-size: 15px;
  font-weight: 700;
}
.is-joker .card-symbol {
  font-size: 22px;
}
.is-joker .card-rank {
  font-size: 13px;
}
.check-mark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 54px;
  color: rgba(39, 174, 96, 0.2);
  font-weight: bold;
  pointer-events: none;
}
.collected-time {
  position: absolute;
  bottom: 3px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
</style>
