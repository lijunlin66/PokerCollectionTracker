// 生成应用图标 icon.ico - 深蓝底 + 白卡牌 + 黑桃图案
// 输出: resources/icon.ico (含 16/32/48/64/128/256 多尺寸)
const fs = require('fs')
const path = require('path')

const SIZES = [16, 32, 48, 64, 128, 256]

// 颜色 (R,G,B,A)
const BG = [26, 35, 50, 255] // #1a2332 深蓝
const CARD = [255, 255, 255, 255] // 白卡牌
const SUIT = [45, 52, 54, 255] // #2d3436 黑桃黑
const TRANSPARENT = [0, 0, 0, 0]

function inRoundedRect(x, y, w, h, r) {
  if (x < r && y < r) return (r - x) ** 2 + (r - y) ** 2 <= r * r
  if (x >= w - r && y < r) return (x - (w - r - 1)) ** 2 + (r - y) ** 2 <= r * r
  if (x < r && y >= h - r) return (r - x) ** 2 + (y - (h - r - 1)) ** 2 <= r * r
  if (x >= w - r && y >= h - r)
    return (x - (w - r - 1)) ** 2 + (y - (h - r - 1)) ** 2 <= r * r
  return true
}

// 黑桃图案: 在 size×size 的卡牌区域内绘制
// 归一化坐标 (0~1) 判断是否在黑桃形状内
function inSpade(nx, ny) {
  // nx, ny in [0,1], 以卡牌中心为 (0.5,0.5)
  // 黑桃: 顶部尖 + 两侧圆叶 + 底部茎
  const cx = 0.5
  const cy = 0.48
  // 主体: 倒心形/圆形
  const dx = nx - cx
  const dy = ny - cy
  const dist = Math.sqrt(dx * dx + dy * dy * 1.1)
  // 顶部尖端
  if (ny < 0.18 && Math.abs(dx) < (0.18 - ny) * 1.2 + 0.02) return true
  // 主体圆形 (半径随高度变化)
  const radius = 0.32
  if (dist <= radius && ny < 0.62) {
    // 圆形主体, 但顶部稍尖
    return true
  }
  // 两侧叶扩展
  if (ny >= 0.3 && ny < 0.6 && Math.abs(dx) < 0.36 && dist < 0.42) return true
  // 茎 (梯形)
  if (ny >= 0.6 && ny < 0.78 && Math.abs(dx) < (ny - 0.6) * 0.5 + 0.04) return true
  // 茎底座
  if (ny >= 0.78 && ny < 0.86 && Math.abs(dx) < (0.86 - ny) * 0.6 + 0.06) return true
  return false
}

function renderSize(size) {
  const pixels = Buffer.alloc(size * size * 4)
  const cardPad = size * 0.18 // 卡牌距边缘
  const cardX0 = cardPad
  const cardY0 = size * 0.1
  const cardW = size - cardPad * 2
  const cardH = size - size * 0.1 - cardPad
  const cardRadius = Math.max(2, size * 0.08)

  // 黑桃在卡牌内的区域
  const spadeAreaX = cardX0 + cardW * 0.25
  const spadeAreaW = cardW * 0.5
  const spadeAreaY = cardY0 + cardH * 0.15
  const spadeAreaH = cardH * 0.7

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let color = TRANSPARENT
      // 背景圆角方形
      const bgR = Math.max(2, size * 0.18)
      if (inRoundedRect(x, y, size, size, bgR)) {
        color = BG
      }
      // 卡牌圆角矩形
      const lx = x - cardX0
      const ly = y - cardY0
      if (
        lx >= 0 &&
        ly >= 0 &&
        lx < cardW &&
        ly < cardH &&
        inRoundedRect(lx, ly, cardW, cardH, cardRadius)
      ) {
        color = CARD
        // 黑桃
        const nx = (x - spadeAreaX) / spadeAreaW
        const ny = (y - spadeAreaY) / spadeAreaH
        if (nx >= 0 && nx <= 1 && ny >= 0 && ny <= 1 && inSpade(nx, ny)) {
          color = SUIT
        }
      }
      const idx = (y * size + x) * 4
      pixels[idx] = color[2] // B
      pixels[idx + 1] = color[1] // G
      pixels[idx + 2] = color[0] // R
      pixels[idx + 3] = color[3] // A
    }
  }
  return pixels
}

