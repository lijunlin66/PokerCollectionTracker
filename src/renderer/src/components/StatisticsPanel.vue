<template>
  <section class="stats-panel">
    <div class="overall">
      <div class="overall-text">
        <span class="label">总进度</span>
        <span class="numbers">
          <strong>{{ stats.collected }}</strong> / {{ stats.total }}
        </span>
        <span class="percent">{{ stats.percentage }}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: stats.percentage + '%' }"></div>
      </div>
    </div>

    <div class="suit-stats">
      <div
        v-for="suit in suits"
        :key="suit.key"
        class="suit-stat"
        :class="{ 'is-complete': stat(suit.key).collected === stat(suit.key).total }"
      >
        <span class="suit-symbol" :style="{ color: suit.color }">{{ suit.symbol }}</span>
        <span class="suit-name">{{ suit.name }}</span>
        <span class="suit-count">
          {{ stat(suit.key).collected }}/{{ stat(suit.key).total }}
        </span>
        <div class="suit-mini-bar">
          <div
            class="suit-mini-fill"
            :style="{
              width: miniPercent(suit.key) + '%',
              background: suit.color
            }"
          ></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CollectionStats, Suit } from '@shared/types'
import { SUIT_SYMBOLS, SUIT_NAMES } from '@shared/cardData'

const props = defineProps<{ stats: CollectionStats }>()

const suitColorMap: Record<Suit, string> = {
  spade: 'var(--color-spade)',
  heart: 'var(--color-heart)',
  diamond: 'var(--color-diamond)',
  club: 'var(--color-club)',
  joker: 'var(--color-joker-big)'
}

const suits = (['spade', 'heart', 'diamond', 'club', 'joker'] as Suit[]).map((k) => ({
  key: k,
  symbol: SUIT_SYMBOLS[k],
  name: SUIT_NAMES[k],
  color: suitColorMap[k]
}))

function stat(suit: Suit) {
  return props.stats.bySuit[suit]
}
function miniPercent(suit: Suit): number {
  const s = stat(suit)
  return s.total ? Math.round((s.collected / s.total) * 100) : 0
}
</script>

<style scoped>
.stats-panel {
  display: flex;
  gap: 24px;
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid var(--color-border);
  align-items: center;
  flex-wrap: wrap;
}
.overall {
  flex: 1;
  min-width: 260px;
}
.overall-text {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 6px;
}
.label {
  font-size: 13px;
  color: var(--color-text-secondary);
}
.numbers {
  font-size: 14px;
}
.numbers strong {
  font-size: 22px;
  color: var(--color-primary);
}
.percent {
  margin-left: auto;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-success);
}
.progress-bar {
  height: 12px;
  background: #eef0f3;
  border-radius: 6px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-success));
  border-radius: 6px;
  transition: width 0.3s ease;
}
.suit-stats {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}
.suit-stat {
  display: grid;
  grid-template-columns: auto auto auto;
  grid-template-rows: auto auto;
  align-items: center;
  gap: 2px 8px;
  padding: 8px 12px;
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  min-width: 110px;
  position: relative;
}
.suit-symbol {
  font-size: 18px;
  grid-row: 1;
  grid-column: 1;
}
.suit-name {
  font-size: 12px;
  color: var(--color-text-secondary);
  grid-row: 1;
  grid-column: 2;
}
.suit-count {
  font-size: 13px;
  font-weight: 600;
  grid-row: 1;
  grid-column: 3;
}
.suit-mini-bar {
  grid-row: 2;
  grid-column: 1 / -1;
  height: 4px;
  background: #fff;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 2px;
}
.suit-mini-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}
.suit-stat.is-complete {
  background: var(--color-card-collected);
}
.suit-stat.is-complete::after {
  content: '✓';
  position: absolute;
  top: 4px;
  right: 6px;
  color: var(--color-success);
  font-size: 12px;
  font-weight: bold;
}
</style>
