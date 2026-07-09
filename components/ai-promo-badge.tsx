"use client"

import { motion } from "framer-motion"
import { Bot } from "lucide-react"
import { useAppContext } from "@/app/app/layout"

export function AIPromoBadge({ page }: { page: string }) {
  const { navigate } = useAppContext()
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => {
        sessionStorage.setItem("ai_context", page)
        navigate("ai")
      }}
      className="flex items-center justify-center w-8 h-8 rounded-lg text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 ring-1 ring-violet-500/20 transition-all shrink-0"
    >
      <Bot className="w-3.5 h-3.5" />
    </motion.button>
  )
}
