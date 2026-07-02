"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { Header } from "@/components/Header"
import { PublicFooter } from "@/components/public-footer"
import { BookOpen, Loader2 } from "lucide-react"

export default function DocsPage() {
  const [content, setContent] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/coderaarav12/edutechsrm-frontend-in/main/README.md")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch")
        return r.text()
      })
      .then(setContent)
      .catch(() => setError(true))
  }, [])

  return (
    <>
      <Header />
      <main className="min-h-screen pt-28 pb-16 px-4">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.2)" }}>
              <BookOpen className="w-6 h-6" style={{ color: "#22d3ee" }} />
            </div>
            <h1 className="text-3xl font-black text-zinc-100 tracking-tight font-display">Documentation</h1>
          </motion.div>

          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="text-xs text-zinc-600 font-semibold">GitHub</span>
            <span className="w-4 h-px bg-zinc-800" />
            <a
              href="https://github.com/coderaarav12/edutechsrm-frontend-in/blob/main/README.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              README.md
            </a>
            <span className="w-4 h-px bg-zinc-800" />
            <span className="text-[10px] text-zinc-700 font-mono">README</span>
          </div>

          {error ? (
            <div className="text-center py-20">
              <p className="text-sm text-zinc-500">Could not load documentation. Try again later.</p>
              <a
                href="https://github.com/coderaarav12/edutechsrm-frontend-in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                View on GitHub →
              </a>
            </div>
          ) : content ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="prose prose-invert prose-sm max-w-none"
              style={{
                color: "#a1a1aa",
                fontSize: "0.875rem",
                lineHeight: "1.75",
              }}
            >
              <style>{`
                .prose h1 { color: #f4f4f5; font-size: 1.5rem; font-weight: 900; margin-top: 2rem; margin-bottom: 0.75rem; letter-spacing: -0.02em; }
                .prose h2 { color: #e4e4e7; font-size: 1.15rem; font-weight: 800; margin-top: 2rem; margin-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.5rem; }
                .prose h3 { color: #d4d4d8; font-size: 1rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.5rem; }
                .prose p { margin-bottom: 0.75rem; }
                .prose a { color: #34d399; text-decoration: underline; text-underline-offset: 2px; }
                .prose a:hover { color: #6ee7b7; }
                .prose strong { color: #e4e4e7; font-weight: 700; }
                .prose code { background: rgba(255,255,255,0.06); padding: 0.15rem 0.4rem; border-radius: 6px; font-size: 0.8em; color: #f472b6; }
                .prose pre { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 1rem; overflow-x: auto; margin: 1rem 0; }
                .prose pre code { background: none; color: #e4e4e7; padding: 0; font-size: 0.8rem; }
                .prose ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 0.75rem; }
                .prose ol { list-style: decimal; padding-left: 1.5rem; margin-bottom: 0.75rem; }
                .prose li { margin-bottom: 0.25rem; }
                .prose hr { border-color: rgba(255,255,255,0.06); margin: 2rem 0; }
                .prose blockquote { border-left: 3px solid rgba(52,211,153,0.3); padding-left: 1rem; color: #71717a; margin: 1rem 0; }
                .prose table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.8rem; }
                .prose th { background: rgba(255,255,255,0.04); color: #d4d4d8; font-weight: 700; text-align: left; padding: 0.5rem 0.75rem; border: 1px solid rgba(255,255,255,0.06); }
                .prose td { padding: 0.5rem 0.75rem; border: 1px solid rgba(255,255,255,0.06); }
                .prose img { border-radius: 12px; margin: 1rem 0; max-width: 100%; }
                .prose .prose-no-style { all: unset; }
              `}</style>
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {content}
              </ReactMarkdown>
            </motion.div>
          ) : (
            <div className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
            </div>
          )}
        </div>
      </main>
      <PublicFooter />
    </>
  )
}
