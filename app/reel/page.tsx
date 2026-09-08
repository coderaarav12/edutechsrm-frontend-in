"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  Sparkles,
  ArrowLeft,
  Maximize2,
  Share2,
  Check,
  Shield,
  Clock,
  Compass,
  Zap,
  Bot,
  Flame,
  Award,
} from "lucide-react"

type ReelMode = "cyber" | "poster"
type AspectRatio = "vertical" | "landscape"

interface Scene {
  id: number
  kicker: string
  title: string
  subtitle: string
  duration: number // in seconds
}

const SCENES: Scene[] = [
  {
    id: 1,
    kicker: "SCENE 01 // THE CRISIS",
    title: "07:58 AM.",
    subtitle: "SRM Academia is down again. Will you get debarred?",
    duration: 5,
  },
  {
    id: 2,
    kicker: "SCENE 02 // RE-ENGINEERED",
    title: "Zero Lag. Zero Passwords Stored.",
    subtitle: "In-memory authentication. Raw academic ledger normalized in 120ms.",
    duration: 5,
  },
  {
    id: 3,
    kicker: "SCENE 03 // THE WEAPONS",
    title: "Your Academic Superpowers.",
    subtitle: "Bunk Shield. Day Order Radar. GradeX Simulator. Contextual AI.",
    duration: 7,
  },
  {
    id: 4,
    kicker: "SCENE 04 // THE ARCHITECT",
    title: "Built by an SRM Day Scholar.",
    subtitle: "Engineered by Aarav Goel, 2nd Year CSE AIML. Free & open-source.",
    duration: 5,
  },
  {
    id: 5,
    kicker: "SCENE 05 // ONE TAB. ZERO LAG.",
    title: "Take Control of Your Campus Life.",
    subtitle: "Available on Google Play & Web. Join 1000+ SRMites.",
    duration: 6,
  },
]

const TOTAL_DURATION = SCENES.reduce((acc, s) => acc + s.duration, 0)

