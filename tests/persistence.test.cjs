const { test } = require('node:test')
const assert = require('node:assert/strict')
const loadTs = require('./load-ts.cjs')

function setup() {
  let disk
  let writes = 0
  class FakeStore {
    constructor({ defaults }) { disk = structuredClone(defaults) }
    get(key) { return structuredClone(disk[key]) }
    get store() { return structuredClone(disk) }
    set(values) { writes++; Object.assign(disk, structuredClone(values)) }
  }
  const api = loadTs('src/main/store.ts', { 'electron-store': FakeStore })
  api.getCards()
  return { api, get disk() { return disk }, get writes() { return writes } }
}

test('invalid data is neither accepted for saving nor silently reset when read', () => {
  const context = setup()
  const original = structuredClone(context.disk)
  assert.throws(() => context.api.saveCards([]))
  assert.deepEqual(context.disk, original)
  context.disk.cards.pop()
  assert.throws(() => context.api.getCards())
  assert.throws(() => context.api.getStore())
  assert.equal(context.disk.cards.length, 53)
  assert.equal(context.writes, 0)
})

test('storage initialization errors occur during a request and can be retried', () => {
  let attempts = 0
  class UnreadableStore {
    constructor() { attempts++; throw new Error('invalid JSON') }
  }
  const api = loadTs('src/main/store.ts', { 'electron-store': UnreadableStore })
  assert.equal(attempts, 0)
  assert.throws(() => api.getCards(), /invalid JSON/)
  assert.throws(() => api.getCards(), /invalid JSON/)
  assert.equal(attempts, 2)
})

test('single-card updates cannot change identity or write invalid field values', () => {
  const { api } = setup()
  for (const patch of [{ id: 'heart_A' }, { suit: 'heart' }, { note: 1 }, { isCollected: 'false' }]) {
    assert.throws(() => api.updateCard('spade_A', patch))
  }
  assert.equal(api.getCards()[0].id, 'spade_A')
  assert.equal(api.getCards()[0].isCollected, false)
})

test('card changes and their update time use one storage write', () => {
  const context = setup()
  const updated = context.api.updateCard('spade_A', { isCollected: true, note: '收藏' })
  assert.equal(updated.isCollected, true)
  assert.equal(context.disk.cards[0].note, '收藏')
  assert.equal(context.writes, 1)
  assert.ok(Number.isFinite(Date.parse(context.disk.updatedAt)))
  context.api.resetCollection()
  assert.equal(context.disk.cards[0].isCollected, false)
  assert.equal(context.disk.cards[0].note, undefined)
  assert.equal(context.writes, 2)
})
