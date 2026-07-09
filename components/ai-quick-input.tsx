"use client"

import { useState, useRef, useMemo, useCallback, useEffect } from "react"
import { Bot, SendHorizontal, Mic, StopCircle } from "lucide-react"
import { setPendingQuery } from "@/lib/ai-shared"

const LIMIT_KEY = "ai_daily_limit"
const DAILY_LIMIT = 15

function getDailyCount(): number {
  try {
    const saved = localStorage.getItem(LIMIT_KEY)
    if (!saved) return 0
    const parsed = JSON.parse(saved)
    const today = new Date().toISOString().slice(0, 10)
    return parsed.date === today ? parsed.count : 0
  } catch { return 0 }
}

export function AiQuickInput({ onNavigate }: { onNavigate: (tab: any) => void }) {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const dailyCount = useMemo(() => getDailyCount(), [])
  const limitReached = dailyCount >= DAILY_LIMIT
  const [isListening, setIsListening] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)
  const voiceFailedRef = useRef(false)

  const handleSend = useCallback(() => {
    const text = query.trim()
    if (!text || limitReached) return
    setPendingQuery(text)
    setQuery("")
    onNavigate("ai")
  }, [query, limitReached, onNavigate])

  const showVoiceFailedOnce = useCallback((type: "unsupported" | "error" = "error") => {
    if (voiceFailedRef.current) return
    voiceFailedRef.current = true
    setVoiceStatus(type === "unsupported" ? "Voice not supported" : "Failed to run voice command, please type")
    setTimeout(() => setVoiceStatus(null), 4000)
  }, [])

  const toggleMic = useCallback(async () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      showVoiceFailedOnce("unsupported")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = true
    recognition.continuous = false
    recognitionRef.current = recognition
    let finalTranscript = ""
    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript
      }
      const interim = Array.from(event.results)
        .filter((r: any) => !r.isFinal)
        .map((r: any) => r[0].transcript)
        .join("")
      setQuery(finalTranscript + interim)
    }
    const cleanup = () => {
      setIsListening(false)
    }
    recognition.onend = () => {
      cleanup()
      if (finalTranscript.trim()) {
        setPendingQuery(finalTranscript.trim())
        setQuery("")
        onNavigate("ai")
      }
    }
    recognition.onerror = (e: any) => {
      console.warn("[ai-quick-input] Speech recognition error:", e.error || e)
      showVoiceFailedOnce()
      cleanup()
    }
    try {
      recognition.start()
    } catch (e: any) {
      console.warn("[ai-quick-input] Speech recognition start failed:", e)
      showVoiceFailedOnce()
      cleanup()
      return
    }
    setIsListening(true)
    setQuery("")
  }, [isListening, onNavigate, showVoiceFailedOnce])

  return (
    <div className="w-full">
      {voiceStatus && (
        <div className="text-xs text-red-400/70 text-center py-1 mb-1">{voiceStatus}</div>
      )}
      <div
        className="rounded-2xl border overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-violet-500/30"
        style={{ background: "var(--card-bg, rgba(24,24,27,0.7))", borderColor: limitReached ? "rgba(251,191,36,0.15)" : "rgba(167,139,250,0.15)" }}
      >
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(167,139,250,0.1)" }}>
            <Bot className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />
          </div>
          <div className="flex-1 relative flex items-center min-h-[28px]">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); handleSend() }
              }}
              placeholder={limitReached ? "Daily limit reached" : "Ask edutechsrm AI..."}
              className="w-full bg-transparent text-sm outline-none"
              style={{ color: "var(--text-primary, #f4f4f5)", visibility: isListening ? "hidden" : "visible" }}
              disabled={limitReached}
            />
            {isListening && (
              <div className="absolute inset-0 flex items-center px-2 bg-zinc-900/60 backdrop-blur-sm rounded-lg pointer-events-none z-10">
                <span className="text-xs text-emerald-400/80 animate-pulse font-medium tracking-wide">Listening...</span>
              </div>
            )}
          </div>
          <button
            onClick={toggleMic}
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{
              background: isListening ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.04)",
              color: isListening ? "#f87171" : "var(--text-faint, #52525b)",
            }}
          >
            {isListening ? <StopCircle className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleSend}
            disabled={!query.trim() || limitReached}
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{
              background: query.trim() && !limitReached ? "linear-gradient(135deg, #a78bfa, #7c3aed)" : "rgba(255,255,255,0.04)",
              color: query.trim() && !limitReached ? "#fff" : "var(--text-faint, #52525b)",
              opacity: query.trim() && !limitReached ? 1 : 0.5,
              cursor: query.trim() && !limitReached ? "pointer" : "not-allowed",
            }}
          >
            <SendHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
