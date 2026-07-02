"use client"

import { useState, useCallback } from "react"

export function useSupport() {
  const [isSupportOpen, setIsSupportOpen] = useState(false)

  const handleSupportClick = useCallback(() => {
    setIsSupportOpen(true)
  }, [])

  const closeSupport = useCallback(() => {
    setIsSupportOpen(false)
  }, [])

  return { isSupportOpen, handleSupportClick, closeSupport }
}
