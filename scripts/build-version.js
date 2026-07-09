const fs = require("fs")
const path = require("path")

const now = new Date()
const y = now.getFullYear()
const m = String(now.getMonth() + 1).padStart(2, "0")
const d = String(now.getDate()).padStart(2, "0")
const h = String(now.getHours()).padStart(2, "0")
const mi = String(now.getMinutes()).padStart(2, "0")
const s = String(now.getSeconds()).padStart(2, "0")
const version = `${y}-${m}-${d}.${h}-${mi}-${s}`

const filePath = path.join(__dirname, "..", "lib", "runtime-version.ts")
const content = `export const APP_RUNTIME_VERSION = "${version}";\nexport const LIVE_RUNTIME_POLL_MS = 5000;\n`

fs.writeFileSync(filePath, content, "utf8")
console.log(`[build-version] Set APP_RUNTIME_VERSION to ${version}`)
