"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Wrench } from "lucide-react"
import { useAdminControl } from "@/lib/admin-control"

export function MaintenanceOverlay() {
  const { maintenance } = useAdminControl()

  return (
    <AnimatePresence>
      {maintenance.enabled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center px-4"
          style={{
            background: "rgba(9,9,11,0.72)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            className="w-full max-w-md rounded-[28px] border p-6 text-center"
            style={{
              background: "linear-gradient(135deg,rgba(24,24,27,0.95),rgba(24,24,27,0.85))",
              borderColor: "rgba(52,211,153,0.22)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
            }}
          >
            <div
              className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.18)" }}
            >
              <Wrench className="w-6 h-6" style={{ color: "#34d399" }} />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: "#34d399" }}>
              Maintenance Mode
            </p>
            <h2 className="text-2xl font-black mt-2" style={{ color: "#f4f4f5" }}>
              Maintenance in progress
            </h2>
            <p className="text-sm mt-3 leading-relaxed" style={{ color: "#a1a1aa" }}>
              {maintenance.message || "The website is temporarily paused while updates are being applied."}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
