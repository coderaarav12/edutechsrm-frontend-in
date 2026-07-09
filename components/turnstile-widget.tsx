"use client"

import { Turnstile, type TurnstileProps } from "@marsidev/react-turnstile"

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"

export function TurnstileWidget(props: Omit<TurnstileProps, "siteKey">) {
  return (
    <div className="flex justify-center">
      <Turnstile
        siteKey={SITE_KEY}
        {...props}
      />
    </div>
  )
}
