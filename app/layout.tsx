import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono, Space_Grotesk, Newsreader, Caveat } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { PageTransition } from "@/components/page-transition"
import { PwaInstallCapture } from "@/components/pwa-install-capture"
import { ServiceWorkerRegister } from "@/components/service-worker-register"
import { CustomCursor } from "@/components/custom-cursor"
import { ThemeCurtainWipe } from "@/components/theme-curtain-wipe"
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
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["normal", "italic"],
})
const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-hand",
  weight: ["400", "600", "700"],
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
    "srm timetable app",
    "srm ktr timetable",
    "srm kattankulathur college timings",
    "srm college timings",
    "srm attendance check",
    "srm attendance",
    "srm helper",
    "tracker srm",
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
}

export const viewport: Viewport = {
  themeColor: "#f7f5f0",
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
        logo: {
          "@type": "ImageObject",
          url: "https://edutechsrm.in/icon-512-v2.png",
          width: 512,
          height: 512,
        },
        sameAs: [
          "https://github.com/coderaarav12",
          "https://linkedin.com/in/aaravgoel12",
          "https://play.google.com/store/apps/details?id=in.edutechsrm.app",
        ],
        founder: {
          "@type": "Person",
          name: "Aarav Goel",
          jobTitle: "Developer",
          affiliation: "SRM Institute of Science and Technology, Kattankulathur",
          sameAs: "https://linkedin.com/in/aaravgoel12",
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://edutechsrm.in/#website",
        url: "https://edutechsrm.in",
        name: "edutechsrm",
        inLanguage: "en-IN",
        publisher: { "@id": "https://edutechsrm.in/#organization" },
        description:
          "Free SRMIST KTR student dashboard for timetable, attendance, marks, CGPA and academic planning.",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://edutechsrm.in/faculty?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://edutechsrm.in/#app",
        name: "edutechsrm",
        alternateName: ["edutechsrm app", "SRM student dashboard", "SRMIST KTR dashboard"],
        url: "https://edutechsrm.in",
        applicationCategory: "EducationApplication",
        operatingSystem: "Web Browser, Android, iOS",
        description:
          "Free SRMIST KTR student dashboard for timetable, attendance, internal marks, assignments, CGPA and academic calendar. Live data from SRM Academia — no password stored.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
        },
        audience: {
          "@type": "EducationalAudience",
          educationalRole: "student",
        },
        featureList: [
          "SRM timetable viewer with day order",
          "Live attendance tracker with bunk calculator",
          "Internal marks tracker by subject",
          "GradeX CGPA & SGPA calculator",
          "Academic calendar and exam schedule",
          "Assignments and OD/ML tracker",
          "Faculty Finder with 400+ staff room locations",
          "Campus map with building navigator",
          "AI-powered academic assistant",
          "Custom class planner",
          "Android PWA install support",
        ],
        screenshot: "https://edutechsrm.in/og-image.png",
        publisher: { "@id": "https://edutechsrm.in/#organization" },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "450",
          bestRating: "5",
          worstRating: "1",
        },
      },
      {
        "@type": "WebPage",
        "@id": "https://edutechsrm.in/#webpage",
        url: "https://edutechsrm.in",
        name: "edutechsrm | Free SRMIST KTR timetable, attendance & marks dashboard",
        description:
          "Free SRMIST KTR student dashboard for timetable, attendance, internal marks, CGPA calculator, assignments tracker, academic calendar and day order planner.",
        isPartOf: { "@id": "https://edutechsrm.in/#website" },
        inLanguage: "en-IN",
        about: { "@id": "https://edutechsrm.in/#app" },
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://edutechsrm.in/#breadcrumb",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://edutechsrm.in" },
          { "@type": "ListItem", position: 2, name: "Faculty Finder", item: "https://edutechsrm.in/faculty" },
          { "@type": "ListItem", position: 3, name: "Docs", item: "https://edutechsrm.in/docs" },
          { "@type": "ListItem", position: 4, name: "Download", item: "https://edutechsrm.in/download" },
        ],
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
              text: "edutechsrm is a free academic dashboard for SRMIST KTR students that brings timetable, attendance, internal marks, assignments, CGPA and calendar into one place. Built by a CSE AIML student at SRM.",
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
              text: "Login to edutechsrm with your SRM Academia credentials to see your real-time attendance percentage, subject-wise breakdown, and history. The bunk calculator also tells you how many classes you can safely skip.",
            },
          },
          {
            "@type": "Question",
            name: "Can I calculate my CGPA on edutechsrm?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. edutechsrm includes a GradeX CGPA calculator that computes your SGPA and CGPA from your SRM internal marks and grades automatically.",
            },
          },
          {
            "@type": "Question",
            name: "Is edutechsrm free to use?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, edutechsrm is completely free for all SRMIST KTR students. There are no hidden charges or premium tiers.",
            },
          },
          {
            "@type": "Question",
            name: "How do I find a faculty member's staff room at SRM KTR?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Use the Faculty Finder tool in edutechsrm to search 400+ faculty members by name, department, or faculty ID and find their designation and staff room location instantly.",
            },
          },
          {
            "@type": "Question",
            name: "What is the SRM day order today?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "edutechsrm shows the current SRM day order (Day 1 to Day 6) on the dashboard and timetable. It syncs live with the SRM KTR academic calendar so you always know which classes are scheduled today.",
            },
          },
        ],
      },
    ],
  }

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head suppressHydrationWarning>
        <script
          id="theme-initializer"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var raw = localStorage.getItem('edutechsrm_theme') || localStorage.getItem('edutechsrm-theme');
                  var landingMode = localStorage.getItem('edutechsrm-landing-mode') || localStorage.getItem('edutechsrm_landing_mode');
                  var isNight = false;
                  if (raw) {
                    var parsed = JSON.parse(raw);
                    if (parsed.mode === 'dark' || parsed.mode === 'black') isNight = true;
                  } else if (landingMode === 'night' || landingMode === 'dark') {
                    isNight = true;
                  }
                  if (isNight) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    document.documentElement.setAttribute('data-landing-mode', 'night');
                  } else {
                    document.documentElement.setAttribute('data-theme', 'poster');
                    document.documentElement.setAttribute('data-landing-mode', 'poster');
                  }
                } catch(e) {
                  document.documentElement.setAttribute('data-theme', 'poster');
                  document.documentElement.setAttribute('data-landing-mode', 'poster');
                }
              })();
            `,
          }}
        />
        <script
          id="structured-data-jsonld"
          type="application/ld+json"
          suppressHydrationWarning
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
      <body className={`${inter.className} ${jetbrainsMono.variable} ${spaceGrotesk.variable} ${newsreader.variable} ${caveat.variable} font-sans antialiased`}>
        <Providers>
          <PwaInstallCapture />
          <ServiceWorkerRegister />
          <CustomCursor />
          <ThemeCurtainWipe />
          <PageTransition>{children}</PageTransition>
        </Providers>
      </body>
    </html>
  )
}
