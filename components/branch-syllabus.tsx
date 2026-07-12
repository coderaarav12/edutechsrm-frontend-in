"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Layers } from "lucide-react"
import { DriveViewer } from "@/components/drive-viewer"

interface Branch {
  id: string
  name: string
  driveUrl: string
  color: string
}

const BRANCHES: Branch[] = [
  { id: "AI", name: "Artificial Intelligence", driveUrl: "https://drive.google.com/file/d/19weG11S3MhbUX6K9tPDWp_i-MrrAGc78/view?usp=sharing", color: "#a78bfa" },
  { id: "Biotechnology", name: "Biotechnology", driveUrl: "https://drive.google.com/file/d/1TYbaa3FbEam50g2Lm2zGE4R8bPFBxB2_/view?usp=sharing", color: "#34d399" },
  { id: "BiotechnologyFoodTechnology", name: "Biotechnology (Food Technology)", driveUrl: "https://drive.google.com/file/d/1Ut8nqB3u4_YpUpV6YZlSrUusewduePsx/view?usp=sharing", color: "#fbbf24" },
  { id: "BiotechnologyRegenerativeMedicine", name: "Biotechnology (Regenerative Medicine)", driveUrl: "https://drive.google.com/file/d/1kS4b7TEZj_c1oHMuh6T6m5oV-FO6bydF/view?usp=sharing", color: "#f472b6" },
  { id: "BiotechnologyComputationalBiology", name: "Biotechnology (Computational Biology)", driveUrl: "https://drive.google.com/file/d/1Qbpam3UC8UfpvUUSxoGOdqTgKFHcHp8b/view?usp=sharing", color: "#38bdf8" },
  { id: "Biomedical", name: "Biomedical Engineering", driveUrl: "https://drive.google.com/file/d/1dx_NajaVtir_wwQfrfSRNzpbdqyH7Vp8/view?usp=sharing", color: "#fb923c" },
  { id: "BiomedicalML", name: "Biomedical Engineering (Machine Learning)", driveUrl: "https://drive.google.com/file/d/1Q7JIyGk-JX7DOD04Tb8et60rpSPvynLP/view?usp=sharing", color: "#c084fc" },
  { id: "Chemical", name: "Chemical Engineering", driveUrl: "https://drive.google.com/file/d/1OqY2pudSaLLe45r6BVrTfIR5cMdbGc8p/view?usp=sharing", color: "#f97316" },
  { id: "Civil", name: "Civil Engineering", driveUrl: "https://drive.google.com/file/d/1u3KnLRvYj-WK_gKEkU_Jgoo3yj2iZXP5/view?usp=sharing", color: "#60a5fa" },
  { id: "CSECore", name: "Computer Science & Engineering (Core)", driveUrl: "https://drive.google.com/file/d/1BrPwEZuIRFZXwMdakiIC5zN_lHpdfA2x/view?usp=sharing", color: "#34d399" },
  { id: "CSEAIML", name: "Computer Science & Engineering (AI & ML)", driveUrl: "https://drive.google.com/file/d/170YX7hFqCDaBcOK-Vl7RFkgyAuYx25id/view?usp=sharing", color: "#a78bfa" },
  { id: "CSEDS", name: "Computer Science & Engineering (Data Science)", driveUrl: "https://drive.google.com/file/d/14WVoPQk9sKaI21Jm4w1_lSaOH7Q13-GA/view?usp=sharing", color: "#38bdf8" },
  { id: "CSEBD", name: "Computer Science & Engineering (Big Data Analytics)", driveUrl: "https://drive.google.com/file/d/1pTgjUdvRAhrzfgrlQbFABQQAmvbp66oS/view?usp=sharing", color: "#f59e0b" },
  { id: "CSECC", name: "Computer Science & Engineering (Cloud Computing)", driveUrl: "https://drive.google.com/file/d/17GVAaBfVHxMXuHTDDg2H7QRJuLhuZKJj/view?usp=sharing", color: "#60a5fa" },
  { id: "CSECyber", name: "Computer Science & Engineering (Cyber Security)", driveUrl: "https://drive.google.com/file/d/1LPSsWpbWm6Wz7aVH3noar8ydnuFoR4Wr/view?usp=sharing", color: "#f87171" },
  { id: "CSEIT", name: "Computer Science & Engineering (Information Technology)", driveUrl: "https://drive.google.com/file/d/1o5mOSb6RL_xkmRZ_ftkT3ZL9hF6ik6z3/view?usp=sharing", color: "#34d399" },
  { id: "CSEIoT", name: "Computer Science & Engineering (Internet of Things)", driveUrl: "https://drive.google.com/file/d/1zohxXLD4AMk9I09KLSFPfIHr9c24jErO/view?usp=sharing", color: "#fb923c" },
  { id: "CSESWE", name: "Computer Science & Engineering (Software Engineering)", driveUrl: "https://drive.google.com/file/d/1dKqyClA-uxxeJctZX8uggL7mFv3jP8va/view?usp=sharing", color: "#f472b6" },
  { id: "CSEBS", name: "Computer Science & Engineering (Business Systems)", driveUrl: "https://drive.google.com/file/d/1eM5kxpQtd9WaFPixZONfXWBfmoXFdu-m/view?usp=sharing", color: "#fbbf24" },
  { id: "EEE", name: "Electrical and Electronics Engineering", driveUrl: "https://drive.google.com/file/d/12g5QiUsKj1YJib9b0K7M-sW8KpXh8l14/view?usp=sharing", color: "#f59e0b" },
  { id: "ECE", name: "Electronics and Communication Engineering", driveUrl: "https://drive.google.com/file/d/1Ccgaor3eKjgH4O57dcMHCAa9ZMJJahZ_/view?usp=sharing", color: "#38bdf8" },
  { id: "ECEDS", name: "Electronics and Communication Engineering (Data Science)", driveUrl: "https://drive.google.com/file/d/1mMa7uC-_z7PRl0lWHPXnZ4xlRFLPgj0a/view?usp=sharing", color: "#a78bfa" },
  { id: "ECEComp", name: "Electronics and Computer Engineering", driveUrl: "https://drive.google.com/file/d/12lIq9iuozjK2Qz5fXANq_wopd4NL4WVk/view?usp=sharing", color: "#34d399" },
  { id: "Mechanical", name: "Mechanical Engineering", driveUrl: "https://drive.google.com/file/d/1MokhZWXFsJ6-595DcY21fk60171YI8TD/view?usp=sharing", color: "#fb923c" },
  { id: "Mechatronics", name: "Mechatronics Engineering", driveUrl: "https://drive.google.com/file/d/1eCT8PABPT73Gd6LINd-EDu__FaNurUs_/view?usp=sharing", color: "#f472b6" },
]

