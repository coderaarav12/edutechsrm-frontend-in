"use client"

import { useEffect, useRef } from "react"
import QRCodeStyling from "qr-code-styling"

export function QrCode({ size = 260 }: { size?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const qrRef = useRef<QRCodeStyling | null>(null)

  useEffect(() => {
    if (!ref.current || qrRef.current) return
    qrRef.current = new QRCodeStyling({
      width: size,
      height: size,
      data: "https://edutechsrm.in",
      image: "/icon-192-v2.png",
      qrOptions: { errorCorrectionLevel: "H" },
      dotsOptions: { color: "#10b981", type: "dots" },
      cornersSquareOptions: { color: "#059669", type: "extra-rounded" },
      cornersDotOptions: { color: "#047857", type: "dot" },
      backgroundOptions: { color: "transparent" },
      imageOptions: { crossOrigin: "anonymous", margin: 14, imageSize: 0.5 },
    })
    ref.current.innerHTML = ""
    qrRef.current.append(ref.current)
  }, [size])

  return <div ref={ref} />
}
