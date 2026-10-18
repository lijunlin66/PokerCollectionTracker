import { generateDeck } from './cardData'
import type { Card } from './types'

const deck = generateDeck()
const cardsById = new Map(deck.map((card) => [card.id, card]))

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function validDate(value: unknown): boolean {
  return value === undefined || (typeof value === 'string' && Number.isFinite(Date.parse(value)))
}

/** 持久化必须始终包含完整、唯一且牌面信息正确的 54 张牌。 */
export function validateCards(value: unknown): value is Card[] {
  if (!Array.isArray(value) || value.length !== deck.length) return false
  const ids = new Set<string>()
  for (const item of value) {
    if (!isRecord(item) || typeof item.id !== 'string') return false
    const canonical = cardsById.get(item.id)
    if (!canonical || ids.has(item.id)) return false
    if (item.suit !== canonical.suit || item.rank !== canonical.rank ||
        item.displayName !== canonical.displayName || typeof item.isCollected !== 'boolean') return false
    if (item.note !== undefined && typeof item.note !== 'string') return false
    if (!validDate(item.collectedAt)) return false
    ids.add(item.id)
  }
  return true
}

function parseCollected(value: unknown): boolean {
  if (value === true || value === false) return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true') return true
    if (normalized === 'false') return false
  }
  throw new Error('isCollected 必须为 true 或 false')
}

/** 先完整校验导入内容，再补齐缺少的牌；任何无效行都不能覆盖现有收藏。 */
function mergeImportedCards(value: unknown): Card[] {
  if (!Array.isArray(value) || value.length === 0) throw new Error('未解析到有效卡片数据')
  const imported = new Map<string, Card>()
  for (const item of value) {
    if (!isRecord(item) || typeof item.id !== 'string') throw new Error('卡片缺少有效 id')
    const canonical = cardsById.get(item.id)
    if (!canonical) throw new Error(`未知卡片：${item.id}`)
    if (imported.has(item.id)) throw new Error(`重复卡片：${item.id}`)
    const isCollected = parseCollected(item.isCollected)
    if (item.note !== undefined && typeof item.note !== 'string') throw new Error('备注必须为文本')
    const collectedAt = item.collectedAt === '' ? undefined : item.collectedAt
    if (!validDate(collectedAt)) throw new Error(`无效收集时间：${item.id}`)
    imported.set(item.id, {
      ...canonical,
      isCollected,
      note: item.note as string | undefined,
      collectedAt: isCollected ? collectedAt as string | undefined : undefined
    })
  }
  return deck.map((card) => ({ ...(imported.get(card.id) ?? card) }))
}

export function cardsToCsv(cards: Card[]): string {
  const escape = (value: string): string => /[",\n\r]/.test(value)
    ? `"${value.replace(/"/g, '""')}"` : value
  return [
    'id,suit,rank,displayName,isCollected,note,collectedAt',
    ...cards.map((card) => [card.id, card.suit, card.rank, card.displayName,
      String(card.isCollected), card.note ?? '', card.collectedAt ?? ''].map(escape).join(','))
  ].join('\r\n')
}

/** 按字符读取整个文件，保留引号内的换行、逗号和双引号。 */
function parseCsv(content: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  let closedQuote = false
  const pushField = (): void => {
    row.push(field)
    field = ''
    closedQuote = false
  }
  const pushRow = (): void => {
    pushField()
    if (row.some((value) => value.trim() !== '')) rows.push(row)
    row = []
  }
  for (let i = 0; i < content.length; i++) {
    const ch = content[i]
    if (quoted) {
      if (ch === '"') {
        if (content[i + 1] === '"') { field += '"'; i++ }
        else { quoted = false; closedQuote = true }
      } else field += ch
    } else if (ch === ',') pushField()
    else if (ch === '\r' || ch === '\n') {
      pushRow()
      if (ch === '\r' && content[i + 1] === '\n') i++
    } else if (ch === '"' && !field && !closedQuote) quoted = true
    else {
      if (closedQuote || ch === '"') throw new Error('CSV 引号格式无效')
      field += ch
    }
  }
  if (quoted) throw new Error('CSV 存在未闭合的引号')
  if (field || row.length || closedQuote) pushRow()
  return rows
}

export function parseImport(content: string, format: string): Card[] {
  const text = content.replace(/^\ufeff/, '')
  if (format === 'json') {
    const parsed: unknown = JSON.parse(text)
    return mergeImportedCards(isRecord(parsed) ? parsed.cards : parsed)
  }
  if (format !== 'csv') throw new Error('不支持的文件类型')
  const [header, ...rows] = parseCsv(text)
  if (!header) throw new Error('CSV 文件为空')
  const names = header.map((name) => name.trim().toLowerCase())
  if (new Set(names).size !== names.length || !names.includes('id') || !names.includes('iscollected')) {
    throw new Error('CSV 表头必须包含唯一的 id 和 isCollected 列')
  }
  const read = (row: string[], name: string): string | undefined => {
    const index = names.indexOf(name)
    return index < 0 ? undefined : row[index]
  }
  return mergeImportedCards(rows.map((row) => {
    if (row.length !== header.length) throw new Error('CSV 行的列数与表头不一致')
    return {
      id: read(row, 'id'),
      isCollected: read(row, 'iscollected'),
      note: read(row, 'note') || undefined,
      collectedAt: read(row, 'collectedat')
    }
  }))
}
