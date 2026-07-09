import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the edutechsrm team. Report bugs, suggest features, or reach out for support — we respond fast.",
  openGraph: {
    title: "Contact edutechsrm | SRMIST KTR student dashboard",
    description:
      "Get in touch with the edutechsrm team. Report bugs, suggest features, or reach out for support.",
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
