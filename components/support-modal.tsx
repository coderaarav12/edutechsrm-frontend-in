"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Heart, X, Coffee, Rocket, Gem, Star } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

interface SupportModalProps {
  isOpen: boolean
  onClose: () => void
}

const PRESETS = [
  { label: "₹250", icon: Coffee, sub: "Supporter", value: 250 },
  { label: "₹500", icon: Rocket, sub: "Contributor", value: 500 },
  { label: "₹1000", icon: Gem, sub: "Sponsor", value: 1000 },
  { label: "₹2000", icon: Star, sub: "Patron", value: 2000 },
]

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true)
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [amount, setAmount] = useState(50)
  const [custom, setCustom] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [statusMsg, setStatusMsg] = useState("")
  const scriptLoaded = useRef(false)

  useEffect(() => { if (isOpen) loadRazorpayScript().then((ok) => { scriptLoaded.current = ok }) }, [isOpen])

  const handlePay = useCallback(async () => {
    if (!scriptLoaded.current) { setStatusMsg("Payment gateway not loaded. Try again."); setStatus("error"); return }
    if (amount < 100) { setStatusMsg("Minimum amount is ₹100"); setStatus("error"); setLoading(false); return }

    setLoading(true)
    setStatus("idle")

    try {
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency: "INR" }),
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok || !orderData.order_id) {
        const errMsg = typeof orderData.error === "string" ? orderData.error : orderData.error?.description || orderData.error?.message || "Failed to create order"
        throw new Error(errMsg)
      }

      const keyId = orderData.key_id

      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency ?? "INR",
        name: "EduTechSRM",
        description: "Support EduTechSRM",
        image: "/icon-192-v2.png",
        order_id: orderData.order_id,
        prefill: { contact: "", email: "" },
        theme: { color: "#34d399" },
        modal: {
          ondismiss: () => { setLoading(false) },
        },
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount,
            }),
          })
          const verifyData = await verifyRes.json()
          if (verifyData.success) {
            setStatus("success")
            setStatusMsg("Thank you for supporting edutechsrm!")
          } else {
            setStatus("error")
            setStatusMsg("Payment verification failed. Please contact support.")
          }
          setLoading(false)
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on("payment.failed", function () {
        setStatus("error")
        setStatusMsg("Payment failed. Please try again.")
        setLoading(false)
      })
      rzp.open()
    } catch (e: any) {
      setStatus("error")
      setStatusMsg(e.message ?? "Something went wrong")
      setLoading(false)
    }
  }, [amount])

  const selectPreset = (val: number) => { setAmount(val); setCustom(""); setStatus("idle") }
  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/[^0-9]/g, "")
    setCustom(v)
    if (v) setAmount(parseInt(v, 10))
    setStatus("idle")
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[320] p-4 flex items-center justify-center"
          style={{
            background: "radial-gradient(circle at 20% 16%, rgba(52,211,153,0.12), transparent 28%), radial-gradient(circle at 80% 12%, rgba(16,185,129,0.10), transparent 28%), rgba(7,7,10,0.84)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[28px] border overflow-hidden"
            style={{
              borderColor: "rgba(52,211,153,0.2)",
              background: "linear-gradient(145deg, rgba(15,25,20,0.96), rgba(12,18,14,0.92))",
              boxShadow: "0 26px 80px rgba(0,0,0,0.55)",
            }}
          >
            <div className="relative px-6 pt-6 pb-4">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 w-8 h-8 rounded-lg border flex items-center justify-center transition-colors"
                style={{ borderColor: "rgba(255,255,255,0.08)", color: "#a1a1aa", background: "rgba(255,255,255,0.02)" }}
              >
                <X style={{ width: 14, height: 14 }} />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    background: "linear-gradient(135deg, rgba(52,211,153,0.3), rgba(16,185,129,0.15))",
                    border: "1px solid rgba(52,211,153,0.25)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 20px rgba(52,211,153,0.18)",
                  }}
                >
                  <Heart style={{ width: 22, height: 22, color: "#6ee7b7" }} />
                </div>
                <h3 className="text-lg font-black tracking-tight" style={{ color: "#f4f4f5" }}>Support EduTechSRM</h3>
                <p className="text-xs mt-2 leading-relaxed" style={{ color: "#a1a1aa" }}>
                  Helps cover domain, Cloudflare subscriptions, and AI API costs.
                </p>
              </div>
            </div>

            <div className="mx-6 mb-5 rounded-2xl border p-5"
              style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}
            >
              <div className="grid grid-cols-4 gap-2.5 mb-4">
                {PRESETS.map((p) => {
                  const active = amount === p.value && !custom
                  const Icon = p.icon
                  return (
                    <button key={p.value} onClick={() => selectPreset(p.value)}
                      className="flex flex-col items-center gap-1 rounded-xl py-3 px-1 transition-all"
                      style={{
                        background: active ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.03)",
                        border: active ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <Icon style={{ width: 16, height: 16, color: active ? "#6ee7b7" : "#71717a" }} />
                      <span className="text-xs font-bold" style={{ color: active ? "#e4e4e7" : "#a1a1aa" }}>{p.label}</span>
                      <span className="text-[9px]" style={{ color: "#71717a" }}>{p.sub}</span>
                    </button>
                  )
                })}
              </div>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#52525b", background: "rgba(0,0,0,0.2)" }}>
                    Or enter your own amount
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border px-3 py-2.5 mb-4"
                style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.3)" }}
              >
                <span className="text-sm font-semibold" style={{ color: "#a1a1aa" }}>₹</span>
                <input
                  type="text" inputMode="numeric" placeholder="Enter amount"
                  value={custom} onChange={handleCustomChange}
                  className="flex-1 bg-transparent text-sm font-semibold outline-none border-none"
                  style={{ color: "#f4f4f5" }}
                />
              </div>

              {status !== "idle" && (
                <div className={`mb-4 text-xs font-medium text-center py-2 px-3 rounded-xl ${
                  status === "success" ? "text-emerald-400" : "text-red-400"
                }`} style={{ background: status === "success" ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)" }}>
                  {statusMsg}
                </div>
              )}

              <button onClick={handlePay} disabled={loading || amount < 1}
                className="w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                style={{
                  color: "#1a090d",
                  background: "linear-gradient(135deg, #34d399, #10b981)",
                  boxShadow: "0 10px 20px rgba(52,211,153,0.26)",
                }}
              >
                {loading ? (
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
                ) : (
                  <Heart style={{ width: 15, height: 15 }} />
                )}
                {loading ? "Processing..." : `Support`}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
