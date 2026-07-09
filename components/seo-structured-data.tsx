"use client"

import { useEffect } from "react"

export function SEOStructuredData() {
  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "SoftwareApplication",
          "@id": "https://edutechsrm.in/#app",
          name: "edutechsrm",
          url: "https://edutechsrm.in",
          applicationCategory: "EducationApplication",
          operatingSystem: "Web Browser",
          description:
            "Free SRMIST KTR student dashboard for timetable, attendance, internal marks, assignments, CGPA and academic calendar.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
          audience: { "@type": "EducationalAudience", educationalRole: "student" },
          featureList: [
            "SRM timetable viewer", "Attendance tracker", "Internal marks tracker",
            "GradeX CGPA calculator", "Academic calendar", "Assignments tracker", "Custom classes planner", "Faculty Finder staff room locator",
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
              name: "Can I track SRM attendance and marks here?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. edutechsrm shows attendance percentages, internal marks, CGPA tools, class schedule, day order and academic calendar for SRMIST KTR students.",
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
          ],
        },
      ],
    }
    const script = document.createElement("script")
    script.type = "application/ld+json"
    script.textContent = JSON.stringify(jsonLd)
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [])

  return null
}
