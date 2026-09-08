// One-shot palette migration: emerald/zinc dark theme -> paper/ink/orange editorial theme.
// Run: node scripts/revamp-colors.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs"
import { join, extname } from "node:path"

const ROOTS = ["components", "lib", "app"]
const EXTS = new Set([".tsx", ".ts"])
const SKIP_FILES = new Set(["app/globals.css", "app/layout.tsx"]) // rewritten by hand

// hex (no #, case-insensitive) -> replacement WITH #
const HEX = {
  // emerald -> accent orange
  "34d399": "#FF4D00", "10b981": "#E84400", "86efac": "#FF8A50", "6ee7b7": "#FF8A50",
  "a7f3d0": "#FFC4A3", "d1fae5": "#FFE6D8", "ecfdf5": "#FFF0E8", "059669": "#C43A00",
  "047857": "#9E2F00", "065f46": "#7A2400", "064e3b": "#5A1B00", "00f5d4": "#FF4D00",
  // violet/purple -> warm orange ramp
  "a78bfa": "#FF7A33", "8b5cf6": "#E84400", "7c3aed": "#C43A00", "6d28d9": "#9E2F00",
  "4c1d95": "#5A1B00", "c4b5fd": "#FFA366", "ddd6fe": "#FFE0CC", "ede9fe": "#FFF4EC", "f5f3ff": "#FFF8F2",
  // cyan/sky/blue -> warm orange ramp
  "22d3ee": "#FF7A33", "67e8f9": "#FFA366", "a5f3fc": "#FFC4A3", "cffafe": "#FFE6D8",
  "0891b2": "#C43A00", "0e7490": "#9E2F00", "155e75": "#7A2400", "164e63": "#5A1B00",
  "38bdf8": "#FF7A33", "7dd3fc": "#FFA366", "bae6fd": "#FFC4A3", "e0f2fe": "#FFE6D8",
  "0284c7": "#C43A00", "0369a1": "#9E2F00", "075985": "#7A2400", "0c4a6e": "#5A1B00",
  "60a5fa": "#FF7A33", "93c5fd": "#FFA366", "bfdbfe": "#FFC4A3", "dbeafe": "#FFE6D8",
  "2563eb": "#C43A00", "1d4ed8": "#9E2F00", "1e40af": "#7A2400", "1e3a8a": "#5A1B00", "3b82f6": "#E84400",
  "eff6ff": "#FFF8F2",
  // pink/rose/fuchsia -> warm orange ramp (danger rose -> burnt red-orange)
  "f472b6": "#FF8A50", "f9a8d4": "#FFB180", "fbcfe8": "#FFD4B8", "fce7f3": "#FFF0E8",
  "db2777": "#C43A00", "be185d": "#9E2F00", "9d174d": "#7A2400", "831843": "#5A1B00", "ec4899": "#E84400",
  "fdf2f8": "#FFF8F2",
  "fb7185": "#E84400", "fda4af": "#FF8A50", "fecdd3": "#FFC4A3", "ffe4e6": "#FFE6D8",
  "e11d48": "#C43A00", "be123c": "#9E2F00", "881337": "#5A1B00", "f43f5e": "#D63700",
  // teal/green/lime -> orange ramp
  "2dd4bf": "#FF7A33", "5eead4": "#FFA366", "99f6e4": "#FFC4A3", "ccfbf1": "#FFE6D8",
  "0d9488": "#C43A00", "0f766e": "#9E2F00", "115e59": "#7A2400", "134e4a": "#5A1B00",
  "f0fdfa": "#FFF8F2", "22c55e": "#E84400", "4ade80": "#FF8A50", "a3e635": "#FF8A50",
  "ecfccb": "#FFF4EC", "f7fee7": "#FFF8F2", "16a34a": "#C43A00", "15803d": "#9E2F00",
  "166534": "#7A2400", "14532d": "#5A1B00", "dcfce7": "#FFE6D8", "bbf7d0": "#FFC4A3",
  // amber/yellow -> deep warm amber
  "f59e0b": "#E08700", "fbbf24": "#E8A317", "fcd34d": "#EDBB48", "fde68a": "#F2CE7A",
  "fef3c7": "#FAF0DC", "fffbeb": "#FDF8EC", "b45309": "#965C00", "92400e": "#744600",
  "78350f": "#523100", "451a03": "#3A2200", "d97706": "#B87200",
  // orange scale -> accent orange
  "fb923c": "#FF9A5C", "f97316": "#FF4D00", "ffedd5": "#FFE6D8", "fed7aa": "#FFC4A3",
  "c2410c": "#C43A00", "9a3412": "#9E2F00", "7c2d12": "#7A2400", "431407": "#5A1B00", "ea580c": "#E84400",
  // near-black inks -> editorial ink
  "09090b": "#161511", "0c0c0f": "#161511", "111118": "#161511", "07090f": "#161511",
  "07120d": "#161511", "08120d": "#161511", "0b0f14": "#161511", "18181b": "#201E19",
  "27272a": "#26241E", "3f3f46": "#3B392F",
  // warm neutrals
  "f4f4f5": "#F1EEE5", "fafafa": "#F7F5EE", "e4e4e7": "#D9D5C9", "d4d4d8": "#C9C5B9",
  "a1a1aa": "#8A8578", "71717a": "#75726A", "52525b": "#5D5A52",
  // misc
  "ecfeff": "#161511", "0a66c2": "#161511",
}

