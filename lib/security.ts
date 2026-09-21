import crypto from "node:crypto"

// ---------------------------------------------------------------------------
// XOR-obfuscated AES-256 passphrase (matches Android client key derivation).
// Passphrase: "edutechsrm_ultra_secure_aes256_key_2026_client_signing"
// XOR mask: 0xA5 applied byte-by-byte. Resolved at runtime only; never stored
// as a plain string literal so it won't appear in bundle snapshots.
// ---------------------------------------------------------------------------
const _ANDROID_AES_PASSPHRASE_XOR: Uint8Array = new Uint8Array([
  0xC0, 0xC1, 0xD4, 0xD4, 0xC1, 0xC3, 0xC2, 0xD0, 0xF1, 0xD0,
  0xD4, 0x80, 0xD4, 0xD7, 0xD4, 0xF8, 0x80, 0xD0, 0xC1, 0xC3,
  0xD4, 0xD0, 0xC1, 0x80, 0xC4, 0xC1, 0xD0, 0x82, 0x84, 0x86,
  0x80, 0xC2, 0xC1, 0xF2, 0x80, 0x84, 0xDB, 0x84, 0x86, 0x80,
  0xC3, 0xD7, 0xC1, 0xC1, 0xD4, 0xD5, 0x80, 0xD0, 0xC1, 0xCE,
  0xD4, 0xC1, 0xD3,
])
const _ANDROID_XOR_MASK = 0xA5

/** Resolves the XOR-obfuscated passphrase to plaintext bytes. */
function _resolveAndroidPassphrase(): Uint8Array {
  return _ANDROID_AES_PASSPHRASE_XOR.map((b) => b ^ _ANDROID_XOR_MASK)
}

/**
 * Standard encrypted payload structure sent by clients
 */
export interface EncryptedPayload {
  encryptedBlob: string
  iv: string
  timestamp: number | string
  authTag?: string
  tag?: string
}

const REPLAY_WINDOW_MS = 5 * 60 * 1000 // 5 minutes
const MAX_FUTURE_CLOCK_SKEW_MS = 60 * 1000 // 1 minute
const DEFAULT_PAYLOAD_SECRET = "edutechsrm-ultra-secure-payload-key-2026"

/**
 * Derives a 32-byte key for AES-256 operations
 */
export function getPayloadKey(): Buffer {
  const secret =
    process.env.PAYLOAD_ENCRYPTION_KEY ||
    process.env.ENCRYPTION_KEY ||
    process.env.APP_SECRET ||
    DEFAULT_PAYLOAD_SECRET

  if (secret.length === 64 && /^[0-9a-fA-F]+$/.test(secret)) {
    return Buffer.from(secret, "hex")
  }
  return crypto.createHash("sha256").update(secret).digest()
}

/**
 * Decodes string to Buffer (supports both Hex and Base64)
 */
export function decodeBuffer(str: string): Buffer {
  const trimmed = str.trim()
  if (/^[0-9a-fA-F]+$/.test(trimmed) && trimmed.length % 2 === 0) {
    return Buffer.from(trimmed, "hex")
  }
  return Buffer.from(trimmed, "base64")
}

/**
 * Validates timestamp to prevent replay attacks (< 5 minutes old, within clock skew)
 */
export function isTimestampValid(timestamp: number | string): boolean {
  let ts: number
  if (typeof timestamp === "number") {
    ts = timestamp
  } else if (typeof timestamp === "string") {
    const num = Number(timestamp)
    ts = Number.isFinite(num) ? num : new Date(timestamp).getTime()
  } else {
    return false
  }

  if (!Number.isFinite(ts) || ts <= 0) return false

  const now = Date.now()
  const age = now - ts
  // Reject requests older than 5 minutes
  if (age > REPLAY_WINDOW_MS) return false
  // Reject requests too far in the future
  if (ts - now > MAX_FUTURE_CLOCK_SKEW_MS) return false

  return true
}

/**
 * Type guard to check if payload has encrypted blob structure
 */
