"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import {
  MessageSquareText, Send, Check, Smile, Frown, Meh,
  Angry, Laugh,   Bug, Lightbulb, MessageCircle,
  User,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { AIPromoBadge } from "@/components/ai-promo-badge"

interface FeedbackEntry {
  id: number
  name: string
  rating: number
  category: string
  message: string
  email: string
  createdAt: string
}

const RATINGS = [
  { value: 1, icon: Angry, label: "Angry", color: "#f87171" },
  { value: 2, icon: Frown, label: "Frustrated", color: "#fb923c" },
  { value: 3, icon: Meh, label: "Neutral", color: "#fbbf24" },
  { value: 4, icon: Smile, label: "Happy", color: "#34d399" },
  { value: 5, icon: Laugh, label: "Love it", color: "#22d3ee" },
]

const CATEGORIES = [
  { value: "bug", label: "Bug Report", icon: Bug, color: "#f87171" },
  { value: "feature", label: "Feature Request", icon: Lightbulb, color: "#fbbf24" },
  { value: "general", label: "General Feedback", icon: MessageCircle, color: "#60a5fa" },
  { value: "other", label: "Other", icon: MessageSquareText, color: "#a78bfa" },
]

export function FeedbackSection() {
  const { user, isAuthenticated } = useAuth()
  const [rating, setRating] = useState(0)
  const [category, setCategory] = useState("general")
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState(user?.email || "")
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = useCallback(async () => {
    if (!message.trim()) return
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user?.name || "Anonymous",
          rating,
          category,
          message: message.trim(),
          email: email.trim(),
        }),
      })

      const data = await response.json() as Record<string, unknown>
      if (!response.ok) {
        setError((typeof data?.error === "string" ? data.error : null) || "Failed to submit feedback")
        return
      }

      setRating(0)
      setCategory("general")
      setMessage("")
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 2500)
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [rating, category, message, email, user])

  const categoryMeta = CATEGORIES.find(c => c.value === category)

  return (
    <div className="min-h-full pt-[3.75rem] pb-20 px-3 sm:px-4 lg:px-8 lg:pb-8 w-full">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">Send Feedback</h2>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight font-display">Feedback</h1>
          <p className="text-[11px] mt-1.5 text-zinc-500 leading-relaxed">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 align-middle mr-1.5" />
            Share your thoughts, or reach out at{' '}
            <a href="mailto:feedback@edutechsrm.in" className="text-emerald-400 hover:text-emerald-300 transition-all whitespace-nowrap">
              feedback@edutechsrm.in
            </a>
          </p>
        </div>
        <AIPromoBadge page="feedback" />
      </motion.div>

      {/* Submit form */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-zinc-900/40 ring-1 ring-white/5 rounded-2xl p-5 mb-8">

        <div className="mb-5">
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-3">How do you feel?</p>
          <div className="flex items-center gap-3">
            {RATINGS.map(r => {
              const Icon = r.icon
              const active = rating === r.value
              return (
                <button key={r.value} onClick={() => setRating(active ? 0 : r.value)}
                  disabled={isLoading}
                  className="flex flex-col items-center gap-1 group disabled:opacity-50 disabled:cursor-not-allowed">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ring-1 ${
                    active
                      ? "ring-2 scale-110"
                      : "ring-white/5 hover:ring-white/20"
                  }`}
                    style={{ background: active ? `${r.color}18` : "rgba(255,255,255,0.03)", borderColor: active ? r.color : undefined }}>
                    <Icon className="w-5 h-5" style={{ color: active ? r.color : "#71717a" }} />
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${active ? "text-zinc-300" : "text-zinc-600"}`}>
                    {active ? r.label : ""}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Category</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => {
              const Icon = c.icon
              const active = category === c.value
              return (
                <button key={c.value} onClick={() => setCategory(c.value)}
                  disabled={isLoading}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ring-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                    active ? "ring-2" : "ring-white/5 hover:ring-white/20"
                  }`}
                  style={{
                    background: active ? `${c.color}15` : "rgba(255,255,255,0.03)",
                    borderColor: active ? c.color : undefined,
                    color: active ? c.color : "#a1a1aa",
                  }}>
                  <Icon className="w-3 h-3" />
                  {c.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Message</p>
          <textarea value={message} onChange={e => setMessage(e.target.value)}
            placeholder="Tell us what's on your mind..."
            disabled={isLoading}
            rows={4}
            className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder-zinc-700 resize-none disabled:opacity-50 disabled:cursor-not-allowed" />
        </div>

        <div className="mb-5">
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">Email (optional)</p>
          <input value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={isLoading}
            className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed" />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button onClick={handleSubmit} disabled={!message.trim() || isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {submitted ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
            {isLoading ? "Sending..." : submitted ? "Sent!" : "Send Feedback"}
          </button>
          <div className="flex items-center gap-2">
            {rating > 0 && (
              <span className="text-[10px] text-zinc-600">
                {RATINGS.find(r => r.value === rating)?.label}
              </span>
            )}
            <span className="text-[9px] text-zinc-700 flex items-center gap-1">
              <User className="w-2.5 h-2.5" />
              Sent as {user?.name || "Anonymous"}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

