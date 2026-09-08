"use client"

import { AnimatePresence, motion } from "framer-motion"
import { LogOut, ShieldAlert, X } from "lucide-react"
import { useTheme } from "@/lib/theme-context"

interface SignOutModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function SignOutModal({ isOpen, onClose, onConfirm }: SignOutModalProps) {
  const { theme } = useTheme()
  const isPoster = theme?.mode === "poster"

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[320] p-4 flex items-center justify-center"
          style={{
            background: isPoster
              ? "rgba(17,17,17,0.4)"
              : "radial-gradient(circle at 18% 14%, rgba(248,113,113,0.16), transparent 24%), radial-gradient(circle at 78% 10%, rgba(244,114,182,0.15), transparent 28%), rgba(7,7,10,0.84)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md rounded-[28px] overflow-hidden ${
              isPoster
                ? "bg-white border-2 border-[#111111] shadow-[6px_6px_0px_#111111]"
                : "border border-red-500/20 shadow-2xl"
            }`}
            style={
              isPoster
                ? {}
                : {
                    background: "linear-gradient(145deg, rgba(25,10,14,0.96), rgba(18,11,16,0.92))",
                    boxShadow: "0 26px 80px rgba(0,0,0,0.55)",
                  }
            }
          >
            <div className="relative px-6 pt-6 pb-4">
              <button
                onClick={onClose}
                className={`absolute right-4 top-4 w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isPoster
                    ? "bg-white border-2 border-[#111111] text-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-zinc-100"
                    : "border border-white/10 text-zinc-400 bg-white/[0.02] hover:text-white"
                }`}
                aria-label="Close"
              >
                <X style={{ width: 14, height: 14 }} />
              </button>

              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.14em] ${
                  isPoster
                    ? "bg-[#fee2e2] border-2 border-[#111111] text-[#991b1b] shadow-[1.5px_1.5px_0px_#111111]"
                    : "border border-red-500/30 text-red-300 bg-red-500/10"
                }`}
              >
                Session Action
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    isPoster
                      ? "bg-[#fecdd3] border-2 border-[#111111] shadow-[3px_3px_0px_#111111]"
                      : "border border-red-500/30 shadow-md shadow-red-500/10"
                  }`}
                  style={
                    isPoster
                      ? {}
                      : {
                          background: "linear-gradient(135deg, rgba(248,113,113,0.34), rgba(244,114,182,0.2))",
                        }
                  }
                >
                  <LogOut style={{ width: 20, height: 20, color: isPoster ? "#9f1239" : "#fda4af" }} />
                </div>
                <div>
                  <h3
                    className={`text-xl font-black tracking-tight ${
                      isPoster ? "text-[#111111]" : "text-zinc-100"
                    }`}
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Sign out now?
                  </h3>
                  <p className={`text-xs mt-1 ${isPoster ? "text-[#555555]" : "text-zinc-400"}`}>
                    You can sign in again anytime with your SRM account.
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`mx-6 mb-5 rounded-2xl p-3 flex items-start gap-2.5 ${
                isPoster
                  ? "bg-[#f7f5f0] border-2 border-[#111111] shadow-[2px_2px_0px_#111111]"
                  : "border border-pink-500/20 bg-pink-500/5"
              }`}
            >
              <ShieldAlert
                style={{
                  width: 15,
                  height: 15,
                  color: isPoster ? "#e11d48" : "#fda4af",
                  marginTop: 1,
                  flexShrink: 0,
                }}
              />
              <p className={`text-xs leading-relaxed ${isPoster ? "text-[#222222]" : "text-zinc-300"}`}>
                This will end your current session on this device and clear local session state.
              </p>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={onClose}
                className={`flex-1 h-11 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  isPoster
                    ? "bg-white border-2 border-[#111111] text-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-zinc-100"
                    : "border border-white/10 text-zinc-400 bg-white/[0.03] hover:text-white"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 h-11 rounded-xl text-sm font-black transition-all cursor-pointer ${
                  isPoster
                    ? "bg-[#e11d48] text-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] hover:bg-[#be123c]"
                    : "text-zinc-950 bg-gradient-to-r from-rose-400 to-pink-400 shadow-lg shadow-pink-500/20"
                }`}
              >
                Sign Out
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
