"use client"

import { useState, useEffect, useMemo, useCallback, useSyncExternalStore } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  IdCard, Search, X, ChevronLeft, ChevronRight, Users, AlertCircle, 
  MapPin, Building2, Mail, Phone, ExternalLink, Sparkles, GraduationCap, Copy, Check,
  ChevronDown
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface Faculty {
  id: string
  facultyId: string
  name: string
  designation: string
  department: string
  fullDepartment?: string
  college?: string
  campus?: string
  staffRoom: string
  email?: string
  phone?: string
  specialization?: string
  experience?: string
  profileUrl?: string
  photoUrl?: string
}

const PRIMARY_DEPT_TABS = [
  { id: "All", label: "All Departments" },
  { id: "CTech", label: "CTech" },
  { id: "NWC", label: "NWC" },
  { id: "Cintel", label: "Cintel" },
  { id: "DSBS", label: "DSBS" },
  { id: "ECE", label: "ECE" },
  { id: "EEE", label: "EEE" },
  { id: "Mechanical", label: "Mechanical" },
  { id: "Civil", label: "Civil" },
  { id: "Biotech", label: "Biotech" },
  { id: "Mathematics", label: "Maths" },
  { id: "Physics", label: "Physics" },
  { id: "Chemistry", label: "Chemistry" },
  { id: "Management", label: "Management" },
  { id: "Law", label: "Law" },
  { id: "Medical & Health", label: "Medical" },
]

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/5 p-4 bg-zinc-900/40 animate-pulse flex flex-col justify-between h-[230px]">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-zinc-800 shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-zinc-800 rounded w-3/4" />
          <div className="h-3 bg-zinc-800/70 rounded w-1/2" />
        </div>
      </div>
      <div className="h-10 bg-zinc-800/50 rounded-xl my-2" />
      <div className="space-y-1.5 pt-2 border-t border-white/5">
        <div className="h-3 bg-zinc-800/60 rounded w-4/5" />
      </div>
    </div>
  )
}

