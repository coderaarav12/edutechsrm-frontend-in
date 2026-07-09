import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "edutechsrm privacy policy — we never store your SRM password. Learn how we protect your academic data and what information we access from SRM Academia.",
  openGraph: {
    title: "Privacy Policy | edutechsrm — SRMIST KTR student dashboard",
    description:
      "edutechsrm privacy policy — we never store your SRM password. Learn how we protect your academic data.",
  },
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
