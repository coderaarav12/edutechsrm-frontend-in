"use client"

import { useEffect } from "react"

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=in.edutechsrm.app"
const WEB_URL = "https://edutechsrm.in"

export default function GetPage() {
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()
    const isAndroid = ua.includes("android")
    if (isAndroid) {
      window.location.replace(PLAY_STORE_URL)
    } else {
      window.location.replace(WEB_URL)
    }
  }, [])

  return null
}
