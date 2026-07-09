"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, FileText, ExternalLink, FolderOpen, Loader2, Folder } from "lucide-react"
import { getDriveEmbedUrl, isGoogleDriveFolder } from "@/lib/drive-utils"

interface DriveViewerProps {
  url: string
  title: string
  onClose: () => void
}

export function DriveViewer({ url, title, onClose }: DriveViewerProps) {
  const [loaded, setLoaded] = useState(false)
  const embedUrl = getDriveEmbedUrl(url)
  const isFolder = isGoogleDriveFolder(url)

  useEffect(() => {
    if (!embedUrl || isFolder) return
    setLoaded(false)
  }, [url, embedUrl, isFolder])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[80] flex items-start justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full sm:h-screen sm:max-w-none sm:rounded-none sm:mt-0 flex flex-col overflow-hidden bg-zinc-950 sm:border-0"
          style={{ background: "#09090b" }}
        >
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-4 py-3 shrink-0 border-b border-white/5 bg-zinc-950">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors text-zinc-400 hover:text-zinc-200"
            >
              <X size={16} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-zinc-200">{title}</p>
              <p className="text-[10px] text-zinc-500 font-medium">
                {isFolder ? "Google Drive folder" : "Google Drive file"}
              </p>
            </div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-zinc-100 transition-colors"
            >
              <ExternalLink size={13} />
              Open Drive
            </a>
          </div>

          {/* Content */}
          <div className="flex-1 relative bg-zinc-900/50">
            {isFolder ? (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="w-full max-w-sm">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl border border-amber-500/15 overflow-hidden"
                    style={{ background: "linear-gradient(145deg, rgba(251,191,36,0.04), rgba(217,119,6,0.02))" }}
                  >
                    {/* Top accent */}
                    <div className="h-1 bg-gradient-to-r from-amber-500/40 via-amber-400/30 to-amber-500/40" />

                    <div className="p-7 text-center">
                      <div className="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center bg-amber-500/10 border border-amber-500/20">
                        <Folder size={34} className="text-amber-400" />
                      </div>

                      <h3 className="text-lg font-bold text-zinc-100 mb-1.5">Folder</h3>
                      <p className="text-sm text-zinc-500 leading-relaxed max-w-[260px] mx-auto mb-6">
                        This is a Google Drive folder with multiple files. Open it in Drive to browse and download.
                      </p>

                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl text-sm font-bold transition-all bg-amber-500/10 border border-amber-500/25 text-amber-300 hover:bg-amber-500/15 hover:border-amber-500/40"
                      >
                        <FolderOpen size={16} />
                        Open in Google Drive
                      </a>
                    </div>
                  </motion.div>
                </div>
              </div>
            ) : embedUrl ? (
              <>
                {!loaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 size={24} className="text-zinc-600 animate-spin" />
                  </div>
                )}
                <iframe
                  src={embedUrl}
                  className={`w-full h-full border-0 transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"}`}
                  allow="autoplay"
                  title={title}
                  onLoad={() => setLoaded(true)}
                />
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-zinc-800 border border-zinc-700">
                  <FileText size={28} className="text-zinc-500" />
                </div>
                <div>
                  <p className="text-base font-bold text-zinc-400 mb-1">Cannot preview</p>
                  <p className="text-sm text-zinc-600 max-w-xs">
                    This file type cannot be embedded. Open it in a new tab to view.
                  </p>
                </div>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 transition-colors"
                >
                  <ExternalLink size={15} />
                  Open in new tab
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
