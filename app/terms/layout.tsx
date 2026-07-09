import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "edutechsrm terms of service — understand the guidelines for using the SRMIST KTR academic dashboard, data handling practices, and user responsibilities.",
  openGraph: {
    title: "Terms of Service | edutechsrm — SRMIST KTR student dashboard",
    description:
      "edutechsrm terms of service — understand the guidelines for using the SRMIST KTR academic dashboard.",
  },
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
