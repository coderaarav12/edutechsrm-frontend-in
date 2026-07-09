import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Developer",
  description:
    "Meet the developer behind edutechsrm — Aarav Goel, a CSE AIML student at SRM IST who built the free SRMIST KTR academic dashboard.",
}

export default function DeveloperRedirectPage() {
  redirect("/contact")
}
