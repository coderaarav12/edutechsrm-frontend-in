import QRCode from "qrcode"
import { createCanvas, loadImage } from "canvas"
import { existsSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

const DATA = "https://edutechsrm.in"
const SIZE = 1400
const PADDING_MODULES = 6

const dotColor = "#10b981"
const cornerColor = "#059669"
const pinColor = "#047857"

const matrixData = QRCode.create(DATA, {
  errorCorrectionLevel: "H",
}).modules.data

const count = Math.sqrt(matrixData.length)
const moduleSize = SIZE / (count + PADDING_MODULES * 2)
const offset = PADDING_MODULES * moduleSize

function isDark(row, col) {
  return matrixData[row * count + col]
}

function isInFinder(row, col) {
  return (row < 7 && col < 7) ||
         (row < 7 && col >= count - 7) ||
         (row >= count - 7 && col < 7)
}

const canvas = createCanvas(SIZE, SIZE)
const ctx = canvas.getContext("2d")
ctx.clearRect(0, 0, SIZE, SIZE)

// Data modules — simple circles
for (let row = 0; row < count; row++) {
  for (let col = 0; col < count; col++) {
    if (!isDark(row, col)) continue
    if (isInFinder(row, col)) continue

    const cx = offset + col * moduleSize + moduleSize / 2
    const cy = offset + row * moduleSize + moduleSize / 2
    const r = moduleSize * 0.3

    ctx.fillStyle = dotColor
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
  }
}

// Finder patterns
const finders = [[0, 0], [0, count - 7], [count - 7, 0]]
const fSize = 7 * moduleSize

for (const [fRow, fCol] of finders) {
  const fx = offset + fCol * moduleSize
  const fy = offset + fRow * moduleSize

  ctx.fillStyle = cornerColor
  ctx.beginPath()
  ctx.roundRect(fx, fy, fSize, fSize, moduleSize * 1.6)
  ctx.fill()

  ctx.clearRect(fx + moduleSize, fy + moduleSize, 5 * moduleSize, 5 * moduleSize)

  ctx.fillStyle = pinColor
  ctx.beginPath()
  ctx.roundRect(fx + 2 * moduleSize, fy + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize, moduleSize * 0.7)
  ctx.fill()
}

// Logo — smaller so it doesn't cover data modules
const logoSize = SIZE * 0.18
const logoMargin = 10
try {
  const logoSrc = join(__dirname, "..", "public", "icon-192-v2.png")
  if (existsSync(logoSrc)) {
    const logo = await loadImage(logoSrc)
    const lx = (SIZE - logoSize) / 2
    const ly = (SIZE - logoSize) / 2

    // Dark rounded background behind logo
    ctx.save()
    ctx.shadowColor = "rgba(0,0,0,0.2)"
    ctx.shadowBlur = 20
    ctx.fillStyle = "#18181b"
    ctx.beginPath()
    ctx.roundRect(lx - logoMargin, ly - logoMargin, logoSize + logoMargin * 2, logoSize + logoMargin * 2, 14)
    ctx.fill()
    ctx.restore()

    // Logo on top
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(lx, ly, logoSize, logoSize, 8)
    ctx.clip()
    ctx.drawImage(logo, lx, ly, logoSize, logoSize)
    ctx.restore()
  }
} catch (e) {
  console.warn("Logo not loaded:", e.message)
}

const outPath = join(__dirname, "..", "public", "edutechsrm-qr.png")
writeFileSync(outPath, canvas.toBuffer("image/png"))
console.log("QR code saved to:", outPath, `(${count}x${count}, logo ${Math.round(logoSize)}px)`)
