"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight, Bot, SendHorizontal, Sparkles, X } from "lucide-react"

type PrankMessage = {
  role: "assistant" | "user"
  content: string
}

const prankReplies = [
  "Cute question. Shame you brought zero data. Login first.",
  "I could answer that properly, but guest mode is giving me NPC energy.",
  "Your timetable is locked outside. I am not doing astrology today. Login.",
  "Bold of you to ask academic AI while hiding your academics.",
  "This answer is above your current clearance level. The login button is right there.",
  "I have the brain. You have the missing session token. Fix your side.",
  "Guest mode gets sarcasm. Logged-in mode gets actual intelligence.",
  "No attendance data, no marks, no timetable. What exactly am I supposed to cook with?",
  "I would calculate your bunk limit, but your subjects are currently imaginary.",
  "You want premium answers with demo-mode confidence. Fascinating.",
  "Login once and I become useful. Stay logged out and enjoy the attitude.",
  "Your question deserves context. Your login discipline does not.",
  "I can roast your attendance only after you let me see it.",
  "This could have been solved already, but you chose the scenic route.",
  "Ask again after login. I prefer real data over vibes.",
  "I am not confused. I am under-informed. There is a difference.",
  "The dashboard has the facts. I have the ego. Bring us together.",
  "No session token detected. Academic prophecy cancelled.",
  "You are one login away from me being annoyingly useful.",
  "I will stop being difficult when you stop being logged out.",
]

export function AiPrankPopup() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<PrankMessage[]>([
    { role: "assistant", content: "I am edutechsrm AI. Ask me something, but do not expect miracles without login." },
  ])
  const [input, setInput] = useState("")
  const [showLogin, setShowLogin] = useState(false)
  const [typingText, setTypingText] = useState("")
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, typingText])

  useEffect(() => {
    if (!open) return
    const handleClick = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const id = window.setTimeout(() => document.addEventListener("click", handleClick), 100)
    return () => {
      window.clearTimeout(id)
      document.removeEventListener("click", handleClick)
    }
  }, [open])

  const handleSend = () => {
    const text = input.trim()
    if (!text || typing) return

    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: text }])
    const reply = prankReplies[Math.floor(Math.random() * prankReplies.length)]
    setTyping(true)
    setTypingText("")

    let i = 0
    const interval = window.setInterval(() => {
      i += 1
      setTypingText(reply.slice(0, i))
      if (i >= reply.length) {
        window.clearInterval(interval)
        setTyping(false)
        setTypingText("")
        setMessages((prev) => [...prev, { role: "assistant", content: reply }])
        setShowLogin(true)
      }
    }, 18)
  }

  const handleLoginRedirect = () => {
    setOpen(false)
    window.setTimeout(() => {
      window.location.href = "/login"
    }, 180)
  }

  return (
    <>
      <button
        onClick={(event) => {
          event.stopPropagation()
          setOpen((value) => !value)
        }}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-2xl shadow-xl transition hover:scale-110 active:scale-95"
        style={{
          background: open ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, #34d399, #00f5d4)",
          color: open ? "#a1a1aa" : "#07120d",
          border: open ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(52,211,153,0.45)",
          boxShadow: open ? "none" : "0 8px 32px rgba(52,211,153,0.25), 0 2px 8px rgba(0,0,0,0.3)",
        }}
        aria-label={open ? "Close edutechsrm AI chat" : "Open edutechsrm AI chat"}
      >
        {open ? <X className="h-5 w-5" /> : <Bot className="h-6 w-6" />}
        {!open && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#07090f] bg-violet-300" />}
      </button>

      {open && <div className="fixed inset-0 z-40 bg-black/35 backdrop-blur-md" />}

      {open && (
        <div
          ref={popupRef}
          className="fixed bottom-24 right-5 z-50 w-[380px] max-[420px]:right-3 max-[420px]:w-[calc(100vw-24px)] overflow-hidden rounded-[28px] border shadow-2xl"
          style={{
            background: "linear-gradient(180deg, rgba(13,17,24,0.99), rgba(8,10,16,1))",
            borderColor: "rgba(52,211,153,0.18)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(52,211,153,0.08)",
            animation: "aiPrankSlideUp 0.25s ease-out",
          }}
        >
          <style>{`
            @keyframes aiPrankSlideUp {
              from { opacity: 0; transform: translateY(16px) scale(0.96); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>

          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10">
                <Bot className="h-5 w-5 text-emerald-300" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0d1118] bg-emerald-300" />
              </div>
              <div>
                <p className="text-sm font-black text-zinc-50">edutechsrm AI</p>
                <p className="flex items-center gap-1 text-[10px] font-bold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  Preview mode
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 overflow-y-auto px-4 py-4" style={{ maxHeight: 380, minHeight: 260 }}>
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
                  style={{
                    background:
                      message.role === "user"
                        ? "linear-gradient(135deg, rgba(52,211,153,0.18), rgba(34,211,238,0.12))"
                        : "rgba(255,255,255,0.04)",
                    border:
                      message.role === "user"
                        ? "1px solid rgba(52,211,153,0.22)"
                        : "1px solid rgba(255,255,255,0.06)",
                    color: message.role === "user" ? "#e4fff5" : "#d4d4d8",
                  }}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm leading-relaxed text-zinc-300">
                  {typingText}
                  <span className="animate-pulse text-emerald-300">|</span>
                </div>
              </div>
            )}

            {showLogin && (
              <div className="flex justify-center pt-1">
                <button
                  onClick={handleLoginRedirect}
                  className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-black transition hover:scale-[1.03] active:scale-[0.97]"
                  style={{
                    background: "linear-gradient(135deg, #34d399, #00f5d4)",
                    color: "#07120d",
                    boxShadow: "0 4px 20px rgba(52,211,153,0.25)",
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Login to use AI
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-white/10 p-3">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Ask anything..."
                className="min-w-0 flex-1 bg-transparent py-1 text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || typing}
                className="flex h-8 w-8 items-center justify-center rounded-xl transition"
                style={{
                  background: input.trim() && !typing ? "linear-gradient(135deg, #34d399, #00f5d4)" : "rgba(255,255,255,0.05)",
                  color: input.trim() && !typing ? "#07120d" : "#52525b",
                  cursor: input.trim() && !typing ? "pointer" : "not-allowed",
                }}
              >
                <SendHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