function FacultyCard({ f }: { f: Faculty }) {
  const [copiedType, setCopiedType] = useState<"email" | "phone" | null>(null)
  const [imgError, setImgError] = useState(false)

  const copyToClipboard = (text: string, type: "email" | "phone") => {
    navigator.clipboard.writeText(text)
    setCopiedType(type)
    setTimeout(() => setCopiedType(null), 2000)
  }

  const initials = useMemo(() => {
    const clean = f.name.replace(/^(Dr\.|Dr|Prof\.|Prof|Mr\.|Mr|Mrs\.|Mrs|Ms\.|Ms)\s*/i, "").trim()
    const parts = clean.split(" ").filter(Boolean)
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    return clean.slice(0, 2).toUpperCase() || "SR"
  }, [f.name])

  const proxiedImageUrl = useMemo(() => {
    if (!f.photoUrl || imgError) return null
    return `/api/finder/image?url=${encodeURIComponent(f.photoUrl)}`
  }, [f.photoUrl, imgError])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="group relative rounded-2xl border border-white/5 p-4 bg-zinc-900/50 hover:bg-zinc-900/80 hover:border-emerald-500/30 transition-all flex flex-col justify-between shadow-md hover:shadow-xl hover:shadow-black/40"
    >
      <div>
        {/* Header: Photo or Initials Avatar & Name */}
        <div className="flex items-start gap-3">
          <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-zinc-800 border border-emerald-500/20 flex items-center justify-center shrink-0 overflow-hidden text-xs font-black text-emerald-400 shadow-inner">
            {proxiedImageUrl ? (
              <img
                src={proxiedImageUrl}
                alt={f.name}
                className="w-full h-full object-cover rounded-xl"
                onError={() => setImgError(true)}
                loading="lazy"
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-1">
              <h3 className="text-sm font-bold text-zinc-100 truncate group-hover:text-emerald-300 transition-colors" title={f.name}>
                {f.name}
              </h3>
              {f.profileUrl && (
                <a
                  href={f.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-emerald-400 p-0.5 rounded transition-colors shrink-0"
                  title="Official SRMIST Profile"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <p className="text-[11px] text-emerald-400/90 font-medium truncate" title={f.designation}>
              {f.designation}
            </p>

            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-white/5">
                {f.department}
              </span>
              {f.facultyId && f.facultyId !== "Not Assigned" && !f.facultyId.startsWith("FAC") && (
                <span className="text-[10px] text-zinc-500 font-mono">
                  #{f.facultyId}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Cabin / Staff Room Highlight */}
        <div className="mt-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl px-2.5 py-1.5 flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-semibold text-emerald-300 truncate block" title={f.staffRoom}>
              {f.staffRoom || "Faculty Cabin"}
            </span>
          </div>
        </div>

        {/* Details: Specialization & Full Dept */}
        <div className="mt-2.5 space-y-1.5 text-[11px] text-zinc-400">
          {f.fullDepartment && f.fullDepartment !== f.department && (
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span className="text-zinc-400 truncate text-[10.5px]" title={f.fullDepartment}>
                {f.fullDepartment}
              </span>
            </div>
          )}

          {f.specialization && (
            <div className="flex items-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400/80 shrink-0 mt-0.5" />
              <span className="text-zinc-400 line-clamp-2 text-[10.5px]" title={f.specialization}>
                {f.specialization}
              </span>
            </div>
          )}

          {f.experience && (
            <div className="flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-sky-400/80 shrink-0" />
              <span className="text-zinc-400 truncate text-[10.5px]" title={f.experience}>
                {f.experience}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Contact Actions */}
      <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-between gap-2">
        {f.email ? (
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <a
              href={`mailto:${f.email}`}
              className="flex items-center gap-1.5 text-[11px] text-zinc-300 hover:text-emerald-400 transition-colors truncate"
              title={`Email: ${f.email}`}
            >
              <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate font-mono text-[10.5px]">{f.email}</span>
            </a>
            <button
              onClick={() => copyToClipboard(f.email!, "email")}
              className="text-zinc-500 hover:text-zinc-200 transition-colors p-1 rounded hover:bg-white/5 shrink-0"
              title="Copy Email"
            >
              {copiedType === "email" ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
        ) : (
          <span className="text-[10px] text-zinc-600 italic">No email</span>
        )}

        {f.phone && (
          <div className="flex items-center gap-1 shrink-0">
            <a
              href={`tel:${f.phone}`}
              className="flex items-center gap-1 text-[10.5px] font-mono text-zinc-400 hover:text-emerald-400 px-1.5 py-0.5 rounded bg-zinc-800/80 border border-white/5 transition-colors"
              title={`Call: ${f.phone}`}
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>Call</span>
            </a>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export function FinderSection() {
  const { token } = useAuth()
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [allDepartments, setAllDepartments] = useState<string[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [department, setDepartment] = useState("All")
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
  const pageSize = isMobile ? 8 : 20

  const fetchData = useCallback(async (dept: string, q: string, p: number) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ 
        department: dept === "All" ? "" : dept, 
        page: String(p), 
        limit: String(pageSize) 
      })
      if (q) params.set("q", q)
      
      const headers: Record<string, string> = {}
      if (token) headers["x-access-token"] = token
      
      const res = await fetch(`/api/finder?${params}`, { headers })
      if (!res.ok) throw Error(await res.text().catch(() => "Failed to load"))
      
      const data = await res.json()
      setFaculty(data.faculty || [])
      setTotalPages(data.totalPages || 1)
      setTotalCount(data.total || 0)
      if (data.departments && data.departments.length > 0) {
        setAllDepartments(data.departments)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load faculty data")
      setFaculty([])
    } finally {
      setLoading(false)
    }
  }, [token, pageSize])

  useEffect(() => { fetchData("All", "", 1) }, [fetchData])

  useEffect(() => {
    const timer = setTimeout(() => fetchData(department, search, page), search ? 300 : 0)
    return () => clearTimeout(timer)
  }, [department, search, page, fetchData])

  useEffect(() => { setPage(1) }, [search, department])

  const suggestions = useMemo(() => {
    if (search.length < 2 || !faculty.length) return []
    return faculty.filter(f =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.facultyId.toLowerCase().includes(search.toLowerCase()) ||
      (f.email && f.email.toLowerCase().includes(search.toLowerCase())) ||
      f.department.toLowerCase().includes(search.toLowerCase())
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
    let start = Math.max(1, page - 2)
    let end = Math.min(totalPages, start + 5 - 1)
    if (end - start + 1 < 5) start = Math.max(1, end - 5 + 1)
    for (let i = Math.max(1, start); i <= end; i++) pages.push(i)
    return pages
  }, [page, totalPages])

  const isCustomDepartment = useMemo(() => {
    return department !== "All" && !PRIMARY_DEPT_TABS.some(tab => tab.id === department)
  }, [department])

  return (
    <div className="min-h-full pt-[3.75rem] pb-20 px-3 sm:px-4 lg:px-8 lg:pb-8 w-full max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-1">Campus Directory</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight font-display flex items-center gap-2.5">
            Faculty Finder
            <span className="text-xs px-2.5 py-0.5 rounded-full font-sans font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {totalCount > 0 ? `${totalCount.toLocaleString()} Faculty` : "SRMIST KTR"}
            </span>
          </h1>
          <p className="text-xs mt-1 text-zinc-400">
            Quickly locate staff rooms, faculty cabins, official emails, and research areas.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search by teacher name, faculty ID, staff room, email, or department..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); setPage(1) }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
          className="w-full pl-10 pr-10 py-3 bg-zinc-900/60 border border-white/5 rounded-xl text-zinc-100 text-sm placeholder-zinc-500 focus:outline-none focus:border-emerald-500/40 transition-colors shadow-inner"
        />
        {search && (
          <button
            onClick={() => { setSearch(""); setShowSuggestions(false) }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Suggestion Dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute top-full left-0 right-0 mt-1.5 z-20 rounded-xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl overflow-hidden shadow-2xl"
            >
              {suggestions.map(f => (
                <button
                  key={f.id}
                  onMouseDown={() => { setSearch(f.name); setShowSuggestions(false) }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                >
                  <IdCard className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-100 truncate">{f.name}</p>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {f.designation} &bull; <span className="text-emerald-400">{f.department}</span> {f.staffRoom ? `&bull; ${f.staffRoom}` : ""}
                    </p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Clean Unified Department Filter Bar */}
      <div className="mb-6 flex flex-wrap items-center gap-1.5">
        {PRIMARY_DEPT_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setDepartment(tab.id); setSearch(""); setPage(1) }}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              department === tab.id
                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold"
                : "bg-zinc-900/60 text-zinc-400 border border-white/5 hover:text-zinc-200 hover:bg-zinc-800"
            }`}
          >
            {tab.label}
          </button>
        ))}

        {/* Integrated All Departments Selector */}
        {allDepartments.length > 0 && (
          <div className="relative inline-block">
            <select
              value={isCustomDepartment ? department : ""}
              onChange={(e) => {
                if (e.target.value) {
                  setDepartment(e.target.value)
                  setSearch("")
                  setPage(1)
                }
              }}
              className={`appearance-none py-1.5 pl-3 pr-7 rounded-lg text-xs font-semibold cursor-pointer focus:outline-none transition-all ${
                isCustomDepartment
                  ? "bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20"
                  : "bg-zinc-900/60 text-zinc-400 border border-white/5 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              <option value="" disabled className="bg-zinc-900 text-zinc-400">
                More Departments ({allDepartments.length})...
              </option>
              {allDepartments.map((dept) => (
                <option key={dept} value={dept} className="bg-zinc-900 text-zinc-200">
                  {dept}
                </option>
              ))}
            </select>
            <ChevronDown className={`w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${isCustomDepartment ? "text-black" : "text-zinc-500"}`} />
          </div>
        )}
      </div>

      {/* Faculty Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {Array.from({ length: pageSize }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mb-4" />
          <h3 className="text-lg font-bold text-zinc-100 mb-1">Failed to Load Data</h3>
          <p className="text-sm text-zinc-500 mb-6 max-w-xs">{error}</p>
          <button
            onClick={() => fetchData(department, search, page)}
            className="px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500/20 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : faculty.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="w-10 h-10 text-zinc-600 mb-4" />
          <h3 className="text-lg font-bold text-zinc-100 mb-1">No faculty found</h3>
          <p className="text-sm text-zinc-500 mb-6">Try adjusting your search terms or selecting another department.</p>
          <button
            onClick={() => { setSearch(""); setDepartment("All"); setPage(1) }}
            className="px-5 py-2 bg-zinc-800 border border-white/5 text-zinc-300 rounded-xl text-xs font-bold hover:bg-zinc-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            <AnimatePresence mode="popLayout">
              {faculty.map((f) => (
                <FacultyCard key={f.id} f={f} />
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-10">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-900/60 border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed hover:border-emerald-500/30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-zinc-400" />
              </motion.button>
              
              {pageNumbers[0] > 1 && (
                <>
                  <button
                    onClick={() => goToPage(1)}
                    className="w-8 h-8 rounded-lg text-xs font-bold bg-zinc-900/60 border border-white/5 text-zinc-400 hover:border-emerald-500/30"
                  >
                    1
                  </button>
                  {pageNumbers[0] > 2 && <span className="text-zinc-600 px-0.5 text-xs">...</span>}
                </>
              )}

              {pageNumbers.map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    page === p
                      ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-extrabold"
                      : "bg-zinc-900/60 border border-white/5 text-zinc-400 hover:border-emerald-500/30"
                  }`}
                >
                  {p}
                </button>
              ))}

              {pageNumbers[pageNumbers.length - 1] < totalPages && (
                <>
                  {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <span className="text-zinc-600 px-0.5 text-xs">...</span>}
                  <button
                    onClick={() => goToPage(totalPages)}
                    className="w-8 h-8 rounded-lg text-xs font-bold bg-zinc-900/60 border border-white/5 text-zinc-400 hover:border-emerald-500/30"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-900/60 border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed hover:border-emerald-500/30 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </motion.button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

