import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")

const csvPath = join(root, "lib", "finder.csv")
const outPath = join(root, "lib", "finder-data.ts")

const csvContent = readFileSync(csvPath, "utf-8")
const escaped = csvContent.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\${/g, "\\${")

const tsContent = `// Auto-generated from finder.csv - do not edit directly
export const FINDER_CSV = \`${escaped}\`
`

writeFileSync(outPath, tsContent, "utf-8")
console.log(`Generated finder-data.ts (${csvContent.split("\n").length} lines)`)
