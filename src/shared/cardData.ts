// 卡片数据集生成 - 生成完整 54 张扑克牌
import type { Card, Rank, Suit } from './types'

export const SUITS: readonly Suit[] = ['spade', 'heart', 'diamond', 'club'] as const

export const RANKS: readonly Rank[] = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K'
] as const

export const SUIT_SYMBOLS: Record<Suit, string> = {
  spade: '♠',
  heart: '♥',
  diamond: '♦',
  club: '♣',
  joker: '🃏'
}

export const SUIT_NAMES: Record<Suit, string> = {
  spade: '黑桃',
  heart: '红心',
  diamond: '方块',
  club: '梅花',
  joker: '王'
}

/** 生成完整 54 张扑克牌（4 花色 × 13 + 大小王） */
export function generateDeck(): Card[] {
  const cards: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({
        id: `${suit}_${rank}`,
        suit,
        rank,
        displayName: `${rank}${SUIT_SYMBOLS[suit]}`,
        isCollected: false
      })
    }
  }
  cards.push({
    id: 'joker_big',
    suit: 'joker',
    rank: 'JOKER',
    displayName: '🃏大王',
    isCollected: false
  })
  cards.push({
    id: 'joker_small',
    suit: 'joker',
    rank: 'JOKER',
    displayName: '🃏小王',
    isCollected: false
  })
  return cards
}

/** 花色排序权重（黑桃>红心>方块>梅花>王） */
export const SUIT_ORDER: Record<Suit, number> = {
  spade: 0,
  heart: 1,
  diamond: 2,
  club: 3,
  joker: 4
}

/** 点数排序权重 */
export const RANK_ORDER: Record<Rank, number> = {
  A: 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  J: 11,
  Q: 12,
  K: 13,
  JOKER: 14
}

/** 大小王内部排序：小王在前，大王在后 */
export function jokerSortWeight(id: string): number {
  if (id === 'joker_small') return 0
  if (id === 'joker_big') return 1
  return 0
}
