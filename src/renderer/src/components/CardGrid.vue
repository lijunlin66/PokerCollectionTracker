<template>
  <div class="card-grid-wrap">
    <!-- 分组视图：无搜索 + 默认排序 + 无筛选状态时，按花色分组换行 -->
    <template v-if="isGroupedView">
      <section v-for="group in groupedCards" :key="group.suit" class="suit-group">
        <div class="suit-group-header">
          <span class="group-symbol" :style="{ color: group.color }">
            {{ group.symbol }}
          </span>
          <span class="group-name">{{ group.name }}</span>
          <span class="group-count">
            {{ group.cards.filter((c) => c.isCollected).length }}/{{ group.cards.length }}
          </span>
        </div>
        <div class="card-grid">
          <CardItem
            v-for="card in group.cards"
            :key="card.id"
            :card="card"
            @toggle="$emit('toggle', card.id)"
            @edit-note="$emit('edit-note', card)"
          />
        </div>
      </section>
    </template>

    <!-- 平铺视图：搜索 / 排序 / 筛选时 -->
    <div v-else class="card-grid">
      <CardItem
        v-for="card in cards"
        :key="card.id"
        :card="card"
        @toggle="$emit('toggle', card.id)"
        @edit-note="$emit('edit-note', card)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Card, Suit } from '@shared/types'
import { SUIT_SYMBOLS, SUIT_NAMES } from '@shared/cardData'
import { useCollectionStore } from '../stores/collection'
import CardItem from './CardItem.vue'

const props = defineProps<{ cards: Card[] }>()
defineEmits<{
  (e: 'toggle', cardId: string): void
  (e: 'edit-note', card: Card): void
}>()

const store = useCollectionStore()

/** 进入分组视图的条件：默认排序 + 空搜索 + 花色状态筛选未启用 */
const isGroupedView = computed(() => {
  return (
    store.sortBy === 'default' &&
    !store.searchQuery.trim() &&
    store.filterSuit === 'all' &&
    store.filterStatus === 'all'
  )
})

const suitColorMap: Record<Suit, string> = {
  spade: 'var(--color-spade)',
  heart: 'var(--color-heart)',
  diamond: 'var(--color-diamond)',
  club: 'var(--color-club)',
  joker: 'var(--color-joker-big)'
}

const SUIT_ORDER_LIST: Suit[] = ['spade', 'heart', 'diamond', 'club', 'joker']

const groupedCards = computed(() => {
  return SUIT_ORDER_LIST.map((suit) => ({
    suit,
    symbol: SUIT_SYMBOLS[suit],
    name: SUIT_NAMES[suit],
    color: suit === 'joker' ? suitColorMap.joker : suitColorMap[suit],
    cards: props.cards.filter((c) => c.suit === suit)
  })).filter((g) => g.cards.length > 0)
})
</script>

<style scoped>
.card-grid-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.suit-group {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 10px 12px 12px;
  box-shadow: var(--shadow-sm);
}
.suit-group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--color-bg);
}
.group-symbol {
  font-size: 20px;
  font-weight: bold;
}
.group-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}
.group-count {
  margin-left: auto;
  font-size: 12px;
  color: var(--color-text-secondary);
  background: var(--color-bg);
  padding: 2px 8px;
  border-radius: 10px;
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}
@media (max-width: 1100px) {
  .card-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}
@media (max-width: 900px) {
  .card-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
@media (max-width: 700px) {
  .card-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 520px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
