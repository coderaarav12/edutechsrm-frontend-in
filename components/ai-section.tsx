"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, SendHorizontal, Square, Sun, Trash2, Sunrise, BarChart3, CalendarDays, BookOpen, Mic, Volume2, StopCircle, ChevronDown } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useAuth } from "@/lib/auth-context"
import { NOTES_DATA } from "@/lib/notes-data"
import { takePendingQuery } from "@/lib/ai-shared"

type Message = {
  id?: string
  role: "user" | "assistant"
  content: string
}

const suggestions = [
  { icon: Sunrise, label: "What's my next class today?" },
  { icon: BarChart3, label: "Attendance summary" },
  { icon: CalendarDays, label: "Day order this week" },
  { icon: BookOpen, label: "Study tips for exams" },
]

const REDIRECT_TABS: { keywords: string[]; tab: TabType; label: string }[] = [
  { keywords: ["attendance", "absent", "bunk", "skip"], tab: "attendance", label: "Attendance" },
  { keywords: ["timetable", "class", "schedule", "today's class", "tomorrow", "day order"], tab: "timetable", label: "Timetable" },
  { keywords: ["mark", "score", "grade", "internal", "assessment"], tab: "marks", label: "Marks" },
  { keywords: ["calendar", "event", "holiday", "exam", "sessional", "endsem"], tab: "calendar", label: "Calendar" },
  { keywords: ["notes", "pyq", "study", "previous year", "exam prep", "revision", "practice", "question", "material", "subject", "tutorial", "reference"], tab: "notes", label: "Notes & PYQs" },
]

function getRedirects(text: string): { tab: TabType; label: string }[] {
  const lower = text.toLowerCase()
  const matched = new Set<string>()
  for (const r of REDIRECT_TABS) {
    if (r.keywords.some((k) => lower.includes(k))) matched.add(r.tab)
  }
  return REDIRECT_TABS.filter((r) => matched.has(r.tab))
}

function trimMessages(msgs: Message[], maxLen = 10): Message[] {
  const complete = msgs.filter((msg) => msg.content.trim())
  if (complete.length <= maxLen) return complete
  return complete.slice(complete.length - maxLen)
}

function createMessageId(role: Message["role"]) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${role}-${crypto.randomUUID()}`
  }
  return `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function normalizeStoredMessages(value: unknown): Message[] {
  if (!Array.isArray(value)) return []
  const normalized: Message[] = []
  for (const raw of value) {
    const role = raw?.role === "user" || raw?.role === "assistant" ? raw.role : null
    const content = typeof raw?.content === "string" ? raw.content : ""
    if (!role || !content.trim()) continue
    normalized.push({
      id: typeof raw?.id === "string" ? raw.id : createMessageId(role),
      role,
      content,
    })
  }
  return normalized
}