// rgba triplets -> replacement "r,g,b"
const RGBA = {
  "52,211,153": "255,77,0", "16,185,129": "232,68,0", "110,231,183": "255,138,80",
  "134,239,172": "255,138,80", "5,150,105": "196,58,0", "6,95,70": "122,36,0",
  "209,250,229": "255,230,216", "236,253,245": "255,237,226", "6,78,59": "90,27,0",
  "167,139,250": "255,122,51", "139,92,246": "232,68,0", "124,58,237": "196,58,0",
  "196,181,253": "255,163,102", "221,214,254": "255,224,204", "109,40,217": "158,47,0",
  "91,33,182": "122,36,0", "76,29,149": "90,27,0", "237,233,254": "255,244,236",
  "34,211,238": "255,122,51", "103,232,249": "255,163,102", "8,145,178": "196,58,0",
  "14,116,144": "158,47,0", "21,94,117": "122,36,0", "22,78,99": "90,27,0",
  "56,189,248": "255,122,51", "125,211,252": "255,163,102", "186,230,253": "255,196,163",
  "224,242,254": "255,230,216", "2,132,199": "196,58,0", "3,105,161": "158,47,0",
  "7,89,133": "122,36,0", "12,74,110": "90,27,0",
  "96,165,250": "255,122,51", "147,197,253": "255,163,102", "191,219,254": "255,196,163",
  "219,234,254": "255,230,216", "37,99,235": "196,58,0", "29,78,216": "158,47,0",
  "30,64,175": "122,36,0", "30,58,138": "90,27,0", "59,130,246": "232,68,0",
  "244,114,182": "255,138,80", "249,168,212": "255,177,128", "251,207,232": "255,212,184",
  "236,72,153": "232,68,0", "219,39,119": "196,58,0", "190,24,93": "158,47,0",
  "157,23,77": "122,36,0", "131,24,67": "90,27,0",
  "251,113,133": "232,68,0", "253,164,175": "255,138,80", "254,205,211": "255,196,163",
  "225,29,72": "196,58,0", "190,18,60": "158,47,0", "244,63,94": "214,55,0",
  "0,245,212": "255,77,0", "45,212,191": "255,122,51", "94,234,212": "255,163,102",
  "153,246,228": "255,196,163", "204,251,241": "255,230,216", "13,148,136": "196,58,0",
  "15,118,110": "158,47,0", "17,94,89": "122,36,0", "19,78,74": "90,27,0", "20,184,166": "232,68,0",
  "34,197,94": "232,68,0", "74,222,128": "255,138,80", "22,163,74": "196,58,0",
  "21,128,61": "158,47,0", "22,101,52": "122,36,0", "20,83,45": "90,27,0",
  "240,253,244": "255,237,226", "220,252,231": "255,230,216", "187,247,208": "255,196,163",
  "251,146,60": "255,77,0", "249,115,22": "255,77,0", "234,88,12": "196,58,0",
  "194,65,12": "196,58,0", "154,52,18": "158,47,0", "124,45,18": "122,36,0",
  "255,237,213": "255,230,216", "254,215,170": "255,196,163",
  "245,158,11": "224,135,0", "251,191,36": "232,163,23", "252,211,77": "237,187,72",
  "253,230,138": "242,206,122", "254,243,199": "250,240,220", "180,83,9": "150,92,0",
  "146,64,14": "116,70,0", "120,53,15": "82,49,0", "69,26,3": "58,34,0", "217,119,6": "184,114,0",
  // dark neutrals -> warm ink
  "9,9,11": "22,21,17", "7,9,15": "22,21,17", "24,24,27": "25,24,20",
  // cream overlays (were pure white overlays on dark)
  "255,255,255": "241,238,229",
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const s = statSync(p)
    if (s.isDirectory()) {
      if (name === "node_modules" || name === "ui") continue
      yield* walk(p)
    } else if (EXTS.has(extname(p))) {
      yield p
    }
  }
}

let touched = 0
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const norm = file.replace(/\\/g, "/")
    if (SKIP_FILES.has(norm)) continue
    const src = readFileSync(file, "utf8")
    let out = src
    for (const [hex, rep] of Object.entries(HEX)) {
      out = out.replace(new RegExp(`#${hex}`, "gi"), rep)
    }
    for (const [rgb, rep] of Object.entries(RGBA)) {
      out = out.replaceAll(`rgba(${rgb},`, `rgba(${rep},`)
    }
    // font-family strings -> token vars (next/font self-hosted families)
    out = out.replaceAll("'Space Grotesk', sans-serif", "var(--font-display), sans-serif")
    out = out.replaceAll('"Space Grotesk", sans-serif', "var(--font-display), sans-serif")
    out = out.replaceAll("Space Grotesk", "Anton")
    out = out.replaceAll("'JetBrains Mono', monospace", "var(--font-mono), monospace")
    out = out.replaceAll("JetBrains Mono", "Space Mono")
    out = out.replaceAll("'Inter', ui-sans-serif", "var(--font-sans), ui-sans-serif")
    out = out.replaceAll('"Inter", ui-sans-serif', "var(--font-sans), ui-sans-serif")
    if (out !== src) {
      writeFileSync(file, out)
      touched++
      console.log("updated", norm)
    }
  }
}
console.log(`done — ${touched} files updated`)