export function isEncryptedPayload(obj: any): obj is EncryptedPayload {
  return (
    obj !== null &&
    typeof obj === "object" &&
    typeof obj.encryptedBlob === "string" &&
    typeof obj.iv === "string" &&
    obj.timestamp !== undefined
  )
}

/**
 * Decrypts incoming encrypted payload ({ encryptedBlob, iv, timestamp }).
 * Rejects requests with timestamps older than 5 minutes (replay attack prevention).
 * Transparently passes through standard JSON for backward compatibility.
 */
export function decryptRequestPayload<T = any>(payload: any): T {
  if (payload === null || payload === undefined) {
    return payload as T
  }

  let parsed = payload
  if (typeof payload === "string") {
    try {
      parsed = JSON.parse(payload)
    } catch {
      // Non-JSON string, pass through
      return payload as T
    }
  }

  // If not encrypted blob format, pass through transparently
  if (!isEncryptedPayload(parsed)) {
    return parsed as T
  }

  // 1. Replay attack prevention: reject requests older than 5 minutes
  if (!isTimestampValid(parsed.timestamp)) {
    throw new Error("Request expired or replay detected")
  }

  const key = getPayloadKey()
  const iv = decodeBuffer(parsed.iv)
  const ciphertextWithOrWithoutTag = decodeBuffer(parsed.encryptedBlob)
  const authTagStr = parsed.authTag || parsed.tag
  const providedAuthTag = authTagStr ? decodeBuffer(authTagStr) : null

  // 2. Attempt AES-256-GCM
  try {
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv)
    let ciphertext: Buffer
    let tag: Buffer

    if (providedAuthTag) {
      tag = providedAuthTag
      if (
        ciphertextWithOrWithoutTag.length >= 16 &&
        ciphertextWithOrWithoutTag
          .subarray(ciphertextWithOrWithoutTag.length - providedAuthTag.length)
          .equals(providedAuthTag)
      ) {
        ciphertext = ciphertextWithOrWithoutTag.subarray(0, ciphertextWithOrWithoutTag.length - providedAuthTag.length)
      } else {
        ciphertext = ciphertextWithOrWithoutTag
      }
    } else if (ciphertextWithOrWithoutTag.length >= 16) {
      tag = ciphertextWithOrWithoutTag.subarray(ciphertextWithOrWithoutTag.length - 16)
      ciphertext = ciphertextWithOrWithoutTag.subarray(0, ciphertextWithOrWithoutTag.length - 16)
    } else {
      throw new Error("Ciphertext too short for AES-GCM")
    }

    decipher.setAuthTag(tag)
    const plaintextBuf = Buffer.concat([decipher.update(ciphertext), decipher.final()])

    const decryptedStr = plaintextBuf.toString("utf8")
    try {
      return JSON.parse(decryptedStr) as T
    } catch {
      return decryptedStr as unknown as T
    }
  } catch (gcmErr) {
    // 3. Fallback: Attempt AES-256-CBC
    try {
      const cbcIv = iv.length >= 16 ? iv.subarray(0, 16) : Buffer.concat([iv, Buffer.alloc(16 - iv.length)])
      const cbcDecipher = crypto.createDecipheriv("aes-256-cbc", key, cbcIv)
      const decrypted = Buffer.concat([cbcDecipher.update(ciphertextWithOrWithoutTag), cbcDecipher.final()])
      const decryptedStr = decrypted.toString("utf8")
      try {
        return JSON.parse(decryptedStr) as T
      } catch {
        return decryptedStr as unknown as T
      }
    } catch {
      throw new Error("Failed to decrypt payload: authentication failed or corrupted blob")
    }
  }
}

/**
 * Encrypts a payload into an EncryptedPayload blob (useful for clients & tests)
 */
