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
      <style>{`
        /* Poster Mode Styles */
        html[data-landing-mode="poster"] .docs-main-bg {
          background-color: #f4efe6 !important;
          background-image: 
            radial-gradient(rgba(17,17,17,0.08) 1px, transparent 1px),
            linear-gradient(to right, rgba(17,17,17,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(17,17,17,0.04) 1px, transparent 1px) !important;
          background-size: 24px 24px, 48px 48px, 48px 48px !important;
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .docs-editorial-heading {
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .docs-editorial-sub {
          color: #3f3f46 !important;
        }
        html[data-landing-mode="poster"] .docs-card-wrapper {
          background: #ffffff !important;
          border: 2.5px solid #111111 !important;
          box-shadow: 8px 8px 0px #111111 !important;
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .docs-card-wrapper .prose h1,
        html[data-landing-mode="poster"] .docs-card-wrapper .prose h2,
        html[data-landing-mode="poster"] .docs-card-wrapper .prose h3,
        html[data-landing-mode="poster"] .docs-card-wrapper .prose strong {
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .docs-card-wrapper .prose p,
        html[data-landing-mode="poster"] .docs-card-wrapper .prose li {
          color: #27272a !important;
        }
        html[data-landing-mode="poster"] .docs-card-wrapper .prose pre {
          background: #faf7f2 !important;
          border: 2px solid #111111 !important;
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .docs-card-wrapper .prose pre code {
          color: #111111 !important;
        }
        html[data-landing-mode="poster"] .docs-card-wrapper .prose code {
          background: #fef08a !important;
          color: #111111 !important;
          border: 1px solid #111111 !important;
        }
      `}</style>

      <main className="docs-main-bg relative min-h-screen bg-[#070a0e] pt-28 pb-20 px-4 transition-colors duration-300 selection:bg-emerald-400 selection:text-black">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 backdrop-blur-md">
              <BookOpen className="h-3.5 w-3.5" /> 001 // SYSTEM RUNBOOK
            </span>

            <h1 className="docs-editorial-heading font-display mt-6 text-3xl sm:text-5xl font-black tracking-tight text-zinc-50 leading-[1.08]">
              Architecture, reverse-engineering, <br />
              <span className="font-serif italic font-normal text-emerald-400">and developer specifications.</span>
            </h1>

            <p className="docs-editorial-sub mt-4 max-w-xl mx-auto text-sm sm:text-base leading-relaxed text-zinc-400">
              Complete open-source technical specifications for the edutechsrm client, Academia API normalization pipelines, and edge deployment topology.
            </p>
          </motion.div>

          {/* Quick Telemetry Pill */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
            <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">Status:</span>
            <span className="px-3 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-[11px] font-mono font-bold text-emerald-400">
              ● v2.4.0 Stable
            </span>
            <span className="px-3 py-1 rounded-lg border border-white/10 bg-white/[0.04] text-[11px] font-mono text-zinc-300">
              Next.js 15 Turbopack
            </span>
            <a
              href="https://github.com/coderaarav12/edutechsrm-frontend-in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-white/15 bg-white/[0.05] text-[11px] font-mono font-bold text-zinc-200 hover:text-white transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              GitHub Repository ↗
            </a>
          </div>

          {error ? (
            <div className="text-center py-20 rounded-[28px] border border-white/10 bg-white/[0.03]">
              <p className="text-sm text-zinc-400">Could not fetch remote README. View repository directly on GitHub.</p>
              <a
                href="https://github.com/coderaarav12/edutechsrm-frontend-in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                View on GitHub →
              </a>
            </div>
          ) : content ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="docs-card-wrapper rounded-[32px] border border-white/10 bg-white/[0.035] p-6 sm:p-10 backdrop-blur-2xl shadow-[0_24px_64px_rgba(0,0,0,0.40)]"
            >
              <div
                className="prose prose-invert prose-sm max-w-none"
                style={{
                  color: "#d4d4d8",
                  fontSize: "0.9rem",
                  lineHeight: "1.8",
                }}
              >
                <style>{`
                  .prose h1 { color: #f4f4f5; font-size: 1.65rem; font-weight: 900; margin-top: 2rem; margin-bottom: 0.75rem; letter-spacing: -0.02em; }
                  .prose h2 { color: #e4e4e7; font-size: 1.25rem; font-weight: 800; margin-top: 2rem; margin-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.5rem; }
                  .prose h3 { color: #d4d4d8; font-size: 1.05rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.5rem; }
                  .prose p { margin-bottom: 0.85rem; }
                  .prose a { color: #34d399; text-decoration: underline; text-underline-offset: 2px; }
                  .prose a:hover { color: #6ee7b7; }
                  .prose strong { color: #e4e4e7; font-weight: 700; }
                  .prose code { background: rgba(255,255,255,0.08); padding: 0.15rem 0.4rem; border-radius: 6px; font-size: 0.85em; color: #34d399; }
                  .prose pre { background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 1.25rem; overflow-x: auto; margin: 1.25rem 0; }
                  .prose pre code { background: none; color: #e4e4e7; padding: 0; font-size: 0.82rem; }
                  .prose ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 0.85rem; }
                  .prose ol { list-style: decimal; padding-left: 1.5rem; margin-bottom: 0.85rem; }
                  .prose li { margin-bottom: 0.25rem; }
                  .prose hr { border-color: rgba(255,255,255,0.08); margin: 2rem 0; }
                  .prose blockquote { border-left: 3px solid rgba(52,211,153,0.4); padding-left: 1rem; color: #a1a1aa; margin: 1.25rem 0; }
                  .prose table { width: 100%; border-collapse: collapse; margin: 1.25rem 0; font-size: 0.82rem; }
                  .prose th { background: rgba(255,255,255,0.05); color: #d4d4d8; font-weight: 700; text-align: left; padding: 0.6rem 0.85rem; border: 1px solid rgba(255,255,255,0.08); }
                  .prose td { padding: 0.6rem 0.85rem; border: 1px solid rgba(255,255,255,0.08); }
                  .prose img { border-radius: 14px; margin: 1.25rem 0; max-width: 100%; }
                `}</style>
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {content}
                </ReactMarkdown>
              </div>
            </motion.div>
          ) : (
            <div className="flex justify-center py-20">
              <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
            </div>
          )}
        </div>
      </main>
      <PublicFooter />
    </>
  )
}
