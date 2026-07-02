"use client"

import Link from "next/link"

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/docs", label: "Docs" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
]

export function PublicFooter() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-black/20 px-4 py-7 text-center text-xs text-zinc-500 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="font-semibold transition hover:text-zinc-300">
            {link.label}
          </Link>
        ))}
        <span className="hidden h-1 w-1 rounded-full bg-zinc-700 sm:inline-block" />
        <span>Not affiliated with SRM Institute</span>
        <span className="hidden h-1 w-1 rounded-full bg-zinc-700 sm:inline-block" />
        <span className="font-bold text-emerald-300">edutechsrm v2.1</span>
      </div>
      <p className="mt-2">Your credentials are never stored. All data is fetched live from SRM Academia.</p>
    </footer>
  )
}
