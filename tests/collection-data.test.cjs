const { test } = require('node:test')
const assert = require('node:assert/strict')
const loadTs = require('./load-ts.cjs')
const { generateDeck } = loadTs('src/shared/cardData.ts')
const { cardsToCsv, parseImport, validateCards } = loadTs('src/shared/collectionData.ts')
const plain = (value) => JSON.parse(JSON.stringify(value))

test('CSV round trip preserves Chinese notes, commas, quotes, CRLF and embedded newlines', () => {
  const deck = generateDeck()
  deck[0] = { ...deck[0], isCollected: true, note: '来源："朋友", 收藏\r\n第二行\n第三行', collectedAt: '2026-10-18T01:00:00.000Z' }
  deck[53].note = '末尾逗号,'
  assert.deepEqual(plain(parseImport('\ufeff' + cardsToCsv(deck), 'csv')), plain(deck))
})

test('JSON accepts BOM, array and object exports without converting string false to true', () => {
  const cards = [{ id: 'spade_A', isCollected: 'false', note: '保留备注' }]
  for (const data of [cards, { cards }]) {
    const deck = parseImport('\ufeff' + JSON.stringify(data), 'json')
    assert.equal(deck.length, 54)
    assert.equal(deck[0].isCollected, false)
    assert.equal(deck[0].note, '保留备注')
    assert.ok(validateCards(deck))
  }
})

test('import rejects unknown/duplicate IDs, missing or invalid states, notes and dates', () => {
  const valid = { id: 'spade_A', isCollected: true }
  for (const input of [
    [], [null], [{ ...valid, id: 'unknown' }], [valid, valid],
    [{ id: 'spade_A' }], [{ ...valid, isCollected: 'no' }],
    [{ ...valid, isCollected: 1 }], [{ ...valid, note: 123 }],
    [{ ...valid, collectedAt: 'not-a-date' }], [valid, { ...valid, id: 'unknown' }]
  ]) assert.throws(() => parseImport(JSON.stringify(input), 'json'))
  assert.throws(() => parseImport('null', 'json'))
  assert.throws(() => parseImport('{}', 'json'))
})

test('CSV rejects truncated rows, malformed quotes and missing/duplicate columns', () => {
  for (const csv of [
    'id,note\nspade_A,abc',
    'id,isCollected,isCollected\nspade_A,true,false',
    'id,isCollected,note\nspade_A,true',
    'id,isCollected,note\nspade_A,true,"unclosed',
    'id,isCollected,note\nspade_A,true,"closed"junk',
    'id,isCollected\nspade_A,maybe',
    'id,isCollected\nunknown,true'
  ]) assert.throws(() => parseImport(csv, 'csv'))
})

test('CSV allows reordered headers, blank lines and a final record without newline', () => {
  const deck = parseImport(' note , ISCOLLECTED , id \r\n\r\n"备注", FALSE ,spade_A', 'csv')
  assert.equal(deck[0].isCollected, false)
  assert.equal(deck[0].note, '备注')
})

test('import restores canonical card metadata and clears timestamps on uncollected cards', () => {
  const deck = parseImport(JSON.stringify([{ id: 'spade_A', suit: 'invalid', displayName: 'bad', isCollected: false, collectedAt: '2026-10-18T01:00:00Z' }]), 'json')
  assert.equal(deck[0].suit, 'spade')
  assert.equal(deck[0].displayName, 'A♠')
  assert.equal(deck[0].collectedAt, undefined)
  assert.ok(validateCards(deck))
})

test('persistence validation requires a complete canonical deck with valid optional fields', () => {
  assert.ok(validateCards(generateDeck()))
  assert.equal(validateCards(generateDeck().slice(1)), false)
  for (const patch of [
    { id: 'heart_A' }, { suit: 'invalid' }, { rank: 'X' }, { displayName: undefined },
    { isCollected: 'false' }, { note: {} }, { collectedAt: 'invalid' }
  ]) {
    const deck = generateDeck()
    Object.assign(deck[0], patch)
    assert.equal(validateCards(deck), false)
  }
})