export default function MotionReelPage() {
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [activeSceneIdx, setActiveSceneIdx] = useState(0)
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("vertical")
  const [themeMode, setThemeMode] = useState<ReelMode>("cyber")
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [copied, setCopied] = useState(false)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const frameIdRef = useRef<number | null>(null)
  const lastTickRef = useRef<number>(Date.now())

  // Sound Synthesizer via Web Audio API
  const playBeep = useCallback((freq: number, type: OscillatorType = "sine", duration = 0.1, gainVal = 0.08) => {
    if (!soundEnabled) return
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ctx = audioCtxRef.current
      if (ctx.state === "suspended") ctx.resume()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      gain.gain.setValueAtTime(gainVal, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + duration)
    } catch {}
  }, [soundEnabled])

  // Bass impact sound for scene transitions
  const playImpact = useCallback(() => {
    if (!soundEnabled) return
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ctx = audioCtxRef.current
      if (ctx.state === "suspended") ctx.resume()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(140, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.4)
      gain.gain.setValueAtTime(0.25, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.5)
    } catch {}
  }, [soundEnabled])

  // Playhead loop
  useEffect(() => {
    const loop = () => {
      const now = Date.now()
      const dt = (now - lastTickRef.current) / 1000
      lastTickRef.current = now

      if (isPlaying) {
        setCurrentTime((prev) => {
          const next = prev + dt
          if (next >= TOTAL_DURATION) {
            return 0 // loop
          }
          return next
        })
      }
      frameIdRef.current = requestAnimationFrame(loop)
    }
    lastTickRef.current = Date.now()
    frameIdRef.current = requestAnimationFrame(loop)
    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current)
    }
  }, [isPlaying])

  // Calculate current scene based on currentTime
  useEffect(() => {
    let accumulated = 0
    let foundIdx = 0
    for (let i = 0; i < SCENES.length; i++) {
      if (currentTime >= accumulated && currentTime < accumulated + SCENES[i].duration) {
        foundIdx = i
        break
      }
      accumulated += SCENES[i].duration
    }
    if (foundIdx !== activeSceneIdx) {
      setActiveSceneIdx(foundIdx)
      playImpact()
    }
  }, [currentTime, activeSceneIdx, playImpact])

  // Seek to scene start
  const seekToScene = (sceneIdx: number) => {
    let t = 0
    for (let i = 0; i < sceneIdx; i++) {
      t += SCENES[i].duration
    }
    setCurrentTime(t)
    setActiveSceneIdx(sceneIdx)
    playBeep(440, "sine", 0.08)
  }

  // Handle share link
  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Calculate progress of current scene (0 to 1)
  const currentSceneStart = SCENES.slice(0, activeSceneIdx).reduce((acc, s) => acc + s.duration, 0)
  const currentSceneElapsed = currentTime - currentSceneStart
  const currentSceneProgress = Math.min(1, Math.max(0, currentSceneElapsed / SCENES[activeSceneIdx].duration))

  const isCyber = themeMode === "cyber"

  return (
    <div className={`min-h-screen w-full flex flex-col justify-between selection:bg-emerald-400 selection:text-black transition-colors duration-500 ${
      isCyber ? "bg-[#06080c] text-zinc-100" : "bg-[#f4efe6] text-[#111111]"
    }`}>
      
      {/* Top Bar Navigation & Controls */}
      <header className={`w-full border-b py-3 px-4 sm:px-8 flex items-center justify-between z-30 transition-colors ${
        isCyber ? "border-white/10 bg-[#06080c]/80 backdrop-blur-md" : "border-[#111111]/15 bg-[#fbf8f2]/90 backdrop-blur-md"
      }`}>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className={`inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase px-3 py-1.5 rounded-xl border transition-all ${
              isCyber
                ? "border-white/15 bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.08]"
                : "border-[#111111] bg-white text-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#faf7f2]"
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back Home
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-emerald-500 font-bold">
            <Sparkles className="w-3.5 h-3.5 animate-spin" /> Motion Graphic Reel
          </span>
        </div>

        {/* Global Toolbar Options */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Mode Toggle */}
          <div className={`flex items-center rounded-xl p-1 border ${
            isCyber ? "border-white/15 bg-white/[0.04]" : "border-[#111111] bg-white shadow-[2px_2px_0px_#111111]"
          }`}>
            <button
              onClick={() => setThemeMode("cyber")}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                themeMode === "cyber"
                  ? "bg-emerald-400 text-zinc-950 shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Cyber
            </button>
            <button
              onClick={() => setThemeMode("poster")}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                themeMode === "poster"
                  ? "bg-[#111111] text-white shadow-sm"
                  : isCyber ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-black"
              }`}
            >
              Poster
            </button>
          </div>

          {/* Aspect Ratio Switcher */}
          <div className={`hidden md:flex items-center rounded-xl p-1 border ${
            isCyber ? "border-white/15 bg-white/[0.04]" : "border-[#111111] bg-white shadow-[2px_2px_0px_#111111]"
          }`}>
            <button
              onClick={() => setAspectRatio("vertical")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                aspectRatio === "vertical"
                  ? isCyber ? "bg-white/20 text-white" : "bg-[#111111] text-white"
                  : isCyber ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-black"
              }`}
            >
              <Smartphone className="w-3 h-3" /> 9:16 Reel
            </button>
            <button
              onClick={() => setAspectRatio("landscape")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                aspectRatio === "landscape"
                  ? isCyber ? "bg-white/20 text-white" : "bg-[#111111] text-white"
                  : isCyber ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-black"
              }`}
            >
              <Monitor className="w-3 h-3" /> 16:9 Video
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              setSoundEnabled((v) => !v)
              if (!soundEnabled) playBeep(520, "sine", 0.15)
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
              soundEnabled
                ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-400"
                : isCyber
                ? "border-white/15 bg-white/[0.04] text-zinc-400 hover:text-white"
                : "border-[#111111] bg-white text-zinc-700 shadow-[2px_2px_0px_#111111]"
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{soundEnabled ? "Audio On" : "Muted"}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className={`p-2 rounded-xl border text-xs font-mono transition-all ${
              isCyber
                ? "border-white/15 bg-white/[0.04] text-zinc-300 hover:text-white"
                : "border-[#111111] bg-white text-[#111111] shadow-[2px_2px_0px_#111111]"
            }`}
            title="Copy Reel Link"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Motion Screen Frame */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
        <div
          className={`relative overflow-hidden rounded-[32px] transition-all duration-500 flex flex-col justify-between ${
            aspectRatio === "vertical"
              ? "w-full max-w-[410px] h-[730px] shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
              : "w-full max-w-[1000px] h-[580px] shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
          } ${
            isCyber
              ? "border-2 border-emerald-400/30 bg-gradient-to-b from-[#0a0f16] via-[#070b11] to-[#040608]"
              : "border-[3px] border-[#111111] bg-[#ffffff] shadow-[10px_10px_0px_#111111]"
          }`}
        >
          {/* Subtle Halftone & Grid Canvas Background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: isCyber
                ? "radial-gradient(#34d399 1px, transparent 1px)"
                : "radial-gradient(#111111 1.2px, transparent 1.2px)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Top Reel HUD: Timeline Bars */}
          <div className="relative pt-4 px-4 sm:px-6 z-20">
            {/* Multi-Segment Story Bar */}
            <div className="grid grid-cols-5 gap-1.5 mb-3">
              {SCENES.map((scene, idx) => {
                let fill = 0
                if (idx < activeSceneIdx) fill = 100
                else if (idx === activeSceneIdx) fill = currentSceneProgress * 100
                return (
                  <div
                    key={scene.id}
                    onClick={() => seekToScene(idx)}
                    className={`h-1.5 rounded-full overflow-hidden cursor-pointer transition-all ${
                      isCyber ? "bg-white/15" : "bg-[#111111]/20"
                    }`}
                  >
                    <div
                      className={`h-full transition-all duration-75 ${
                        isCyber ? "bg-emerald-400" : "bg-[#111111]"
                      }`}
                      style={{ width: `${fill}%` }}
                    />
                  </div>
                )
              })}
            </div>

            {/* Live Telemetry Kicker & Brand Pill */}
            <div className="flex items-center justify-between">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                isCyber
                  ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                  : "border border-[#111111] bg-[#faf7f2] text-[#111111] shadow-[1.5px_1.5px_0px_#111111]"
              }`}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {SCENES[activeSceneIdx].kicker}
              </div>

              <span className={`text-[11px] font-mono font-bold tracking-widest ${
                isCyber ? "text-zinc-400" : "text-zinc-600"
              }`}>
                {currentTime.toFixed(1)}s / {TOTAL_DURATION.toFixed(0)}s
              </span>
            </div>
          </div>

          {/* SCENE CONTENT RENDERER */}
          <div className="relative flex-1 flex items-center justify-center px-4 sm:px-8 text-center z-10">
            <AnimatePresence mode="wait">
              
              {/* SCENE 01: THE CRISIS */}
              {activeSceneIdx === 0 && (
                <motion.div
                  key="scene-1"
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.05, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="w-full space-y-4"
                >
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="inline-block"
                  >
                    <span className={`font-mono text-5xl sm:text-7xl font-black tracking-tight ${
                      isCyber ? "text-red-400 drop-shadow-[0_0_25px_rgba(248,113,113,0.4)]" : "text-[#b91c1c]"
                    }`}>
                      07:58 AM
                    </span>
                  </motion.div>

                  <div className={`p-4 rounded-2xl border max-w-sm mx-auto backdrop-blur-md ${
                    isCyber
                      ? "border-red-500/30 bg-red-500/10 text-red-300"
                      : "border-2 border-[#111111] bg-[#fee2e2] text-[#991b1b] shadow-[4px_4px_0px_#111111]"
                  }`}>
                    <div className="flex items-center justify-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
                      <Clock className="w-4 h-4 animate-spin" /> SRM Academia Error: 504 Gateway
                    </div>
                    <p className="mt-1 text-xs opacity-90">
                      "Wait... what was my attendance in Calculus? Am I debarred?"
                    </p>
                  </div>

                  <h2 className="font-display text-2xl sm:text-3xl font-black leading-tight pt-2">
                    Why is checking your attendance like <br />
                    <span className="font-serif italic text-emerald-400 font-normal">defusing a live bomb?</span>
                  </h2>
                </motion.div>
              )}

              {/* SCENE 02: THE RE-ENGINEERING */}
              {activeSceneIdx === 1 && (
                <motion.div
                  key="scene-2"
                  initial={{ opacity: 0, scale: 0.85, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.08, y: -20 }}
                  transition={{ duration: 0.45 }}
                  className="w-full space-y-4"
                >
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-bold ${
                    isCyber
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                      : "border-2 border-[#111111] bg-[#ecfdf5] text-[#065f46] shadow-[2px_2px_0px_#111111]"
                  }`}>
                    <Zap className="w-4 h-4 text-emerald-400" /> SYS_INIT // DIRECT HANDSHAKE
                  </div>

                  <h2 className="font-display text-3xl sm:text-5xl font-black leading-tight">
                    Zero Passwords Stored. <br />
                    <span className="font-serif italic font-normal text-emerald-400">120ms In-Memory Sync.</span>
                  </h2>

                  <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto pt-2">
                    <div className={`p-3 rounded-2xl border text-left ${
                      isCyber ? "border-white/10 bg-white/[0.03]" : "border-2 border-[#111111] bg-[#faf7f2] shadow-[3px_3px_0px_#111111]"
                    }`}>
                      <span className="block font-mono text-[10px] text-zinc-400 uppercase font-bold">Latency</span>
                      <span className="font-display text-2xl font-black text-emerald-400">120ms</span>
                      <span className="block text-[10px] text-zinc-500">Live Edge Normalization</span>
                    </div>

                    <div className={`p-3 rounded-2xl border text-left ${
                      isCyber ? "border-white/10 bg-white/[0.03]" : "border-2 border-[#111111] bg-[#faf7f2] shadow-[3px_3px_0px_#111111]"
                    }`}>
                      <span className="block font-mono text-[10px] text-zinc-400 uppercase font-bold">Security</span>
                      <span className="font-display text-2xl font-black text-cyan-400">0 Cached</span>
                      <span className="block text-[10px] text-zinc-500">In-Memory RAM Only</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                    We reverse-engineered the archaic tables and built a blazing fast client that never forgets your pace.
                  </p>
                </motion.div>
              )}

              {/* SCENE 03: THE WEAPONS / SUPERPOWERS */}
              {activeSceneIdx === 2 && (
                <motion.div
                  key="scene-3"
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -25 }}
                  transition={{ duration: 0.4 }}
                  className="w-full space-y-3"
                >
                  <h2 className="font-display text-2xl sm:text-4xl font-black">
                    Your Academic Arsenal.
                  </h2>

                  <div className="grid grid-cols-2 gap-2.5 max-w-md mx-auto text-left">
                    <div className={`p-3 rounded-2xl border ${
                      isCyber ? "border-emerald-400/25 bg-emerald-400/[0.06]" : "border-2 border-[#111111] bg-white shadow-[3px_3px_0px_#111111]"
                    }`}>
                      <Shield className="w-5 h-5 text-emerald-400 mb-1" />
                      <span className="font-display text-xs font-black block">Bunk Shield</span>
                      <span className="text-[10px] text-zinc-400">Calculates exactly how many classes you can skip above 75%.</span>
                    </div>

                    <div className={`p-3 rounded-2xl border ${
                      isCyber ? "border-cyan-400/25 bg-cyan-400/[0.06]" : "border-2 border-[#111111] bg-white shadow-[3px_3px_0px_#111111]"
                    }`}>
                      <Clock className="w-5 h-5 text-cyan-400 mb-1" />
                      <span className="font-display text-xs font-black block">Day Order Sync</span>
                      <span className="text-[10px] text-zinc-400">Room numbers & timetable slots updated before alarms ring.</span>
                    </div>

                    <div className={`p-3 rounded-2xl border ${
                      isCyber ? "border-purple-400/25 bg-purple-400/[0.06]" : "border-2 border-[#111111] bg-white shadow-[3px_3px_0px_#111111]"
                    }`}>
                      <Flame className="w-5 h-5 text-purple-400 mb-1" />
                      <span className="font-display text-xs font-black block">GradeX CGPA</span>
                      <span className="text-[10px] text-zinc-400">Project required internal marks to lock your 9.0+ semester.</span>
                    </div>

                    <div className={`p-3 rounded-2xl border ${
                      isCyber ? "border-amber-400/25 bg-amber-400/[0.06]" : "border-2 border-[#111111] bg-white shadow-[3px_3px_0px_#111111]"
                    }`}>
                      <Compass className="w-5 h-5 text-amber-400 mb-1" />
                      <span className="font-display text-xs font-black block">Campus Radar</span>
                      <span className="text-[10px] text-zinc-400">171 verified hubs, TP lift statuses & walking shortcuts.</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="font-hand text-base sm:text-lg text-emerald-400" style={{ fontFamily: "var(--font-caveat, 'Caveat', cursive)" }}>
                      "Everything you actually care about, none of the university bloat."
                    </span>
                  </div>
                </motion.div>
              )}

              {/* SCENE 04: THE BUILDER */}
              {activeSceneIdx === 3 && (
                <motion.div
                  key="scene-4"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.05, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="w-full space-y-4"
                >
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl overflow-hidden border-2 border-emerald-400 shadow-[0_12px_30px_rgba(52,211,153,0.3)]">
                    <img src="/aarav_goel.jpg" alt="Aarav Goel" className="w-full h-full object-cover" />
                  </div>

                  <div>
                    <h2 className="font-display text-2xl sm:text-3xl font-black">Aarav Goel</h2>
                    <p className="text-xs font-mono uppercase tracking-widest text-emerald-400 mt-0.5">
                      2nd Year CSE AIML · SRMIST KTR
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    "Built by a day scholar between morning campus commutes and back-to-back lectures — because nobody should wait 15 minutes in a crowd just to check their room number."
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <span className={`px-3 py-1 rounded-full border text-[10px] font-mono uppercase font-bold ${
                      isCyber ? "border-white/10 bg-white/[0.04] text-zinc-300" : "border-[#111111] bg-white text-[#111111] shadow-[2px_2px_0px_#111111]"
                    }`}>
                      100% Free & Open Source
                    </span>
                    <span className={`px-3 py-1 rounded-full border text-[10px] font-mono uppercase font-bold ${
                      isCyber ? "border-white/10 bg-white/[0.04] text-zinc-300" : "border-[#111111] bg-white text-[#111111] shadow-[2px_2px_0px_#111111]"
                    }`}>
                      1000+ Campus Reach
                    </span>
                  </div>
                </motion.div>
              )}

              {/* SCENE 05: THE CLIMAX & CTA */}
              {activeSceneIdx === 4 && (
                <motion.div
                  key="scene-5"
                  initial={{ opacity: 0, scale: 0.92, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.05, y: -20 }}
                  transition={{ duration: 0.45 }}
                  className="w-full space-y-4"
                >
                  <div className="inline-block">
                    <span className="font-display text-3xl sm:text-5xl font-black leading-[1.05]">
                      One Tab. <br />
                      <span className="font-serif italic font-normal text-emerald-400">Zero Lag.</span>
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-400 max-w-xs mx-auto">
                    Your entire SRM academic ledger, unlocked and unthrottled.
                  </p>

                  <div className="flex flex-col gap-3 max-w-xs mx-auto pt-2">
                    <a
                      href="https://play.google.com/store/apps/details?id=in.edutechsrm.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 py-3.5 px-4 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-[0_12px_28px_rgba(16,185,129,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <Smartphone className="w-4 h-4" /> Get on Google Play
                    </a>

                    <Link
                      href="/login"
                      className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3 px-4 font-mono font-bold text-xs uppercase tracking-wider border transition-all ${
                        isCyber
                          ? "border-white/15 bg-white/[0.04] text-zinc-200 hover:bg-white/[0.08]"
                          : "border-2 border-[#111111] bg-white text-[#111111] shadow-[3px_3px_0px_#111111] hover:bg-[#faf7f2]"
                      }`}
                    >
                      Launch Web Client →
                    </Link>
                  </div>

                  <div className="pt-2 flex items-center justify-center gap-4 text-xs font-mono text-zinc-500">
                    <a href="https://www.instagram.com/edutechsrm" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
                      @edutechsrm
                    </a>
                    <span>•</span>
                    <a href="https://github.com/coderaarav12" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
                      @coderaarav12
                    </a>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Bottom HUD: Playhead & Scene Selectors */}
          <div className={`relative p-4 border-t z-20 flex items-center justify-between transition-colors ${
            isCyber ? "border-white/10 bg-black/40" : "border-[#111111]/15 bg-[#faf7f2]"
          }`}>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsPlaying((v) => !v)
                  playBeep(isPlaying ? 330 : 660, "sine", 0.08)
                }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isCyber
                    ? "bg-emerald-400 text-zinc-950 hover:bg-emerald-300"
                    : "bg-[#111111] text-white hover:bg-zinc-800 shadow-[2px_2px_0px_#059669]"
                }`}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => {
                  setCurrentTime(0)
                  setActiveSceneIdx(0)
                  playImpact()
                }}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                  isCyber
                    ? "border-white/15 bg-white/[0.04] text-zinc-300 hover:text-white"
                    : "border-[#111111] bg-white text-[#111111] shadow-[2px_2px_0px_#111111]"
                }`}
                title="Restart Reel"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Direct Scene Jump Buttons */}
            <div className="flex items-center gap-1.5">
              {SCENES.map((scene, idx) => (
                <button
                  key={scene.id}
                  onClick={() => seekToScene(idx)}
                  className={`w-7 h-7 rounded-lg text-[10px] font-mono font-bold transition-all ${
                    idx === activeSceneIdx
                      ? isCyber
                        ? "bg-emerald-400 text-zinc-950 font-black scale-105"
                        : "bg-[#111111] text-white font-black scale-105"
                      : isCyber
                      ? "text-zinc-500 hover:text-zinc-200"
                      : "text-zinc-400 hover:text-black"
                  }`}
                >
                  {scene.id}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Reel Footer Notes */}
      <footer className="w-full py-3 px-4 text-center z-20">
        <p className="text-[11px] font-mono text-zinc-500">
          edutechsrm Official Motion Graphic Reel // Engineered by Aarav Goel // SRMIST KTR
        </p>
      </footer>
    </div>
  )
}