export function BranchSyllabus() {
  const [search, setSearch] = useState("")
  const [driveViewer, setDriveViewer] = useState<{ url: string; title: string } | null>(null)

  const filtered = BRANCHES.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="text-center mb-6">
          <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">Branch-wise subjects for each semester</p>
          <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Select Your Branch</h2>
          <p className="text-xs text-zinc-500 mt-1">View the complete syllabus</p>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search branches..."
          className="w-full px-4 py-3 rounded-xl bg-zinc-950/60 ring-1 ring-white/5 text-zinc-100 text-sm focus:outline-none focus:ring-emerald-500/30 transition-all placeholder:text-zinc-700"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {filtered.map((branch, i) => (
            <motion.button
              key={branch.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setDriveViewer({ url: branch.driveUrl, title: branch.name })}
              className="group text-left bg-zinc-900/40 ring-1 ring-white/5 rounded-xl p-4 hover:ring-zinc-700 hover:bg-zinc-900/60 transition-all relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 ring-1 ring-white/5"
                  style={{ background: `${branch.color}12` }}
                >
                  <Layers size={16} style={{ color: branch.color }} />
                </div>
                <p className="text-[11px] font-bold text-zinc-300 group-hover:text-white transition-colors leading-tight line-clamp-3">
                  {branch.name}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {driveViewer && (
        <DriveViewer
          url={driveViewer.url}
          title={driveViewer.title}
          onClose={() => setDriveViewer(null)}
        />
      )}
    </div>
  )
}