function buildIco() {
  const images = SIZES.map((size) => {
    const pixels = renderSize(size)
    // AND mask: 全 0 (不透明). 行按 4 字节对齐
    const maskRowSize = Math.ceil(size / 8 / 4) * 4
    const andMask = Buffer.alloc(maskRowSize * size, 0)
    const bih = Buffer.alloc(40)
    bih.writeUInt32LE(40, 0) // header size
    bih.writeInt32LE(size, 4) // width
    bih.writeInt32LE(size * 2, 8) // height (doubled: XOR+AND)
    bih.writeUInt16LE(1, 12) // planes
    bih.writeUInt16LE(32, 14) // bit count
    bih.writeUInt32LE(0, 16) // compression
    bih.writeUInt32LE(pixels.length + andMask.length, 20) // image size
    bih.writeUInt32LE(0, 24) // x ppm
    bih.writeUInt32LE(0, 28) // y ppm
    bih.writeUInt32LE(0, 32) // colors used
    bih.writeUInt32LE(0, 36) // important colors
    const data = Buffer.concat([bih, pixels, andMask])
    return { size, data }
  })

  // ICONDIR
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type ICO
  header.writeUInt16LE(images.length, 4) // count

  // ICONDIRENTRY (16 bytes each)
  const entries = []
  let offset = 6 + images.length * 16
  for (const img of images) {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(img.size >= 256 ? 0 : img.size, 0) // width
    entry.writeUInt8(img.size >= 256 ? 0 : img.size, 1) // height
    entry.writeUInt8(0, 2) // colors
    entry.writeUInt8(0, 3) // reserved
    entry.writeUInt16LE(1, 4) // planes
    entry.writeUInt16LE(32, 6) // bit count
    entry.writeUInt32LE(img.data.length, 8) // size
    entry.writeUInt32LE(offset, 12) // offset
    entries.push(entry)
    offset += img.data.length
  }

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)])
}

const outDir = path.resolve(__dirname, '..', 'resources')
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
const outPath = path.join(outDir, 'icon.ico')
fs.writeFileSync(outPath, buildIco())
console.log('Generated icon:', outPath, `(${fs.statSync(outPath).size} bytes)`)

// 同时导出一份 PNG (256) 作为开发预览参考 (electron-builder 主用 ico)
function buildPng256() {
  const size = 256
  const pixels = renderSize(size)
  // 最小 PNG 编码: 用 zlib 压缩 raw 数据
  const zlib = require('zlib')
  // PNG 签名
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  function chunk(type, data) {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length, 0)
    const typeBuf = Buffer.from(type, 'ascii')
    const crcBuf = Buffer.alloc(4)
    // CRC32
    const crcTable = []
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      crcTable[n] = c
    }
    let crc = 0xffffffff
    for (let i = 0; i < typeBuf.length; i++)
      crc = crcTable[(crc ^ typeBuf[i]) & 0xff] ^ (crc >>> 8)
    for (let i = 0; i < data.length; i++)
      crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8)
    crc = (crc ^ 0xffffffff) >>> 0
    crcBuf.writeUInt32BE(crc, 0)
    return Buffer.concat([len, typeBuf, data, crcBuf])
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0
  // raw: each row prefixed with filter byte 0
  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0
    pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }
  const idat = zlib.deflateSync(raw)
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0))
  ])
}
const pngPath = path.join(outDir, 'icon.png')
fs.writeFileSync(pngPath, buildPng256())
console.log('Generated png:', pngPath)