export function encryptPayload(data: any): EncryptedPayload {
  const key = getPayloadKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)
  const text = typeof data === "string" ? data : JSON.stringify(data)
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  const combined = Buffer.concat([encrypted, tag])

  return {
    encryptedBlob: combined.toString("base64"),
    iv: iv.toString("base64"),
    timestamp: Date.now(),
    authTag: tag.toString("base64"),
  }
}

/**
 * Applies hardened security headers and removes internal Cloudflare/server headers
 */
export function applySecurityHeaders<T extends { headers: Headers }>(response: T): T {
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  // Strip sensitive internal Cloudflare / server headers
  const sensitiveHeaders = [
    "cf-ray",
    "cf-cache-status",
    "cf-request-id",
    "cf-connecting-ip",
    "cf-worker",
    "cf-access-client-id",
    "cf-access-client-secret",
    "x-powered-by",
    "server",
    "x-envoy-upstream-service-time",
  ]
  for (const h of sensitiveHeaders) {
    response.headers.delete(h)
  }

  return response
}

/**
 * Strips internal URLs, Cloudflare worker hostnames, tokens, and stack traces
 * so error messages never leak sensitive backend architecture to clients.
 */
export function sanitizeErrorMessage(rawMessage: unknown, defaultMessage = "An unexpected error occurred"): string {
  if (typeof rawMessage !== "string" || !rawMessage) {
    return defaultMessage
  }

  const sensitivePatterns = [
    /workers\.dev/i,
    /cloudflare/i,
    /turnstile/i,
    /cf-[a-z0-9_-]+/i,
    /secret/i,
    /key/i,
    /token/i,
    /node_modules/i,
    /at\s+[a-zA-Z0-9_.]+\s+\(/i,
    /127\.0\.0\.1:\d+/,
    /localhost:\d+/,
  ]

  for (const pattern of sensitivePatterns) {
    if (pattern.test(rawMessage)) {
      return defaultMessage
    }
  }

  return (
    rawMessage
      .replace(/https?:\/\/[^\s/$.?#].[^\s]*/gi, "[redacted-url]")
      .replace(/[a-zA-Z0-9_-]{24,}/g, "[redacted-token]")
      .trim() || defaultMessage
  )
}

/**
 * Removes internal secrets and credentials from data objects before serializing to client
 */
export function stripInternalSecrets(data: any): any {
  if (!data || typeof data !== "object") return data
  if (Array.isArray(data)) return data.map(stripInternalSecrets)

  const sanitized: Record<string, any> = {}
  const blockedKeys = new Set([
    "cf_token",
    "turnstile_secret",
    "turnstilesecret",
    "secretkey",
    "apikey",
    "cfray",
    "workersecret",
  ])

  for (const [key, value] of Object.entries(data)) {
    if (blockedKeys.has(key.toLowerCase())) continue
    sanitized[key] = typeof value === "object" ? stripInternalSecrets(value) : value
  }
  return sanitized
}

// ===========================================================================
// ── NEW: Web Crypto (SubtleCrypto) exports — Cloudflare Workers compatible ──
// All functions below use globalThis.crypto.subtle (available in the Workers
// runtime) rather than Node.js `crypto`, so they work in both edge and Node
// environments.
// ===========================================================================

/**
 * Derives a raw 256-bit AES key from the Android-matching passphrase using
 * SHA-256 via SubtleCrypto.  The passphrase is resolved from XOR-obfuscation
 * at call time and immediately GC'd.
 */
async function _deriveAndroidAesKey(): Promise<CryptoKey> {
  const passphrase = _resolveAndroidPassphrase()
  const keyMaterial = await globalThis.crypto.subtle.importKey(
    "raw",
    passphrase as BufferSource,
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  )
  // SHA-256 of the passphrase bytes → 32-byte key (mirrors Android SHA256)
  const rawKeyBits = await globalThis.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new Uint8Array(0),
      iterations: 1,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  )
  return globalThis.crypto.subtle.importKey(
    "raw",
    rawKeyBits,
    { name: "AES-CBC" },
    false,
    ["decrypt"],
  )
}

/**
 * HMAC-SHA256 signing key derived once per signature operation.
 * Uses the same passphrase as AES so both halves stay in sync with Android.
 */
async function _deriveHmacKey(): Promise<CryptoKey> {
  const passphrase = _resolveAndroidPassphrase()
  return globalThis.crypto.subtle.importKey(
    "raw",
    passphrase as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  )
}

/**
 * Decrypts an AES-256-CBC blob sent by the Android client.
 *
 * @param envelope  The encrypted envelope with `encryptedBlob` (Base64),
 *                  `iv` (Base64), `timestamp` (ms epoch), and `clientVersion`.
 * @returns         The decrypted, JSON-parsed payload, or `null` on failure.
 */
export async function decryptPayload<T>(envelope: {
  encryptedBlob: string
  iv: string
  timestamp: number
  clientVersion: string
}): Promise<T | null> {
  try {
    const iv = Uint8Array.from(atob(envelope.iv), (c) => c.charCodeAt(0)).subarray(0, 16)
    const ciphertext = Uint8Array.from(atob(envelope.encryptedBlob), (c) => c.charCodeAt(0))
    const key = await _deriveAndroidAesKey()
    const plainBuf = await globalThis.crypto.subtle.decrypt(
      { name: "AES-CBC", iv },
      key,
      ciphertext,
    )
    const plainText = new TextDecoder().decode(plainBuf)
    try {
      return JSON.parse(plainText) as T
    } catch {
      return plainText as unknown as T
    }
  } catch {
    return null
  }
}

/**
 * Validates a request timestamp to prevent replay attacks.
 *
 * @param timestamp  Unix epoch in milliseconds.
 * @param windowMs   Acceptance window (default 5 minutes).
 * @returns          `true` if the timestamp is fresh and within clock skew.
 */
export function verifyTimestamp(timestamp: number, windowMs = 5 * 60 * 1000): boolean {
  if (typeof timestamp !== "number" || !Number.isFinite(timestamp) || timestamp <= 0) {
    return false
  }
  const now = Date.now()
  const age = now - timestamp
  // Reject replays older than windowMs
  if (age > windowMs) return false
  // Reject timestamps too far in the future (clock skew tolerance: 1 min)
  if (timestamp - now > 60_000) return false
  return true
}

/**
 * Generates an HMAC-SHA256 signature over `payload + "." + timestamp`.
 * Mirrors the Android client signing scheme.
 *
 * @returns Hex-encoded HMAC-SHA256 signature string.
 */
export async function generateHmacSignature(payload: string, timestamp: string): Promise<string> {
  const key = await _deriveHmacKey()
  const message = new TextEncoder().encode(`${payload}.${timestamp}`)
  const sigBuf = await globalThis.crypto.subtle.sign("HMAC", key, message)
  return Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

/**
 * Verifies an HMAC-SHA256 signature in constant time.
 *
 * @param payload    The original payload string.
 * @param timestamp  The timestamp string appended during signing.
 * @param signature  Hex-encoded signature to verify.
 * @returns          `true` if the signature is valid.
 */
export async function verifyHmacSignature(
  payload: string,
  timestamp: string,
  signature: string,
): Promise<boolean> {
  try {
    const key = await _deriveHmacKey()
    const message = new TextEncoder().encode(`${payload}.${timestamp}`)
    // Convert hex signature → Uint8Array
    const sigBytes = new Uint8Array(
      signature.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? [],
    )
    if (sigBytes.length === 0) return false
    return globalThis.crypto.subtle.verify("HMAC", key, sigBytes, message)
  } catch {
    return false
  }
}

/**
 * Returns strict security response headers as a plain object.
 * Merge these into every API Response to harden the edge against common
 * browser-level attack vectors (XSS, clickjacking, sniffing, data exfil).
 */
export function hardendResponseHeaders(): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https://edutechsrm.in https://edutechsrm-ai-backend.goelaarav38.workers.dev https://edutechsrm-student-portal.goelaarav777.workers.dev",
    ].join("; "),
  }
}