function getDefaultResponse(input: string): string | null {
  const text = input.toLowerCase().trim()

  // Greetings — only if it's just a greeting, nothing else
  if (/^(h+i+|hello+|hey+|hey there|hello there|sup|yo|what'?s up|whats up|wahts up)[\s!.?]*$/i.test(text.trim())) {
    return "Hey there! How can I help you with your academics today?"
  }

  // Identity
  if (/^(who are you|what are you|your name|tell me about yourself)$/.test(text)) {
    return "I'm edutechsrm's AI assistant powered by edutechsrm AI. I help SRM students with their timetable, attendance, marks, exam schedules, and study tips. What do you need help with?"
  }

  // App info
  if (/^(what is edutechsrm|what does this app do|what is this app|about edutechsrm)$/.test(text)) {
    return "edutechsrm is a student dashboard for SRM Institute. It helps you track attendance, view timetables, check marks, manage tasks, and stay on top of your academics. I'm here to help you navigate it!"
  }

  // Capabilities
  if (/^(what can you do|what can you help with|what are your features|capabilities)$/.test(text)) {
    return "I can help you with:\n- **Timetable** — your daily class schedule\n- **Attendance** — subject-wise percentages & low-attendance warnings\n- **Marks** — internal assessment scores\n- **Exams** — sessionals, endsems, and preparation tips\n- **Study tips** — time management & planning\n\nWhat would you like to check?"
  }

  // Thanks
  if (/^(thanks|thank you|thx|ty)[\s!.]*$/i.test(text)) {
    return "You're welcome! Let me know if you need anything else."
  }

  // Goodbye
  if (/^(bye|goodbye|see you|cya|gotta go)[\s!.]*$/i.test(text)) {
    return "See you later! Good luck with your studies."
  }

  return null
}

function buildContext(user: any, timetable: any[], attendance: any[], marks: any[], calendar: any[], metadata: any, courses?: any[], dateToDoMap?: Record<string, number>): string {
  const sections: string[] = []

  // Debug logging
  if (typeof window !== "undefined") {
    console.log("[AI Context]", {
      studentUsername: user?.username || "NO USER",
      timetableSlots: timetable?.length || 0,
      attendanceSubjects: attendance?.length || 0,
      marksEntries: marks?.length || 0,
      upcomingEvents: calendar?.length || 0,
      dateToDoMap: dateToDoMap ? Object.keys(dateToDoMap).length : 0,
      coursesCount: courses?.length || 0,
    })
  }

  // Student info
  const info: string[] = []
  if (user?.name) info.push(`Name: ${user.name}`)
  if (user?.username) info.push(`Registration: ${user.username}`)
  if (user?.department) info.push(`Department: ${user.department}`)
  if (user?.semester) info.push(`Semester: ${user.semester}`)
  if (metadata?.section) info.push(`Section: ${metadata.section}`)
  if (user?.batch) info.push(`Batch: ${user.batch}`)
  if (info.length) sections.push(`--- STUDENT INFO ---\n${info.join("\n")}`)

  const today = new Date()
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const todayStr = today.toISOString().slice(0, 10)
  const todayDayName = dayNames[today.getDay()]
  const todayDayOrder = metadata?.dateTodayOrder?.[todayStr] ?? null

  // Explicit today info
  const todayLine = `Today is ${todayDayName}, ${todayStr}${todayDayOrder ? ` — Day Order ${todayDayOrder} (DO${todayDayOrder})` : " — no classes today (weekend/holiday)"}`
  sections.push(`--- TODAY ---\n${todayLine}`)

  // Compute active semester date range from timetable data
  let semesterStart = ""
  let semesterEnd = ""
  if (timetable?.length) {
    const dates = timetable.map((s: any) => s.date).filter(Boolean).sort()
    if (dates.length) {
      semesterStart = dates[0]
      semesterEnd = dates[dates.length - 1]
    }
  }
  if (semesterStart && semesterEnd) {
    sections.push(`--- SEMESTER DATES ---\n  Active from: ${semesterStart}\n  Active until: ${semesterEnd}`)
  }

  // Only show today + future dates so AI never suggests a past date for next/upcoming queries
  let filteredDoMap = dateToDoMap
  if (dateToDoMap) {
    filteredDoMap = Object.fromEntries(
      Object.entries(dateToDoMap).filter(([date]) => date >= todayStr)
    )
  }

  // Attendance
  if (attendance?.length) {
    const a = attendance.map((s: any) => {
      const att = Number(s.attended ?? 0)
      const tot = Number(s.total ?? 0)
      const pct = s.percentage ?? (tot > 0 ? (att / tot) * 100 : 0)
      const canSkip = tot > 0 ? Math.floor(Math.max(0, att - 0.75 * tot) / 0.75) : 0
      const after1h = tot > 0 ? ((att / (tot + 1)) * 100).toFixed(1) : "0"
      const after2h = tot > 0 ? ((att / (tot + 2)) * 100).toFixed(1) : "0"
      const warning = pct < 75 ? " **BELOW 75%**" : ""
      return `  - ${s.code} | ${s.name || ""} | ${s.category || ""} | ${pct}% (${att}/${tot}) | can skip ${canSkip}h | after 1h miss: ${after1h}% | after 2h miss: ${after2h}%${warning}`
    })
    sections.push(`--- SUBJECT-WISE ATTENDANCE ---\n${a.join("\n")}`)
  }

  // Marks
  if (marks?.length) {
    const m = marks.map((s: any) => {
      const tests = s.tests?.length
        ? s.tests.map((t: any) => `${t.scored}/${t.max}`).join(", ")
        : `${s.total || "?"}/${s.maxTotal || "?"}`
      return `  - ${s.code || s.name}: ${tests}`
    })
    sections.push(`--- INTERNAL MARKS ---\n${m.join("\n")}`)
  }

  // Subject credits
  if (courses?.length) {
    const unique = new Map<string, any>()
    for (const c of courses) {
      if (!unique.has(c.code)) unique.set(c.code, c)
    }
    const creds = Array.from(unique.values()).map((c: any) =>
      `  - ${c.code} | ${c.name} | ${c.credits ?? "?"} credits | ${c.type || ""}`
    )
    if (creds.length) sections.push(`--- SUBJECT CREDITS ---\n${creds.join("\n")}`)
  }

  // Calendar events next 30 days
  if (calendar?.length) {
    const now = today.toISOString().slice(0, 10)
    const end = new Date(today)
    end.setDate(today.getDate() + 30)
    const endStr = end.toISOString().slice(0, 10)
    const events = calendar.filter((e: any) => e.date >= now && e.date <= endStr)
    if (events.length) {
      const ev = events.map((e: any) => `  - ${e.date}: ${e.title} (${e.type})`)
      sections.push(`--- UPCOMING EVENTS (next 30 days) ---\n${ev.join("\n")}`)
    }
  }

  // Full semester day order calendar (only dates within active semester)
  if (filteredDoMap && Object.keys(filteredDoMap).length) {
    const sorted = Object.entries(filteredDoMap).sort(([a], [b]) => a.localeCompare(b))
    const lines = sorted.map(([date, do_]) => `  - ${date}: DO${do_}`).join("\n")
    sections.push(`--- FULL SEMESTER DAY ORDER CALENDAR ---\n${lines}`)
  }

  // Planner: what classes happen on each day order
  if (timetable?.length) {
    const byDo: Record<number, any[]> = {}
    for (const s of timetable) {
      const do_ = s.day_order
      if (!do_) continue
      if (!byDo[do_]) byDo[do_] = []
      const exists = byDo[do_].some((x: any) => x.hour === s.hour && x.code === s.code)
      if (!exists) byDo[do_].push(s)
    }
    const doKeys = Object.keys(byDo).map(Number).sort((a, b) => a - b)
    const plannerLines: string[] = []
    for (const do_ of doKeys) {
      const slots = byDo[do_].sort((a: any, b: any) => a.hour - b.hour)
      const slotLines = slots.map((s: any) => {
      let dur = 1
      if (s.time) {
        const parts = s.time.split("-")
        if (parts.length === 2) {
          const start = parts[0].split(":").map(Number)
          const end = parts[1].split(":").map(Number)
          if (start.length === 2 && end.length === 2) dur = Math.max(1, Math.round(((end[0] * 60 + end[1]) - (start[0] * 60 + start[1])) / 60))
        }
      }
      return `    ${s.hour}. ${s.time} (${dur}h) | ${s.code} | ${s.name || ""} | Room: ${s.room || "—"} | ${s.type || ""}`
    })
      plannerLines.push(`  Day Order ${do_} (DO${do_}):\n${slotLines.join("\n")}`)
    }
    sections.push(`--- DAY ORDER PLANNER ---\n${plannerLines.join("\n\n")}`)
  }

  return sections.join("\n\n")
}

function AssistantMessage({ content, msgIndex, hintText, onNavigate, speakingIndex, speakMessage }: {
  content: string; msgIndex: number; hintText?: string; onNavigate?: (tab: TabType) => void; speakingIndex: number | null; speakMessage: (text: string, index: number) => void
}) {
  const redirects = getRedirects(`${content}\n${hintText || ""}`)
  const isSpeaking = speakingIndex === msgIndex
  return (
    <>
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <MarkdownContent content={content} />
        </div>
        <button
          onClick={() => speakMessage(content, msgIndex)}
          className={`shrink-0 mt-1 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
            isSpeaking ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800/50 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-700/50"
          }`}
        >
          {isSpeaking ? <StopCircle className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>
      {redirects.length > 0 && (
        <div className="mt-2.5 pt-2 border-t border-zinc-800/60 flex flex-wrap gap-1.5">
          {redirects.map((r) => (
            <button key={r.tab} onClick={() => onNavigate?.(r.tab)}
              className="text-[10px] px-2 py-1 rounded-full bg-zinc-800/80 ring-1 ring-white/5 hover:ring-violet-500/30 hover:bg-zinc-700/80 text-zinc-400 hover:text-zinc-200 transition-all"
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </>
  )
}

function MessageBody({ msg, msgIndex, hintText, onNavigate, speakingIndex, speakMessage }: {
  msg: Message; msgIndex: number; hintText?: string; onNavigate?: (tab: TabType) => void; speakingIndex: number | null; speakMessage: (text: string, index: number) => void
}) {
  if (msg.role === "assistant") {
    if (!msg.content) {
      return (
        <span className="inline-flex items-center gap-1 h-5">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "120ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "240ms" }} />
        </span>
      )
    }
    return <AssistantMessage content={msg.content} msgIndex={msgIndex} hintText={hintText} onNavigate={onNavigate} speakingIndex={speakingIndex} speakMessage={speakMessage} />
  }
  return <>{msg.content}</>
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const isInline = !className
          if (isInline) {
            return <code className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-200 text-xs" {...props}>{children}</code>
          }
          return (
            <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-3 my-2 text-xs leading-relaxed">
              <code className={className} {...props}>{children}</code>
            </pre>
          )
        },
        a({ href, children }) {
          return <a href={href} target="_blank" rel="noopener noreferrer" className="text-violet-400 underline underline-offset-2">{children}</a>
        },
        ul({ children }) {
          return <ul className="list-disc list-inside space-y-1 my-1">{children}</ul>
        },
        ol({ children }) {
          return <ol className="list-decimal list-inside space-y-1 my-1">{children}</ol>
        },
        strong({ children }) {
          return <strong className="font-semibold text-zinc-100">{children}</strong>
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

type TabType = "dashboard" | "timetable" | "attendance" | "courses" | "marks" | "calendar" | "gradex" | "about" | "planner" | "notes" | "updates" | "feedback" | "settings" | "ai"

export function AiSection({ onNavigate, minimised, isActive }: { onNavigate?: (tab: TabType) => void; minimised?: boolean; isActive?: boolean }) {
  const { user, timetable, attendance, marks, calendar, timetableMetadata, isBackgroundSyncing, refreshData, courses, dateToDoMap } = useAuth() as any
  const STORAGE_KEY = "ai_chat_messages"
  const LIMIT_KEY = "ai_daily_limit"
  const DAILY_LIMIT = 15
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return []
      const parsed = JSON.parse(saved)
      return Array.isArray(parsed) ? parsed.filter((msg: Message) => msg.content.trim()) : []
    } catch { return [] }
  })
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [dailyCount, setDailyCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(LIMIT_KEY)
      if (!saved) return 0
      const parsed = JSON.parse(saved)
      const today = new Date().toISOString().slice(0, 10)
      return parsed.date === today ? parsed.count : 0
    } catch { return 0 }
  })
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesRef = useRef<Message[]>([])
  useEffect(() => { messagesRef.current = messages }, [messages])
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showScrollDown, setShowScrollDown] = useState(false)
  const initialLoadDone = useRef(false)
  useEffect(() => { const t = setTimeout(() => { initialLoadDone.current = true }, 200); return () => clearTimeout(t) }, [])
  const spacerRef = useRef<HTMLDivElement>(null)
  const [stickToBottom, setStickToBottom] = useState(false)
  useEffect(() => {
    const spacer = spacerRef.current
    if (!spacer) return
    const observer = new IntersectionObserver(([entry]) => setStickToBottom(entry.isIntersecting), { rootMargin: "-1px 0px 0px 0px" })
    observer.observe(spacer)
    return () => observer.disconnect()
  }, [])
  const streamTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const userScrolledUpRef = useRef(false)
  const abortRef = useRef<AbortController | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)
  const [voiceStatus, setVoiceStatus] = useState<string | null>(null)
  const [voiceSupported] = useState(() => !!(typeof window !== "undefined" && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)))
  const isSyncReady = Boolean(!isBackgroundSyncing && user?.name)
  const [pendingDashboardQuery, setPendingDashboardQuery] = useState<string | null>(null)
  const [autoSend, setAutoSend] = useState(false)

  useEffect(() => {
    if ((isStreaming || initialLoadDone.current) && !userScrolledUpRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" })
    }
  }, [messages])

  useEffect(() => {
    if (isActive) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" })
    }
  }, [isActive])

  useEffect(() => {
    sessionStorage.removeItem("ai_context")
  }, [])

  // Check for pending query sent from dashboard (AiQuickInput)
  useEffect(() => {
    if (!isActive) return
    const pendingFromDashboard = takePendingQuery()
    if (pendingFromDashboard) {
      console.log("[AI] detected pending query from dashboard:", pendingFromDashboard)
      setPendingDashboardQuery(pendingFromDashboard)
    }
  }, [isActive])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    console.log("[AI] handleSend called", { text, isStreaming, dailyCount })
    if (!text || isStreaming) {
      console.log("[AI] handleSend early return:", { reason: isStreaming ? 'isStreaming' : 'noText' })
      return
    }
    if (dailyCount >= DAILY_LIMIT) return
    
    setInput("")
    if (inputRef.current) inputRef.current.style.height = "auto"
    sendQuery(text, messagesRef.current)
  }, [input, isStreaming, dailyCount])

  // Set input + auto-send flag when dashboard query arrives
  useEffect(() => {
    if (!isActive || !isSyncReady || !pendingDashboardQuery) return
    const text = pendingDashboardQuery.trim()
    if (!text) { setPendingDashboardQuery(null); return }
    setPendingDashboardQuery(null)
    setInput(text)
    setAutoSend(true)
  }, [isActive, isSyncReady, pendingDashboardQuery])

  // Auto-trigger handleSend once input is set from dashboard handoff
  useEffect(() => {
    if (autoSend && input.trim()) {
      setAutoSend(false)
      handleSend()
    }
  }, [input, autoSend, handleSend])

  // Handle welcome message once user data is synced and no dashboard query is waiting.
  useEffect(() => {
    if (!isActive || !isSyncReady || pendingDashboardQuery || isStreaming) return
    const wasWelcomeShown = sessionStorage.getItem("ai_welcome_shown")
    if (messages.length === 0 && !wasWelcomeShown) {
      setMessages([{ role: "assistant", content: `Hi ${user.name}, how may I help you today?` }])
      sessionStorage.setItem("ai_welcome_shown", "true")
    }
  }, [isActive, isSyncReady, pendingDashboardQuery, isStreaming, messages.length, user?.name])

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)) } catch {}
  }, [messages])

  const incrementDaily = useCallback(() => {
    setDailyCount((prev) => {
      const next = prev + 1
      try {
        localStorage.setItem(LIMIT_KEY, JSON.stringify({ date: new Date().toISOString().slice(0, 10), count: next }))
      } catch {}
      return next
    })
  }, [])

  const autoResize = useCallback(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 128) + "px"
  }, [])

  const handleStop = useCallback(() => {
    clearInterval(streamTimer.current)
    abortRef.current?.abort()
    abortRef.current = null
    setIsStreaming(false)
  }, [])

  const toggleMic = useCallback(async () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setVoiceStatus("Voice not available on this browser")
      setTimeout(() => setVoiceStatus(null), 3000)
      return
    }

    const currentMessages = messagesRef.current
    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = true
    recognition.continuous = false
    recognitionRef.current = recognition
    let finalTranscript = ""
    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) finalTranscript += t
      }
      const interim = Array.from(event.results)
        .filter((r: any) => !r.isFinal)
        .map((r: any) => r[0].transcript)
        .join("")
      setInput(finalTranscript + interim)
    }
    const cleanup = () => {
      setIsListening(false)
    }
    recognition.onend = () => {
      cleanup()
      if (finalTranscript.trim()) {
        setInput("")
        if (inputRef.current) inputRef.current.style.height = "auto"
        sendQuery(finalTranscript, currentMessages)
      }
    }
    recognition.onerror = (e: any) => {
      console.warn("[ai-section] Speech recognition error:", e.error || e)
      if (e.error === "not-allowed" || e.error === "permission-denied") {
        setVoiceStatus("Microphone access denied")
        setTimeout(() => setVoiceStatus(null), 3000)
      }
      cleanup()
    }
    try {
      recognition.start()
    } catch (e: any) {
      console.warn("[ai-section] Speech recognition start failed:", e)
      setVoiceStatus("Voice input failed to start")
      setTimeout(() => setVoiceStatus(null), 3000)
      cleanup()
      return
    }
    setIsListening(true)
    setInput("")
  }, [isListening])

  const VOICE_KEY = "ai_voice_uri"
  const TONE_KEY = "ai_voice_tone"
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceUri, setVoiceUri] = useState<string | null>(() => {
    try { return localStorage.getItem(VOICE_KEY) } catch { return null }
  })
  const [showVoicePicker, setShowVoicePicker] = useState(false)

  const tonePresets = [
    { id: "normal", label: "Normal", rate: 1, pitch: 1 },
    { id: "deep", label: "Deep", rate: 0.85, pitch: 0.7 },
    { id: "soft", label: "Soft", rate: 0.9, pitch: 1.3 },
    { id: "fast", label: "Fast", rate: 1.35, pitch: 1 },
    { id: "warm", label: "Warm", rate: 0.95, pitch: 1.15 },
  ]
  const [toneId, setToneId] = useState<string>(() => {
    try { return localStorage.getItem(TONE_KEY) || "normal" } catch { return "normal" }
  })

  useEffect(() => {
    const synth = window.speechSynthesis
    if (!synth) return
    const update = () => {
      const all = synth.getVoices()
      setVoices(all)
      if (!voiceUri && all.length > 0) {
        const def = all.find((v) => /(Google UK English Female|Microsoft Zira|Samantha)/.test(v.name)) || all.find((v) => v.lang.startsWith("en")) || all[0]
        setVoiceUri(def.voiceURI)
        try { localStorage.setItem(VOICE_KEY, def.voiceURI) } catch {}
      }
    }
    update()
    synth.onvoiceschanged = update
    // Warm up TTS engine (required on Android WebView)
    const warmup = () => {
      const u = new SpeechSynthesisUtterance("")
      u.volume = 0
      synth.speak(u)
      synth.cancel()
    }
    warmup()
    document.addEventListener("click", warmup, { once: true })
    return () => {
      synth.onvoiceschanged = null
      document.removeEventListener("click", warmup)
    }
  }, [])

  const speakMessage = useCallback((text: string, index: number) => {
    const synth = window.speechSynthesis
    if (!synth) return
    if (speakingIndex === index) {
      synth.cancel()
      setSpeakingIndex(null)
      return
    }
    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(text.replace(/[#*`~\[\]]/g, ""))
    const match = voices.find((v) => v.voiceURI === voiceUri)
    if (match) utterance.voice = match
    const tone = tonePresets.find((t) => t.id === toneId) || tonePresets[0]
    utterance.rate = tone.rate
    utterance.pitch = tone.pitch
    utterance.onend = () => setSpeakingIndex(null)
    utterance.onerror = () => setSpeakingIndex(null)
    synthRef.current = utterance
    synth.speak(utterance)
    setSpeakingIndex(index)
  }, [speakingIndex, voiceUri, voices, toneId])

  async function sendQuery(text: string, existingMessages: Message[]) {
    clearInterval(streamTimer.current)
    const userMsg: Message = { id: createMessageId("user"), role: "user", content: text }
    const assistantId = createMessageId("assistant")
    const aid: Message = { id: assistantId, role: "assistant", content: "" }
    const updatedMessages = [...existingMessages, userMsg]
    const messagesWithPlaceholder = [...updatedMessages, aid]
    setMessages(messagesWithPlaceholder)
    messagesRef.current = messagesWithPlaceholder

    const updateAssistant = (content: string) => {
      setMessages((prev) => {
        const copy = prev.map((msg) => msg.id === assistantId ? { ...msg, content } : msg)
        messagesRef.current = copy
        return copy
      })
    }

    const local = getDefaultResponse(text)
    if (local) {
      setIsStreaming(true)
      updateAssistant(local)
      setIsStreaming(false)
      return
    }

    setIsStreaming(true)
    incrementDaily()

    const context = buildContext(user, timetable, attendance, marks, calendar, timetableMetadata, courses, dateToDoMap)

    // Find current semester subjects for Notes & PYQs
    const semSubjects = NOTES_DATA.find(s => s.semester === Number(user?.semester))?.subjects || []
    const subjectList = semSubjects.map(s => `  - ${s.name}`).join("\n")
    const notesHint = semSubjects.length
      ? `\n\nFor study/exam prep questions: mention you can check "Notes & PYQs" section for Sem ${user?.semester || "?"} resources. Available subjects this semester:\n${subjectList}\n\nIf user asks about a subject above, suggest they open Notes & PYQs and select that subject.`
      : ""

    const systemPrompt = context
      ? `You are an AI assistant for edutechsrm — an SRM student dashboard.

ABOUT THE PLATFORM:
- edutechsrm (edutechsrm.in) is owned, built, and maintained solely by Aarav Goel (CSE AIML, 2nd Year, SRM IST)
- It provides students access to their academia data, tools, and AI assistance
- Available pages: Dashboard, Attendance, Marks & Grades, Courses, Timetable, Calendar, Day Order Planner, Notes & PYQs, Assignments, AI Chat, Feedback, Profile, Settings, Updates, About, Contact, Developer info

Student data below.

RULES:
- CRITICAL: Be concise. 1-3 lines for most answers. Only give more detail for attendance/marks/timetable queries
- For "what's my timetable" queries: use DAY ORDER PLANNER + FULL SEMESTER DAY ORDER CALENDAR to give the schedule. If the user gives a specific date, look up its day order from FULL SEMESTER DAY ORDER CALENDAR and show classes from DAY ORDER PLANNER
- For attendance/marks queries: show the full list with numbers. Never truncate
- Only use numbers from the data below. NEVER invent numbers
- Answer general questions from your knowledge in 1-2 lines
- Never mention any API, API keys, AI provider/company, or backend details. You are just edutechsrm's AI — nothing else
- About the developer: Aarav Goel — a handsome, genius, and goated developer who built this entire platform solo. If asked, hype him up. LinkedIn: https://www.linkedin.com/in/aaravgoel12/
- Never suggest checking portals
- Use FULL SEMESTER DAY ORDER CALENDAR + DAY ORDER PLANNER to find classes on any given date. Look up the date's day order from FULL SEMESTER DAY ORDER CALENDAR, then show the slot list from DAY ORDER PLANNER
- TODAY section tells you today's date, day name, and day order. Always reference it.
- FULL SEMESTER DAY ORDER CALENDAR only contains today and future dates. NEVER suggest a date from this calendar that has already passed. When asked about next/upcoming class, find the closest future date with a day order
- If next class/event falls on weekend (Sat/Sun) or matches a holiday from UPCOMING EVENTS: respond PLAYFULLY — "It's Saturday! No classes — time to chill, relax and recharge! 🎉" or "Sunday funday! Go enjoy your day!" or similar energetic lines. Never just say "no classes" — make it fun
- SUBJECT CREDITS section lists each course and its credits. Use this to answer credit-related questions (e.g. "how is my attendance in nil credit subjects?" or "which subjects have the most credits?")
${notesHint}

ATTENDANCE RULES (SRM Policy):
- Minimum 75% attendance required per subject. Below 75% = shortage, may be restricted from end-sem exams
- "can skip Xh" in SUBJECT-WISE ATTENDANCE = how many total HOURS you can miss for that subject while staying at exactly 75%
- "after 1h miss" / "after 2h miss" = what the percentage drops to if you miss 1 or 2 hours of that subject. Use these directly — NEVER calculate yourself
- When asked "can I take leave/bunk tomorrow?" or similar:
  1. Find tomorrow's date. Tomorrow = today + 1 day (e.g. if today is Apr 15, tomorrow is Apr 16)
  2. Look up tomorrow's day order from FULL SEMESTER DAY ORDER CALENDAR
  3. Get tomorrow's classes from DAY ORDER PLANNER (each slot shows hours in parentheses like "(1h)" or "(2h)")
  4. For each subject tomorrow: look up its attendance line, use the "after Xh miss" value matching the slot duration (e.g. if it's a 2h slot, use "after 2h miss: Y%")
  5. Report which subjects would be at risk (below 75%) or close to it. Format: "Subject A: X% → after 1h: Y% OK | Subject B: X% → after 2h: Z% ⚠️ At Risk!"
- For "how many more days can I bunk?": each day has multiple subjects. The limiting factor is whichever subject would first drop below 75%
- When asked generally about attendance status, show the full list
- For "can I skip today's classes": use today's day order and today's classes from DAY ORDER PLANNER

${notesHint}

For bunking: show ONLY subjects at risk (below 75% or would drop below). Format: "Subject — X%, 1 bunk → Y%"\n\n${context}`
      : undefined

    console.log("[AI] sendQuery making fetch call with messages:", updatedMessages.length)
    try {
      abortRef.current = new AbortController()
      // Use server-side proxy so this works reliably in production (no client env/CORS issues)
      const authToken = localStorage.getItem("srm_token") || ""
      const res = await fetch(`/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": authToken,
        },
        body: JSON.stringify({
          messages: trimMessages(updatedMessages),
          system_prompt: systemPrompt,
          max_tokens: 600,
          temperature: 0.3,
        }),
        signal: abortRef.current.signal,
      })
      abortRef.current = null

      if (!res.ok) {
        const errData: any = await res.json().catch(() => null)
        const errMsg = errData?.error || `Error ${res.status}`
        if (res.status === 401) {
          updateAssistant("Please log in to use the AI assistant.")
        } else if (res.status === 429) {
          updateAssistant("You've reached the daily AI limit. Try again tomorrow.")
          setDailyCount(DAILY_LIMIT)
        } else {
          updateAssistant(`Sorry, I couldn't process that. ${errMsg}`)
        }
        setIsStreaming(false)
        return
      }

      const data = await res.json() as { message?: { content?: string } }
      const fullText = data?.message?.content || "I'm not sure how to respond to that."
      updateAssistant(fullText)
      setIsStreaming(false)
    } catch (err) {
      abortRef.current = null
      if (err instanceof DOMException && err.name === "AbortError") {
        updateAssistant("Request stopped. Send it again when you're ready.")
        setIsStreaming(false)
        return
      }
      updateAssistant("Sorry, I couldn't reach the AI backend. Make sure it's running.")
      setIsStreaming(false)
    }
  }

  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (el && el.clientHeight < el.scrollHeight) {
      const scrolledUp = el.scrollHeight - el.scrollTop - el.clientHeight > 150
      setShowScrollDown(scrolledUp)
      userScrolledUpRef.current = scrolledUp
      return
    }
    const scrolledUp = document.documentElement.scrollHeight - window.scrollY - window.innerHeight > 200
    setShowScrollDown(scrolledUp)
    userScrolledUpRef.current = scrolledUp
  }, [])

  useEffect(() => {
    window.addEventListener("scroll", checkScroll, { passive: true })
    const el = scrollContainerRef.current
    if (el) el.addEventListener("scroll", checkScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", checkScroll)
      scrollContainerRef.current?.removeEventListener("scroll", checkScroll)
    }
  }, [checkScroll])

  const scrollToBottom = useCallback(() => {
    const el = scrollContainerRef.current
    if (el && el.clientHeight < el.scrollHeight) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" })
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const clearChat = () => {
    setMessages([])
    setInput("")
    setIsStreaming(false)
    clearInterval(streamTimer.current)
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }

  const messageList = (
    <div ref={scrollContainerRef} onScroll={checkScroll} className="flex-1 min-h-0 overflow-y-auto px-3 md:px-6 py-4 space-y-5 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <AnimatePresence initial={false}>
        {messages.map((msg, i) => {
          const hintText = i > 0 && messages[i - 1]?.role === "user" ? messages[i - 1].content : ""
          return (
          <motion.div
            key={msg.id || `${msg.role}-${i}-${msg.content.slice(0, 24)}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-7 h-7 mt-0.5 rounded-xl flex items-center justify-center shrink-0 ${
                msg.role === "assistant"
                  ? "bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 ring-1 ring-violet-500/20"
                  : "bg-zinc-800 ring-1 ring-white/10"
              }`}
            >
              {msg.role === "assistant" ? <Bot className="w-3.5 h-3.5 text-violet-400" /> : <Sun className="w-3.5 h-3.5 text-zinc-400" />}
            </div>
            <div
              className={`px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                    ? "bg-violet-500/10 text-zinc-200 rounded-2xl rounded-tr-md max-w-[82%] md:max-w-[68%] lg:max-w-[55%]"
                    : "text-zinc-300 max-w-[90%] md:max-w-[75%] lg:max-w-[65%] prose prose-invert prose-sm max-w-none"
              }`}
            >
              <MessageBody msg={msg} msgIndex={i} hintText={hintText} onNavigate={onNavigate} speakingIndex={speakingIndex} speakMessage={speakMessage} />
            </div>
          </motion.div>
          )
        })}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  )

    return (
    <>
      <div className="min-h-full pt-[3.75rem] px-3 sm:px-4 lg:px-8 pb-28 lg:pb-8 w-full flex flex-col relative">
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">AI Assistant</p>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight font-display">AI Chat</h1>
        </div>
        <div className="flex items-start gap-2">
          <div className="relative">
            <button onClick={() => setShowVoicePicker((v) => !v)}
              className="flex items-center gap-1.5 text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-900/60"
            >
              <Volume2 className="w-3 h-3" />
              <span>{tonePresets.find((t) => t.id === toneId)?.label || "Normal"}</span>
            </button>
            {showVoicePicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowVoicePicker(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-xl bg-zinc-900 border border-white/10 shadow-2xl backdrop-blur-xl p-1">
                  {tonePresets.map((t) => (
                    <button key={t.id} onClick={() => { setToneId(t.id); try { localStorage.setItem(TONE_KEY, t.id) } catch {}; setShowVoicePicker(false) }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${t.id === toneId ? "bg-violet-500/15 text-violet-300" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          {messages.length > 0 && (
            <button onClick={clearChat}
              className="flex items-center gap-1.5 text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-900/60"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 md:gap-8 px-4 pb-4">
          <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 ring-1 ring-violet-500/20 lg:w-24 lg:h-24 lg:rounded-3xl">
            <Bot className="w-7 h-7 md:w-9 md:h-9 lg:w-11 lg:h-11 text-violet-400" />
          </div>
          <div className="text-center max-w-sm md:max-w-md lg:max-w-lg">
            <h2 className="text-lg md:text-2xl font-bold text-zinc-100 mb-1.5">Hi, I'm your AI assistant</h2>
            <p className="text-xs md:text-sm lg:text-base text-zinc-500 leading-relaxed">Ask me anything about your timetable, attendance, marks, or get study tips and academic help.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 w-full max-w-lg lg:max-w-2xl">
            {suggestions.map((s) => (
              <motion.button
                key={s.label}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setInput(s.label); inputRef.current?.focus() }}
                className="flex items-center gap-2.5 px-3.5 py-2.5 md:px-5 md:py-3.5 rounded-xl bg-zinc-900/60 ring-1 ring-white/5 hover:ring-violet-500/30 hover:bg-zinc-900/80 transition-all text-left"
              >
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg flex items-center justify-center bg-violet-500/10 shrink-0">
                  <s.icon className="w-3.5 h-3.5 md:w-5 md:h-5 text-violet-400" />
                </div>
                <span className="text-[11px] md:text-sm font-medium text-zinc-300">{s.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      ) : messageList}

      {/* Desktop: normal-flow input */}
      <div className="hidden lg:block max-w-2xl mx-auto w-full pb-3 md:pb-4 pt-2">
        <div className="flex justify-center mb-2">
          <div className="px-2.5 py-0.5 rounded-full bg-zinc-900/80 ring-1 ring-white/5">
            {dailyCount >= DAILY_LIMIT ? (
              <p className="text-[10px] text-amber-500 whitespace-nowrap">Daily limit reached. Try again tomorrow.</p>
            ) : (
              <p className="text-[10px] text-zinc-500 whitespace-nowrap">{DAILY_LIMIT - dailyCount} of {DAILY_LIMIT} messages remaining today</p>
            )}
          </div>
        </div>
        {voiceStatus && (
          <div className="text-xs text-red-400/70 text-center py-1">{voiceStatus}</div>
        )}
        <div className="flex items-center gap-2 p-1.5 md:p-2 rounded-2xl bg-zinc-900/80 ring-1 ring-white/5 focus-within:ring-violet-500/30 transition-all">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => { setInput(e.target.value); autoResize() }}
              onKeyDown={handleKeyDown}
              placeholder={isSyncReady ? "Ask me anything..." : "Syncing your data..."}
              rows={1}
              disabled={!isSyncReady}
              className="w-full bg-transparent text-sm text-zinc-200 placeholder-zinc-600 resize-none outline-none px-3 py-2 max-h-32 leading-relaxed [scrollbar-width:none] disabled:opacity-40"
              style={{ visibility: isListening ? "hidden" : "visible" }}
            />
            {isListening && (
              <div className="absolute inset-0 flex items-center px-3 py-2 bg-zinc-900/60 backdrop-blur-sm rounded-xl pointer-events-none z-10">
                <span className="text-sm text-emerald-400/80 animate-pulse font-medium tracking-wide">Listening...</span>
              </div>
            )}
          </div>
          {!isSyncReady && (
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            </div>
          )}
          {isSyncReady && (
            <>{voiceSupported && <motion.button whileTap={{ scale: 0.9 }} onClick={toggleMic} disabled={isStreaming || dailyCount >= DAILY_LIMIT} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${isListening ? "bg-red-500/20 text-red-400" : "bg-zinc-800/50 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/50"}`}>{isListening ? <StopCircle className="w-4 h-4" /> : <Mic className="w-4 h-4" />}</motion.button>}
            {isStreaming ? (
              <motion.button whileTap={{ scale: 0.9 }} onClick={handleStop} className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-all shrink-0"><Square className="w-4 h-4" /></motion.button>
            ) : (
              <motion.button whileTap={{ scale: 0.9 }} onClick={handleSend} disabled={!input.trim() || dailyCount >= DAILY_LIMIT} className="w-9 h-9 rounded-xl flex items-center justify-center bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"><SendHorizontal className="w-4 h-4" /></motion.button>
            )}</>
          )}
        </div>
      </div>
      {/* Spacer for mobile floating input */}
      <div ref={spacerRef} style={{ height: "90px" }} className="lg:hidden" />

      {/* Mobile: floating input — fixed when scrolling, absolute when at bottom of content */}
      <motion.div
        className={`left-0 right-0 z-40 pointer-events-none lg:hidden ${stickToBottom ? 'absolute bottom-0' : 'fixed'}`}
        style={!stickToBottom ? { bottom: "calc(env(safe-area-inset-bottom) + max(14px, 2vw) + 84px)" } : {}}
        animate={!stickToBottom && minimised ? { y: 100 } : { y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}>
        <div className="max-w-2xl mx-auto w-full px-3 md:px-6 pointer-events-auto pb-4">
          <div className="flex justify-center mb-1.5">
            <div className="px-2.5 py-0.5 rounded-full bg-zinc-900/80 ring-1 ring-white/5">
              {dailyCount >= DAILY_LIMIT ? (
                <p className="text-[10px] text-amber-500 whitespace-nowrap">Daily limit reached. Try again tomorrow.</p>
              ) : (
                <p className="text-[10px] text-zinc-500 whitespace-nowrap">{DAILY_LIMIT - dailyCount} of {DAILY_LIMIT} messages remaining today</p>
              )}
          </div>
        </div>
        {voiceStatus && (
          <div className="text-xs text-red-400/70 text-center py-1">{voiceStatus}</div>
        )}
        <div className="flex items-center gap-2 p-1.5 md:p-2 rounded-2xl bg-zinc-900/90 ring-1 ring-white/10 focus-within:ring-violet-500/30 transition-all backdrop-blur-xl shadow-2xl">
          <div className="flex-1 relative">
            <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); autoResize() }}
                onKeyDown={handleKeyDown}
                placeholder={isSyncReady ? "Ask me anything..." : "Syncing your data..."}
                rows={1}
                disabled={!isSyncReady}
                className="w-full bg-transparent text-sm text-zinc-200 placeholder-zinc-600 resize-none outline-none px-3 py-2 max-h-32 leading-relaxed [scrollbar-width:none] disabled:opacity-40"
                style={{ visibility: isListening ? "hidden" : "visible" }}
              />
              {isListening && (
                <div className="absolute inset-0 flex items-center px-3 py-2 bg-zinc-900/60 backdrop-blur-sm rounded-xl pointer-events-none z-10">
                  <span className="text-sm text-emerald-400/80 animate-pulse font-medium tracking-wide">Listening...</span>
                </div>
              )}
            </div>
            {!isSyncReady && (
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              </div>
            )}
            {isSyncReady && (
              <>{voiceSupported && <motion.button whileTap={{ scale: 0.9 }} onClick={toggleMic} disabled={isStreaming || dailyCount >= DAILY_LIMIT} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${isListening ? "bg-red-500/20 text-red-400" : "bg-zinc-800/50 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/50"}`}>{isListening ? <StopCircle className="w-4 h-4" /> : <Mic className="w-4 h-4" />}</motion.button>}
              {isStreaming ? (
              <motion.button whileTap={{ scale: 0.9 }} onClick={handleStop} className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-all shrink-0"><Square className="w-4 h-4" /></motion.button>
            ) : (
              <motion.button whileTap={{ scale: 0.9 }} onClick={handleSend} disabled={!input.trim() || dailyCount >= DAILY_LIMIT} className="w-9 h-9 rounded-xl flex items-center justify-center bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"><SendHorizontal className="w-4 h-4" /></motion.button>
            )}</>
            )}
          </div>
        </div>
      </motion.div>
    </div>

    {/* Scroll-to-bottom button */}
    {messages.length > 0 && showScrollDown && (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={scrollToBottom}
        className="fixed left-1/2 -translate-x-1/2 z-[45] w-9 h-9 rounded-full bg-zinc-900/90 ring-1 ring-white/10 backdrop-blur-xl shadow-2xl flex items-center justify-center cursor-pointer"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + max(14px, 2vw) + 84px + 120px)" }}
      >
        <ChevronDown className="w-4 h-4 text-zinc-400" />
      </motion.button>
    )}
    </>
  )
}
