const { test } = require('node:test')
const assert = require('node:assert/strict')
const { createPinia, setActivePinia } = require('pinia')
const loadTs = require('./load-ts.cjs')
const { generateDeck } = loadTs('src/shared/cardData.ts')
const { useCollectionStore } = loadTs('src/renderer/src/stores/collection.ts')

function setup(overrides = {}) {
  let disk = generateDeck()
  const calls = []
  const api = {
    async getCards() { return structuredClone(disk) },
    async saveCards(cards) {
      // 与 Electron IPC 同样拒绝 Vue Proxy。
      disk = structuredClone(cards)
      calls.push('save')
      return true
    },
    async updateCard(id, data) {
      calls.push('update')
      const index = disk.findIndex((card) => card.id === id)
      disk[index] = { ...disk[index], ...structuredClone(data) }
      return structuredClone(disk[index])
    },
    async resetCollection() { calls.push('reset'); disk = generateDeck(); return structuredClone(disk) },
    async exportData() { calls.push('export'); return 'backup.json' },
    async importData() { calls.push('import'); disk = generateDeck(); return structuredClone(disk) },
    ...overrides
  }
  global.window = { electronAPI: api }
  setActivePinia(createPinia())
  return { store: useCollectionStore(), api, calls, get disk() { return disk } }
}

test('batch save serializes plain cards and obeys suit/status/search filters', async () => {
  const context = setup()
  const { store } = context
  await store.loadCards()
  store.filterSuit = 'heart'
  store.filterStatus = 'uncollected'
  store.searchQuery = 'A♥'
  assert.equal(await store.batchMarkFiltered(true), true)
  assert.deepEqual(context.disk.filter((card) => card.isCollected).map((card) => card.id), ['heart_A'])
  assert.equal(store.stats.collected, 1)
  assert.equal(store.error, null)
})

test('repeated batch marking preserves existing collection dates and avoids redundant writes', async () => {
  const context = setup()
  await context.store.loadCards()
  await context.store.setCollected('spade_A', true)
  const date = context.disk[0].collectedAt
  await context.store.batchMark('all', true)
  assert.equal(context.disk[0].collectedAt, date)
  const count = context.calls.length
  await context.store.batchMark('all', true)
  assert.equal(context.calls.length, count)
})

test('failed writes leave UI at the persisted state, show an error and permit retry', async () => {
  const context = setup()
  const { store, api } = context
  await store.loadCards()
  const original = api.updateCard
  api.updateCard = async () => { throw new Error('disk full') }
  assert.equal(await store.toggleCollect('spade_A'), false)
  assert.equal(store.cards[0].isCollected, false)
  assert.equal(store.lastSavedAt, null)
  assert.match(store.error, /disk full/)
  assert.equal(store.saving, false)
  api.updateCard = original
  assert.equal(await store.toggleCollect('spade_A'), true)
  assert.equal(store.cards[0].isCollected, true)
  assert.equal(store.error, null)
})

test('failed batch and note saves never change displayed data or signal success', async () => {
  const { store } = setup({
    async saveCards() { throw new Error('write failed') },
    async updateCard() { return null }
  })
  await store.loadCards()
  assert.equal(await store.batchMark('all', true), false)
  assert.equal(store.stats.collected, 0)
  assert.equal(await store.updateNote('spade_A', 'unsaved'), false)
  assert.equal(store.cards[0].note, undefined)
  assert.equal(store.lastSavedAt, null)
})

test('rapid toggles, reset and export are persisted in request order', async () => {
  const context = setup()
  const { store, api, calls } = context
  await store.loadCards()
  let release
  const gate = new Promise((resolve) => { release = resolve })
  const original = api.updateCard
  api.updateCard = async (...args) => { await gate; return original(...args) }
  const first = store.toggleCollect('spade_A')
  const second = store.toggleCollect('spade_A')
  const reset = store.resetCollection()
  const third = store.toggleCollect('heart_A')
  const exported = store.exportData('json')
  assert.equal(store.saving, true)
  await Promise.resolve()
  assert.deepEqual(calls, [])
  release()
  await Promise.all([first, second, reset, third, exported])
  assert.deepEqual(calls, ['update', 'update', 'reset', 'update', 'export'])
  assert.equal(store.cards[0].isCollected, false)
  assert.equal(store.getCardById('heart_A').isCollected, true)
  assert.equal(store.saving, false)
})

test('batch targets are captured before filters change while a prior save is pending', async () => {
  const { store } = setup()
  await store.loadCards()
  const first = store.toggleCollect('spade_A')
  store.filterSuit = 'heart'
  const batch = store.batchMarkFiltered(true)
  store.filterSuit = 'club'
  await Promise.all([first, batch])
  assert.equal(store.stats.bySuit.heart.collected, 13)
  assert.equal(store.stats.bySuit.club.collected, 0)
})

test('load failure does not invent an empty collection that can overwrite user data', async () => {
  const { store, calls } = setup({ async getCards() { throw new Error('invalid data') } })
  await store.loadCards()
  assert.equal(store.cards.length, 0)
  assert.match(store.error, /invalid data/)
  assert.equal(await store.batchMark('all', true), false)
  assert.deepEqual(calls, [])
})

test('cancelled import preserves data and export rejection is visible', async () => {
  const { store } = setup({
    async importData() { return null },
    async exportData() { throw new Error('permission denied') }
  })
  await store.loadCards()
  await store.toggleCollect('spade_A')
  assert.equal(await store.importData(), false)
  assert.equal(store.cards[0].isCollected, true)
  assert.equal(await store.exportData('json'), null)
  assert.match(store.error, /permission denied/)
})
