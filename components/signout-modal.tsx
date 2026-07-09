"use client"

import { AnimatePresence, motion } from "framer-motion"
import { LogOut, ShieldAlert, X } from "lucide-react"

interface SignOutModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function SignOutModal({ isOpen, onClose, onConfirm }: SignOutModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[320] p-4 flex items-center justify-center"
          style={{
            background:
              "radial-gradient(circle at 18% 14%, rgba(248,113,113,0.16), transparent 24%), radial-gradient(circle at 78% 10%, rgba(244,114,182,0.15), transparent 28%), rgba(7,7,10,0.84)",
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
            className="w-full max-w-md rounded-[28px] border overflow-hidden"
            style={{
              borderColor: "rgba(248,113,113,0.22)",
              background:
                "linear-gradient(145deg, rgba(25,10,14,0.96), rgba(18,11,16,0.92))",
              boxShadow: "0 26px 80px rgba(0,0,0,0.55)",
            }}
          >
            <div className="relative px-6 pt-6 pb-4">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 w-8 h-8 rounded-lg border flex items-center justify-center transition-colors"
                style={{ borderColor: "rgba(255,255,255,0.08)", color: "#a1a1aa", background: "rgba(255,255,255,0.02)" }}
                aria-label="Close"
              >
                <X style={{ width: 14, height: 14 }} />
              </button>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{ color: "#fda4af", borderColor: "rgba(248,113,113,0.28)", background: "rgba(248,113,113,0.08)" }}>
                Session Action
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(248,113,113,0.34), rgba(244,114,182,0.2))",
                    border: "1px solid rgba(248,113,113,0.3)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 8px 20px rgba(248,113,113,0.22)",
                  }}
                >
                  <LogOut style={{ width: 20, height: 20, color: "#fda4af" }} />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight" style={{ color: "#f4f4f5", fontFamily: "'Space Grotesk', sans-serif" }}>Sign out now?</h3>
                  <p className="text-xs mt-1" style={{ color: "#a1a1aa" }}>You can sign in again anytime with your SRM account.</p>
                </div>
              </div>
            </div>

            <div className="mx-6 mb-5 rounded-2xl border p-3 flex items-start gap-2"
              style={{ borderColor: "rgba(244,114,182,0.2)", background: "rgba(244,114,182,0.06)" }}>
              <ShieldAlert style={{ width: 14, height: 14, color: "#fda4af", marginTop: 1, flexShrink: 0 }} />
              <p className="text-xs leading-relaxed" style={{ color: "#d4d4d8" }}>
                This will end your current session on this device and clear local session state.
              </p>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 h-11 rounded-xl border text-sm font-semibold"
                style={{ borderColor: "rgba(255,255,255,0.1)", color: "#a1a1aa", background: "rgba(255,255,255,0.03)" }}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 h-11 rounded-xl text-sm font-bold"
                style={{
                  color: "#1a090d",
                  background: "linear-gradient(135deg, #fb7185, #f472b6)",
                  boxShadow: "0 10px 20px rgba(244,114,182,0.26)",
                }}
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
