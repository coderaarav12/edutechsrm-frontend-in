"use client"

import { useState, useEffect, useMemo, useCallback, useSyncExternalStore } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { IdCard, Search, X, ChevronLeft, ChevronRight, Users, AlertCircle, MapPin, Building2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface Faculty {
  id: string
  facultyId: string
  name: string
  designation: string
  department: string
  staffRoom: string
}

const DEPARTMENTS = ["CTech", "NWC", "Cintel", "DSBS"]

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-white/5 p-4 bg-zinc-900/60 animate-pulse">
      <div className="space-y-2.5">
        <div className="h-5 bg-zinc-800 rounded w-3/4" />
        <div className="h-3.5 bg-zinc-800 rounded w-1/2" />
        <div className="h-3.5 bg-zinc-800 rounded w-2/3" />
        <div className="h-3.5 bg-zinc-800 rounded w-1/3" />
      </div>
    </div>
  )
}

export function FinderSection() {
  const { token } = useAuth()
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [departments, setDepartments] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [department, setDepartment] = useState("CTech")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const isMobile = useSyncExternalStore(
    useCallback((cb: () => void) => {
      const mq = window.matchMedia("(max-width: 1023px)")
      mq.addEventListener("change", cb)
      return () => mq.removeEventListener("change", cb)
    }, []),
    () => window.matchMedia("(max-width: 1023px)").matches,
    () => false
  )
  const pageSize = isMobile ? 5 : 20

  const fetchData = useCallback(async (dept: string, q: string, p: number) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ department: dept, page: String(p), limit: String(pageSize) })
      if (q) params.set("q", q)
      const headers: Record<string, string> = {}
      if (token) headers["x-access-token"] = token
      const res = await fetch(`/api/finder?${params}`, { headers })
      if (!res.ok) throw Error(await res.text().catch(() => "Failed to load"))
      const data = await res.json()
      setFaculty(data.faculty || [])
      setTotalPages(data.totalPages || 1)
      if (data.departments) setDepartments(data.departments)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load faculty data")
      setFaculty([])
    } finally {
      setLoading(false)
    }
  }, [token, pageSize])

  useEffect(() => { fetchData("CTech", "", 1) }, [fetchData])

  useEffect(() => {
    const timer = setTimeout(() => fetchData(department, search, page), search ? 300 : 0)
    return () => clearTimeout(timer)
  }, [department, search, page, fetchData])

  useEffect(() => { setPage(1) }, [search, department])

  const suggestions = useMemo(() => {
    if (search.length < 2 || !faculty.length) return []
    return faculty.filter(f =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.facultyId.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 5)
  }, [search, faculty])

  const scrollToTop = useCallback(() => window.scrollTo({ top: 0, behavior: "smooth" }), [])

  const goToPage = useCallback((p: number) => {
    setPage(Math.max(1, Math.min(p, totalPages)))
    scrollToTop()
  }, [totalPages, scrollToTop])

  const pageNumbers = useMemo(() => {
    if (totalPages <= 1) return []
    const pages: number[] = []
    let start = Math.max(1, page - Math.floor(2.5))
    let end = Math.min(totalPages, start + 5 - 1)
    if (end - start + 1 < 5) start = Math.max(1, end - 5 + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }, [page, totalPages])

  return (
    <div className="min-h-full pt-[3.75rem] pb-20 px-3 sm:px-4 lg:px-8 lg:pb-8 w-full">
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">Faculty</p>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight font-display">Faculty Finder</h1>
          <p className="text-xs mt-1 text-zinc-500">Find faculty staff room and cabin details.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input type="text" placeholder="Search by name or faculty ID..."
          value={search} onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); setPage(1) }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="w-full pl-9 pr-9 py-2.5 bg-zinc-900/60 border border-white/5 rounded-xl text-zinc-100 text-sm placeholder-zinc-500 focus:outline-none focus:border-emerald-500/40 transition-colors" />
        {search && (
          <button onClick={() => { setSearch(""); setShowSuggestions(false) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              className="absolute top-full left-0 right-0 mt-1 z-10 rounded-xl border border-white/5 bg-zinc-900/95 backdrop-blur-xl overflow-hidden">
              {suggestions.map(f => (
                <button key={f.id} onMouseDown={() => { setSearch(f.name); setShowSuggestions(false) }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors">
                  <IdCard className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-100 truncate">{f.name}</p>
                    <p className="text-[11px] text-zinc-500">{f.facultyId} &bull; {f.department}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Department filter */}
      <div className="flex gap-2 mb-6">
        {DEPARTMENTS.map((d) => (
          <motion.button key={d} whileTap={{ scale: 0.95 }}
            onClick={() => { setDepartment(d); setSearch(""); setPage(1) }}
            className={`flex-1 py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              department === d
                ? "bg-zinc-800 text-emerald-400 shadow-md border border-white/5"
                : "bg-transparent text-zinc-500 border border-transparent hover:text-zinc-300"
            }`}>
            {d}
          </motion.button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          {Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mb-4" />
          <h3 className="text-lg font-bold text-zinc-100 mb-1">Failed to Load Data</h3>
          <p className="text-sm text-zinc-500 mb-6 max-w-xs">{error}</p>
          <button onClick={() => fetchData(department, search, page)}
            className="px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500/20 transition-colors">
            Try Again
          </button>
        </div>
      ) : faculty.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="w-10 h-10 text-zinc-600 mb-4" />
          <h3 className="text-lg font-bold text-zinc-100 mb-1">{department === "Cintel" || department === "DSBS" ? "Data coming soon" : "No faculty found"}</h3>
          <p className="text-sm text-zinc-500 mb-6">{department === "Cintel" || department === "DSBS" ? "Faculty details for this department are being added and will be available soon." : "Try adjusting your search or department filter."}</p>
          <button onClick={() => { setSearch(""); setDepartment("CTech"); setPage(1) }}
            className="px-5 py-2 bg-zinc-800 border border-white/5 text-zinc-300 rounded-xl text-xs font-bold hover:bg-zinc-700 transition-colors">
            Clear Search & Filter
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
            <AnimatePresence mode="popLayout">
              {faculty.map(f => (
                <motion.div key={f.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
                  className="rounded-xl border border-white/5 p-4 bg-zinc-900/60 hover:bg-zinc-900/80 hover:border-emerald-500/20 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <IdCard className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-zinc-100 truncate" title={f.name}>{f.name}</h3>
                      <p className="text-[11px] text-emerald-400/80 font-medium truncate">{f.designation}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-[11px] text-zinc-500"><span className="text-zinc-400">ID:</span> {f.facultyId}</p>
                        <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-zinc-600" />
                          <span className="text-zinc-400">{f.department}</span>
                        </p>
                        <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-zinc-600" />
                          <span className="text-emerald-400 font-semibold">{f.staffRoom}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => goToPage(page - 1)} disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-900/60 border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed hover:border-emerald-500/30 transition-colors">
                <ChevronLeft className="w-4 h-4 text-zinc-400" />
              </motion.button>
              {pageNumbers.map(p => (
                <motion.button key={p} whileTap={{ scale: 0.9 }} onClick={() => goToPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    page === p ? "bg-emerald-500 text-black" : "bg-zinc-900/60 border border-white/5 text-zinc-400 hover:border-emerald-500/30"
                  }`}>
                  {p}
                </motion.button>
              ))}
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => goToPage(page + 1)} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-900/60 border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed hover:border-emerald-500/30 transition-colors">
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </motion.button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
