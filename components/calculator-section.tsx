"use client"

import { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calculator, Binary, Hexagon, Activity, Copy, Zap,
  ArrowLeft, ChevronRight, Delete, Percent, Ruler,
} from "lucide-react"

const MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" }

// ── Number Converter Component ───────────────────────────────────────────────

function NumberConverter() {
  const [input, setInput] = useState("")
  const [fromBase, setFromBase] = useState("decimal")
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const bases = [
    { value: "binary", label: "Binary", icon: Binary },
    { value: "octal", label: "Octal", icon: Hexagon },
    { value: "decimal", label: "Decimal", icon: Calculator },
    { value: "hexadecimal", label: "Hex", icon: Activity },
  ]

  const { result, error } = useMemo(() => {
    if (!input.trim()) return { result: null, error: "" }
    try {
      let dec: number
      switch (fromBase) {
        case "binary": dec = parseInt(input, 2); break
        case "octal": dec = parseInt(input, 8); break
        case "hexadecimal": dec = parseInt(input, 16); break
        default: dec = Number(input)
      }
      if (!Number.isFinite(dec) || !Number.isInteger(dec) || dec < 0) throw new Error()
      return {
        result: {
          decimal: dec.toString(10),
          binary: dec.toString(2),
          octal: dec.toString(8),
          hexadecimal: dec.toString(16).toUpperCase(),
          ascii: dec >= 32 && dec <= 126 ? String.fromCharCode(dec) : "",
        },
        error: "",
      }
    } catch {
      return { result: null, error: "Invalid input for selected base" }
    }
  }, [input, fromBase])

  const results = result ? [
    { key: "dec", label: "Decimal", value: result.decimal, icon: Calculator },
    { key: "bin", label: "Binary", value: result.binary, icon: Binary },
    { key: "oct", label: "Octal", value: result.octal, icon: Hexagon },
    { key: "hex", label: "Hex", value: result.hexadecimal, icon: Activity },
    ...(result.ascii ? [{ key: "ascii", label: "ASCII", value: result.ascii, icon: Copy }] : []),
  ] : []

  const refData = [
    { base: "Binary", digits: "0, 1" },
    { base: "Octal", digits: "0-7" },
    { base: "Decimal", digits: "0-9" },
    { base: "Hex", digits: "0-9, A-F" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/40 ring-1 ring-white/5 rounded-2xl p-6">
          <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">Input</p>
          <h2 className="text-lg font-bold text-zinc-100 mb-4">Convert</h2>
          <div className="space-y-4">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Enter number..."
              className="w-full px-4 py-3.5 rounded-xl bg-zinc-950/60 ring-1 ring-white/5 text-zinc-100 text-sm focus:outline-none focus:ring-emerald-500/30 focus:bg-zinc-950/80 transition-all placeholder:text-zinc-700"
              style={MONO} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {bases.map((b) => (
                <motion.button key={b.value} whileTap={{ scale: 0.95 }}
                  onClick={() => setFromBase(b.value)}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    fromBase === b.value
                      ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25 shadow-md shadow-emerald-500/10"
                      : "bg-zinc-900/60 text-zinc-500 ring-1 ring-white/5 hover:text-zinc-300 hover:ring-white/10"
                  }`}>
                  <b.icon size={12} />{b.label}
                </motion.button>
              ))}
            </div>
            {error && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 ring-1 ring-red-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                <span className="text-red-400 text-xs font-bold">{error}</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-zinc-900/40 ring-1 ring-white/5 rounded-2xl p-6">
          <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">Output</p>
          <h2 className="text-lg font-bold text-zinc-100 mb-4">Results</h2>
          {results.length > 0 ? (
            <div className="space-y-2.5">
              {results.map((item) => (
                <motion.div key={item.key} whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/60 ring-1 ring-white/5 hover:ring-zinc-700 hover:bg-zinc-800/60 transition-all cursor-pointer group"
                  onClick={() => {
                    navigator.clipboard.writeText(item.value)
                    setCopiedKey(item.key)
                    setTimeout(() => setCopiedKey(null), 1200)
                  }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/15 flex items-center justify-center">
                      <item.icon size={14} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm font-bold text-zinc-100" style={MONO}>{item.value}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AnimatePresence>
                      {copiedKey === item.key && (
                        <motion.span initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                          className="text-[10px] font-bold text-emerald-400">
                          Copied!
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <Copy size={14} className={copiedKey === item.key ? "text-emerald-400" : "text-zinc-700 group-hover:text-emerald-400 transition-colors"} />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-36 bg-zinc-900/60 ring-1 ring-white/5 rounded-2xl">
              <div className="text-center">
                <Calculator size={28} className="mx-auto mb-2 text-zinc-700" />
                <p className="text-xs font-semibold text-zinc-600">Enter a number to convert</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-zinc-900/40 ring-1 ring-white/5 rounded-2xl p-5">
        <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">Reference</p>
        <h3 className="text-sm font-bold text-zinc-100 mb-3">Quick Reference</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {refData.map((ref) => (
            <div key={ref.base} className="p-3 rounded-xl bg-zinc-900/60 ring-1 ring-white/5 text-center">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{ref.base}</p>
              <p className="text-xs text-zinc-400 font-bold" style={MONO}>{ref.digits}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

// ── Logic Gate Simulator Component ───────────────────────────────────────────

const GATES: Record<string, { symbol: string; fn: (...args: boolean[]) => boolean; inputs: number; desc: string; example: string }> = {
  AND:  { symbol: "∧", fn: (...a) => a.every(Boolean), inputs: 2, desc: "Output is 1 only when ALL inputs are 1", example: "1 & 1 = 1" },
  OR:   { symbol: "∨", fn: (...a) => a.some(Boolean), inputs: 2, desc: "Output is 1 when at least one input is 1", example: "1 | 0 = 1" },
  NOT:  { symbol: "¬", fn: (...a) => !a[0], inputs: 1, desc: "Inverts the single input", example: "¬1 = 0" },
  NAND: { symbol: "⊼", fn: (...a) => !(a.every(Boolean)), inputs: 2, desc: "NOT of AND — universal gate", example: "1 ⊼ 1 = 0" },
  NOR:  { symbol: "⊽", fn: (...a) => !(a.some(Boolean)), inputs: 2, desc: "NOT of OR — universal gate", example: "0 ⊽ 0 = 1" },
  XOR:  { symbol: "⊕", fn: (...a) => a.filter(Boolean).length % 2 === 1, inputs: 2, desc: "Output is 1 when inputs differ", example: "1 ⊕ 0 = 1" },
  XNOR: { symbol: "⊙", fn: (...a) => a.filter(Boolean).length % 2 === 0, inputs: 2, desc: "Output is 1 when inputs are equal", example: "1 ⊙ 1 = 1" },
}

const INPUT_LABELS = ["A", "B", "C", "D"]

function LogicGateSimulator() {
  const [gate, setGate] = useState("AND")
  const [inputCount, setInputCount] = useState(2)
  const [inputs, setInputs] = useState<boolean[]>([false, false, false, false])
  const [tab, setTab] = useState<"single" | "truth">("single")

  const g = GATES[gate]
  const activeInputs = inputs.slice(0, g.inputs === 1 ? 1 : inputCount)
  const output = g.fn(...activeInputs)

  const toggleInput = useCallback((i: number) => {
    setInputs((prev) => { const n = [...prev]; n[i] = !n[i]; return n })
  }, [])

  const truthRows = useMemo(() => {
    const rows: { inputs: boolean[]; out: boolean }[] = []
    const count = g.inputs === 1 ? 1 : inputCount
    const total = Math.pow(2, count)
    for (let i = 0; i < total; i++) {
      const row: boolean[] = []
      for (let j = count - 1; j >= 0; j--) {
        row.push(Boolean((i >> j) & 1))
      }
      rows.push({ inputs: row, out: g.fn(...row) })
    }
    return rows
  }, [gate, inputCount, g])

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="bg-zinc-900 rounded-xl p-1 border border-white/5 shadow-inner flex">
          {(["single", "truth"] as const).map((t) => (
            <motion.button key={t} whileTap={{ scale: 0.97 }} onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                tab === t ? "bg-zinc-800 text-zinc-100 shadow-md border border-white/5" : "text-zinc-500 hover:text-zinc-300"
              }`}>
              {t === "single" ? "Single Gate" : "Truth Table"}
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === "single" ? (
          <motion.div key="single" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div className="bg-zinc-900/40 ring-1 ring-white/5 rounded-2xl p-6">
                <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">Gate Type</p>
                <h2 className="text-lg font-bold text-zinc-100 mb-4">Gate Selection</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {Object.keys(GATES).map((name) => (
                    <motion.button key={name} whileTap={{ scale: 0.93 }} onClick={() => {
                      setGate(name)
                      if (GATES[name].inputs === 1) setInputCount(1)
                      else if (inputCount < 2) setInputCount(2)
                    }}
                      className={`p-3 rounded-xl ring-1 transition-all text-center ${
                        gate === name
                          ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30 shadow-md shadow-emerald-500/10"
                          : "bg-zinc-900/60 text-zinc-400 ring-white/5 hover:ring-white/10"
                      }`}>
                      <div className="text-sm font-bold" style={MONO}>{name}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{GATES[name].symbol}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {g.inputs === 2 && (
                <div className="bg-zinc-900/40 ring-1 ring-white/5 rounded-2xl p-6">
                  <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">Configuration</p>
                  <label className="block text-xs font-bold text-zinc-400 mb-3">Number of Inputs: {inputCount}</label>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-600 font-bold">2</span>
                    <input type="range" min={2} max={4} value={inputCount}
                      onChange={(e) => setInputCount(Number(e.target.value))}
                      className="flex-1 accent-emerald-400 h-1.5" />
                    <span className="text-xs text-zinc-600 font-bold">4</span>
                  </div>
                </div>
              )}

              <div className="bg-zinc-900/40 ring-1 ring-white/5 rounded-2xl p-6">
                <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">Inputs</p>
                <div className="space-y-3 mt-3">
                  {Array.from({ length: g.inputs === 1 ? 1 : inputCount }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-zinc-400 w-8" style={MONO}>{INPUT_LABELS[i]}:</span>
                      <motion.button whileTap={{ scale: 0.92 }} onClick={() => toggleInput(i)}
                        className={`w-14 h-10 rounded-lg font-bold text-sm transition-all ring-1 ${
                          inputs[i]
                            ? "bg-emerald-500/20 text-emerald-300 ring-emerald-500/30 shadow-md shadow-emerald-500/10"
                            : "bg-zinc-900/60 text-zinc-600 ring-white/5"
                        }`} style={MONO}>
                        {inputs[i] ? "1" : "0"}
                      </motion.button>
                      <span className="text-xs text-zinc-500 font-semibold">{inputs[i] ? "HIGH" : "LOW"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/40 ring-1 ring-white/5 rounded-2xl p-6">
              <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">Simulation</p>
              <h2 className="text-lg font-bold text-zinc-100 mb-4">Gate Simulation</h2>
              <div className="text-center space-y-5">
                <div className="inline-flex items-center justify-center relative">
                  <div className="w-28 h-18 rounded-xl bg-zinc-950/80 ring-2 ring-zinc-700 flex items-center justify-center relative">
                    <span className="text-3xl font-bold text-zinc-200" style={MONO}>{g.symbol}</span>
                    {Array.from({ length: g.inputs === 1 ? 1 : inputCount }).map((_, i) => (
                      <div key={`in-${i}`} className="absolute -left-1.5 rounded-full bg-emerald-500/60 w-2.5 h-2.5"
                        style={{ top: `${30 + (i * 40) / Math.max((g.inputs === 1 ? 1 : inputCount) - 1, 1)}%`, transform: "translateY(-50%)" }} />
                    ))}
                    <div className="absolute -right-1.5 top-1/2 w-2.5 h-2.5 rounded-full bg-emerald-500/60" style={{ transform: "translateY(-50%)" }} />
                    <div className="absolute -right-3 top-1/2 w-2.5 h-2.5 rounded-full bg-zinc-950/80 ring-1 ring-emerald-500/40" style={{ transform: "translateY(-50%)" }} />
                  </div>
                </div>

                <p className="text-xs text-zinc-500 font-semibold">{g.desc}</p>

                <div className="p-5 rounded-xl bg-zinc-900/60 ring-1 ring-white/5 inline-block">
                  <p className="text-xs font-bold text-zinc-500 mb-2">Output</p>
                  <motion.div key={`${gate}-${activeInputs.join("")}`} initial={{ scale: 0.85, opacity: 0.5 }} animate={{ scale: 1, opacity: 1 }}
                    className={`inline-block px-8 py-4 rounded-xl text-3xl font-bold ring-1 transition-all ${
                      output ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30 shadow-lg shadow-emerald-500/10" : "bg-zinc-950/60 text-zinc-600 ring-white/5"
                    }`} style={MONO}>
                    {output ? "1" : "0"}
                  </motion.div>
                  <p className="text-xs text-zinc-500 mt-2 font-semibold">{output ? "HIGH" : "LOW"}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="truth" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="bg-zinc-900/40 ring-1 ring-white/5 rounded-2xl p-6">
              <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">Reference</p>
              <h2 className="text-lg font-bold text-zinc-100 mb-4">Truth Table — {gate} Gate</h2>
              <div className="bg-zinc-900/60 ring-1 ring-white/5 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      {Array.from({ length: g.inputs === 1 ? 1 : inputCount }).map((_, i) => (
                        <th key={i} className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-zinc-500">{INPUT_LABELS[i]}</th>
                      ))}
                      <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-zinc-500">Output</th>
                    </tr>
                  </thead>
                  <tbody>
                    {truthRows.map((row, i) => {
                      const isActive = row.inputs.every((v, j) => v === activeInputs[j])
                      return (
                        <tr key={i} className={`border-b border-white/5 transition-colors ${isActive ? "bg-emerald-500/10" : "hover:bg-white/[0.02]"}`}>
                          {row.inputs.map((val, j) => (
                            <td key={j} className="px-4 py-3 text-center">
                              <span className={`text-sm font-bold ${val ? "text-emerald-400" : "text-zinc-600"}`} style={MONO}>{val ? "1" : "0"}</span>
                            </td>
                          ))}
                          <td className="px-4 py-3 text-center">
                            <span className={`text-sm font-bold ${row.out ? "text-emerald-400" : "text-zinc-600"}`} style={MONO}>{row.out ? "1" : "0"}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Binary Operations Component ──────────────────────────────────────────────

const OPS: Record<string, { symbol: string; fn: (a: number, b: number) => number; desc: string; apps: string[] }> = {
  AND:  { symbol: "∧", fn: (a, b) => a & b, desc: "Bitwise AND - Both bits must be 1", apps: ["Mask bits (1101 & 0011 = 0001)", "Hardware: multiplication, conditionals"] },
  OR:   { symbol: "∨", fn: (a, b) => a | b, desc: "Bitwise OR - At least one bit must be 1", apps: ["Set specific bits", "Hardware: addition, combining flags"] },
  XOR:  { symbol: "⊕", fn: (a, b) => a ^ b, desc: "Bitwise XOR - Bits must differ", apps: ["Toggle bits", "Encryption, parity checking, adders"] },
  NOT:  { symbol: "¬", fn: (a) => ~a, desc: "Bitwise NOT - Inverts all bits", apps: ["One's complement", "Inverting flags, complement logic"] },
  NAND: { symbol: "⊼", fn: (a, b) => ~(a & b), desc: "Bitwise NAND - NOT of AND", apps: ["Universal gate - builds any circuit", "Apollo Guidance Computer used NOR/NAND"] },
  NOR:  { symbol: "⊽", fn: (a, b) => ~(a | b), desc: "Bitwise NOR - NOT of OR", apps: ["Universal gate", "SR Latch memory, set-reset logic"] },
}

function BinaryOperations() {
  const [inputA, setInputA] = useState("1101")
  const [inputB, setInputB] = useState("1010")
  const [op, setOp] = useState("AND")
  const [bitWidth, setBitWidth] = useState(8)

  const o = OPS[op]
  const mask = bitWidth === 32 ? 0xFFFFFFFF : (1 << bitWidth) - 1
  const pad = (s: string) => s.replace(/[^01]/g, "").padStart(bitWidth, "0").slice(-bitWidth)
  const binA = pad(inputA)
  const binB = pad(inputB)

  const { resultBin, decResult, hexResult, error } = useMemo(() => {
    if (!inputA.trim()) return { resultBin: "", decResult: "", hexResult: "", error: "" }
    try {
      const decA = parseInt(binA, 2)
      const decB = parseInt(binB, 2)
      if (isNaN(decA) || isNaN(decB)) return { resultBin: "", decResult: "", hexResult: "", error: "Invalid binary" }
      const res = o.fn(decA, decB) & mask
      return {
        resultBin: res.toString(2).padStart(bitWidth, "0"),
        decResult: res.toString(),
        hexResult: "0x" + res.toString(16).toUpperCase().padStart(Math.ceil(bitWidth / 4), "0"),
        error: "",
      }
    } catch {
      return { resultBin: "", decResult: "", hexResult: "", error: "Invalid binary input" }
    }
  }, [binA, binB, op, bitWidth, o, mask, inputA])

  const bitAry = binA.split("")
  const bitBry = binB.split("")
  const bitRry = resultBin ? resultBin.split("") : []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-zinc-900/40 ring-1 ring-white/5 rounded-2xl p-6">
            <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">Configuration</p>
            <div className="space-y-4 mt-3">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2">Bit Width</label>
                <div className="flex gap-2">
                  {[4, 8, 16].map((w) => (
                    <motion.button key={w} whileTap={{ scale: 0.93 }} onClick={() => setBitWidth(w)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ring-1 ${
                        bitWidth === w
                          ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/25 shadow-md shadow-emerald-500/10"
                          : "bg-zinc-900/60 text-zinc-500 ring-white/5 hover:text-zinc-300"
                      }`}>
                      {w}-bit
                    </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2">Operation</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(OPS).map((name) => (
                    <motion.button key={name} whileTap={{ scale: 0.93 }} onClick={() => setOp(name)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        op === name
                          ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25 shadow-md shadow-emerald-500/10"
                          : "bg-zinc-900/60 text-zinc-500 ring-1 ring-white/5 hover:text-zinc-300"
                      }`}>
                      {name}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2">Binary A</label>
                <input type="text" value={inputA} onChange={(e) => setInputA(e.target.value.replace(/[^01]/g, ""))}
                  placeholder="Enter binary..."
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-950/60 ring-1 ring-white/5 text-zinc-100 text-sm focus:outline-none focus:ring-emerald-500/30 transition-all placeholder:text-zinc-700"
                  style={MONO} />
              </div>
              {op !== "NOT" && (
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-2">Binary B</label>
                  <input type="text" value={inputB} onChange={(e) => setInputB(e.target.value.replace(/[^01]/g, ""))}
                    placeholder="Enter binary..."
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-950/60 ring-1 ring-white/5 text-zinc-100 text-sm focus:outline-none focus:ring-emerald-500/30 transition-all placeholder:text-zinc-700"
                    style={MONO} />
                </div>
              )}
              <div className="p-3 rounded-xl bg-zinc-900/60 ring-1 ring-white/5">
                <p className="text-xs text-zinc-400 font-semibold">{o.desc}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-zinc-900/40 ring-1 ring-white/5 rounded-2xl p-6">
            <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">Result</p>
            <h2 className="text-lg font-bold text-zinc-100 mb-4">Output</h2>
            {!error ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Binary", value: resultBin },
                    { label: "Decimal", value: decResult },
                    { label: "Hex", value: hexResult },
                  ].map((r) => (
                    <div key={r.label} className="p-4 rounded-xl bg-zinc-900/60 ring-1 ring-white/5">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{r.label}</p>
                      <p className="text-lg font-bold text-zinc-100 truncate" style={MONO}>{r.value}</p>
                    </div>
                  ))}
                </div>

                {resultBin && (
                  <div className="p-5 rounded-xl bg-zinc-900/60 ring-1 ring-white/5">
                    <p className="text-center text-xs font-bold text-zinc-400 mb-3">Bit-by-bit {op} Operation</p>
                    <div className="space-y-1">
                      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${bitWidth}, 1fr)` }}>
                        {Array.from({ length: bitWidth }).map((_, i) => (
                          <div key={i} className="text-center text-[10px] text-zinc-600 font-bold">{bitWidth - 1 - i}</div>
                        ))}
                      </div>
                      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${bitWidth}, 1fr)` }}>
                        {bitAry.map((bit, i) => (
                          <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
                            className={`text-center p-2 rounded text-sm font-bold ring-1 ${
                              bit === "1" ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/25" : "bg-zinc-950/40 text-zinc-600 ring-white/5"
                            }`} style={MONO}>
                            {bit}
                          </motion.div>
                        ))}
                      </div>
                      <div className="text-center py-1">
                        <span className="text-lg font-bold text-zinc-400">{o.symbol}</span>
                      </div>
                      {op !== "NOT" && (
                        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${bitWidth}, 1fr)` }}>
                          {bitBry.map((bit, i) => (
                            <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
                              className={`text-center p-2 rounded text-sm font-bold ring-1 ${
                                bit === "1" ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/25" : "bg-zinc-950/40 text-zinc-600 ring-white/5"
                              }`} style={MONO}>
                              {bit}
                          </motion.div>
                        ))}
                        </div>
                      )}
                      <div className="border-t border-white/5 my-1" />
                      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${bitWidth}, 1fr)` }}>
                        {bitRry.map((bit, i) => (
                          <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 + 0.1 }}
                            className={`text-center p-2 rounded text-sm font-bold ring-2 ${
                              bit === "1" ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/40" : "bg-zinc-950/40 text-zinc-600 ring-white/5"
                            }`} style={MONO}>
                            {bit}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-zinc-900/60 ring-1 ring-white/5">
                  <p className="text-xs font-bold text-zinc-400 mb-2">Real-world Applications of {op}:</p>
                  <ul className="space-y-1">
                    {o.apps.map((app, i) => (
                      <li key={i} className="text-xs text-zinc-500 font-semibold">• {app}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 bg-zinc-900/60 ring-1 ring-white/5 rounded-2xl">
                <p className="text-xs font-semibold text-zinc-600">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Scientific Calculator Component ──────────────────────────────────────────

function evalExpr(tokens: string[]): number {
  const output: number[] = []
  const ops: string[] = []

  const precedence: Record<string, number> = { "+": 1, "-": 1, "×": 2, "÷": 2, "^": 3 }
  const applyOp = (op: string): void => {
    const b = output.pop()!
    const a = output.pop()!
    switch (op) {
      case "+": output.push(a + b); break
      case "-": output.push(a - b); break
      case "×": output.push(a * b); break
      case "÷": output.push(b === 0 ? NaN : a / b); break
      case "^": output.push(Math.pow(a, b)); break
    }
  }

  let lastWasNum = false
  for (const t of tokens) {
    if (t === "(") { ops.push(t); lastWasNum = false }
    else if (t === ")") {
      while (ops.length && ops[ops.length - 1] !== "(") applyOp(ops.pop()!)
      ops.pop()
      lastWasNum = true
    } else if (t === "-" && !lastWasNum) {
      output.push(0)
      ops.push("-")
      lastWasNum = false
    } else if (t in precedence) {
      while (ops.length && ops[ops.length - 1] !== "(" && (precedence[ops[ops.length - 1]] ?? 0) >= precedence[t]) applyOp(ops.pop()!)
      ops.push(t)
      lastWasNum = false
    } else {
      output.push(parseFloat(t))
      lastWasNum = true
    }
  }
  while (ops.length) applyOp(ops.pop()!)
  return output[0]
}

function tokenize(expr: string): string[] {
  const tokens: string[] = []
  let num = ""
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i]
    if ((ch >= "0" && ch <= "9") || ch === ".") {
      num += ch
    } else {
      if (num) { tokens.push(num); num = "" }
      if (ch === " ") continue
      if (ch === "(" || ch === ")" || ch === "^" || ch === "+" || ch === "-" || ch === "×" || ch === "÷") {
        tokens.push(ch)
      }
    }
  }
  if (num) tokens.push(num)
  return tokens
}

function ScientificCalculator() {
  const [display, setDisplay] = useState("0")
  const [expression, setExpression] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [angleMode, setAngleMode] = useState<"deg" | "rad">("deg")

  const toRad = (v: number) => angleMode === "deg" ? (v * Math.PI) / 180 : v

  const handleNumber = useCallback((n: string) => {
    setDisplay((d) => {
      if (d === "0" && n !== ".") return n
      if (n === "." && d.includes(".")) return d
      return d + n
    })
  }, [])

  const handleOp = useCallback((op: string) => {
    setExpression((e) => e + display + " " + op + " ")
    setDisplay("0")
  }, [display])

  const handleEquals = useCallback(() => {
    try {
      const full = expression + display
      const tokens = tokenize(full)
      const result = evalExpr(tokens)
      if (typeof result === "number" && isFinite(result)) {
        const r = parseFloat(result.toPrecision(12))
        setHistory((h) => [full + " = " + r, ...h].slice(0, 20))
        setDisplay(String(r))
        setExpression("")
      } else {
        setDisplay("Error")
      }
    } catch {
      setDisplay("Error")
    }
  }, [expression, display])

  const handleClear = useCallback(() => { setDisplay("0"); setExpression("") }, [])

  const handleBackspace = useCallback(() => {
    setDisplay((d) => d.length > 1 ? d.slice(0, -1) : "0")
  }, [])

  const handleScientific = useCallback((fn: string) => {
    const val = parseFloat(display)
    if (isNaN(val)) return
    let result: number
    switch (fn) {
      case "sin": result = Math.sin(toRad(val)); break
      case "cos": result = Math.cos(toRad(val)); break
      case "tan": result = Math.cos(toRad(val)) === 0 ? NaN : Math.tan(toRad(val)); break
      case "log": result = val <= 0 ? NaN : Math.log10(val); break
      case "ln": result = val <= 0 ? NaN : Math.log(val); break
      case "√": result = val < 0 ? NaN : Math.sqrt(val); break
      case "x²": result = val * val; break
      case "x³": result = val * val * val; break
      case "1/x": result = val === 0 ? NaN : 1 / val; break
      case "π": setDisplay(String(parseFloat(Math.PI.toPrecision(12)))); return
      case "e": setDisplay(String(parseFloat(Math.E.toPrecision(12)))); return
      case "n!": {
        if (val < 0 || !Number.isInteger(val) || val > 170) { setDisplay("Error"); return }
        result = 1; for (let i = 2; i <= val; i++) result *= i; break
      }
      default: return
    }
    if (isNaN(result) || !isFinite(result)) {
      setDisplay("Error")
    } else {
      setDisplay(String(parseFloat(result.toPrecision(12))))
    }
  }, [display, angleMode])

  const sciBtns = [
    { label: "sin", fn: "sin" }, { label: "cos", fn: "cos" }, { label: "tan", fn: "tan" },
    { label: "log", fn: "log" }, { label: "ln", fn: "ln" }, { label: "√", fn: "√" },
    { label: "x²", fn: "x²" }, { label: "x³", fn: "x³" }, { label: "1/x", fn: "1/x" },
    { label: "π", fn: "π" }, { label: "e", fn: "e" }, { label: "n!", fn: "n!" },
  ]

  const numBtns = [
    ["7", "8", "9", "÷"],
    ["4", "5", "6", "×"],
    ["1", "2", "3", "-"],
    ["0", ".", "±", "+"],
  ]

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Angle mode toggle */}
      <div className="flex justify-center">
        <div className="bg-zinc-900 rounded-xl p-1 border border-white/5 shadow-inner flex">
          {(["deg", "rad"] as const).map((m) => (
            <motion.button key={m} whileTap={{ scale: 0.97 }}
              onClick={() => setAngleMode(m)}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                angleMode === m ? "bg-zinc-800 text-zinc-100 shadow-md border border-white/5" : "text-zinc-500 hover:text-zinc-300"
              }`}>
              {m === "deg" ? "Degrees" : "Radians"}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900/40 ring-1 ring-white/5 rounded-2xl p-6">
        {/* Display */}
        <div className="text-right mb-5">
          <p className="text-xs text-zinc-600 h-5 truncate" style={MONO}>{expression || "\u00A0"}</p>
          <motion.p key={display} initial={{ opacity: 0.7 }} animate={{ opacity: 1 }}
            className="text-4xl font-bold text-zinc-100 truncate" style={MONO}>{display}</motion.p>
        </div>

        {/* Scientific buttons */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleClear}
            className="col-span-2 py-3 rounded-xl text-sm font-bold bg-red-500/15 text-red-400 ring-1 ring-red-500/25 hover:bg-red-500/25 transition-all">
            AC
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleBackspace}
            className="py-3 rounded-xl text-sm font-bold bg-zinc-900/60 text-zinc-400 ring-1 ring-white/5 hover:text-zinc-200 transition-all">
            <Delete size={14} className="mx-auto" />
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleOp("÷")}
            className="py-3 rounded-xl text-sm font-bold bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25 hover:bg-emerald-500/25 transition-all">
            ÷
          </motion.button>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-3">
          {sciBtns.map((b) => (
            <motion.button key={b.fn} whileTap={{ scale: 0.88 }} onClick={() => handleScientific(b.fn)}
              className="py-2.5 rounded-xl text-xs font-bold bg-zinc-900/60 text-zinc-400 ring-1 ring-white/5 hover:text-zinc-200 hover:bg-zinc-800/60 transition-all">
              {b.label}
            </motion.button>
          ))}
        </div>

        {/* Number pad */}
        {numBtns.map((row, ri) => (
          <div key={ri} className="grid grid-cols-4 gap-2 mb-2">
            {row.map((btn) => {
              const isOp = ["÷", "×", "-", "+"].includes(btn)
              const isSpecial = btn === "±"
              return (
                <motion.button key={`${ri}-${btn}`} whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (isOp) handleOp(btn)
                    else if (isSpecial) setDisplay((d) => d.startsWith("-") ? d.slice(1) : "-" + d)
                    else handleNumber(btn)
                  }}
                  className={`py-3.5 rounded-xl text-sm font-bold transition-all ${
                    isOp
                      ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25 hover:bg-emerald-500/25"
                      : "bg-zinc-900/60 text-zinc-200 ring-1 ring-white/5 hover:bg-zinc-800/60"
                  }`}>
                  {btn}
                </motion.button>
              )
            })}
          </div>
        ))}

        <motion.button whileTap={{ scale: 0.97 }} onClick={handleEquals}
          className="w-full py-3.5 rounded-xl text-sm font-bold bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30 hover:bg-emerald-500/30 transition-all shadow-md shadow-emerald-500/5">
          =
        </motion.button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-zinc-900/40 ring-1 ring-white/5 rounded-2xl p-5">
          <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-2">History</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {history.map((h, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                className="text-xs text-zinc-500 font-bold py-1 border-b border-white/5 last:border-0" style={MONO}>
                {h}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Unit Converter Component ─────────────────────────────────────────────────

const UNIT_CATEGORIES = {
  Length: {
    icon: "📏",
    units: [
      { key: "mm", label: "Millimeter", abbr: "mm", factor: 0.001 },
      { key: "cm", label: "Centimeter", abbr: "cm", factor: 0.01 },
      { key: "m", label: "Meter", abbr: "m", factor: 1 },
      { key: "km", label: "Kilometer", abbr: "km", factor: 1000 },
      { key: "in", label: "Inch", abbr: "in", factor: 0.0254 },
      { key: "ft", label: "Foot", abbr: "ft", factor: 0.3048 },
      { key: "yd", label: "Yard", abbr: "yd", factor: 0.9144 },
      { key: "mi", label: "Mile", abbr: "mi", factor: 1609.344 },
    ],
  },
  Weight: {
    icon: "⚖️",
    units: [
      { key: "mg", label: "Milligram", abbr: "mg", factor: 0.000001 },
      { key: "g", label: "Gram", abbr: "g", factor: 0.001 },
      { key: "kg", label: "Kilogram", abbr: "kg", factor: 1 },
      { key: "t", label: "Metric Ton", abbr: "t", factor: 1000 },
      { key: "oz", label: "Ounce", abbr: "oz", factor: 0.0283495 },
      { key: "lb", label: "Pound", abbr: "lb", factor: 0.453592 },
    ],
  },
  Temperature: {
    icon: "🌡️",
    units: [
      { key: "C", label: "Celsius", abbr: "°C", factor: 0 },
      { key: "F", label: "Fahrenheit", abbr: "°F", factor: 0 },
      { key: "K", label: "Kelvin", abbr: "K", factor: 0 },
    ],
    convert: (val: number, from: string, to: string) => {
      let celsius: number
      if (from === "C") celsius = val
      else if (from === "F") celsius = (val - 32) * 5 / 9
      else celsius = val - 273.15
      if (to === "C") return celsius
      if (to === "F") return celsius * 9 / 5 + 32
      return celsius + 273.15
    },
  },
  Speed: {
    icon: "🏃",
    units: [
      { key: "ms", label: "Meters/sec", abbr: "m/s", factor: 1 },
      { key: "kmh", label: "Km/hour", abbr: "km/h", factor: 0.277778 },
      { key: "mph", label: "Miles/hour", abbr: "mph", factor: 0.44704 },
      { key: "kn", label: "Knots", abbr: "kn", factor: 0.514444 },
      { key: "fts", label: "Feet/sec", abbr: "ft/s", factor: 0.3048 },
    ],
  },
  Data: {
    icon: "💾",
    units: [
      { key: "B", label: "Byte", abbr: "B", factor: 1 },
      { key: "KB", label: "Kilobyte", abbr: "KB", factor: 1024 },
      { key: "MB", label: "Megabyte", abbr: "MB", factor: 1048576 },
      { key: "GB", label: "Gigabyte", abbr: "GB", factor: 1073741824 },
      { key: "TB", label: "Terabyte", abbr: "TB", factor: 1099511627776 },
    ],
  },
  Time: {
    icon: "⏰",
    units: [
      { key: "ms", label: "Millisecond", abbr: "ms", factor: 0.001 },
      { key: "s", label: "Second", abbr: "s", factor: 1 },
      { key: "min", label: "Minute", abbr: "min", factor: 60 },
      { key: "hr", label: "Hour", abbr: "hr", factor: 3600 },
      { key: "day", label: "Day", abbr: "day", factor: 86400 },
      { key: "wk", label: "Week", abbr: "wk", factor: 604800 },
    ],
  },
  Area: {
    icon: "📐",
    units: [
      { key: "sqm", label: "Square Meter", abbr: "m²", factor: 1 },
      { key: "sqkm", label: "Square Km", abbr: "km²", factor: 1000000 },
      { key: "sqft", label: "Square Foot", abbr: "ft²", factor: 0.092903 },
      { key: "sqmi", label: "Square Mile", abbr: "mi²", factor: 2589988 },
      { key: "ac", label: "Acre", abbr: "ac", factor: 4046.86 },
      { key: "ha", label: "Hectare", abbr: "ha", factor: 10000 },
    ],
  },
  Volume: {
    icon: "🧪",
    units: [
      { key: "ml", label: "Milliliter", abbr: "mL", factor: 0.001 },
      { key: "l", label: "Liter", abbr: "L", factor: 1 },
      { key: "gal", label: "Gallon (US)", abbr: "gal", factor: 3.78541 },
      { key: "qt", label: "Quart (US)", abbr: "qt", factor: 0.946353 },
      { key: "pt", label: "Pint (US)", abbr: "pt", factor: 0.473176 },
      { key: "cup", label: "Cup (US)", abbr: "cup", factor: 0.236588 },
    ],
  },
} as const

type UnitCategory = keyof typeof UNIT_CATEGORIES

function UnitConverter() {
  const [category, setCategory] = useState<UnitCategory>("Length")
  const [fromUnit, setFromUnit] = useState("m")
  const [toUnit, setToUnit] = useState("km")
  const [inputVal, setInputVal] = useState("1")
  const [searchFrom, setSearchFrom] = useState("")
  const [searchTo, setSearchTo] = useState("")

  const cat = UNIT_CATEGORIES[category]
  const filteredFrom = cat.units.filter((u) => u.label.toLowerCase().includes(searchFrom.toLowerCase()) || u.abbr.toLowerCase().includes(searchFrom.toLowerCase()))
  const filteredTo = cat.units.filter((u) => u.label.toLowerCase().includes(searchTo.toLowerCase()) || u.abbr.toLowerCase().includes(searchTo.toLowerCase()))

  const result = useMemo(() => {
    const val = parseFloat(inputVal)
    if (isNaN(val)) return ""
    if (category === "Temperature") {
      const r = (cat as any).convert(val, fromUnit, toUnit)
      return parseFloat(r.toPrecision(10)).toString()
    }
    const fromFactor = cat.units.find((u) => u.key === fromUnit)?.factor ?? 1
    const toFactor = cat.units.find((u) => u.key === toUnit)?.factor ?? 1
    if (toFactor === 0) return ""
    const baseVal = val * fromFactor
    const converted = baseVal / toFactor
    return parseFloat(converted.toPrecision(10)).toString()
  }, [inputVal, fromUnit, toUnit, category, cat])

  const fromLabel = cat.units.find((u) => u.key === fromUnit)
  const toLabel = cat.units.find((u) => u.key === toUnit)

  const swapUnits = useCallback(() => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
    setInputVal(result || "0")
  }, [toUnit, fromUnit, result])

  return (
    <div className="space-y-6">
      {/* Category tabs */}
      <div className="overflow-x-auto pb-2 -mx-3 px-3 pt-1">
        <div className="flex gap-2 min-w-max">
          {(Object.keys(UNIT_CATEGORIES) as UnitCategory[]).map((c) => (
            <motion.button key={c} whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCategory(c)
                const u = UNIT_CATEGORIES[c].units
                setFromUnit(u[0].key)
                setToUnit(u[1]?.key || u[0].key)
              }}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                category === c
                  ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25 shadow-md shadow-emerald-500/10"
                  : "bg-zinc-900/60 text-zinc-500 ring-1 ring-white/5 hover:text-zinc-300 hover:ring-white/10"
              }`}>
              <span>{UNIT_CATEGORIES[c].icon}</span> {c}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Two-panel layout: From | Converter | To */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
        {/* From unit list */}
        <div className="lg:col-span-2 bg-zinc-900/40 ring-1 ring-white/5 rounded-2xl p-5">
          <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-3">From</p>
          <input type="text" value={searchFrom} onChange={(e) => setSearchFrom(e.target.value)}
            placeholder="Search unit..."
            className="w-full px-3 py-2.5 rounded-xl bg-zinc-950/60 ring-1 ring-white/5 text-zinc-100 text-xs focus:outline-none focus:ring-emerald-500/30 transition-all placeholder:text-zinc-700 mb-3" />
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
            {filteredFrom.map((u) => (
              <motion.button key={u.key} whileTap={{ scale: 0.97 }}
                onClick={() => { setFromUnit(u.key); setSearchFrom("") }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  fromUnit === u.key
                    ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25"
                    : "bg-zinc-900/60 text-zinc-500 ring-1 ring-white/5 hover:text-zinc-300 hover:ring-white/10"
                }`}>
                <span>{u.label}</span>
                <span className="text-[10px] opacity-60" style={MONO}>{u.abbr}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Center: Input / Output / Swap */}
        <div className="lg:col-span-1 bg-zinc-900/40 ring-1 ring-white/5 rounded-2xl p-6 flex flex-col justify-center gap-5">
          <div>
            <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-2">Value</p>
            <input type="text" value={inputVal} onChange={(e) => setInputVal(e.target.value.replace(/[^0-9.\-]/g, ""))}
              className="w-full px-4 py-3.5 rounded-xl bg-zinc-950/60 ring-1 ring-white/5 text-zinc-100 text-xl font-bold focus:outline-none focus:ring-emerald-500/30 transition-all text-center"
              style={MONO} />
            <p className="text-center text-[10px] text-zinc-600 mt-1.5 font-bold">{fromLabel?.abbr}</p>
          </div>

          <div className="flex justify-center">
            <motion.button whileTap={{ scale: 0.85, rotate: 180 }} onClick={swapUnits}
              className="w-12 h-12 rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-md shadow-emerald-500/5">
              ⇄
            </motion.button>
          </div>

          <div>
            <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-2">Result</p>
            <motion.div key={result} initial={{ opacity: 0.6 }} animate={{ opacity: 1 }}
              className="w-full px-4 py-3.5 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20 text-emerald-300 text-xl font-bold min-h-[52px] text-center flex items-center justify-center"
              style={MONO}>
              {result || "—"}
            </motion.div>
            <p className="text-center text-[10px] text-zinc-600 mt-1.5 font-bold">{toLabel?.abbr}</p>
          </div>
        </div>

        {/* To unit list */}
        <div className="lg:col-span-2 bg-zinc-900/40 ring-1 ring-white/5 rounded-2xl p-5">
          <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-3">To</p>
          <input type="text" value={searchTo} onChange={(e) => setSearchTo(e.target.value)}
            placeholder="Search unit..."
            className="w-full px-3 py-2.5 rounded-xl bg-zinc-950/60 ring-1 ring-white/5 text-zinc-100 text-xs focus:outline-none focus:ring-emerald-500/30 transition-all placeholder:text-zinc-700 mb-3" />
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
            {filteredTo.map((u) => (
              <motion.button key={u.key} whileTap={{ scale: 0.97 }}
                onClick={() => { setToUnit(u.key); setSearchTo("") }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  toUnit === u.key
                    ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25"
                    : "bg-zinc-900/60 text-zinc-500 ring-1 ring-white/5 hover:text-zinc-300 hover:ring-white/10"
                }`}>
                <span>{u.label}</span>
                <span className="text-[10px] opacity-60" style={MONO}>{u.abbr}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Percentage Calculator Component ──────────────────────────────────────────

function PercentageCalculator() {
  const [mode, setMode] = useState<"of" | "is" | "change">("of")
  const [valA, setValA] = useState("")
  const [valB, setValB] = useState("")

  const result = useMemo(() => {
    const a = parseFloat(valA)
    const b = parseFloat(valB)
    if (isNaN(a) || isNaN(b)) return { value: "", formula: "" }
    if (mode === "of") {
      const r = (a / 100) * b
      return { value: r.toFixed(2), formula: `${a}% × ${b} = ${r.toFixed(2)}` }
    }
    if (mode === "is") {
      if (b === 0) return { value: "∞", formula: "Cannot divide by zero" }
      const r = (a / b) * 100
      return { value: r.toFixed(2) + "%", formula: `(${a} ÷ ${b}) × 100 = ${r.toFixed(2)}%` }
    }
    if (a === 0) return { value: "∞", formula: "Cannot divide by zero" }
    const r = ((b - a) / Math.abs(a)) * 100
    const sign = r >= 0 ? "+" : ""
    return { value: sign + r.toFixed(2) + "%", formula: `((${b} − ${a}) ÷ |${a}|) × 100 = ${sign}${r.toFixed(2)}%` }
  }, [valA, valB, mode])

  const modes = [
    { key: "of" as const, label: "% of", desc: "What is X% of Y?", aLabel: "Percentage (%)", bLabel: "Number" },
    { key: "is" as const, label: "is % of", desc: "X is what % of Y?", aLabel: "Value", bLabel: "Total" },
    { key: "change" as const, label: "% change", desc: "Change from X to Y?", aLabel: "Old Value", bLabel: "New Value" },
  ]

  const current = modes.find((m) => m.key === mode)!

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-zinc-900/40 ring-1 ring-white/5 rounded-2xl p-6">
        <div className="flex gap-2 mb-4">
          {modes.map((m) => (
            <motion.button key={m.key} whileTap={{ scale: 0.95 }}
              onClick={() => { setMode(m.key); setValA(""); setValB("") }}
              className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                mode === m.key
                  ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25 shadow-md shadow-emerald-500/10"
                  : "bg-zinc-900/60 text-zinc-500 ring-1 ring-white/5 hover:text-zinc-300 hover:ring-white/10"
              }`}>
              {m.label}
            </motion.button>
          ))}
        </div>
        <p className="text-xs text-zinc-500 font-semibold mb-5">{current.desc}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600 mb-2">{current.aLabel}</label>
            <input type="text" value={valA} onChange={(e) => setValA(e.target.value.replace(/[^0-9.\-]/g, ""))}
              placeholder="0"
              className="w-full px-4 py-3.5 rounded-xl bg-zinc-950/60 ring-1 ring-white/5 text-zinc-100 text-xl font-bold focus:outline-none focus:ring-emerald-500/30 transition-all text-center placeholder:text-zinc-700"
              style={MONO} />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600 mb-2">{current.bLabel}</label>
            <input type="text" value={valB} onChange={(e) => setValB(e.target.value.replace(/[^0-9.\-]/g, ""))}
              placeholder="0"
              className="w-full px-4 py-3.5 rounded-xl bg-zinc-950/60 ring-1 ring-white/5 text-zinc-100 text-xl font-bold focus:outline-none focus:ring-emerald-500/30 transition-all text-center placeholder:text-zinc-700"
              style={MONO} />
          </div>

          <motion.div key={result.value} initial={{ opacity: 0.6, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600 mb-2">Result</label>
            <div className="w-full px-4 py-4 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20 text-emerald-300 text-2xl font-bold min-h-[56px] text-center flex items-center justify-center shadow-md shadow-emerald-500/5"
              style={MONO}>
              {result.value || "—"}
            </div>
          </motion.div>

          {result.formula && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-zinc-900/60 ring-1 ring-white/5">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Formula</p>
              <p className="text-xs text-zinc-400 font-bold" style={MONO}>{result.formula}</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Calculator Plus Section ─────────────────────────────────────────────

const TOOLS = [
  { key: "scientific" as const, title: "Scientific Calculator", desc: "Trig, logs, powers & parentheses", icon: Calculator, color: "#fb923c" },
  { key: "units" as const, title: "Unit Converter", desc: "Length, weight, temp, speed & more", icon: Ruler, color: "#f472b6" },
  { key: "percent" as const, title: "Percentage Calculator", desc: "% of, % change, discounts", icon: Percent, color: "#facc15" },
  { key: "converter" as const, title: "Number Converter", desc: "Binary, Hex, Decimal converter", icon: Activity, color: "#34d399" },
  { key: "logic" as const, title: "Logic Gate Simulator", desc: "Visualize AND, OR, XOR gates", icon: Zap, color: "#60a5fa" },
  { key: "binary" as const, title: "Binary Operations", desc: "Bitwise AND, OR, XOR operations", icon: Binary, color: "#a78bfa" },
]

type ToolKey = typeof TOOLS[number]["key"]

export function CalculatorSection() {
  const [activeTool, setActiveTool] = useState<ToolKey | null>(null)
  const activeInfo = TOOLS.find((t) => t.key === activeTool)

  return (
    <div className="min-h-full pt-[3.75rem] pb-20 px-3 sm:px-4 lg:px-8 lg:pb-8 w-full">
      <AnimatePresence mode="wait">
        {!activeTool ? (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">Study Tools</p>
                <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Calculator Plus</h1>
                <p className="text-xs mt-1 text-zinc-500">Select a tool below to enhance your study session</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {TOOLS.map((tool, i) => (
                <motion.button key={tool.key}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveTool(tool.key)}
                  className="text-left bg-zinc-900/40 ring-1 ring-white/5 rounded-2xl p-5 hover:ring-zinc-700 hover:bg-zinc-900/60 transition-all group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: tool.color }} />
                  <div className="flex items-center gap-3.5 relative z-10">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ring-1 ring-white/5 group-hover:ring-white/10 transition-all"
                      style={{ background: `${tool.color}10` }}>
                      <tool.icon className="w-[18px] h-[18px]" style={{ color: tool.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-zinc-100 group-hover:text-white transition-colors">{tool.title}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{tool.desc}</p>
                    </div>
                    <ChevronRight size={14} className="text-zinc-700 group-hover:text-zinc-400 transition-colors shrink-0" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="tool" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
            <div className="flex justify-between items-start mb-8">
              <div>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setActiveTool(null)}
                  className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors mb-1">
                  <ArrowLeft size={10} />Calculator Plus
                </motion.button>
                <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">{activeInfo?.title}</h1>
                <p className="text-xs mt-1 text-zinc-500">{activeInfo?.desc}</p>
              </div>
            </div>
            {activeTool === "converter" && <NumberConverter />}
            {activeTool === "logic" && <LogicGateSimulator />}
            {activeTool === "binary" && <BinaryOperations />}
            {activeTool === "scientific" && <ScientificCalculator />}
            {activeTool === "units" && <UnitConverter />}
            {activeTool === "percent" && <PercentageCalculator />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
