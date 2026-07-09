/**
 * Test script: fetch mealmap data from studique.in
 *
 * The data is hardcoded in the Next.js JS chunk for the mealmap page.
 * This script downloads the necessary JS chunks and extracts the data.
 *
 * Usage: node scripts/fetch-mealmap.mjs
 */

const BASE = "https://studique.in"
const MEALMAP_URL = `${BASE}/mealmap`
const { writeFileSync, readFileSync } = await import("fs")
const { resolve, dirname } = await import("path")
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTDIR = resolve(__dirname)

async function main() {
  console.log("1. Fetching mealmap page...")
  const html = await (await fetch(MEALMAP_URL)).text()
  writeFileSync(resolve(OUTDIR, "mealmap-page.html"), html, "utf-8")
  console.log(`   Saved page HTML (${html.length} bytes)`)

  // 2. Find the mealmap page chunk
  const mealmapChunk = html.match(
    /src="(\/_next\/static\/chunks\/pages\/mealmap-[^"]+\.js)"/
  )
  if (!mealmapChunk) {
    console.error("Could not find mealmap chunk URL")
    process.exit(1)
  }

  const chunkUrl = `${BASE}${mealmapChunk[1]}`
  console.log(`\n2. Fetching chunk: ${mealmapChunk[1]}`)
  const js = await (await fetch(chunkUrl)).text()
  writeFileSync(resolve(OUTDIR, "mealmap-chunk.js"), js, "utf-8")
  console.log(`   Saved chunk (${js.length} bytes)`)

  // 3. Extract the data using Function constructor (safe: data is only string arrays)
  // All three hostel objects plus time constants are in the chunk.
  // We need to isolate the relevant variables.
  
  // Find the start: let u={breakfast...
  const dataStart = js.indexOf("let u={breakfast")
  if (dataStart === -1) {
    console.error("Could not find data start")
    process.exit(1)
  }
  
  // Find the variables by extracting from "let u=..." up to the hostel names array
  // The hostel names array y=["Sannasi","M-Block","NRI"] marks the end of data definitions
  const dataEnd = js.indexOf(',y=["Sannasi"', dataStart)
  if (dataEnd === -1) {
    console.error("Could not find data end")
    process.exit(1)
  }
  
  const dataBlock = js.slice(dataStart, dataEnd + ',y=["Sannasi","M-Block","NRI"]'.length)
  
  // Safely evaluate using Function constructor
  // First extract just the variable definitions
  // The format is: let u={...},m={...},c={...},p={...},h=[...],y=["Sannasi","M-Block","NRI"]
  const result = {}
  const func = new Function(
    '"use strict"; ' + dataBlock + "; return { mealTimes: u, sannasi: m, mBlock: c, nri: p, days: h, hostels: y };"
  )
  const data = func()
  
  // 4. Save parsed data
  const parsed = {
    _meta: { source: "studique.in/mealmap", fetched: new Date().toISOString() },
    _mealTimes: data.mealTimes,
    Sannasi: data.sannasi,
    "M-Block": data.mBlock,
    NRI: data.nri,
  }
  
  writeFileSync(
    resolve(OUTDIR, "mealmap-extracted.json"),
    JSON.stringify(parsed, null, 2),
    "utf-8"
  )
  console.log("\n3. Saved parsed data to scripts/mealmap-extracted.json")
  
  // 5. Generate TypeScript data file for the app
  const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
  
  // Build the TS file
  let ts = `// Auto-generated from studique.in/mealmap on ${new Date().toISOString().split("T")[0]}
// Hostels: Sannasi, M-Block, NRI

export interface MealMenu {
  [day: string]: {
    breakfast: string[]
    lunch: string[]
    snacks: string[]
    dinner: string[]
  }
}

export const HOSTELS = ["Sannasi", "M-Block", "NRI"] as const
export type Hostel = (typeof HOSTELS)[number]

export const MESS_MENUS: Record<Hostel, MealMenu> = {
`

  for (const [key, hostelData] of Object.entries({ Sannasi: data.sannasi, "M-Block": data.mBlock, NRI: data.nri })) {
    ts += `  "${key}": {\n`
    for (const day of DAYS) {
      const meals = hostelData[day]
      ts += `    ${day}: {\n`
      for (const mealType of ["breakfast", "lunch", "snacks", "dinner"]) {
        const items = meals[mealType] || []
        ts += `      ${mealType}: [${items.map(i => JSON.stringify(i)).join(", ")}],\n`
      }
      ts += `    },\n`
    }
    ts += `  },\n`
  }
  
  ts += `} as const\n`
  
  writeFileSync(resolve(OUTDIR, "mealmap-data.ts"), ts, "utf-8")
  console.log("4. Generated TypeScript data file: scripts/mealmap-data.ts")

  // 6. Summary
  console.log("\n--- Summary ---")
  for (const [name, hostelData] of Object.entries({ Sannasi: data.sannasi, "M-Block": data.mBlock, NRI: data.nri })) {
    let totalItems = 0
    for (const day of DAYS) {
      for (const mealType of ["breakfast", "lunch", "snacks", "dinner"]) {
        totalItems += (hostelData[day][mealType] || []).length
      }
    }
    console.log(`  ${name}: ~${totalItems} menu items across 7 days × 4 meals`)
  }
  console.log(`\nDone! Output files in scripts/`)
}

main().catch(err => { console.error(err); process.exit(1) })
