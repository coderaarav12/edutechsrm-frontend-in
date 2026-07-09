import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { PageTransition } from "@/components/page-transition"
import { PwaInstallCapture } from "@/components/pwa-install-capture"
import { ServiceWorkerRegister } from "@/components/service-worker-register"
import { CustomCursor } from "@/components/custom-cursor"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
})

export const metadata: Metadata = {
  applicationName: "edutechsrm",
  metadataBase: new URL("https://edutechsrm.in"),
  title: {
    default:
      "edutechsrm | Free SRMIST KTR timetable, attendance & marks dashboard",
    template: "%s | edutechsrm",
  },
  description:
    "Free SRMIST KTR student dashboard for timetable, attendance, internal marks, CGPA calculator, assignments tracker, academic calendar and day order planner. Live data from SRM Academia — no password stored.",
  keywords: [
    "edutechsrm",
    "SRMIST KTR timetable",
    "SRM timetable",
    "SRM attendance tracker",
    "SRM marks tracker",
    "SRM CGPA calculator",
    "SRM student dashboard",
    "SRM Academia timetable",
    "SRMIST student app",
    "SRM day order",
    "SRM internal marks",
    "SRM academic planner",
    "SRM assignments tracker",
    "SRMIST KTR",
    "SRM university dashboard",
    "SRM attendance percentage",
    "SRM grade calculator",
    "free student dashboard",
    "SRM academia login",
    "SRM result tracker",
  ],
  authors: [{ name: "edutechsrm", url: "https://edutechsrm.in" }],
  creator: "edutechsrm",
  publisher: "edutechsrm",
  alternates: {
    canonical: "https://edutechsrm.in",
  },
  openGraph: {
    type: "website",
    url: "https://edutechsrm.in",
    siteName: "edutechsrm",
    title:
      "edutechsrm | Free SRMIST KTR timetable, attendance & marks dashboard",
    description:
      "Free SRMIST KTR student dashboard for timetable, attendance, internal marks, CGPA calculator, assignments tracker, academic calendar and day order planner. Live data from SRM Academia — no password stored.",
    locale: "en_IN",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "edutechsrm student dashboard for SRMIST KTR",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "edutechsrm | Free SRMIST KTR timetable, attendance and marks dashboard",
    description:
      "Free SRMIST KTR student dashboard for timetable, attendance, internal marks, CGPA, assignments and academic calendar.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/icon-192-v2.png", type: "image/png", sizes: "48x48" },
      { url: "/icon-192-v2.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512-v2.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon-v2.svg", type: "image/svg+xml" },
      { url: "/icon-v2.svg", type: "image/svg+xml", sizes: "512x512" },
    ],
    shortcut: "/icon-192-v2.png",
    apple: "/apple-icon-v2.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "education",
  manifest: "/manifest.json",
  referrer: "origin-when-cross-origin",
  other: { "google-adsense-account": "ca-pub-3435389706341604" },
}

export const viewport: Viewport = {
  themeColor: "#09090b",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://edutechsrm.in/#organization",
        name: "edutechsrm",
        url: "https://edutechsrm.in",
        sameAs: ["https://github.com/coderaarav12"],
        founder: {
          "@type": "Person",
          name: "Aarav Goel",
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://edutechsrm.in/#website",
        url: "https://edutechsrm.in",
        name: "edutechsrm",
        inLanguage: "en-IN",
        publisher: {
          "@id": "https://edutechsrm.in/#organization",
        },
        description:
          "Free SRMIST KTR student dashboard for timetable, attendance, marks, CGPA and academic planning.",
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://edutechsrm.in/#app",
        name: "edutechsrm",
        url: "https://edutechsrm.in",
        applicationCategory: "EducationApplication",
        operatingSystem: "Web Browser",
        description:
          "Free SRMIST KTR student dashboard for timetable, attendance, internal marks, assignments, CGPA and academic calendar.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
        },
        audience: {
          "@type": "EducationalAudience",
          educationalRole: "student",
        },
      },
      {
        "@type": "FAQPage",
        "@id": "https://edutechsrm.in/#faq",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is edutechsrm?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "edutechsrm is a free academic dashboard for SRMIST KTR students that brings timetable, attendance, internal marks, assignments, CGPA and calendar into one place.",
            },
          },
          {
            "@type": "Question",
            name: "Is my SRM password stored?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. Your SRM password is never stored by edutechsrm. The app uses live SRM Academia authentication and only keeps the session needed to fetch your data.",
            },
          },
          {
            "@type": "Question",
            name: "How do I check my SRM attendance?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Login to edutechsrm with your SRM Academia credentials to see your real-time attendance percentage, subject-wise breakdown, and history.",
            },
          },
          {
            "@type": "Question",
            name: "Can I calculate my CGPA on edutechsrm?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. edutechsrm includes a GradeX CGPA calculator that computes your SGPA and CGPA from your SRM internal marks and grades.",
            },
          },
          {
            "@type": "Question",
            name: "Is edutechsrm free to use?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, edutechsrm is completely free for all SRMIST KTR students. There are no hidden charges or premium features.",
            },
          },
        ],
      },
    ],
  }

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {/* Google Consent Mode v2 defaults — denied until user consents */}
        <Script
          id="google-consent-defaults"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'analytics_storage': 'denied'
              });
            `,
          }}
        />
      </head>
      <body className={`${inter.className} ${jetbrainsMono.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <Providers>
          <PwaInstallCapture />
          <ServiceWorkerRegister />
          <CustomCursor />
          <PageTransition>{children}</PageTransition>
        </Providers>
      </body>
    </html>
  )
}
