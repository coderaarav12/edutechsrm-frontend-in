let _pendingQuery: string | null = null
const PENDING_QUERY_KEY = "edutechsrm_ai_pending_query"

export function setPendingQuery(q: string | null) {
  _pendingQuery = q
  try {
    if (q) sessionStorage.setItem(PENDING_QUERY_KEY, q)
    else sessionStorage.removeItem(PENDING_QUERY_KEY)
  } catch {}
}

export function takePendingQuery(): string | null {
  let q = _pendingQuery
  try {
    q = q || sessionStorage.getItem(PENDING_QUERY_KEY)
    sessionStorage.removeItem(PENDING_QUERY_KEY)
  } catch {}
  _pendingQuery = null
  return q
}
