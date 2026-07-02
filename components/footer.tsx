"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

const links = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
]

export function Footer() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const check = () => setScrolled(window.scrollY > 0)
    check()
    window.addEventListener("scroll", check, { passive: true })
    return () => window.removeEventListener("scroll", check)
  }, [])

  if (!scrolled) return null

  return (
    <footer className="border-t border-white/[0.04] px-4 py-5 text-center text-xs" style={{ background: "color-mix(in srgb, var(--page-bg, #09090b) 80%, transparent)" }} role="contentinfo">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-y-1.5 md:flex-row md:gap-x-4" style={{ color: "var(--text-subtle, #71717a)" }}>
        <div className="flex flex-wrap items-center justify-center gap-x-4">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="font-semibold transition hover:opacity-70">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden h-1 w-1 rounded-full bg-zinc-700 md:inline-block" />
          <span>Not affiliated with SRM Institute</span>
          <span className="hidden h-1 w-1 rounded-full bg-zinc-700 md:inline-block" />
          <span className="font-bold" style={{ color: "var(--accent-theme, #34d399)" }}>edutechsrm v2.1</span>
        </div>
      </div>
      <p className="mt-2" style={{ color: "var(--text-faint, #52525b)" }}>Credentials never stored — live data from SRM Academia.</p>
    </footer>
  )
}
