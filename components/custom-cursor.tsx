"use client"

import { useEffect, useState } from "react"

export function CustomCursor() {
  const [isTouch, setIsTouch] = useState(true)

  useEffect(() => {
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0)
  }, [])

  useEffect(() => {
    if (isTouch) return
    const base = "/cursors/light"
    const style = document.createElement("style")
    style.textContent = `
      body, * {
        cursor: url("${base}/arrow.cur"), auto !important;
      }
      a, button, [role="button"], [tabindex]:not([tabindex="-1"]) {
        cursor: url("${base}/hand.cur"), pointer !important;
      }
      input, textarea, select {
        cursor: url("${base}/ibeam.cur"), text !important;
      }
    `
    document.head.appendChild(style)
    return () => { style.remove() }
  }, [isTouch])

  return null
}
